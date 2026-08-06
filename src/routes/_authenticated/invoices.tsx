import { createFileRoute } from "@tanstack/react-router";

import { InvoicesList } from "@/components/sections/invoices-sections";

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
  component: InvoicesList,
});
