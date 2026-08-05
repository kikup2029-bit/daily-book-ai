/**
 * Answers money questions directly from the owner's own data — no AI service,
 * no API key, no cost. It can never invent a number, and it never goes down.
 *
 * Pure functions over entries, budgets, and recurring rules.
 */

import {
  averageMonthlyOverhead,
  dayOfWeekPatterns,
  forecastCash,
  productMargin,
  taxSetAside,
} from "./insights";

export type AnswerEntry = {
  entry_date: string; // YYYY-MM-DD
  amount_in: number;
  amount_out: number;
  spent_on: string | null;
  merchant?: string | null;
  payment_method?: string | null;
};

export type AnswerGoal = {
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
};

export type AnswerBudget = { category: string; monthly_limit: number };

export type AnswerRecurring = {
  amount: number;
  category: string;
  frequency: "weekly" | "monthly";
  start_date: string;
  active: boolean;
  last_generated_date: string | null;
};

export type AnswerProduct = { name: string; unit_cost: number; sale_price: number };

export type AnswerContext = {
  budgets?: AnswerBudget[];
  recurring?: AnswerRecurring[];
  goals?: AnswerGoal[];
  products?: AnswerProduct[];
  taxRatePercent?: number;
};

// --- formatting -----------------------------------------------------------

const money = (value: number) =>
  `$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const pct = (value: number) => `${Math.round(value)}%`;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// --- dates ----------------------------------------------------------------

const todayISO = () => new Date().toLocaleDateString("en-CA");

function shiftDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-CA");
}

function monthStart(monthsBack = 0) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - monthsBack, 1).toLocaleDateString("en-CA");
}

function monthEnd(monthsBack = 0) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 0).toLocaleDateString(
    "en-CA",
  );
}

function addDaysTo(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-CA");
}

function addMonthsTo(iso: string, months: number) {
  const date = new Date(`${iso}T00:00:00`);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return date.toLocaleDateString("en-CA");
}

function daysBetween(fromISO: string, toISO: string) {
  const ms = new Date(`${toISO}T00:00:00`).getTime() - new Date(`${fromISO}T00:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

// --- aggregation ----------------------------------------------------------

function inRange(entries: AnswerEntry[], from: string, to: string) {
  return entries.filter((entry) => entry.entry_date >= from && entry.entry_date <= to);
}

function totals(entries: AnswerEntry[]) {
  const inSum = entries.reduce((sum, e) => sum + e.amount_in, 0);
  const outSum = entries.reduce((sum, e) => sum + e.amount_out, 0);
  return { inSum, outSum, net: inSum - outSum, count: entries.length };
}

