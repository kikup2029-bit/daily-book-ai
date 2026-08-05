import { createFileRoute } from "@tanstack/react-router";

import { LockSection } from "@/components/sections/tools-sections";

export const Route = createFileRoute("/_authenticated/lock")({
  head: () => ({
    meta: [
      { title: "Lock this app — SimpleBooks AI" },
      { name: "description", content: "Hide your books behind a PIN on this device." },
      { property: "og:title", content: "Lock this app — SimpleBooks AI" },
      { property: "og:description", content: "Hide your books behind a PIN on this device." },
    ],
  }),
  component: LockSection,
});
