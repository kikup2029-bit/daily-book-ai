import { createFileRoute } from "@tanstack/react-router";

import { OutlookCard } from "@/components/sections/month-cards";

const Page = () => (
  <div className="w-full max-w-3xl">
    <OutlookCard />
  </div>
);

export const Route = createFileRoute("/_authenticated/outlook")({
  head: () => ({ meta: [{ title: "Can you cover it — SimpleBooks AI" }] }),
  component: Page,
});
