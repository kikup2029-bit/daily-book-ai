import { createFileRoute } from "@tanstack/react-router";

import { BusyDaysCard } from "@/components/sections/month-cards";

const Page = () => (
  <main className="w-full max-w-2xl">
    <BusyDaysCard />
  </main>
);

export const Route = createFileRoute("/_authenticated/busydays")({
  head: () => ({
    meta: [
      { title: "Busy and quiet days — SimpleBooks AI" },
      { name: "description", content: "Which days of the week bring in the most." },
      { property: "og:title", content: "Busy and quiet days — SimpleBooks AI" },
      { property: "og:description", content: "Which days of the week bring in the most." },
    ],
  }),
  component: Page,
});
