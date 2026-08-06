/**
 * Find an entry, then fix it.
 *
 * Everything already loaded is filtered on the device, so results appear as you
 * type without another request.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Pencil, Search, SearchX, SlidersHorizontal, Trash2, X } from "lucide-react";

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
import {
  Field,
  Money,
  PageHeader,
  Panel,
  PanelBody,
  PanelHeader,
  Segmented,
  Select,
  SkeletonRows,
  TxRow,
} from "@/components/ui/kit";
import { EmptyState, SampleRows } from "@/components/empty-state";

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
      <PageHeader
        eyebrow="Your entries"
        title="Find an entry"
        description="Search everything you've logged, then tap one to fix it."
      />

      <div className="space-y-3">
        {/* Search field */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={filters.text}
            onChange={(event) => set("text", event.target.value)}
            placeholder="Try “costco”, “rent”, or 42.50"
            className="h-12 rounded-[var(--radius-12)] bg-surface-1 pl-10 pr-11 md:h-12 md:text-base"
            aria-label="Search your entries"
          />
          {filters.text ? (
            <button
              type="button"
              onClick={() => set("text", "")}
              className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-[var(--radius-10)] text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-accent hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {/* Direction + filter toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            name="Direction"
            value={filters.direction}
            onChange={(value) => set("direction", value)}
            options={[
              { value: "all", label: "Everything" },
              { value: "in", label: "Money in" },
              { value: "out", label: "Money out" },
            ]}
          />

          <Button
            type="button"
            variant={showFilters ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowFilters((current) => !current)}
            aria-expanded={showFilters}
            className="ml-auto h-10"
          >
            <SlidersHorizontal aria-hidden="true" />
            {showFilters ? "Fewer filters" : "More filters"}
          </Button>
        </div>

        {showFilters ? (
          <Panel className="pop">
            <PanelHeader
              title="Narrow it down"
              description="Every filter is optional."
              action={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  disabled={!filtering}
                >
                  Clear all
                </Button>
              }
            />
            <PanelBody className="grid gap-4 sm:grid-cols-2">
              <Field id="f-category" label="Category">
                <Select
                  value={filters.category}
                  onChange={(event) => set("category", event.target.value)}
                >
                  <option value="">Any category</option>
                  {categories.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field id="f-payment" label="Paid with">
                <Select
                  value={filters.payment}
                  onChange={(event) =>
                    set("payment", event.target.value as EntryFilters["payment"])
                  }
                >
                  <option value="all">Any way</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </Select>
              </Field>

              <Field id="f-from" label="From date">
                <Input
                  type="date"
                  className="num"
                  value={filters.from}
                  onChange={(event) => set("from", event.target.value)}
                />
              </Field>

              <Field id="f-to" label="To date">
                <Input
                  type="date"
                  className="num"
                  value={filters.to}
                  onChange={(event) => set("to", event.target.value)}
                />
              </Field>

              <Field id="f-min" label="Amount at least">
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="any"
                  className="num"
                  value={filters.min}
                  onChange={(event) => set("min", event.target.value)}
                />
              </Field>

              <Field id="f-max" label="Amount at most">
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="any"
                  className="num"
                  value={filters.max}
                  onChange={(event) => set("max", event.target.value)}
                />
              </Field>

              <Field id="f-sort" label="Order" className="sm:col-span-2">
                <Select
                  value={filters.sort}
                  onChange={(event) => set("sort", event.target.value as EntryFilters["sort"])}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="biggest">Biggest amount first</option>
                  <option value="smallest">Smallest amount first</option>
                </Select>
              </Field>
            </PanelBody>
          </Panel>
        ) : null}
      </div>

      <section className="mt-8 border-t pt-6">
        {isLoading ? (
          <>
            <span className="skeleton block h-3 w-40" aria-hidden="true" />
            <span className="skeleton mt-4 block h-4 w-64" aria-hidden="true" />
            <div className="mt-5">
              <SkeletonRows rows={5} />
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">
              <span className="num">{totals.count}</span> {totals.count === 1 ? "entry" : "entries"}
              {filtering ? ` · ${describeFilters(filters)}` : ""}
            </p>

            <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
              <span className="inline-flex items-baseline gap-1.5">
                <Money value={totals.totalIn} tone="positive" className="font-medium" />
                <span className="text-muted-foreground">in</span>
              </span>
              <span className="inline-flex items-baseline gap-1.5">
                <Money value={totals.totalOut} tone="negative" className="font-medium" />
                <span className="text-muted-foreground">out</span>
              </span>
              <span className="inline-flex items-baseline gap-1.5">
                <Money value={totals.net} className="font-semibold" />
                <span className="text-muted-foreground">net</span>
              </span>
            </div>

            {results.length === 0 ? (
              <div className="mt-6">
                {entries.length === 0 ? (
                  <EmptyState
                    title="Nothing logged yet"
                    blurb="Once you start logging, everything you've entered shows up here to search and correct."
                    sample={<SampleRows rows={4} />}
                  />
                ) : (
                  <div className="panel flex flex-col items-center px-5 py-10 text-center">
                    <span
                      aria-hidden="true"
                      className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-muted-foreground"
                    >
                      <SearchX className="size-5" />
                    </span>
                    <p className="mt-4 text-[15px] font-semibold">No entries match that</p>
                    <p className="mt-1.5 max-w-xs text-balance text-[13px] leading-relaxed text-muted-foreground">
                      Try fewer words, a wider date range, or start again with everything.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFilters(EMPTY_FILTERS)}
                      className="mt-5"
                    >
                      Clear the filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 divide-hairline">
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
                    <TxRow
                      key={entry.id}
                      date={entry.entry_date}
                      title={entry.spent_on ?? (entry.amount_in > 0 ? "Money in" : "Uncategorised")}
                      subtitle={entry.merchant ?? undefined}
                      amount={entry.amount_in > 0 ? entry.amount_in : -entry.amount_out}
                      onClick={() => setEditingId(entry.id)}
                      trailing={
                        <Pencil className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      }
                    />
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
    <form onSubmit={submit} className="py-3">
      <div className="pop rounded-[var(--radius-12)] border border-border bg-surface-2 p-4 shadow-[var(--shadow-sm)] sm:p-5">
        <p className="eyebrow">Editing this entry</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id={`d-${entry.id}`} label="Date">
            <Input
              type="date"
              className="num"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </Field>

          <Field id={`p-${entry.id}`} label="Paid with">
            <Select
              value={payment}
              onChange={(event) => setPayment(event.target.value as "cash" | "card" | "other")}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </Select>
          </Field>

          <Field id={`in-${entry.id}`} label="Money made">
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="num"
              value={amountIn}
              onChange={(event) => setAmountIn(event.target.value)}
            />
          </Field>

          <Field id={`out-${entry.id}`} label="Money spent">
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="num"
              value={amountOut}
              onChange={(event) => setAmountOut(event.target.value)}
            />
          </Field>

          <Field id={`c-${entry.id}`} label="What for">
            <Input
              value={spentOn}
              onChange={(event) => setSpentOn(event.target.value)}
              placeholder="Supplies"
            />
          </Field>

          <Field id={`m-${entry.id}`} label="Where">
            <Input
              value={merchant}
              onChange={(event) => setMerchant(event.target.value)}
              placeholder="Costco"
            />
          </Field>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-[var(--radius-10)] bg-danger-soft px-3 py-2 text-[13px] font-medium text-danger"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button type="submit" variant="brand" loading={save.isPending}>
            {save.isPending ? null : <Check aria-hidden="true" />}
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (window.confirm("Delete this entry? This can't be undone.")) remove.mutate();
            }}
            disabled={remove.isPending}
            className="ml-auto hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 aria-hidden="true" /> {remove.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </form>
  );
}
