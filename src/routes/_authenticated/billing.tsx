import { createFileRoute } from "@tanstack/react-router";

import { BillingHome } from "@/components/sections/billing-sections";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({
    meta: [
      { title: "Billing — SimpleBooks" },
      {
        name: "description",
        content: "The plan you're on, what it costs, and how to change or cancel it.",
      },
    ],
  }),
  component: BillingHome,
});
