import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { BillsPage } from "@/components/sections/month-sections";

const Page = () => (
  <ProGate feature="billsCalendar" title="nav.bills">
    <BillsPage />
  </ProGate>
);

export const Route = createFileRoute("/_authenticated/bills")({
  head: () => ({
    meta: [
      { title: "Bills — SimpleBooks AI" },
      {
        name: "description",
        content: "What is due soon, detected subscriptions, and your recurring bills.",
      },
      { property: "og:title", content: "Bills — SimpleBooks AI" },
      {
        property: "og:description",
        content: "What is due soon, detected subscriptions, and your recurring bills.",
      },
    ],
  }),
  component: Page,
});
