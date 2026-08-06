/**
 * Invoices: the money you're owed.
 *
 * All the rules live in src/lib/invoices.ts as pure functions, so this file is
 * only ever presentation and wiring. Nothing here recalculates a total or
 * decides what "overdue" means.
 */

import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, FileText, Plus, Printer, Search, Send, Trash2, X } from "lucide-react";

import {
  allowedActions,
  blankDraft,
  daysOverdue,
  displayStatus,
  emptyLine,
  filterInvoices,
  hasProblems,
  invoiceTotal,
  invoiceTotals,
  lineTotal,
  summarize,
  validateInvoice,
  type DisplayStatus,
  type Invoice,
  type InvoiceDraft,
  type InvoiceFilter,
  type InvoiceProblems,
} from "@/lib/invoices";
import {
  createInvoiceFn,
  getInvoices,
  markPaidFn,
  markUnpaidFn,
  removeInvoiceFn,
  setInvoiceStatusFn,
  updateInvoiceFn,
} from "@/lib/invoices.functions";
import { useI18n } from "@/lib/i18n";
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
  SkeletonRows,
  formatMoney,
} from "@/components/ui/kit";

const todayISO = () => new Date().toLocaleDateString("en-CA");

const BADGE_TONE: Record<DisplayStatus, "neutral" | "positive" | "negative" | "warning"> = {
  draft: "neutral",
  sent: "warning",
  overdue: "negative",
  paid: "positive",
  void: "neutral",
};

/**
 * The status chip's wording, per language.
 *
 * src/lib/invoices.ts keeps STATUS_LABELS in English because it's pure logic
 * with no access to the reader's language. The mapping to a translation key
 * belongs here, where there's a `t`.
 */
const STATUS_KEY: Record<DisplayStatus, string> = {
  draft: "invoices.statusDraft",
  sent: "invoices.statusSent",
  overdue: "invoices.statusOverdue",
  paid: "invoices.statusPaid",
  void: "invoices.statusVoid",
};

/**
 * validateInvoice() reports problems in English, for the same reason: it's a
 * pure function shared with the server. Each message maps to exactly one key.
 */
const PROBLEM_KEY: Record<string, string> = {
  "Who is this invoice for?": "invoices.errCustomer",
  "That name is too long.": "invoices.errNameLong",
  "That doesn't look like an email address.": "invoices.errEmail",
  "Pick a date.": "invoices.errDate",
  "Due date can't be before the issue date.": "invoices.errDueBeforeIssue",
  "Add at least one item.": "invoices.errNoLines",
  "Describe what this is for.": "invoices.errLineDescription",
  "Quantity must be more than zero.": "invoices.errLineQuantity",
  "Price can't be negative.": "invoices.errLinePrice",
};

function useInvoices() {
  const fetchInvoices = useServerFn(getInvoices);
  return useQuery({ queryKey: ["invoices"], queryFn: () => fetchInvoices() });
}

/** Everything that touches invoices also moves money, so refresh both. */
function useInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    queryClient.invalidateQueries({ queryKey: ["insights"] });
  };
}

/* ============================================================ list ======= */

