import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { DrawerSection } from "@/components/sections/tools-sections";

const Page = () => (
  <ProGate feature="cashTools" title="nav.drawer">
    <DrawerSection />
  </ProGate>
);

export const Route = createFileRoute("/_authenticated/drawer")({
  head: () => ({
    meta: [
      { title: "Cash drawer — SimpleBooks AI" },
      { name: "description", content: "Count the till and check it against what you logged." },
      { property: "og:title", content: "Cash drawer — SimpleBooks AI" },
      {
        property: "og:description",
        content: "Count the till and check it against what you logged.",
      },
    ],
  }),
  component: Page,
});
