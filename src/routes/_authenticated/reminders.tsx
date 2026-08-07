import { createFileRoute } from "@tanstack/react-router";

import { ReminderSettings } from "@/components/daily-reminder";
import { ProGate } from "@/components/pro-gate";
import { PageHeader } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";

const Page = () => (
  <ProGate feature="dailyReminder" title="nav.reminder">
    <RemindersPage />
  </ProGate>
);

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
  component: Page,
});

function RemindersPage() {
  // The heading was three hard-coded English strings sitting above a panel that
  // was already translated — same bug as the paywall title, one page down. The
  // keys already existed in all six languages; nobody had wired them up.
  const { t } = useI18n();
  return (
    <div className="rise mx-auto w-full max-w-3xl">
      <PageHeader
        eyebrow={t("reminder.eyebrow")}
        title={t("reminder.title")}
        description={t("reminder.pageBlurb")}
      />
      <ReminderSettings />
    </div>
  );
}
