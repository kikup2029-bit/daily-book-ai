/**
 * What you actually get, one plain sentence at a time.
 *
 * Ordered by how early you meet it: logging is minute one, privacy is the thing
 * you think about after you've decided you like it.
 */

import {
  Camera,
  FileText,
  Lock,
  PiggyBank,
  Sparkles,
  WifiOff,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Section, SectionHeading } from "@/components/landing/section";

const BENEFITS: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: Zap,
    title: "Logging takes seconds",
    body: "Type or say what came in or went out and it's saved before the next customer.",
  },
  {
    icon: Sparkles,
    title: "Ask about your own figures",
    body: "Ask something like “how was last week?” and get an answer in the same plain words.",
  },
  {
    icon: Camera,
    title: "Photograph a receipt",
    body: "Take a picture and the shop, date and amount fill themselves in for you to check.",
  },
  {
    icon: FileText,
    title: "Send an invoice",
    body: "Make one in a minute, send it, and see at a glance which ones are still unpaid.",
  },
  {
    icon: PiggyBank,
    title: "Budgets, bills and goals",
    body: "Set what you mean to spend, when bills land, and what you're putting money aside for.",
  },
  {
    icon: WifiOff,
    title: "Works with no signal",
    body: "Keep logging in a market hall or a basement; it catches up when you're back online.",
  },
  {
    icon: Lock,
    title: "Your figures stay yours",
    body: "Your books are private to your account and only shared with someone you invite.",
  },
];

export function Benefits() {
  return (
    <Section id="features" labelledBy="features-heading" className="bg-surface-2">
      <SectionHeading
        id="features-heading"
        eyebrow="What it does"
        title="Everything a one-person business needs, and nothing it doesn't"
        description="No chart of accounts, no double entry, no jargon. Just the things you do every day."
      />

      <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-3.5">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-10)] bg-brand-soft text-brand"
              aria-hidden="true"
            >
              <Icon className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold leading-tight">{title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
