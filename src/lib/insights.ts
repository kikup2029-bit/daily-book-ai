/**
 * Pure analysis functions over the owner's own data. No network, no AI, no
 * database — just math, so every number is explainable and testable.
 */

export type InsightEntry = {
  entry_date: string; // YYYY-MM-DD
  amount_in: number;
  amount_out: number;
  spent_on: string | null;
  merchant?: string | null;
  payment_method?: string | null; // "cash" | "card" | "other" | null
};

export type InsightRecurring = {
  amount: number;
  category: string;
  frequency: "weekly" | "monthly";
  start_date: string;
  active: boolean;
  last_generated_date: string | null;
};

export type InsightProduct = {
  name: string;
  unit_cost: number;
  sale_price: number;
};

// --- shared date helpers --------------------------------------------------

export function isoToday(now = new Date()) {
  return now.toLocaleDateString("en-CA");
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-CA");
}

function addMonths(iso: string, months: number) {
  const date = new Date(`${iso}T00:00:00`);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return date.toLocaleDateString("en-CA");
}

export function daysBetween(fromISO: string, toISO: string) {
  const ms = new Date(`${toISO}T00:00:00`).getTime() - new Date(`${fromISO}T00:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

function inRange(entries: InsightEntry[], from: string, to: string) {
  return entries.filter((e) => e.entry_date >= from && e.entry_date <= to);
}

// =========================================================================
// 1. Cash runway forecast — "will I make rent?"
// =========================================================================

export type ForecastBill = { category: string; amount: number; due: string };

export type Forecast = {
  /** Net position from everything logged so far. */
  currentNet: number;
  /** Average money in per day, from the lookback window. */
  dailyIn: number;
  /** Average day-to-day money out per day, excluding recurring bills. */
  dailyOut: number;
  /** Known recurring bills falling inside the horizon. */
  upcomingBills: ForecastBill[];
  /** Projected net position at the end of the horizon. */
  projectedNet: number;
  /** Lowest projected balance at any point in the horizon, and when. */
  lowestPoint: { date: string; balance: number };
  /** First date the projection goes below zero, if it does. */
  shortfallDate: string | null;
  horizonDays: number;
  /** Days of history the averages are based on. */
  basedOnDays: number;
  /** True when there's too little history for the averages to mean much. */
  lowConfidence: boolean;
};

/**
 * Projects the balance forward day by day: current position, plus typical
 * daily income, minus typical daily spending, minus each known recurring
 * bill on the day it actually falls due.
 */
export function forecastCash(
  entries: InsightEntry[],
  recurring: InsightRecurring[],
  options: { horizonDays?: number; lookbackDays?: number; today?: string } = {},
): Forecast {
  const horizonDays = options.horizonDays ?? 30;
  const lookbackDays = options.lookbackDays ?? 60;
  const today = options.today ?? isoToday();

  const currentNet = entries.reduce((sum, e) => sum + e.amount_in - e.amount_out, 0);

  // Averages come from the lookback window, but only count days we could
  // actually have observed (don't divide by 60 if there are 10 days of data).
  const windowStart = addDays(today, -(lookbackDays - 1));
  const window = inRange(entries, windowStart, today);
  const dates = entries.map((e) => e.entry_date).sort();
  const earliest = dates[0] ?? today;
  const observedDays = Math.max(
    1,
    Math.min(lookbackDays, daysBetween(earliest > windowStart ? earliest : windowStart, today) + 1),
  );

  const windowIn = window.reduce((sum, e) => sum + e.amount_in, 0);

  // Recurring bills are forecast explicitly, so exclude their historical
  // amounts from the "typical day" average to avoid counting them twice.
  const recurringCategories = new Set(
    recurring.filter((r) => r.active).map((r) => r.category.trim().toLowerCase()),
  );
  const windowOutEveryday = window.reduce((sum, e) => {
    const cat = (e.spent_on ?? "").trim().toLowerCase();
    return recurringCategories.has(cat) ? sum : sum + e.amount_out;
  }, 0);

  const dailyIn = windowIn / observedDays;
  const dailyOut = windowOutEveryday / observedDays;

  // Expand recurring rules into concrete due dates within the horizon.
  const horizonEnd = addDays(today, horizonDays);
  const upcomingBills: ForecastBill[] = [];
  for (const rule of recurring) {
    if (!rule.active || rule.amount <= 0) continue;
    let next = rule.last_generated_date
      ? rule.frequency === "weekly"
        ? addDays(rule.last_generated_date, 7)
        : addMonths(rule.last_generated_date, 1)
      : rule.start_date;

    let guard = 0;
    while (next < today && guard < 400) {
      next = rule.frequency === "weekly" ? addDays(next, 7) : addMonths(next, 1);
      guard += 1;
    }
    guard = 0;
    while (next <= horizonEnd && guard < 400) {
      upcomingBills.push({ category: rule.category, amount: rule.amount, due: next });
      next = rule.frequency === "weekly" ? addDays(next, 7) : addMonths(next, 1);
      guard += 1;
    }
  }
  upcomingBills.sort((a, b) => a.due.localeCompare(b.due));

  // Walk the horizon one day at a time.
  let balance = currentNet;
  let lowest = { date: today, balance: currentNet };
  let shortfallDate: string | null = currentNet < 0 ? today : null;

  for (let dayOffset = 1; dayOffset <= horizonDays; dayOffset += 1) {
    const date = addDays(today, dayOffset);
    balance += dailyIn - dailyOut;
    for (const bill of upcomingBills) {
      if (bill.due === date) balance -= bill.amount;
    }
    if (balance < lowest.balance) lowest = { date, balance };
    if (balance < 0 && !shortfallDate) shortfallDate = date;
  }

  return {
    currentNet,
    dailyIn,
    dailyOut,
    upcomingBills,
    projectedNet: balance,
    lowestPoint: lowest,
    shortfallDate,
    horizonDays,
    basedOnDays: observedDays,
    lowConfidence: observedDays < 14,
  };
}

// =========================================================================
// 1b. "Safe to spend today"
// =========================================================================

export type SafeToSpend = {
  amount: number;
  daysLeftInMonth: number;
  /** What's left of the month's budgets, if any are set. */
  budgetRemaining: number | null;
  /** Bills falling due before the end of the month. */
  billsDue: number;
  /** Money currently in hand, per the log. */
  currentNet: number;
  /** Which rule produced the number, so the UI can explain it. */
  basis: "budgets" | "cash" | "none";
  explanation: string;
};

/**
 * A single number: what can be spent today without causing a problem later
 * this month.
 *
 * Prefers budgets when they exist (what's left of your own limits, spread over
 * the days remaining). Otherwise falls back to cash in hand minus bills still
 * due this month, spread over the remaining days.
 */
export function safeToSpendToday(
  entries: InsightEntry[],
  recurring: InsightRecurring[],
  budgets: Array<{ category: string; monthly_limit: number }>,
  options: { today?: string } = {},
): SafeToSpend {
  const today = options.today ?? isoToday();
  const monthStart = `${today.slice(0, 7)}-01`;
  const endOfMonth = (() => {
    const d = new Date(`${today}T00:00:00`);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toLocaleDateString("en-CA");
  })();
  const daysLeftInMonth = Math.max(1, daysBetween(today, endOfMonth) + 1);

  const currentNet = entries.reduce((sum, e) => sum + e.amount_in - e.amount_out, 0);
  const monthEntries = inRange(entries, monthStart, today);

  // Bills still due between today and month end.
  const forecast = forecastCash(entries, recurring, {
    horizonDays: daysLeftInMonth,
    today,
  });
  const billsDue = forecast.upcomingBills
    .filter((b) => b.due >= today && b.due <= endOfMonth)
    .reduce((sum, b) => sum + b.amount, 0);

  if (budgets.length > 0) {
    const totalLimit = budgets.reduce((s, b) => s + b.monthly_limit, 0);
    const spentByCat = new Map<string, number>();
    for (const e of monthEntries) {
      if (e.amount_out <= 0) continue;
      const key = (e.spent_on ?? "").trim();
      if (!key) continue;
      spentByCat.set(key, (spentByCat.get(key) ?? 0) + e.amount_out);
    }
    const spentAgainstBudgets = budgets.reduce(
      (sum, b) => sum + (spentByCat.get(b.category) ?? 0),
      0,
    );
    const budgetRemaining = totalLimit - spentAgainstBudgets;
    const amount = Math.max(0, budgetRemaining / daysLeftInMonth);

    return {
      amount,
      daysLeftInMonth,
      budgetRemaining,
      billsDue,
      currentNet,
      basis: "budgets",
      explanation:
        budgetRemaining > 0
          ? `${fmtMoney(budgetRemaining)} left in your budgets, spread over ${daysLeftInMonth} ${
              daysLeftInMonth === 1 ? "day" : "days"
            } left this month.`
          : `You've already used up your budgets for this month.`,
    };
  }

  // No budgets — work from cash in hand less bills still to pay.
  const spendable = currentNet - billsDue;
  if (currentNet <= 0) {
    return {
      amount: 0,
      daysLeftInMonth,
      budgetRemaining: null,
      billsDue,
      currentNet,
      basis: "none",
      explanation: `You're behind by ${fmtMoney(
        currentNet,
      )} overall, so there's nothing spare to spend today.`,
    };
  }

  return {
    amount: Math.max(0, spendable / daysLeftInMonth),
    daysLeftInMonth,
    budgetRemaining: null,
    billsDue,
    currentNet,
    basis: "cash",
    explanation:
      billsDue > 0
        ? `${fmtMoney(currentNet)} in hand, less ${fmtMoney(
            billsDue,
          )} of bills still due, over ${daysLeftInMonth} ${
            daysLeftInMonth === 1 ? "day" : "days"
          } left this month.`
        : `${fmtMoney(currentNet)} in hand over ${daysLeftInMonth} ${
            daysLeftInMonth === 1 ? "day" : "days"
          } left this month.`,
  };
}

