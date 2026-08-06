/**
 * The cards that make up "Today", each addressable on its own so the nav can
 * link straight to one.
 *
 * The page is ordered around the four questions an owner opens the app with:
 *
 *   1. Where do I stand today?   — one hero number, money in and out beside it
 *   2. What needs me?            — bills due, budgets used up (only when real)
 *   3. What do I do next?        — quick add, reachable without scrolling
 *   4. What just happened?       — recent entries, then streaks
 *
 * `parts` lets each route render a slice of that, so /add gets the entry tools
 * and /dashboard gets the numbers, without two copies of the same logic.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarClock,
  Flame,
  Loader2,
  Send,
  Sparkles,
  Mic,
  MicOff,
  Trash2,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

import { parseQuickEntry } from "@/lib/quick-entry";
import { normalizeSpokenMoney, useSpeech } from "@/lib/use-speech";
import { getInsights } from "@/lib/shop.functions";
import { getHousehold, setEntryShare } from "@/lib/household.functions";

import { uploadReceipt } from "@/lib/receipts";
import { attachReceipt, analyzeReceipt, removeEntry } from "@/lib/books.functions";

import { askBookkeeper, createEntry, getEntries } from "@/lib/books.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Alert,
  Badge,
  Field,
  Metric,
  Money,
  PageHeader,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  Segmented,
  Select,
  SkeletonRows,
} from "@/components/ui/kit";
import { Onboarding } from "@/components/onboarding";
import { InstallPrompt } from "@/components/offline-bar";
import { RecentEntries } from "@/components/sections/recent-entries";
import { isNetworkError, useOfflineEntries } from "@/lib/use-offline";

type ChatMessage = { role: "user" | "assistant"; text: string };

const todayISO = () => new Date().toLocaleDateString("en-CA");

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
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

export type TodayPart = "due" | "safe" | "quickadd" | "form" | "glance" | "streaks" | "ask";

const ALL_TODAY: TodayPart[] = ["due", "safe", "quickadd", "form", "glance", "streaks", "ask"];

export function Dashboard({ parts = ALL_TODAY }: { parts?: TodayPart[] } = {}) {
  const show = (part: TodayPart) => parts.includes(part);
  const queryClient = useQueryClient();
  const fetchEntries = useServerFn(getEntries);
  const addEntry = useServerFn(createEntry);
  const { user } = useRouteContext({ from: "/_authenticated" });
  const navigate = useNavigate();
  const offline = useOfflineEntries(user?.id);

  const {
    data: entries = [],
    isLoading,
    error: entriesError,
  } = useQuery({
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
      setReceiptNotice(
        "Couldn't read that receipt automatically — just fill in the details yourself.",
      );
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
    }): Promise<{ queued: boolean }> => {
      // A receipt photo can only be attached to a row that exists, so an offline
      // save records the figures now and leaves the photo to be added later.
      // Better than refusing the entry, and better than pretending the photo
      // was saved.
      if (!navigator.onLine) return offline.save(input);

      try {
        const entry = await addEntry({ data: input });
        if (receiptFile) {
          const path = await uploadReceipt(receiptFile, entry.id);
          await linkReceipt({ data: { entry_id: entry.id, receipt_path: path } });
        }
        return { queued: false };
      } catch (error) {
        if (isNetworkError(error)) return offline.save(input);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      setAmountIn("");
      setAmountOut("");
      setSpentOn("");
      setMerchant("");
      setShareMode("private");
      const hadReceipt = Boolean(receiptFile);
      setReceiptFile(null);
      setReceiptKey((value) => value + 1);
      setReceiptNotice(
        result.queued && hadReceipt
          ? "Saved on this device. The photo couldn't be attached without a connection — add it from the entry once you're back online."
          : null,
      );
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
    <div className="rise mx-auto w-full max-w-3xl space-y-6">
      {/* ---------------------------------------------- 1. where you stand */}
      {show("glance") ? (
        <PageHeader
          eyebrow="Today"
          title={longDate(today)}
          description="Everything you've logged so far, and what's worth a look."
          className="pb-0"
        />
      ) : null}

      {show("glance") || show("safe") ? (
        <section className="flex flex-wrap gap-3" aria-label="Where you stand today">
          {show("glance") ? (
            <TodayPosition
              loading={isLoading}
              moneyIn={todayIn}
              moneyOut={todayOut}
              net={net}
              allIn={allIn}
              allOut={allOut}
              count={todaysEntries.length}
            />
          ) : null}
          {show("safe") ? <SafeToSpendCard /> : null}
        </section>
      ) : null}

      {/* ------------------------------------------- 2. what needs you now */}
      {show("due") ? <DueSoonBanner /> : null}
      {show("due") ? <InstallPrompt /> : null}
      {show("due") ? <Onboarding /> : null}

      {/* -------------------------------------------- 3. the next action */}
      {show("quickadd") ? <QuickAdd entries={entries} /> : null}

      {show("form") ? (
        <form onSubmit={onSubmit}>
          <Panel>
            <PanelHeader
              title="The full entry"
              description="When you need the date, a receipt or who it's shared with."
            />

            <PanelBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="date" label="Date">
                  <Input
                    type="date"
                    className="num"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                  />
                </Field>

                <Field id="payment" label="Cash or card?">
                  <Select
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value as "cash" | "card" | "other")
                    }
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </Select>
                </Field>

                <Field id="in" label="Money made">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="num"
                    value={amountIn}
                    onChange={(event) => setAmountIn(event.target.value)}
                  />
                </Field>

                <Field id="out" label="Money spent">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="num"
                    value={amountOut}
                    onChange={(event) => setAmountOut(event.target.value)}
                  />
                </Field>

                <Field id="spent-on" label="What was it spent on?">
                  <Input
                    placeholder="Supplies, Rent, Inventory…"
                    value={spentOn}
                    onChange={(event) => setSpentOn(event.target.value)}
                  />
                </Field>

                <Field id="merchant" label="Where?" hint="Optional.">
                  <Input
                    placeholder="Costco, Shell, Home Depot…"
                    value={merchant}
                    onChange={(event) => setMerchant(event.target.value)}
                  />
                </Field>
              </div>

              <Field
                id="receipt"
                label="Receipt photo"
                hint={receiptFile ? undefined : "Optional — only you can see it."}
              >
                <Input
                  key={receiptKey}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="file:mr-3 file:rounded-[var(--radius-8)] file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-[13px]"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setReceiptFile(file);
                    setReceiptNotice(null);
                    if (file) analyze.mutate(file);
                  }}
                />
              </Field>

              {receiptFile ? (
                <p className="-mt-2 truncate text-[12px] text-muted-foreground">
                  Attaching “{receiptFile.name}” — only you can see it.
                </p>
              ) : null}

              {analyze.isPending ? (
                <p className="-mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" /> Reading your
                  receipt…
                </p>
              ) : receiptNotice ? (
                <p className="-mt-2 flex items-start gap-1.5 text-[12px] text-muted-foreground">
                  <Sparkles className="mt-0.5 size-3 shrink-0 text-brand" aria-hidden="true" />
                  <span>{receiptNotice}</span>
                </p>
              ) : null}

              {household?.household ? (
                <div className="space-y-1.5">
                  <p className="text-[13px] font-medium text-foreground">Who can see this?</p>
                  <Segmented
                    name="Who can see this?"
                    value={shareMode}
                    onChange={setShareMode}
                    options={[
                      { value: "private", label: "Just me" },
                      { value: "visible", label: "Share" },
                      { value: "split", label: "Split it" },
                    ]}
                    className="h-11 max-w-full md:h-10"
                  />
                  <p className="text-[12px] text-muted-foreground">
                    {shareMode === "private"
                      ? "Only you will see this."
                      : shareMode === "visible"
                        ? `${household.household.name} can see it, but nobody owes anybody.`
                        : `${household.household.name} can see it and it gets divided evenly.`}
                  </p>
                </div>
              ) : null}

              {formError ? <Alert tone="negative">{formError}</Alert> : null}
            </PanelBody>

            <PanelFooter className="flex-wrap justify-between gap-3">
              <p
                className={
                  saved
                    ? "text-[13px] font-medium text-success"
                    : "text-[12px] text-muted-foreground"
                }
                role={saved ? "status" : undefined}
              >
                {saved ? "Saved! Nice work." : "Nothing leaves your books."}
              </p>
              <Button
                type="submit"
                size="lg"
                className="ml-auto"
                loading={save.isPending}
                disabled={save.isPending}
              >
                {save.isPending ? "Saving…" : "Save entry"}
              </Button>
            </PanelFooter>
          </Panel>
        </form>
      ) : null}

      {/* ------------------------------------------ 4. what changed lately */}
      {show("glance") ? (
        <RecentEntries
          entries={entries}
          isLoading={isLoading}
          error={entriesError as Error | null}
          canShare={Boolean(household?.household)}
          busy={remove.isPending || toggleShare.isPending}
          onToggleShare={(entry) =>
            toggleShare.mutate({
              entry_id: entry.id,
              mode: !entry.household_id ? "visible" : entry.is_split ? "private" : "split",
            })
          }
          onDelete={(entry) => remove.mutate(entry.id)}
          // No receipt on this entry yet: the full form is where photos get
          // attached, so send them there rather than duplicating the uploader.
          onViewReceipt={() => navigate({ to: "/add" })}
        />
      ) : null}

      {show("streaks") ? <StreaksCard /> : null}
      {show("ask") ? <AskSection /> : null}
    </div>
  );
}

