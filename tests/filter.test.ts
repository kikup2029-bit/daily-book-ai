import {
  EMPTY_FILTERS,
  filterEntries,
  matchesText,
  totalsFor,
  categoriesIn,
  hasAnyFilter,
  describeFilters,
  entryAmount,
  sortEntries,
  type FilterableEntry,
  type EntryFilters,
} from "../src/lib/entry-filter.ts";

let pass = 0,
  fail = 0;
const ok = (c: boolean, l: string) => {
  if (c) pass++;
  else {
    fail++;
    console.log("FAIL: " + l);
  }
};
const eq = (a: unknown, b: unknown, l: string) => {
  const same = JSON.stringify(a) === JSON.stringify(b);
  if (!same) console.log(`FAIL: ${l} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
  same ? pass++ : fail++;
};

const e = (
  id: string,
  date: string,
  inAmt: number,
  outAmt: number,
  cat: string | null = null,
  shop: string | null = null,
  pay: string | null = "cash",
): FilterableEntry => ({
  id,
  entry_date: date,
  amount_in: inAmt,
  amount_out: outAmt,
  spent_on: cat,
  merchant: shop,
  payment_method: pay,
});

const data: FilterableEntry[] = [
  e("1", "2026-08-01", 300, 0, null, null, "cash"),
  e("2", "2026-08-02", 0, 42.5, "Groceries", "Costco", "card"),
  e("3", "2026-08-03", 0, 500, "Rent", null, "other"),
  e("4", "2026-07-28", 0, 12.99, "Groceries", "Corner Shop", "cash"),
  e("5", "2026-07-15", 150, 0, null, "Market stall", null), // no payment method
];
const f = (over: Partial<EntryFilters> = {}): EntryFilters => ({ ...EMPTY_FILTERS, ...over });
const ids = (rows: FilterableEntry[]) => rows.map((r) => r.id);

// --- no filters: everything, newest first ---
eq(ids(filterEntries(data, f())), ["3", "2", "1", "4", "5"], "unfiltered is newest first");
ok(!hasAnyFilter(f()), "blank filters report as no filter");
ok(hasAnyFilter(f({ text: "x" })), "text counts as a filter");

// --- free text ---
eq(ids(filterEntries(data, f({ text: "costco" }))), ["2"], "finds by shop, case-insensitive");
eq(ids(filterEntries(data, f({ text: "groceries" }))), ["2", "4"], "finds by category");
eq(ids(filterEntries(data, f({ text: "42.50" }))), ["2"], "finds by amount");
eq(ids(filterEntries(data, f({ text: "2026-07" }))), ["4", "5"], "finds by partial date");
eq(
  ids(filterEntries(data, f({ text: "groceries corner" }))),
  ["4"],
  "all words must match, so it narrows",
);
eq(
  ids(filterEntries(data, f({ text: "  " }))),
  ["3", "2", "1", "4", "5"],
  "whitespace-only search is not a filter",
);
eq(ids(filterEntries(data, f({ text: "nothing here" }))), [], "no match gives an empty list");

// --- direction ---
eq(ids(filterEntries(data, f({ direction: "in" }))), ["1", "5"], "money in only");
eq(ids(filterEntries(data, f({ direction: "out" }))), ["3", "2", "4"], "money out only");

// --- payment, including the legacy no-method case ---
eq(ids(filterEntries(data, f({ payment: "card" }))), ["2"], "card only");
eq(ids(filterEntries(data, f({ payment: "cash" }))), ["1", "4"], "cash only");
eq(
  ids(filterEntries(data, f({ payment: "other" }))),
  ["3", "5"],
  "entries with no method recorded count as other, not dropped",
);

// --- category is exact, not substring ---
eq(ids(filterEntries(data, f({ category: "Groceries" }))), ["2", "4"], "exact category");
eq(ids(filterEntries(data, f({ category: "Grocer" }))), [], "category is exact, not partial");
eq(
  ids(filterEntries(data, f({ category: "groceries" }))),
  ["2", "4"],
  "category match ignores case",
);

// --- dates are inclusive ---
eq(
  ids(filterEntries(data, f({ from: "2026-08-01", to: "2026-08-02" }))),
  ["2", "1"],
  "date range includes both ends",
);
eq(ids(filterEntries(data, f({ from: "2026-08-03" }))), ["3"], "from only");
eq(ids(filterEntries(data, f({ to: "2026-07-28" }))), ["4", "5"], "to only");

// --- amounts ---
eq(ids(filterEntries(data, f({ min: "100" }))), ["3", "1", "5"], "minimum amount");
eq(ids(filterEntries(data, f({ max: "50" }))), ["2", "4"], "maximum amount");
eq(ids(filterEntries(data, f({ min: "40", max: "300" }))), ["2", "1", "5"], "between");
eq(
  ids(filterEntries(data, f({ min: "" }))),
  ["3", "2", "1", "4", "5"],
  "blank minimum means no limit, not zero",
);
eq(
  ids(filterEntries(data, f({ min: "abc" }))),
  ["3", "2", "1", "4", "5"],
  "half-typed number doesn't hide everything",
);
eq(entryAmount(data[1]), 42.5, "an expense's amount is what went out");
eq(entryAmount(data[0]), 300, "income's amount is what came in");

// --- combining narrows ---
eq(
  ids(filterEntries(data, f({ text: "groceries", payment: "cash" }))),
  ["4"],
  "text and payment together",
);
eq(
  ids(filterEntries(data, f({ direction: "out", min: "100", to: "2026-08-03" }))),
  ["3"],
  "three at once",
);

// --- sorting ---
eq(ids(sortEntries(data, "oldest")), ["5", "4", "1", "2", "3"], "oldest first");
eq(ids(sortEntries(data, "biggest")), ["3", "1", "5", "2", "4"], "biggest amount first");
eq(ids(sortEntries(data, "smallest")), ["4", "2", "5", "1", "3"], "smallest first");
ok(sortEntries(data, "newest") !== data, "sorting doesn't mutate the input");
eq(ids(data), ["1", "2", "3", "4", "5"], "original order untouched");

// --- totals ---
{
  const t = totalsFor(data);
  eq(t.count, 5, "counts rows");
  eq(t.totalIn, 450, "adds up money in");
  eq(t.totalOut, 555.49, "adds up money out");
  eq(t.net, -105.49, "net is in minus out");
}
{
  // Float drift: 0.1 + 0.2 must not surface as 0.30000000000000004.
  const cents = [e("a", "2026-08-01", 0, 0.1), e("b", "2026-08-01", 0, 0.2)];
  eq(totalsFor(cents).totalOut, 0.3, "money totals are rounded to cents");
}
eq(totalsFor([]), { count: 0, totalIn: 0, totalOut: 0, net: 0 }, "empty totals are zero, not NaN");

// --- totals reflect the filter, so a search doubles as a report ---
eq(
  totalsFor(filterEntries(data, f({ category: "Groceries" }))).totalOut,
  55.49,
  "totals follow the filter",
);

// --- categories list ---
eq(categoriesIn(data), ["Groceries", "Rent"], "categories are unique and sorted");
eq(categoriesIn([]), [], "no categories when nothing logged");

// --- description ---
{
  const text = describeFilters(f({ text: "costco", direction: "out", min: "10" }));
  ok(
    text.includes("costco") && text.includes("money out") && text.includes("over 10"),
    "describes the search: " + text,
  );
  eq(describeFilters(f()), "", "no filters, nothing to describe");
}

// --- matchesText directly ---
ok(matchesText(data[1], "COSTCO"), "matching is case-insensitive");
ok(matchesText(data[0], ""), "empty query matches everything");
ok(!matchesText(data[0], "costco"), "non-match is false");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
