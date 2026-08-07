import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { Dashboard } from "@/components/sections/today-sections";

const Page = () => (
  <ProGate feature="insights" title="nav.streaks">
    <Dashboard parts={["streaks"]} />
  </ProGate>
);

export const Route = createFileRoute("/_authenticated/streaks")({
  head: () => ({ meta: [{ title: "Your streaks — SimpleBooks AI" }] }),
  component: Page,
});
