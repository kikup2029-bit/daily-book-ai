import { createFileRoute } from "@tanstack/react-router";

import { BillsPage } from "@/components/sections/month-sections";

const Page = BillsPage;

export const Route = createFileRoute("/_authenticated/bills")({
  head: () => ({
    meta: [
      { title: "Bills — SimpleBooks AI" },
      { name: "description", content: "What is due soon, detected subscriptions, and your recurring bills." },
      { property: "og:title", content: "Bills — SimpleBooks AI" },
      { property: "og:description", content: "What is due soon, detected subscriptions, and your recurring bills." },
    ],
  }),
  component: Page,
});
