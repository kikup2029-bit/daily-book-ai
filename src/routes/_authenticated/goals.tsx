import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { MonthlyPage } from "@/components/sections/month-sections";

const Page = () => (
  <ProGate feature="budgetsAndGoals" title="Savings goals">
    <MonthlyPage parts={["goals"]} />
  </ProGate>
);

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [
      { title: "Savings goals — SimpleBooks AI" },
      { name: "description", content: "Track what you are putting money aside for." },
      { property: "og:title", content: "Savings goals — SimpleBooks AI" },
      { property: "og:description", content: "Track what you are putting money aside for." },
    ],
  }),
  component: Page,
});
