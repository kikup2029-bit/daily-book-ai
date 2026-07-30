import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileSpreadsheet, FileText } from "lucide-react";

import { AppHeader } from "@/components/app-header";
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
  component: ExportPage,
});

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "USD" });

const monthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("en-CA");
};

function ExportPage() {
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

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-8 sm:pt-12">
      <AppHeader />

      <section className="rounded-3xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Export your records</h2>
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
              setFrom(new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString("en-CA"));
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

        <div className="mt-5 rounded-2xl bg-muted p-4 text-sm">
          {isLoading ? (
            <p className="text-muted-foreground">Loading your entries…</p>
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

        {filtered.length === 0 && !isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No entries in those dates yet — try a wider range.
          </p>
        ) : null}
      </section>
    </main>
  );
}
