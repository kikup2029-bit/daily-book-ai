import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileSpreadsheet, FileText } from "lucide-react";

import type { ExportEntry } from "@/lib/export";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Alert,
  Badge,
  Field,
  Money,
  PageHeader,
  Panel,
  PanelBody,
  PanelHeader,
} from "@/components/ui/kit";
import { getEntries } from "@/lib/books.functions";
import { exportCsv, exportPdf } from "@/lib/export";
import { useI18n } from "@/lib/i18n";
import type { Translator } from "@/lib/i18n/translate";

export const Route = createFileRoute("/_authenticated/export")({
  head: () => ({
    meta: [
      { title: "Export your records — SimpleBooks AI" },
      {
        name: "description",
        content:
          "Download your income and expense records as a CSV spreadsheet or a clean PDF summary to hand to your accountant.",
      },
      { property: "og:title", content: "Export your records — SimpleBooks AI" },
      {
        property: "og:description",
        content: "Download your bookkeeping records as CSV or PDF for any date range.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  // The sidebar's "Download CSV/PDF" shortcuts land here with ?download=…
  validateSearch: (search: Record<string, unknown>) => ({
    download: search.download === "csv" || search.download === "pdf" ? search.download : undefined,
  }),
  component: ExportPage,
});

const monthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-CA");
};

// Obviously-fake rows shown to brand-new users so they can see what the
// export feature produces before they've logged any real entries. The
// categories are read on screen, so they follow the reader's language.
const sampleRows = (t: Translator): ExportEntry[] => [
  { entry_date: "2026-07-01", amount_in: 150, amount_out: 0, spent_on: null },
  {
    entry_date: "2026-07-03",
    amount_in: 0,
    amount_out: 42.5,
    spent_on: t("export.sampleCategorySupplies"),
  },
  { entry_date: "2026-07-10", amount_in: 200, amount_out: 0, spent_on: null },
  {
    entry_date: "2026-07-15",
    amount_in: 0,
    amount_out: 500,
    spent_on: t("export.sampleCategoryRent"),
  },
];

function PreviewTable({ rows }: { rows: ExportEntry[] }) {
  const { t, money } = useI18n();
  const totalIn = rows.reduce((sum, entry) => sum + entry.amount_in, 0);
  const totalOut = rows.reduce((sum, entry) => sum + entry.amount_out, 0);

  const headCell =
    "sticky top-0 z-10 border-b border-border bg-surface-2 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground";
  const footCell =
    "sticky bottom-0 z-10 border-t border-border bg-surface-2 px-3 py-2.5 text-[13px] font-semibold";

  return (
    <div className="panel overflow-hidden">
      <div className="max-h-72 overflow-auto overscroll-contain">
        <table className="w-full min-w-[26rem] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              <th scope="col" className={headCell}>
                {t("export.columnDate")}
              </th>
              <th scope="col" className={headCell}>
                {t("export.columnCategory")}
              </th>
              <th scope="col" className={`${headCell} text-right`}>
                {t("export.columnIn")}
              </th>
              <th scope="col" className={`${headCell} text-right`}>
                {t("export.columnOut")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry, index) => (
              <tr key={index}>
                <td
                  className={`num whitespace-nowrap px-3 py-2.5 text-muted-foreground ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                >
                  {entry.entry_date}
                </td>
                <td className={`px-3 py-2.5 ${index > 0 ? "border-t border-border" : ""}`}>
                  {entry.spent_on ?? <span className="text-muted-foreground">—</span>}
                </td>
                <td
                  className={`num whitespace-nowrap px-3 py-2.5 text-right ${
                    index > 0 ? "border-t border-border" : ""
                  } ${entry.amount_in > 0 ? "text-success" : "text-muted-foreground"}`}
                >
                  {entry.amount_in > 0 ? money(entry.amount_in) : "—"}
                </td>
                <td
                  className={`num whitespace-nowrap px-3 py-2.5 text-right ${
                    index > 0 ? "border-t border-border" : ""
                  } ${entry.amount_out > 0 ? "text-danger" : "text-muted-foreground"}`}
                >
                  {entry.amount_out > 0 ? money(entry.amount_out) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className={footCell} colSpan={2}>
                {t("export.totalsRow")}{" "}
                <span className="num font-normal text-muted-foreground">
                  {t("export.totalsNet", { amount: money(totalIn - totalOut) })}
                </span>
              </td>
              <td className={`${footCell} num whitespace-nowrap text-right`}>{money(totalIn)}</td>
              <td className={`${footCell} num whitespace-nowrap text-right`}>{money(totalOut)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function ExportPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { download } = useSearch({ from: "/_authenticated/export" });
  const fetchEntries = useServerFn(getEntries);
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: () => fetchEntries(),
  });

  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(new Date().toLocaleDateString("en-CA"));

  const filtered = useMemo(
    () =>
      entries
        .filter((entry) => (!from || entry.entry_date >= from) && (!to || entry.entry_date <= to))
        .slice()
        .sort((a, b) => a.entry_date.localeCompare(b.entry_date)),
    [entries, from, to],
  );

  const totalIn = filtered.reduce((sum, entry) => sum + entry.amount_in, 0);
  const totalOut = filtered.reduce((sum, entry) => sum + entry.amount_out, 0);
  // Deliberately English: this is the header line printed inside the exported
  // PDF, which shares its column schema with the CSV. See the note on
  // src/lib/export.ts — the downloaded file stays in one fixed language so the
  // accountant receiving it reads the same thing every time.
  const rangeLabel = `${from || "the beginning"} to ${to || "today"}`;
  const filename = `simplebooks-${from || "all"}-to-${to || "today"}`;

  const samples = useMemo(() => sampleRows(t), [t]);

  // Run a shortcut download once, after the entries are in.
  const firedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!download || isLoading) return;
    if (firedFor.current === download) return;
    firedFor.current = download;

    if (filtered.length > 0) {
      if (download === "csv") exportCsv(filtered, filename);
      else exportPdf(filtered, filename, rangeLabel);
    }
    // Drop the parameter so a refresh doesn't download again.
    navigate({ to: "/export", search: {}, replace: true });
  }, [download, isLoading, filtered, filename, rangeLabel, navigate]);

  return (
    <div className="rise mx-auto w-full max-w-3xl">
      <section className="pb-8">
        <PageHeader
          eyebrow={t("export.eyebrow")}
          title={t("export.title")}
          description={t("export.blurb")}
        />

        <Panel>
          <PanelHeader title={t("export.dateRange")} description={t("export.dateRangeHint")} />
          <PanelBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="from" label={t("export.from")}>
                <Input
                  type="date"
                  className="num"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                />
              </Field>
              <Field id="to" label={t("export.to")}>
                <Input
                  type="date"
                  className="num"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setFrom(
                    new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-CA"),
                  );
                  setTo(
                    new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString("en-CA"),
                  );
                }}
              >
                {t("export.thisMonth")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setFrom(
                    new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString("en-CA"),
                  );
                  setTo(new Date(now.getFullYear(), now.getMonth(), 0).toLocaleDateString("en-CA"));
                }}
              >
                {t("export.lastMonth")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFrom("");
                  setTo("");
                }}
              >
                {t("export.everything")}
              </Button>
            </div>
          </PanelBody>
        </Panel>

        <div className="mt-6">
          {isLoading ? (
            <span className="skeleton block h-4 w-48" aria-hidden="true" />
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold">
                {t("export.entryCount", { count: filtered.length })}
              </span>
              <span className="inline-flex items-baseline gap-1.5">
                <Money value={totalIn} tone="positive" className="font-medium" />
                <span className="text-muted-foreground">{t("export.labelIn")}</span>
              </span>
              <span className="inline-flex items-baseline gap-1.5">
                <Money value={totalOut} tone="negative" className="font-medium" />
                <span className="text-muted-foreground">{t("export.labelOut")}</span>
              </span>
              <span className="inline-flex items-baseline gap-1.5">
                <Money value={totalIn - totalOut} className="font-semibold" />
                <span className="text-muted-foreground">{t("export.labelNet")}</span>
              </span>
            </div>
          )}
        </div>

        {!isLoading && filtered.length > 0 ? (
          <div className="mt-6">
            <p className="eyebrow">{t("export.previewTitle")}</p>
            <div className="mt-3">
              <PreviewTable rows={filtered} />
            </div>
            <p className="mt-2.5 text-[12px] leading-relaxed text-muted-foreground">
              {t("export.previewNote")}
            </p>
          </div>
        ) : null}

        {!isLoading && filtered.length === 0 ? (
          <div className="mt-6 rounded-[var(--radius-14)] border border-dashed border-border-strong p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{t("export.sampleBadge")}</Badge>
              <p className="eyebrow">{t("export.sampleTitle")}</p>
            </div>
            <p className="mt-3 max-w-prose text-[13px] leading-relaxed text-muted-foreground">
              {t("export.sampleBlurb")}
            </p>
            <div className="mt-4">
              <PreviewTable rows={samples} />
            </div>
            <p className="mt-2.5 max-w-prose text-[12px] leading-relaxed text-muted-foreground">
              {t("export.sampleNote")}
            </p>
          </div>
        ) : null}

        {download && !isLoading && filtered.length === 0 ? (
          <div className="mt-6">
            <Alert tone="negative" title={t("export.nothingToDownload")}>
              {t("export.nothingToDownloadBody")}
            </Alert>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            size="lg"
            variant="outline"
            disabled={filtered.length === 0}
            onClick={() => exportCsv(filtered, filename)}
          >
            <FileSpreadsheet aria-hidden="true" /> {t("export.downloadCsv")}
          </Button>
          <Button
            size="lg"
            variant="brand"
            disabled={filtered.length === 0}
            onClick={() => exportPdf(filtered, filename, rangeLabel)}
          >
            <FileText aria-hidden="true" /> {t("export.downloadPdf")}
          </Button>
        </div>
      </section>
    </div>
  );
}
