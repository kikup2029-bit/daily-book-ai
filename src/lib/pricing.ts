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
  | "allLanguages";

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
  free: {
    id: "free",
    name: "Free",
    priceCents: 0,
    cadence: "forever",
    tagline: "Enough to keep a simple daily record.",
    features: [],
    bullets: [
      "Log money in and money out by hand",
      "Daily and monthly totals",
      "Up to 3 invoices a month",
      "One device",
    ],
    cta: "Start free",
    stripePriceEnvVar: null,
    featured: false,
    limits: { invoicesPerMonth: 3, entriesPerMonth: null, devices: 1 },
  },

  pro: {
    id: "pro",
    name: "Pro",
    priceCents: 999,
    cadence: "per month",
    tagline: "Everything, for less than a round of coffees.",
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
    ],
    bullets: [
      "Unlimited entries and invoices",
      "Ask questions about your own numbers",
      "Snap a receipt and it fills itself in",
      "Budgets, bills and savings goals",
      "CSV and PDF exports for your accountant",
      "Share with a partner or housemate",
      "Keeps working with no signal, syncs later",
      "All six languages",
    ],
    cta: "Start Pro",
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