const fmtMoney = (value: number) =>
  `$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// =========================================================================
// 2. Tax set-aside jar
// =========================================================================

export type TaxJar = {
  ratePercent: number;
  /** Income in the period the set-aside is calculated from. */
  incomeInPeriod: number;
  /** What should have been set aside. */
  shouldHaveSetAside: number;
  /** Payments already logged against a tax-like category. */
  alreadyPaid: number;
  /** Still to put aside (never negative). */
  stillToSetAside: number;
  periodLabel: string;
};

const TAX_CATEGORY_PATTERN = /\btax(es)?\b|\birs\b|\bhmrc\b|\bcra\b/i;

/**
 * Works out how much to hold back for tax, based on income logged in the
 * period, less anything already logged as a tax payment.
 */
export function taxSetAside(
  entries: InsightEntry[],
  ratePercent: number,
  options: { from?: string; to?: string; periodLabel?: string; today?: string } = {},
): TaxJar {
  const today = options.today ?? isoToday();
  const from = options.from ?? `${today.slice(0, 4)}-01-01`;
  const to = options.to ?? today;
  const scoped = inRange(entries, from, to);

  const incomeInPeriod = scoped.reduce((sum, e) => sum + e.amount_in, 0);
  const alreadyPaid = scoped.reduce(
    (sum, e) => (TAX_CATEGORY_PATTERN.test(e.spent_on ?? "") ? sum + e.amount_out : sum),
    0,
  );

  const shouldHaveSetAside = incomeInPeriod * (ratePercent / 100);

  return {
    ratePercent,
    incomeInPeriod,
    shouldHaveSetAside,
    alreadyPaid,
    stillToSetAside: Math.max(0, shouldHaveSetAside - alreadyPaid),
    periodLabel: options.periodLabel ?? "this year",
  };
}

// =========================================================================
// 3. Day-of-week / slow-day patterns
// =========================================================================

export type DayPattern = {
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  label: string;
  averageIn: number;
  daysCounted: number;
  /** Percent difference from the overall daily average. */
  vsAverage: number;
};

export type DayPatternResult = {
  patterns: DayPattern[];
  overallAverageIn: number;
  best: DayPattern | null;
  worst: DayPattern | null;
  /** Needs a few weeks before this means anything. */
  enoughData: boolean;
};

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Averages income by day of the week, so slow days stand out. Only counts
 * days that actually occurred in the range (so a month with five Mondays
 * doesn't skew against one with four).
 */
export function dayOfWeekPatterns(
  entries: InsightEntry[],
  options: { lookbackDays?: number; today?: string } = {},
): DayPatternResult {
  const lookbackDays = options.lookbackDays ?? 84; // ~12 weeks
  const today = options.today ?? isoToday();
  const from = addDays(today, -(lookbackDays - 1));

  const dates = entries.map((e) => e.entry_date).sort();
  const earliest = dates[0];
  if (!earliest) {
    return { patterns: [], overallAverageIn: 0, best: null, worst: null, enoughData: false };
  }

  const start = earliest > from ? earliest : from;
  const totalDays = Math.max(1, daysBetween(start, today) + 1);

  // Sum income per weekday, and count how many of each weekday occurred.
  const sums = new Array(7).fill(0);
  const dayCounts = new Array(7).fill(0);

  for (let offset = 0; offset < totalDays; offset += 1) {
    const date = addDays(start, offset);
    const weekday = new Date(`${date}T00:00:00`).getDay();
    dayCounts[weekday] += 1;
  }

  for (const entry of inRange(entries, start, today)) {
    const weekday = new Date(`${entry.entry_date}T00:00:00`).getDay();
    sums[weekday] += entry.amount_in;
  }

  const totalIn = sums.reduce((a, b) => a + b, 0);
  const overallAverageIn = totalIn / totalDays;

  const patterns: DayPattern[] = [];
  for (let weekday = 0; weekday < 7; weekday += 1) {
    if (dayCounts[weekday] === 0) continue;
    const averageIn = sums[weekday] / dayCounts[weekday];
    patterns.push({
      weekday,
      label: WEEKDAY_LABELS[weekday],
      averageIn,
      daysCounted: dayCounts[weekday],
      vsAverage:
        overallAverageIn > 0 ? ((averageIn - overallAverageIn) / overallAverageIn) * 100 : 0,
    });
  }

  const sorted = [...patterns].sort((a, b) => b.averageIn - a.averageIn);
  // Need at least 3 of each weekday and some income before this is meaningful.
  const enoughData = totalDays >= 21 && totalIn > 0 && patterns.length >= 5;

  return {
    patterns,
    overallAverageIn,
    best: sorted[0] ?? null,
    worst: sorted[sorted.length - 1] ?? null,
    enoughData,
  };
}

// =========================================================================
// 4. Weekly digest (plain English, generated locally)
// =========================================================================

export type Digest = {
  weekFrom: string;
  weekTo: string;
  moneyIn: number;
  moneyOut: number;
  net: number;
  vsLastWeekNet: number;
  topCategory: { name: string; amount: number } | null;
  busiestDay: { date: string; amount: number } | null;
  lines: string[];
};

const fmt = (value: number) =>
  `$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** Builds a short plain-English recap of the last 7 days. */
