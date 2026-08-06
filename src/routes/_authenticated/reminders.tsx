import { createFileRoute } from "@tanstack/react-router";

import { ReminderSettings } from "@/components/daily-reminder";
import { PageHeader } from "@/components/ui/kit";

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({
    meta: [
      { title: "Daily reminder — SimpleBooks" },
      {
        name: "description",
        content: "Get a nudge at a time you choose to log the day's money in and out.",
      },
    ],
  }),
  component: RemindersPage,
});

function RemindersPage() {
  return (
    <div className="rise mx-auto w-full max-w-3xl">
      <PageHeader
        eyebrow="Tools"
        title="Daily reminder"
        description="Every number in this app comes from entries you log. A small nudge at the right time is the difference between a habit and a good intention."
      />
      <ReminderSettings />
    </div>
  );
}
