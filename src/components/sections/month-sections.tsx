/**
 * Section components shared by the sidebar routes.
 * Extracted from the original single-page layout so each route can render
 * just the part it needs.
 *
 * Visually every section is a panel from the kit, so a page made of one
 * section and a page made of six line up the same way.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
  Alert,
  Badge,
  Field,
  Metric,
  Money,
  Panel,
  PanelBody,
  PanelHeader,
  Select,
  SkeletonRows,
  formatMoney,
} from "@/components/ui/kit";
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
import { EmptyState, SampleRows } from "@/components/empty-state";

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

/* Charts borrow the same surface, border and radius as everything else, so a
   tooltip doesn't look like it came from a different app. */
const TOOLTIP_STYLE = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border-strong)",
  borderRadius: "var(--radius-10)",
  boxShadow: "var(--shadow-md)",
  padding: "6px 10px",
  fontSize: 12,
};
const TOOLTIP_LABEL_STYLE = { color: "var(--color-muted-foreground)", fontSize: 11 };
const TOOLTIP_ITEM_STYLE = { color: "var(--color-foreground)" };
const AXIS_TICK = { fontSize: 10, fill: "var(--color-muted-foreground)" };

/** A small square of colour beside a chart legend entry. */
function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-2.5 shrink-0 rounded-[3px]"
      style={{ background: color }}
    />
  );
}

/** An icon-only control that still hits the 40px touch target. */
function IconAction({
  label,
  onClick,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={onClick}
      className={danger ? "hover:text-danger" : undefined}
    >
      {children}
    </Button>
  );
}

