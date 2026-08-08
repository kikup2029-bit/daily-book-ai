/**
 * Placeholders, and said so.
 *
 * There are no customers to quote yet. Inventing three plausible names and
 * photographs would be the easiest thing on this page and also a lie, and a lie
 * on the page selling a money app is a poor first impression. So the cards show
 * the *shape* of the section — a quote and an attribution — with the quote
 * written as an intention rather than a claim, an "Example" badge on every one,
 * and the attribution line left visibly blank.
 */

import { useMemo } from "react";

import { Badge } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import type { Translator } from "@/lib/i18n/translate";

import { Section, SectionHeading } from "@/components/landing/section";

/**
 * The placeholder cards. Built from `t` per render rather than held in a module
 * constant, so switching language re-reads them — a constant would keep the
 * language that happened to be active when this module was first imported.
 */
function placeholders(t: Translator) {
  return [
    {
      id: "trader",
      quote: t("landing.testimonialTraderQuote"),
      trade: t("landing.testimonialTraderTrade"),
    },
    {
      id: "cafe",
      quote: t("landing.testimonialCafeQuote"),
      trade: t("landing.testimonialCafeTrade"),
    },
    {
      id: "cleaner",
      quote: t("landing.testimonialCleanerQuote"),
      trade: t("landing.testimonialCleanerTrade"),
    },
  ];
}

export function Testimonials() {
  const { t } = useI18n();
  const items = useMemo(() => placeholders(t), [t]);

  return (
    <Section id="testimonials" labelledBy="testimonials-heading">
      <SectionHeading
        id="testimonials-heading"
        eyebrow={t("landing.testimonialsEyebrow")}
        title={t("landing.testimonialsTitle")}
        description={t("landing.testimonialsDescription")}
      />

      <ul className="mt-10 grid gap-5 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="panel flex flex-col gap-4 border-dashed p-5">
            <Badge tone="warning" className="self-start">
              {t("landing.testimonialExampleBadge")}
            </Badge>

            <p className="flex-1 text-[14px] leading-relaxed text-muted-foreground">{item.quote}</p>

            <div className="border-t pt-3">
              <p className="text-[13px] font-semibold">{t("landing.testimonialNamePending")}</p>
              <p className="text-[12px] text-muted-foreground">{item.trade}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
