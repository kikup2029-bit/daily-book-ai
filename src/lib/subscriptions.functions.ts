import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Reading and starting a subscription.
 *
 * Every one of these runs behind `requireSupabaseAuth`, so there is no path to
 * checkout without a signed-in account. That isn't only a product decision: a
 * Stripe customer has to be tied to a user, or a completed payment has nobody
 * to grant Pro to.
 */

export const getSubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchSubscription } = await import("./subscriptions.server");
    return fetchSubscription(context.supabase, context.userId);
  });

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        // Only the plan id crosses the wire. Never a price or an amount —
        // anything the browser can name, the browser can change.
        plan: z.literal("pro"),
        origin: z.string().url(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { PLANS } = await import("./pricing");
    const { createCheckoutSession, findOrCreateCustomer, runtimeValue } =
      await import("./stripe/client.server");
    const { fetchSubscription } = await import("./subscriptions.server");
    const { createServerSupabaseAdmin } = await import("./supabase-admin.server");
    const { linkCustomer } = await import("./subscriptions.server");

    const plan = PLANS[data.plan];
    const priceEnvVar = plan.stripePriceEnvVar;
    if (!priceEnvVar) throw new Error("That plan can't be bought.");

    // The Price id comes from the server environment, so the amount charged is
    // fixed by configuration rather than by whatever the page posted.
    // Same reader the Stripe keys use. It checks process.env, __env__ and env,
    // because which of the three holds a Cloudflare binding depends on the
    // request path — this used to read process.env only, and reported a
    // correctly-set variable as missing whenever the value landed elsewhere.
    // Environment first, committed fallback second. The fallback is a public
    // Price id, not a credential — see the note on stripePriceFallback. It is
    // here so a deploy pipeline that drops plain-text variables cannot stop
    // anyone from paying.
    const priceId = runtimeValue(priceEnvVar) ?? plan.stripePriceFallback;
    if (!priceId) {
      throw new Error(
        `No Stripe Price is configured for ${plan.name}. Set ${priceEnvVar}, or put the id in stripePriceFallback in pricing.ts.`,
      );
    }

    const existing = await fetchSubscription(context.supabase, context.userId);

    // Already paying: send them to the portal instead of selling twice.
    if (existing.isPro) {
      throw new Error("You're already on Pro. Use Manage billing to make changes.");
    }

    // The middleware supplies the verified JWT claims; the email lives there.
    const email = (context.claims as { email?: string } | undefined)?.email;
    if (!email) throw new Error("Your account has no email address, so checkout can't start.");

    const customerId = await findOrCreateCustomer({
      userId: context.userId,
      email,
      existingCustomerId: existing.stripeCustomerId,
    });

    // Remember the customer now, so a webhook that arrives before the success
    // page still finds the account.
    if (customerId !== existing.stripeCustomerId) {
      const admin = createServerSupabaseAdmin();
      await linkCustomer(admin, context.userId, customerId);
    }

    const { TRIAL_DAYS } = await import("./pricing");

    // One trial per account, ever.
    //
    // A stored subscription id means this person has subscribed before — they
    // took the trial, then cancelled or lapsed. Without this check, cancelling
    // and re-subscribing would hand out another free week every time, and the
    // app would never charge anyone who noticed.
    const hadTrialBefore = existing.stripeSubscriptionId !== null;
    const trialDays = hadTrialBefore ? 0 : TRIAL_DAYS;

    const session = await createCheckoutSession({
      customerId,
      priceId,
      userId: context.userId,
      trialDays,
      successUrl: `${data.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${data.origin}/billing/cancelled`,
    });

    return { url: session.url, trialDays };
  });

export const openBillingPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ origin: z.string().url() }).parse(data))
  .handler(async ({ data, context }) => {
    const { createPortalSession } = await import("./stripe/client.server");
    const { fetchSubscription } = await import("./subscriptions.server");

    const subscription = await fetchSubscription(context.supabase, context.userId);
    if (!subscription.stripeCustomerId) {
      throw new Error("There's no billing account to manage yet.");
    }

    const session = await createPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl: `${data.origin}/billing`,
    });
    return { url: session.url };
  });
