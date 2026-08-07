import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { Feature } from "./pricing";

/**
 * The entitlement check, on the server, where it counts.
 *
 * <ProGate> hides these screens, but hiding a screen doesn't stop anyone
 * POSTing to the function behind it. Every handler below that serves a Pro-only
 * screen calls this first.
 *
 * What is deliberately NOT gated here: `getSettings` (the app lock and the
 * onboarding card on the free Today screen both read it), `putSettings`, and
 * the lock functions. Those are shared with screens that stay free, and gating
 * the shared read to protect a paid screen would lock a paying-nothing customer
 * out of their own front door.
 */
async function requirePro(
  supabase: SupabaseClient<Database>,
  userId: string,
  feature: Feature,
): Promise<void> {
  const { requireFeature } = await import("./subscriptions.server");
  await requireFeature(supabase, userId, feature);
}

// --- products -------------------------------------------------------------

export const getProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePro(context.supabase, context.userId, "cashTools");
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
    await requirePro(context.supabase, context.userId, "cashTools");
    const { upsertProduct } = await import("./shop.server");
    return upsertProduct(context.supabase, context.userId, data);
  });

export const removeProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await requirePro(context.supabase, context.userId, "cashTools");
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

export const putReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        enabled: z.boolean(),
        time: z
          .string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Pick a time.")
          .nullable(),
        last_shown: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .nullable()
          .optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await requirePro(context.supabase, context.userId, "dailyReminder");
    const { saveReminder } = await import("./shop.server");
    return saveReminder(context.supabase, context.userId, data);
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
    await requirePro(context.supabase, context.userId, "cashTools");
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
    await requirePro(context.supabase, context.userId, "cashTools");
    const { recordCashCount } = await import("./shop.server");
    return recordCashCount(context.supabase, context.userId, data);
  });

export const removeCashCount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await requirePro(context.supabase, context.userId, "cashTools");
    const { deleteCashCount } = await import("./shop.server");
    return deleteCashCount(context.supabase, context.userId, data.id);
  });

// --- insights (computed server-side from the user's own data) -------------

/**
 * Everything the analysis screens read, in one request.
 *
 * The whole payload is Pro. It carries the tax set-aside (cashTools) and the
 * bill calendar (billsCalendar) alongside the analysis proper, and those three
 * features move between plans together, so one check covers the lot rather than
 * three that could drift apart. If a future plan ever splits them, this has to
 * become a per-field decision — the comment is here so that isn't discovered
 * the hard way.
 *
 * The free Today screen used to read the due-soon list and the safe-to-spend
 * figure from here. Those two cards now check the same entitlement before they
 * ask, so gating this doesn't leave the free dashboard firing a request that is
 * always going to be refused.
 */
export const getInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePro(context.supabase, context.userId, "insights");
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
