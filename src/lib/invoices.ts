/**
 * Invoices: money you're owed.
 *
 * Everything here is a pure function over invoice rows, so the rules can be
 * tested without a browser or a database — and so the same rules produce the
 * list, the totals, the PDF and the cash outlook rather than three near-copies.
 *
 * The one rule worth stating up front: an invoice is NOT income until it's
 * paid. Counting a sent invoice as money in would inflate today's takings, the
 * tax set-aside and the profit figure for work that hasn't been paid for. So
 * marking one paid is what creates the entry in the books.
 */

export type InvoiceStatus = "draft" | "sent" | "paid" | "void";

export type InvoiceLine = {
  description: string;
  quantity: number;
  unit_price: number;
};

export type Invoice = {
  id: string;
  number: string;
  customer_name: string;
  customer_email: string | null;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  notes: string | null;
  lines: InvoiceLine[];
  /** Set when it was marked paid; drives the books entry. */
  paid_date: string | null;
  entry_id: string | null;
};

export type InvoiceTotals = {
  lineTotals: number[];
  subtotal: number;
};

const round = (value: number) => Math.round(value * 100) / 100;

export function lineTotal(line: InvoiceLine): number {
  const quantity = Number.isFinite(line.quantity) ? line.quantity : 0;
  const price = Number.isFinite(line.unit_price) ? line.unit_price : 0;
  return round(quantity * price);
}

/**
 * Totals rounded per line before summing.
 *
 * Summing raw floats and rounding once at the end can disagree with the
 * printed line totals by a cent, which is exactly the sort of thing that makes
 * a customer distrust an invoice.
 */
export function invoiceTotals(lines: InvoiceLine[]): InvoiceTotals {
  const lineTotals = lines.map(lineTotal);
  return { lineTotals, subtotal: round(lineTotals.reduce((sum, value) => sum + value, 0)) };
}

export function invoiceTotal(invoice: Pick<Invoice, "lines">): number {
  return invoiceTotals(invoice.lines).subtotal;
}

/**
 * Overdue is derived, never stored.
 *
 * A stored "overdue" flag is wrong the moment the clock passes midnight and
 * nobody has written to the row. Deriving it means it's always right.
 */
export function isOverdue(invoice: Invoice, today: string): boolean {
  return invoice.status === "sent" && invoice.due_date < today;
}

export function daysOverdue(invoice: Invoice, today: string): number {
  if (!isOverdue(invoice, today)) return 0;
  const due = Date.parse(`${invoice.due_date}T00:00:00Z`);
  const now = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(due) || Number.isNaN(now)) return 0;
  return Math.max(0, Math.round((now - due) / 86_400_000));
}

/** What to show in the status chip — the derived state, not the raw column. */
export type DisplayStatus = "draft" | "sent" | "overdue" | "paid" | "void";

export function displayStatus(invoice: Invoice, today: string): DisplayStatus {
  if (invoice.status === "sent" && isOverdue(invoice, today)) return "overdue";
  return invoice.status;
}

export const STATUS_LABELS: Record<DisplayStatus, string> = {
  draft: "Draft",
  sent: "Awaiting payment",
  overdue: "Overdue",
  paid: "Paid",
  void: "Cancelled",
};

export type InvoiceSummary = {
  /** Sent and not yet paid, including overdue. */
  outstanding: number;
  outstandingCount: number;
  overdue: number;
  overdueCount: number;
  draft: number;
  draftCount: number;
  paidThisMonth: number;
  paidThisMonthCount: number;
};

export function summarize(invoices: Invoice[], today: string): InvoiceSummary {
  const month = today.slice(0, 7);
  const summary: InvoiceSummary = {
    outstanding: 0,
    outstandingCount: 0,
    overdue: 0,
    overdueCount: 0,
    draft: 0,
    draftCount: 0,
    paidThisMonth: 0,
    paidThisMonthCount: 0,
  };

  for (const invoice of invoices) {
    const total = invoiceTotal(invoice);
    if (invoice.status === "sent") {
      summary.outstanding += total;
      summary.outstandingCount += 1;
      if (isOverdue(invoice, today)) {
        summary.overdue += total;
        summary.overdueCount += 1;
      }
    } else if (invoice.status === "draft") {
      summary.draft += total;
      summary.draftCount += 1;
    } else if (invoice.status === "paid" && invoice.paid_date?.startsWith(month)) {
      summary.paidThisMonth += total;
      summary.paidThisMonthCount += 1;
    }
  }

  summary.outstanding = round(summary.outstanding);
  summary.overdue = round(summary.overdue);
  summary.draft = round(summary.draft);
  summary.paidThisMonth = round(summary.paidThisMonth);
  return summary;
}

/**
 * Unpaid invoices as expected income, for the cash outlook.
 *
 * Deliberately excludes overdue ones: an invoice that's already late is not
 * evidence of money arriving on a date. Treating it as expected income would
 * make the forecast optimistic exactly when the owner most needs it to be
 * honest.
 */
