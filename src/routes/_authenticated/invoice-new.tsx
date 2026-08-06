import { createFileRoute } from "@tanstack/react-router";

import { InvoiceEditor } from "@/components/sections/invoices-sections";

export const Route = createFileRoute("/_authenticated/invoice-new")({
  head: () => ({ meta: [{ title: "New invoice — SimpleBooks" }] }),
  component: () => <InvoiceEditor />,
});
