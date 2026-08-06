/**
 * Verifying that a webhook really came from Stripe.
 *
 * This is the single most security-critical function in the payment flow.
 * The webhook endpoint is a public URL: anyone can POST to it. The only thing
 * separating a genuine "this customer paid" event from a forged one is this
 * signature check. Get it wrong and someone grants themselves Pro for free —
 * or worse, downgrades a paying customer.
 *
 * Written against the Web Crypto API rather than Stripe's SDK because this
 * runs on Cloudflare Workers, and because a signature check you can read in
 * full is worth more here than one hidden behind a dependency.
 *
 * Stripe's scheme: the `Stripe-Signature` header carries a timestamp and one
 * or more HMAC-SHA256 signatures of `${timestamp}.${rawBody}`, keyed with the
 * endpoint's signing secret.
 */

export type SignatureHeader = {
  timestamp: number;
  signatures: string[];
};

/** Parses `t=1614556800,v1=abc...,v1=def...` */
export function parseSignatureHeader(header: string): SignatureHeader | null {
  if (!header) return null;

  let timestamp: number | null = null;
  const signatures: string[] = [];

  for (const part of header.split(",")) {
    const [key, value] = part.split("=", 2);
    if (!key || !value) continue;
    const trimmedKey = key.trim();
    if (trimmedKey === "t") {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) timestamp = parsed;
    } else if (trimmedKey === "v1") {
      // More than one v1 appears while a signing secret is being rotated.
      signatures.push(value.trim());
    }
  }

  if (timestamp === null || signatures.length === 0) return null;
  return { timestamp, signatures };
}

/**
 * Constant-time comparison.
 *
 * A plain `===` on strings can leak how many leading characters matched via
 * timing, which is enough to forge a signature byte by byte given patience.
 * Comparing every byte regardless makes the duration independent of the input.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function computeSignature(
  payload: string,
  secret: string,
  timestamp: number,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`),
  );
  return toHex(signed);
}

export type VerifyResult = { ok: true; event: StripeEvent } | { ok: false; reason: string };

/** How old an event may be before it's treated as a replay. Stripe suggests 5 minutes. */
export const TOLERANCE_SECONDS = 300;

/**
 * Verify and parse a webhook payload.
 *
 * `rawBody` must be the exact bytes Stripe sent. Parsing to JSON and
 * re-stringifying changes key order and whitespace, which changes the hash,
 * which fails every time — a classic and very confusing way to break this.
 */
export async function verifyWebhook(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  now: number = Math.floor(Date.now() / 1000),
): Promise<VerifyResult> {
  if (!secret) return { ok: false, reason: "No webhook signing secret is configured." };

  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed) return { ok: false, reason: "Malformed Stripe-Signature header." };

  // Reject anything too old. Without this, a signature captured once could be
  // replayed forever — the signature stays valid because the payload hasn't
  // changed.
  const age = now - parsed.timestamp;
  if (Math.abs(age) > TOLERANCE_SECONDS) {
    return { ok: false, reason: `Timestamp outside tolerance (${age}s).` };
  }

  const expected = await computeSignature(rawBody, secret, parsed.timestamp);
  const matched = parsed.signatures.some((candidate) => timingSafeEqual(candidate, expected));
  if (!matched) return { ok: false, reason: "Signature did not match." };

  try {
    return { ok: true, event: JSON.parse(rawBody) as StripeEvent };
  } catch {
    return { ok: false, reason: "Body was not valid JSON." };
  }
}

/* ------------------------------------------------------------ event shapes */

export type StripeEvent = {
  id: string;
  type: string;
  created: number;
  data: { object: Record<string, unknown> };
};

export const HANDLED_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
] as const;

export type HandledEvent = (typeof HANDLED_EVENTS)[number];

export function isHandled(type: string): type is HandledEvent {
  return (HANDLED_EVENTS as readonly string[]).includes(type);
}

/**
 * Stripe's subscription statuses, mapped to whether Pro is actually on.
 *
 * `past_due` deliberately keeps access: a card that failed on renewal is
 * usually a expired card, not a decision to leave. Stripe retries for days.
 * Cutting someone off the instant a retry fails would punish them for their
 * bank's timing, so they keep working and see a banner asking them to fix it.
 */
export const ACTIVE_STATUSES = ["active", "trialing", "past_due"] as const;
export const INACTIVE_STATUSES = [
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "paused",
] as const;

export type SubscriptionStatus =
  (typeof ACTIVE_STATUSES)[number] | (typeof INACTIVE_STATUSES)[number];

export function grantsPro(status: string | null | undefined): boolean {
  return (ACTIVE_STATUSES as readonly string[]).includes(status ?? "");
}

/** Whether to nag the customer to fix their card. */
export function needsAttention(status: string | null | undefined): boolean {
  return status === "past_due" || status === "unpaid" || status === "incomplete";
}

/** Pulls the fields worth storing out of a subscription object. */
export function readSubscription(object: Record<string, unknown>): {
  subscriptionId: string;
  customerId: string;
  status: string;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
} | null {
  const id = typeof object.id === "string" ? object.id : null;
  const customer =
    typeof object.customer === "string"
      ? object.customer
      : typeof (object.customer as { id?: string })?.id === "string"
        ? (object.customer as { id: string }).id
        : null;
  if (!id || !customer) return null;

  const items = object.items as
    | { data?: Array<{ price?: { id?: string }; current_period_end?: unknown }> }
    | undefined;
  const firstItem = items?.data?.[0];
  const priceId = firstItem?.price?.id ?? null;

  // Where the renewal date lives depends on the API version the webhook
  // endpoint is pinned to. Up to 2025-03-31 it sat on the subscription; after
  // that Stripe moved it onto each subscription item, because items can now be
  // billed on different cycles. Read both, newest shape first, so the stored
  // date doesn't silently become null if the endpoint's version is changed in
  // the dashboard — nothing in this app would throw, the renewal date would
  // just quietly stop appearing.
  const rawPeriodEnd =
    typeof firstItem?.current_period_end === "number"
      ? firstItem.current_period_end
      : typeof object.current_period_end === "number"
        ? object.current_period_end
        : null;

  const periodEnd = rawPeriodEnd === null ? null : new Date(rawPeriodEnd * 1000).toISOString();

  return {
    subscriptionId: id,
    customerId: customer,
    status: typeof object.status === "string" ? object.status : "incomplete",
    priceId,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: object.cancel_at_period_end === true,
  };
}
