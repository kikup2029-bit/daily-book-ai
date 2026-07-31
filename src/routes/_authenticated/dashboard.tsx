import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Loader2, Send, Sparkles } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { ReceiptAttachButton, ReceiptThumb } from "@/components/receipt-controls";
import { uploadReceipt } from "@/lib/receipts";
import { attachReceipt, analyzeReceipt } from "@/lib/books.functions";

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
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptKey, setReceiptKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [receiptNotice, setReceiptNotice] = useState<string | null>(null);
  const linkReceipt = useServerFn(attachReceipt);
  const runAnalyzeReceipt = useServerFn(analyzeReceipt);

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

      <section className="rounded-3xl border bg-card p-5 shadow-sm">
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
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AskSection />
    </main>
  );
}

const SUGGESTIONS = [
  "What did I spend the most on?",
  "Can I afford to buy more supplies?",
  "How am I doing this week?",
  "What's a good profit margin for a small shop?",
  "How should I price my products?",
  "Which expenses are usually tax deductible?",
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
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I couldn't get to your numbers just now. Please try again in a moment.",
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
        Ask about your own numbers, or any general money question — plain answers, no accounting
        talk.
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
