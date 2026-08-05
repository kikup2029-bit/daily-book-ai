/**
 * Section components shared by the sidebar routes.
 * Extracted from the original single-page layout so each route can render
 * just the part it needs.
 */

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ChevronLeft, ChevronRight, Pencil, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { getEntries } from "@/lib/books.functions";
import {
  getBudgets,
  getGoals,
  getRecurring,
  removeBudget,
  removeGoal,
  removeRecurring,
  saveBudget,
  saveGoal,
  saveRecurring,
} from "@/lib/planning.functions";
import { getInsights } from "@/lib/shop.functions";

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const monthLabel = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
};

const shiftMonth = (key: string, delta: number) => {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return monthKey(date);
};

const daysInMonth = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month, 0).getDate();
};

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export type MonthPart =
  | "totals"
  | "categories"
  | "daybyday"
  | "budgets"
  | "goals"
  | "recurring"
  | "bills";

const ALL_PARTS: MonthPart[] = [
  "totals",
  "categories",
  "daybyday",
  "budgets",
  "goals",
  "recurring",
  "bills",
];

const MONTH_STORAGE_KEY = "simplebooks.month";

/**
 * The month view. `parts` picks which cards to render so the sidebar can link
 * to one at a time; the chosen month is remembered across those pages.
 */