function categoryTotals(entries: AnswerEntry[]) {
  const map = new Map<string, number>();
  for (const entry of entries) {
    if (entry.amount_out <= 0) continue;
    const key = (entry.spent_on ?? "").trim() || "Uncategorized";
    map.set(key, (map.get(key) ?? 0) + entry.amount_out);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function knownCategories(entries: AnswerEntry[], ctx: AnswerContext) {
  const set = new Set<string>();
  for (const e of entries) if (e.spent_on?.trim()) set.add(e.spent_on.trim());
  for (const b of ctx.budgets ?? []) if (b.category?.trim()) set.add(b.category.trim());
  for (const r of ctx.recurring ?? []) if (r.category?.trim()) set.add(r.category.trim());
  return [...set];
}

/** Words people use that map onto whatever they actually named their categories. */
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  groceries: ["grocer", "food", "supermarket"],
  "eating out": ["dining", "restaurant", "food", "takeout", "eat"],
  dining: ["dining", "restaurant", "food", "takeout"],
  shopping: ["shop", "retail", "clothes"],
  rent: ["rent", "housing", "lease"],
  housing: ["rent", "housing", "mortgage"],
  transportation: ["transport", "fuel", "gas", "travel", "car"],
  subscriptions: ["subscription", "software", "membership"],
  utilities: ["utility", "electric", "water", "internet", "phone"],
  supplies: ["supply", "supplies", "materials", "inventory"],
};

function findCategory(question: string, cats: string[]): string | null {
  const q = question.toLowerCase();

  // Direct match on a real category name.
  const direct = cats.find((cat) => q.includes(cat.toLowerCase()));
  if (direct) return direct;

  // Match via a synonym the owner might have used.
  for (const [word, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (!q.includes(word)) continue;
    const hit = cats.find((cat) => {
      const lower = cat.toLowerCase();
      return synonyms.some((syn) => lower.includes(syn));
    });
    if (hit) return hit;
  }
  return null;
}

type Period = { label: string; from: string; to: string };

function detectPeriod(q: string): Period | null {
  if (/\btoday\b/.test(q)) return { label: "today", from: todayISO(), to: todayISO() };
  if (/\byesterday\b/.test(q))
    return { label: "yesterday", from: shiftDays(-1), to: shiftDays(-1) };
  if (/\blast month\b|\bprevious month\b/.test(q))
    return { label: "last month", from: monthStart(1), to: monthEnd(1) };
  if (/\bthis month\b|\bmonthly\b|\bmonth\b/.test(q))
    return { label: "this month", from: monthStart(0), to: monthEnd(0) };
  if (/\bthis week\b|\bweekly\b|\bweek\b/.test(q))
    return { label: "this week", from: shiftDays(-6), to: todayISO() };
  return null;
}

/** Next due date for a recurring rule, based on the last generated occurrence. */
function nextDue(rule: AnswerRecurring): string {
  const base = rule.last_generated_date ?? rule.start_date;
  const step = rule.frequency === "weekly" ? addDaysTo(base, 7) : addMonthsTo(base, 1);
  let next = rule.last_generated_date ? step : rule.start_date;
  const today = todayISO();
  let guard = 0;
  while (next < today && guard < 400) {
    next = rule.frequency === "weekly" ? addDaysTo(next, 7) : addMonthsTo(next, 1);
    guard += 1;
  }
  return next;
}

const CAPABILITIES = `Here's what I can answer from your logged entries:
• Spending — "how much did I spend this week/month?", "what did I spend on rent this month?"
• Categories — "where is most of my money going?", "what's my biggest expense?"
• Comparisons — "how does this month compare with last month?"
• Budgets — "am I on track?", "which budgets have I exceeded?", "how much is left in supplies?"
• Bills — "what's due soon?", "how much do my recurring bills cost?"
• Stores — "which stores did I spend the most at?"
• Goals — "how close am I to my savings goal?"
• Affordability — "can I afford $200?"
• Outlook — "can I cover next month?", "will I make rent?"
• Tax — "how much should I set aside for tax?"
• Busy days — "what's my slowest day?"
• Pricing — "what's my margin on candles?"
• Summaries — "give me a monthly summary", "show my largest transactions"`;

const NOT_TRACKED = (topic: string, alternative: string) =>
  `I don't track ${topic} — this app only knows the income and expenses you log here, not your bank or card accounts. ${alternative}`;

// --- main -----------------------------------------------------------------

export function answerFromEntries(
  entries: AnswerEntry[],
  rawQuestion: string,
  ctx: AnswerContext = {},
): string {
  const q = rawQuestion.toLowerCase().trim();
  const budgets = ctx.budgets ?? [];
  const recurring = (ctx.recurring ?? []).filter((r) => r.active);

  if (entries.length === 0 && budgets.length === 0 && recurring.length === 0) {
    return `You haven't logged anything yet, so there's nothing for me to look at. Add what you made and spent above, then ask me again.\n\n${CAPABILITIES}`;
  }

  const all = totals(entries);
  const cats = knownCategories(entries, ctx);
  const thisMonth = inRange(entries, monthStart(0), monthEnd(0));
  const lastMonth = inRange(entries, monthStart(1), monthEnd(1));

  // === Runway forecast ("can I make rent?") ===============================

  if (
    /\brunway\b|\bmake rent\b|\bafford rent\b|\bcover (my |the )?(bills|rent|costs|expenses)\b|\bnext (month|30 days)\b|\bforecast\b|\brun (out|short)\b|\bwill i be (ok|okay|alright|fine)\b|\bam i going to be (ok|okay)\b/.test(
      q,
    )
  ) {
    const f = forecastCash(entries, recurring, { horizonDays: 30 });

    const billsText =
      f.upcomingBills.length > 0
        ? ` Bills due: ${f.upcomingBills
            .slice(0, 4)
            .map((b) => `${b.category} ${money(b.amount)} on ${b.due}`)
            .join(", ")}.`
        : " You haven't set up any recurring bills for me to count.";

    const confidence = f.lowConfidence
      ? ` This is rough — only ${plural(f.basedOnDays, "day", "days")} of history so far.`
      : "";

    if (f.shortfallDate) {
      return `It'll be tight. On your recent pace (${money(f.dailyIn)} in and ${money(
        f.dailyOut,
      )} out on a typical day) you could run short around ${f.shortfallDate}, dipping to ${money(
        f.lowestPoint.balance,
      )}.${billsText}${confidence}`;
    }

    return `You should be fine. Starting from ${money(f.currentNet)} and on your recent pace (${money(
      f.dailyIn,
    )} in, ${money(f.dailyOut)} out a day), you'd be around ${money(
      f.projectedNet,
    )} in 30 days, never dropping below ${money(f.lowestPoint.balance)}.${billsText}${confidence}`;
  }

  // === Tax set-aside =======================================================

  if (/\btax\b|\btaxes\b|\bset aside\b|\bhold back\b|\bowe.*tax\b/.test(q)) {
    const rate = ctx.taxRatePercent ?? 0;
    if (rate <= 0) {
      return `You haven't set a tax percentage yet — add one on the Tools tab and I'll track how much to hold back from what you earn.`;
    }
    const jar = taxSetAside(entries, rate);
    if (jar.incomeInPeriod <= 0) {
      return `No income logged ${jar.periodLabel} yet, so nothing to set aside.`;
    }
    return `At ${rate}% of the ${money(jar.incomeInPeriod)} you've taken in ${
      jar.periodLabel
    }, you should be holding back ${money(jar.shouldHaveSetAside)}.${
      jar.alreadyPaid > 0 ? ` You've already paid ${money(jar.alreadyPaid)}.` : ""
    } Still to put aside: ${money(
      jar.stillToSetAside,
    )}. (Not tax advice — check the rate with an accountant.)`;
  }

  // === Slow / busy days ====================================================

  if (
    /\bslow(est)? day\b|\bbusiest day\b|\bbest day\b|\bquiet(est)? day\b|\bday of the week\b|\bwhich day\b/.test(
      q,
    )
  ) {
    const p = dayOfWeekPatterns(entries);
    if (!p.enoughData || !p.best || !p.worst) {
      return `I need a few more weeks of entries before day-of-the-week patterns mean anything. Keep logging and ask me again.`;
    }
    return `${p.best.label} is your best day, averaging ${money(p.best.averageIn)} in${
      p.best.vsAverage > 5 ? ` (${Math.round(p.best.vsAverage)}% above your average)` : ""
    }. ${p.worst.label} is quietest at ${money(p.worst.averageIn)}${
      p.worst.vsAverage < -5 ? ` (${Math.round(Math.abs(p.worst.vsAverage))}% below)` : ""
    }.`;
  }

  // === Product margins =====================================================

  if (
    /\bmargin\b|\bmarkup\b|\bprofit per\b|\bper (item|unit|sale)\b|\bhow much.*keep\b|\bpricing\b|\bprice.*right\b/.test(
      q,
    )
  ) {
    const products = ctx.products ?? [];
    if (products.length === 0) {
      return `You haven't added any items yet — put your cost and selling price into the Tools tab and I'll work out what you keep on each sale.`;
    }
    const overhead = averageMonthlyOverhead(entries);

    const named = products.find((p) => q.includes(p.name.toLowerCase()));
    const chosen = named ? [named] : products;

    const lines = chosen.slice(0, 5).map((p) => {
      const m = productMargin(p, overhead > 0 ? overhead : null);
      if (m.grossPerUnit <= 0) {
        return `${p.name}: you're losing ${money(m.grossPerUnit)} on every one — it costs ${money(
          p.unit_cost,
        )} and sells for ${money(p.sale_price)}.`;
      }
      return `${p.name}: you keep ${money(m.grossPerUnit)} per sale (${Math.round(
        m.grossMarginPercent,
      )}% margin)${
        m.unitsToCoverOverhead != null
          ? `, so about ${m.unitsToCoverOverhead} a month covers your usual ${money(
              overhead,
            )} of costs`
          : ""
      }.`;
    });

    return lines.join("\n");
  }

  // === Cash drawer =========================================================

  if (/\bdrawer\b|\btill\b|\bcash count\b|\bcount(ed)? the cash\b|\bcash match\b/.test(q)) {
    const cashEntries = entries.filter((e) => (e.payment_method ?? "").toLowerCase() === "cash");
    const anyMarked = entries.some((e) => e.payment_method);
    const todayCash = (anyMarked ? cashEntries : entries).filter(
      (e) => e.entry_date === todayISO(),
    );
    const cashIn = todayCash.reduce((s, e) => s + e.amount_in, 0);
    const cashOut = todayCash.reduce((s, e) => s + e.amount_out, 0);
    return `Going by what you've logged today, the drawer should be up ${money(
      cashIn - cashOut,
    )} (${money(cashIn)} in, ${money(cashOut)} out)${
      anyMarked ? " counting cash entries only" : ""
    }. Use the Tools tab to enter what you actually counted and I'll show the gap.`;
  }

  // === Things this app genuinely doesn't track =============================

  if (/\bnet worth\b/.test(q)) {
    return NOT_TRACKED(
      "net worth",
      `What I can tell you: across everything you've logged you're ${
        all.net >= 0 ? `up ${money(all.net)}` : `down ${money(all.net)}`
      }.`,
    );
  }
  if (/\bdebt\b|\bcredit.?card\b|\bloan\b|\bowe\b/.test(q)) {
    return NOT_TRACKED(
      "debts, loans, or card balances",
      'If you log debt payments as expenses with a category like "Debt", I can tell you how much you\'ve paid toward it.',
    );
  }
  if (/\bpaycheck\b|\bpayday\b|\bget paid\b/.test(q)) {
    const deposits = entries.filter((e) => e.amount_in > 0);
    const last = deposits[0];
    return NOT_TRACKED(
      "your pay schedule",
      last
        ? `Your most recent money in was ${money(last.amount_in)} on ${last.entry_date}.`
        : "You haven't logged any money coming in yet.",
    );
  }
  // === Savings goals =======================================================

  if (/\bgoal\b|\bsavings goal\b|\bsaving.*for\b|\bon pace\b/.test(q)) {
    const goals = ctx.goals ?? [];
    if (goals.length === 0) {
      return `You haven't set any savings goals yet — you can add one on the "This month" tab. This month you've kept ${
        totals(thisMonth).net >= 0
          ? money(totals(thisMonth).net)
          : `nothing (you're down ${money(totals(thisMonth).net)})`
      }.`;
    }

    // Monthly saving pace, based on the last 3 months of net.
    const paceMonths = [0, 1, 2].map(
      (back) => totals(inRange(entries, monthStart(back), monthEnd(back))).net,
    );
    const positivePace = paceMonths.filter((n) => n > 0);
    const monthlyPace =
      positivePace.length > 0 ? positivePace.reduce((s, n) => s + n, 0) / positivePace.length : 0;

    const lines = goals.map((g) => {
      const remaining = Math.max(0, g.target_amount - g.saved_amount);
      const share = g.target_amount > 0 ? (g.saved_amount / g.target_amount) * 100 : 0;

      if (remaining <= 0) return `${g.name}: reached! ${money(g.saved_amount)} saved.`;

      let pacing = "";
      if (g.target_date) {
        const daysLeft = daysBetween(todayISO(), g.target_date);
        if (daysLeft > 0) {
          const perWeek = remaining / (daysLeft / 7);
          pacing = ` To hit it by ${g.target_date}, save about ${money(perWeek)} a week.`;
        } else {
          pacing = ` The ${g.target_date} target date has passed.`;
        }
      } else if (monthlyPace > 0) {
        const monthsNeeded = Math.ceil(remaining / monthlyPace);
        pacing = ` At your recent pace of ${money(
          monthlyPace,
        )} a month, that's about ${plural(monthsNeeded, "month", "months")} away.`;
      }

      return `${g.name}: ${money(g.saved_amount)} of ${money(g.target_amount)} (${pct(
        share,
      )}), ${money(remaining)} to go.${pacing}`;
    });

    return lines.join("\n");
  }
  if (/\bpending\b/.test(q)) {
    return NOT_TRACKED(
      "pending transactions",
      "Everything here is what you've entered yourself, so nothing is ever 'pending'.",
    );
  }
  // === Merchants ===========================================================

  if (
    /\bmerchants?\b|\bstores?\b|\bshops?\b|\bvendors?\b|\bwhere did i (shop|buy)\b|\bwho did i pay\b/.test(
      q,
    )
  ) {
    const period = detectPeriod(q);
    const scoped = period ? inRange(entries, period.from, period.to) : entries;
    const label = period ? period.label : "overall";

    const map = new Map<string, number>();
    for (const e of scoped) {
      if (e.amount_out <= 0) continue;
      const name = (e.merchant ?? "").trim();
      if (!name) continue;
      map.set(name, (map.get(name) ?? 0) + e.amount_out);
    }
    const list = [...map.entries()].sort((a, b) => b[1] - a[1]);

    if (list.length === 0) {
      return `You haven't recorded where you shopped ${label}. Fill in the "Where?" field when you log an expense (or snap a receipt photo and I'll read the store name off it) and I can break it down by store.`;
    }

    const [topName, topAmount] = list[0];
    const rest = list
      .slice(1, 4)
      .map(([name, amount]) => `${name} ${money(amount)}`)
      .join(", ");
    return `${label === "overall" ? "Overall" : label[0].toUpperCase() + label.slice(1)}, you've spent the most at ${topName}: ${money(
      topAmount,
    )} across ${plural(
      scoped.filter((e) => (e.merchant ?? "").trim() === topName).length,
      "visit",
      "visits",
    )}.${rest ? ` Then: ${rest}.` : ""}`;
  }

  // === Duplicates ==========================================================

  if (/\bcharged twice\b|\bduplicate\b|\bdouble.?charg/.test(q)) {
    const seen = new Map<string, number>();
    for (const e of entries) {
      if (e.amount_out <= 0) continue;
      const key = `${e.entry_date}|${e.amount_out}|${(e.spent_on ?? "").toLowerCase()}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    const dupes = [...seen.entries()].filter(([, count]) => count > 1);
    if (dupes.length === 0)
      return `I don't see any duplicate expenses — nothing logged twice on the same day for the same amount and category.`;
    const list = dupes
      .slice(0, 3)
      .map(([key, count]) => {
        const [date, amount, cat] = key.split("|");
        return `${money(Number(amount))} on ${date}${cat ? ` (${cat})` : ""} appears ${count} times`;
      })
      .join("; ");
    return `Possible duplicates: ${list}. Check those entries and delete any that shouldn't be there.`;
  }

  // === Budgets =============================================================

  const budgetIntent =
    /\bbudget\b|\bon track\b|\bexceed|\bover budget\b|\bleft (in|to spend)\b|\bhow much.*left\b|\bsafely spend\b/.test(
      q,
    );

  if (budgetIntent) {
    if (budgets.length === 0) {
      return `You haven't set any budgets yet — you can add monthly limits per category on the "This month" tab. So far this month you've spent ${money(
        totals(thisMonth).outSum,
      )}.`;
    }

    const spendByCat = new Map(categoryTotals(thisMonth));
    const rows = budgets.map((b) => {
      const spent = spendByCat.get(b.category) ?? 0;
      const share = b.monthly_limit > 0 ? (spent / b.monthly_limit) * 100 : 0;
      return { ...b, spent, share, left: b.monthly_limit - spent };
    });

    // "How much is left in <category>?"
    const askedCat = findCategory(
      q,
      budgets.map((b) => b.category),
    );
    if (askedCat) {
      const row = rows.find((r) => r.category === askedCat)!;
      if (row.left >= 0) {
        return `You've spent ${money(row.spent)} of your ${money(
          row.monthly_limit,
        )} ${row.category} budget this month — ${money(row.left)} left (${pct(row.share)} used).`;
      }
      return `You're over your ${row.category} budget: ${money(row.spent)} spent against a ${money(
        row.monthly_limit,
      )} limit — ${money(Math.abs(row.left))} over.`;
    }

    const over = rows.filter((r) => r.share >= 100);
    const close = rows.filter((r) => r.share >= 80 && r.share < 100);

    if (/\bexceed|\bover budget\b/.test(q)) {
      if (over.length === 0)
        return `Good news — you haven't gone over any budget this month.${
          close.length
            ? ` ${close.map((r) => r.category).join(" and ")} ${close.length === 1 ? "is" : "are"} getting close though.`
            : ""
        }`;
      return `You're over on ${over
        .map((r) => `${r.category} (${money(r.spent)} of ${money(r.monthly_limit)})`)
        .join(", ")}.`;
    }

    if (/\bclose\b/.test(q)) {
      if (close.length === 0 && over.length === 0)
        return `Nothing's close to its limit yet this month. You're within budget everywhere.`;
      const parts = [
        ...close.map((r) => `${r.category} at ${pct(r.share)}`),
        ...over.map((r) => `${r.category} already over`),
      ];
      return `Watch these: ${parts.join(", ")}.`;
    }

    // General "am I on track?" / "how much can I spend?"
    const totalLimit = rows.reduce((s, r) => s + r.monthly_limit, 0);
    const totalSpent = rows.reduce((s, r) => s + r.spent, 0);
    const remaining = totalLimit - totalSpent;
    const daysLeft = Math.max(1, daysBetween(todayISO(), monthEnd(0)) + 1);

    if (/\bsafely spend\b|\bhow much can i spend\b/.test(q)) {
      if (remaining <= 0)
        return `You've already used your full ${money(
          totalLimit,
        )} of budgets this month (${money(totalSpent)} spent), so anything more goes over.`;
      return `You have ${money(remaining)} left across your budgets, with ${plural(
        daysLeft,
        "day",
        "days",
      )} to go — that's about ${money(remaining / daysLeft)} a day.`;
    }

    const status =
      over.length > 0
        ? `You're over on ${over.map((r) => r.category).join(", ")}.`
        : close.length > 0
          ? `Getting close on ${close.map((r) => r.category).join(", ")}.`
          : `You're within budget everywhere.`;
    return `${status} Overall you've spent ${money(totalSpent)} of ${money(
      totalLimit,
    )} budgeted this month — ${money(Math.abs(remaining))} ${remaining >= 0 ? "left" : "over"}.`;
  }

  // === Recurring bills / subscriptions ====================================

  if (/\bbill|\bsubscription|\brecurring\b|\brenew|\bdue\b/.test(q)) {
    if (recurring.length === 0) {
      return `You haven't set up any recurring bills yet — you can add them on the "This month" tab so they get logged automatically.`;
    }

    const monthlyCost = recurring.reduce(
      (sum, r) => sum + (r.frequency === "weekly" ? (r.amount * 52) / 12 : r.amount),
      0,
    );

    if (/\bhow much\b|\bcost\b|\btotal\b/.test(q)) {
      const list = recurring
        .map((r) => `${r.category} ${money(r.amount)} ${r.frequency}`)
        .join(", ");
      return `Your recurring bills come to about ${money(monthlyCost)} a month: ${list}.`;
    }

    const upcoming = recurring
      .map((r) => ({ ...r, due: nextDue(r) }))
      .sort((a, b) => a.due.localeCompare(b.due));

    const withinDays = /\bweek\b/.test(q) ? 7 : 14;
    const cutoff = shiftDays(withinDays);
    const soon = upcoming.filter((r) => r.due <= cutoff);

    if (soon.length === 0) {
      const next = upcoming[0];
      return `Nothing due in the next ${plural(withinDays, "day", "days")}. Your next one is ${
        next.category
      } for ${money(next.amount)} on ${next.due}.`;
    }

    return `Due in the next ${plural(withinDays, "day", "days")}: ${soon
      .map((r) => `${r.category} ${money(r.amount)} on ${r.due}`)
      .join(", ")}. That's ${money(soon.reduce((s, r) => s + r.amount, 0))} altogether.`;
  }

  // === Affordability ======================================================

  if (/\bafford\b|\bcan i (buy|spend|get)\b|\bshould i buy\b|\bwhat happens if i buy\b/.test(q)) {
    const amountMatch = q.match(/\$?\s*([\d,]+(?:\.\d{1,2})?)/);
    const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : null;
    const last30 = totals(inRange(entries, shiftDays(-29), todayISO()));

    if (amount && amount > 0) {
      const after = all.net - amount;
      if (all.net <= 0)
        return `Careful — you're already down ${money(all.net)} overall, so ${money(
          amount,
        )} would put you ${money(Math.abs(after))} in the hole.`;
      if (after < 0)
        return `That's a stretch. You're up ${money(all.net)}, so ${money(
          amount,
        )} is more than you've cleared — it'd leave you down ${money(Math.abs(after))}.`;
      return `Looks doable. You're up ${money(all.net)}, so ${money(
        amount,
      )} would still leave you ${money(after)} ahead. Last 30 days: ${money(
        last30.inSum,
      )} in, ${money(last30.outSum)} out.`;
    }

    return `Tell me roughly the amount (like "can I afford $200?") and I'll check it. Right now you're ${
      all.net >= 0 ? `up ${money(all.net)}` : `down ${money(all.net)}`
    } overall, with ${money(last30.inSum)} in and ${money(last30.outSum)} out in the last 30 days.`;
  }

  // === Month-over-month comparison ========================================

  if (
    /\bcompare\b|\bversus\b|\bvs\b|\bmore or less than\b|\bbetter off\b|\bincreas|\bdecreas|\btrend\b/.test(
      q,
    )
  ) {
    const a = totals(thisMonth);
    const b = totals(lastMonth);

    if (b.count === 0)
      return `You don't have anything logged for last month yet, so there's nothing to compare. This month: ${money(
        a.inSum,
      )} in, ${money(a.outSum)} out.`;

    const spendDiff = a.outSum - b.outSum;
    const netDiff = a.net - b.net;

    if (/\bincreas|\bdecreas/.test(q)) {
      const thisCats = new Map(categoryTotals(thisMonth));
      const lastCats = new Map(categoryTotals(lastMonth));
      const names = new Set([...thisCats.keys(), ...lastCats.keys()]);
      const deltas = [...names]
        .map((name) => ({
          name,
          delta: (thisCats.get(name) ?? 0) - (lastCats.get(name) ?? 0),
        }))
        .filter((d) => Math.abs(d.delta) > 0.005)
        .sort((x, y) => y.delta - x.delta);

      if (deltas.length === 0)
        return `Your category spending is basically unchanged from last month.`;

      const up = deltas.filter((d) => d.delta > 0).slice(0, 3);
      const down = deltas
        .filter((d) => d.delta < 0)
        .slice(-3)
        .reverse();
      const upText = up.length
        ? `Up: ${up.map((d) => `${d.name} +${money(d.delta)}`).join(", ")}.`
        : "";
      const downText = down.length
        ? ` Down: ${down.map((d) => `${d.name} −${money(d.delta)}`).join(", ")}.`
        : "";
      return `${upText}${downText}`.trim();
    }

    return `This month you've spent ${money(a.outSum)} versus ${money(b.outSum)} last month — ${
      spendDiff > 0
        ? `${money(spendDiff)} more`
        : spendDiff < 0
          ? `${money(spendDiff)} less`
          : "the same"
    }. On the bottom line you're ${
      a.net >= 0 ? `up ${money(a.net)}` : `down ${money(a.net)}`
    } this month versus ${b.net >= 0 ? `up ${money(b.net)}` : `down ${money(b.net)}`} last month${
      netDiff !== 0 ? ` (${netDiff > 0 ? "better" : "worse"} by ${money(netDiff)})` : ""
    }.`;
  }

  // === Averages ===========================================================

  if (/\baverage\b|\btypical\b/.test(q)) {
    const dates = entries.map((e) => e.entry_date).sort();
    const spanDays = Math.max(1, daysBetween(dates[0], todayISO()) + 1);
    const perDay = all.outSum / spanDays;
    if (/\bweek/.test(q))
      return `You're averaging about ${money(perDay * 7)} of spending a week, based on ${plural(
        spanDays,
        "day",
        "days",
      )} of records.`;
    return `You're averaging about ${money(perDay * 30)} of spending a month (${money(
      perDay,
    )} a day), based on ${plural(spanDays, "day", "days")} of records.`;
  }

  // === Largest transactions / recent activity =============================

  if (/\blargest transaction|\bbiggest transaction|\blargest expense[s]?\b(?!.*categor)/.test(q)) {
    const top = entries
      .filter((e) => e.amount_out > 0)
      .sort((a, b) => b.amount_out - a.amount_out)
      .slice(0, 3);
    if (top.length === 0) return `You haven't logged any expenses yet.`;
    return `Your largest expenses: ${top
      .map(
        (e) => `${money(e.amount_out)} on ${e.entry_date}${e.spent_on ? ` (${e.spent_on})` : ""}`,
      )
      .join(", ")}.`;
  }

  if (/\blast transaction\b|\bmost recent\b|\brecent spending\b|\brecent\b/.test(q)) {
    if (/\bdeposit\b|\bincome\b|\bmoney in\b/.test(q)) {
      const dep = entries.find((e) => e.amount_in > 0);
      return dep
        ? `Your last money in was ${money(dep.amount_in)} on ${dep.entry_date}.`
        : `You haven't logged any money coming in yet.`;
    }
    const recent = entries.slice(0, 3);
    return `Your most recent entries: ${recent
      .map(
        (e) =>
          `${e.entry_date} — ${
            e.amount_in > 0 ? `${money(e.amount_in)} in` : ""
          }${e.amount_in > 0 && e.amount_out > 0 ? ", " : ""}${
            e.amount_out > 0 ? `${money(e.amount_out)} out` : ""
          }${e.spent_on ? ` (${e.spent_on})` : ""}`,
      )
      .join("; ")}.`;
  }

  // === Unusual spending ===================================================

  if (/\bunusual\b|\bmore than normal\b|\bweird\b|\bstands out\b|\bneed review\b/.test(q)) {
    const expenses = entries.filter((e) => e.amount_out > 0);
    if (expenses.length < 3)
      return `You don't have enough logged yet for me to spot anything unusual.`;
    const avg = expenses.reduce((s, e) => s + e.amount_out, 0) / expenses.length;
    const outliers = expenses.filter((e) => e.amount_out > avg * 2).slice(0, 3);
    if (outliers.length === 0)
      return `Nothing looks out of the ordinary — your expenses are all fairly close to your usual ${money(
        avg,
      )} average.`;
    return `These stand out against your ${money(avg)} average: ${outliers
      .map(
        (e) => `${money(e.amount_out)} on ${e.entry_date}${e.spent_on ? ` (${e.spent_on})` : ""}`,
      )
      .join(", ")}.`;
  }

  // === Saving rate ========================================================

  if (/\bsaved\b|\bsaving\b|\bsave\b|\bput away\b/.test(q)) {
    const m = totals(thisMonth);
    if (m.inSum <= 0)
      return `You haven't logged any income this month, so there's nothing to have saved from yet.`;
    if (m.net <= 0)
      return `You haven't saved anything this month — you've spent ${money(
        m.outSum,
      )} against ${money(m.inSum)} coming in, so you're down ${money(m.net)}.`;
    return `You've kept ${money(m.net)} this month — that's ${pct(
      (m.net / m.inSum) * 100,
    )} of the ${money(m.inSum)} you took in.`;
  }

  // === Category-specific spending =========================================

  const askedCategory = findCategory(q, cats);
  if (askedCategory && /\bspend|\bspent|\bcost|\bhow much\b/.test(q)) {
    const period = detectPeriod(q) ?? {
      label: "in total",
      from: "0000-01-01",
      to: "9999-12-31",
    };
    const scoped = inRange(entries, period.from, period.to).filter(
      (e) => (e.spent_on ?? "").trim().toLowerCase() === askedCategory.toLowerCase(),
    );
    const spent = scoped.reduce((s, e) => s + e.amount_out, 0);
    if (spent === 0) return `You haven't logged any ${askedCategory} spending ${period.label}.`;

    const budget = budgets.find((b) => b.category === askedCategory);
    const budgetNote =
      budget && period.label === "this month"
        ? ` That's ${pct((spent / budget.monthly_limit) * 100)} of your ${money(
            budget.monthly_limit,
          )} budget.`
        : "";
    return `You've spent ${money(spent)} on ${askedCategory} ${period.label}, across ${plural(
      scoped.length,
      "entry",
      "entries",
    )}.${budgetNote}`;
  }

  // === Biggest expense / where money goes =================================

  if (
    /\bspend the most\b|\bspent the most\b|\bbiggest (expense|cost|spend)\b|\bmost expensive\b|\bwhere.*money.*go|\bbreakdown\b|\bcategor|\bby category\b/.test(
      q,
    )
  ) {
    const period = detectPeriod(q);
    const scoped = period ? inRange(entries, period.from, period.to) : entries;
    const label = period ? period.label : "overall";
    const list = categoryTotals(scoped);
    if (list.length === 0) return `No spending logged ${label} yet.`;

    const scopedOut = totals(scoped).outSum;
    const [topName, topAmount] = list[0];
    const rest = list
      .slice(1, 4)
      .map(([name, amount]) => `${name} ${money(amount)}`)
      .join(", ");
    return `${label === "overall" ? "Overall" : label[0].toUpperCase() + label.slice(1)}, your biggest expense is ${topName} at ${money(
      topAmount,
    )} — about ${pct((topAmount / scopedOut) * 100)} of the ${money(scopedOut)} you spent.${
      rest ? ` Then: ${rest}.` : ""
    }`;
  }

  // === Income / spending totals (period-aware) ============================

  const incomeIntent =
    /\bincome\b|\bhow much.*(made|earn|revenue|took in|brought in)\b|\bdeposit\b/.test(q);
  const spendIntent =
    /\bhow much.*(spent|spend|paid|cost)\b|\btotal (spending|expenses|spent)\b/.test(q);

  if (incomeIntent || spendIntent) {
    const p = detectPeriod(q);
    const scoped = p ? inRange(entries, p.from, p.to) : entries;
    const t = totals(scoped);
    const when = p ? p.label : "in total";

    if (incomeIntent) {
      if (t.inSum === 0) return `No money coming in logged ${when}.`;
      return `You took in ${money(t.inSum)} ${when}, against ${money(t.outSum)} spent — ${
        t.net >= 0 ? `up ${money(t.net)}` : `down ${money(t.net)}`
      }.`;
    }

    if (t.outSum === 0) return `No spending logged ${when}.`;
    const top = categoryTotals(scoped)[0];
    return `You've spent ${money(t.outSum)} ${when}.${
      top ? ` The largest chunk is ${top[0]} at ${money(top[1])}.` : ""
    } You took in ${money(t.inSum)} over the same time.`;
  }

  // === Summaries and period questions =====================================

  const period = detectPeriod(q);
  if (
    period ||
    /\bsummary\b|\bhow am i doing\b|\bcash flow\b|\bincome versus\b|\bincome vs\b/.test(q)
  ) {
    const p = period ?? { label: "this month", from: monthStart(0), to: monthEnd(0) };
    const scoped = inRange(entries, p.from, p.to);
    const t = totals(scoped);
    if (t.count === 0) return `Nothing logged ${p.label} yet.`;

    const top = categoryTotals(scoped)[0];
    const verdict =
      t.net > 0
        ? `you're up ${money(t.net)}`
        : t.net < 0
          ? `you're down ${money(t.net)}`
          : `you broke even`;

    return `${p.label[0].toUpperCase()}${p.label.slice(1)}: ${money(t.inSum)} in, ${money(
      t.outSum,
    )} out, so ${verdict} across ${plural(t.count, "entry", "entries")}.${
      top ? ` Biggest expense: ${top[0]} at ${money(top[1])}.` : ""
    }`;
  }

  // === Plain totals =======================================================

  if (/\bhow much.*(made|earn|income|revenue|took in|brought in)\b|\btotal income\b/.test(q)) {
    return `You've taken in ${money(all.inSum)} in total across ${plural(
      all.count,
      "entry",
      "entries",
    )}. Against ${money(all.outSum)} spent, that leaves you ${
      all.net >= 0 ? `up ${money(all.net)}` : `down ${money(all.net)}`
    }.`;
  }

  if (/\bhow much.*(spent|spend|paid|cost)\b|\btotal (spending|expenses|spent)\b/.test(q)) {
    const top = categoryTotals(entries)[0];
    return `You've spent ${money(all.outSum)} in total.${
      top ? ` The largest chunk is ${top[0]} at ${money(top[1])}.` : ""
    } You've taken in ${money(all.inSum)} over the same time.`;
  }

  if (
    /\b(profit|making money|losing money|net|bottom line|in the green|in the red|money do i have|balance)\b/.test(
      q,
    )
  ) {
    const caveat = /\bbalance\b|\bmoney do i have\b/.test(q)
      ? " (based on what you've logged here, not your actual bank balance)"
      : "";
    if (all.net > 0)
      return `You're ahead by ${money(all.net)}${caveat} — ${money(all.inSum)} in and ${money(
        all.outSum,
      )} out.`;
    if (all.net < 0)
      return `You're down ${money(all.net)}${caveat} — ${money(all.inSum)} in versus ${money(
        all.outSum,
      )} out.`;
    return `You're exactly break-even${caveat} — ${money(all.inSum)} in and ${money(all.outSum)} out.`;
  }

  // === Fallback ===========================================================

  return `I'm not sure how to answer that one. Where you stand: ${money(all.inSum)} in, ${money(
    all.outSum,
  )} out, ${all.net >= 0 ? `up ${money(all.net)}` : `down ${money(all.net)}`} overall.\n\n${CAPABILITIES}`;
}
