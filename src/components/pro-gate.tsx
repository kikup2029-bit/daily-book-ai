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
import { PLANS, TRIAL_DAYS, firstChargeDate, formatPrice, type Feature } from "@/lib/pricing";
import { startCheckout } from "@/lib/subscriptions.functions";
import { useHasFeature } from "@/lib/use-subscription";

export function ProGate({
  feature,
  title,
  children,
}: {
  feature: Feature;
  /**
   * What this screen is for, as a DICTIONARY KEY — "nav.findEntry", not "Find
   * an entry".
   *
   * It has to be a key, because it is resolved here and dropped into a
   * translated sentence. English passed straight through produced a paywall
   * that read "Budgets is part of Pro" in the middle of an otherwise Gujarati
   * page: the one screen in the app asking for a card, and the only one not
   * speaking the reader's language. The `nav.*` keys already exist in all six
   * languages and already name these screens, so reuse those.
   */
  title: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
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
            <p className="sr-only">{t("billing.checkingPlan")}</p>
          </PanelBody>
        </Panel>
      </div>
    );
  }

  if (allowed) return <>{children}</>;

  // Resolved once, here, so no caller can hand the panel a bare English string.
  return <UpgradePanel title={t(title)} usedTrial={subscription?.stripeSubscriptionId != null} />;
}

/** Takes an already-translated name, not a key — ProGate resolves it above. */
function UpgradePanel({ title, usedTrial }: { title: string; usedTrial: boolean }) {
  const { t, tag } = useI18n();
  const checkout = useServerFn(startCheckout);

  const start = useMutation({
    mutationFn: () => checkout({ data: { plan: "pro" as const, origin: window.location.origin } }),
    onSuccess: (result) => {
      window.location.href = result.url;
    },
  });

  const price = formatPrice(PLANS.pro.priceCents, tag);
  // The day the first charge lands, spelled out in the reader's own calendar
  // wording. It goes into the disclosure sentence as a value, never glued on
  // the end of one.
  const chargeDate = new Intl.DateTimeFormat(tag, { day: "numeric", month: "long" }).format(
    firstChargeDate(),
  );

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
            {t("billing.featureIsPro", { feature: title })}
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
            {usedTrial
              ? t("billing.trialUsed", { price })
              : t("billing.tryFree", { count: TRIAL_DAYS })}
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
              <Alert tone="negative" title={t("billing.checkoutFailed")}>
                {start.error instanceof Error && start.error.message
                  ? start.error.message
                  : t("billing.genericError")}
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
            {usedTrial
              ? t("billing.getPro", { price })
              : t("billing.startTrial", { count: TRIAL_DAYS })}
          </Button>

          {/*
            The disclosure sits under the button, before any card is typed.
            This is the legally load-bearing sentence for a card-up-front
            trial: price, date of the first charge, and how to avoid it.
          */}
          {!usedTrial ? (
            <p className="mx-auto mt-3 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
              {t("billing.trialDisclosure", { count: TRIAL_DAYS, date: chargeDate, price })}
            </p>
          ) : null}

          {/*
            Two whole sentences, not one sentence with a link buried in it. A
            fragment lifted out of the middle of an English sentence ends up
            somewhere else entirely once the sentence is translated.
          */}
          <p className="mt-5 text-[12px] text-muted-foreground">
            {t("billing.recordsStay")}{" "}
            <Link to="/export" className="text-brand hover:underline">
              {t("billing.exportsAlwaysWork")}
            </Link>
          </p>
        </PanelBody>
      </Panel>
    </div>
  );
}
