import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getRecurring = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchRecurring, generateRecurringEntries } = await import("./planning.server");
    await generateRecurringEntries(context.supabase, context.userId);
    return fetchRecurring(context.supabase, context.userId);
  });

export const saveRecurring = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid().nullable().optional(),
        amount: z.number().min(0),
        category: z.string().min(1).max(120),
        frequency: z.enum(["weekly", "monthly"]),
        start_date: z.string().min(1),
        active: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { upsertRecurring, generateRecurringEntries } = await import("./planning.server");
    const saved = await upsertRecurring(context.supabase, context.userId, data);
    await generateRecurringEntries(context.supabase, context.userId);
    return saved;
  });

export const removeRecurring = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { deleteRecurring } = await import("./planning.server");
    return deleteRecurring(context.supabase, context.userId, data.id);
  });

export const getBudgets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchBudgets } = await import("./planning.server");
    return fetchBudgets(context.supabase, context.userId);
  });

export const saveBudget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ category: z.string().min(1).max(120), monthly_limit: z.number().min(0) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { upsertBudget } = await import("./planning.server");
    return upsertBudget(context.supabase, context.userId, data);
  });

export const removeBudget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { deleteBudget } = await import("./planning.server");
    return deleteBudget(context.supabase, context.userId, data.id);
  });

export const getGoals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchGoals } = await import("./planning.server");
    return fetchGoals(context.supabase, context.userId);
  });

export const saveGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid().nullable().optional(),
        name: z.string().min(1).max(120),
        target_amount: z.number().min(0),
        saved_amount: z.number().min(0),
        target_date: z.string().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { upsertGoal } = await import("./planning.server");
    return upsertGoal(context.supabase, context.userId, data);
  });

export const removeGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { deleteGoal } = await import("./planning.server");
    return deleteGoal(context.supabase, context.userId, data.id);
  });
