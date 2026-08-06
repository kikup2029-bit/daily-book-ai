/**
 * Where Stripe sends someone who backed out of checkout.
 *
 * Nothing was charged and nothing changed, so the page says exactly that and
 * gets out of the way. No second sales pitch, no "are you sure" — closing a
 * payment page is a perfectly reasonable thing to do.
 */

import { createFileRoute } from "@tanstack/react-router";

import { BillingCancelled } from "@/components/sections/billing-sections";

export const Route = createFileRoute("/billing/cancelled")({
  head: () => ({
    meta: [{ title: "Checkout closed — SimpleBooks" }, { name: "robots", content: "noindex" }],
  }),
  component: BillingCancelled,
});
