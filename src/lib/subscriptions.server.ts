/**
 * Who is on which plan.
 *
 * The rule the whole payment flow rests on: this table is written ONLY from a
 * verified Stripe webhook, using the service role. Nothing a browser sends can
 * change it. A success-page redirect is a hint that checkout finished, never
 * proof that money moved — the customer's browser is not a trustworthy source
 * of "I paid".
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { PLANS, type Feature, type PlanId } from "./pricing";
import { grantsPro, needsAttention, readSubscription } from "./stripe/webhook";

type Client = SupabaseClient<Database>;
// The subscriptions table is newer than the generated types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const table = (supabase: Client) => (supabase as any).from("subscriptions");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const events = (supabase: Client) => (supabase as any).from("stripe_events");

export type Subscription = {
  plan: PlanId;
  status: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  /** Derived, never stored: does this person get Pro right now? */
  isPro: boolean;
  /** Derived: should we ask them to fix a payment problem? */
  needsAttention: boolean;
  /**
   * Inside the free trial — full Pro access, nothing charged yet.
   *
   * Kept separate from isPro because the two need opposite messages: a paying
   * customer should be left alone, a trialling one has to be told the date and
   * the amount of the charge that is coming.
   */
  isTrialing: boolean;
  /**
   * When the trial ends and the first charge lands.
   *
   * Read from current_period_end rather than a column of its own: during a
   * trial Stripe sets the period end to the trial end, so the value is already
   * there and no migration is needed to show a countdown.
   */
  trialEndsAt: string | null;
};

export const FREE_SUBSCRIPTION: Subscription = {
  plan: "free",
  status: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  isPro: false,
  needsAttention: false,
  isTrialing: false,
  trialEndsAt: null,
};

/**
 * The current subscription, or the free plan.
 *
 * Everyone has a plan — someone who has never paid is on `free`, not in an
 * error state. Missing table, missing row and missing Stripe all resolve to
 * free rather than throwing, so a billing problem can never lock someone out
 * of the bookkeeping they already did.
 */
export async function fetchSubscription(supabase: Client, userId: string): Promise<Subscription> {
  try {
    const { data, error } = await table(supabase)
      .select(
        "plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, cancel_at_period_end",
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return FREE_SUBSCRIPTION;

    const row = data as {
      plan: string;
      status: string | null;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      current_period_end: string | null;
      cancel_at_period_end: boolean | null;
    };

    const active = grantsPro(row.status);

    return {
      // Trust the status over the stored plan name. If a subscription lapsed
      // and the plan column somehow still says "pro", the status is the
      // authority and the answer is free.
      plan: active && row.plan === "pro" ? "pro" : "free",
      status: row.status,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end === true,
      isPro: active && row.plan === "pro",
      needsAttention: needsAttention(row.status),
      isTrialing: row.status === "trialing",
      trialEndsAt: row.status === "trialing" ? row.current_period_end : null,
    };
  } catch {
    return FREE_SUBSCRIPTION;
  }
}

/** Whether the account may use a Pro-only feature. Server-side only. */
export async function hasFeature(
  supabase: Client,
  userId: string,
  feature: (typeof PLANS.pro.features)[number],
): Promise<boolean> {
  const subscription = await fetchSubscription(supabase, userId);
  return PLANS[subscription.plan].features.includes(feature);
}

/**
 * Refuses the request unless the account may use a Pro-only feature.
 *
 * The other half of <ProGate>. That component decides what to *draw*; this
 * decides what may actually be read or written, and it is the only one of the
 * two an attacker has to get past — a browser can be told to render anything,
 * but it cannot make this function return.
 *
 * Throws rather than returning a boolean so the check cannot be written and
 * then quietly ignored: the calling handler either awaits this and stops, or
 * doesn't call it at all, which is visible in review.
 */
export async function requireFeature(
  supabase: Client,
  userId: string,
  feature: Feature,
): Promise<void> {
  if (await hasFeature(supabase, userId, feature)) return;
  throw new Error("That is part of Pro. Start the free trial to use it.");
}

/* --------------------------------------------------------- webhook writes */

/**
 * Records that an event has been handled.
 *
 * Returns false if it was already recorded, which is the whole idempotency
 * mechanism: Stripe retries until it gets a 2xx and can deliver the same event
 * more than once even after success. Without this, a repeated
 * `customer.subscription.deleted` could stamp on a fresh subscription created
 * in between.
 */
export async function claimEvent(
  admin: Client,
  eventId: string,
  eventType: string,
): Promise<boolean> {
  const { error } = await events(admin).insert({ id: eventId, type: eventType });
  if (!error) return true;
  // 23505 is a unique violation: we've seen this event already.
  const code = (error as { code?: string }).code;
  if (code === "23505") return false;
  throw new Error(error.message);
}

/** Links a Stripe customer to a user, before any subscription exists. */
export async function linkCustomer(
  admin: Client,
  userId: string,
  customerId: string,
): Promise<void> {
  const { error } = await table(admin).upsert(
    { user_id: userId, stripe_customer_id: customerId },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
}

/**
 * Writes subscription state from a verified webhook.
 *
 * The user is found by the metadata Stripe carries on the subscription, with
 * the customer id as a fallback for subscriptions created outside this app
 * (a manual one made in the Stripe dashboard, say).
 */
export async function applySubscriptionEvent(
  admin: Client,
  object: Record<string, unknown>,
): Promise<{ applied: boolean; reason?: string }> {
  const parsed = readSubscription(object);
  if (!parsed) return { applied: false, reason: "Event had no usable subscription object." };

  const metadata = (object.metadata ?? {}) as Record<string, unknown>;
  let userId = typeof metadata.supabase_user_id === "string" ? metadata.supabase_user_id : null;

  if (!userId) {
    const { data } = await table(admin)
      .select("user_id")
      .eq("stripe_customer_id", parsed.customerId)
      .maybeSingle();
    userId = (data as { user_id?: string } | null)?.user_id ?? null;
  }

  if (!userId) {
    return { applied: false, reason: `No account matches customer ${parsed.customerId}.` };
  }

  // Pro only while the status says so. A deleted or unpaid subscription lands
  // back on free, which is what actually removes the features.
  const plan: PlanId = grantsPro(parsed.status) ? "pro" : "free";

  const { error } = await table(admin).upsert(
    {
      user_id: userId,
      stripe_customer_id: parsed.customerId,
      stripe_subscription_id: parsed.subscriptionId,
      plan,
      status: parsed.status,
      current_period_end: parsed.currentPeriodEnd,
      cancel_at_period_end: parsed.cancelAtPeriodEnd,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);

  return { applied: true };
}

/** A failed renewal. Keeps access — Stripe will retry for days. */
export async function markPaymentFailed(
  admin: Client,
  customerId: string,
): Promise<{ applied: boolean }> {
  const { error } = await table(admin)
    .update({ status: "past_due" })
    .eq("stripe_customer_id", customerId);
  if (error) throw new Error(error.message);
  return { applied: true };
}
