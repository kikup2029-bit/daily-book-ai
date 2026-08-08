/**
 * The five things people ask before they'll type a card number.
 *
 * Built on <details> and <summary>, which the browser already makes keyboard
 * operable, screen-reader friendly and searchable with ctrl-F. An accordion
 * component would be more JavaScript for less behaviour.
 */

import { useMemo, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { LOCALES, LOCALE_LIST, useI18n } from "@/lib/i18n";
import type { Translator } from "@/lib/i18n/translate";

import { Section, SectionHeading } from "@/components/landing/section";
import { TRIAL_DAYS } from "@/lib/pricing";

/** Not translated: each language writes its own name, in its own script. */
const NATIVE_NAMES = LOCALE_LIST.map((code) => LOCALES[code].native).join(" · ");

/**
 * Where the emphasised list of language names sits inside the answer.
 *
 * The sentence stays one key, because word order moves between languages and a
 * sentence assembled from fragments in JSX can only ever read as English. The
 * translated string is split on this marker and the names rendered between the
 * two halves, wherever the translator chose to put them.
 */
const LANGUAGES_SLOT = "{languages}";

/**
 * Built from `t` on each render. A module constant would call `t` once at import
 * time and serve the first language loaded to everyone who switched afterwards.
 */
function faqs(t: Translator): Array<{ id: string; question: string; answer: ReactNode }> {
  // {count} comes from LOCALE_LIST, not typed into the string — the answer used
  // to open with the literal word "Six", which went stale the moment two
  // languages were held back.
  const [beforeNames, afterNames] = t("landing.faqLanguagesAnswer", {
    count: LOCALE_LIST.length,
  }).split(LANGUAGES_SLOT);

  return [
    {
      id: "accounting",
      question: t("landing.faqAccountingQuestion"),
      answer: t("landing.faqAccountingAnswer"),
    },
    {
      id: "cancel",
      question: t("landing.faqCancelQuestion"),
      answer: t("landing.faqCancelAnswer"),
    },
    {
      id: "privacy",
      question: t("landing.faqPrivacyQuestion"),
      answer: t("landing.faqPrivacyAnswer"),
    },
    {
      id: "languages",
      question: t("landing.faqLanguagesQuestion"),
      answer: (
        <>
          {beforeNames}
          <span className="font-medium text-foreground">{NATIVE_NAMES}</span>
          {afterNames}
        </>
      ),
    },
    {
      id: "billing",
      question: t("landing.faqBillingQuestion"),
      // The trial length is read from pricing.ts, not retyped into the copy.
      answer: t("landing.faqBillingAnswer", { count: TRIAL_DAYS }),
    },
  ];
}

export function Faq() {
  const { t } = useI18n();
  const items = useMemo(() => faqs(t), [t]);

  return (
    <Section id="faq" labelledBy="faq-heading">
      <SectionHeading
        id="faq-heading"
        eyebrow={t("landing.faqEyebrow")}
        title={t("landing.faqTitle")}
      />

      <div className="mx-auto mt-10 max-w-2xl space-y-3">
        {items.map((item) => (
          <details key={item.id} className="panel group px-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--dur)] ease-[var(--ease)] group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="border-t pb-4 pt-3 text-[14px] leading-relaxed text-muted-foreground">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}
