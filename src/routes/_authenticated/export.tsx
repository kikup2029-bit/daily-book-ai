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

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "USD" });

const monthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-CA");
};

// Obviously-fake rows shown to brand-new users so they can see what the
// export feature produces before they've logged any real entries.
const SAMPLE_ROWS: ExportEntry[] = [
  { entry_date: "2026-07-01", amount_in: 150, amount_out: 0, spent_on: null },
  { entry_date: "2026-07-03", amount_in: 0, amount_out: 42.5, spent_on: "Supplies" },
  { entry_date: "2026-07-10", amount_in: 200, amount_out: 0, spent_on: null },
  { entry_date: "2026-07-15", amount_in: 0, amount_out: 500, spent_on: "Rent" },
];

function PreviewTable({ rows, money }: { rows: ExportEntry[]; money: (value: number) => string }) {
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
                Date
              </th>
              <th scope="col" className={headCell}>
                Category
              </th>
              <th scope="col" className={`${headCell} text-right`}>
                In
              </th>
              <th scope="col" className={`${headCell} text-right`}>
                Out
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
                Totals{" "}
                <span className="num font-normal text-muted-foreground">
                  ({money(totalIn - totalOut)} net)
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
  const rangeLabel = `${from || "the beginning"} to ${to || "today"}`;
  const filename = `simplebooks-${from || "all"}-to-${to || "today"}`;

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
          eyebrow="Export"
          title="Export your records"
          description="Pick the dates you need, then download a spreadsheet or a tidy PDF for your accountant."
        />

        <Panel>
          <PanelHeader title="Date range" description="Leave both blank to export everything." />
          <PanelBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="from" label="From">
                <Input
                  type="date"
                  className="num"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                />
              </Field>
              <Field id="to" label="To">
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
                This month
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
                Last month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFrom("");
                  setTo("");
                }}
              >
                Everything
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
                <span className="num">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "entry" : "entries"}
              </span>
              <span className="inline-flex items-baseline gap-1.5">
                <Money value={totalIn} tone="positive" className="font-medium" />
                <span className="text-muted-foreground">in</span>
              </span>
              <span className="inline-flex items-baseline gap-1.5">
                <Money value={totalOut} tone="negative" className="font-medium" />
                <span className="text-muted-foreground">out</span>
              </span>
              <span className="inline-flex items-baseline gap-1.5">
                <Money value={totalIn - totalOut} className="font-semibold" />
                <span className="text-muted-foreground">net</span>
              </span>
            </div>
          )}
        </div>

        {!isLoading && filtered.length > 0 ? (
          <div className="mt-6">
            <p className="eyebrow">Preview — this is what you&apos;ll get</p>
            <div className="mt-3">
              <PreviewTable rows={filtered} money={money} />
            </div>
            <p className="mt-2.5 text-[12px] leading-relaxed text-muted-foreground">
              This is exactly what goes into the CSV and PDF below — the PDF also adds your business
              name and the date range as a header.
            </p>
          </div>
        ) : null}

        {!isLoading && filtered.length === 0 ? (
          <div className="mt-6 rounded-[var(--radius-14)] border border-dashed border-border-strong p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">Sample</Badge>
              <p className="eyebrow">What your export will look like</p>
            </div>
            <p className="mt-3 max-w-prose text-[13px] leading-relaxed text-muted-foreground">
              You don&apos;t have entries in this date range yet, so here&apos;s a made-up example
              with fake numbers — just to show you what the CSV and PDF export will include once you
              start logging your daily money in and out.
            </p>
            <div className="mt-4">
              <PreviewTable rows={SAMPLE_ROWS} money={money} />
            </div>
            <p className="mt-2.5 max-w-prose text-[12px] leading-relaxed text-muted-foreground">
              Every entry becomes a row with its date, category, and amounts, plus a totals row at
              the bottom. The real download buttons below only turn on once you have actual entries
              in range.
            </p>
          </div>
        ) : null}

        {download && !isLoading && filtered.length === 0 ? (
          <div className="mt-6">
            <Alert tone="negative" title="Nothing to download for these dates yet">
              Pick a wider range above, then try again.
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
            <FileSpreadsheet aria-hidden="true" /> Download CSV
          </Button>
          <Button
            size="lg"
            variant="brand"
            disabled={filtered.length === 0}
            onClick={() => exportPdf(filtered, filename, rangeLabel)}
          >
            <FileText aria-hidden="true" /> Download PDF
          </Button>
        </div>
      </section>
    </div>
  );
}