/**
 * The loudest thing on the page: today's net, with the two figures it's made
 * of directly underneath so the number can be checked at a glance.
 */
function TodayPosition({
  loading,
  moneyIn,
  moneyOut,
  net,
  allIn,
  allOut,
  count,
}: {
  loading: boolean;
  moneyIn: number;
  moneyOut: number;
  net: number;
  allIn: number;
  allOut: number;
  count: number;
}) {
  return (
    <div className="panel w-full p-5 sm:w-auto sm:flex-[1.7_1_18rem]">
      <Metric
        label="Today's net"
        emphasis="hero"
        loading={loading}
        value={<Money value={net} signed />}
        hint={
          count === 0
            ? "Nothing logged today yet."
            : net > 0
              ? "You're ahead on the day."
              : net < 0
                ? "You're behind on the day."
                : "Break even so far today."
        }
      />

      <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4">
        <Metric
          label="Money in"
          emphasis="compact"
          loading={loading}
          icon={<ArrowUpCircle className="size-3.5 text-success" aria-hidden="true" />}
          value={<Money value={moneyIn} tone="positive" />}
        />
        <Metric
          label="Money out"
          emphasis="compact"
          loading={loading}
          icon={<ArrowDownCircle className="size-3.5 text-danger" aria-hidden="true" />}
          value={<Money value={moneyOut} tone="negative" />}
        />
      </div>

      {loading ? null : (
        <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
          <span className="eyebrow">All time</span>
          <span className="inline-flex items-baseline gap-1">
            <Money value={allIn} tone="positive" className="font-medium" /> in
          </span>
          <span className="inline-flex items-baseline gap-1">
            <Money value={allOut} tone="negative" className="font-medium" /> out
          </span>
          <span className="inline-flex items-baseline gap-1">
            <Money value={allIn - allOut} signed className="font-semibold" /> net
          </span>
        </p>
      )}
    </div>
  );
}

