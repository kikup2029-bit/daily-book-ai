import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "That date doesn't look right.");

const draftSchema = z.object({
  customer_name: z.string().min(1, "Who is this invoice for?").max(120),
  customer_email: z.string().max(200).nullable(),
  issue_date: isoDate,
  due_date: isoDate,
  notes: z.string().max(2000).nullable(),
  lines: z
    .array(
      z.object({
        description: z.string().min(1).max(300),
        quantity: z.number().positive().max(1_000_000),
        unit_price: z.number().min(0).max(10_000_000),
      }),
    )
    .min(1, "Add at least one item.")
    .max(100),
});

export const getInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchInvoices } = await import("./invoices.server");
    return fetchInvoices(context.supabase, context.userId);
  });

export const createInvoiceFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => draftSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { createInvoice } = await import("./invoices.server");
    return createInvoice(context.supabase, context.userId, data);
  });

export const updateInvoiceFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => draftSchema.extend({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { updateInvoice } = await import("./invoices.server");
    const { id, ...draft } = data;
    return updateInvoice(context.supabase, context.userId, id, draft);
  });

export const setInvoiceStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["sent", "void"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { setInvoiceStatus } = await import("./invoices.server");
    return setInvoiceStatus(context.supabase, context.userId, data.id, data.status);
  });

export const markPaidFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), paid_date: isoDate }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { markInvoicePaid } = await import("./invoices.server");
    return markInvoicePaid(context.supabase, context.userId, data.id, data.paid_date);
  });

export const markUnpaidFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { markInvoiceUnpaid } = await import("./invoices.server");
    return markInvoiceUnpaid(context.supabase, context.userId, data.id);
  });

export const removeInvoiceFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { deleteInvoice } = await import("./invoices.server");
    return deleteInvoice(context.supabase, context.userId, data.id);
  });
