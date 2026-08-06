import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import {
  invoiceTotal,
  nextInvoiceNumber,
  type Invoice,
  type InvoiceDraft,
  type InvoiceLine,
  type InvoiceStatus,
} from "./invoices";

// The invoices table is newer than the generated Database types, so this file
// talks to it through a loosened client. Everything still goes through row
// level security; this only relaxes the compile-time shape.
type Client = SupabaseClient<Database>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const table = (supabase: Client) => (supabase as any).from("invoices");

const COLUMNS =
  "id, number, customer_name, customer_email, issue_date, due_date, status, lines, notes, paid_date, entry_id";

type Row = {
  id: string;
  number: string;
  customer_name: string;
  customer_email: string | null;
  issue_date: string;
  due_date: string;
  status: string;
  lines: unknown;
  notes: string | null;
  paid_date: string | null;
  entry_id: string | null;
};

/** Line items come back as JSON, so nothing about their shape is guaranteed. */
function toLines(raw: unknown): InvoiceLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const line = item as Partial<InvoiceLine>;
    return [
      {
        description: typeof line.description === "string" ? line.description : "",
        quantity: Number(line.quantity) || 0,
        unit_price: Number(line.unit_price) || 0,
      },
    ];
  });
}

function toInvoice(row: Row): Invoice {
  const status: InvoiceStatus =
    row.status === "sent" || row.status === "paid" || row.status === "void" ? row.status : "draft";
  return {
    id: row.id,
    number: row.number,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    issue_date: row.issue_date,
    due_date: row.due_date,
    status,
    lines: toLines(row.lines),
    notes: row.notes,
    paid_date: row.paid_date,
    entry_id: row.entry_id,
  };
}

export async function fetchInvoices(supabase: Client, userId: string): Promise<Invoice[]> {
  const { data, error } = await table(supabase)
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("issue_date", { ascending: false })
    .order("number", { ascending: false })
    .limit(500);

  if (error) throw new Error(friendly(error.message));
  return (data ?? []).map(toInvoice);
}

export async function fetchInvoice(supabase: Client, userId: string, id: string): Promise<Invoice> {
  const { data, error } = await table(supabase)
    .select(COLUMNS)
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(friendly(error.message));
  if (!data) throw new Error("That invoice couldn't be found.");
  return toInvoice(data);
}

export async function createInvoice(
  supabase: Client,
  userId: string,
  draft: InvoiceDraft,
): Promise<Invoice> {
  // Numbering is worked out server-side from what already exists, so two
  // devices creating an invoice at once can't both claim the same number —
  // and if they race, the unique index rejects the loser rather than silently
  // duplicating.
  const { data: existing } = await table(supabase).select("number").eq("user_id", userId);
  const number = nextInvoiceNumber((existing ?? []).map((row: { number: string }) => row.number));

  const { data, error } = await table(supabase)
    .insert({
      user_id: userId,
      number,
      customer_name: draft.customer_name.trim(),
      customer_email: draft.customer_email?.trim() || null,
      issue_date: draft.issue_date,
      due_date: draft.due_date,
      status: "draft",
      lines: draft.lines,
      notes: draft.notes?.trim() || null,
    })
    .select(COLUMNS)
    .single();

  if (error) throw new Error(friendly(error.message));
  return toInvoice(data);
}

