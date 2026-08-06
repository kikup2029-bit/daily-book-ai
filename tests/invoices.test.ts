import {
  invoiceTotal,
  invoiceTotals,
  lineTotal,
  isOverdue,
  daysOverdue,
  displayStatus,
  summarize,
  filterInvoices,
  validateInvoice,
  hasProblems,
  allowedActions,
  nextInvoiceNumber,
  expectedIncome,
  addDays,
  blankDraft,
  type Invoice,
  type InvoiceDraft,
} from "../src/lib/invoices.ts";

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

const inv = (over: Partial<Invoice> = {}): Invoice => ({
  id: "i1",
  number: "INV-0001",
  customer_name: "Acme",
  customer_email: null,
  issue_date: "2026-08-01",
  due_date: "2026-08-15",
  status: "sent",
  notes: null,
  lines: [{ description: "Work", quantity: 2, unit_price: 50 }],
  paid_date: null,
  entry_id: null,
  ...over,
});

// --- totals: rounded per line so the printed lines add up to the printed total
eq(lineTotal({ description: "x", quantity: 3, unit_price: 19.99 }), 59.97, "line total");
eq(lineTotal({ description: "x", quantity: 0, unit_price: 10 }), 0, "zero quantity");
eq(
  lineTotal({ description: "x", quantity: NaN, unit_price: 10 }),
  0,
  "NaN quantity is treated as zero",
);
{
  // Three lines that each round up; summing raw floats would show a cent less.
  const lines = [
    { description: "a", quantity: 1, unit_price: 0.335 },
    { description: "b", quantity: 1, unit_price: 0.335 },
    { description: "c", quantity: 1, unit_price: 0.335 },
  ];
  const t = invoiceTotals(lines);
  eq(t.lineTotals, [0.34, 0.34, 0.34], "each line rounds to cents");
  eq(t.subtotal, 1.02, "total equals the sum of the printed lines, not the raw floats");
}
eq(invoiceTotal(inv()), 100, "invoice total");
eq(invoiceTotals([]).subtotal, 0, "no lines is zero, not NaN");

// --- overdue is derived from the date, never stored
ok(isOverdue(inv({ due_date: "2026-08-01" }), "2026-08-05"), "past due and sent is overdue");
ok(!isOverdue(inv({ due_date: "2026-08-10" }), "2026-08-05"), "not yet due");
ok(!isOverdue(inv({ due_date: "2026-08-01" }), "2026-08-01"), "due today is not yet overdue");
ok(
  !isOverdue(inv({ due_date: "2026-01-01", status: "paid" }), "2026-08-05"),
  "paid is never overdue",
);
ok(
  !isOverdue(inv({ due_date: "2026-01-01", status: "draft" }), "2026-08-05"),
  "a draft is never overdue",
);
ok(
  !isOverdue(inv({ due_date: "2026-01-01", status: "void" }), "2026-08-05"),
  "cancelled is never overdue",
);
eq(daysOverdue(inv({ due_date: "2026-08-01" }), "2026-08-13"), 12, "days late");
eq(daysOverdue(inv({ due_date: "2026-08-20" }), "2026-08-13"), 0, "not late, zero days");
eq(
  displayStatus(inv({ due_date: "2026-01-01" }), "2026-08-05"),
  "overdue",
  "display status derives overdue",
);
eq(displayStatus(inv({ status: "draft" }), "2026-08-05"), "draft", "draft displays as draft");

// --- summary
{
  const list = [
    inv({ id: "a", status: "sent", due_date: "2026-09-01" }), // 100 outstanding
    inv({ id: "b", status: "sent", due_date: "2026-07-01" }), // 100 outstanding + overdue
    inv({ id: "c", status: "draft" }), // 100 draft
    inv({ id: "d", status: "paid", paid_date: "2026-08-03" }), // 100 paid this month
    inv({ id: "e", status: "paid", paid_date: "2026-07-03" }), // paid last month
    inv({ id: "f", status: "void" }), // counts nowhere
  ];
  const s = summarize(list, "2026-08-05");
  eq(s.outstanding, 200, "outstanding is sent only");
  eq(s.outstandingCount, 2, "outstanding count");
  eq(s.overdue, 100, "overdue is a subset of outstanding");
  eq(s.overdueCount, 1, "overdue count");
  eq(s.draft, 100, "drafts counted separately");
  eq(s.paidThisMonth, 100, "paid this month only");
  eq(s.paidThisMonthCount, 1, "paid count");
  // A cancelled invoice must not appear in any bucket.
  ok(s.outstanding + s.draft + s.paidThisMonth === 400, "void invoice excluded everywhere");
}
eq(summarize([], "2026-08-05").outstanding, 0, "no invoices totals zero");

