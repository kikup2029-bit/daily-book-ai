import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { Dashboard } from "@/components/sections/today-sections";

const Page = () => (
  <ProGate feature="aiQuestions" title="nav.ask">
    <Dashboard parts={["ask"]} />
  </ProGate>
);

export const Route = createFileRoute("/_authenticated/ask")({
  head: () => ({ meta: [{ title: "Ask about your money — SimpleBooks AI" }] }),
  component: Page,
});