export type MonthPart =
  "totals" | "categories" | "daybyday" | "budgets" | "goals" | "recurring" | "bills";

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
  const anyOver = alerts.some((row) => row.pct >= 100);

  const netLabel =
    net > 0 ? "Profit this month" : net < 0 ? "Loss this month" : "Break even this month";

  return (
    <div className="rise mx-auto w-full max-w-3xl space-y-6">
      {/* ---------- Month switcher ---------- */}
      <header className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous month"
          onClick={() => setMonth((current) => shiftMonth(current, -1))}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
        <div className="min-w-0 text-center" aria-live="polite">
          <h1 className="truncate text-[20px] leading-tight sm:text-[24px]">{monthLabel(month)}</h1>
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next month"
          onClick={() => setMonth((current) => shiftMonth(current, 1))}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </header>

      {alerts.length > 0 ? (
        <Alert
          tone={anyOver ? "negative" : "warning"}
          title={
            <span className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                {alerts
                  .map((row) =>
                    row.pct >= 100
                      ? `${row.category} is over budget`
                      : `${row.category} is at ${Math.round(row.pct)}% of budget`,
                  )
                  .join(" · ")}
              </span>
            </span>
          }
        />
      ) : null}

      {/* ---------- Money in, money out, net ---------- */}
      {show("totals") ? (
        <Panel>
          <PanelBody className="pt-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Metric
                label="Money in"
                tone="positive"
                loading={isLoading}
                value={<Money value={totalIn} />}
              />
              <Metric
                label="Money out"
                tone="negative"
                loading={isLoading}
                value={<Money value={totalOut} />}
              />
            </div>

            <div className="mt-6 border-t pt-6">
              <Metric
                label={netLabel}
                emphasis="hero"
                loading={isLoading}
                value={<Money value={net} signed />}
              />
            </div>
          </PanelBody>
        </Panel>
      ) : isLoading ? (
        <span className="skeleton block h-4 w-40" />
      ) : null}

      {/* ---------- Where the money went ---------- */}
      {show("categories") ? (
        byCategory.length === 0 ? (
          <EmptyState
            title="Nothing spent this month yet"
            blurb="Once you log expenses, this shows exactly which categories your money went to, biggest first."
            sample={<SampleRows rows={4} />}
          />
        ) : (
          <Panel>
            <PanelHeader
              title="Where the money went"
              description="Every expense this month, biggest first."
            />
            <PanelBody>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="amount"
                      nameKey="name"
                      outerRadius={78}
                      innerRadius={44}
                      paddingAngle={1}
                      stroke="var(--color-surface-1)"
                      strokeWidth={2}
                    >
                      {byCategory.map((row, index) => (
                        <Cell key={row.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatMoney(value)}
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <ul className="divide-hairline mt-2">
                {byCategory.map((row, index) => (
                  <li
                    key={row.name}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Swatch color={CHART_COLORS[index % CHART_COLORS.length]} />
                      <span className="truncate">{row.name}</span>
                    </span>
                    <Money value={row.amount} className="shrink-0 font-medium" />
                  </li>
                ))}
              </ul>
            </PanelBody>
          </Panel>
        )
      ) : null}

      {/* ---------- Day by day ---------- */}
      {show("daybyday") ? (
        <Panel>
          <PanelHeader
            title="Day by day"
            description="Each bar is that day's net. Bars above the line are days you came out ahead, below the line are days you didn't."
          />
          <PanelBody>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyNet} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <XAxis
                    dataKey="day"
                    tick={AXIS_TICK}
                    interval={4}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={AXIS_TICK} width={44} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: number) => formatMoney(value)}
                    labelFormatter={(label) => `Day ${label}`}
                    cursor={{ fill: "var(--color-accent)" }}
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                    itemStyle={TOOLTIP_ITEM_STYLE}
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
          </PanelBody>
        </Panel>
      ) : null}

      {show("budgets") ? (
        <BudgetsSection rows={budgetRows} categories={byCategory.map((row) => row.name)} />
      ) : null}
      {show("goals") ? <GoalsSection /> : null}
      {show("recurring") ? <RecurringSection rules={recurring} /> : null}
    </div>
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
      <Panel aria-busy="true">
        <PanelBody className="pt-5">
          <SkeletonRows rows={3} />
        </PanelBody>
      </Panel>
    );
  }
  if (!data) return null;

  const { forecast, tax, dayPatterns, digest } = data;

  return (
    <div className="space-y-6">
      {/* ---------- Weekly digest ---------- */}
      <Panel>
        <PanelHeader
          title="Your week in plain English"
          description={
            <span className="num">
              {digest.weekFrom} to {digest.weekTo}
            </span>
          }
        />
        <PanelBody>
          <ul className="space-y-2.5 text-sm">
            {digest.lines.map((line, index) => (
              <li key={index} className="flex gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-brand"
                />
                <span className="min-w-0">{line}</span>
              </li>
            ))}
          </ul>
        </PanelBody>
      </Panel>

      {/* ---------- Cash runway ---------- */}
      <Panel>
        <PanelHeader
          title="Can you cover what's coming?"
          description={`Next ${forecast.horizonDays} days, based on your last ${forecast.basedOnDays} days and the bills you've set up.`}
        />
        <PanelBody className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Metric label="Where you are" value={<Money value={forecast.currentNet} signed />} />
            <Metric
              label={`In ${forecast.horizonDays} days`}
              value={<Money value={forecast.projectedNet} signed />}
            />
          </div>

          {forecast.shortfallDate ? (
            <Alert
              tone="negative"
              title={`Heads up — you could run short around ${forecast.shortfallDate}.`}
            >
              <span>
                Lowest point is <Money value={forecast.lowestPoint.balance} signed /> on{" "}
                <span className="num">{forecast.lowestPoint.date}</span>.
              </span>
            </Alert>
          ) : (
            <Alert tone="positive" title="You stay in the black the whole time.">
              <span>
                Lowest point is <Money value={forecast.lowestPoint.balance} signed /> on{" "}
                <span className="num">{forecast.lowestPoint.date}</span>.
              </span>
            </Alert>
          )}

          <p className="text-[13px] text-muted-foreground">
            Typical day: <Money value={forecast.dailyIn} className="text-foreground" /> in,{" "}
            <Money value={forecast.dailyOut} className="text-foreground" /> out.
          </p>

          {forecast.upcomingBills.length > 0 ? (
            <div className="rounded-[var(--radius-12)] border bg-surface-2 px-4 py-3">
              <p className="eyebrow">Bills coming up</p>
              <ul className="divide-hairline mt-1">
                {forecast.upcomingBills.slice(0, 6).map((bill, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-3 py-2 text-[13px] sm:text-sm"
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-medium">{bill.category}</span>
                      <span className="num ml-2 text-muted-foreground">{bill.due}</span>
                    </span>
                    <Money value={bill.amount} className="shrink-0" />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {forecast.lowConfidence ? (
            <p className="text-xs text-muted-foreground">
              This is a rough guess — you&apos;ve only got{" "}
              <span className="num">{forecast.basedOnDays}</span> days logged. It gets more accurate
              as you keep going.
            </p>
          ) : null}
        </PanelBody>
      </Panel>

      {/* ---------- Tax jar ---------- */}
      <Panel>
        <PanelHeader
          className={tax.ratePercent <= 0 ? "pb-5" : undefined}
          title="Tax set-aside"
          description={
            tax.ratePercent <= 0
              ? "Set a percentage on the Tools tab and I'll keep a running total of what to hold back for tax."
              : undefined
          }
        />
        {tax.ratePercent > 0 ? (
          <PanelBody className="space-y-6">
            <p className="text-[13px] text-muted-foreground">
              Holding back <span className="num text-foreground">{tax.ratePercent}%</span> of the{" "}
              <Money value={tax.incomeInPeriod} className="text-foreground" /> you&apos;ve taken in{" "}
              {tax.periodLabel}.
            </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Metric
                label="Should set aside"
                emphasis="compact"
                value={<Money value={tax.shouldHaveSetAside} />}
              />
              <Metric
                label="Already paid"
                emphasis="compact"
                tone="positive"
                value={<Money value={tax.alreadyPaid} />}
              />
            </div>

            <div className="border-t pt-6">
              <Metric
                label="Still to put aside"
                emphasis="hero"
                value={<Money value={tax.stillToSetAside} />}
                hint="Log tax payments with “tax” in the category and they’ll count here. Not tax advice — confirm your rate with an accountant."
              />
            </div>
          </PanelBody>
        ) : null}
      </Panel>

      {/* ---------- Bill calendar ---------- */}
      <BillCalendarSection calendar={data.calendar} />

      {/* ---------- Detected subscriptions ---------- */}
      <DetectedRecurringSection detected={data.detectedRecurring} />

      {/* ---------- Day patterns ---------- */}
      {dayPatterns.enoughData && dayPatterns.best && dayPatterns.worst ? (
        <Panel>
          <PanelHeader
            title="Your busy and quiet days"
            description="Average money in per day of the week."
          />
          <PanelBody className="space-y-5">
            <div className="space-y-2.5">
              {[...dayPatterns.patterns]
                .sort((a, b) => b.averageIn - a.averageIn)
                .map((pattern) => {
                  const max = dayPatterns.best!.averageIn || 1;
                  const width = Math.max(2, (pattern.averageIn / max) * 100);
                  return (
                    <div
                      key={pattern.weekday}
                      className="flex items-center gap-3 text-[13px] sm:text-sm"
                    >
                      <span className="w-[68px] shrink-0 truncate text-muted-foreground sm:w-20">
                        {pattern.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-3"
                      >
                        <span
                          className="block h-full rounded-full bg-brand transition-[width] duration-[var(--dur)] ease-[var(--ease)]"
                          style={{ width: `${width}%` }}
                        />
                      </span>
                      <Money
                        value={pattern.averageIn}
                        className="w-[76px] shrink-0 text-right sm:w-24"
                      />
                    </div>
                  );
                })}
            </div>

            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{dayPatterns.best.label}</span> is
              your best day
              {dayPatterns.best.vsAverage > 5
                ? ` (${Math.round(dayPatterns.best.vsAverage)}% above your average)`
                : ""}
              , and <span className="font-semibold text-foreground">{dayPatterns.worst.label}</span>{" "}
              is your quietest
              {dayPatterns.worst.vsAverage < -5
                ? ` (${Math.round(Math.abs(dayPatterns.worst.vsAverage))}% below)`
                : ""}
              .
            </p>
          </PanelBody>
        </Panel>
      ) : null}
    </div>
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
    <Panel>
      <PanelHeader
        title="What's due"
        description={
          <>
            <Money value={total} className="text-foreground" /> of bills over the next 45 days.
          </>
        }
      />
      <PanelBody className="space-y-5">
        {groups.map((group) => (
          <div key={group.heading}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="eyebrow">{group.heading}</p>
              <Money
                value={group.bills.reduce((s, b) => s + b.amount, 0)}
                className="text-[12px] text-muted-foreground"
              />
            </div>
            <ul className="divide-hairline mt-1">
              {group.bills.map((bill, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-3 py-2.5 text-[13px] sm:text-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{bill.category}</span>
                    <span className="num mt-0.5 block text-[12px] text-muted-foreground">
                      {bill.due}
                      {bill.daysAway === 0
                        ? " · today"
                        : bill.daysAway === 1
                          ? " · tomorrow"
                          : ` · in ${bill.daysAway} days`}
                    </span>
                  </span>
                  <Money
                    value={bill.amount}
                    tone={bill.daysAway <= 5 ? "negative" : "neutral"}
                    className={bill.daysAway <= 5 ? "shrink-0 font-semibold" : "shrink-0"}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </PanelBody>
    </Panel>
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
    <Panel>
      <PanelHeader
        title="Looks like a regular bill"
        description="I spotted these repeating in your entries. Track them and they'll show up in your outlook and bill reminders."
      />
      <PanelBody>
        <ul className="space-y-3">
          {visible.map((item) => (
            <li
              key={item.label}
              className="rounded-[var(--radius-12)] border bg-surface-2 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className="truncate">{item.label}</span>
                    {item.confidence === "medium" ? <Badge tone="warning">maybe</Badge> : null}
                  </p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    <Money value={item.amount} /> {item.frequency} · seen{" "}
                    <span className="num">{item.occurrences}</span> times · next around{" "}
                    <span className="num">{item.nextExpected}</span>
                  </p>
                </div>
                <IconAction
                  label={`Dismiss ${item.label}`}
                  danger
                  onClick={() => setDismissed((prev) => [...prev, item.label])}
                >
                  <X className="size-4" aria-hidden="true" />
                </IconAction>
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
      </PanelBody>
    </Panel>
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
    <Panel>
      <PanelHeader
        title="Savings goals"
        description="Something you're putting money aside for — track how close you are."
      />
      <PanelBody className="space-y-5">
        {goals.length > 0 ? (
          <ul className="space-y-4">
            {goals.map((goal) => {
              const share =
                goal.target_amount > 0 ? (goal.saved_amount / goal.target_amount) * 100 : 0;
              const remaining = Math.max(0, goal.target_amount - goal.saved_amount);
              return (
                <li key={goal.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-sm font-semibold">{goal.name}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      {share >= 100 ? <Badge tone="positive">Reached</Badge> : null}
                      <span className="num text-[13px] text-muted-foreground">
                        {formatMoney(goal.saved_amount)} / {formatMoney(goal.target_amount)}
                      </span>
                      <IconAction
                        label={`Remove ${goal.name} goal`}
                        danger
                        onClick={() => remove.mutate(goal.id)}
                      >
                        <X className="size-4" aria-hidden="true" />
                      </IconAction>
                    </span>
                  </div>
                  <Progress
                    value={Math.min(share, 100)}
                    className={`mt-2 h-2 bg-surface-3 ${
                      share >= 100 ? "[&>div]:bg-success" : "[&>div]:bg-brand"
                    }`}
                  />
                  <p className="mt-1.5 text-[12px] text-muted-foreground">
                    {remaining > 0 ? `${formatMoney(remaining)} to go` : "Goal reached"}
                    {goal.target_date ? ` · by ${goal.target_date}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No goals yet.</p>
        )}

        <form
          className="space-y-4 border-t pt-5"
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="goal-name" label="What for?">
              <Input
                placeholder="New oven"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field id="goal-target" label="Target amount">
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="2000"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              />
            </Field>
            <Field id="goal-saved" label="Saved so far">
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0"
                value={saved}
                onChange={(event) => setSaved(event.target.value)}
              />
            </Field>
            <Field id="goal-date" label="Target date (optional)">
              <Input
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
              />
            </Field>
          </div>
          <Button type="submit" className="w-full" loading={save.isPending}>
            {save.isPending ? "Saving…" : "Save goal"}
          </Button>
        </form>
      </PanelBody>
    </Panel>
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
    <Panel>
      <PanelHeader
        title="Budget limits"
        description="Set a monthly cap per category and watch the bars."
      />
      <PanelBody className="space-y-5">
        {rows.length > 0 ? (
          <ul className="space-y-4">
            {rows.map((row) => (
              <li key={row.id}>
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-sm font-semibold">{row.category}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {row.pct >= 100 ? (
                      <Badge tone="negative">Over</Badge>
                    ) : row.pct >= 80 ? (
                      <Badge tone="warning">Close</Badge>
                    ) : null}
                    <span className="num text-[13px] text-muted-foreground">
                      {formatMoney(row.used)} / {formatMoney(row.monthly_limit)}
                    </span>
                    <IconAction
                      label={`Remove ${row.category} budget`}
                      danger
                      onClick={() => remove.mutate(row.id)}
                    >
                      <X className="size-4" aria-hidden="true" />
                    </IconAction>
                  </span>
                </div>
                <Progress
                  value={Math.min(row.pct, 100)}
                  className={`mt-2 h-2 bg-surface-3 ${
                    row.pct >= 100
                      ? "[&>div]:bg-danger"
                      : row.pct >= 80
                        ? "[&>div]:bg-warning"
                        : "[&>div]:bg-brand"
                  }`}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No budgets set yet.</p>
        )}

        <form
          className="space-y-4 border-t pt-5"
          onSubmit={(event) => {
            event.preventDefault();
            const amount = Number(limit || 0);
            if (!category.trim() || !(amount > 0)) return;
            save.mutate({ category: category.trim(), monthly_limit: amount });
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="budget-category" label="Category">
              <Input
                list="budget-categories"
                placeholder="Supplies"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </Field>
            <Field id="budget-limit" label="Monthly limit">
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="500"
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
              />
            </Field>
          </div>
          <datalist id="budget-categories">
            {categories.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <Button type="submit" className="w-full" loading={save.isPending}>
            {save.isPending ? "Saving…" : "Save budget"}
          </Button>
        </form>
      </PanelBody>
    </Panel>
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
    <Panel>
      <PanelHeader
        title="Recurring expenses"
        description="Bills that repeat get logged for you automatically."
      />
      <PanelBody className="space-y-5">
        {rules.length > 0 ? (
          <ul className="divide-hairline">
            {rules.map((rule) => (
              <li key={rule.id} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{rule.category}</span>
                    {rule.active ? null : <Badge>Cancelled</Badge>}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                    <Money value={rule.amount} /> · {rule.frequency} · from{" "}
                    <span className="num">{rule.start_date}</span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <IconAction label={`Edit ${rule.category}`} onClick={() => startEdit(rule)}>
                    <Pencil className="size-4" aria-hidden="true" />
                  </IconAction>
                  {rule.active ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
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
                      className="h-10 hover:text-danger"
                    >
                      Cancel
                    </Button>
                  ) : null}
                  <IconAction
                    label={`Delete ${rule.category}`}
                    danger
                    onClick={() => remove.mutate(rule.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </IconAction>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nothing recurring yet.</p>
        )}

        <form
          className="space-y-4 border-t pt-5"
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="rec-category" label="What is it for?">
              <Input
                placeholder="Rent"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </Field>
            <Field id="rec-amount" label="Amount">
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </Field>
            <Field id="rec-frequency" label="How often?">
              <Select
                value={frequency}
                onChange={(event) => setFrequency(event.target.value as "weekly" | "monthly")}
              >
                <option value="weekly">Every week</option>
                <option value="monthly">Every month</option>
              </Select>
            </Field>
            <Field id="rec-start" label="Starting">
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </Field>
          </div>

          {save.isError ? <Alert tone="negative" title={(save.error as Error).message} /> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="min-w-40 flex-1" loading={save.isPending}>
              {save.isPending
                ? "Saving…"
                : editing
                  ? "Update recurring expense"
                  : "Add recurring expense"}
            </Button>
            {editing ? (
              <Button type="button" variant="outline" onClick={reset}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </PanelBody>
    </Panel>
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
    <div className="rise mx-auto w-full max-w-3xl space-y-6">
      {isLoading ? (
        <Panel aria-busy="true" aria-label="Loading your bills">
          <PanelHeader title="What's due" />
          <PanelBody>
            <SkeletonRows rows={4} />
          </PanelBody>
        </Panel>
      ) : insights ? (
        <>
          <BillCalendarSection calendar={insights.calendar} />
          <DetectedRecurringSection detected={insights.detectedRecurring} />
        </>
      ) : null}
      <RecurringSection rules={recurring} />
    </div>
  );
}