// --- filtering and urgency ordering
{
  const list = [
    inv({ id: "a", number: "INV-0001", status: "sent", due_date: "2026-09-01" }),
    inv({ id: "b", number: "INV-0002", status: "sent", due_date: "2026-07-01" }), // overdue
    inv({ id: "c", number: "INV-0003", status: "draft", customer_name: "Bakery" }),
    inv({ id: "d", number: "INV-0004", status: "paid", paid_date: "2026-08-01" }),
  ];
  const ids = (rows: Invoice[]) => rows.map((r) => r.id);
  eq(ids(filterInvoices(list, "all", "2026-08-05"))[0], "b", "overdue sorts to the top");
  eq(
    ids(filterInvoices(list, "outstanding", "2026-08-05")).sort(),
    ["a", "b"],
    "outstanding filter",
  );
  eq(ids(filterInvoices(list, "overdue", "2026-08-05")), ["b"], "overdue filter");
  eq(ids(filterInvoices(list, "draft", "2026-08-05")), ["c"], "draft filter");
  eq(ids(filterInvoices(list, "paid", "2026-08-05")), ["d"], "paid filter");
  eq(ids(filterInvoices(list, "all", "2026-08-05", "bakery")), ["c"], "search by customer");
  eq(ids(filterInvoices(list, "all", "2026-08-05", "INV-0004")), ["d"], "search by number");
  eq(
    ids(filterInvoices(list, "all", "2026-08-05", "100.00")),
    ["b", "a", "c", "d"],
    "urgency order: overdue, awaiting, draft, paid",
  );
  eq(filterInvoices(list, "all", "2026-08-05", "nothing here").length, 0, "no match");
}

// --- validation
{
  const good: InvoiceDraft = {
    customer_name: "Acme",
    customer_email: "a@b.com",
    issue_date: "2026-08-01",
    due_date: "2026-08-15",
    lines: [{ description: "Work", quantity: 1, unit_price: 100 }],
    notes: null,
  };
  ok(!hasProblems(validateInvoice(good)), "a good invoice validates");
  ok(
    validateInvoice({ ...good, customer_name: " " }).customer_name !== undefined,
    "customer required",
  );
  ok(
    validateInvoice({ ...good, customer_email: "nope" }).customer_email !== undefined,
    "bad email caught",
  );
  ok(
    validateInvoice({ ...good, due_date: "2026-07-01" }).due_date !== undefined,
    "due before issue is caught",
  );
  ok(
    validateInvoice({ ...good, issue_date: "01/08/2026" }).issue_date !== undefined,
    "bad date caught",
  );
  ok(validateInvoice({ ...good, lines: [] }).lines !== undefined, "needs at least one line");
  ok(
    validateInvoice({ ...good, lines: [{ description: "", quantity: 1, unit_price: 0 }] }).lines !==
      undefined,
    "an entirely blank line doesn't count as an item",
  );
  {
    const p = validateInvoice({
      ...good,
      lines: [{ description: "", quantity: 1, unit_price: 5 }],
    });
    eq(p.lineErrors?.[0].index, 0, "line error points at the right row");
  }
  {
    const p = validateInvoice({
      ...good,
      lines: [{ description: "x", quantity: 0, unit_price: 5 }],
    });
    ok(p.lineErrors !== undefined, "zero quantity on a filled line is an error");
  }
  ok(!hasProblems(validateInvoice({ ...good, customer_email: null })), "email is optional");
  ok(
    !hasProblems(validateInvoice({ ...good, due_date: good.issue_date })),
    "due on the issue date is fine",
  );
}

// --- what you're allowed to do
{
  const a = allowedActions(inv({ status: "draft" }));
  ok(
    a.canEdit && a.canSend && a.canDelete && a.canVoid,
    "a draft can be edited, sent, deleted, cancelled",
  );
  ok(!a.canMarkPaid, "a draft can't be marked paid before it's sent");

  const b = allowedActions(inv({ status: "sent" }));
  ok(b.canMarkPaid && b.canEdit && b.canVoid, "a sent invoice can be paid, edited, cancelled");
  ok(!b.canDelete, "a sent invoice can't be deleted — it would break the numbering trail");

  const c = allowedActions(inv({ status: "paid" }));
  ok(!c.canEdit, "a paid invoice can't be edited, because its figures are already in the books");
  ok(c.canUnmarkPaid, "a paid invoice can be un-paid");
  ok(!c.canDelete && !c.canVoid, "a paid invoice can't be deleted or cancelled");
}

// --- numbering
eq(nextInvoiceNumber([]), "INV-0001", "first invoice");
eq(nextInvoiceNumber(["INV-0001", "INV-0002"]), "INV-0003", "next in sequence");
eq(nextInvoiceNumber(["INV-0009", "INV-0002"]), "INV-0010", "uses the highest, not the count");
eq(nextInvoiceNumber(["INV-0001", "INV-0003"]), "INV-0004", "gaps never get reused");
eq(nextInvoiceNumber(["nonsense"]), "INV-0001", "unparseable numbers ignored");

// --- expected income for the cash outlook
{
  const list = [
    inv({ id: "a", status: "sent", due_date: "2026-08-10" }),
    inv({ id: "b", status: "sent", due_date: "2026-07-01" }), // already overdue
    inv({ id: "c", status: "draft", due_date: "2026-08-11" }), // not sent
    inv({ id: "d", status: "sent", due_date: "2026-12-01" }), // beyond the horizon
  ];
  const income = expectedIncome(list, "2026-08-05", 30);
  eq(
    income.map((i) => i.due),
    ["2026-08-10"],
    "only sent, due, and within the horizon",
  );
  eq(income[0].amount, 100, "carries the amount");
}

eq(addDays("2026-08-31", 1), "2026-09-01", "date maths crosses months");
eq(addDays("2026-12-31", 1), "2027-01-01", "date maths crosses years");
eq(blankDraft("2026-08-05").due_date, "2026-08-19", "blank draft defaults to 14 day terms");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
