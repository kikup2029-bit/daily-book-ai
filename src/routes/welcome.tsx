/**
 * The one-time Pro trial offer, shown straight after an account is created.
 *
 * A top-level route rather than an `_authenticated` child on purpose: this is a
 * single-panel screen with no app nav, so there is nothing on it competing with
 * the two things it asks. It still checks the session itself, the same way
 * _authenticated/route.tsx does.
 *
 * THE RULES THIS SCREEN IS BOUND BY, none of which are stylistic:
 *
 *   Both answers are buttons. Starting the trial and carrying on with Free are
 *   the same size, both above the fold, both plainly clickable. Free is not a
 *   grey whisper under the fold and its label does not shame anyone for picking
 *   it. A trial funnel where the way out is hidden is exactly what the FTC's
 *   negative-option rules exist to stop.
 *
 *   The disclosure appears before the card does. This trial takes a card up
 *   front, so the price, the exact date of the first charge and how to cancel
 *   have to be on screen before anyone clicks through to Stripe. That sentence
 *   is `billing.trialDisclosure`, shared with the paywall — one wording, so the
 *   two screens cannot drift into saying different things.
 *
 *   Nothing here is typed as a literal. The days come from TRIAL_DAYS, the
 *   price from PLANS.pro.priceCents, the date from firstChargeDate(). Change
 *   the config and this screen changes with it.
 *
 * Anyone who already has Pro or is already trialling is sent to their books
 * before this renders: the offer is made once, and never to someone who has
 * already taken it.
 */

import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Sparkles } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Alert, Panel, PanelBody } from "@/components/ui/kit";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { PLANS, TRIAL_DAYS, firstChargeDate, formatPrice } from "@/lib/pricing";
import { getSubscription, startCheckout } from "@/lib/subscriptions.functions";

export const Route = createFileRoute("/welcome")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Try Pro — SimpleBooks" }, { name: "robots", content: "noindex" }],
  }),
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    // Already paying, or already inside the trial: there is nothing to offer,
    // so don't show an offer. Sending them on is the honest outcome.
    const subscription = await getSubscription();
    if (subscription.isPro || subscription.isTrialing) throw redirect({ to: "/dashboard" });

    return { user: data.user };
  },
  component: WelcomePage,
});

function WelcomePage() {
  const { t, tag } = useI18n();
  const navigate = useNavigate();
  const checkout = useServerFn(startCheckout);

  const start = useMutation({
    mutationFn: () => checkout({ data: { plan: "pro" as const, origin: window.location.origin } }),
    onSuccess: (result) => {
      window.location.href = result.url;
    },
  });

  const price = formatPrice(PLANS.pro.priceCents, tag);
  // The exact day the first charge lands, written in the reader's own calendar
  // wording. It goes into the disclosure as a value, never glued onto the end.
  const chargeDate = new Intl.DateTimeFormat(tag, { day: "numeric", month: "long" }).format(
    firstChargeDate(),
  );

  return (
    <div className="screen-y flex min-h-screen flex-col items-center justify-center bg-background px-4 sm:px-6">
      <div className="rise w-full max-w-lg">
        <div className="mb-7 flex items-center justify-center gap-3">
          <BrandMark size={38} />
          <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">
            SimpleBooks
          </span>
        </div>

        <Panel className="floating">
          <PanelBody className="px-6 py-8 text-center sm:px-8">
            <span
              aria-hidden="true"
              className="mx-auto flex size-11 items-center justify-center rounded-full border border-brand-border bg-brand-soft text-brand"
            >
              <Sparkles className="size-5" />
            </span>

            <h1 className="font-display mt-5 text-[24px] leading-tight tracking-[-0.01em]">
              {t("billing.welcomeTitle")}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
              {t("billing.welcomeBody", { count: TRIAL_DAYS })}
            </p>

            {/* What Pro actually is, in the same words the pricing page uses. */}
            <ul className="mx-auto mt-6 max-w-xs space-y-2 text-left">
              {PLANS.pro.bullets.slice(0, 5).map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-[13px]">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  <span className="text-muted-foreground">{bullet}</span>
                </li>
              ))}
            </ul>

            {start.isError ? (
              <div className="mt-6 text-left">
                <Alert tone="negative" title={t("billing.checkoutFailed")}>
                  {start.error instanceof Error && start.error.message
                    ? start.error.message
                    : t("billing.genericError")}
                </Alert>
              </div>
            ) : null}

            {/*
              Two buttons, one row, same size. The brand colour marks which one
              we're recommending; it does not make the other one hard to find.
            */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                variant="brand"
                size="lg"
                className="w-full sm:w-auto sm:min-w-56"
                loading={start.isPending}
                onClick={() => start.mutate()}
              >
                {t("billing.welcomeStartTrial", { count: TRIAL_DAYS })}
              </Button>

              {/*
                Never disabled, not even while checkout is opening. The way
                out of a trial offer does not get to be unavailable, however
                briefly, and a click here is an answer we should take.
              */}
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => navigate({ to: "/dashboard" })}
              >
                {t("billing.welcomeContinueFree")}
              </Button>
            </div>

            <p className="mx-auto mt-4 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
              {t("billing.welcomeFinePrint", { count: TRIAL_DAYS, price })}
            </p>

            {/*
              The legally load-bearing sentence, shared with the paywall: the
              amount, the exact date of the first charge, and that cancelling
              before then costs nothing. It sits here, before Stripe, because
              after the card is typed is too late for it to be a disclosure.
            */}
            <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
              {t("billing.trialDisclosure", { count: TRIAL_DAYS, date: chargeDate, price })}
            </p>
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
