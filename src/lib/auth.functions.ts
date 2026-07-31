import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Best-effort auto-confirm for a brand-new signup, so users don't have to
 * click an email link before using the app.
 *
 * This only works once a SUPABASE_SERVICE_ROLE_KEY environment variable is
 * configured (see src/lib/supabase-admin.server.ts). If it's not set, this
 * safely reports { confirmed: false } and the app falls back to Supabase's
 * normal "check your email" flow — nothing breaks either way.
 *
 * Safety: only confirms accounts created in the last 10 minutes, so this
 * can't be used to silently confirm arbitrary/older accounts.
 */
export const confirmNewSignup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<{ confirmed: boolean }> => {
    try {
      const { createServerSupabaseAdmin } = await import("./supabase-admin.server");
      const admin = createServerSupabaseAdmin();

      const { data: userResult, error: getUserError } = await admin.auth.admin.getUserById(
        data.userId,
      );
      if (getUserError || !userResult?.user) {
        return { confirmed: false };
      }

      const user = userResult.user;
      if (user.email_confirmed_at) {
        return { confirmed: true };
      }

      const createdAtMs = new Date(user.created_at).getTime();
      const tenMinutesMs = 10 * 60 * 1000;
      if (!Number.isFinite(createdAtMs) || Date.now() - createdAtMs > tenMinutesMs) {
        return { confirmed: false };
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(data.userId, {
        email_confirm: true,
      });
      if (updateError) {
        return { confirmed: false };
      }

      return { confirmed: true };
    } catch {
      // SUPABASE_SERVICE_ROLE_KEY not configured yet, or any other issue —
      // degrade gracefully to Supabase's normal email confirmation flow.
      return { confirmed: false };
    }
  });
