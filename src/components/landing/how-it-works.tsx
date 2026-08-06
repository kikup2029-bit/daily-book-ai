/**
 * Three steps, and genuinely three.
 *
 * The number is the promise: someone deciding whether this is worth the effort
 * counts the steps before reading them.
 */

import { Section, SectionHeading } from "@/components/landing/section";

const STEPS = [
  {
    title: "Write the money down",
    body: "Cash in the tin, a card payment, a bag of stock — add it as it happens. One line, a few seconds.",
  },
  {
    title: "See where you stand",
    body: "Today, this week and this month are worked out for you. No formulas, no waiting until the end of the month.",
  },
  {
    title: "Ask, send and plan",
    body: "Ask a question about your own numbers, send an invoice, and set the budgets, bills and savings goals you want to keep to.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" labelledBy="how-it-works-heading">
      <SectionHeading
        id="how-it-works-heading"
        eyebrow="How it works"
        title="Three steps, and you're keeping books"
        description="You can do the first one this afternoon and stop there. The rest is waiting when you want it."
      />

      <ol className="mt-10 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="panel p-5">
            <span
              className="figure flex size-9 items-center justify-center rounded-full bg-brand text-[15px] text-brand-foreground"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <h3 className="mt-4 text-[16px] leading-tight">
              <span className="sr-only">{`Step ${index + 1}: `}</span>
              {step.title}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
