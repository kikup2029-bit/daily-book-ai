import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportEntry = {
  entry_date: string;
  amount_in: number;
  amount_out: number;
  spent_on: string | null;
  merchant?: string | null;
};

const money = (value: number) => value.toFixed(2);

const noteFor = (entry: ExportEntry) => {
  if (entry.amount_in > 0 && entry.amount_out > 0) return "Money in and out";
  if (entry.amount_in > 0) return "Money made";
  if (entry.amount_out > 0) return "Money spent";
  return "";
};

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function rowsFor(entries: ExportEntry[], empty: string) {
  return entries.map((entry) => [
    entry.entry_date,
    money(entry.amount_in),
    money(entry.amount_out),
    entry.spent_on ?? empty,
    entry.merchant ?? empty,
    noteFor(entry),
  ]);
}

export function exportCsv(entries: ExportEntry[], filename: string) {
  const header = ["Date", "Money in", "Money out", "Category", "Where", "Note"];
  const rows = rowsFor(entries, "");
  const totalIn = entries.reduce((sum, e) => sum + e.amount_in, 0);
  const totalOut = entries.reduce((sum, e) => sum + e.amount_out, 0);
  rows.push([
    "Totals",
    money(totalIn),
    money(totalOut),
    "",
    "",
    `Net ${money(totalIn - totalOut)}`,
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  download(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }), `${filename}.csv`);
}

export function exportPdf(entries: ExportEntry[], filename: string, rangeLabel: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const totalIn = entries.reduce((sum, e) => sum + e.amount_in, 0);
  const totalOut = entries.reduce((sum, e) => sum + e.amount_out, 0);

  doc.setFontSize(18);
  doc.text("SimpleBooks AI - Records", 40, 48);
  doc.setFontSize(11);
  doc.setTextColor(110);
  doc.text(rangeLabel, 40, 68);
  doc.text(`${entries.length} ${entries.length === 1 ? "entry" : "entries"}`, 40, 84);

  autoTable(doc, {
    startY: 104,
    head: [["Date", "Money in", "Money out", "Category", "Where", "Note"]],
    body: rowsFor(entries, "-"),
    foot: [
      ["Totals", money(totalIn), money(totalOut), "", "", `Net ${money(totalIn - totalOut)}`],
    ],
    styles: { fontSize: 10, cellPadding: 6, textColor: 30 },
    headStyles: { fillColor: [38, 38, 38], textColor: 255 },
    footStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    theme: "grid",
    margin: { left: 40, right: 40 },
  });

  doc.save(`${filename}.pdf`);
}
