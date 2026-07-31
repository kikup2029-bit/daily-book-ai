/**
 * Reads a server-side environment variable across the different ways a host
 * can expose them.
 *
 * On Cloudflare Workers, variables/secrets are bindings on the Worker's `env`
 * object. Depending on compatibility flags and how the Worker was deployed,
 * they may or may not also be mirrored onto `process.env`. Checking both means
 * the app works either way instead of failing with "missing environment
 * variable" when the value is actually configured.
 */
export function readServerEnv(key: string): string | undefined {
  // 1. Standard Node-style access (works locally, and on Workers when
  //    process.env is populated from bindings).
  const fromProcess =
    typeof process !== "undefined" && process.env ? process.env[key] : undefined;
  if (fromProcess) return fromProcess;

  // 2. Cloudflare sometimes exposes bindings on globalThis (Nitro/Wrangler
  //    populate these in some configurations).
  const globalEnv = (globalThis as Record<string, unknown>).__env__;
  if (globalEnv && typeof globalEnv === "object") {
    const value = (globalEnv as Record<string, unknown>)[key];
    if (typeof value === "string" && value) return value;
  }

  const cfEnv = (globalThis as Record<string, unknown>).env;
  if (cfEnv && typeof cfEnv === "object") {
    const value = (cfEnv as Record<string, unknown>)[key];
    if (typeof value === "string" && value) return value;
  }

  return undefined;
}

/** Same as readServerEnv, but throws a clear error when the value is absent. */
export function requireServerEnv(key: string): string {
  const value = readServerEnv(key);
  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}. Add it in your host's environment variable settings and redeploy.`,
    );
  }
  return value;
}
