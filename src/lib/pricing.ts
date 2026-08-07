/**
 * What the plans are and what they cost.
 *
 * One file. The landing page, the pricing table, the upgrade prompts and the
 * server-side entitlement check all read from here, so changing a price or
 * moving a feature between tiers is a single edit — not a hunt through the UI
 * hoping you found every mention.
 *
 * The price shown here is display only. What a customer is actually charged is
 * whatever the Stripe Price object says, and Stripe is the authority. If the
 * two ever disagree, the customer pays Stripe's number and this file is a bug.
 */

export type PlanId = "free" | "pro";

/**
 * How long the free trial runs.
 *
 * The card is taken at sign-up and charged when this runs out, which is a model
 * with rules attached: US law (the FTC's negative-option guidance) requires the
 * price, the date of the first charge and the way to cancel to be stated
 * *before* the card is handed over, and cancelling to be no harder than
 * subscribing was. Three things in this codebase exist to satisfy that, and
 * removing any of them turns a legal trial into an unlawful one:
 *
 *   1. `trialDisclosure()` below, printed next to the checkout button.
 *   2. The countdown banner shown for the whole trial.
 *   3. One-click cancel on the billing page, no retention flow.
 */
export const TRIAL_DAYS = 7;

/** The day the first charge lands, given when the trial started. */
export function firstChargeDate(startedAt: Date = new Date()): Date {
  const due = new Date(startedAt);
  due.setDate(due.getDate() + TRIAL_DAYS);
  return due;
}

/** Whole days left in a trial. Never negative, and 0 means it ends today. */
export function trialDaysLeft(trialEndIso: string | null, now: Date = new Date()): number | null {
  if (!trialEndIso) return null;
  const end = new Date(trialEndIso);
  if (Number.isNaN(end.getTime())) return null;
  const ms = end.getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}

/**
 * The sentence that must appear before anyone types a card number.
 *
 * Kept here rather than in a component so it cannot end up worded three
 * different ways on three different screens — the disclosure only works if it
 * says the same thing everywhere.
 */
export function trialDisclosure(locale = "en-US", startedAt: Date = new Date()): string {
  const price = formatPrice(PLANS.pro.priceCents, locale);
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(
    firstChargeDate(startedAt),
  );
  return `Free for ${TRIAL_DAYS} days. On ${date} your card is charged ${price}, then ${price} every month. Cancel any time before then and you pay nothing.`;
}

/**
 * The things a plan can unlock.
 *
 * Named after what the owner gets, not after the component that implements it,
 * so the list survives a refactor.
 */
export type Feature =
  | "unlimitedEntries"
  | "unlimitedInvoices"
  | "aiQuestions"
  | "receiptScanning"
  | "budgetsAndGoals"
  | "exports"
  | "householdSharing"
  | "offlineSync"
  | "allLanguages"
  /** Searching and filtering past entries. */
  | "entrySearch"
  /** The analysis screens: streaks, the week, day by day, busy days, outlook, categories. */
  | "insights"
  /** Item margins, the cash drawer count and the tax set-aside. */
  | "cashTools"
  /** The bills calendar and the recurring bills detected from spending. */
  | "billsCalendar"
  /** The daily nudge to log the day's money. */
  | "dailyReminder";

export type Plan = {
  id: PlanId;
  name: string;
  /** Monthly price in cents. Cents, not dollars — floats and money don't mix. */
  priceCents: number;
  /** Shown under the price. */
  cadence: string;
  tagline: string;
  features: Feature[];
  /** Human-readable bullets for the pricing card, in display order. */
  bullets: string[];
  cta: string;
  /**
   * Which Stripe Price this maps to. Read from the environment at runtime, so
   * test and live mode can differ without a code change. Free has none.
   */
  stripePriceEnvVar: string | null;
  featured: boolean;
  /** Hard caps for the free tier. null means no limit. */
  limits: {
    invoicesPerMonth: number | null;
    entriesPerMonth: number | null;
    devices: number | null;
  };
};

