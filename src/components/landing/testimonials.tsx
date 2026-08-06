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

import { Badge } from "@/components/ui/kit";

import { Section, SectionHeading } from "@/components/landing/section";

const PLACEHOLDERS = [
  {
    quote:
      "This is a placeholder. A real quote from a market trader about their daily takings will go here.",
    trade: "Market trader",
  },
  {
    quote:
      "This is a placeholder. A real quote from a café owner about receipts and suppliers will go here.",
    trade: "Café owner",
  },
  {
    quote:
      "This is a placeholder. A real quote from a self-employed cleaner about invoices will go here.",
    trade: "Self-employed cleaner",
  },
];

export function Testimonials() {
  return (
    <Section id="testimonials" labelledBy="testimonials-heading">
      <SectionHeading
        id="testimonials-heading"
        eyebrow="Customer stories"
        title="We haven't got any of these yet"
        description="Nobody below is a real person and none of these are real quotes. They are placeholders showing where customer stories will sit once real SimpleBooks users have used it and agreed to be quoted by name."
      />

      <ul className="mt-10 grid gap-5 sm:grid-cols-3">
        {PLACEHOLDERS.map((item) => (
          <li key={item.trade} className="panel flex flex-col gap-4 border-dashed p-5">
            <Badge tone="warning" className="self-start">
              Example
            </Badge>

            <p className="flex-1 text-[14px] leading-relaxed text-muted-foreground">{item.quote}</p>

            <div className="border-t pt-3">
              <p className="text-[13px] font-semibold">Name to be added</p>
              <p className="text-[12px] text-muted-foreground">{item.trade}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
