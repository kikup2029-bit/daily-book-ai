/**
 * Talking to Stripe.
 *
 * Plain REST over fetch rather than the Stripe SDK: this runs on Cloudflare
 * Workers, the SDK is large, and the three calls this app makes are short
 * enough to read in full. Fewer moving parts around money is a feature.
 *
 * SECURITY — the reason this file looks the way it does:
 *
 * The secret key is read at REQUEST time from the runtime environment and is
 * never referenced anywhere the bundler can inline it. The project's
 * vite.config.ts bakes some values into the built bundle at build time; the
 * Stripe secret must never be one of them. That key can create charges, issue
 * refunds and read every customer's payment details, so it has to live only in
 * the Worker's runtime secrets.
 *
 * If it's absent, every call here fails loudly. It never falls back to a
 * build-time value, because a silent fallback is exactly how a secret ends up
 * in a public bundle.
 */

const STRIPE_API = "https://api.stripe.com/v1";

/**
 * Reads a Stripe credential from the runtime environment only.
 *
 * Deliberately does NOT use readServerEnv() from server-env.ts: that helper
 * falls back to BUILD_TIME_VALUES, which is the inlining path. For Stripe we
 * want the failure, not the fallback.
 */
/**
 * Reads a runtime value from every place a Cloudflare binding can land.
 *
 * Three sources, because which one holds the value depends on how the request
 * got here: server.ts copies the Worker's bindings onto `process.env`, but that
 * copy only happens on paths that run through its fetch handler, and the raw
 * binding object shows up as `env` or `__env__` depending on the adapter.
 *
 * Exported because the Stripe Price id needs exactly this lookup and used to do
 * its own, checking `process.env` alone. That mismatch meant a correctly
 * configured Worker could still refuse to start checkout with "not set on the
 * server" — the value was there, just not in the one place that was looked at.
 * One reader, one answer.
 */
export function runtimeValue(key: string): string | null {
  const globalEnv = globalThis as {
    process?: { env?: Record<string, string | undefined> };
    __env__?: Record<string, string | undefined>;
    env?: Record<string, string | undefined>;
  };

  return globalEnv.process?.env?.[key] ?? globalEnv.__env__?.[key] ?? globalEnv.env?.[key] ?? null;
}

function runtimeSecret(key: string): string {
  const value = runtimeValue(key);

  if (!value) {
    throw new Error(
      `${key} is not set on the server. Add it as a runtime secret (Cloudflare: Settings → Variables and Secrets → Encrypt, or \`wrangler secret put ${key}\`). Do not add it to vite.config.ts — that would put it in the public bundle.`,
    );
  }
  return value;
}

export function stripeSecretKey(): string {
  return runtimeSecret("STRIPE_SECRET_KEY");
}

export function stripeWebhookSecret(): string {
  return runtimeSecret("STRIPE_WEBHOOK_SECRET");
}

/** Whether Stripe is configured at all, for showing a helpful message instead of a crash. */
export function stripeConfigured(): boolean {
  try {
    stripeSecretKey();
    return true;
  } catch {
    return false;
  }
}

/** Stripe's API takes form encoding, including for nested objects. */
function toForm(data: Record<string, unknown>, prefix = ""): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === "object" && !Array.isArray(value)) {
      parts.push(...toForm(value as Record<string, unknown>, name));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object") {
          parts.push(...toForm(item as Record<string, unknown>, `${name}[${index}]`));
        } else {
          parts.push(
            `${encodeURIComponent(`${name}[${index}]`)}=${encodeURIComponent(String(item))}`,
          );
        }
      });
    } else {
      parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts;
}

async function stripeRequest<T>(
  path: string,
  body?: Record<string, unknown>,
  idempotencyKey?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${stripeSecretKey()}`,
    "Content-Type": "application/x-www-form-urlencoded",
    // Pinning the version means Stripe changing its defaults can't silently
    // change the shape of what we parse.
    "Stripe-Version": "2024-06-20",
  };
  // Lets Stripe collapse a retry into the original call rather than charging
  // twice if the network drops after the request but before the response.
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const response = await fetch(`${STRIPE_API}${path}`, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? toForm(body).join("&") : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    let message = `Stripe returned ${response.status}.`;
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } };
      if (parsed.error?.message) message = parsed.error.message;
    } catch {
      // Keep the status-code message.
    }
    throw new Error(message);
  }

  return JSON.parse(text) as T;
}

/* ------------------------------------------------------------- customers */

export async function findOrCreateCustomer(input: {
  userId: string;
  email: string;
  existingCustomerId: string | null;
}): Promise<string> {
  if (input.existingCustomerId) return input.existingCustomerId;

  const customer = await stripeRequest<{ id: string }>(
    "/customers",
    {
      email: input.email,
      // The link back to our user. Every webhook can then find the account
      // without a lookup table, and a customer created by hand in the Stripe
      // dashboard without this is visibly broken rather than silently wrong.
      metadata: { supabase_user_id: input.userId },
    },
    // One customer per user even if they double-click.
    `customer-${input.userId}`,
  );
  return customer.id;
}

/* -------------------------------------------------------------- checkout */

export async function createCheckoutSession(input: {
  customerId: string;
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  /** Days of free access before the first charge. 0 or undefined bills today. */
  trialDays?: number;
}): Promise<{ id: string; url: string }> {
  const trialDays = input.trialDays && input.trialDays > 0 ? input.trialDays : null;

  return stripeRequest<{ id: string; url: string }>("/checkout/sessions", {
    mode: "subscription",
    customer: input.customerId,
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    subscription_data: {
      // Carried onto the subscription so every later webhook knows whose it is.
      metadata: { supabase_user_id: input.userId },
      ...(trialDays
        ? {
            trial_period_days: trialDays,
            trial_settings: {
              end_behavior: {
                // Without this, a trial that ends with no usable card sits in
                // `past_due` — which grantsPro() treats as still paid, so the
                // account would keep Pro indefinitely without ever paying.
                // `cancel` ends it cleanly and drops them to Free.
                missing_payment_method: "cancel",
              },
            },
          }
        : {}),
    },
    // A trial that never asked for a card is not the model we sell — the
    // disclosure promises a charge on a specific date, so a card must exist.
    ...(trialDays ? { payment_method_collection: "always" } : {}),
    metadata: { supabase_user_id: input.userId },
    allow_promotion_codes: true,
    // Card details are collected by Stripe on Stripe's own page. They never
    // touch this app, which is the entire point of hosted checkout.
  });
}

/* ---------------------------------------------------------------- portal */

export async function createPortalSession(input: {
  customerId: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  return stripeRequest<{ url: string }>("/billing_portal/sessions", {
    customer: input.customerId,
    return_url: input.returnUrl,
  });
}

/** Fetches a subscription, for reconciling state after checkout. */
export async function fetchSubscription(id: string): Promise<Record<string, unknown>> {
  return stripeRequest<Record<string, unknown>>(`/subscriptions/${id}`);
}
