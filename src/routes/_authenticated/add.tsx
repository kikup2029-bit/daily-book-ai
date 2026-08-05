import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "@/components/sections/today-sections";

const Page = () => <Dashboard parts={["quickadd", "form"]} />;

export const Route = createFileRoute("/_authenticated/add")({
  head: () => ({ meta: [{ title: "Add an entry — SimpleBooks AI" }] }),
  component: Page,
});
