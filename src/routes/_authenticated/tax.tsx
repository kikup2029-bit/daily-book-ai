import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { TaxJarCard } from "@/components/sections/month-cards";
import { SettingsSection } from "@/components/sections/tools-sections";

const Page = () => (
  <ProGate feature="cashTools" title="nav.tax">
    <div className="rise mx-auto w-full max-w-3xl">
      <TaxJarCard />
      <SettingsSection />
    </div>
  </ProGate>
);

export const Route = createFileRoute("/_authenticated/tax")({
  head: () => ({ meta: [{ title: "Tax set-aside — SimpleBooks AI" }] }),
  component: Page,
});
