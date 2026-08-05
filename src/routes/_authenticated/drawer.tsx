import { createFileRoute } from "@tanstack/react-router";

import { DrawerSection } from "@/components/sections/tools-sections";

export const Route = createFileRoute("/_authenticated/drawer")({
  head: () => ({
    meta: [
      { title: "Cash drawer — SimpleBooks AI" },
      { name: "description", content: "Count the till and check it against what you logged." },
      { property: "og:title", content: "Cash drawer — SimpleBooks AI" },
      { property: "og:description", content: "Count the till and check it against what you logged." },
    ],
  }),
  component: DrawerSection,
});
