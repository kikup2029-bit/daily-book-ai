/**
 * The words describing each plan, as dictionary KEYS rather than as text.
 *
 * Why this exists as its own module:
 *
 * pricing.ts holds what a plan IS — price, features, limits, Stripe ids. For a
 * while it also held what a plan SAYS, as English strings, and four screens
 * rendered those strings directly. Three of them were the landing page, the
 * paywall and the post-signup upgrade offer: the screens whose entire job is to
 * ask someone for money. In a Gujarati session they asked in English.
 *
 * The landing page had already been given a private copy of this map. That
 * fixed one screen and left the other three broken, which is the specific way
 * this kind of bug survives — it looks fixed from wherever you last looked.
 *
 * So the mapping lives here, once, and every screen reads it. The keys already
 * exist in all four shipped dictionaries.
 *
 * ADDING A BULLET: add it to pricing.ts's feature list AND add a key here AND
 * add the English string to en.ts. A bullet with no key renders as its own key
 * name, which is ugly but visible — the failure you want, not a silent drop.
 */

import type { PlanId } from "./pricing";

export type PlanCopy = {
  name: string;
  tagline: string;
  cadence: string;
  cta: string;
  bullets: string[];
};

export const PLAN_COPY: Record<PlanId, PlanCopy> = {
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
