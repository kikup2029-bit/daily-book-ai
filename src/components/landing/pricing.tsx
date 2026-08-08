/**
 * The two plans: the money from pricing.ts, the words from the dictionary.
 *
 * Nothing here knows what a plan costs — the price, the trial length and which
 * card is featured all come from PLAN_LIST, so changing a price in one file
 * moves this page with it. That is the only way a pricing page and a Stripe
 * subscription stay honest with each other, and it is why the numbers are
 * passed into the copy as {placeholders} rather than typed into six
 * dictionaries where they would quietly go stale.
 *
 * The *words* — plan name, tagline, cadence, bullets, button — are keyed off
 * `plan.id` instead of read from PLAN_LIST, because a marketing page that only
 * sells in English defeats the point of the product. Adding a bullet in
 * pricing.ts therefore also needs a key in PLAN_COPY below, or it won't show
 * here.
 *
 * Both buttons go to sign-up rather than to checkout: there's nothing to attach
 * a subscription to until there's an account.
 */

import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { LOCALE_LIST, useI18n } from "@/lib/i18n";
import { PLAN_LIST, TRIAL_DAYS, formatPrice, type PlanId } from "@/lib/pricing";
import { Badge } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Section, SectionHeading } from "@/components/landing/section";

/**
 * Which key holds which line of a plan card.
 *
 * Key *names*, not text, so this can safely be a module constant — nothing here
 * is resolved until `t` runs inside the component.
 */
const PLAN_COPY: Record<
  PlanId,
  { name: string; tagline: string; cadence: string; cta: string; bullets: string[] }
> = {
  free: {
    name: "landing.planFreeName",
    tagline: "landing.planFreeTagline",
    cadence: "landing.planFreeCadence",
    cta: "landing.planFreeCta",
    bullets: [
      "landing.planFreeBulletLog",
      "landing.planFreeBulletTotals",
      "landing.planFreeBulletExports",
      "landing.planFreeBulletLanguages",
    ],
  },
  pro: {
    name: "landing.planProName",
    tagline: "landing.planProTagline",
    cadence: "landing.planProCadence",
    cta: "landing.planProCta",
    bullets: [
      "landing.planProBulletSearch",
      "landing.planProBulletInsights",
      "landing.planProBulletCashTools",
      "landing.planProBulletBills",
      "landing.planProBulletAsk",
      "landing.planProBulletReceipts",
      "landing.planProBulletInvoices",
      "landing.planProBulletReminder",
      "landing.planProBulletSharing",
      "landing.planProBulletOffline",
      "landing.planProBulletExports",
      "landing.planProBulletLanguages",
    ],
  },
};

export function Pricing() {
  // Digit grouping and the decimal mark follow the reader's language; the
  // currency stays USD, exactly as it does everywhere else in the app.
  const { t, tag } = useI18n();

  return (
    <Section id="pricing" labelledBy="pricing-heading" className="bg-surface-2">
      <SectionHeading
        id="pricing-heading"
        eyebrow={t("landing.pricingEyebrow")}
        title={t("landing.pricingTitle", { count: TRIAL_DAYS })}
        description={t("landing.pricingDescription", { day: TRIAL_DAYS + 1 })}
      />

      <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
        {PLAN_LIST.map((plan) => {
          const copy = PLAN_COPY[plan.id];

          return (
            <div
              key={plan.id}
              className={cn(
                "panel relative flex flex-col p-6",
                plan.featured && "border-brand-border shadow-[var(--shadow-md)]",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[17px] leading-tight">{t(copy.name)}</h3>
                {plan.featured ? (
                  <Badge tone="brand">{t("landing.pricingMostPopular")}</Badge>
                ) : null}
              </div>

              {/* The trial length reaches the tagline as a placeholder, so it
                stays a single source of truth in pricing.ts. */}
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                {t(copy.tagline, { count: TRIAL_DAYS })}
              </p>

              <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
                <span className="figure text-[34px]">
                  {/* formatPrice returns the English word "Free" at zero, which
                    is the one part of it that isn't a number. */}
                  {plan.priceCents === 0
                    ? t("landing.priceFree")
                    : formatPrice(plan.priceCents, tag)}
                </span>
                <span className="text-[13px] text-muted-foreground">{t(copy.cadence)}</span>
              </p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {copy.bullets.map((bulletKey) => (
                  <li key={bulletKey} className="flex gap-2.5 text-[14px] leading-snug">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    {/*
                      count is passed to every bullet, and used by the one that
                      names how many languages there are. Interpolation ignores
                      values a string doesn't reference, so this costs nothing
                      on the others — and it means the number can't drift from
                      LOCALE_LIST the way the hard-coded "six" did.
                    */}
                    <span>{t(bulletKey, { count: LOCALE_LIST.length })}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.featured ? "brand" : "outline"}
                size="lg"
                className="mt-6 w-full"
              >
                <Link to="/auth">{t(copy.cta, { count: TRIAL_DAYS })}</Link>
              </Button>
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-6 max-w-md text-center text-[13px] text-muted-foreground">
        {t("landing.pricingNote")}
      </p>
    </Section>
  );
}
