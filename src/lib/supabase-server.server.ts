import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { readServerEnv } from "./server-env";

export function createServerSupabase() {
  const url = readServerEnv("SUPABASE_URL") ?? readServerEnv("VITE_SUPABASE_URL");
  const key =
    readServerEnv("SUPABASE_PUBLISHABLE_KEY") ?? readServerEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) throw new Error("Missing Supabase server environment variables");

  return createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
