import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "@/components/sections/today-sections";

const Page = () => <Dashboard parts={["streaks"]} />;

export const Route = createFileRoute("/_authenticated/streaks")({
  head: () => ({ meta: [{ title: "Your streaks — SimpleBooks AI" }] }),
  component: Page,
});
