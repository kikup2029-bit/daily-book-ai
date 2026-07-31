import { createServerFn } from "@tanstack/react-start";

export type PublicConfig = {
  supabaseUrl: string;
  supabaseKey: string;
};

/**
 * Sends the *public* Supabase URL + publishable key from the server to the
 * browser at runtime.
 *
 * Why this exists: Vite only bakes VITE_* variables into the browser bundle at
 * BUILD time. On hosts where build-time and runtime environment variables are
 * configured separately (e.g. Cloudflare Workers), the VITE_* values can end up
 * empty in the built bundle even though the runtime variables are set correctly.
 * Reading them here — on the server, at request time — avoids that entirely, so
 * only the plain SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY runtime variables are
 * required.
 *
 * Both values are safe to expose publicly: the publishable/anon key is designed
 * to be used from the browser and is protected by Row Level Security.
 */
export const getPublicConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicConfig> => {
    const { readServerEnv } = await import("./server-env");
    return {
      supabaseUrl: readServerEnv("SUPABASE_URL") ?? readServerEnv("VITE_SUPABASE_URL") ?? "",
      supabaseKey:
        readServerEnv("SUPABASE_PUBLISHABLE_KEY") ??
        readServerEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ??
        "",
    };
  },
);