export const PLANS: Record<PlanId, Plan> = {
  /*
   * What is left after a trial ends.
   *
   * Deliberately thin: a daily record and a way out. Everything that reads the
   * record back to you — search, the analysis screens, the cash tools, the bills
   * calendar, the daily nudge — is Pro, which is what the seven free days are
   * for. What survives here is what the app must still do for someone who has
   * stopped paying:
   *
   *   Logging and today's and this month's totals — the book itself. An app
   *   that won't let you write the day down has stopped being a bookkeeping
   *   app; there would be nothing left to come back to.
   *
   *   `exports` — someone who stops paying must still be able to get their own
   *   books out. Charging for that is holding a business's records hostage, and
   *   it is the promise made in the Terms.
   *
   *   `allLanguages` — the app is built for people whose first language is not
   *   English. Putting Gujarati or Urdu behind the paywall doesn't make the free
   *   tier lean, it makes it unreadable for exactly the people it is for.
   *
   * Every bullet below has to be something Free actually still does. A bullet
   * that names a paid screen is a false advert, not optimistic marketing.
   */
  free: {
    id: "free",
    name: "Free",
    priceCents: 0,
    cadence: "forever",
    tagline: "Your books stay yours, and you can still keep a daily record.",
    features: ["exports", "allLanguages"],
    bullets: [
      "Log money in and money out by hand",
      "Today's totals, and this month's",
      "CSV and PDF exports — always",
      "All six languages",
    ],
    cta: "Continue on Free",
    stripePriceEnvVar: null,
    featured: false,
    limits: { invoicesPerMonth: 0, entriesPerMonth: null, devices: 1 },
  },

  pro: {
    id: "pro",
    name: "Pro",
    priceCents: 999,
    cadence: "per month",
    // No price in the tagline: it would be a second copy of priceCents, free to
    // drift out of step with the first. The card renders the price itself.
    tagline: `Free for ${TRIAL_DAYS} days. Cancel any time before it ends.`,
    features: [
      "unlimitedEntries",
      "unlimitedInvoices",
      "aiQuestions",
      "receiptScanning",
      "budgetsAndGoals",
      "exports",
      "householdSharing",
      "offlineSync",
      "allLanguages",
      "entrySearch",
      "insights",
      "cashTools",
      "billsCalendar",
      "dailyReminder",
    ],
    // The first five are what the paywall panel shows, so the things a person
    // most often hits a gate on come first.
    bullets: [
      "Search and correct every entry you've logged",
      "Streaks, your week, busy days and where money went",
      "Item margins, cash drawer and tax set-aside",
      "Bills calendar, plus subscriptions it spots for you",
      "Ask questions about your own numbers",
      "Snap a receipt and it fills itself in",
      "Unlimited invoices, budgets and savings goals",
      "A daily reminder to write the day down",
      "Share with a partner or housemate",
      "Keeps working with no signal, syncs later",
      "CSV and PDF exports for your accountant",
      "All six languages",
    ],
    cta: `Start my ${TRIAL_DAYS} free days`,
    stripePriceEnvVar: "STRIPE_PRICE_PRO_MONTHLY",
    featured: true,
    limits: { invoicesPerMonth: null, entriesPerMonth: null, devices: null },
  },
};

export const PLAN_LIST: Plan[] = [PLANS.free, PLANS.pro];

/**
 * Whether a plan includes a feature.
 *
 * Note this takes a plan, not a user — deciding *which* plan someone is on is
 * the server's job and lives in subscriptions.ts. Keeping the two apart means
 * this stays a pure lookup that can't accidentally be fooled by client state.
 */
export function planHasFeature(planId: PlanId, feature: Feature): boolean {
  return PLANS[planId].features.includes(feature);
}

/** "$9.99" — for display only, never for charging. */
export function formatPrice(priceCents: number, locale = "en-US"): string {
  if (priceCents === 0) return "Free";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: priceCents % 100 === 0 ? 0 : 2,
  }).format(priceCents / 100);
}

/**
 * Whether the free tier still allows another invoice this month.
 *
 * A cap has to be enforced on the server too — this is only for showing the
 * limit in the UI before someone hits it.
 */
export function withinInvoiceLimit(planId: PlanId, usedThisMonth: number): boolean {
  const cap = PLANS[planId].limits.invoicesPerMonth;
  return cap === null || usedThisMonth < cap;
}
