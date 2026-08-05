import { createFileRoute } from "@tanstack/react-router";

import { EntriesSearch } from "@/components/sections/entries-search";

export const Route = createFileRoute("/_authenticated/entries")({
  head: () => ({
    meta: [
      { title: "Find an entry — SimpleBooks AI" },
      {
        name: "description",
        content:
          "Search everything you've logged by shop, category, date or amount, and correct any entry.",
      },
    ],
  }),
  component: EntriesSearch,
});
