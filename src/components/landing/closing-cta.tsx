/**
 * The last thing on the page.
 *
 * Someone who has read as far as the FAQ has already decided; making them
 * scroll back to the top to act on it is a needless obstacle.
 */

import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { TRIAL_DAYS } from "@/lib/pricing";

import { Section } from "@/components/landing/section";

export function ClosingCta() {
  const { t } = useI18n();

  return (
    <Section labelledBy="closing-cta-heading" className="bg-surface-2">
      <div className="mx-auto max-w-xl text-center">
        <h2 id="closing-cta-heading" className="text-[24px] leading-tight sm:text-[30px]">
          {t("landing.closingTitle")}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {/* The trial length still comes from pricing.ts — as a placeholder,
              so it can't go stale in six dictionaries. */}
          {t("landing.closingBody", { count: TRIAL_DAYS })}
        </p>
        <div className="mt-7 flex justify-center">
          <Button asChild variant="brand" size="lg">
            {/* Account creation, not checkout — see the note in hero.tsx. */}
            <Link to="/auth">{t("landing.startFree")}</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
