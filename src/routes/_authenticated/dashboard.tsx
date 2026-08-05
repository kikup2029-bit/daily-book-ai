import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "@/components/sections/today-sections";

const Page = () => <Dashboard parts={["due", "safe", "glance"]} />;

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Today — SimpleBooks AI" },
      {
        name: "description",
        content: "What is safe to spend today, what is due soon, and today's totals.",
      },
    ],
  }),
  component: Page,
});
