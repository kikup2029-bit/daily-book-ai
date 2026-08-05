import { createFileRoute } from "@tanstack/react-router";

import { HouseholdSection } from "@/components/sections/tools-sections";

export const Route = createFileRoute("/_authenticated/household")({
  head: () => ({
    meta: [
      { title: "Household — SimpleBooks AI" },
      {
        name: "description",
        content: "Share entries with a partner or housemate and split shared bills fairly.",
      },
      { property: "og:title", content: "Household — SimpleBooks AI" },
      {
        property: "og:description",
        content: "Share entries with a partner or housemate and split shared bills fairly.",
      },
    ],
  }),
  component: HouseholdSection,
});
