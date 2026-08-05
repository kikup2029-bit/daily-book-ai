import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/tools")({
  // Tools is now a group of pages in the sidebar rather than one long page.
  beforeLoad: () => {
    throw redirect({ to: "/household" });
  },
});
