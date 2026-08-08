import {
  readableDate,
  tidyLabel,
  signedAmount,
  sharingLabel,
  nextShareMode,
} from "../src/lib/entry-format.ts";

let pass = 0,
  fail = 0;
const eq = (a: unknown, b: unknown, l: string) => {
  const same = JSON.stringify(a) === JSON.stringify(b);
  if (!same) console.log(`FAIL: ${l} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
  same ? pass++ : fail++;
};
const ok = (c: boolean, l: string) => {
  if (c) pass++;
  else {
    fail++;
    console.log("FAIL: " + l);
  }
};

const today = new Date(2026, 7, 5); // 5 Aug 2026

// --- dates read like dates, not database columns
eq(readableDate("2026-08-05", today), "Today", "today says Today");
eq(readableDate("2026-08-04", today), "Yesterday", "yesterday says Yesterday");
ok(/Jul/.test(readableDate("2026-07-31", today)), "an older date this year uses a short month");
ok(!/2026/.test(readableDate("2026-07-31", today)), "this year's dates drop the year as noise");
ok(
  /2025/.test(readableDate("2025-07-31", today)),
  "…but a previous year keeps it, or it's ambiguous",
);
ok(!/^\d{4}-/.test(readableDate("2026-07-31", today)), "never renders the raw ISO form");
eq(
  readableDate("not-a-date", today),
  "not-a-date",
  "unparseable input passes through rather than showing Invalid Date",
);

// --- capitalisation is normalised for display only
eq(tidyLabel("rent"), "Rent", "lower case gets a capital");
eq(tidyLabel("Groceries"), "Groceries", "already capitalised is untouched");
eq(tidyLabel("  supplies "), "Supplies", "trims first");
eq(tidyLabel(""), null, "empty is nothing to show");
eq(tidyLabel(null), null, "null is nothing to show");
eq(
  tidyLabel("iPhone case"),
  "IPhone case",
  "only the first letter is touched — no title-casing the whole string",
);
eq(tidyLabel("3 for 2 offer"), "3 for 2 offer", "leading digits survive");

// --- direction and sharing
eq(signedAmount({ amount_in: 300, amount_out: 0 }), 300, "income is positive");
eq(
  signedAmount({ amount_in: 0, amount_out: 42.5 }),
  -42.5,
  "spending is negative, so the sign carries it",
);
eq(sharingLabel({ household_id: null, is_split: false }), null, "private shows no badge");
eq(sharingLabel({ household_id: "h", is_split: false }), "Shared", "visible reads Shared");
eq(sharingLabel({ household_id: "h", is_split: true }), "Split", "split reads Split");

// The menu must offer the next state, and cycling through must return home.
eq(
  nextShareMode({ household_id: null, is_split: false }).mode,
  "visible",
  "private offers sharing",
);
eq(nextShareMode({ household_id: "h", is_split: false }).mode, "split", "shared offers splitting");
eq(
  nextShareMode({ household_id: "h", is_split: true }).mode,
  "private",
  "split offers going private",
);
ok(
  nextShareMode({ household_id: null, is_split: false }).label.length > 0,
  "every state has a written label",
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
