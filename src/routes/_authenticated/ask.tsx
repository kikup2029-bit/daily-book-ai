import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "@/components/sections/today-sections";

const Page = () => <Dashboard parts={["ask"]} />;

export const Route = createFileRoute("/_authenticated/ask")({
  head: () => ({ meta: [{ title: "Ask about your money — SimpleBooks AI" }] }),
  component: Page,
});
