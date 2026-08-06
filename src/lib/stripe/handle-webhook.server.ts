/**
 * The webhook endpoint.
 *
 * This is the only thing that may grant or remove Pro. It is a public URL, so
 * the order of operations matters and is deliberate:
 *
 *   1. Verify the signature against the raw body. Nothing else happens first.
 *   2. Claim the event id. A replay stops here.
 *   3. Apply the change with the service role.
 *   4. Return 200 so Stripe stops retrying.
 *
 * Returning 200 for an event we chose not to handle is intentional — a 4xx
 * would make Stripe retry forever for something that will never succeed.
 */

import { applySubscriptionEvent, claimEvent, markPaymentFailed } from "../subscriptions.server";
import { createServerSupabaseAdmin } from "../supabase-admin.server";
import { fetchSubscription as fetchStripeSubscription, stripeWebhookSecret } from "./client.server";
import { isHandled, verifyWebhook, type StripeEvent } from "./webhook";

export const WEBHOOK_PATH = "/api/stripe/webhook";

export async function handleStripeWebhook(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = request.headers.get("stripe-signature") ?? "";

  // The exact bytes Stripe sent. Parsing and re-serialising would change the
  // hash and fail every signature check.
  const rawBody = await request.text();

  let secret: string;
  try {
    secret = stripeWebhookSecret();
  } catch (error) {
    // Misconfiguration, not a bad request. 500 so Stripe retries once it's fixed.
    console.error("[stripe] webhook secret missing", error);
    return new Response("Webhook not configured", { status: 500 });
  }

  const verified = await verifyWebhook(rawBody, signature, secret);
  if (!verified.ok) {
    // Deliberately terse: a detailed reason would help someone probing the
    // endpoint work out how to forge a signature.
    console.warn("[stripe] rejected webhook:", verified.reason);
    return new Response("Invalid signature", { status: 400 });
  }

  const event = verified.event;

  if (!isHandled(event.type)) {
    return new Response(JSON.stringify({ received: true, ignored: event.type }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  let admin;
  try {
    admin = createServerSupabaseAdmin();
  } catch (error) {
    console.error("[stripe] no service role key", error);
    return new Response("Server not configured", { status: 500 });
  }

  try {
    const fresh = await claimEvent(admin, event.id, event.type);
    if (!fresh) {
      // Already processed. Say yes so Stripe stops.
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    await applyEvent(admin, event);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // 500 makes Stripe retry, which is what we want for a transient database
    // problem. The event id is already claimed, so the retry will be treated
    // as a duplicate — see the note in the test file about that trade-off.
    console.error("[stripe] failed to apply", event.type, error);
    return new Response("Failed to process", { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function applyEvent(admin: any, event: StripeEvent): Promise<void> {
  const object = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      // The session itself carries little about the subscription, so fetch the
      // real one from Stripe rather than trusting anything in the redirect.
      const subscriptionId = typeof object.subscription === "string" ? object.subscription : null;
      if (!subscriptionId) return;

      const subscription = await fetchStripeSubscription(subscriptionId);
      // Carry the user id across in case the subscription object lacks it.
      const sessionMetadata = (object.metadata ?? {}) as Record<string, unknown>;
      const merged = {
        ...subscription,
        metadata: { ...(subscription.metadata as object), ...sessionMetadata },
      };
      await applySubscriptionEvent(admin, merged);
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await applySubscriptionEvent(admin, object);
      return;
    }

    case "invoice.payment_failed": {
      const customerId = typeof object.customer === "string" ? object.customer : null;
      if (customerId) await markPaymentFailed(admin, customerId);
      return;
    }
  }
}