export async function updateInvoice(
  supabase: Client,
  userId: string,
  id: string,
  draft: InvoiceDraft,
): Promise<Invoice> {
  const current = await fetchInvoice(supabase, userId, id);
  // A paid invoice's figures are already in the books. Changing them here
  // would leave the entry and the invoice disagreeing.
  if (current.status === "paid") {
    throw new Error("This invoice is paid. Mark it unpaid first if you need to change it.");
  }
  if (current.status === "void") throw new Error("This invoice was cancelled.");

  const { data, error } = await table(supabase)
    .update({
      customer_name: draft.customer_name.trim(),
      customer_email: draft.customer_email?.trim() || null,
      issue_date: draft.issue_date,
      due_date: draft.due_date,
      lines: draft.lines,
      notes: draft.notes?.trim() || null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select(COLUMNS)
    .single();

  if (error) throw new Error(friendly(error.message));
  return toInvoice(data);
}

export async function setInvoiceStatus(
  supabase: Client,
  userId: string,
  id: string,
  status: "sent" | "void",
): Promise<Invoice> {
  const { data, error } = await table(supabase)
    .update({ status })
    .eq("id", id)
    .eq("user_id", userId)
    .select(COLUMNS)
    .single();

  if (error) throw new Error(friendly(error.message));
  return toInvoice(data);
}

/**
 * Marking paid is the moment an invoice becomes income.
 *
 * It writes a normal entry into the books and remembers its id, so the money
 * shows up in today's totals, the month, the tax set-aside and the export
 * exactly like any other income — no separate "invoice income" concept that
 * every other feature would then have to know about.
 */
export async function markInvoicePaid(
  supabase: Client,
  userId: string,
  id: string,
  paidDate: string,
): Promise<Invoice> {
  const invoice = await fetchInvoice(supabase, userId, id);
  if (invoice.status === "paid") return invoice;
  if (invoice.status === "void") throw new Error("This invoice was cancelled.");

  const total = invoiceTotal(invoice);

  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .insert({
      user_id: userId,
      entry_date: paidDate,
      amount_in: total,
      amount_out: 0,
      spent_on: "Invoice",
      merchant: invoice.customer_name,
      payment_method: "other",
      household_id: null,
      is_split: false,
    })
    .select("id")
    .single();

  if (entryError) throw new Error(friendly(entryError.message));

  const { data, error } = await table(supabase)
    .update({ status: "paid", paid_date: paidDate, entry_id: entry.id })
    .eq("id", id)
    .eq("user_id", userId)
    .select(COLUMNS)
    .single();

  if (error) {
    // Don't leave income in the books for an invoice that didn't get marked.
    await supabase.from("entries").delete().eq("id", entry.id).eq("user_id", userId);
    throw new Error(friendly(error.message));
  }
  return toInvoice(data);
}

/** Undo a payment: the invoice goes back to awaiting, the entry goes away. */
export async function markInvoiceUnpaid(
  supabase: Client,
  userId: string,
  id: string,
): Promise<Invoice> {
  const invoice = await fetchInvoice(supabase, userId, id);
  if (invoice.status !== "paid") return invoice;

  if (invoice.entry_id) {
    await supabase.from("entries").delete().eq("id", invoice.entry_id).eq("user_id", userId);
  }

  const { data, error } = await table(supabase)
    .update({ status: "sent", paid_date: null, entry_id: null })
    .eq("id", id)
    .eq("user_id", userId)
    .select(COLUMNS)
    .single();

  if (error) throw new Error(friendly(error.message));
  return toInvoice(data);
}

export async function deleteInvoice(
  supabase: Client,
  userId: string,
  id: string,
): Promise<{ id: string }> {
  const invoice = await fetchInvoice(supabase, userId, id);
  // Deleting a sent or paid invoice would break the numbering trail. Cancel
  // instead — that keeps the record and the number.
  if (invoice.status !== "draft") {
    throw new Error("Only drafts can be deleted. Cancel this one instead.");
  }

  const { error } = await table(supabase).delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(friendly(error.message));
  return { id };
}

/**
 * The most common failure here is the table not existing yet, because the SQL
 * hasn't been run. Say that plainly instead of showing a Postgres error code.
 */
function friendly(message: string): string {
  if (/relation .*invoices.* does not exist/i.test(message) || /schema cache/i.test(message)) {
    return "Invoices aren't set up on your database yet. Run supabase/add-invoices.sql in the Supabase SQL Editor, then reload.";
  }
  if (/duplicate key/i.test(message)) {
    return "That invoice number is already used. Try again.";
  }
  return message;
}
