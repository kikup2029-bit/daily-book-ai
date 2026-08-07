import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { MonthlyPage } from "@/components/sections/month-sections";

const Page = () => (
  <ProGate feature="insights" title="nav.dayByDay">
    <MonthlyPage parts={["daybyday"]} />
  </ProGate>
);

export const Route = createFileRoute("/_authenticated/daybyday")({
  head: () => ({
    meta: [
      { title: "Day by day — SimpleBooks AI" },
      { name: "description", content: "See how each day of the month went." },
      { property: "og:title", content: "Day by day — SimpleBooks AI" },
      { property: "og:description", content: "See how each day of the month went." },
    ],
  }),
  component: Page,
});
