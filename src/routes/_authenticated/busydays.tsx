import { createFileRoute } from "@tanstack/react-router";

import { BusyDaysCard } from "@/components/sections/month-cards";

const Page = () => (
  <div className="rise mx-auto w-full max-w-3xl">
    <BusyDaysCard />
  </div>
);

export const Route = createFileRoute("/_authenticated/busydays")({
  head: () => ({ meta: [{ title: "Busy and quiet days — SimpleBooks AI" }] }),
  component: Page,
});