/** Warns about bills due in the next few days, before they bite. */
export function DueSoonBanner() {
  const fetchInsights = useServerFn(getInsights);
  const { data } = useQuery({ queryKey: ["insights"], queryFn: () => fetchInsights() });

  const soon = (data?.calendar ?? []).filter((bill) => bill.daysAway <= 5);
  if (soon.length === 0) return null;

  const total = soon.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <Panel className="pop border-warning/40">
      <PanelHeader
        title={
          <span className="flex items-center gap-2">
            <CalendarClock className="size-4 shrink-0 text-warning" aria-hidden="true" />
            {soon.length === 1 ? (
              "A bill is due soon"
            ) : (
              <>
                <span className="num">{soon.length}</span> bills due soon
              </>
            )}
          </span>
        }
        description="Worth covering before it catches you out."
        action={
          <Badge tone="warning">
            <Money value={total} />
          </Badge>
        }
      />
      <PanelBody>
        <ul className="divide-hairline">
          {soon.slice(0, 4).map((bill, index) => (
            <li key={index} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="min-w-0 truncate">{bill.category}</span>
              <span className="flex shrink-0 items-baseline gap-3">
                <span className="num text-[12px] text-muted-foreground">
                  {bill.daysAway === 0
                    ? "today"
                    : bill.daysAway === 1
                      ? "tomorrow"
                      : `in ${bill.daysAway} days`}
                </span>
                <Money value={bill.amount} className="text-sm font-medium" />
              </span>
            </li>
          ))}
        </ul>
      </PanelBody>
    </Panel>
  );
}

