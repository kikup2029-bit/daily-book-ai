import { createFileRoute } from "@tanstack/react-router";

import { MonthlyPage } from "@/components/sections/month-sections";

const Page = () => <MonthlyPage parts={["categories"]} />;

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
