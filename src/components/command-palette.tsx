import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CornerDownLeft, Plus, Search } from "lucide-react";

import { getEntries } from "@/lib/books.functions";
import { parseQuickEntry } from "@/lib/quick-entry";
import { useOfflineEntries } from "@/lib/use-offline";

/** Every page you can jump to, with words people might search for instead. */
const PAGES: Array<{ to: string; label: string; group: string; keywords?: string }> = [
  { to: "/dashboard", label: "Today", group: "Today", keywords: "overview home safe to spend" },
  { to: "/add", label: "Add an entry", group: "Today", keywords: "new log record income expense" },
  {
    to: "/entries",
    label: "Find an entry",
    group: "Today",
    keywords: "search filter edit fix correct change history all entries find",
  },
  { to: "/streaks", label: "Your streaks", group: "Today", keywords: "habit run profitable" },
  { to: "/ask", label: "Ask about your money", group: "Today", keywords: "chat question ai help" },

  { to: "/monthly", label: "This month", group: "This month", keywords: "overview totals profit" },
  {
    to: "/categories",
    label: "Where money went",
    group: "This month",
    keywords: "categories pie spending breakdown",
  },
  { to: "/daybyday", label: "Day by day", group: "This month", keywords: "chart daily" },
  { to: "/week", label: "Your week", group: "This month", keywords: "digest recap summary" },
  {
    to: "/outlook",
    label: "Can you cover it",
    group: "This month",
    keywords: "forecast runway rent future",
  },
  {
    to: "/busydays",
    label: "Busy and quiet days",
    group: "This month",
    keywords: "slow best weekday pattern",
  },
  { to: "/budgets", label: "Budgets", group: "This month", keywords: "limits caps" },
  { to: "/goals", label: "Savings goals", group: "This month", keywords: "saving target" },
  { to: "/bills", label: "Bills", group: "This month", keywords: "due recurring subscriptions" },

  {
    to: "/invoices",
    label: "Invoices",
    group: "Invoices",
    keywords: "invoice bill customer owed outstanding overdue unpaid client",
  },
  {
    to: "/invoice-new",
    label: "New invoice",
    group: "Invoices",
    keywords: "create invoice bill customer new charge",
  },

  { to: "/household", label: "Household", group: "Tools", keywords: "share partner split invite" },
  {
    to: "/reminders",
    label: "Daily reminder",
    group: "Tools",
    keywords: "reminder notification nudge alert daily habit time",
  },
  {
    to: "/margins",
    label: "Item margins",
    group: "Tools",
    keywords: "profit per item price product",
  },
  { to: "/drawer", label: "Cash drawer", group: "Tools", keywords: "till count reconcile" },
  { to: "/tax", label: "Tax set-aside", group: "Tools", keywords: "tax rate hold back" },
  { to: "/lock", label: "Lock this app", group: "Tools", keywords: "pin privacy security" },

  { to: "/export", label: "Export records", group: "Export", keywords: "download accountant" },
  {
    to: "/export?download=csv",
    label: "Download CSV",
    group: "Export",
    keywords: "spreadsheet excel",
  },
  { to: "/export?download=pdf", label: "Download PDF", group: "Export", keywords: "print pdf" },

  {
    to: "/help",
    label: "Help — how everything works",
    group: "Help",
    keywords: "help guide tutorial how to stuck support explain",
  },
  {
    to: "/help?group=logging",
    label: "Help: logging money",
    group: "Help",
    keywords: "help entry receipt voice quick add",
  },
  {
    to: "/help?group=month",
    label: "Help: this month",
    group: "Help",
    keywords: "help budgets goals bills forecast charts",
  },
  {
    to: "/help?group=tools",
    label: "Help: tools",
    group: "Help",
    keywords: "help household split margins drawer tax lock",
  },
  {
    to: "/help?group=export",
    label: "Help: export",
    group: "Help",
    keywords: "help csv pdf accountant",
  },
];

/** Loose subsequence match, so "wmw" finds "Where money went". */
function matches(query: string, text: string) {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const t = text.toLowerCase();
  if (!q) return true;
  if (t.includes(query.toLowerCase())) return true;
  let i = 0;
  for (const char of t) {
    if (char === q[i]) i += 1;
    if (i === q.length) return true;
  }
  return false;
}

