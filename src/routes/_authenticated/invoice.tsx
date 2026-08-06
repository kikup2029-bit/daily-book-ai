import { createFileRoute, useSearch } from "@tanstack/react-router";

import { InvoiceDetail } from "@/components/sections/invoices-sections";

export const Route = createFileRoute("/_authenticated/invoice")({
  head: () => ({ meta: [{ title: "Invoice — SimpleBooks" }] }),
  // The route tree here is flat and hand-maintained, so the invoice is
  // identified by a search parameter rather than a dynamic path segment.
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "string" ? search.id : "",
    edit: search.edit === "1" ? "1" : undefined,
  }),
  component: InvoicePage,
});

function InvoicePage() {
  const { id, edit } = useSearch({ from: "/_authenticated/invoice" });
  return <InvoiceDetail id={id} edit={edit === "1"} />;
}
