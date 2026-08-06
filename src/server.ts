import "./lib/error-capture";

/**
 * Copies the Worker's runtime bindings onto process.env.
 *
 * Cloudflare hands secrets to the fetch handler as `env`, not as process.env.
 * Server code written the ordinary way looks at process.env, so this bridges
 * the two once per request.
 *
 * This is what makes it possible to keep the Stripe secret OUT of the built
 * bundle: it can live purely as a runtime secret and still be readable by the
 * server. Nothing here ever runs in a browser.
 */
function exposeRuntimeEnv(env: unknown): void {
  if (!env || typeof env !== "object") return;
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
