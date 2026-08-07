import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { readRuntimeEnv } from "./runtime-env.server";

/**
 * Server-only Supabase client using the service_role secret key.
 * NEVER import this from client code — it bypasses Row Level Security.
 *
 * Requires a SUPABASE_SERVICE_ROLE_KEY environment variable, which is
 * NOT set by default. Get it from the Supabase dashboard
 * (Settings -> API -> service_role secret) and add it as an environment
 * variable in Cloudflare (Settings -> Variables and Secrets) — do not
 * commit it to the repo or share it in chat.
 */
export function createServerSupabaseAdmin() {
  // readRuntimeEnv, not process.env. Cloudflare hands bindings to the fetch
  // handler; `process.env` is empty on a Worker without the nodejs_compat flag,
  // and this project has none. Reading it directly made a correctly-uploaded
  // secret report as missing — the same trap that cost an afternoon on the
  // Stripe keys.
  const url = readRuntimeEnv("SUPABASE_URL");
  const serviceKey = readRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    // Name which one is absent. "Missing SUPABASE_SERVICE_ROLE_KEY" while the
    // URL was the real gap sends you looking in the wrong place.
    const missing = [
      !url ? "SUPABASE_URL" : null,
      !serviceKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
    ].filter(Boolean);
    throw new Error(
      `Not readable on the server: ${missing.join(" and ")}. Set with: wrangler secret put <NAME> --name daily-book-ai`,
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
