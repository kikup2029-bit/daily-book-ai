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
import { useI18n } from "@/lib/i18n";
import { isNetworkError, useOfflineEntries } from "@/lib/use-offline";

type ChatMessage = { role: "user" | "assistant"; text: string };

const todayISO = () => new Date().toLocaleDateString("en-CA");

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
  const { t, formatDate } = useI18n();
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
        filledSomething ? t("entryForm.receiptFilled") : t("entryForm.receiptUnreadable"),
      );
    },
    onError: () => {
      setReceiptNotice(t("entryForm.receiptUnreadable"));
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
      setReceiptNotice(result.queued && hadReceipt ? t("entryForm.receiptOffline") : null);
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
      setFormError(t("entryForm.errAmounts"));
      return;
    }
    if (inAmount === 0 && outAmount === 0) {
      setFormError(t("entryForm.errEmpty"));
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
          eyebrow={t("dashboard.eyebrow")}
          title={formatDate(today, "long")}
          description={t("dashboard.blurb")}
          className="pb-0"
        />
      ) : null}

      {show("glance") || show("safe") ? (
        <section className="flex flex-wrap gap-3" aria-label={t("dashboard.position")}>
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
              title={t("entryForm.fullEntry")}
              description={t("entryForm.fullEntryBlurb")}
            />

            <PanelBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="date" label={t("common.date")}>
                  <Input
                    type="date"
                    className="num"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                  />
                </Field>

                <Field id="payment" label={t("entryForm.paidWith")}>
                  <Select
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value as "cash" | "card" | "other")
                    }
                  >
                    <option value="cash">{t("entryForm.cash")}</option>
                    <option value="card">{t("entryForm.card")}</option>
                    <option value="other">{t("entryForm.other")}</option>
                  </Select>
                </Field>

                <Field id="in" label={t("entryForm.moneyMade")}>
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

                <Field id="out" label={t("entryForm.moneySpent")}>
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

                <Field id="spent-on" label={t("entryForm.whatFor")}>
                  <Input
                    placeholder={t("entryForm.whatForExamples")}
                    value={spentOn}
                    onChange={(event) => setSpentOn(event.target.value)}
                  />
                </Field>

                <Field id="merchant" label={t("entryForm.where")} hint={t("common.optional")}>
                  <Input
                    placeholder={t("entryForm.whereExamples")}
                    value={merchant}
                    onChange={(event) => setMerchant(event.target.value)}
                  />
                </Field>
              </div>

              <Field
                id="receipt"
                label={t("entryForm.receiptPhoto")}
                hint={receiptFile ? undefined : t("entryForm.receiptPrivateHint")}
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
                  {t("entryForm.receiptAttaching", { name: receiptFile.name })}
                </p>
              ) : null}

              {analyze.isPending ? (
                <p className="-mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />{" "}
                  {t("entryForm.receiptReading")}
                </p>
              ) : receiptNotice ? (
                <p className="-mt-2 flex items-start gap-1.5 text-[12px] text-muted-foreground">
                  <Sparkles className="mt-0.5 size-3 shrink-0 text-brand" aria-hidden="true" />
                  <span>{receiptNotice}</span>
                </p>
              ) : null}

              {household?.household ? (
                <div className="space-y-1.5">
                  <p className="text-[13px] font-medium text-foreground">
                    {t("entryForm.whoCanSee")}
                  </p>
                  <Segmented
                    name={t("entryForm.whoCanSee")}
                    value={shareMode}
                    onChange={setShareMode}
                    options={[
                      { value: "private", label: t("entryForm.justMe") },
                      { value: "visible", label: t("entryForm.shareIt") },
                      { value: "split", label: t("entryForm.splitIt") },
                    ]}
                    className="h-11 max-w-full md:h-10"
                  />
                  {/* The household's name sits inside the sentence, not in front
                      of it — where it falls differs by language. */}
                  <p className="text-[12px] text-muted-foreground">
                    {shareMode === "private"
                      ? t("entryForm.shareNoneBlurb")
                      : shareMode === "visible"
                        ? t("entryForm.shareVisibleBlurb", { household: household.household.name })
                        : t("entryForm.shareSplitBlurb", { household: household.household.name })}
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
                {saved ? t("entryForm.saved") : t("entryForm.staysPrivate")}
              </p>
              <Button
                type="submit"
                size="lg"
                className="ml-auto"
                loading={save.isPending}
                disabled={save.isPending}
              >
                {save.isPending ? t("common.saving") : t("entryForm.saveEntry")}
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
  const { t, money, signedMoney } = useI18n();

  return (
    <div className="panel w-full p-5 sm:w-auto sm:flex-[1.7_1_18rem]">
      <Metric
        label={t("dashboard.todaysNet")}
        emphasis="hero"
        loading={loading}
        value={<Money value={net} signed />}
        hint={
          count === 0
            ? t("dashboard.nothingToday")
            : net > 0
              ? t("dashboard.aheadToday")
              : net < 0
                ? t("dashboard.behindToday")
                : t("dashboard.evenToday")
        }
      />

      <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4">
        <Metric
          label={t("common.moneyIn")}
          emphasis="compact"
          loading={loading}
          icon={<ArrowUpCircle className="size-3.5 text-success" aria-hidden="true" />}
          value={<Money value={moneyIn} tone="positive" />}
        />
        <Metric
          label={t("common.moneyOut")}
          emphasis="compact"
          loading={loading}
          icon={<ArrowDownCircle className="size-3.5 text-danger" aria-hidden="true" />}
          value={<Money value={moneyOut} tone="negative" />}
        />
      </div>

      {loading ? null : (
        /* Each figure keeps the word that says which direction it went in the
           same string, so a language that puts the word first can. */
        <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
          <span className="eyebrow">{t("dashboard.allTime")}</span>
          <span className="num inline-flex items-baseline gap-1 font-medium text-success">
            {t("dashboard.allTimeIn", { amount: money(allIn) })}
          </span>
          <span className="num inline-flex items-baseline gap-1 font-medium text-danger">
            {t("dashboard.allTimeOut", { amount: money(allOut) })}
          </span>
          <span className="num inline-flex items-baseline gap-1 font-semibold">
            {t("dashboard.allTimeNet", { amount: signedMoney(allIn - allOut) })}
          </span>
        </p>
      )}
    </div>
  );
}

/** Warns about bills due in the next few days, before they bite. */
export function DueSoonBanner() {
  const { t } = useI18n();
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
            {t("dashboard.billsDueSoon", { count: soon.length })}
          </span>
        }
        description={t("dashboard.billsDueSoonBlurb")}
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
                    ? t("month.dueToday")
                    : bill.daysAway === 1
                      ? t("month.dueTomorrow")
                      : t("month.dueInDays", { count: bill.daysAway })}
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
  const { t, formatNumber } = useI18n();
  const fetchInsights = useServerFn(getInsights);
  const { data } = useQuery({ queryKey: ["insights"], queryFn: () => fetchInsights() });

  const s = data?.streaks;
  if (!s || s.totalDaysLogged === 0) return null;

  // "3 days" is one string, not a number with a word stuck on the end: the
  // unit doesn't follow the number in every language.
  const tiles = [
    {
      label: t("dashboard.streakLogging"),
      value: s.loggingStreak,
      best: s.longestLoggingStreak,
      show: true,
    },
    {
      label: t("dashboard.streakProfitable"),
      value: s.profitableStreak,
      best: s.longestProfitableStreak,
      show: s.longestProfitableStreak > 0,
    },
    {
      label: t("dashboard.streakNoSpend"),
      value: s.noSpendStreak,
      best: s.longestNoSpendStreak,
      show: s.longestNoSpendStreak > 0,
    },
  ].filter((tile) => tile.show);

  return (
    <Panel>
      <PanelHeader
        title={
          <span className="flex items-center gap-2">
            <Flame className="size-4 shrink-0 text-brand" aria-hidden="true" /> {t("nav.streaks")}
          </span>
        }
        description={
          s.loggingStreak >= 3
            ? t("dashboard.streakNice", { count: s.loggingStreak })
            : t("dashboard.streakStart")
        }
      />
      <PanelBody>
        <div className="grid gap-4 sm:grid-cols-3">
          {tiles.map((tile) => (
            <Metric
              key={tile.label}
              label={tile.label}
              value={<span className="num">{t("dashboard.streakDays", { count: tile.value })}</span>}
              hint={
                tile.best > tile.value ? (
                  <span className="num">{t("dashboard.streakBest", { count: tile.best })}</span>
                ) : tile.value > 0 && tile.value === tile.best ? (
                  <span className="text-success">{t("dashboard.streakYourBest")}</span>
                ) : undefined
              }
            />
          ))}
        </div>

        {s.activeDaysThisMonth > 0 ? (
          <p className="mt-5 border-t pt-4 text-[13px] text-muted-foreground">
            {t("dashboard.aheadDaysThisMonth", {
              profitable: formatNumber(s.profitableDaysThisMonth),
              active: formatNumber(s.activeDaysThisMonth),
            })}
          </p>
        ) : null}
      </PanelBody>
    </Panel>
  );
}

