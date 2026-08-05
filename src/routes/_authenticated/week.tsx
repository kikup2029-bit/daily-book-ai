import { createFileRoute } from "@tanstack/react-router";

import { WeekDigestCard } from "@/components/sections/month-cards";

const Page = () => (
  <main className="w-full max-w-2xl">
    <WeekDigestCard />
  </main>
);

export const Route = createFileRoute("/_authenticated/week")({
  head: () => ({
    meta: [
      { title: "Your week — SimpleBooks AI" },
      { name: "description", content: "A plain-English recap of the last seven days." },
      { property: "og:title", content: "Your week — SimpleBooks AI" },
      { property: "og:description", content: "A plain-English recap of the last seven days." },
    ],
  }),
  component: Page,
});
