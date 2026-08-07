import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { WeekDigestCard } from "@/components/sections/month-cards";

const Page = () => (
  <ProGate feature="insights" title="nav.yourWeek">
    <div className="rise mx-auto w-full max-w-3xl">
      <WeekDigestCard />
    </div>
  </ProGate>
);

export const Route = createFileRoute("/_authenticated/week")({
  head: () => ({ meta: [{ title: "Your week — SimpleBooks AI" }] }),
  component: Page,
});
