import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileSpreadsheet, FileText } from "lucide-react";

import type { ExportEntry } from "@/lib/export";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  return (
    <div className="max-h-64 overflow-y-auto rounded-2xl border">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-semibold">Date</th>
            <th className="px-3 py-2 font-semibold">Category</th>
            <th className="px-3 py-2 text-right font-semibold">In</th>
            <th className="px-3 py-2 text-right font-semibold">Out</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((entry, index) => (
            <tr key={index}>
              <td className="whitespace-nowrap px-3 py-2">{entry.entry_date}</td>
              <td className="px-3 py-2 text-muted-foreground">{entry.spent_on ?? "—"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                {entry.amount_in > 0 ? money(entry.amount_in) : "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                {entry.amount_out > 0 ? money(entry.amount_out) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="sticky bottom-0 border-t bg-muted font-semibold">
          <tr>
            <td className="px-3 py-2" colSpan={2}>
              Totals ({money(totalIn - totalOut)} net)
            </td>
            <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
              {money(totalIn)}
            </td>
            <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
              {money(totalOut)}
            </td>
          </tr>
        </tfoot>
      </table>
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
      <section className="py-8">
        <h2 className="text-xl">Export your records</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick the dates you need, then download a spreadsheet or a tidy PDF for your accountant.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              setFrom(new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-CA"));
              setTo(new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString("en-CA"));
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

        <div className="mt-6 text-sm">
          {isLoading ? (
            <span className="skeleton block h-4 w-40" />
          ) : (
            <p>
              <span className="font-semibold">
                {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
              </span>{" "}
              · {money(totalIn)} in · {money(totalOut)} out ·{" "}
              <span className="font-semibold">{money(totalIn - totalOut)} net</span>
            </p>
          )}
        </div>

        {!isLoading && filtered.length > 0 ? (
          <div className="mt-4">
            <p className="eyebrow">Preview — this is what you&apos;ll get</p>
            <div className="mt-2">
              <PreviewTable rows={filtered} money={money} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              This is exactly what goes into the CSV and PDF below — the PDF also adds your business
              name and the date range as a header.
            </p>
          </div>
        ) : null}

        {!isLoading && filtered.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary-foreground">
                Sample
              </span>
              <p className="eyebrow">What your export will look like</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              You don&apos;t have entries in this date range yet, so here&apos;s a made-up example
              with fake numbers — just to show you what the CSV and PDF export will include once you
              start logging your daily money in and out.
            </p>
            <div className="mt-3">
              <PreviewTable rows={SAMPLE_ROWS} money={money} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Every entry becomes a row with its date, category, and amounts, plus a totals row at
              the bottom. The real download buttons below only turn on once you have actual entries
              in range.
            </p>
          </div>
        ) : null}

        {download && !isLoading && filtered.length === 0 ? (
          <p className="mt-4 border-l-2 border-danger pl-4 text-sm text-danger">
            Nothing to download for these dates yet — pick a wider range below.
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button
            size="lg"
            variant="outline"
            disabled={filtered.length === 0}
            onClick={() => exportCsv(filtered, filename)}
          >
            <FileSpreadsheet className="size-4" /> Download CSV
          </Button>
          <Button
            size="lg"
            disabled={filtered.length === 0}
            onClick={() => exportPdf(filtered, filename, rangeLabel)}
          >
            <FileText className="size-4" /> Download PDF
          </Button>
        </div>
      </section>
    </div>
  );
}
