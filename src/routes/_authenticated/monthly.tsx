import { createFileRoute } from "@tanstack/react-router";

import { MonthlyPage } from "@/components/sections/month-sections";

const Page = () => <MonthlyPage parts={["totals"]} />;

export const Route = createFileRoute("/_authenticated/monthly")({
  head: () => ({
    meta: [
      { title: "This month — SimpleBooks AI" },
      {
        name: "description",
        content: "Income, expenses and profit for the month at a glance.",
      },
    ],
  }),
  component: Page,
});
