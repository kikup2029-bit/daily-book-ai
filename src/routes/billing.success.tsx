/**
 * Where Stripe sends someone after checkout.
 *
 * `session_id` is read only so it can be shown as a reference if confirmation
 * is slow. It is never treated as evidence of payment: the browser arrived here
 * under its own steam, and anyone can type this URL. What grants Pro is the
 * signed webhook Stripe sends the server — see BillingSuccess.
 *
 * ssr: false because the page reads the signed-in account's subscription, and
 * the token for that lives in the browser.
 */

import { createFileRoute, useSearch } from "@tanstack/react-router";

import { BillingSuccess } from "@/components/sections/billing-sections";

export const Route = createFileRoute("/billing/success")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Confirming your payment — SimpleBooks" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: BillingSuccessPage,
});

function BillingSuccessPage() {
  const { session_id } = useSearch({ from: "/billing/success" });
  return <BillingSuccess sessionId={session_id} />;
}
