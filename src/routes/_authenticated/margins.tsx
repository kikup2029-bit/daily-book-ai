import { createFileRoute } from "@tanstack/react-router";

import { MarginsSection } from "@/components/sections/tools-sections";

export const Route = createFileRoute("/_authenticated/margins")({
  head: () => ({
    meta: [
      { title: "Item margins — SimpleBooks AI" },
      {
        name: "description",
        content: "See what you really keep on each item you sell after costs.",
      },
      { property: "og:title", content: "Item margins — SimpleBooks AI" },
      {
        property: "og:description",
        content: "See what you really keep on each item you sell after costs.",
      },
    ],
  }),
  component: MarginsSection,
});
