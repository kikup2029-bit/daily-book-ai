/**
 * The paywall.
 *
 * Wraps a page. If the account has the feature, the page renders untouched; if
 * not, the body is replaced by a panel explaining what this screen does and one
 * button to start the trial.
 *
 * TWO THINGS THIS IS NOT:
 *
 * It is not security. `useHasFeature` reads a copy of the subscription that
 * already lives in the browser, and anything in a browser can be edited. The
 * server has to refuse the same request independently — see hasFeature() in
 * subscriptions.server.ts. If deleting this component would let someone get a
 * paid feature, the real check is missing.
 *
 * It is not a dead end. Every gate keeps a way out: the nav still works, and
 * exports are never gated, so a lapsed customer can always take their books
 * elsewhere. A bookkeeping app that locks people away from their own records
 * has stopped being a bookkeeping app.
 */

import type { ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, Panel, PanelBody } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import { PLANS, TRIAL_DAYS, formatPrice, trialDisclosure, type Feature } from "@/lib/pricing";
import { startCheckout } from "@/lib/subscriptions.functions";
import { useHasFeature } from "@/lib/use-subscription";

export function ProGate({
  feature,
  title,
  children,
}: {
  feature: Feature;
  /** What this screen is for, in the person's own terms. */
  title: string;
  children: ReactNode;
}) {
  const { allowed, loading, subscription } = useHasFeature(feature);

  // While the plan is still loading, show nothing rather than a paywall that
  // flashes away a moment later — that reads as a bug, or worse, as a trick.
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Panel>
          <PanelBody className="pt-5">
            <span className="skeleton block h-4 w-28" aria-hidden="true" />
            <span className="skeleton mt-3 block h-8 w-48" aria-hidden="true" />
            <p className="sr-only">Checking your plan.</p>
          </PanelBody>
        </Panel>
      </div>
    );
  }

  if (allowed) return <>{children}</>;

  return <UpgradePanel title={title} usedTrial={subscription?.stripeSubscriptionId != null} />;
}

function UpgradePanel({ title, usedTrial }: { title: string; usedTrial: boolean }) {
  const { tag } = useI18n();
  const checkout = useServerFn(startCheckout);

  const start = useMutation({
    mutationFn: () => checkout({ data: { plan: "pro" as const, origin: window.location.origin } }),
    onSuccess: (result) => {
      window.location.href = result.url;
    },
  });

  const price = formatPrice(PLANS.pro.priceCents, tag);

  return (
    <div className="rise mx-auto w-full max-w-xl py-6">
      <Panel className="floating">
        <PanelBody className="px-6 py-8 text-center sm:px-8">
          <span
            aria-hidden="true"
            className="mx-auto flex size-11 items-center justify-center rounded-full border border-brand-border bg-brand-soft text-brand"
          >
            <Lock className="size-5" />
          </span>

          <h2 className="font-display mt-5 text-[22px] leading-tight tracking-[-0.01em]">
            {title} is part of Pro
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
            {usedTrial
              ? `You've already had your free days. Pro is ${price} a month and you can cancel whenever you like.`
              : `Try it free for ${TRIAL_DAYS} days along with everything else in Pro.`}
          </p>

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
              <Alert tone="negative" title="Checkout couldn't be started">
                {start.error instanceof Error && start.error.message
                  ? start.error.message
                  : "Something went wrong on our end. Nothing was charged."}
              </Alert>
            </div>
          ) : null}

          <Button
            variant="brand"
            size="lg"
            className="mt-7 w-full sm:w-auto sm:min-w-56"
            loading={start.isPending}
            onClick={() => start.mutate()}
          >
            {usedTrial ? `Get Pro — ${price} a month` : PLANS.pro.cta}
          </Button>

          {/*
            The disclosure sits under the button, before any card is typed.
            This is the legally load-bearing sentence for a card-up-front
            trial: price, date of the first charge, and how to avoid it.
          */}
          {!usedTrial ? (
            <p className="mx-auto mt-3 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
              {trialDisclosure(tag)}
            </p>
          ) : null}

          <p className="mt-5 text-[12px] text-muted-foreground">
            Your existing records stay where they are, and{" "}
            <Link to="/export" className="text-brand hover:underline">
              exports always work
            </Link>{" "}
            — on any plan.
          </p>
        </PanelBody>
      </Panel>
    </div>
  );
}
