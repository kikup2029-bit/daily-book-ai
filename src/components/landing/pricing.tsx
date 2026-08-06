/**
 * The two plans, read straight out of pricing.ts.
 *
 * Nothing here knows what a plan costs or what's in it — the price, the
 * cadence, the bullets, the button label and which card is featured all come
 * from PLAN_LIST. Change the price in one file and this page follows, which is
 * the only way a pricing page and a Stripe subscription stay honest with each
 * other.
 *
 * Both buttons go to sign-up rather than to checkout: there's nothing to attach
 * a subscription to until there's an account.
 */

import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { PLAN_LIST, formatPrice } from "@/lib/pricing";
import { Badge } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Section, SectionHeading } from "@/components/landing/section";

export function Pricing() {
  // Digit grouping and the decimal mark follow the reader's language; the
  // currency stays USD, exactly as it does everywhere else in the app.
  const { tag } = useI18n();

  return (
    <Section id="pricing" labelledBy="pricing-heading" className="bg-surface-2">
      <SectionHeading
        id="pricing-heading"
        eyebrow="Pricing"
        title="Start free. Move up only if it earns its keep"
        description="No trial that expires on you and nothing to cancel if you stay on the free plan."
      />

      <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
        {PLAN_LIST.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "panel relative flex flex-col p-6",
              plan.featured && "border-brand-border shadow-[var(--shadow-md)]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[17px] leading-tight">{plan.name}</h3>
              {plan.featured ? <Badge tone="brand">Most popular</Badge> : null}
            </div>

            <p className="mt-1.5 text-[13px] text-muted-foreground">{plan.tagline}</p>

            <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
              <span className="figure text-[34px]">{formatPrice(plan.priceCents, tag)}</span>
              <span className="text-[13px] text-muted-foreground">{plan.cadence}</span>
            </p>

            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2.5 text-[14px] leading-snug">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              variant={plan.featured ? "brand" : "outline"}
              size="lg"
              className="mt-6 w-full"
            >
              <Link to="/auth">{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-6 max-w-md text-center text-[13px] text-muted-foreground">
        Both buttons take you to sign-up first — an account has to exist before there&rsquo;s
        anything to bill. Prices are in US dollars.
      </p>
    </Section>
  );
}
