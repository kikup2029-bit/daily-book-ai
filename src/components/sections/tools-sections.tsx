/**
 * Section components shared by the sidebar routes.
 * Extracted from the original single-page layout so each route can render
 * just the part it needs.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Lock, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEntries } from "@/lib/books.functions";
import {
  getCashCounts,
  getProducts,
  getSettings,
  putSettings,
  removeAppLock,
  removeCashCount,
  removeProduct,
  saveCashCount,
  saveProduct,
  setAppLock,
} from "@/lib/shop.functions";
import { validatePin } from "@/lib/pin";
import { averageMonthlyOverhead, productMargin, reconcileDrawer } from "@/lib/insights";
import {
  enterHousehold,
  exitHousehold,
  getHousehold,
  getSettlement,
  setMemberName,
  startHousehold,
} from "@/lib/household.functions";

const money = (value: number) =>
  `$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const todayISO = () => new Date().toLocaleDateString("en-CA");

// =========================================================================
// Household sharing
// =========================================================================

export function HouseholdSection() {
  const queryClient = useQueryClient();
  const fetchHousehold = useServerFn(getHousehold);
  const fetchSettlement = useServerFn(getSettlement);
  const create = useServerFn(startHousehold);
  const join = useServerFn(enterHousehold);
  const leave = useServerFn(exitHousehold);
  const rename = useServerFn(setMemberName);

  const { data: state } = useQuery({ queryKey: ["household"], queryFn: () => fetchHousehold() });
  const { data: settleData } = useQuery({
    queryKey: ["settlement"],
    queryFn: () => fetchSettlement(),
    enabled: Boolean(state?.household),
  });

  const [name, setName] = useState("");
  const [yourName, setYourName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["household"] });
    queryClient.invalidateQueries({ queryKey: ["settlement"] });
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    queryClient.invalidateQueries({ queryKey: ["insights"] });
  };

  const onError = (err: Error) => setError(err.message);

  const createMutation = useMutation({
    mutationFn: () =>
      create({ data: { name: name.trim(), display_name: yourName.trim() || null } }),
    onSuccess: () => {
      setName("");
      setYourName("");
      setError(null);
      refresh();
    },
    onError,
  });

  const joinMutation = useMutation({
    mutationFn: () =>
      join({ data: { join_code: code.trim(), display_name: yourName.trim() || null } }),
    onSuccess: () => {
      setCode("");
      setYourName("");
      setError(null);
      refresh();
    },
    onError,
  });

  const leaveMutation = useMutation({
    mutationFn: () => leave({}),
    onSuccess: () => {
      setError(null);
      refresh();
    },
    onError,
  });

  const renameMutation = useMutation({
    mutationFn: (value: string) => rename({ data: { display_name: value || null } }),
    onSuccess: refresh,
    onError,
  });

  // --- not in a household yet ---
  if (!state?.household) {
    return (
      <section className="py-8">
        <h2 className="flex items-center gap-2 text-xl">
          <Users className="size-4 text-primary" /> Share with someone
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share chosen entries with a partner or housemate and split costs fairly. Anything you
          don&apos;t share stays private to you.
        </p>

        <div className="mt-4 space-y-2">
          <Label htmlFor="your-name">Your name (so they know who&apos;s who)</Label>
          <Input
            id="your-name"
            placeholder="Alex"
            value={yourName}
            onChange={(event) => setYourName(event.target.value)}
          />
        </div>

        <form
          className="mt-4 space-y-3 border-t pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) createMutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="household-name">Start a new one</Label>
            <Input
              id="household-name"
              placeholder="Our place"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating…" : "Create household"}
          </Button>
        </form>

        <form
          className="mt-4 space-y-3 border-t pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (code.trim()) joinMutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="join-code">Or join with a code</Label>
            <Input
              id="join-code"
              placeholder="ABC123"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              className="uppercase"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={joinMutation.isPending}
          >
            {joinMutation.isPending ? "Joining…" : "Join household"}
          </Button>
        </form>

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </section>
    );
  }

  // --- in a household ---
  const settlement = settleData?.settlement ?? null;
  const combined = settleData?.combined ?? null;
  const me = state.members.find((m) => m.role === "owner" && state.isOwner);

  return (
    <section className="py-8">
      <h2 className="flex items-center gap-2 text-xl">
        <Users className="size-4 text-primary" /> {state.household.name}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {state.members.length === 1
          ? "Just you so far — share the code below to add someone."
          : `${state.members.length} people sharing.`}
      </p>

      {/* join code */}
      <div className="mt-4 rounded-2xl bg-muted p-3">
        <p className="eyebrow">
          Invite code
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className="font-mono text-2xl font-bold tracking-widest">
            {state.household.join_code}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard?.writeText(state.household!.join_code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          They sign up, then enter this code under Tools.
        </p>
      </div>

      {/* members */}
      <ul className="mt-4 divide-y">
        {state.members.map((member) => (
          <li key={member.user_id} className="flex items-center justify-between gap-2 py-2 text-sm">
            <span>
              {member.display_name?.trim() || `Member ${member.user_id.slice(0, 4)}`}
              {member.role === "owner" ? (
                <span className="ml-2 text-xs text-muted-foreground">owner</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>

      {/* your display name */}
      <div className="mt-4 space-y-2 border-t pt-4">
        <Label htmlFor="rename">Your name in this household</Label>
        <div className="flex gap-2">
          <Input
            id="rename"
            placeholder={me?.display_name ?? "Your name"}
            value={yourName}
            onChange={(event) => setYourName(event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            disabled={renameMutation.isPending || !yourName.trim()}
            onClick={() => renameMutation.mutate(yourName.trim())}
          >
            Save
          </Button>
        </div>
      </div>

      {/* what everyone has logged (shared, whether split or not) */}
      {combined && combined.sharedCount > 0 ? (
        <div className="mt-5 border-t pt-4">
          <p className="eyebrow">
            What everyone has shared
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {combined.byMember.map((member) => (
              <li key={member.user_id} className="flex justify-between gap-2">
                <span>{member.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {member.moneyIn > 0 ? `${money(member.moneyIn)} in · ` : ""}
                  {money(member.moneyOut)} out
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            {combined.sharedCount} shared {combined.sharedCount === 1 ? "entry" : "entries"}
            {combined.splitCount > 0 ? `, ${combined.splitCount} marked to split` : ", none marked to split"}.
          </p>
        </div>
      ) : null}

      {/* settlement — only entries marked "split it" */}
      {settlement && settlement.totalShared > 0 ? (
        <div className="mt-5 border-t pt-4">
          <p className="eyebrow">
            Bills you're splitting
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {money(settlement.totalShared)} marked to split — {money(settlement.perPerson)} each.
          </p>

          <ul className="mt-3 space-y-1.5 text-sm">
            {settlement.balances.map((balance) => (
              <li key={balance.user_id} className="flex justify-between gap-2">
                <span>{balance.name}</span>
                <span className="tabular-nums">
                  paid {money(balance.paid)}
                  {Math.abs(balance.balance) < 0.005 ? (
                    <span className="ml-2 text-success">square</span>
                  ) : balance.balance > 0 ? (
                    <span className="ml-2 text-success">owed {money(balance.balance)}</span>
                  ) : (
                    <span className="ml-2 text-danger">owes {money(balance.balance)}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {settlement.transfers.length > 0 ? (
            <div className="mt-3 rounded-2xl bg-primary p-3 text-primary-foreground">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                To square up
              </p>
              <ul className="mt-1 space-y-0.5 text-sm font-semibold">
                {settlement.transfers.map((transfer, index) => (
                  <li key={index}>
                    {transfer.fromName} pays {transfer.toName} {money(transfer.amount)}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-sm text-success">Everyone&apos;s square — nothing owed.</p>
          )}
        </div>
      ) : combined && combined.sharedCount > 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Nothing marked to split, so nobody owes anybody. Choose &ldquo;Split it&rdquo; when
          logging if you want an expense divided evenly.
        </p>
      ) : (
        <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">
          Nothing shared yet. When you log something, choose &ldquo;Share&rdquo; so the household
          can see it, or &ldquo;Split it&rdquo; to divide it evenly.
        </p>
      )}

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

      <Button
        type="button"
        variant="outline"
        className="mt-5 w-full"
        disabled={leaveMutation.isPending}
        onClick={() => {
          if (
            window.confirm(
              "Leave this household? Anything you shared becomes private to you again.",
            )
          ) {
            leaveMutation.mutate();
          }
        }}
      >
        {leaveMutation.isPending ? "Leaving…" : "Leave household"}
      </Button>
    </section>
  );
}

// =========================================================================
// Product margins
// =========================================================================

export function MarginsSection() {
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
    <section className="py-8">
      <h2 className="text-xl">What you actually keep</h2>
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
                    <p className="eyebrow">
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

export function DrawerSection() {
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
    <section className="border-t py-8">
      <h2 className="text-xl">Cash drawer check</h2>
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

        <div className="text-sm">
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

export function SettingsSection() {
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
    <section className="border-t py-8">
      <h2 className="text-xl">Settings</h2>
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

// =========================================================================
// App lock
// =========================================================================

export function LockSection() {
  const queryClient = useQueryClient();
  const fetchSettings = useServerFn(getSettings);
  const setLock = useServerFn(setAppLock);
  const clearLock = useServerFn(removeAppLock);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => fetchSettings() });

  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [timeout, setTimeoutMinutes] = useState("5");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["settings"] });

  const save = useMutation({
    mutationFn: () =>
      setLock({ data: { pin, timeout_minutes: Number(timeout || 0) } }),
    onSuccess: () => {
      setPin("");
      setConfirm("");
      setError(null);
      setDone("Lock is on. You'll be asked for this PIN when you come back.");
      setTimeout(() => setDone(null), 4000);
      refresh();
    },
    onError: (err: Error) => setError(err.message),
  });

  const turnOff = useMutation({
    mutationFn: () => clearLock({}),
    onSuccess: () => {
      setError(null);
      setDone("Lock turned off.");
      setTimeout(() => setDone(null), 3000);
      refresh();
    },
    onError: (err: Error) => setError(err.message),
  });

  const enabled = Boolean(settings?.lock_enabled);

  return (
    <section className="border-t py-8">
      <h2 className="flex items-center gap-2 text-xl">
        <Lock className="size-4 text-primary" /> Lock this app
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Hide your books behind a PIN so someone holding your unlocked phone can&apos;t read them.
      </p>

      {enabled ? (
        <div className="mt-4 space-y-3">
          <div className="">
            <p className="text-sm font-semibold text-success">Lock is on</p>
            <p className="text-xs text-muted-foreground">
              {settings?.lock_timeout_minutes === 0
                ? "Asks for your PIN every time you open the app."
                : `Asks again after ${settings?.lock_timeout_minutes} minutes away.`}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={turnOff.isPending}
            onClick={() => turnOff.mutate()}
          >
            {turnOff.isPending ? "Turning off…" : "Turn off lock"}
          </Button>
        </div>
      ) : (
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const problem = validatePin(pin);
            if (problem) {
              setError(problem);
              return;
            }
            if (pin !== confirm) {
              setError("Those two PINs don't match.");
              return;
            }
            save.mutate();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lock-pin">Choose a PIN (4–8 numbers)</Label>
              <Input
                id="lock-pin"
                type="password"
                inputMode="numeric"
                maxLength={8}
                autoComplete="new-password"
                placeholder="••••"
                value={pin}
                onChange={(event) => {
                  setPin(event.target.value.replace(/\D/g, ""));
                  setError(null);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lock-confirm">Type it again</Label>
              <Input
                id="lock-confirm"
                type="password"
                inputMode="numeric"
                maxLength={8}
                autoComplete="new-password"
                placeholder="••••"
                value={confirm}
                onChange={(event) => {
                  setConfirm(event.target.value.replace(/\D/g, ""));
                  setError(null);
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lock-timeout">Ask again after</Label>
            <select
              id="lock-timeout"
              value={timeout}
              onChange={(event) => setTimeoutMinutes(event.target.value)}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
            >
              <option value="0">Every time I open it</option>
              <option value="1">1 minute away</option>
              <option value="5">5 minutes away</option>
              <option value="15">15 minutes away</option>
              <option value="60">1 hour away</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Turn on lock"}
          </Button>
        </form>
      )}

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {done ? <p className="mt-3 text-sm text-success">{done}</p> : null}

      <p className="mt-3 text-xs text-muted-foreground">
        This hides the app on your device. Your account is already protected by your password, and
        only you can read your data — the PIN is a convenience lock on top of that, not a
        replacement for it. Forgotten it? Sign out and back in, then set a new one.
      </p>
    </section>
  );
}