export function CommandPalette() {
  const navigate = useNavigate();
  const { user } = useRouteContext({ from: "/_authenticated" });
  const offline = useOfflineEntries(user?.id);
  const fetchEntries = useServerFn(getEntries);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only loaded while the palette is open, so it costs nothing otherwise.
  const { data: entries = [] } = useQuery({
    queryKey: ["entries"],
    queryFn: () => fetchEntries(),
    enabled: open,
  });

  const history = useMemo(
    () => entries.map((e) => ({ spent_on: e.spent_on, merchant: e.merchant })),
    [entries],
  );
  const knownCategories = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) if (e.spent_on?.trim()) set.add(e.spent_on.trim());
    return [...set];
  }, [entries]);

  // If what you typed looks like an entry, offer to log it.
  const parsed = useMemo(
    () => parseQuickEntry(query, { history, knownCategories }),
    [query, history, knownCategories],
  );

  const pageResults = useMemo(
    () =>
      PAGES.filter(
        (page) => matches(query, page.label) || matches(query, page.keywords ?? ""),
      ).slice(0, 8),
    [query],
  );

  type Action = { kind: "log" } | { kind: "page"; to: string; label: string; group: string };
  const actions: Action[] = useMemo(
    () => [
      ...(parsed.ok ? [{ kind: "log" as const }] : []),
      ...pageResults.map((p) => ({
        kind: "page" as const,
        to: p.to,
        label: p.label,
        group: p.group,
      })),
    ],
    [parsed.ok, pageResults],
  );

  useEffect(() => setCursor(0), [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setNote(null);
  }, []);

  const save = useMutation({
    mutationFn: () =>
      offline.save({
        entry_date: parsed.date,
        amount_in: parsed.amountIn,
        amount_out: parsed.amountOut,
        spent_on: parsed.category,
        merchant: parsed.merchant,
        payment_method: "cash",
        share: "private",
      }),
    onSuccess: (result) => {
      setNote(
        result.queued
          ? `Saved on this device, will send later: ${parsed.summary}`
          : `Logged: ${parsed.summary}`,
      );
      setQuery("");
      window.setTimeout(() => setNote(null), 2500);
    },
    onError: (error: Error) => setNote(error.message),
  });

  const run = useCallback(
    (action: Action | undefined) => {
      if (!action) return;
      if (action.kind === "log") {
        if (!save.isPending) save.mutate();
        return;
      }
      close();
      navigate({ to: action.to });
    },
    [close, navigate, save],
  );

  // ⌘K / Ctrl+K to open, Escape to close.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-3 pt-[10vh] sm:p-4 sm:pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={close}
        aria-label="Close command palette"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="floating pop relative w-full max-w-xl overflow-hidden"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setCursor((c) => Math.min(c + 1, actions.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              } else if (event.key === "Enter") {
                event.preventDefault();
                run(actions[cursor]);
              }
            }}
            placeholder="Go anywhere, or type an entry like “spent 20 on supplies”"
            className="h-14 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-[15px]"
            aria-label="Search or log an entry"
          />
          <kbd className="num hidden shrink-0 rounded-[var(--radius-8)] border border-border-strong bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto overscroll-contain p-1.5">
          {note ? (
            <p
              role="status"
              className="mx-1.5 my-1 rounded-[var(--radius-10)] bg-success-soft px-3 py-2 text-[13px] font-medium text-success"
            >
              {note}
            </p>
          ) : null}

          {actions.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nothing matches that.
            </p>
          ) : null}

          {actions.map((action, index) => {
            const selected = index === cursor;
            if (action.kind === "log") {
              return (
                <button
                  key="log"
                  type="button"
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => run(action)}
                  aria-selected={selected}
                  className={`flex min-h-[44px] w-full items-center gap-3 rounded-[var(--radius-10)] px-3 py-2.5 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] ${
                    selected ? "bg-accent" : "hover:bg-accent/60"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-soft text-brand"
                  >
                    <Plus className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {save.isPending ? "Logging…" : "Log this entry"}
                    </span>
                    <span className="block truncate text-[12px] text-muted-foreground">
                      {parsed.summary}
                    </span>
                  </span>
                  {selected ? (
                    <CornerDownLeft
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            }
            return (
              <button
                key={action.to}
                type="button"
                onMouseEnter={() => setCursor(index)}
                onClick={() => run(action)}
                aria-selected={selected}
                className={`flex min-h-[44px] w-full items-center gap-3 rounded-[var(--radius-10)] px-3 py-2.5 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] ${
                  selected ? "bg-accent" : "hover:bg-accent/60"
                }`}
              >
                <span className="min-w-0 flex-1 truncate text-sm">{action.label}</span>
                <span className="shrink-0 text-[11px] text-muted-foreground">{action.group}</span>
                {selected ? (
                  <CornerDownLeft
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-surface-2/50 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span>↑↓ to move</span>
          <span>↵ to pick</span>
          <span className="ml-auto hidden sm:inline">Type an amount to log it straight away</span>
        </div>
      </div>
    </div>
  );
}
