import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { InvoiceEditor } from "@/components/sections/invoices-sections";

export const Route = createFileRoute("/_authenticated/invoice-new")({
  head: () => ({ meta: [{ title: "New invoice — SimpleBooks" }] }),
  component: () => (
    <ProGate feature="unlimitedInvoices" title="Making an invoice">
      <InvoiceEditor />
    </ProGate>
  ),
});
