import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { BusyDaysCard } from "@/components/sections/month-cards";

const Page = () => (
  <ProGate feature="insights" title="nav.busyDays">
    <div className="rise mx-auto w-full max-w-3xl">
      <BusyDaysCard />
    </div>
  </ProGate>
);

export const Route = createFileRoute("/_authenticated/busydays")({
  head: () => ({ meta: [{ title: "Busy and quiet days — SimpleBooks AI" }] }),
  component: Page,
});
