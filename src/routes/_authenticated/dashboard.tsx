import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "@/components/sections/today-sections";

/**
 * Today, in the order it gets read: where you stand, what needs you, what to
 * do next, then what just happened. Quick add is on this screen because it's
 * the thing people open the app to do.
 */
const Page = () => <Dashboard parts={["due", "safe", "quickadd", "glance"]} />;

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
