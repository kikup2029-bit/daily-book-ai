import { createFileRoute } from "@tanstack/react-router";

import { TaxJarCard } from "@/components/sections/month-cards";
import { SettingsSection } from "@/components/sections/tools-sections";

const Page = () => (
  <div className="rise mx-auto w-full max-w-3xl">
    <TaxJarCard />
    <SettingsSection />
  </div>
);

export const Route = createFileRoute("/_authenticated/tax")({
  head: () => ({ meta: [{ title: "Tax set-aside — SimpleBooks AI" }] }),
  component: Page,
});
