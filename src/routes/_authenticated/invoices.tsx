import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { InvoicesList } from "@/components/sections/invoices-sections";

const Page = () => (
  <ProGate feature="unlimitedInvoices" title="nav.invoices">
    <InvoicesList />
  </ProGate>
);

export const Route = createFileRoute("/_authenticated/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — SimpleBooks" },
      {
        name: "description",
        content: "See what customers owe you, what's overdue, and what's been paid.",
      },
    ],
  }),
  component: Page,
});
