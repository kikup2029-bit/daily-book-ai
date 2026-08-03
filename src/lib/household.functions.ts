import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getHousehold = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchHousehold } = await import("./household.server");
    return fetchHousehold(context.supabase, context.userId);
  });

export const startHousehold = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().min(1).max(80),
        display_name: z.string().max(60).nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { createHousehold } = await import("./household.server");
    return createHousehold(context.supabase, context.userId, data);
  });

export const enterHousehold = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        join_code: z.string().min(4).max(12),
        display_name: z.string().max(60).nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { joinHousehold } = await import("./household.server");
    return joinHousehold(context.supabase, context.userId, data);
  });

export const exitHousehold = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { leaveHousehold } = await import("./household.server");
    return leaveHousehold(context.supabase, context.userId);
  });

export const setMemberName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ display_name: z.string().max(60).nullable() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { renameMember } = await import("./household.server");
    return renameMember(context.supabase, context.userId, data.display_name);
  });

export const getSettlement = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchSettlement } = await import("./household.server");
    return fetchSettlement(context.supabase, context.userId);
  });

/**
 * Sets how a single entry is shared:
 *   private — only you can see it
 *   visible — the household can see it, but it creates no debts
 *   split   — the household can see it AND it's divided evenly
 */
export const setEntryShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        entry_id: z.string().uuid(),
        mode: z.enum(["private", "visible", "split"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { fetchHousehold } = await import("./household.server");

    let householdId: string | null = null;
    if (data.mode !== "private") {
      const state = await fetchHousehold(context.supabase, context.userId);
      if (!state.household) throw new Error("You're not in a household yet.");
      householdId = state.household.id;
    }

    const { error } = await context.supabase
      .from("entries")
      .update({ household_id: householdId, is_split: data.mode === "split" })
      .eq("id", data.entry_id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true, mode: data.mode };
  });
