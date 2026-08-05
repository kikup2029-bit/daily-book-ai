import { createFileRoute } from "@tanstack/react-router";

import { TaxJarCard } from "@/components/sections/month-cards";
import { SettingsSection } from "@/components/sections/tools-sections";

const Page = () => (
  <main className="w-full max-w-2xl">
    <TaxJarCard />
    <SettingsSection />
  </main>
);

export const Route = createFileRoute("/_authenticated/tax")({
  head: () => ({
    meta: [
      { title: "Tax set-aside — SimpleBooks AI" },
      {
        name: "description",
        content: "Choose how much of your income to hold back for tax, and see the running total.",
      },
    ],
  }),
  component: Page,
});