export function weeklyDigest(
  entries: InsightEntry[],
  options: { today?: string } = {},
): Digest {
  const today = options.today ?? isoToday();
  const weekFrom = addDays(today, -6);
  const prevFrom = addDays(today, -13);
  const prevTo = addDays(today, -7);

  const week = inRange(entries, weekFrom, today);
  const prev = inRange(entries, prevFrom, prevTo);

  const moneyIn = week.reduce((s, e) => s + e.amount_in, 0);
  const moneyOut = week.reduce((s, e) => s + e.amount_out, 0);
  const net = moneyIn - moneyOut;
  const prevNet = prev.reduce((s, e) => s + e.amount_in - e.amount_out, 0);

  const catMap = new Map<string, number>();
  for (const e of week) {
    if (e.amount_out <= 0) continue;
    const key = (e.spent_on ?? "").trim() || "Uncategorized";
    catMap.set(key, (catMap.get(key) ?? 0) + e.amount_out);
  }
  const topEntry = [...catMap.entries()].sort((a, b) => b[1] - a[1])[0];
  const topCategory = topEntry ? { name: topEntry[0], amount: topEntry[1] } : null;

  const dayMap = new Map<string, number>();
  for (const e of week) {
    if (e.amount_in <= 0) continue;
    dayMap.set(e.entry_date, (dayMap.get(e.entry_date) ?? 0) + e.amount_in);
  }
  const busiestEntry = [...dayMap.entries()].sort((a, b) => b[1] - a[1])[0];
  const busiestDay = busiestEntry ? { date: busiestEntry[0], amount: busiestEntry[1] } : null;

  const lines: string[] = [];
  if (week.length === 0) {
    lines.push("You didn't log anything this week.");
  } else {
    lines.push(
      `You took in ${fmt(moneyIn)} and spent ${fmt(moneyOut)}, so you ${
        net > 0 ? `kept ${fmt(net)}` : net < 0 ? `went down ${fmt(net)}` : "broke even"
      }.`,
    );

    if (prev.length > 0) {
      const diff = net - prevNet;
      if (Math.abs(diff) < 0.005) {
        lines.push("That's about the same as the week before.");
      } else {
        lines.push(
          `That's ${fmt(diff)} ${diff > 0 ? "better" : "worse"} than the week before.`,
        );
      }
    }

    if (topCategory) {
      lines.push(`Most of your spending went to ${topCategory.name} (${fmt(topCategory.amount)}).`);
    }
    if (busiestDay) {
      const label = WEEKDAY_LABELS[new Date(`${busiestDay.date}T00:00:00`).getDay()];
      lines.push(`Your best day was ${label} with ${fmt(busiestDay.amount)} coming in.`);
    }
  }

  return {
    weekFrom,
    weekTo: today,
    moneyIn,
    moneyOut,
    net,
    vsLastWeekNet: net - prevNet,
    topCategory,
    busiestDay,
    lines,
  };
}

