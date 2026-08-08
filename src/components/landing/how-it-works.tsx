/**
 * Three steps, and genuinely three.
 *
 * The number is the promise: someone deciding whether this is worth the effort
 * counts the steps before reading them.
 */

import { useMemo } from "react";

import { useI18n } from "@/lib/i18n";
import type { Translator } from "@/lib/i18n/translate";

import { Section, SectionHeading } from "@/components/landing/section";

/** Built per render from `t` — a module constant would freeze one language. */
function steps(t: Translator) {
  return [
    { id: "log", title: t("landing.stepLogTitle"), body: t("landing.stepLogBody") },
    { id: "see", title: t("landing.stepSeeTitle"), body: t("landing.stepSeeBody") },
    { id: "ask", title: t("landing.stepAskTitle"), body: t("landing.stepAskBody") },
  ];
}

export function HowItWorks() {
  const { t } = useI18n();
  const items = useMemo(() => steps(t), [t]);

  return (
    <Section id="how-it-works" labelledBy="how-it-works-heading">
      <SectionHeading
        id="how-it-works-heading"
        eyebrow={t("landing.howItWorksEyebrow")}
        title={t("landing.howItWorksTitle")}
        description={t("landing.howItWorksDescription")}
      />

      <ol className="mt-10 grid gap-6 sm:grid-cols-3">
        {items.map((step, index) => (
          <li key={step.id} className="panel p-5">
            <span
              className="figure flex size-9 items-center justify-center rounded-full bg-brand text-[15px] text-brand-foreground"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <h3 className="mt-4 text-[16px] leading-tight">
              {/* Screen-reader only, so the heading reads "Step 2: See where
                  you stand" rather than a bare title next to a decorative
                  numeral. The colon belongs to the key — it is written
                  differently in Chinese. */}
              <span className="sr-only">{t("landing.stepNumber", { number: index + 1 })} </span>
              {step.title}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