/** One number: what's safe to spend today without causing trouble later. */
export function SafeToSpendCard() {
  const { t } = useI18n();
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
        label={t("dashboard.safeToSpend")}
        loading={!safe}
        tone={none ? "negative" : "neutral"}
        icon={<Wallet className="size-3.5" aria-hidden="true" />}
        value={<Money value={safe?.amount ?? 0} />}
        hint={safe ? <span className="num">{safe.explanation}</span> : undefined}
      />
      {none ? (
        <p className="mt-3">
          <Badge tone="negative">{t("dashboard.nothingLeft")}</Badge>
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
  const { t } = useI18n();
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
      setSaved(
        result.queued
          ? t("dashboard.savedOnDevice", { summary: parsed.summary })
          : parsed.summary,
      );
      setText("");
      setTimeout(() => setSaved(null), 3000);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Each chip is a phrase of its own, so the merchant and the date sit inside
  // the words that introduce them rather than being glued on afterwards.
  const detail =
    [
      parsed.category ?? t("dashboard.noCategory"),
      parsed.merchant ? t("dashboard.atMerchant", { merchant: parsed.merchant }) : null,
      parsed.date !== todayISO() ? t("dashboard.onDate", { date: parsed.date }) : null,
    ]
      .filter(Boolean)
      .join(" · ") || t("dashboard.noCategory");

  return (
    <Panel className="border-brand-border">
      <PanelHeader
        title={
          <span className="flex items-center gap-2">
            <Zap className="size-4 shrink-0 text-brand" aria-hidden="true" />{" "}
            {t("dashboard.quickAdd")}
          </span>
        }
        description={`${t("dashboard.quickAddBlurb")}${
          speech.supported ? ` ${t("dashboard.quickAddVoice")}` : ""
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
              placeholder={
                speech.listening ? t("dashboard.listening") : t("dashboard.quickAddPlaceholder")
              }
              aria-label={t("dashboard.quickAddInputLabel")}
              className="h-12 min-w-0 flex-1 rounded-[var(--radius-12)] text-base md:h-12 md:text-base"
            />
            {speech.supported ? (
              <Button
                type="button"
                variant={speech.listening ? "secondary" : "outline"}
                size="icon"
                className="size-12 shrink-0 rounded-[var(--radius-12)]"
                onClick={speech.toggle}
                aria-label={
                  speech.listening ? t("dashboard.stopListening") : t("dashboard.startListening")
                }
                aria-pressed={speech.listening}
                title={
                  speech.listening ? t("dashboard.stopListening") : t("dashboard.startListening")
                }
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
                  <span className="eyebrow">{t("dashboard.readingThatAs")}</span>
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
            {save.isPending ? t("common.saving") : t("dashboard.addIt")}
          </Button>
        </form>

        {speech.listening || speech.error || saved || error ? (
          <div className="mt-3 space-y-2">
            {speech.listening ? (
              <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-danger" />
                {t("dashboard.listeningHint")}
              </p>
            ) : null}
            {speech.error ? <Alert tone="negative">{speech.error}</Alert> : null}
            {saved ? (
              <Alert tone="positive" title={t("entryForm.saved")}>
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

/** Openers, as keys — the questions are shown, so they're the reader's language. */
const SUGGESTION_KEYS = [
  "dashboard.askMostSpent",
  "dashboard.askThisWeek",
  "dashboard.askMakingMoney",
  "dashboard.askCanIAfford",
  "dashboard.askHowMuchSpent",
];

export function AskSection() {
  const { t } = useI18n();
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
          // The apology is one sentence either way, never an apology with a
          // reason bolted onto the end of it.
          text: error?.message
            ? t("dashboard.askFailed", { message: error.message })
            : t("dashboard.askFailedUnknown"),
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
      <PanelHeader title={t("nav.ask")} description={t("dashboard.askBlurb")} />

      <PanelBody className="space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {SUGGESTION_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => send(t(key))}
                className={[
                  "inline-flex min-h-10 items-center rounded-full border border-border bg-surface-2 px-3.5 text-[13px]",
                  "cursor-pointer text-foreground",
                  "transition-colors duration-[var(--dur-fast)] ease-[var(--ease)]",
                  "hover:border-border-strong hover:bg-accent",
                ].join(" ")}
              >
                {t(key)}
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
          <p className="animate-pulse text-[13px] text-muted-foreground">
            {t("dashboard.askThinking")}
          </p>
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
            placeholder={t("dashboard.askPlaceholder")}
            aria-label={t("nav.ask")}
            className="min-w-0 flex-1"
            autoFocus
          />
          <Button type="submit" size="icon" className="shrink-0" disabled={chat.isPending}>
            <Send className="size-4" aria-hidden="true" />
            <span className="sr-only">{t("common.send")}</span>
          </Button>
        </form>
      </PanelFooter>
    </Panel>
  );
}