export function InvoicesList() {
  const { t, formatDate } = useI18n();
  const { data: invoices = [], isLoading, error } = useInvoices();
  const [filter, setFilter] = useState<InvoiceFilter>("all");
  const [search, setSearch] = useState("");
  const today = todayISO();

  const totals = useMemo(() => summarize(invoices, today), [invoices, today]);
  const rows = useMemo(
    () => filterInvoices(invoices, filter, today, search),
    [invoices, filter, today, search],
  );

  return (
    <div className="rise mx-auto w-full max-w-5xl">
      <PageHeader
        eyebrow={t("invoices.eyebrow")}
        title={t("invoices.title")}
        description={t("invoices.blurb")}
        actions={
          <Button asChild variant="brand">
            <Link to="/invoice-new">
              <Plus aria-hidden="true" /> {t("invoices.newInvoice")}
            </Link>
          </Button>
        }
      />

      {error ? (
        <Alert tone="negative" title={t("invoices.notAvailable")}>
          {(error as Error).message}
        </Alert>
      ) : null}

      <div className="grid grid-cols-2 gap-x-6 gap-y-6 border-b pb-8 lg:grid-cols-4">
        <Metric
          label={t("invoices.outstanding")}
          value={<Money value={totals.outstanding} />}
          hint={t("invoices.awaitingPayment", { count: totals.outstandingCount })}
          emphasis="hero"
          loading={isLoading}
          className="col-span-2"
        />
        <Metric
          label={t("invoices.overdue")}
          value={<Money value={totals.overdue} />}
          tone={totals.overdue > 0 ? "negative" : "neutral"}
          hint={t("invoices.pastDue", { count: totals.overdueCount })}
          loading={isLoading}
        />
        <Metric
          label={t("invoices.paidThisMonth")}
          value={<Money value={totals.paidThisMonth} />}
          tone={totals.paidThisMonth > 0 ? "positive" : "neutral"}
          hint={t("invoices.settled", { count: totals.paidThisMonthCount })}
          loading={isLoading}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 py-6">
        <Segmented
          // No key in en.ts for this group's accessible name — see the handover note.
          name="Show"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t("invoices.all") },
            { value: "outstanding", label: t("invoices.outstanding") },
            { value: "overdue", label: t("invoices.overdue") },
            { value: "draft", label: t("invoices.drafts") },
            { value: "paid", label: t("invoices.paid") },
          ]}
          className="max-w-full overflow-x-auto"
        />
        <div className="relative ml-auto w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("invoices.searchPlaceholder")}
            className="pl-9"
            aria-label={t("invoices.searchLabel")}
          />
        </div>
      </div>

      {isLoading ? (
        <Panel>
          <PanelBody className="pt-5">
            <SkeletonRows rows={4} />
          </PanelBody>
        </Panel>
      ) : invoices.length === 0 ? (
        <Panel>
          <PanelBody className="pt-10 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
              <FileText className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg">{t("invoices.none")}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {t("invoices.noneBlurb")}
            </p>
            <Button asChild variant="brand" className="mt-6">
              <Link to="/invoice-new">
                <Plus aria-hidden="true" /> {t("invoices.createFirst")}
              </Link>
            </Button>
          </PanelBody>
        </Panel>
      ) : rows.length === 0 ? (
        <Panel>
          <PanelBody className="pt-5 text-center text-sm text-muted-foreground">
            {t("common.noMatch")}{" "}
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
              className="font-medium text-brand underline underline-offset-4"
            >
              {t("common.showEverything")}
            </button>
          </PanelBody>
        </Panel>
      ) : (
        <Panel className="overflow-hidden">
          {/* Desktop: a real table. Phone: the same data as stacked rows. */}
          <table className="hidden w-full text-left sm:table">
            <thead>
              <tr className="border-b">
                <th scope="col" className="eyebrow px-5 py-3 font-semibold">
                  {t("invoices.invoice")}
                </th>
                <th scope="col" className="eyebrow px-5 py-3 font-semibold">
                  {t("invoices.customer")}
                </th>
                <th scope="col" className="eyebrow px-5 py-3 font-semibold">
                  {t("invoices.due")}
                </th>
                <th scope="col" className="eyebrow px-5 py-3 font-semibold">
                  {t("invoices.status")}
                </th>
                <th scope="col" className="eyebrow px-5 py-3 text-right font-semibold">
                  {t("common.amount")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-hairline">
              {rows.map((invoice) => {
                const status = displayStatus(invoice, today);
                const late = daysOverdue(invoice, today);
                return (
                  <tr key={invoice.id} className="transition-colors hover:bg-accent">
                    <td className="px-5 py-3">
                      <Link
                        to="/invoice"
                        search={{ id: invoice.id }}
                        className="num text-sm font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {invoice.number}
                      </Link>
                    </td>
                    <td className="max-w-[16rem] truncate px-5 py-3 text-sm">
                      {invoice.customer_name}
                    </td>
                    <td className="num px-5 py-3 text-[13px] text-muted-foreground">
                      {formatDate(invoice.due_date)}
                      {late > 0 ? (
                        <span className="num ml-1.5 text-danger">
                          {t("invoices.daysLate", { count: late })}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={BADGE_TONE[status]}>{t(STATUS_KEY[status])}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-medium">
                      <Money value={invoiceTotal(invoice)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="divide-hairline sm:hidden">
            {rows.map((invoice) => {
              const status = displayStatus(invoice, today);
              const late = daysOverdue(invoice, today);
              return (
                <Link
                  key={invoice.id}
                  to="/invoice"
                  search={{ id: invoice.id }}
                  className="block px-4 py-3.5 transition-colors hover:bg-accent"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{invoice.customer_name}</p>
                      <p className="num mt-0.5 text-[12px] text-muted-foreground">
                        {invoice.number} ·{" "}
                        {t("invoices.dueOn", { date: formatDate(invoice.due_date) })}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium">
                      <Money value={invoiceTotal(invoice)} />
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone={BADGE_TONE[status]}>{t(STATUS_KEY[status])}</Badge>
                    {late > 0 ? (
                      <span className="num text-[12px] text-danger">
                        {t("invoices.daysLate", { count: late })}
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}

/* ========================================================== editor ======= */

export function InvoiceEditor({ invoice }: { invoice?: Invoice }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const create = useServerFn(createInvoiceFn);
  const update = useServerFn(updateInvoiceFn);

  const [draft, setDraft] = useState<InvoiceDraft>(() =>
    invoice
      ? {
          customer_name: invoice.customer_name,
          customer_email: invoice.customer_email,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          lines: invoice.lines.length > 0 ? invoice.lines : [emptyLine()],
          notes: invoice.notes,
        }
      : blankDraft(todayISO()),
  );
  const [problems, setProblems] = useState<InvoiceProblems>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const totals = useMemo(() => invoiceTotals(draft.lines), [draft.lines]);
  const lineError = (index: number) =>
    problems.lineErrors?.find((item) => item.index === index)?.message;

  // validateInvoice() speaks English; this is where it gets translated.
  const say = (message?: string) => (message ? t(PROBLEM_KEY[message] ?? message) : undefined);

  const setLine = (index: number, patch: Partial<InvoiceDraft["lines"][number]>) =>
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    }));

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...draft,
        customer_name: draft.customer_name.trim(),
        customer_email: draft.customer_email?.trim() || null,
        notes: draft.notes?.trim() || null,
        // Blank rows are scaffolding, not data.
        lines: draft.lines.filter((line) => line.description.trim()),
      };
      return invoice ? update({ data: { ...payload, id: invoice.id } }) : create({ data: payload });
    },
    onSuccess: (saved) => {
      invalidate();
      navigate({ to: "/invoice", search: { id: saved.id } });
    },
    onError: (error: Error) => setServerError(error.message),
  });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);
    const found = validateInvoice(draft);
    setProblems(found);
    if (hasProblems(found)) return;
    save.mutate();
  };

  return (
    <div className="rise mx-auto w-full max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to={invoice ? "/invoice" : "/invoices"} search={invoice ? { id: invoice.id } : {}}>
          <ArrowLeft aria-hidden="true" /> {t("common.back")}
        </Link>
      </Button>

      <PageHeader
        // No key pairs the word with a number, so this is a label beside data
        // rather than a sentence — see the handover note.
        eyebrow={invoice ? `${t("invoices.invoice")} ${invoice.number}` : t("invoices.newInvoice")}
        title={invoice ? t("invoices.editTitle") : t("invoices.createTitle")}
        description={invoice ? t("invoices.editBlurb") : t("invoices.createBlurb")}
      />

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <Panel>
          <PanelHeader title={t("invoices.whoFor")} />
          <PanelBody className="grid gap-4 sm:grid-cols-2">
            <Field
              id="customer"
              label={t("invoices.customerName")}
              error={say(problems.customer_name)}
            >
              <Input
                value={draft.customer_name}
                invalid={Boolean(problems.customer_name)}
                placeholder={t("invoices.customerNamePlaceholder")}
                onChange={(event) => setDraft((c) => ({ ...c, customer_name: event.target.value }))}
              />
            </Field>
            <Field
              id="customer-email"
              label={t("invoices.customerEmail")}
              hint={t("invoices.customerEmailHint")}
              error={say(problems.customer_email)}
            >
              <Input
                type="email"
                inputMode="email"
                value={draft.customer_email ?? ""}
                invalid={Boolean(problems.customer_email)}
                placeholder={t("invoices.customerEmailPlaceholder")}
                onChange={(event) =>
                  setDraft((c) => ({ ...c, customer_email: event.target.value || null }))
                }
              />
            </Field>
            <Field id="issue-date" label={t("invoices.issueDate")} error={say(problems.issue_date)}>
              <Input
                type="date"
                className="num"
                value={draft.issue_date}
                invalid={Boolean(problems.issue_date)}
                onChange={(event) => setDraft((c) => ({ ...c, issue_date: event.target.value }))}
              />
            </Field>
            <Field
              id="due-date"
              label={t("invoices.dueDate")}
              hint={t("invoices.dueDateHint")}
              error={say(problems.due_date)}
            >
              <Input
                type="date"
                className="num"
                value={draft.due_date}
                invalid={Boolean(problems.due_date)}
                onChange={(event) => setDraft((c) => ({ ...c, due_date: event.target.value }))}
              />
            </Field>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            title={t("invoices.whatCharging")}
            description={t("invoices.whatChargingBlurb")}
          />
          <PanelBody className="space-y-4">
            {problems.lines ? <Alert tone="negative">{say(problems.lines)}</Alert> : null}

            {draft.lines.map((line, index) => (
              <div key={index} className="rounded-[var(--radius-12)] bg-surface-2 p-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_5rem_7rem_auto] sm:items-end">
                  <Field
                    id={`line-desc-${index}`}
                    label={t("invoices.description")}
                    error={say(lineError(index))}
                    className="min-w-0"
                  >
                    <Input
                      value={line.description}
                      invalid={Boolean(lineError(index))}
                      placeholder={t("invoices.descriptionPlaceholder")}
                      onChange={(event) => setLine(index, { description: event.target.value })}
                    />
                  </Field>
                  <Field id={`line-qty-${index}`} label={t("invoices.quantity")}>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      className="num"
                      value={line.quantity}
                      onChange={(event) => setLine(index, { quantity: Number(event.target.value) })}
                    />
                  </Field>
                  <Field id={`line-price-${index}`} label={t("invoices.priceEach")}>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      className="num"
                      value={line.unit_price}
                      onChange={(event) =>
                        setLine(index, { unit_price: Number(event.target.value) })
                      }
                    />
                  </Field>
                  <div className="flex items-center justify-between gap-2 sm:h-11 sm:justify-end">
                    <span className="num text-sm font-medium sm:hidden">
                      {formatMoney(lineTotal(line))}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("invoices.removeLine", { number: index + 1 })}
                      disabled={draft.lines.length === 1}
                      onClick={() =>
                        setDraft((c) => ({
                          ...c,
                          lines: c.lines.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                <p className="num mt-2 hidden text-right text-[13px] text-muted-foreground sm:block">
                  {t("invoices.lineTotal", { amount: formatMoney(lineTotal(line)) })}
                </p>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDraft((c) => ({ ...c, lines: [...c.lines, emptyLine()] }))}
            >
              <Plus aria-hidden="true" /> {t("invoices.addLine")}
            </Button>

            <div className="flex items-baseline justify-between border-t pt-4">
              <span className="eyebrow">{t("invoices.total")}</span>
              <span className="figure text-[28px]">
                <Money value={totals.subtotal} />
              </span>
            </div>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title={t("invoices.notes")} description={t("invoices.notesBlurb")} />
          <PanelBody>
            <label htmlFor="notes" className="sr-only">
              {t("invoices.notes")}
            </label>
            <textarea
              id="notes"
              rows={3}
              value={draft.notes ?? ""}
              onChange={(event) => setDraft((c) => ({ ...c, notes: event.target.value || null }))}
              placeholder={t("invoices.notesPlaceholder")}
              className="w-full rounded-[var(--radius-10)] border border-input bg-surface-1 px-3 py-2 text-sm text-foreground transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease)] placeholder:text-muted-foreground hover:border-border-strong focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
            />
          </PanelBody>
        </Panel>

        {serverError ? <Alert tone="negative">{serverError}</Alert> : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="brand" size="lg" loading={save.isPending}>
            {invoice ? t("entries.saveChanges") : t("invoices.createButton")}
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link
              to={invoice ? "/invoice" : "/invoices"}
              search={invoice ? { id: invoice.id } : {}}
            >
              {t("common.cancel")}
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ========================================================== detail ======= */

export function InvoiceDetail({ id, edit = false }: { id: string; edit?: boolean }) {
  const { t, formatDate } = useI18n();
  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const { data: invoices = [], isLoading } = useInvoices();
  const invoice = invoices.find((item) => item.id === id);

  const setStatus = useServerFn(setInvoiceStatusFn);
  const markPaid = useServerFn(markPaidFn);
  const markUnpaid = useServerFn(markUnpaidFn);
  const removeInvoice = useServerFn(removeInvoiceFn);

  const [paidDate, setPaidDate] = useState(todayISO());
  const [showPaid, setShowPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const act = useMutation({
    mutationFn: async (action: "send" | "paid" | "unpaid" | "void" | "delete") => {
      if (!invoice) return;
      if (action === "send") return setStatus({ data: { id: invoice.id, status: "sent" } });
      if (action === "void") return setStatus({ data: { id: invoice.id, status: "void" } });
      if (action === "paid") return markPaid({ data: { id: invoice.id, paid_date: paidDate } });
      if (action === "unpaid") return markUnpaid({ data: { id: invoice.id } });
      return removeInvoice({ data: { id: invoice.id } });
    },
    onSuccess: (_result, action) => {
      invalidate();
      setShowPaid(false);
      if (action === "delete") navigate({ to: "/invoices" });
    },
    onError: (err: Error) => setError(err.message),
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <span className="skeleton block h-8 w-48" />
        <Panel className="mt-6">
          <PanelBody className="pt-5">
            <SkeletonRows rows={4} />
          </PanelBody>
        </Panel>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Alert tone="negative" title={t("invoices.notFound")}>
          {t("invoices.notFoundBlurb")}{" "}
          <Link to="/invoices" className="font-medium underline underline-offset-4">
            {t("invoices.backToInvoices")}
          </Link>
        </Alert>
      </div>
    );
  }

  if (edit) return <InvoiceEditor invoice={invoice} />;

  const status = displayStatus(invoice, todayISO());
  const late = daysOverdue(invoice, todayISO());
  const can = allowedActions(invoice);
  const totals = invoiceTotals(invoice.lines);

  return (
    <div className="rise mx-auto w-full max-w-3xl">
      <div className="no-print">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to="/invoices">
            <ArrowLeft aria-hidden="true" /> {t("invoices.allInvoices")}
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-3 pb-5">
          <Badge tone={BADGE_TONE[status]}>{t(STATUS_KEY[status])}</Badge>
          {late > 0 ? (
            <span className="num text-[13px] text-danger">
              {t("invoices.pastDueBy", { count: late })}
            </span>
          ) : null}
          {invoice.status === "paid" && invoice.paid_date ? (
            <span className="num text-[13px] text-muted-foreground">
              {t("invoices.paidOn", { date: formatDate(invoice.paid_date) })}
            </span>
          ) : null}
        </div>

        {error ? (
          <div className="pb-4">
            <Alert tone="negative">{error}</Alert>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 pb-6">
          {can.canSend ? (
            <Button
              variant="brand"
              loading={act.isPending && act.variables === "send"}
              onClick={() => act.mutate("send")}
            >
              <Send aria-hidden="true" /> {t("invoices.markSent")}
            </Button>
          ) : null}

          {can.canMarkPaid ? (
            showPaid ? (
              <div className="flex w-full flex-wrap items-end gap-2 rounded-[var(--radius-12)] bg-surface-2 p-3">
                <Field id="paid-date" label={t("invoices.moneyArrivedOn")} className="w-44">
                  <Input
                    type="date"
                    className="num"
                    value={paidDate}
                    onChange={(event) => setPaidDate(event.target.value)}
                  />
                </Field>
                <Button variant="brand" loading={act.isPending} onClick={() => act.mutate("paid")}>
                  {t("invoices.recordPayment")}
                </Button>
                <Button variant="ghost" onClick={() => setShowPaid(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            ) : (
              <Button variant="brand" onClick={() => setShowPaid(true)}>
                {t("invoices.markPaid")}
              </Button>
            )
          ) : null}

          {can.canUnmarkPaid ? (
            <Button
              variant="outline"
              loading={act.isPending && act.variables === "unpaid"}
              onClick={() => {
                if (window.confirm(t("invoices.confirmUnpaid"))) act.mutate("unpaid");
              }}
            >
              {t("invoices.markUnpaid")}
            </Button>
          ) : null}

          {can.canEdit ? (
            <Button asChild variant="outline">
              <Link to="/invoice" search={{ id: invoice.id, edit: "1" }}>
                {t("common.edit")}
              </Link>
            </Button>
          ) : null}

          <Button variant="outline" onClick={() => window.print()}>
            <Printer aria-hidden="true" /> {t("invoices.printOrPdf")}
          </Button>

          {can.canVoid ? (
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm(t("invoices.confirmVoid"))) act.mutate("void");
              }}
            >
              {t("invoices.cancelInvoice")}
            </Button>
          ) : null}

          {can.canDelete ? (
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-danger"
              onClick={() => {
                if (window.confirm(t("invoices.confirmDeleteDraft"))) act.mutate("delete");
              }}
            >
              <Trash2 aria-hidden="true" /> {t("invoices.deleteDraft")}
            </Button>
          ) : null}
        </div>

        {invoice.status === "sent" ? (
          <div className="pb-6">
            {/* One whole sentence with the amount substituted in: the figure
                sits in a different place per language. */}
            <Alert tone="brand">
              {t("invoices.willRecord", { amount: formatMoney(invoiceTotal(invoice)) })}
            </Alert>
          </div>
        ) : null}
      </div>

      {/* ---- the part a customer sees, and the part that prints ---- */}
      <article className="invoice-print panel p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px]">{t("invoices.invoice")}</h1>
            <p className="num mt-1 text-sm text-muted-foreground">{invoice.number}</p>
          </div>
          <div className="text-right">
            <p className="eyebrow">{t("invoices.amountDue")}</p>
            <p className="figure mt-1 text-[30px]">
              <Money value={totals.subtotal} />
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="eyebrow">{t("invoices.billedTo")}</p>
            <p className="mt-1.5 text-sm font-medium">{invoice.customer_name}</p>
            {invoice.customer_email ? (
              <p className="text-sm text-muted-foreground">{invoice.customer_email}</p>
            ) : null}
          </div>
          <div className="sm:text-right">
            <p className="eyebrow">{t("invoices.dates")}</p>
            <p className="num mt-1.5 text-sm">
              {t("invoices.issued", { date: formatDate(invoice.issue_date, "long") })}
            </p>
            <p className="num text-sm text-muted-foreground">
              {t("invoices.dueOn", { date: formatDate(invoice.due_date, "long") })}
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[22rem] text-left">
            <thead>
              <tr className="border-b">
                <th scope="col" className="eyebrow pb-2 font-semibold">
                  {t("invoices.description")}
                </th>
                <th scope="col" className="eyebrow pb-2 text-right font-semibold">
                  {t("invoices.quantity")}
                </th>
                <th scope="col" className="eyebrow pb-2 text-right font-semibold">
                  {/* en.ts has no bare "Each" — the fuller label is the closest fit. */}
                  {t("invoices.priceEach")}
                </th>
                <th scope="col" className="eyebrow pb-2 text-right font-semibold">
                  {t("invoices.total")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-hairline">
              {invoice.lines.map((line, index) => (
                <tr key={index}>
                  <td className="py-3 pr-3 text-sm">{line.description}</td>
                  <td className="num py-3 text-right text-sm text-muted-foreground">
                    {line.quantity}
                  </td>
                  <td className="num py-3 pl-3 text-right text-sm text-muted-foreground">
                    {formatMoney(line.unit_price)}
                  </td>
                  <td className="num py-3 pl-3 text-right text-sm font-medium">
                    {formatMoney(totals.lineTotals[index] ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan={3} className="pt-3 text-right text-sm font-semibold">
                  {t("invoices.total")}
                </td>
                <td className="num pl-3 pt-3 text-right text-base font-semibold">
                  {formatMoney(totals.subtotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {invoice.notes ? (
          <div className="mt-8 border-t pt-5">
            <p className="eyebrow">{t("invoices.notes")}</p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted-foreground">
              {invoice.notes}
            </p>
          </div>
        ) : null}
      </article>
    </div>
  );
}
