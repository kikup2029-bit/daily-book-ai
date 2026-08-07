/**
 * The trial countdown.
 *
 * This strip is not marketing. When a card is taken up front and charged
 * automatically, the person has to be able to see — without going looking —
 * what they will be charged, when, and how to stop it. That is what makes the
 * arrangement lawful in the US, and it is also what stops a forgotten trial
 * turning into a chargeback and a one-star review.
 *
 * So it is deliberately awkward to get rid of: it can be collapsed for the rest
 * of the day, never permanently, and on the final day it cannot be dismissed at
 * all. The one moment someone most wants this out of the way is the moment they
 * most need to see it.
 */

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { PLANS, formatPrice, trialDaysLeft } from "@/lib/pricing";
import { useSubscription } from "@/lib/use-subscription";

/** Dismissal is stored per-day, so tomorrow it comes back. */
const DISMISS_KEY = "simplebooks.trial-banner-hidden-on";

const today = () => new Date().toISOString().slice(0, 10);

export function TrialBanner() {
  const { data: subscription } = useSubscription();
  const { t, tag, formatDate } = useI18n();
  const [hidden, setHidden] = useState(true);

  const daysLeft = trialDaysLeft(subscription?.trialEndsAt ?? null);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(DISMISS_KEY) === today());
    } catch {
      // Can't read the choice, so show it. Erring towards disclosure.
      setHidden(false);
    }
  }, []);

  if (!subscription?.isTrialing || daysLeft === null) return null;

  // The last day is not dismissible. Tomorrow the card gets charged.
  const canDismiss = daysLeft > 1;
  if (hidden && canDismiss) return null;

  const price = formatPrice(PLANS.pro.priceCents, tag);
  const chargeDate = subscription.trialEndsAt
    ? formatDate(subscription.trialEndsAt.slice(0, 10))
    : null;

  const urgent = daysLeft <= 1;

  return (
    <div className={`border-b ${urgent ? "bg-warning-soft" : "bg-surface-2"}`}>
      <div className="mx-auto w-full max-w-4xl px-4 py-2 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
          <span className="font-semibold">
            {daysLeft === 0
              ? t("billing.trialEndsToday")
              : daysLeft === 1
                ? t("billing.trialLastDay")
                : t("billing.trialDaysLeft", { count: daysLeft })}
          </span>

          {/* The amount and the date, always together — a date with no amount
              is not a disclosure, and neither is an amount with no date. Both
              sit inside one sentence, so a translation can put them wherever
              its own grammar needs them. */}
          <span className="min-w-0 text-muted-foreground">
            {chargeDate
              ? t("billing.cardChargedOn", { price, date: chargeDate })
              : t("billing.thenPricePerMonth", { price })}
          </span>

          <Link
            to="/billing"
            className="ml-auto shrink-0 rounded-[var(--radius-8)] px-2 py-1 font-medium text-brand transition-colors duration-[var(--dur-fast)] hover:bg-foreground/10"
          >
            {t("billing.manageOrCancel")}
          </Link>

          {canDismiss ? (
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem(DISMISS_KEY, today());
                } catch {
                  // Not remembering means it stays visible. Acceptable.
                }
                setHidden(true);
              }}
              className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-8)] text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-foreground/10 hover:text-foreground"
              aria-label={t("billing.hideUntilTomorrow")}
              title={t("billing.hideUntilTomorrow")}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