// =========================================================================
// 5. Product margins
// =========================================================================

export type ProductMargin = {
  name: string;
  unitCost: number;
  salePrice: number;
  /** Money kept per unit before overhead. */
  grossPerUnit: number;
  /** Gross margin as a percent of the sale price. */
  grossMarginPercent: number;
  /** Markup over cost, as a percent. */
  markupPercent: number;
  /** Units needed to cover the overhead figure supplied. */
  unitsToCoverOverhead: number | null;
};

export function productMargin(
  product: InsightProduct,
  monthlyOverhead: number | null = null,
): ProductMargin {
  const grossPerUnit = product.sale_price - product.unit_cost;
  return {
    name: product.name,
    unitCost: product.unit_cost,
    salePrice: product.sale_price,
    grossPerUnit,
    grossMarginPercent: product.sale_price > 0 ? (grossPerUnit / product.sale_price) * 100 : 0,
    markupPercent: product.unit_cost > 0 ? (grossPerUnit / product.unit_cost) * 100 : 0,
    unitsToCoverOverhead:
      monthlyOverhead != null && grossPerUnit > 0
        ? Math.ceil(monthlyOverhead / grossPerUnit)
        : null,
  };
}

/** Average monthly spending, used as the overhead figure for break-even math. */
export function averageMonthlyOverhead(
  entries: InsightEntry[],
  options: { today?: string } = {},
): number {
  const today = options.today ?? isoToday();
  const dates = entries.map((e) => e.entry_date).sort();
  if (dates.length === 0) return 0;
  const days = Math.max(1, daysBetween(dates[0], today) + 1);
  const totalOut = entries.reduce((s, e) => s + e.amount_out, 0);
  return (totalOut / days) * 30;
}

