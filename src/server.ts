import "./lib/error-capture";

import { setRuntimeEnv } from "./lib/runtime-env.server";

/**
 * Makes the Worker's bindings reachable from ordinary module code.
 *
 * setRuntimeEnv() is the one that actually matters in production. The
 * process.env copy below is a convenience for anything reading it directly, and
 * it is allowed to do nothing: on a deployed Worker without `nodejs_compat`
 * there is no `process`, which is exactly the trap this used to fall into —
 * it returned silently and every runtime variable read as missing.
 */
function exposeRuntimeEnv(env: unknown): void {
  if (!env || typeof env !== "object") return;

  // Not conditional on anything. This is the path that works everywhere.
  setRuntimeEnv(env);

  const globalProcess = (globalThis as { process?: { env?: Record<string, unknown> } }).process;
  if (!globalProcess?.env) return;

  for (const [key, value] of Object.entries(env as Record<string, unknown>)) {
    // Only strings; bindings like KV namespaces are objects and would break
    // anything expecting an env var.
    if (typeof value === "string" && globalProcess.env[key] === undefined) {
      globalProcess.env[key] = value;
    }
  }
}

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      /*
       * Stripe's webhook is handled here, ahead of the app.
       *
       * Two reasons it can't be an ordinary server function: signature
       * verification needs the exact raw bytes Stripe sent, and the request
       * carries no session — Stripe is not a signed-in user. Intercepting at
       * the edge keeps both facts true.
       *
       * Cloudflare exposes runtime secrets on `env` rather than process.env,
       * so they're copied across before anything reads them.
       */
      const url = new URL(request.url);
      if (url.pathname === "/api/stripe/webhook") {
        exposeRuntimeEnv(env);
        const { handleStripeWebhook } = await import("./lib/stripe/handle-webhook.server");
        return await handleStripeWebhook(request);
      }

      exposeRuntimeEnv(env);
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