/** Habit and progress streaks — a nudge to keep logging. */
export function StreaksCard() {
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
    <Panel>
      <PanelHeader
        title={
          <span className="flex items-center gap-2">
            <Flame className="size-4 shrink-0 text-brand" aria-hidden="true" /> Your streaks
          </span>
        }
        description={
          s.loggingStreak >= 3
            ? `Nice — ${s.loggingStreak} days in a row of keeping your books up to date.`
            : "Log something every day and your streak starts building."
        }
      />
      <PanelBody>
        <div className="grid gap-4 sm:grid-cols-3">
          {tiles.map((tile) => (
            <Metric
              key={tile.label}
              label={tile.label}
              value={
                <span className="num">
                  {tile.value}{" "}
                  <span className="text-sm font-normal text-muted-foreground">{tile.suffix}</span>
                </span>
              }
              hint={
                tile.best > tile.value ? (
                  <>
                    Best: <span className="num">{tile.best}</span>
                  </>
                ) : tile.value > 0 && tile.value === tile.best ? (
                  <span className="text-success">Your best yet</span>
                ) : undefined
              }
            />
          ))}
        </div>

        {s.activeDaysThisMonth > 0 ? (
          <p className="mt-5 border-t pt-4 text-[13px] text-muted-foreground">
            This month you came out ahead on{" "}
            <span className="num font-semibold text-foreground">
              {s.profitableDaysThisMonth} of {s.activeDaysThisMonth}
            </span>{" "}
            days you logged.
          </p>
        ) : null}
      </PanelBody>
    </Panel>
  );
}