// =========================================================================
// 5b. Subscription / recurring charge detection
// =========================================================================

export type DetectedRecurring = {
  /** Merchant if we have one, otherwise the category. */
  label: string;
  category: string;
  merchant: string | null;
  /** Typical amount (the median, so one odd charge doesn't skew it). */
  amount: number;
  frequency: "weekly" | "monthly";
  /** How many times we saw it. */
  occurrences: number;
  /** Dates we saw it, oldest first. */
  dates: string[];
  /** Our best guess at the next one. */
  nextExpected: string;
  /** Higher means a more regular, more confident pattern. */
  confidence: "high" | "medium";
};

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Finds charges that look like subscriptions or regular bills: the same
 * merchant (or category) hit repeatedly at a steady interval for a similar
 * amount.
 *
 * Deliberately conservative — it only reports patterns with at least three
 * sightings and consistent gaps, so it suggests rather than guesses wildly.
 */
export function detectRecurring(
  entries: InsightEntry[],
  options: { today?: string; alreadyTracked?: string[] } = {},
): DetectedRecurring[] {
  const today = options.today ?? isoToday();
  const tracked = new Set(
    (options.alreadyTracked ?? []).map((value) => value.trim().toLowerCase()),
  );

  // Group expenses by merchant when present, else by category.
  const groups = new Map<string, InsightEntry[]>();
  for (const entry of entries) {
    if (entry.amount_out <= 0) continue;
    const merchant = (entry.merchant ?? "").trim();
    const category = (entry.spent_on ?? "").trim();
    const key = (merchant || category).toLowerCase();
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  const found: DetectedRecurring[] = [];

  for (const [key, group] of groups) {
    if (group.length < 3) continue;
    if (tracked.has(key)) continue;

    const sorted = [...group].sort((a, b) => a.entry_date.localeCompare(b.entry_date));
    const dates = sorted.map((e) => e.entry_date);
    const amounts = sorted.map((e) => e.amount_out);

    // Amounts must be similar — within 15% of the median.
    const typical = median(amounts);
    if (typical <= 0) continue;
    const consistentAmounts = amounts.every(
      (amount) => Math.abs(amount - typical) / typical <= 0.15,
    );
    if (!consistentAmounts) continue;

    // Gaps between sightings must be steady.
    const gaps: number[] = [];
    for (let i = 1; i < dates.length; i += 1) {
      gaps.push(daysBetween(dates[i - 1], dates[i]));
    }
    if (gaps.length < 2) continue;

    const typicalGap = median(gaps);
    if (typicalGap < 5) continue; // too frequent to be a subscription

    const steady = gaps.every((gap) => Math.abs(gap - typicalGap) <= Math.max(3, typicalGap * 0.25));
    if (!steady) continue;

    const frequency: "weekly" | "monthly" = typicalGap <= 10 ? "weekly" : "monthly";
    if (frequency === "monthly" && (typicalGap < 25 || typicalGap > 35)) continue;

    const last = dates[dates.length - 1];
    const nextExpected =
      frequency === "weekly" ? addDays(last, 7) : addMonths(last, 1);

    // Only suggest things that look live (seen within roughly two cycles).
    const daysSinceLast = daysBetween(last, today);
    if (daysSinceLast > typicalGap * 2 + 7) continue;

    const first = sorted[0];
    found.push({
      label: (first.merchant ?? "").trim() || (first.spent_on ?? "").trim() || key,
      category: (first.spent_on ?? "").trim() || "Subscriptions",
      merchant: (first.merchant ?? "").trim() || null,
      amount: typical,
      frequency,
      occurrences: group.length,
      dates,
      nextExpected,
      confidence: group.length >= 4 && gaps.every((g) => Math.abs(g - typicalGap) <= 2) ? "high" : "medium",
    });
  }

  return found.sort((a, b) => b.amount - a.amount);
}

// =========================================================================
// 6. Cash drawer reconciliation
// =========================================================================

export type DrawerCheck = {
  date: string;
  openingFloat: number;
  cashIn: number;
  cashOut: number;
  expected: number;
  counted: number;
  difference: number; // counted - expected
  status: "balanced" | "over" | "short";
};

/**
 * Compares what the drawer should hold against what was actually counted.
 * Only entries marked as cash count toward the expected figure; if nothing is
 * marked, everything is treated as cash (the common case for a cash-only shop).
 */
export function reconcileDrawer(
  entries: InsightEntry[],
  args: { date: string; counted: number; openingFloat?: number },
): DrawerCheck {
  const openingFloat = args.openingFloat ?? 0;
  const forDay = entries.filter((e) => e.entry_date === args.date);

  const anyMarked = entries.some((e) => e.payment_method);
  const cashEntries = anyMarked
    ? forDay.filter((e) => (e.payment_method ?? "").toLowerCase() === "cash")
    : forDay;

  const cashIn = cashEntries.reduce((s, e) => s + e.amount_in, 0);
  const cashOut = cashEntries.reduce((s, e) => s + e.amount_out, 0);
  const expected = openingFloat + cashIn - cashOut;
  const difference = args.counted - expected;

  return {
    date: args.date,
    openingFloat,
    cashIn,
    cashOut,
    expected,
    counted: args.counted,
    difference,
    status:
      Math.abs(difference) < 0.005 ? "balanced" : difference > 0 ? "over" : "short",
  };
}
