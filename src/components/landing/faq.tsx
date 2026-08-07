/**
 * The five things people ask before they'll type a card number.
 *
 * Built on <details> and <summary>, which the browser already makes keyboard
 * operable, screen-reader friendly and searchable with ctrl-F. An accordion
 * component would be more JavaScript for less behaviour.
 */

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { LOCALES, LOCALE_LIST } from "@/lib/i18n";

import { Section, SectionHeading } from "@/components/landing/section";
import { TRIAL_DAYS } from "@/lib/pricing";

const NATIVE_NAMES = LOCALE_LIST.map((code) => LOCALES[code].native).join(" · ");

const FAQS: Array<{ question: string; answer: ReactNode }> = [
  {
    question: "Do I need to know anything about accounting?",
    answer:
      "No. If you can write down “sold $40 of veg” you can use SimpleBooks. There are no debits, credits, journals or double entry anywhere in it — you record money in and money out, and it does the adding up. It's a record of your trading, not a substitute for an accountant at tax time.",
  },
  {
    question: "Can I cancel?",
    answer:
      "Yes, any time, in one click from the Billing page — no phone call, no notice period, no one trying to talk you out of it. Cancel during the free week and you are never charged. Cancel later and you keep Pro until the month you have paid for runs out, then drop to the free plan. Your entries stay exactly where they are, and exports keep working whatever plan you are on.",
  },
  {
    question: "Who can see my figures?",
    answer:
      "You, and anyone you deliberately invite to share a book with you. Your entries aren't sold, and they aren't shown to other SimpleBooks users. You can export everything to CSV or PDF whenever you like, and deleting your account deletes your books.",
  },
  {
    question: "Which languages does it speak?",
    answer: (
      <>
        Six, and all of them cover the whole app rather than just the front page:{" "}
        <span className="font-medium text-foreground">{NATIVE_NAMES}</span>. You can switch at any
        time from the language button in the top bar.
      </>
    ),
  },
  {
    question: "How does billing work?",
    answer: `Pro is free for the first ${TRIAL_DAYS} days. We ask for your card at the start so the trial can turn into a subscription without you doing anything — and we tell you, in the app and by the countdown at the top of every page, exactly when the first charge lands and what it will be. Cancel before then and nothing is taken. Payments are handled by Stripe, which holds the card details; they never pass through SimpleBooks.`,
  },
];

export function Faq() {
  return (
    <Section id="faq" labelledBy="faq-heading">
      <SectionHeading id="faq-heading" eyebrow="Questions" title="Before you sign up" />

      <div className="mx-auto mt-10 max-w-2xl space-y-3">
        {FAQS.map((item) => (
          <details key={item.question} className="panel group px-5">
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
