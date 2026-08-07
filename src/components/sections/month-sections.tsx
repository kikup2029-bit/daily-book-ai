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
import { useHasFeature } from "@/lib/use-subscription";
import { EmptyState, SampleRows } from "@/components/empty-state";
import { useI18n } from "@/lib/i18n";

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

/* The heading follows the language the reader picked, not the browser's. */
const monthLabel = (key: string, tag: string) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(tag, {
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

/**
 * Short axis labels: "$1.2k" rather than "$1,234.00".
 *
 * Axis gutters are narrow and a long label either clips or eats the chart.
 * Full precision still appears in the tooltip and everywhere else on the page,
 * so nothing is actually lost.
 */
function abbreviateMoney(value: number): string {
  if (!Number.isFinite(value)) return "";
  const sign = value < 0 ? "−" : "";
  const size = Math.abs(value);
  if (size >= 1000) {
    const thousands = size / 1000;
    return `${sign}$${thousands >= 10 ? Math.round(thousands) : thousands.toFixed(1)}k`;
  }
  return `${sign}$${Math.round(size)}`;
}

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

/**
 * Which of the four whole sentences describes the best and quietest days.
 *
 * A percentage is only worth mentioning when it's big enough, which gives four
 * versions of the same sentence. They're four keys rather than one sentence
 * with fragments bolted on, because where a bracketed aside can sit — or
 * whether it can sit there at all — differs by language.
 */
export function bestAndQuietKey(bestVsAverage: number, worstVsAverage: number): string {
  const sayBest = bestVsAverage > 5;
  const sayWorst = worstVsAverage < -5;
  if (sayBest && sayWorst) return "month.bestAndQuietBoth";
  if (sayBest) return "month.bestAndQuietBestOnly";
  if (sayWorst) return "month.bestAndQuietWorstOnly";
  return "month.bestAndQuiet";
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
  const { t, tag, formatNumber } = useI18n();
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
  //
  // Recurring bills are Pro, and this page also renders as the free "this
  // month" screen. Asking only when the account is entitled keeps the free
  // totals working off logged entries alone instead of stalling on a request
  // the server will refuse.
  const { allowed: billsAllowed } = useHasFeature("billsCalendar");
  const { data: recurring = [] } = useQuery({
    queryKey: ["recurring"],
    queryFn: () => fetchRecurring(),
    enabled: billsAllowed,
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
      const key = (entry.spent_on ?? "").trim() || t("dashboard.uncategorised");
      map.set(key, (map.get(key) ?? 0) + entry.amount_out);
    }
    return [...map.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthEntries, t]);

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
    net > 0
      ? t("month.profitThisMonth")
      : net < 0
        ? t("month.lossThisMonth")
        : t("month.breakEvenThisMonth");

  return (
    <div className="rise mx-auto w-full max-w-3xl space-y-6">
      {/* ---------- Month switcher ---------- */}
      <header className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="icon"
          aria-label={t("month.previous")}
          onClick={() => setMonth((current) => shiftMonth(current, -1))}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
        <div className="min-w-0 text-center" aria-live="polite">
          <h1 className="truncate text-[20px] leading-tight sm:text-[24px]">
            {monthLabel(month, tag)}
          </h1>
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("month.next")}
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
              {/* The category name belongs inside the warning, not in front of
                  it — one whole sentence per alert. */}
              <span className="min-w-0">
                {alerts
                  .map((row) =>
                    row.pct >= 100
                      ? t("month.budgetOver", { category: row.category })
                      : t("month.budgetAtPercent", {
                          category: row.category,
                          percent: formatNumber(Math.round(row.pct)),
                        }),
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
                label={t("common.moneyIn")}
                tone="positive"
                loading={isLoading}
                value={<Money value={totalIn} />}
              />
              <Metric
                label={t("common.moneyOut")}
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
            title={t("month.nothingSpent")}
            blurb={t("month.nothingSpentBlurb")}
            sample={<SampleRows rows={4} />}
          />
        ) : (
          <Panel>
            <PanelHeader
              title={t("nav.whereMoneyWent")}
              description={t("month.whereMoneyWentBlurb")}
            />
            <PanelBody>
              {/* Fixed height, fluid width: ResponsiveContainer needs a sized
                  ancestor or it collapses to nothing. Taller on wider screens
                  so the donut isn't lost in the middle of a big panel. */}
              <div className="h-56 w-full sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="amount"
                      nameKey="name"
                      // Percentages rather than pixels, so the donut scales
                      // with the panel instead of overflowing a narrow one or
                      // floating in a wide one.
                      outerRadius="88%"
                      innerRadius="52%"
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
          <PanelHeader title={t("nav.dayByDay")} description={t("month.dayByDayBlurb")} />
          <PanelBody>
            <div className="h-48 w-full sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyNet} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <XAxis
                    dataKey="day"
                    tick={AXIS_TICK}
                    // "preserveStartEnd" lets Recharts drop labels only as far
                    // as it needs to for the actual width, instead of a fixed
                    // every-fifth-day rule that's too sparse on a wide screen
                    // and still crowded on a narrow one.
                    interval="preserveStartEnd"
                    minTickGap={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={AXIS_TICK}
                    // Abbreviated so a four-figure day fits the gutter. At 10px
                    // "$1,234.00" needs roughly 52px and would have been
                    // clipped by the old fixed 44px width.
                    tickFormatter={abbreviateMoney}
                    width={52}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => formatMoney(value)}
                    labelFormatter={(label) => t("month.dayNumber", { day: String(label) })}
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
  const { t, money, signedMoney, formatNumber } = useI18n();
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
          title={t("month.weekTitle")}
          description={
            <span className="num">
              {t("month.weekRange", { from: digest.weekFrom, to: digest.weekTo })}
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
          title={t("month.outlookTitle")}
          description={t("month.outlookBlurb", {
            days: formatNumber(forecast.horizonDays),
            count: forecast.basedOnDays,
          })}
        />
        <PanelBody className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Metric
              label={t("month.whereYouAre")}
              value={<Money value={forecast.currentNet} signed />}
            />
            <Metric
              label={t("month.inDays", { count: forecast.horizonDays })}
              value={<Money value={forecast.projectedNet} signed />}
            />
          </div>

          {/* The amount and the date live inside the sentence: "lowest point"
              doesn't come first in every language. */}
          {forecast.shortfallDate ? (
            <Alert
              tone="negative"
              title={t("month.shortfallTitle", { date: forecast.shortfallDate })}
            >
              <span className="num">
                {t("month.lowestPoint", {
                  amount: signedMoney(forecast.lowestPoint.balance),
                  date: forecast.lowestPoint.date,
                })}
              </span>
            </Alert>
          ) : (
            <Alert tone="positive" title={t("month.staysPositive")}>
              <span className="num">
                {t("month.lowestPoint", {
                  amount: signedMoney(forecast.lowestPoint.balance),
                  date: forecast.lowestPoint.date,
                })}
              </span>
            </Alert>
          )}

          <p className="num text-[13px] text-muted-foreground">
            {t("month.typicalDay", {
              moneyIn: money(forecast.dailyIn),
              moneyOut: money(forecast.dailyOut),
            })}
          </p>

          {forecast.upcomingBills.length > 0 ? (
            <div className="rounded-[var(--radius-12)] border bg-surface-2 px-4 py-3">
              <p className="eyebrow">{t("month.billsComingUp")}</p>
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
              {t("month.roughGuess", { count: forecast.basedOnDays })}
            </p>
          ) : null}
        </PanelBody>
      </Panel>

      {/* ---------- Tax jar ---------- */}
      <Panel>
        <PanelHeader
          className={tax.ratePercent <= 0 ? "pb-5" : undefined}
          title={t("nav.tax")}
          description={tax.ratePercent <= 0 ? t("month.taxNoRateTools") : undefined}
        />
        {tax.ratePercent > 0 ? (
          <PanelBody className="space-y-6">
            <p className="text-[13px] text-muted-foreground">
              {t("month.taxHoldingBack", {
                percent: formatNumber(tax.ratePercent),
                amount: money(tax.incomeInPeriod),
                period: tax.periodLabel,
              })}
            </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Metric
                label={t("month.shouldSetAside")}
                emphasis="compact"
                value={<Money value={tax.shouldHaveSetAside} />}
              />
              <Metric
                label={t("month.alreadyPaid")}
                emphasis="compact"
                tone="positive"
                value={<Money value={tax.alreadyPaid} />}
              />
            </div>

            <div className="border-t pt-6">
              <Metric
                label={t("month.stillToSetAside")}
                emphasis="hero"
                value={<Money value={tax.stillToSetAside} />}
                hint={t("month.taxHint")}
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
          <PanelHeader title={t("nav.busyDays")} description={t("month.busyDaysBlurb")} />
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

            {/* One sentence, picked whole. Building it from "is your best day"
                plus a bracketed percentage put the words in English order. */}
            <p className="text-sm text-muted-foreground">
              {t(bestAndQuietKey(dayPatterns.best.vsAverage, dayPatterns.worst.vsAverage), {
                best: dayPatterns.best.label,
                worst: dayPatterns.worst.label,
                bestPercent: formatNumber(Math.round(dayPatterns.best.vsAverage)),
                worstPercent: formatNumber(Math.round(Math.abs(dayPatterns.worst.vsAverage))),
              })}
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
  const { t, money } = useI18n();

  if (calendar.length === 0) return null;

  const groups: Array<{ heading: string; bills: typeof calendar }> = [
    { heading: t("month.thisWeek"), bills: calendar.filter((b) => b.daysAway <= 7) },
    {
      heading: t("month.nextThreeWeeks"),
      bills: calendar.filter((b) => b.daysAway > 7 && b.daysAway <= 28),
    },
    { heading: t("month.later"), bills: calendar.filter((b) => b.daysAway > 28) },
  ].filter((group) => group.bills.length > 0);

  const total = calendar.reduce((sum, b) => sum + b.amount, 0);

  return (
    <Panel>
      <PanelHeader
        title={t("month.whatsDue")}
        description={t("month.billsTotal", { amount: money(total) })}
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
                      {bill.due} ·{" "}
                      {bill.daysAway === 0
                        ? t("month.dueToday")
                        : bill.daysAway === 1
                          ? t("month.dueTomorrow")
                          : t("month.dueInDays", { count: bill.daysAway })}
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
  const { t, money } = useI18n();
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
      <PanelHeader title={t("month.detectedTitle")} description={t("month.detectedBlurb")} />
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
                    {item.confidence === "medium" ? (
                      <Badge tone="warning">{t("month.maybe")}</Badge>
                    ) : null}
                  </p>
                  {/* Amount, how often, how many times and when next — one
                      string, because that order is English's, not everyone's. */}
                  <p className="num mt-1 text-[12px] text-muted-foreground">
                    {t("month.detectedDetail", {
                      amount: money(item.amount),
                      frequency:
                        item.frequency === "weekly" ? t("month.weekly") : t("month.monthly"),
                      count: item.occurrences,
                      date: item.nextExpected,
                    })}
                  </p>
                </div>
                <IconAction
                  label={t("month.dismissDetected", { name: item.label })}
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
                {t("month.trackBill")}
              </Button>
            </li>
          ))}
        </ul>
      </PanelBody>
    </Panel>
  );
}

export function GoalsSection() {
  const { t, money } = useI18n();
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
      <PanelHeader title={t("nav.goals")} description={t("month.goalsBlurb")} />
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
                      {share >= 100 ? <Badge tone="positive">{t("month.reached")}</Badge> : null}
                      <span className="num text-[13px] text-muted-foreground">
                        {formatMoney(goal.saved_amount)} / {formatMoney(goal.target_amount)}
                      </span>
                      <IconAction
                        label={t("month.removeGoal", { name: goal.name })}
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
                    {remaining > 0
                      ? t("month.goalToGo", { amount: money(remaining) })
                      : t("month.goalReached")}
                    {goal.target_date
                      ? ` · ${t("month.goalByDate", { date: goal.target_date })}`
                      : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("month.noGoals")}</p>
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
            <Field id="goal-name" label={t("entryForm.whatFor")}>
              <Input
                placeholder={t("month.goalNamePlaceholder")}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field id="goal-target" label={t("month.goalTarget")}>
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
            <Field id="goal-saved" label={t("month.goalSaved")}>
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
            <Field id="goal-date" label={t("month.goalTargetDate")}>
              <Input
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
              />
            </Field>
          </div>
          <Button type="submit" className="w-full" loading={save.isPending}>
            {save.isPending ? t("common.saving") : t("month.saveGoal")}
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
  const { t } = useI18n();
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
      <PanelHeader title={t("month.budgetsTitle")} description={t("month.budgetsBlurb")} />
      <PanelBody className="space-y-5">
        {rows.length > 0 ? (
          <ul className="space-y-4">
            {rows.map((row) => (
              <li key={row.id}>
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-sm font-semibold">{row.category}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {row.pct >= 100 ? (
                      <Badge tone="negative">{t("month.over")}</Badge>
                    ) : row.pct >= 80 ? (
                      <Badge tone="warning">{t("month.nearLimit")}</Badge>
                    ) : null}
                    <span className="num text-[13px] text-muted-foreground">
                      {formatMoney(row.used)} / {formatMoney(row.monthly_limit)}
                    </span>
                    <IconAction
                      label={t("month.removeBudget", { name: row.category })}
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
          <p className="text-sm text-muted-foreground">{t("month.noBudgets")}</p>
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
            <Field id="budget-category" label={t("common.category")}>
              <Input
                list="budget-categories"
                placeholder={t("entryForm.whatForPlaceholder")}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </Field>
            <Field id="budget-limit" label={t("month.monthlyLimit")}>
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
            {save.isPending ? t("common.saving") : t("month.saveBudget")}
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
  const { t, money } = useI18n();
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
      <PanelHeader title={t("month.recurringTitle")} description={t("month.recurringBlurb")} />
      <PanelBody className="space-y-5">
        {rules.length > 0 ? (
          <ul className="divide-hairline">
            {rules.map((rule) => (
              <li key={rule.id} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{rule.category}</span>
                    {rule.active ? null : <Badge>{t("month.cancelled")}</Badge>}
                  </span>
                  <span className="num mt-0.5 block truncate text-[12px] text-muted-foreground">
                    {t("month.recurringDetail", {
                      amount: money(rule.amount),
                      frequency:
                        rule.frequency === "weekly" ? t("month.weekly") : t("month.monthly"),
                      date: rule.start_date,
                    })}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <IconAction
                    label={t("month.editRule", { name: rule.category })}
                    onClick={() => startEdit(rule)}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </IconAction>
                  {rule.active ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={t("month.cancelRule", { name: rule.category })}
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
                      {t("common.cancel")}
                    </Button>
                  ) : null}
                  <IconAction
                    label={t("month.deleteRule", { name: rule.category })}
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
          <p className="text-sm text-muted-foreground">{t("month.noRecurring")}</p>
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
            <Field id="rec-category" label={t("entryForm.whatFor")}>
              <Input
                placeholder={t("month.recurringPlaceholder")}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </Field>
            <Field id="rec-amount" label={t("common.amount")}>
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
            <Field id="rec-frequency" label={t("month.howOften")}>
              <Select
                value={frequency}
                onChange={(event) => setFrequency(event.target.value as "weekly" | "monthly")}
              >
                <option value="weekly">{t("month.everyWeek")}</option>
                <option value="monthly">{t("month.everyMonth")}</option>
              </Select>
            </Field>
            <Field id="rec-start" label={t("month.starting")}>
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
                ? t("common.saving")
                : editing
                  ? t("month.updateRecurring")
                  : t("month.addRecurring")}
            </Button>
            {editing ? (
              <Button type="button" variant="outline" onClick={reset}>
                {t("common.cancel")}
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
  const { t } = useI18n();
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
        <Panel aria-busy="true" aria-label={t("month.loadingBills")}>
          <PanelHeader title={t("month.whatsDue")} />
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
