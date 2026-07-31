import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

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
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY server environment variable");
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
