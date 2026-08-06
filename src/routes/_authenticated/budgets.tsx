import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { MonthlyPage } from "@/components/sections/month-sections";

const Page = () => (
  <ProGate feature="budgetsAndGoals" title="Budgets">
    <MonthlyPage parts={["budgets"]} />
  </ProGate>
);

export const Route = createFileRoute("/_authenticated/budgets")({
  head: () => ({
    meta: [
      { title: "Budgets — SimpleBooks AI" },
      {
        name: "description",
        content: "Set a monthly spending limit per category and watch your progress.",
      },
      { property: "og:title", content: "Budgets — SimpleBooks AI" },
      {
        property: "og:description",
        content: "Set a monthly spending limit per category and watch your progress.",
      },
    ],
  }),
  component: Page,
});