export function MonthlyPage({ parts = ALL_PARTS }: { parts?: MonthPart[] } = {}) {
  const show = (part: MonthPart) => parts.includes(part);
  const fetchEntries = useServerFn(getEntries);
  const fetchRecurring = useServerFn(getRecurring);
  const fetchBudgets = useServerFn(getBudgets);

  const [month, setMonth] = useState(() => {
    try {
      const saved = sessionStorage.getItem(MONTH_STORAGE_KEY);
      if (saved && /^\d{4}-\d{2}$/.test(saved)) return saved;
    } catch {
      // Storage can be blocked; fall back to the current month.
    }
    return monthKey(new Date());
  });

  // Remember it so moving between the month pages keeps the same month.
  useEffect(() => {
    try {
      sessionStorage.setItem(MONTH_STORAGE_KEY, month);
    } catch {
      // Ignore: not being able to remember is harmless.
    }
  }, [month]);

  // Recurring rules are fetched first: fetching them also creates any expense
  // entries they owe, so the month totals below include them.
  const { data: recurring = [] } = useQuery({
    queryKey: ["recurring"],
    queryFn: () => fetchRecurring(),
  });
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries", recurring.length],
    queryFn: () => fetchEntries(),
  });
  const { data: budgets = [] } = useQuery({ queryKey: ["budgets"], queryFn: () => fetchBudgets() });

  const monthEntries = useMemo(
    () => entries.filter((entry) => entry.entry_date.startsWith(month)),
    [entries, month],
  );

  const totalIn = monthEntries.reduce((sum, entry) => sum + entry.amount_in, 0);
  const totalOut = monthEntries.reduce((sum, entry) => sum + entry.amount_out, 0);
  const net = totalIn - totalOut;

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of monthEntries) {
      if (entry.amount_out <= 0) continue;
      const key = (entry.spent_on ?? "").trim() || "Uncategorized";
      map.set(key, (map.get(key) ?? 0) + entry.amount_out);
    }
    return [...map.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthEntries]);

  const dailyNet = useMemo(() => {
    const total = daysInMonth(month);
    const map = new Map<string, number>();
    for (const entry of monthEntries) {
      const day = entry.entry_date.slice(8, 10);
      map.set(day, (map.get(day) ?? 0) + entry.amount_in - entry.amount_out);
    }
    return Array.from({ length: total }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      return { day: String(index + 1), net: Number((map.get(day) ?? 0).toFixed(2)) };
    });
  }, [monthEntries, month]);

  const budgetRows = budgets.map((budget) => {
    const spent = byCategory.find(
      (row) => row.name.toLowerCase() === budget.category.toLowerCase(),
    )?.amount;
    const used = spent ?? 0;
    const pct = budget.monthly_limit > 0 ? (used / budget.monthly_limit) * 100 : 0;
    return { ...budget, used, pct };
  });

  const alerts = budgetRows.filter((row) => row.pct >= 80);

  return (
    <main className="w-full max-w-2xl">

      <section className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous month"
            onClick={() => setMonth((current) => shiftMonth(current, -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="text-lg font-bold">{monthLabel(month)}</h2>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next month"
            onClick={() => setMonth((current) => shiftMonth(current, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {alerts.length > 0 ? (
          <div
            className={`mt-4 flex items-start gap-2 rounded-2xl p-3 text-sm ${
              alerts.some((row) => row.pct >= 100)
                ? "bg-danger-soft text-danger"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              {alerts
                .map((row) =>
                  row.pct >= 100
                    ? `${row.category} is over budget`
                    : `${row.category} is at ${Math.round(row.pct)}% of budget`,
                )
                .join(" · ")}
            </p>
          </div>
        ) : null}

        {show("totals") ? (
        <>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-success-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-success">Money in</p>
            <p className="mt-1 text-xl font-bold">{money(totalIn)}</p>
          </div>
          <div className="rounded-2xl bg-danger-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-danger">Money out</p>
            <p className="mt-1 text-xl font-bold">{money(totalOut)}</p>
          </div>
        </div>

        <div
          className={`mt-3 rounded-2xl p-4 text-center ${
            net > 0
              ? "bg-success text-success-foreground"
              : net < 0
                ? "bg-danger text-danger-foreground"
                : "bg-muted text-foreground"
          }`}
        >
          <p className="text-sm font-semibold">
            {net > 0 ? "Profit this month" : net < 0 ? "Loss this month" : "Break even this month"}
          </p>
          <p className="mt-0.5 text-2xl font-bold">{money(Math.abs(net))}</p>
        </div>
        </>
        ) : null}

        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading your numbers…</p>
        ) : null}
      </section>

      {show("categories") ? (
      <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Where the money went</h2>
        {byCategory.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No spending logged for this month yet.
          </p>
        ) : (
          <>
            <div className="mt-2 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} dataKey="amount" nameKey="name" outerRadius={80} label>
                    {byCategory.map((row, index) => (
                      <Cell key={row.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => money(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 divide-y">
              {byCategory.map((row, index) => (
                <li key={row.name} className="flex items-center justify-between py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-full"
                      style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    {row.name}
                  </span>
                  <span className="tabular-nums font-semibold">{money(row.amount)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      ) : null}

      {show("daybyday") ? (
      <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Day by day</h2>
        <p className="mt-1 text-sm text-muted-foreground">Green bars are good days, red are not.</p>
        <div className="mt-3 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyNet}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <Tooltip
                formatter={(value: number) => money(value)}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                {dailyNet.map((row) => (
                  <Cell
                    key={row.day}
                    fill={row.net < 0 ? "var(--color-danger)" : "var(--color-success)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      ) : null}

      {show("budgets") ? (
        <BudgetsSection rows={budgetRows} categories={byCategory.map((row) => row.name)} />
      ) : null}
      {show("goals") ? <GoalsSection /> : null}
      {show("recurring") ? <RecurringSection rules={recurring} /> : null}
    </main>
  );
}

/**
 * Runway forecast, tax set-aside, weekly digest and slow-day pattern — all
 * computed server-side from the owner's own entries.
 */
export function InsightsSection() {
  const fetchInsights = useServerFn(getInsights);
  const { data, isLoading } = useQuery({ queryKey: ["insights"], queryFn: () => fetchInsights() });

  if (isLoading) {
    return (
      <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Working out your outlook…</p>
      </section>
    );
  }
  if (!data) return null;

  const { forecast, tax, dayPatterns, digest } = data;

  return (
    <>
      {/* ---------- Weekly digest ---------- */}
      <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Your week in plain English</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {digest.weekFrom} to {digest.weekTo}
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          {digest.lines.map((line, index) => (
            <li key={index} className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Cash runway ---------- */}
      <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Can you cover what&apos;s coming?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Next {forecast.horizonDays} days, based on your last {forecast.basedOnDays} days and the
          bills you&apos;ve set up.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-muted p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Where you are
            </p>
            <p className="mt-0.5 text-lg font-bold">{money(forecast.currentNet)}</p>
          </div>
          <div
            className={`rounded-2xl p-3 ${
              forecast.projectedNet >= 0 ? "bg-success-soft" : "bg-danger-soft"
            }`}
          >
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${
                forecast.projectedNet >= 0 ? "text-success" : "text-danger"
              }`}
            >
              In {forecast.horizonDays} days
            </p>
            <p className="mt-0.5 text-lg font-bold">
              {forecast.projectedNet < 0 ? "−" : ""}
              {money(forecast.projectedNet)}
            </p>
          </div>
        </div>

        {forecast.shortfallDate ? (
          <div className="mt-3 rounded-2xl bg-danger p-3 text-danger-foreground">
            <p className="text-sm font-semibold">
              Heads up — you could run short around {forecast.shortfallDate}.
            </p>
            <p className="mt-0.5 text-xs">
              Lowest point is {money(forecast.lowestPoint.balance)} on {forecast.lowestPoint.date}.
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-success">
            You stay in the black the whole time — lowest point is{" "}
            {money(forecast.lowestPoint.balance)} on {forecast.lowestPoint.date}.
          </p>
        )}

        <p className="mt-3 text-sm text-muted-foreground">
          Typical day: {money(forecast.dailyIn)} in, {money(forecast.dailyOut)} out.
        </p>

        {forecast.upcomingBills.length > 0 ? (
          <div className="mt-3 border-t pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bills coming up
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {forecast.upcomingBills.slice(0, 6).map((bill, index) => (
                <li key={index} className="flex justify-between gap-2">
                  <span>
                    {bill.category} <span className="text-muted-foreground">· {bill.due}</span>
                  </span>
                  <span className="tabular-nums">{money(bill.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {forecast.lowConfidence ? (
          <p className="mt-3 text-xs text-muted-foreground">
            This is a rough guess — you&apos;ve only got {forecast.basedOnDays} days logged. It gets
            more accurate as you keep going.
          </p>
        ) : null}
      </section>

      {/* ---------- Tax jar ---------- */}
      <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Tax set-aside</h2>
        {tax.ratePercent <= 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Set a percentage on the Tools tab and I&apos;ll keep a running total of what to hold back
            for tax.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Holding back {tax.ratePercent}% of the {money(tax.incomeInPeriod)} you&apos;ve taken in{" "}
              {tax.periodLabel}.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Should set aside
                </p>
                <p className="mt-0.5 text-lg font-bold">{money(tax.shouldHaveSetAside)}</p>
              </div>
              <div className="rounded-2xl bg-success-soft p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-success">
                  Already paid
                </p>
                <p className="mt-0.5 text-lg font-bold">{money(tax.alreadyPaid)}</p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-primary p-3 text-center text-primary-foreground">
              <p className="text-sm font-semibold">Still to put aside</p>
              <p className="mt-0.5 text-2xl font-bold">{money(tax.stillToSetAside)}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Log tax payments with &ldquo;tax&rdquo; in the category and they&apos;ll count here.
              Not tax advice — confirm your rate with an accountant.
            </p>
          </>
        )}
      </section>

      {/* ---------- Bill calendar ---------- */}
      <BillCalendarSection calendar={data.calendar} />

      {/* ---------- Detected subscriptions ---------- */}
      <DetectedRecurringSection detected={data.detectedRecurring} />

      {/* ---------- Day patterns ---------- */}
      {dayPatterns.enoughData && dayPatterns.best && dayPatterns.worst ? (
        <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-bold">Your busy and quiet days</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Average money in per day of the week.
          </p>

          <div className="mt-4 space-y-2">
            {[...dayPatterns.patterns]
              .sort((a, b) => b.averageIn - a.averageIn)
              .map((pattern) => {
                const max = dayPatterns.best!.averageIn || 1;
                const width = Math.max(2, (pattern.averageIn / max) * 100);
                return (
                  <div key={pattern.weekday} className="flex items-center gap-3 text-sm">
                    <span className="w-20 shrink-0 text-muted-foreground">{pattern.label}</span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${width}%` }}
                      />
                    </span>
                    <span className="w-20 shrink-0 text-right tabular-nums">
                      {money(pattern.averageIn)}
                    </span>
                  </div>
                );
              })}
          </div>

          <p className="mt-4 text-sm">
            <span className="font-semibold">{dayPatterns.best.label}</span> is your best day
            {dayPatterns.best.vsAverage > 5
              ? ` (${Math.round(dayPatterns.best.vsAverage)}% above your average)`
              : ""}
            , and <span className="font-semibold">{dayPatterns.worst.label}</span> is your quietest
            {dayPatterns.worst.vsAverage < -5
              ? ` (${Math.round(Math.abs(dayPatterns.worst.vsAverage))}% below)`
              : ""}
            .
          </p>
        </section>
      ) : null}
    </>
  );
}

/** What's due and when, grouped so it reads like a calendar. */
export function BillCalendarSection({
  calendar,
}: {
  calendar: Array<{ category: string; amount: number; due: string; daysAway: number }>;
}) {
  if (calendar.length === 0) return null;

  const groups: Array<{ heading: string; bills: typeof calendar }> = [
    { heading: "This week", bills: calendar.filter((b) => b.daysAway <= 7) },
    {
      heading: "Next 3 weeks",
      bills: calendar.filter((b) => b.daysAway > 7 && b.daysAway <= 28),
    },
    { heading: "Later", bills: calendar.filter((b) => b.daysAway > 28) },
  ].filter((group) => group.bills.length > 0);

  const total = calendar.reduce((sum, b) => sum + b.amount, 0);

  return (
    <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">What&apos;s due</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {money(total)} of bills over the next 45 days.
      </p>

      <div className="mt-4 space-y-4">
        {groups.map((group) => (
          <div key={group.heading}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.heading} · {money(group.bills.reduce((s, b) => s + b.amount, 0))}
            </p>
            <ul className="mt-2 divide-y">
              {group.bills.map((bill, index) => (
                <li key={index} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="font-semibold">{bill.category}</span>
                    <span className="ml-2 text-muted-foreground">
                      {bill.due}
                      {bill.daysAway === 0
                        ? " · today"
                        : bill.daysAway === 1
                          ? " · tomorrow"
                          : ` · in ${bill.daysAway} days`}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 tabular-nums ${
                      bill.daysAway <= 5 ? "font-semibold text-danger" : ""
                    }`}
                  >
                    {money(bill.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Charges that look like subscriptions or regular bills, spotted from the
 * owner's own history. One tap turns a suggestion into a tracked bill.
 */
export function DetectedRecurringSection({
  detected,
}: {
  detected: Array<{
    label: string;
    category: string;
    amount: number;
    frequency: "weekly" | "monthly";
    occurrences: number;
    nextExpected: string;
    confidence: "high" | "medium";
  }>;
}) {
  const queryClient = useQueryClient();
  const upsert = useServerFn(saveRecurring);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const accept = useMutation({
    mutationFn: (item: (typeof detected)[number]) =>
      upsert({
        data: {
          amount: item.amount,
          category: item.category,
          frequency: item.frequency,
          start_date: item.nextExpected,
          active: true,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });

  // All hooks are above this point — safe to bail out now.
  const visible = detected.filter((item) => !dismissed.includes(item.label));
  if (visible.length === 0) return null;

  return (
    <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">Looks like a regular bill</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        I spotted these repeating in your entries. Track them and they&apos;ll show up in your
        outlook and bill reminders.
      </p>

      <ul className="mt-4 space-y-3">
        {visible.map((item) => (
          <li key={item.label} className="rounded-2xl border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold">
                  {item.label}{" "}
                  {item.confidence === "medium" ? (
                    <span className="text-xs font-normal text-muted-foreground">(maybe)</span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {money(item.amount)} {item.frequency} · seen {item.occurrences} times · next
                  around {item.nextExpected}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Dismiss ${item.label}`}
                onClick={() => setDismissed((prev) => [...prev, item.label])}
                className="text-muted-foreground hover:text-danger"
              >
                <X className="size-4" />
              </button>
            </div>
            <Button
              type="button"
              size="sm"
              className="mt-3 w-full"
              disabled={accept.isPending}
              onClick={() => {
                accept.mutate(item);
                setDismissed((prev) => [...prev, item.label]);
              }}
            >
              Track this bill
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GoalsSection() {
  const queryClient = useQueryClient();
  const fetchGoals = useServerFn(getGoals);
  const upsert = useServerFn(saveGoal);
  const drop = useServerFn(removeGoal);

  const { data: goals = [] } = useQuery({ queryKey: ["goals"], queryFn: () => fetchGoals() });

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["goals"] });

  const save = useMutation({
    mutationFn: (input: {
      id?: string | null;
      name: string;
      target_amount: number;
      saved_amount: number;
      target_date: string | null;
    }) => upsert({ data: input }),
    onSuccess: () => {
      setName("");
      setTarget("");
      setSaved("");
      setTargetDate("");
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => drop({ data: { id } }),
    onSuccess: invalidate,
  });

  return (
    <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">Savings goals</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Something you're putting money aside for — track how close you are.
      </p>

      {goals.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {goals.map((goal) => {
            const share =
              goal.target_amount > 0 ? (goal.saved_amount / goal.target_amount) * 100 : 0;
            const remaining = Math.max(0, goal.target_amount - goal.saved_amount);
            return (
              <li key={goal.id}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold">{goal.name}</span>
                  <span className="flex items-center gap-2 tabular-nums">
                    {money(goal.saved_amount)} / {money(goal.target_amount)}
                    {share >= 100 ? (
                      <span className="rounded-full bg-success px-2 py-0.5 text-xs font-semibold text-success-foreground">
                        Reached
                      </span>
                    ) : null}
                    <button
                      type="button"
                      aria-label={`Remove ${goal.name} goal`}
                      onClick={() => remove.mutate(goal.id)}
                      className="text-muted-foreground hover:text-danger"
                    >
                      <X className="size-4" />
                    </button>
                  </span>
                </div>
                <Progress value={Math.min(share, 100)} className="mt-2 h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {remaining > 0 ? `${money(remaining)} to go` : "Goal reached"}
                  {goal.target_date ? ` · by ${goal.target_date}` : ""}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">No goals yet.</p>
      )}

      <form
        className="mt-5 space-y-3 border-t pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          const targetAmount = Number(target || 0);
          if (!name.trim() || !(targetAmount > 0)) return;
          save.mutate({
            name: name.trim(),
            target_amount: targetAmount,
            saved_amount: Number(saved || 0),
            target_date: targetDate || null,
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="goal-name">What for?</Label>
            <Input
              id="goal-name"
              placeholder="New oven"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-target">Target amount</Label>
            <Input
              id="goal-target"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="2000"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-saved">Saved so far</Label>
            <Input
              id="goal-saved"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0"
              value={saved}
              onChange={(event) => setSaved(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-date">Target date (optional)</Label>
            <Input
              id="goal-date"
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save goal"}
        </Button>
      </form>
    </section>
  );
}

export function BudgetsSection({
  rows,
  categories,
}: {
  rows: { id: string; category: string; monthly_limit: number; used: number; pct: number }[];
  categories: string[];
}) {
  const queryClient = useQueryClient();
  const upsert = useServerFn(saveBudget);
  const drop = useServerFn(removeBudget);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["budgets"] });

  const save = useMutation({
    mutationFn: (input: { category: string; monthly_limit: number }) => upsert({ data: input }),
    onSuccess: () => {
      setCategory("");
      setLimit("");
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => drop({ data: { id } }),
    onSuccess: invalidate,
  });

  return (
    <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">Budget limits</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Set a monthly cap per category and watch the bars.
      </p>

      {rows.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {rows.map((row) => (
            <li key={row.id}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-semibold">{row.category}</span>
                <span className="flex items-center gap-2 tabular-nums">
                  {money(row.used)} / {money(row.monthly_limit)}
                  {row.pct >= 100 ? (
                    <span className="rounded-full bg-danger px-2 py-0.5 text-xs font-semibold text-danger-foreground">
                      Over
                    </span>
                  ) : row.pct >= 80 ? (
                    <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
                      Close
                    </span>
                  ) : null}
                  <button
                    type="button"
                    aria-label={`Remove ${row.category} budget`}
                    onClick={() => remove.mutate(row.id)}
                    className="text-muted-foreground hover:text-danger"
                  >
                    <X className="size-4" />
                  </button>
                </span>
              </div>
              <Progress
                value={Math.min(row.pct, 100)}
                className={`mt-2 h-2 ${row.pct >= 80 ? "[&>div]:bg-danger" : ""}`}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">No budgets set yet.</p>
      )}

      <form
        className="mt-5 space-y-3 border-t pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          const amount = Number(limit || 0);
          if (!category.trim() || !(amount > 0)) return;
          save.mutate({ category: category.trim(), monthly_limit: amount });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="budget-category">Category</Label>
            <Input
              id="budget-category"
              list="budget-categories"
              placeholder="Supplies"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
            <datalist id="budget-categories">
              {categories.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget-limit">Monthly limit</Label>
            <Input
              id="budget-limit"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="500"
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save budget"}
        </Button>
      </form>
    </section>
  );
}

type Rule = {
  id: string;
  amount: number;
  category: string;
  frequency: "weekly" | "monthly";
  start_date: string;
  active: boolean;
};

export function RecurringSection({ rules }: { rules: Rule[] }) {
  const queryClient = useQueryClient();
  const upsert = useServerFn(saveRecurring);
  const drop = useServerFn(removeRecurring);

  const [editing, setEditing] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("monthly");
  const [startDate, setStartDate] = useState(() => new Date().toLocaleDateString("en-CA"));

  const reset = () => {
    setEditing(null);
    setAmount("");
    setCategory("");
    setFrequency("monthly");
    setStartDate(new Date().toLocaleDateString("en-CA"));
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["recurring"] });
    queryClient.invalidateQueries({ queryKey: ["entries"] });
  };

  const save = useMutation({
    mutationFn: (input: {
      id?: string | null;
      amount: number;
      category: string;
      frequency: "weekly" | "monthly";
      start_date: string;
      active: boolean;
    }) => upsert({ data: input }),
    onSuccess: () => {
      reset();
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => drop({ data: { id } }),
    onSuccess: invalidate,
  });

  const startEdit = (rule: Rule) => {
    setEditing(rule.id);
    setAmount(String(rule.amount));
    setCategory(rule.category);
    setFrequency(rule.frequency);
    setStartDate(rule.start_date);
  };

  return (
    <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">Recurring expenses</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Bills that repeat get logged for you automatically.
      </p>

      {rules.length > 0 ? (
        <ul className="mt-4 divide-y">
          {rules.map((rule) => (
            <li key={rule.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="min-w-0">
                <span className="font-semibold">{rule.category}</span>
                <span className="ml-2 text-muted-foreground">
                  {money(rule.amount)} · {rule.frequency} · from {rule.start_date}
                  {rule.active ? "" : " · cancelled"}
                </span>
              </span>
              <span className="flex shrink-0 gap-2">
                <button
                  type="button"
                  aria-label={`Edit ${rule.category}`}
                  onClick={() => startEdit(rule)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="size-4" />
                </button>
                {rule.active ? (
                  <button
                    type="button"
                    aria-label={`Cancel ${rule.category}`}
                    onClick={() =>
                      save.mutate({
                        id: rule.id,
                        amount: rule.amount,
                        category: rule.category,
                        frequency: rule.frequency,
                        start_date: rule.start_date,
                        active: false,
                      })
                    }
                    className="text-xs font-semibold text-muted-foreground hover:text-danger"
                  >
                    Cancel
                  </button>
                ) : null}
                <button
                  type="button"
                  aria-label={`Delete ${rule.category}`}
                  onClick={() => remove.mutate(rule.id)}
                  className="text-muted-foreground hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Nothing recurring yet.</p>
      )}

      <form
        className="mt-5 space-y-3 border-t pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          const value = Number(amount || 0);
          if (!category.trim() || !(value > 0)) return;
          save.mutate({
            id: editing,
            amount: value,
            category: category.trim(),
            frequency,
            start_date: startDate,
            active: true,
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rec-category">What is it for?</Label>
            <Input
              id="rec-category"
              placeholder="Rent"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rec-amount">Amount</Label>
            <Input
              id="rec-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rec-frequency">How often?</Label>
            <select
              id="rec-frequency"
              value={frequency}
              onChange={(event) => setFrequency(event.target.value as "weekly" | "monthly")}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
            >
              <option value="weekly">Every week</option>
              <option value="monthly">Every month</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rec-start">Starting</Label>
            <Input
              id="rec-start"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
        </div>
        {save.isError ? (
          <p className="text-sm text-danger">{(save.error as Error).message}</p>
        ) : null}
        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={save.isPending}>
            {save.isPending ? "Saving…" : editing ? "Update recurring expense" : "Add recurring expense"}
          </Button>
          {editing ? (
            <Button type="button" variant="outline" onClick={reset}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

/**
 * Everything about bills in one place: what's due, anything that looks like a
 * subscription, and the recurring rules themselves.
 */
export function BillsPage() {
  const fetchInsights = useServerFn(getInsights);
  const fetchRecurring = useServerFn(getRecurring);

  const { data: insights, isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: () => fetchInsights(),
  });
  const { data: recurring = [] } = useQuery({
    queryKey: ["recurring"],
    queryFn: () => fetchRecurring(),
  });

  return (
    <main className="w-full max-w-2xl">
      {isLoading ? (
        <section className="rounded-3xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Checking what's due…</p>
        </section>
      ) : insights ? (
        <>
          <BillCalendarSection calendar={insights.calendar} />
          <DetectedRecurringSection detected={insights.detectedRecurring} />
        </>
      ) : null}
      <RecurringSection rules={recurring} />
    </main>
  );
}
