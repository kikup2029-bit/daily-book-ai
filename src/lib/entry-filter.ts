/**
 * Finding one entry among hundreds.
 *
 * Pure functions over a list of entries, so the search page can be tested
 * without a browser or a database, and so filtering stays instant — everything
 * already loaded is filtered on the device rather than re-queried.
 */

export type FilterableEntry = {
  id: string;
  entry_date: string;
  amount_in: number;
  amount_out: number;
  spent_on: string | null;
  merchant: string | null;
  payment_method: string | null;
};

export type Direction = "all" | "in" | "out";
export type Payment = "all" | "cash" | "card" | "other";
export type SortBy = "newest" | "oldest" | "biggest" | "smallest";

export type EntryFilters = {
  /** Free text over category, shop and date. */
  text: string;
  direction: Direction;
  payment: Payment;
  /** Exact category match, from the category list. Empty means any. */
  category: string;
  from: string;
  to: string;
  min: string;
  max: string;
  sort: SortBy;
};

export const EMPTY_FILTERS: EntryFilters = {
  text: "",
  direction: "all",
  payment: "all",
  category: "",
  from: "",
  to: "",
  min: "",
  max: "",
  sort: "newest",
};

export function hasAnyFilter(filters: EntryFilters): boolean {
  return (
    filters.text.trim() !== "" ||
    filters.direction !== "all" ||
    filters.payment !== "all" ||
    filters.category !== "" ||
    filters.from !== "" ||
    filters.to !== "" ||
    filters.min !== "" ||
    filters.max !== ""
  );
}

/** The amount that matters for an entry: money in if it's income, else spend. */
export function entryAmount(entry: FilterableEntry): number {
  return entry.amount_in > 0 ? entry.amount_in : entry.amount_out;
}

/**
 * A blank or unparseable number means "no limit" rather than zero. Typing "1"
 * on the way to "10" shouldn't briefly hide everything under ten.
 */
function bound(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export function matchesText(entry: FilterableEntry, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  // Every word has to appear somewhere, so "costco jan" narrows rather than
  // widens. Amounts are searchable too — people remember the number.
  const haystack = [
    entry.spent_on ?? "",
    entry.merchant ?? "",
    entry.entry_date,
    entry.payment_method ?? "",
    entry.amount_in > 0 ? entry.amount_in.toFixed(2) : "",
    entry.amount_out > 0 ? entry.amount_out.toFixed(2) : "",
  ]
    .join(" ")
    .toLowerCase();

  return query.split(/\s+/).every((word) => haystack.includes(word));
}

export function filterEntries(
  entries: FilterableEntry[],
  filters: EntryFilters,
): FilterableEntry[] {
  const min = bound(filters.min);
  const max = bound(filters.max);
  const category = filters.category.trim().toLowerCase();

  const kept = entries.filter((entry) => {
    if (filters.direction === "in" && entry.amount_in <= 0) return false;
    if (filters.direction === "out" && entry.amount_out <= 0) return false;

    if (filters.payment !== "all") {
      // Entries logged before payment method existed have none recorded.
      // Treat those as "other" rather than dropping them silently.
      const method = (entry.payment_method ?? "other").toLowerCase();
      if (method !== filters.payment) return false;
    }

    if (category && (entry.spent_on ?? "").trim().toLowerCase() !== category) return false;

    // ISO dates compare correctly as strings.
    if (filters.from && entry.entry_date < filters.from) return false;
    if (filters.to && entry.entry_date > filters.to) return false;

    const amount = entryAmount(entry);
    if (min !== null && amount < min) return false;
    if (max !== null && amount > max) return false;

    return matchesText(entry, filters.text);
  });

  return sortEntries(kept, filters.sort);
}

export function sortEntries(entries: FilterableEntry[], sort: SortBy): FilterableEntry[] {
  const sorted = [...entries];
  switch (sort) {
    case "oldest":
      sorted.sort((a, b) => a.entry_date.localeCompare(b.entry_date));
      break;
    case "biggest":
      sorted.sort((a, b) => entryAmount(b) - entryAmount(a));
      break;
    case "smallest":
      sorted.sort((a, b) => entryAmount(a) - entryAmount(b));
      break;
    default:
      sorted.sort((a, b) => b.entry_date.localeCompare(a.entry_date));
  }
  return sorted;
}

export type FilterTotals = {
  count: number;
  totalIn: number;
  totalOut: number;
  net: number;
};

/** Totals for whatever is on screen, so a search doubles as a report. */
export function totalsFor(entries: FilterableEntry[]): FilterTotals {
  const totalIn = entries.reduce((sum, entry) => sum + entry.amount_in, 0);
  const totalOut = entries.reduce((sum, entry) => sum + entry.amount_out, 0);
  return {
    count: entries.length,
    totalIn: round(totalIn),
    totalOut: round(totalOut),
    net: round(totalIn - totalOut),
  };
}

/** Adding floats repeatedly drifts; money on screen shouldn't. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Categories actually in use, for the dropdown. */
export function categoriesIn(entries: FilterableEntry[]): string[] {
  const seen = new Set<string>();
  for (const entry of entries) {
    const name = entry.spent_on?.trim();
    if (name) seen.add(name);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

/** Plain-English description of the current search, for the results line. */
export function describeFilters(filters: EntryFilters): string {
  const parts: string[] = [];
  if (filters.text.trim()) parts.push(`matching “${filters.text.trim()}”`);
  if (filters.direction === "in") parts.push("money in only");
  if (filters.direction === "out") parts.push("money out only");
  if (filters.payment !== "all") parts.push(filters.payment);
  if (filters.category) parts.push(`in ${filters.category}`);
  if (filters.from && filters.to) parts.push(`${filters.from} to ${filters.to}`);
  else if (filters.from) parts.push(`from ${filters.from}`);
  else if (filters.to) parts.push(`up to ${filters.to}`);
  if (filters.min && filters.max) parts.push(`${filters.min}–${filters.max}`);
  else if (filters.min) parts.push(`over ${filters.min}`);
  else if (filters.max) parts.push(`under ${filters.max}`);
  return parts.join(" · ");
}
