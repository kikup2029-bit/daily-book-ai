import { createFileRoute } from "@tanstack/react-router";

import { ProGate } from "@/components/pro-gate";
import { OutlookCard } from "@/components/sections/month-cards";

const Page = () => (
  <ProGate feature="insights" title="nav.canYouCover">
    <div className="rise mx-auto w-full max-w-3xl">
      <OutlookCard />
    </div>
  </ProGate>
);

export const Route = createFileRoute("/_authenticated/outlook")({
  head: () => ({ meta: [{ title: "Can you cover it — SimpleBooks AI" }] }),
  component: Page,
});
