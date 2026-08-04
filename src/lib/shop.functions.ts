import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// --- products -------------------------------------------------------------

export const getProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchProducts } = await import("./shop.server");
    return fetchProducts(context.supabase, context.userId);
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid().nullable().optional(),
        name: z.string().min(1).max(120),
        unit_cost: z.number().min(0),
        sale_price: z.number().min(0),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { upsertProduct } = await import("./shop.server");
    return upsertProduct(context.supabase, context.userId, data);
  });

export const removeProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { deleteProduct } = await import("./shop.server");
    return deleteProduct(context.supabase, context.userId, data.id);
  });

// --- settings -------------------------------------------------------------

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchSettings } = await import("./shop.server");
    return fetchSettings(context.supabase, context.userId);
  });

export const putSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        tax_rate_percent: z.number().min(0).max(100),
        opening_float: z.number().min(0),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { saveSettings } = await import("./shop.server");
    return saveSettings(context.supabase, context.userId, data);
  });

// --- app lock -------------------------------------------------------------

export const setAppLock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        pin: z.string().min(4).max(8),
        timeout_minutes: z.number().int().min(0).max(240),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { setLockPin } = await import("./shop.server");
    return setLockPin(context.supabase, context.userId, data);
  });

export const removeAppLock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { clearLockPin } = await import("./shop.server");
    return clearLockPin(context.supabase, context.userId);
  });

export const unlockApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ pin: z.string().max(8) }).parse(data))
  .handler(async ({ data, context }) => {
    const { checkLockPin } = await import("./shop.server");
    return checkLockPin(context.supabase, context.userId, data.pin);
  });

// --- cash drawer ----------------------------------------------------------

export const getCashCounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchCashCounts } = await import("./shop.server");
    return fetchCashCounts(context.supabase, context.userId);
  });

export const saveCashCount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        count_date: z.string().min(1),
        counted_amount: z.number().min(0),
        opening_float: z.number().min(0),
        note: z.string().max(300).nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { recordCashCount } = await import("./shop.server");
    return recordCashCount(context.supabase, context.userId, data);
  });

export const removeCashCount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { deleteCashCount } = await import("./shop.server");
    return deleteCashCount(context.supabase, context.userId, data.id);
  });

// --- insights (computed server-side from the user's own data) -------------

export const getInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchEntries } = await import("./books.server");
    const { fetchRecurring, fetchBudgets } = await import("./planning.server");
    const { fetchSettings } = await import("./shop.server");
    const {
      forecastCash,
      taxSetAside,
      dayOfWeekPatterns,
      weeklyDigest,
      averageMonthlyOverhead,
      safeToSpendToday,
      detectRecurring,
      computeStreaks,
      billCalendar,
    } = await import("./insights");

    const [entries, recurring, budgets, settings] = await Promise.all([
      fetchEntries(context.supabase, context.userId),
      fetchRecurring(context.supabase, context.userId).catch(() => []),
      fetchBudgets(context.supabase, context.userId).catch(() => []),
      fetchSettings(context.supabase, context.userId).catch(() => ({
        tax_rate_percent: 0,
        opening_float: 0,
      })),
    ]);

    // Don't suggest things the owner already set up as a recurring bill.
    const alreadyTracked = recurring.flatMap((rule) => [rule.category]);

    return {
      forecast: forecastCash(entries, recurring, { horizonDays: 30 }),
      safeToSpend: safeToSpendToday(entries, recurring, budgets),
      tax: taxSetAside(entries, settings.tax_rate_percent),
      dayPatterns: dayOfWeekPatterns(entries),
      digest: weeklyDigest(entries),
      detectedRecurring: detectRecurring(entries, { alreadyTracked }),
      streaks: computeStreaks(entries),
      calendar: billCalendar(recurring, { days: 45 }),
      monthlyOverhead: averageMonthlyOverhead(entries),
      settings,
    };
  });
