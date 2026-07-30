import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
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

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { getEntries } from "@/lib/books.functions";
import {
  getBudgets,
  getRecurring,
  removeBudget,
  removeRecurring,
  saveBudget,
  saveRecurring,
} from "@/lib/planning.functions";

export const Route = createFileRoute("/_authenticated/monthly")({
  head: () => ({
    meta: [
      { title: "Monthly overview — SimpleBooks AI" },
      {
        name: "description",
        content:
          "See a whole month at a glance: income, expenses, profit, spending by category, recurring bills and budget limits.",
      },
      { property: "og:title", content: "Monthly overview — SimpleBooks AI" },
      {
        property: "og:description",
        content:
          "Monthly income, expenses and profit with category charts, recurring expenses and budget progress.",
      },
    ],
  }),
  component: MonthlyPage,
});

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

function MonthlyPage() {
  const fetchEntries = useServerFn(getEntries);
  const fetchRecurring = useServerFn(getRecurring);
  const fetchBudgets = useServerFn(getBudgets);

  const [month, setMonth] = useState(() => monthKey(new Date()));

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
    <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-8 sm:pt-12">
      <AppHeader />

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

        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading your numbers…</p>
        ) : null}
      </section>

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

      <BudgetsSection rows={budgetRows} categories={byCategory.map((row) => row.name)} />
      <RecurringSection rules={recurring} />
    </main>
  );
}

function BudgetsSection({
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

function RecurringSection({ rules }: { rules: Rule[] }) {
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
