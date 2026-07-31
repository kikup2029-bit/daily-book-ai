import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { X } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEntries } from "@/lib/books.functions";
import {
  getCashCounts,
  getProducts,
  getSettings,
  putSettings,
  removeCashCount,
  removeProduct,
  saveCashCount,
  saveProduct,
} from "@/lib/shop.functions";
import { averageMonthlyOverhead, productMargin, reconcileDrawer } from "@/lib/insights";

export const Route = createFileRoute("/_authenticated/tools")({
  head: () => ({
    meta: [
      { title: "Tools — SimpleBooks AI" },
      {
        name: "description",
        content:
          "Work out your profit per item, check your cash drawer against your records, and set your tax set-aside rate.",
      },
      { property: "og:title", content: "Tools — SimpleBooks AI" },
      {
        property: "og:description",
        content: "Product margins, cash drawer checks, and tax set-aside settings.",
      },
    ],
  }),
  component: ToolsPage,
});

const money = (value: number) =>
  `$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const todayISO = () => new Date().toLocaleDateString("en-CA");

function ToolsPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-8 sm:pt-12">
      <AppHeader />
      <MarginsSection />
      <DrawerSection />
      <SettingsSection />
    </main>
  );
}

// =========================================================================
// Product margins
// =========================================================================

function MarginsSection() {
  const queryClient = useQueryClient();
  const fetchProducts = useServerFn(getProducts);
  const fetchEntries = useServerFn(getEntries);
  const upsert = useServerFn(saveProduct);
  const drop = useServerFn(removeProduct);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });
  const { data: entries = [] } = useQuery({ queryKey: ["entries"], queryFn: () => fetchEntries() });

  const overhead = useMemo(() => averageMonthlyOverhead(entries), [entries]);

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["products"] });

  const save = useMutation({
    mutationFn: (input: { name: string; unit_cost: number; sale_price: number }) =>
      upsert({ data: input }),
    onSuccess: () => {
      setName("");
      setCost("");
      setPrice("");
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => drop({ data: { id } }),
    onSuccess: invalidate,
  });

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">What you actually keep</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Put in what an item costs you and what you sell it for, and see the real profit per sale.
      </p>

      {products.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {products.map((product) => {
            const m = productMargin(product, overhead > 0 ? overhead : null);
            const losing = m.grossPerUnit <= 0;
            return (
              <li key={product.id} className="rounded-2xl border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Costs {money(product.unit_cost)} · sells for {money(product.sale_price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${product.name}`}
                    onClick={() => remove.mutate(product.id)}
                    className="text-muted-foreground hover:text-danger"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className={`rounded-xl p-2.5 ${losing ? "bg-danger-soft" : "bg-success-soft"}`}>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        losing ? "text-danger" : "text-success"
                      }`}
                    >
                      You keep
                    </p>
                    <p className="mt-0.5 font-bold">
                      {losing ? `−${money(m.grossPerUnit)}` : money(m.grossPerUnit)} each
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted p-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Margin
                    </p>
                    <p className="mt-0.5 font-bold">{Math.round(m.grossMarginPercent)}%</p>
                  </div>
                </div>

                {losing ? (
                  <p className="mt-2 text-xs text-danger">
                    You&apos;re selling this for less than it costs you.
                  </p>
                ) : m.unitsToCoverOverhead != null ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Sell about <span className="font-semibold">{m.unitsToCoverOverhead}</span> a
                    month to cover your usual {money(overhead)} of costs.
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">No items yet.</p>
      )}

      <form
        className="mt-5 space-y-3 border-t pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          const unitCost = Number(cost || 0);
          const salePrice = Number(price || 0);
          if (!name.trim() || !(salePrice > 0)) return;
          save.mutate({ name: name.trim(), unit_cost: unitCost, sale_price: salePrice });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="product-name">Item</Label>
          <Input
            id="product-name"
            placeholder="Candle"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product-cost">Costs you</Label>
            <Input
              id="product-cost"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="4.00"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-price">You sell it for</Label>
            <Input
              id="product-price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="10.00"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save item"}
        </Button>
      </form>
    </section>
  );
}

// =========================================================================
// Cash drawer
// =========================================================================

function DrawerSection() {
  const queryClient = useQueryClient();
  const fetchCounts = useServerFn(getCashCounts);
  const fetchEntries = useServerFn(getEntries);
  const fetchSettings = useServerFn(getSettings);
  const upsert = useServerFn(saveCashCount);
  const drop = useServerFn(removeCashCount);

  const { data: counts = [] } = useQuery({
    queryKey: ["cashCounts"],
    queryFn: () => fetchCounts(),
  });
  const { data: entries = [] } = useQuery({ queryKey: ["entries"], queryFn: () => fetchEntries() });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => fetchSettings() });

  const [date, setDate] = useState(todayISO());
  const [counted, setCounted] = useState("");
  const [float, setFloat] = useState("");

  // Live preview of the expected amount, so the owner sees the gap before saving.
  const preview = useMemo(() => {
    const openingFloat = Number(float || settings?.opening_float || 0);
    return reconcileDrawer(entries, {
      date,
      counted: Number(counted || 0),
      openingFloat,
    });
  }, [entries, date, counted, float, settings?.opening_float]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cashCounts"] });

  const save = useMutation({
    mutationFn: (input: {
      count_date: string;
      counted_amount: number;
      opening_float: number;
      note: string | null;
    }) => upsert({ data: input }),
    onSuccess: () => {
      setCounted("");
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => drop({ data: { id } }),
    onSuccess: invalidate,
  });

  return (
    <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">Cash drawer check</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Count the till at the end of the day and see whether it matches what you logged.
      </p>

      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!counted.trim()) return;
          save.mutate({
            count_date: date,
            counted_amount: Number(counted || 0),
            opening_float: Number(float || settings?.opening_float || 0),
            note: null,
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="count-date">Day</Label>
            <Input
              id="count-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="count-float">Starting float</Label>
            <Input
              id="count-float"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder={String(settings?.opening_float ?? 0)}
              value={float}
              onChange={(event) => setFloat(event.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="count-amount">Counted in the drawer</Label>
          <Input
            id="count-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={counted}
            onChange={(event) => setCounted(event.target.value)}
          />
        </div>

        <div className="rounded-2xl bg-muted p-3 text-sm">
          <p>
            Should be <span className="font-semibold">{money(preview.expected)}</span>{" "}
            <span className="text-muted-foreground">
              ({money(preview.openingFloat)} float + {money(preview.cashIn)} in −{" "}
              {money(preview.cashOut)} out)
            </span>
          </p>
          {counted.trim() ? (
            <p
              className={`mt-1 font-semibold ${
                preview.status === "balanced"
                  ? "text-success"
                  : preview.status === "over"
                    ? "text-foreground"
                    : "text-danger"
              }`}
            >
              {preview.status === "balanced"
                ? "Balanced — nice."
                : preview.status === "over"
                  ? `${money(preview.difference)} more than expected.`
                  : `${money(preview.difference)} short.`}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={save.isPending || !counted.trim()}>
          {save.isPending ? "Saving…" : "Save count"}
        </Button>
      </form>

      {counts.length > 0 ? (
        <ul className="mt-5 divide-y border-t pt-2">
          {counts.slice(0, 7).map((count) => (
            <li key={count.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="font-semibold">{count.count_date}</span>
              <span className="flex items-center gap-2 tabular-nums">
                <span className="text-muted-foreground">
                  {money(count.counted_amount)} vs {money(count.expected_amount)}
                </span>
                <span
                  className={
                    Math.abs(count.difference) < 0.005
                      ? "text-success"
                      : count.difference < 0
                        ? "text-danger"
                        : ""
                  }
                >
                  {Math.abs(count.difference) < 0.005
                    ? "OK"
                    : count.difference > 0
                      ? `+${money(count.difference)}`
                      : `−${money(count.difference)}`}
                </span>
                <button
                  type="button"
                  aria-label={`Remove count for ${count.count_date}`}
                  onClick={() => remove.mutate(count.id)}
                  className="text-muted-foreground hover:text-danger"
                >
                  <X className="size-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

// =========================================================================
// Settings (tax rate + default float)
// =========================================================================

function SettingsSection() {
  const queryClient = useQueryClient();
  const fetchSettings = useServerFn(getSettings);
  const save = useServerFn(putSettings);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => fetchSettings() });

  const [rate, setRate] = useState<string | null>(null);
  const [float, setFloat] = useState<string | null>(null);

  const rateValue = rate ?? String(settings?.tax_rate_percent ?? "");
  const floatValue = float ?? String(settings?.opening_float ?? "");

  const mutate = useMutation({
    mutationFn: (input: { tax_rate_percent: number; opening_float: number }) =>
      save({ data: input }),
    onSuccess: () => {
      setRate(null);
      setFloat(null);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });

  return (
    <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">Settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Set what share of income to hold back for tax, and how much cash you normally start the day
        with.
      </p>

      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          mutate.mutate({
            tax_rate_percent: Number(rateValue || 0),
            opening_float: Number(floatValue || 0),
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tax-rate">Hold back for tax (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              placeholder="25"
              value={rateValue}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-float">Usual starting float</Label>
            <Input
              id="default-float"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="50"
              value={floatValue}
              onChange={(event) => setFloat(event.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={mutate.isPending}>
          {mutate.isPending ? "Saving…" : "Save settings"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Not tax advice — it just holds back a share of what you log so the bill isn&apos;t a
          surprise. Check the rate with your accountant.
        </p>
      </form>
    </section>
  );
}