export function expectedIncome(
  invoices: Invoice[],
  today: string,
  horizonDays = 30,
): Array<{ due: string; amount: number; customer: string }> {
  const horizon = addDays(today, horizonDays);
  return invoices
    .filter(
      (invoice) =>
        invoice.status === "sent" && invoice.due_date >= today && invoice.due_date <= horizon,
    )
    .map((invoice) => ({
      due: invoice.due_date,
      amount: invoiceTotal(invoice),
      customer: invoice.customer_name,
    }))
    .sort((a, b) => a.due.localeCompare(b.due));
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Next invoice number.
 *
 * Sequential per account, zero-padded, and never reuses a number even if an
 * invoice is cancelled — gaps in a numbering sequence are normal and expected,
 * whereas two invoices sharing a number is a real accounting problem.
 */
export function nextInvoiceNumber(existing: string[], prefix = "INV-"): string {
  let highest = 0;
  for (const number of existing) {
    const match = number.match(/(\d+)\s*$/);
    if (!match) continue;
    const value = Number.parseInt(match[1], 10);
    if (Number.isFinite(value) && value > highest) highest = value;
  }
  return `${prefix}${String(highest + 1).padStart(4, "0")}`;
}

export type InvoiceDraft = {
  customer_name: string;
  customer_email: string | null;
  issue_date: string;
  due_date: string;
  lines: InvoiceLine[];
  notes: string | null;
};

/** Field-level problems, so the form can point at the thing that's wrong. */
export type InvoiceProblems = {
  customer_name?: string;
  issue_date?: string;
  due_date?: string;
  customer_email?: string;
  lines?: string;
  lineErrors?: Array<{ index: number; message: string }>;
};

export function validateInvoice(draft: InvoiceDraft): InvoiceProblems {
  const problems: InvoiceProblems = {};
  const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

  if (!draft.customer_name.trim()) problems.customer_name = "Who is this invoice for?";
  else if (draft.customer_name.length > 120) problems.customer_name = "That name is too long.";

  if (draft.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.customer_email.trim())) {
    problems.customer_email = "That doesn't look like an email address.";
  }

  if (!isDate(draft.issue_date)) problems.issue_date = "Pick a date.";
  if (!isDate(draft.due_date)) problems.due_date = "Pick a date.";

  // A due date before the issue date is almost always a typo, and it would
  // make the invoice overdue the moment it's sent.
  if (isDate(draft.issue_date) && isDate(draft.due_date) && draft.due_date < draft.issue_date) {
    problems.due_date = "Due date can't be before the issue date.";
  }

  const filled = draft.lines.filter((line) => line.description.trim() || line.unit_price > 0);
  if (filled.length === 0) problems.lines = "Add at least one item.";

  const lineErrors: Array<{ index: number; message: string }> = [];
  draft.lines.forEach((line, index) => {
    const hasAnything = line.description.trim() || line.unit_price > 0 || line.quantity > 0;
    if (!hasAnything) return;
    if (!line.description.trim()) {
      lineErrors.push({ index, message: "Describe what this is for." });
    } else if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
      lineErrors.push({ index, message: "Quantity must be more than zero." });
    } else if (!Number.isFinite(line.unit_price) || line.unit_price < 0) {
      lineErrors.push({ index, message: "Price can't be negative." });
    }
  });
  if (lineErrors.length > 0) problems.lineErrors = lineErrors;

  return problems;
}

export function hasProblems(problems: InvoiceProblems): boolean {
  return Object.keys(problems).length > 0;
}

/**
 * Which actions make sense for an invoice right now.
 *
 * Centralised so the list, the detail page and the server agree. In
 * particular: a paid invoice can't be edited, because its figures are already
 * reflected in the books.
 */
export function allowedActions(invoice: Invoice): {
  canEdit: boolean;
  canSend: boolean;
  canMarkPaid: boolean;
  canUnmarkPaid: boolean;
  canVoid: boolean;
  canDelete: boolean;
} {
  return {
    canEdit: invoice.status === "draft" || invoice.status === "sent",
    canSend: invoice.status === "draft",
    canMarkPaid: invoice.status === "sent",
    canUnmarkPaid: invoice.status === "paid",
    canVoid: invoice.status === "draft" || invoice.status === "sent",
    canDelete: invoice.status === "draft",
  };
}

export type InvoiceFilter = "all" | "outstanding" | "overdue" | "draft" | "paid";

export function filterInvoices(
  invoices: Invoice[],
  filter: InvoiceFilter,
  today: string,
  search = "",
): Invoice[] {
  const query = search.trim().toLowerCase();

  const matched = invoices.filter((invoice) => {
    if (filter === "outstanding" && invoice.status !== "sent") return false;
    if (filter === "overdue" && !isOverdue(invoice, today)) return false;
    if (filter === "draft" && invoice.status !== "draft") return false;
    if (filter === "paid" && invoice.status !== "paid") return false;

    if (!query) return true;
    const haystack = [
      invoice.number,
      invoice.customer_name,
      invoice.customer_email ?? "",
      invoiceTotal(invoice).toFixed(2),
      ...invoice.lines.map((line) => line.description),
    ]
      .join(" ")
      .toLowerCase();
    return query.split(/\s+/).every((word) => haystack.includes(word));
  });

  // Most urgent first. Sorting by date alone would float a settled invoice
  // above one still waiting to be paid, which buries the thing that needs
  // chasing under the thing that's already done.
  const urgency = (invoice: Invoice): number => {
    if (isOverdue(invoice, today)) return 0;
    if (invoice.status === "sent") return 1;
    if (invoice.status === "draft") return 2;
    if (invoice.status === "paid") return 3;
    return 4; // void
  };

  return matched.sort((a, b) => {
    const byUrgency = urgency(a) - urgency(b);
    if (byUrgency !== 0) return byUrgency;
    // Within the same bucket: soonest due for anything awaiting payment,
    // newest first for everything else.
    if (a.status === "sent" && b.status === "sent") return a.due_date.localeCompare(b.due_date);
    return b.issue_date.localeCompare(a.issue_date) || b.number.localeCompare(a.number);
  });
}

export function emptyLine(): InvoiceLine {
  return { description: "", quantity: 1, unit_price: 0 };
}

export function blankDraft(today: string, termDays = 14): InvoiceDraft {
  return {
    customer_name: "",
    customer_email: null,
    issue_date: today,
    due_date: addDays(today, termDays),
    lines: [emptyLine()],
    notes: null,
  };
}
