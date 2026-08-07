/**
 * Where the Worker's runtime variables actually live.
 *
 * THE BUG THIS EXISTS TO FIX
 *
 * Cloudflare does not put bindings on a global. It hands them to the fetch
 * handler as an argument, and that is the only place they appear. The previous
 * approach copied them onto `process.env` — which works locally, where Node
 * provides `process`, and does nothing at all on a deployed Worker unless the
 * `nodejs_compat` flag is on. This project has no wrangler config and no such
 * flag, so the copy hit `if (!process?.env) return;` and gave up silently.
 *
 * The result was the worst kind of failure: every runtime variable read as
 * missing, and the app confidently reported "STRIPE_PRICE_PRO_MONTHLY is not
 * set on the server" while it sat correctly set in the dashboard. Hours can go
 * into re-typing a value that was never the problem.
 *
 * So the env object is kept here instead, in a plain module variable, with no
 * dependency on any Node compatibility shim.
 *
 * SECURITY
 *
 * This holds the Stripe secret key and the Supabase service role key. The
 * `.server.ts` suffix keeps it out of the client bundle, and nothing here is
 * ever returned to a caller — `readRuntimeEnv` looks up one named key at a
 * time, and there is deliberately no function that enumerates or dumps the
 * whole object.
 *
 * Module state is safe here: one isolate serves many requests, but every one of
 * them gets the same bindings, so there is nothing per-user to leak between
 * them.
 */

let runtimeEnv: Record<string, string> | null = null;

/** Called once per request from the Worker's fetch handler, before routing. */
export function setRuntimeEnv(env: unknown): void {
  if (!env || typeof env !== "object") return;

  const collected: Record<string, string> = {};
  for (const [key, value] of Object.entries(env as Record<string, unknown>)) {
    // Strings only. Other bindings — KV namespaces, D1, queues — are objects,
    // and anything expecting an env var would choke on them.
    if (typeof value === "string") collected[key] = value;
  }
  runtimeEnv = collected;
}

/**
 * One named value, or null.
 *
 * Checks the captured bindings first, then the places a value can land when
 * running under Node (local dev, `wrangler dev`, tests) so the same call works
 * everywhere.
 */
export function readRuntimeEnv(key: string): string | null {
  if (runtimeEnv && runtimeEnv[key]) return runtimeEnv[key];

  const globalEnv = globalThis as {
    process?: { env?: Record<string, string | undefined> };
    __env__?: Record<string, string | undefined>;
    env?: Record<string, string | undefined>;
  };

  return globalEnv.process?.env?.[key] ?? globalEnv.__env__?.[key] ?? globalEnv.env?.[key] ?? null;
}

/**
 * Which of the expected names are present, for a diagnostics view.
 *
 * Returns names and booleans — never values. Telling someone "the key is set"
 * is what they need to debug; showing them the key is how a secret ends up in a
 * screenshot.
 */
export function runtimeEnvReport(names: readonly string[]): Array<{ name: string; set: boolean }> {
  return names.map((name) => ({ name, set: readRuntimeEnv(name) !== null }));
}
