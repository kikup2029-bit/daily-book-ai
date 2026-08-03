import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarClock,
  Flame,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from "lucide-react";

import { parseQuickEntry } from "@/lib/quick-entry";
import { getInsights } from "@/lib/shop.functions";
import { getHousehold, setEntryShare } from "@/lib/household.functions";

import { AppHeader } from "@/components/app-header";
import { ReceiptAttachButton, ReceiptThumb } from "@/components/receipt-controls";
import { uploadReceipt } from "@/lib/receipts";
import { attachReceipt, analyzeReceipt, removeEntry } from "@/lib/books.functions";

import { askBookkeeper, createEntry, getEntries } from "@/lib/books.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your books — SimpleBooks AI" },
      {
        name: "description",
        content:
          "Log what you made and spent each day, see today's totals at a glance, and ask plain-English questions about your money.",
      },
      { property: "og:title", content: "Your books — SimpleBooks AI" },
      {
        property: "og:description",
        content:
          "Log daily income and expenses, see today's totals, and ask an AI helper simple questions about your money.",
      },
    ],
  }),
  component: Dashboard,
});

type ChatMessage = { role: "user" | "assistant"; text: string };

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const todayISO = () => new Date().toLocaleDateString("en-CA");

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that photo."));
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ base64, mimeType: file.type || "image/jpeg" });
    };
    reader.readAsDataURL(file);
  });
}

