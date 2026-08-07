import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { MonthlyPage } from "@/components/sections/month-sections";

const Page = () => (
  <ProGate feature="insights" title="nav.whereMoneyWent">
    <MonthlyPage parts={["categories"]} />
  </ProGate>
);

export const Route = createFileRoute("/_authenticated/categories")({
  head: () => ({
    meta: [
      { title: "Where the money went — SimpleBooks AI" },
      { name: "description", content: "See which categories your spending went to this month." },
      { property: "og:title", content: "Where the money went — SimpleBooks AI" },
      {
        property: "og:description",
        content: "See which categories your spending went to this month.",
      },
    ],
  }),
  component: Page,
});
