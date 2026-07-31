import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchEntries } = await import("./books.server");
    return fetchEntries(context.supabase, context.userId);
  });

export const createEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        entry_date: z.string().min(1),
        amount_in: z.number().min(0),
        amount_out: z.number().min(0),
        spent_on: z.string().max(120).nullable(),
        merchant: z.string().max(120).nullable().optional(),
        payment_method: z.string().max(20).nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { insertEntry } = await import("./books.server");
    return insertEntry(context.supabase, context.userId, data);
  });

export const askBookkeeper = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ question: z.string().min(1).max(500) }).parse(data))
  .handler(async ({ data, context }) => {
    const { answerQuestion } = await import("./books.server");
    return { answer: await answerQuestion(context.supabase, context.userId, data.question) };
  });

export const removeEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ entry_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { deleteEntry } = await import("./books.server");
    return deleteEntry(context.supabase, context.userId, data.entry_id);
  });

export const analyzeReceipt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        base64Image: z.string().min(1).max(15_000_000),
        mimeType: z.string().min(1).max(60),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { analyzeReceiptPhoto } = await import("./books.server");
    return analyzeReceiptPhoto(data.base64Image, data.mimeType);
  });

export const attachReceipt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        entry_id: z.string().uuid(),
        receipt_path: z.string().max(400).nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { setEntryReceipt } = await import("./books.server");
    return setEntryReceipt(context.supabase, context.userId, data.entry_id, data.receipt_path);
  });
