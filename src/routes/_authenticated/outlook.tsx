import { createFileRoute } from "@tanstack/react-router";

import { OutlookCard } from "@/components/sections/month-cards";

const Page = () => (
  <main className="w-full max-w-2xl">
    <OutlookCard />
  </main>
);

export const Route = createFileRoute("/_authenticated/outlook")({
  head: () => ({
    meta: [
      { title: "Can you cover it — SimpleBooks AI" },
      { name: "description", content: "A 30-day look ahead at whether your money covers the bills coming up." },
      { property: "og:title", content: "Can you cover it — SimpleBooks AI" },
      { property: "og:description", content: "A 30-day look ahead at whether your money covers the bills coming up." },
    ],
  }),
  component: Page,
});
