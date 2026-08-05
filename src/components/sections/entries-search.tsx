/**
 * Find an entry, then fix it.
 *
 * Everything already loaded is filtered on the device, so results appear as you
 * type without another request.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Pencil, Search, SlidersHorizontal, Trash2, X } from "lucide-react";

import { editEntry, getEntries, removeEntry } from "@/lib/books.functions";
import {
  EMPTY_FILTERS,
  categoriesIn,
  describeFilters,
  filterEntries,
  hasAnyFilter,
  totalsFor,
  type EntryFilters,
} from "@/lib/entry-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, SampleRows } from "@/components/empty-state";

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const selectClass =
  "h-10 w-full rounded-md border bg-transparent px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function EntriesSearch() {
  const queryClient = useQueryClient();
  const fetchEntries = useServerFn(getEntries);
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: () => fetchEntries(),
  });

  const [filters, setFilters] = useState<EntryFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const set = <K extends keyof EntryFilters>(key: K, value: EntryFilters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const categories = useMemo(() => categoriesIn(entries), [entries]);
  const results = useMemo(() => filterEntries(entries, filters), [entries, filters]);
  const totals = useMemo(() => totalsFor(results), [results]);
  const filtering = hasAnyFilter(filters);

  return (
    <div className="rise mx-auto w-full max-w-3xl">
      <section className="pb-8">
        <p className="eyebrow">Your entries</p>
        <h1 className="mt-3 text-3xl">Find an entry</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Search everything you&apos;ve logged, then tap one to fix it.
        </p>

        <div className="mt-6 flex items-center gap-3 border-b pb-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <Input
            value={filters.text}
            onChange={(event) => set("text", event.target.value)}
            placeholder="Try “costco”, “rent”, or an amount like 42.50"
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            aria-label="Search your entries"
          />
          {filters.text ? (
            <button
              type="button"
              onClick={() => set("text", "")}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(["all", "in", "out"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => set("direction", option)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                filters.direction === option
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option === "all" ? "Everything" : option === "in" ? "Money in" : "Money out"}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className="ml-auto flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <SlidersHorizontal className="size-3.5" aria-hidden="true" />
            {showFilters ? "Fewer filters" : "More filters"}
          </button>
        </div>

        {showFilters ? (
          <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="f-category">Category</Label>
              <select
                id="f-category"
                className={selectClass}
                value={filters.category}
                onChange={(event) => set("category", event.target.value)}
              >
                <option value="">Any category</option>
                {categories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="f-payment">Paid with</Label>
              <select
                id="f-payment"
                className={selectClass}
                value={filters.payment}
                onChange={(event) => set("payment", event.target.value as EntryFilters["payment"])}
              >
                <option value="all">Any way</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="f-from">From date</Label>
              <Input
                id="f-from"
                type="date"
                value={filters.from}
                onChange={(event) => set("from", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-to">To date</Label>
              <Input
                id="f-to"
                type="date"
                value={filters.to}
                onChange={(event) => set("to", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="f-min">Amount at least</Label>
              <Input
                id="f-min"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="any"
                value={filters.min}
                onChange={(event) => set("min", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-max">Amount at most</Label>
              <Input
                id="f-max"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="any"
                value={filters.max}
                onChange={(event) => set("max", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="f-sort">Order</Label>
              <select
                id="f-sort"
                className={selectClass}
                value={filters.sort}
                onChange={(event) => set("sort", event.target.value as EntryFilters["sort"])}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="biggest">Biggest amount first</option>
                <option value="smallest">Smallest amount first</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFilters(EMPTY_FILTERS)}
                disabled={!filtering}
              >
                Clear all
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="border-t py-8">
        {isLoading ? (
          <div>
            <span className="skeleton block h-4 w-56" />
            <span className="skeleton mt-5 block h-10 w-full" />
            <span className="skeleton mt-2 block h-10 w-full" />
            <span className="skeleton mt-2 block h-10 w-full" />
          </div>
        ) : (
          <>
            <p className="eyebrow">
              {totals.count} {totals.count === 1 ? "entry" : "entries"}
              {filtering ? ` · ${describeFilters(filters)}` : ""}
            </p>
            <p className="mt-3 text-sm">
              <span className="text-success">{money(totals.totalIn)} in</span>
              {" · "}
              <span className="text-danger">{money(totals.totalOut)} out</span>
              {" · "}
              <span className="font-semibold">{money(totals.net)} net</span>
            </p>

            {results.length === 0 ? (
              <div className="mt-6">
                {entries.length === 0 ? (
                  <EmptyState
                    title="Nothing logged yet"
                    blurb="Once you start logging, everything you've entered shows up here to search and correct."
                    sample={<SampleRows rows={4} />}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nothing matches that. Try fewer words, or{" "}
                    <button
                      type="button"
                      onClick={() => setFilters(EMPTY_FILTERS)}
                      className="underline underline-offset-4"
                    >
                      clear the filters
                    </button>
                    .
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 divide-y">
                {results.map((entry) =>
                  editingId === entry.id ? (
                    <EditRow
                      key={entry.id}
                      entry={entry}
                      onDone={() => setEditingId(null)}
                      onSaved={() => {
                        queryClient.invalidateQueries({ queryKey: ["entries"] });
                        queryClient.invalidateQueries({ queryKey: ["insights"] });
                        setEditingId(null);
                      }}
                    />
                  ) : (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setEditingId(entry.id)}
                      className="flex w-full items-center gap-3 py-3 text-left"
                    >
                      <span className="w-24 shrink-0 text-xs tabular-nums text-muted-foreground">
                        {entry.entry_date}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {entry.spent_on ?? (entry.amount_in > 0 ? "Money in" : "Uncategorised")}
                        {entry.merchant ? (
                          <span className="text-muted-foreground"> · {entry.merchant}</span>
                        ) : null}
                      </span>
                      <span
                        className={`shrink-0 text-sm tabular-nums ${
                          entry.amount_in > 0 ? "text-success" : ""
                        }`}
                      >
                        {entry.amount_in > 0
                          ? `+${money(entry.amount_in)}`
                          : `−${money(entry.amount_out)}`}
                      </span>
                      <Pencil
                        className="size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </button>
                  ),
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

type EditableEntry = {
  id: string;
  entry_date: string;
  amount_in: number;
  amount_out: number;
  spent_on: string | null;
  merchant: string | null;
  payment_method: string | null;
};

function EditRow({
  entry,
  onDone,
  onSaved,
}: {
  entry: EditableEntry;
  onDone: () => void;
  onSaved: () => void;
}) {
  const runEdit = useServerFn(editEntry);
  const runRemove = useServerFn(removeEntry);
  const queryClient = useQueryClient();

  const [date, setDate] = useState(entry.entry_date);
  const [amountIn, setAmountIn] = useState(entry.amount_in > 0 ? String(entry.amount_in) : "");
  const [amountOut, setAmountOut] = useState(entry.amount_out > 0 ? String(entry.amount_out) : "");
  const [spentOn, setSpentOn] = useState(entry.spent_on ?? "");
  const [merchant, setMerchant] = useState(entry.merchant ?? "");
  const [payment, setPayment] = useState<"cash" | "card" | "other">(
    entry.payment_method === "card" || entry.payment_method === "other"
      ? entry.payment_method
      : "cash",
  );
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      runEdit({
        data: {
          entry_id: entry.id,
          entry_date: date,
          amount_in: Number(amountIn || 0),
          amount_out: Number(amountOut || 0),
          spent_on: spentOn.trim() ? spentOn.trim() : null,
          merchant: merchant.trim() ? merchant.trim() : null,
          payment_method: payment,
        },
      }),
    onSuccess: onSaved,
    onError: (err: Error) => setError(err.message),
  });

  const remove = useMutation({
    mutationFn: () => runRemove({ data: { entry_id: entry.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      onDone();
    },
    onError: (err: Error) => setError(err.message),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const inAmount = Number(amountIn || 0);
    const outAmount = Number(amountOut || 0);
    if (!Number.isFinite(inAmount) || !Number.isFinite(outAmount)) {
      setError("Those amounts don't look right.");
      return;
    }
    if (inAmount === 0 && outAmount === 0) {
      setError("An entry needs money in or money out. Use Delete to remove it.");
      return;
    }
    save.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-4 py-5">
      <p className="eyebrow">Editing this entry</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`d-${entry.id}`}>Date</Label>
          <Input
            id={`d-${entry.id}`}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`p-${entry.id}`}>Paid with</Label>
          <select
            id={`p-${entry.id}`}
            className={selectClass}
            value={payment}
            onChange={(event) => setPayment(event.target.value as "cash" | "card" | "other")}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`in-${entry.id}`}>Money made</Label>
          <Input
            id={`in-${entry.id}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amountIn}
            onChange={(event) => setAmountIn(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`out-${entry.id}`}>Money spent</Label>
          <Input
            id={`out-${entry.id}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amountOut}
            onChange={(event) => setAmountOut(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`c-${entry.id}`}>What for</Label>
          <Input
            id={`c-${entry.id}`}
            value={spentOn}
            onChange={(event) => setSpentOn(event.target.value)}
            placeholder="Supplies"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`m-${entry.id}`}>Where</Label>
          <Input
            id={`m-${entry.id}`}
            value={merchant}
            onChange={(event) => setMerchant(event.target.value)}
            placeholder="Costco"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={save.isPending}>
          <Check className="size-4" /> {save.isPending ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Delete this entry? This can't be undone.")) remove.mutate();
          }}
          disabled={remove.isPending}
          className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-danger"
        >
          <Trash2 className="size-3.5" /> {remove.isPending ? "Deleting…" : "Delete"}
        </button>
      </div>
    </form>
  );
}