function Dashboard() {
  const queryClient = useQueryClient();
  const fetchEntries = useServerFn(getEntries);
  const addEntry = useServerFn(createEntry);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: () => fetchEntries(),
  });

  const [date, setDate] = useState(todayISO());
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [spentOn, setSpentOn] = useState("");
  const [merchant, setMerchant] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "other">("cash");
  const [shareMode, setShareMode] = useState<"private" | "visible" | "split">("private");
  const fetchHousehold = useServerFn(getHousehold);
  const { data: household } = useQuery({
    queryKey: ["household"],
    queryFn: () => fetchHousehold(),
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptKey, setReceiptKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [receiptNotice, setReceiptNotice] = useState<string | null>(null);
  const linkReceipt = useServerFn(attachReceipt);
  const runAnalyzeReceipt = useServerFn(analyzeReceipt);
  const runRemoveEntry = useServerFn(removeEntry);

  const remove = useMutation({
    mutationFn: (entryId: string) => runRemoveEntry({ data: { entry_id: entryId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["entries"] }),
  });

  const runSetShare = useServerFn(setEntryShare);
  const toggleShare = useMutation({
    mutationFn: (input: { entry_id: string; mode: "private" | "visible" | "split" }) =>
      runSetShare({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["settlement"] });
    },
  });

  const analyze = useMutation({
    mutationFn: async (file: File) => {
      const { base64, mimeType } = await fileToBase64(file);
      return runAnalyzeReceipt({ data: { base64Image: base64, mimeType } });
    },
    onSuccess: (result) => {
      let filledSomething = false;
      if (result.amount != null && !amountOut) {
        setAmountOut(String(result.amount));
        filledSomething = true;
      }
      if (result.category && !spentOn.trim()) {
        setSpentOn(result.category);
        filledSomething = true;
      }
      if (result.entry_date) {
        setDate(result.entry_date);
        filledSomething = true;
      }
      if (result.merchant && !merchant.trim()) {
        setMerchant(result.merchant);
        filledSomething = true;
      }
      setReceiptNotice(
        filledSomething
          ? "Filled in from your receipt — please double check before saving."
          : "Couldn't read details off that receipt — no worries, just fill it in yourself.",
      );
    },
    onError: () => {
      setReceiptNotice("Couldn't read that receipt automatically — just fill in the details yourself.");
    },
  });

  const save = useMutation({
    mutationFn: async (input: {
      entry_date: string;
      amount_in: number;
      amount_out: number;
      spent_on: string | null;
      merchant: string | null;
      payment_method: string | null;
      share: "private" | "visible" | "split";
    }) => {
      const entry = await addEntry({ data: input });
      if (receiptFile) {
        const path = await uploadReceipt(receiptFile, entry.id);
        await linkReceipt({ data: { entry_id: entry.id, receipt_path: path } });
      }
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      setAmountIn("");
      setAmountOut("");
      setSpentOn("");
      setMerchant("");
      setShareMode("private");
      setReceiptFile(null);
      setReceiptKey((value) => value + 1);
      setReceiptNotice(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (error: Error) => setFormError(error.message),
  });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const inAmount = Number(amountIn || 0);
    const outAmount = Number(amountOut || 0);
    if (Number.isNaN(inAmount) || Number.isNaN(outAmount) || inAmount < 0 || outAmount < 0) {
      setFormError("Please enter valid amounts.");
      return;
    }
    if (inAmount === 0 && outAmount === 0) {
      setFormError("Add money made or money spent before saving.");
      return;
    }
    save.mutate({
      entry_date: date,
      amount_in: inAmount,
      amount_out: outAmount,
      spent_on: spentOn.trim() ? spentOn.trim() : null,
      merchant: merchant.trim() ? merchant.trim() : null,
      payment_method: paymentMethod,
      share: shareMode,
    });
  };

  const today = todayISO();
  const todaysEntries = entries.filter((entry) => entry.entry_date === today);
  const todayIn = todaysEntries.reduce((sum, entry) => sum + entry.amount_in, 0);
  const todayOut = todaysEntries.reduce((sum, entry) => sum + entry.amount_out, 0);
  const net = todayIn - todayOut;

  const allIn = entries.reduce((sum, entry) => sum + entry.amount_in, 0);
  const allOut = entries.reduce((sum, entry) => sum + entry.amount_out, 0);

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-8 sm:pt-12">
      <AppHeader />

      <DueSoonBanner />
      <SafeToSpendCard />
      <QuickAdd entries={entries} />

      <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Today&apos;s entry</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Jot down what came in and what went out.
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="in">Money made</Label>
              <Input
                id="in"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amountIn}
                onChange={(event) => setAmountIn(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="out">Money spent</Label>
              <Input
                id="out"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amountOut}
                onChange={(event) => setAmountOut(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spent-on">What was it spent on?</Label>
            <Input
              id="spent-on"
              placeholder="Supplies, Rent, Inventory…"
              value={spentOn}
              onChange={(event) => setSpentOn(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Cash or card?</Label>
            <div className="flex gap-2">
              {(["cash", "card", "other"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPaymentMethod(option)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                    paymentMethod === option
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="merchant">Where? (optional)</Label>
            <Input
              id="merchant"
              placeholder="Costco, Shell, Home Depot…"
              value={merchant}
              onChange={(event) => setMerchant(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt photo (optional)</Label>
            <Input
              key={receiptKey}
              id="receipt"
              type="file"
              accept="image/*"
              capture="environment"
              className="file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setReceiptFile(file);
                setReceiptNotice(null);
                if (file) analyze.mutate(file);
              }}
            />
            {receiptFile ? (
              <p className="text-xs text-muted-foreground">
                Attaching “{receiptFile.name}” — only you can see it.
              </p>
            ) : null}
            {analyze.isPending ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" /> Reading your receipt…
              </p>
            ) : receiptNotice ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="size-3" /> {receiptNotice}
              </p>
            ) : null}
          </div>


          {household?.household ? (
            <div className="space-y-2">
              <Label>Who can see this?</Label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { key: "private", label: "Just me" },
                    { key: "visible", label: "Share" },
                    { key: "split", label: "Split it" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setShareMode(option.key)}
                    className={`rounded-xl border px-2 py-2 text-sm font-semibold transition-colors ${
                      shareMode === option.key
                        ? "border-primary bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {shareMode === "private"
                  ? "Only you will see this."
                  : shareMode === "visible"
                    ? `${household.household.name} can see it, but nobody owes anybody.`
                    : `${household.household.name} can see it and it gets divided evenly.`}
              </p>
            </div>
          ) : null}

          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          {saved ? <p className="text-sm text-success">Saved! Nice work.</p> : null}

          <Button type="submit" className="w-full" size="lg" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save entry"}
          </Button>
        </form>
      </section>

      <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Today at a glance</h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-success-soft p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-success">
              <ArrowUpCircle className="size-4" /> Money in
            </p>
            <p className="mt-1 text-xl font-bold">{money(todayIn)}</p>
          </div>
          <div className="rounded-2xl bg-danger-soft p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-danger">
              <ArrowDownCircle className="size-4" /> Money out
            </p>
            <p className="mt-1 text-xl font-bold">{money(todayOut)}</p>
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
            {net > 0
              ? "You made money today"
              : net < 0
                ? "You lost money today"
                : "Break even today"}
          </p>
          <p className="mt-0.5 text-2xl font-bold">{money(Math.abs(net))}</p>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          All time: {money(allIn)} in · {money(allOut)} out ·{" "}
          <span className="font-semibold text-foreground">{money(allIn - allOut)} net</span>
        </p>

        {isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading your entries…</p>
        ) : entries.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No entries yet — add your first one above.
          </p>
        ) : (
          <ul className="mt-4 divide-y">
            {entries.slice(0, 6).map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  {entry.receipt_path ? <ReceiptThumb path={entry.receipt_path} /> : null}
                  <span className="min-w-0">
                    <span className="font-semibold whitespace-nowrap">{entry.entry_date}</span>
                    {entry.spent_on ? (
                      <span className="ml-2 text-muted-foreground">{entry.spent_on}</span>
                    ) : null}
                    {entry.merchant ? (
                      <span className="ml-2 text-muted-foreground">· {entry.merchant}</span>
                    ) : null}
                    {entry.household_id ? (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-primary">
                        <Users className="size-3" /> {entry.is_split ? "split" : "shared"}
                      </span>
                    ) : null}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 tabular-nums">
                  {entry.amount_in > 0 ? (
                    <span className="text-success">+{money(entry.amount_in)}</span>
                  ) : null}
                  {entry.amount_out > 0 ? (
                    <span className="text-danger">−{money(entry.amount_out)}</span>
                  ) : null}
                  <ReceiptAttachButton entryId={entry.id} currentPath={entry.receipt_path} />
                  {household?.household ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-2 ${
                        entry.household_id ? "text-primary" : "text-muted-foreground"
                      }`}
                      disabled={toggleShare.isPending}
                      onClick={() =>
                        toggleShare.mutate({
                          entry_id: entry.id,
                          mode: !entry.household_id
                            ? "visible"
                            : entry.is_split
                              ? "private"
                              : "split",
                        })
                      }
                      aria-label="Change who can see this entry"
                      title={
                        !entry.household_id
                          ? "Share with household"
                          : entry.is_split
                            ? "Make private again"
                            : "Split this one evenly"
                      }
                    >
                      <Users className="size-4" />
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm("Delete this entry? This can't be undone.")) {
                        remove.mutate(entry.id);
                      }
                    }}
                    aria-label="Delete entry"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <StreaksCard />
      <AskSection />
    </main>
  );
}

/** Warns about bills due in the next few days, before they bite. */
function DueSoonBanner() {
  const fetchInsights = useServerFn(getInsights);
  const { data } = useQuery({ queryKey: ["insights"], queryFn: () => fetchInsights() });

  const soon = (data?.calendar ?? []).filter((bill) => bill.daysAway <= 5);
  if (soon.length === 0) return null;

  const total = soon.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <section className="mb-5 rounded-3xl border border-danger bg-danger-soft p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-danger">
        <CalendarClock className="size-4" />
        {soon.length === 1 ? "A bill is due soon" : `${soon.length} bills due soon`} ·{" "}
        {money(total)}
      </p>
      <ul className="mt-2 space-y-1 text-sm">
        {soon.slice(0, 4).map((bill, index) => (
          <li key={index} className="flex justify-between gap-2">
            <span>
              {bill.category}{" "}
              <span className="text-muted-foreground">
                {bill.daysAway === 0
                  ? "· today"
                  : bill.daysAway === 1
                    ? "· tomorrow"
                    : `· in ${bill.daysAway} days`}
              </span>
            </span>
            <span className="tabular-nums">{money(bill.amount)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Habit and progress streaks — a nudge to keep logging. */
function StreaksCard() {
  const fetchInsights = useServerFn(getInsights);
  const { data } = useQuery({ queryKey: ["insights"], queryFn: () => fetchInsights() });

  const s = data?.streaks;
  if (!s || s.totalDaysLogged === 0) return null;

  const tiles = [
    {
      label: "Logging streak",
      value: s.loggingStreak,
      suffix: s.loggingStreak === 1 ? "day" : "days",
      best: s.longestLoggingStreak,
      show: true,
    },
    {
      label: "Profitable run",
      value: s.profitableStreak,
      suffix: s.profitableStreak === 1 ? "day" : "days",
      best: s.longestProfitableStreak,
      show: s.longestProfitableStreak > 0,
    },
    {
      label: "No-spend run",
      value: s.noSpendStreak,
      suffix: s.noSpendStreak === 1 ? "day" : "days",
      best: s.longestNoSpendStreak,
      show: s.longestNoSpendStreak > 0,
    },
  ].filter((tile) => tile.show);

  return (
    <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Flame className="size-4 text-primary" /> Your streaks
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {s.loggingStreak >= 3
          ? `Nice — ${s.loggingStreak} days in a row of keeping your books up to date.`
          : "Log something every day and your streak starts building."}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl bg-muted p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {tile.label}
            </p>
            <p className="mt-0.5 text-xl font-bold">
              {tile.value} <span className="text-sm font-normal">{tile.suffix}</span>
            </p>
            {tile.best > tile.value ? (
              <p className="text-xs text-muted-foreground">Best: {tile.best}</p>
            ) : tile.value > 0 && tile.value === tile.best ? (
              <p className="text-xs text-success">Your best yet</p>
            ) : null}
          </div>
        ))}
      </div>

      {s.activeDaysThisMonth > 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          This month you came out ahead on{" "}
          <span className="font-semibold text-foreground">
            {s.profitableDaysThisMonth} of {s.activeDaysThisMonth}
          </span>{" "}
          days you logged.
        </p>
      ) : null}
    </section>
  );
}

/** One number: what's safe to spend today without causing trouble later. */
function SafeToSpendCard() {
  const fetchInsights = useServerFn(getInsights);
  const { data } = useQuery({ queryKey: ["insights"], queryFn: () => fetchInsights() });

  if (!data) return null;
  const safe = data.safeToSpend;

  const none = safe.amount <= 0;

  return (
    <section
      className={`rounded-3xl border p-5 shadow-sm ${
        none ? "bg-danger-soft" : "bg-primary text-primary-foreground"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${
          none ? "text-danger" : "text-primary-foreground/80"
        }`}
      >
        Safe to spend today
      </p>
      <p className={`mt-1 text-4xl font-bold ${none ? "text-danger" : ""}`}>
        {money(safe.amount)}
      </p>
      <p className={`mt-2 text-sm ${none ? "text-danger" : "text-primary-foreground/90"}`}>
        {safe.explanation}
      </p>
    </section>
  );
}

type EntryRow = {
  entry_date: string;
  amount_in: number;
  amount_out: number;
  spent_on: string | null;
  merchant: string | null;
};

/**
 * One box: type "spent 20 at costco on groceries" and it fills everything in.
 * Parsing happens locally, so it's instant and costs nothing.
 */
function QuickAdd({ entries }: { entries: EntryRow[] }) {
  const queryClient = useQueryClient();
  const addEntry = useServerFn(createEntry);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Learn categories and merchants from what's already been logged.
  const history = useMemo(
    () => entries.map((e) => ({ spent_on: e.spent_on, merchant: e.merchant })),
    [entries],
  );
  const knownCategories = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) if (e.spent_on?.trim()) set.add(e.spent_on.trim());
    return [...set];
  }, [entries]);

  const parsed = useMemo(
    () => parseQuickEntry(text, { history, knownCategories }),
    [text, history, knownCategories],
  );

  const save = useMutation({
    mutationFn: () =>
      addEntry({
        data: {
          entry_date: parsed.date,
          amount_in: parsed.amountIn,
          amount_out: parsed.amountOut,
          spent_on: parsed.category,
          merchant: parsed.merchant,
          payment_method: "cash",
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      setSaved(parsed.summary);
      setText("");
      setTimeout(() => setSaved(null), 3000);
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Zap className="size-4 text-primary" /> Quick add
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Just type it — &ldquo;spent 20 at costco on groceries&rdquo; or &ldquo;made 300&rdquo;.
      </p>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          if (parsed.ok && !save.isPending) save.mutate();
        }}
      >
        <Input
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setError(null);
          }}
          placeholder="spent 20 on supplies"
          aria-label="Quick add entry"
        />
        <Button type="submit" disabled={!parsed.ok || save.isPending} className="shrink-0">
          {save.isPending ? "Saving…" : "Add"}
        </Button>
      </form>

      {text.trim() ? (
        <p
          className={`mt-2 text-sm ${
            parsed.ok ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {parsed.ok ? (
            <>
              <span className="text-muted-foreground">Reading that as:</span>{" "}
              <span className="font-semibold">{parsed.summary}</span>
              {!parsed.category ? (
                <span className="text-muted-foreground"> · no category</span>
              ) : null}
            </>
          ) : (
            parsed.summary
          )}
        </p>
      ) : null}

      {saved ? <p className="mt-2 text-sm text-success">Saved: {saved}</p> : null}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </section>
  );
}

const SUGGESTIONS = [
  "What did I spend the most on?",
  "How am I doing this week?",
  "Am I making money?",
  "Can I afford $200?",
  "How much have I spent?",
];

function AskSection() {
  const ask = useServerFn(askBookkeeper);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const chat = useMutation({
    mutationFn: (text: string) => ask({ data: { question: text } }),
    onSuccess: (result) => {
      setMessages((prev) => [...prev, { role: "assistant", text: result.answer }]);
    },
    onError: (error: Error) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Sorry, something went wrong: ${error?.message ?? "unknown error"}`,
        },
      ]);
    },
  });

  useEffect(() => {
    if (!chat.isPending) inputRef.current?.focus();
  }, [chat.isPending]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chat.isPending) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setQuestion("");
    chat.mutate(trimmed);
  };

  return (
    <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">Ask about your money</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ask about your numbers in plain English — no accounting talk.
      </p>

      <div className="mt-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => send(suggestion)}
                className="rounded-full border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-accent"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <p
                className={
                  message.role === "user"
                    ? "max-w-[85%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                    : "max-w-[90%] text-sm leading-relaxed whitespace-pre-line"
                }
              >
                {message.text}
              </p>
            </div>
          ))
        )}
        {chat.isPending ? (
          <p className="animate-pulse text-sm text-muted-foreground">Looking at your books…</p>
        ) : null}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(question);
        }}
        className="mt-4 flex gap-2"
      >
        <Input
          ref={inputRef}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask a question…"
          autoFocus
        />
        <Button type="submit" size="icon" className="size-10 shrink-0" disabled={chat.isPending}>
          <Send className="size-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </section>
  );
}