/** One number: what's safe to spend today without causing trouble later. */
export function SafeToSpendCard() {
  const fetchInsights = useServerFn(getInsights);
  const { data, isLoading } = useQuery({ queryKey: ["insights"], queryFn: () => fetchInsights() });

  if (!data && !isLoading) return null;

  const safe = data?.safeToSpend;
  const none = safe ? safe.amount <= 0 : false;

  return (
    <div
      className={`panel w-full p-5 sm:w-auto sm:flex-[1_1_13rem] ${none ? "border-danger/40" : ""}`}
    >
      <Metric
        label="Safe to spend today"
        loading={!safe}
        tone={none ? "negative" : "neutral"}
        icon={<Wallet className="size-3.5" aria-hidden="true" />}
        value={<Money value={safe?.amount ?? 0} />}
        hint={safe ? <span className="num">{safe.explanation}</span> : undefined}
      />
      {none ? (
        <p className="mt-3">
          <Badge tone="negative">Nothing left for today</Badge>
        </p>
      ) : null}
    </div>
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
 *
 * This is the most-used control in the app, so it gets the brand button and
 * sits high enough to be usable on a phone without scrolling.
 */
export function QuickAdd({ entries }: { entries: EntryRow[] }) {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const offline = useOfflineEntries(user?.id);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Browser-native dictation — no AI service involved.
  const speech = useSpeech({
    onFinal: (spoken) => {
      setText(normalizeSpokenMoney(spoken));
      setError(null);
    },
  });

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
    // Goes to the server when there's a connection and waits on the device when
    // there isn't, so a dead signal never costs you the entry.
    mutationFn: () =>
      offline.save({
        entry_date: parsed.date,
        amount_in: parsed.amountIn,
        amount_out: parsed.amountOut,
        spent_on: parsed.category,
        merchant: parsed.merchant,
        payment_method: "cash",
      }),
    onSuccess: (result) => {
      setSaved(result.queued ? `Saved on this device — ${parsed.summary}` : parsed.summary);
      setText("");
      setTimeout(() => setSaved(null), 3000);
    },
    onError: (err: Error) => setError(err.message),
  });

  const detail =
    [
      parsed.category ?? "No category",
      parsed.merchant ? `at ${parsed.merchant}` : null,
      parsed.date !== todayISO() ? `on ${parsed.date}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "No category";

  return (
    <Panel className="border-brand-border">
      <PanelHeader
        title={
          <span className="flex items-center gap-2">
            <Zap className="size-4 shrink-0 text-brand" aria-hidden="true" /> Quick add
          </span>
        }
        description={`Just type it — “spent 20 at costco on groceries” or “made 300”.${
          speech.supported ? " Or tap the mic and say it." : ""
        }`}
      />

      <PanelBody>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            if (parsed.ok && !save.isPending) save.mutate();
          }}
        >
          <div className="flex gap-2">
            <Input
              value={speech.listening && speech.interim ? speech.interim : text}
              onChange={(event) => {
                setText(event.target.value);
                setError(null);
              }}
              placeholder={speech.listening ? "Listening…" : "spent 20 on supplies"}
              aria-label="Quick add entry"
              className="h-12 min-w-0 flex-1 rounded-[var(--radius-12)] text-base md:h-12 md:text-base"
            />
            {speech.supported ? (
              <Button
                type="button"
                variant={speech.listening ? "secondary" : "outline"}
                size="icon"
                className="size-12 shrink-0 rounded-[var(--radius-12)]"
                onClick={speech.toggle}
                aria-label={speech.listening ? "Stop listening" : "Add by voice"}
                aria-pressed={speech.listening}
                title={speech.listening ? "Stop listening" : "Add by voice"}
              >
                {speech.listening ? (
                  <MicOff className="size-4" aria-hidden="true" />
                ) : (
                  <Mic className="size-4" aria-hidden="true" />
                )}
              </Button>
            ) : null}
          </div>

          {text.trim() ? (
            parsed.ok ? (
              <div className="pop flex items-center gap-3 rounded-[var(--radius-12)] border border-brand-border bg-brand-soft px-3 py-2.5">
                <Sparkles className="size-4 shrink-0 text-brand" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="eyebrow">Reading that as</span>
                  <span className="mt-0.5 block truncate text-[13px] font-medium text-foreground">
                    {detail}
                  </span>
                </span>
                <Money
                  value={parsed.amountIn > 0 ? parsed.amountIn : -parsed.amountOut}
                  signed
                  className="shrink-0 text-[15px] font-semibold"
                />
              </div>
            ) : (
              <p className="rounded-[var(--radius-12)] bg-surface-2 px-3 py-2.5 text-[13px] text-muted-foreground">
                {parsed.summary}
              </p>
            )
          ) : null}

          <Button
            type="submit"
            variant="brand"
            size="lg"
            className="h-12 w-full rounded-[var(--radius-12)]"
            disabled={!parsed.ok || save.isPending}
            loading={save.isPending}
          >
            {save.isPending ? "Saving…" : "Add it"}
          </Button>
        </form>

        {speech.listening || speech.error || saved || error ? (
          <div className="mt-3 space-y-2">
            {speech.listening ? (
              <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-danger" />
                Listening — say something like “spent twenty dollars on lunch”.
              </p>
            ) : null}
            {speech.error ? <Alert tone="negative">{speech.error}</Alert> : null}
            {saved ? (
              <Alert tone="positive" title="Saved">
                {saved}
              </Alert>
            ) : null}
            {error ? <Alert tone="negative">{error}</Alert> : null}
          </div>
        ) : null}
      </PanelBody>
    </Panel>
  );
}

const SUGGESTIONS = [
  "What did I spend the most on?",
  "How am I doing this week?",
  "Am I making money?",
  "Can I afford $200?",
  "How much have I spent?",
];

export function AskSection() {
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
    <Panel>
      <PanelHeader
        title="Ask about your money"
        description="Ask about your numbers in plain English — no accounting talk."
      />

      <PanelBody className="space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => send(suggestion)}
                className={[
                  "inline-flex min-h-10 items-center rounded-full border border-border bg-surface-2 px-3.5 text-[13px]",
                  "cursor-pointer text-foreground",
                  "transition-colors duration-[var(--dur-fast)] ease-[var(--ease)]",
                  "hover:border-border-strong hover:bg-accent",
                ].join(" ")}
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
                    ? "max-w-[85%] rounded-[var(--radius-14)] bg-brand px-4 py-2 text-sm text-brand-foreground"
                    : "max-w-[90%] text-sm leading-relaxed whitespace-pre-line"
                }
              >
                {message.text}
              </p>
            </div>
          ))
        )}
        {chat.isPending ? (
          <p className="animate-pulse text-[13px] text-muted-foreground">Looking at your books…</p>
        ) : null}
      </PanelBody>

      <PanelFooter>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(question);
          }}
          className="flex w-full gap-2"
        >
          <Input
            ref={inputRef}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a question…"
            aria-label="Ask a question about your money"
            className="min-w-0 flex-1"
            autoFocus
          />
          <Button type="submit" size="icon" className="shrink-0" disabled={chat.isPending}>
            <Send className="size-4" aria-hidden="true" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </PanelFooter>
    </Panel>
  );
}
