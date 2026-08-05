import { createFileRoute } from "@tanstack/react-router";

import { WeekDigestCard } from "@/components/sections/month-cards";

const Page = () => (
  <div className="rise mx-auto w-full max-w-3xl">
    <WeekDigestCard />
  </div>
);

export const Route = createFileRoute("/_authenticated/week")({
  head: () => ({ meta: [{ title: "Your week — SimpleBooks AI" }] }),
  component: Page,
});
