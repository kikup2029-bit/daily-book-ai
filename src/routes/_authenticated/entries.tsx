import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { EntriesSearch } from "@/components/sections/entries-search";

const Page = () => (
  <ProGate feature="entrySearch" title="nav.findEntry">
    <EntriesSearch />
  </ProGate>
);

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
  component: Page,
});
