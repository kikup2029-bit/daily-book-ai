/**
 * Turning the daily nudge on and off, and delivering it.
 *
 * `ReminderSettings` is the screen. `ReminderRunner` is the invisible part that
 * actually shows the notification; it lives in the app shell so it runs on
 * every page.
 */

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, BellOff, Check } from "lucide-react";

import { getEntries } from "@/lib/books.functions";
import { getSettings, putReminder } from "@/lib/shop.functions";
import {
  DEFAULT_REMINDER_TIME,
  formatTime,
  isValidTime,
  msUntilReminder,
  needsInstallFirst,
  notificationSupport,
  shouldRemind,
  showReminder,
  toLocalISODate,
  type PermissionState,
} from "@/lib/reminders";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, Badge, Field, Panel, PanelBody, PanelHeader } from "@/components/ui/kit";

/* ------------------------------------------------------------- settings -- */

export function ReminderSettings() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const fetchSettings = useServerFn(getSettings);
  const save = useServerFn(putReminder);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchSettings(),
  });

  const [time, setTime] = useState(DEFAULT_REMINDER_TIME);
  const [permission, setPermission] = useState<PermissionState>("unsupported");
  const [error, setError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => {
    setPermission(notificationSupport());
  }, []);

  useEffect(() => {
    if (settings?.reminder_time && isValidTime(settings.reminder_time)) {
      setTime(settings.reminder_time);
    }
  }, [settings?.reminder_time]);

  const enabled = Boolean(settings?.reminder_enabled);
  const mustInstall = needsInstallFirst();

  const store = useMutation({
    mutationFn: (input: { enabled: boolean; time: string | null }) => save({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSavedNote(true);
      window.setTimeout(() => setSavedNote(false), 2500);
    },
    onError: (err: Error) => setError(err.message),
  });

  const turnOn = async () => {
    setError(null);
    if (!isValidTime(time)) {
      setError(t("reminder.errPickTime"));
      return;
    }

    if (permission === "unsupported") {
      setError(t("reminder.unsupported"));
      return;
    }

    if (permission !== "granted") {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
      if (result !== "granted") {
        setError(result === "denied" ? t("reminder.errDenied") : t("reminder.errNotAllowed"));
        return;
      }
    }

    store.mutate({ enabled: true, time });
  };

  if (isLoading) {
    return (
      <Panel>
        <PanelHeader title={t("reminder.title")} />
        <PanelBody>
          <span className="skeleton block h-5 w-48" />
          <span className="skeleton mt-3 block h-11 w-40" />
        </PanelBody>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader
        title={t("reminder.title")}
        description={t("reminder.cardBlurb")}
        action={
          enabled ? (
            <Badge tone="positive">
              <Check className="size-3" aria-hidden="true" />{" "}
              {t("reminder.onAt", { time: formatTime(time) })}
            </Badge>
          ) : (
            <Badge tone="neutral">{t("reminder.off")}</Badge>
          )
        }
      />
      <PanelBody className="space-y-4">
        {/*
          Being straight about what this is. It's a reminder the app shows when
          it notices the time has passed — not a phone alarm that fires on a
          dead device. Overpromising here would just erode trust the first time
          it didn't fire.
        */}
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {t("reminder.howItWorks")}
        </p>

        {mustInstall ? (
          <Alert tone="warning" title={t("reminder.installFirst")}>
            {t("reminder.installFirstBody")}
          </Alert>
        ) : null}

        {permission === "denied" ? (
          <Alert tone="negative" title={t("reminder.blocked")}>
            {t("reminder.blockedBody")}
          </Alert>
        ) : null}

        {permission === "unsupported" ? (
          <Alert tone="warning" title={t("reminder.unsupported")}>
            {t("reminder.unsupportedBody")}
          </Alert>
        ) : null}

        <div className="flex flex-wrap items-end gap-3">
          <Field id="reminder-time" label={t("reminder.remindMeAt")} className="w-40">
            <Input
              type="time"
              className="num"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              disabled={permission === "unsupported"}
            />
          </Field>

          {enabled ? (
            <>
              <Button
                variant="outline"
                loading={store.isPending && store.variables?.enabled === true}
                onClick={() => store.mutate({ enabled: true, time })}
                disabled={time === settings?.reminder_time}
              >
                {t("reminder.saveTime")}
              </Button>
              <Button
                variant="ghost"
                loading={store.isPending && store.variables?.enabled === false}
                onClick={() => store.mutate({ enabled: false, time })}
              >
                <BellOff aria-hidden="true" /> {t("reminder.turnOff")}
              </Button>
            </>
          ) : (
            <Button
              variant="brand"
              loading={store.isPending}
              onClick={turnOn}
              disabled={permission === "unsupported"}
            >
              <Bell aria-hidden="true" /> {t("reminder.turnOn")}
            </Button>
          )}
        </div>

        {error ? <Alert tone="negative">{error}</Alert> : null}
        {savedNote && !error ? <Alert tone="positive">{t("entryForm.saved")}</Alert> : null}

        {enabled && permission === "granted" ? (
          <button
            type="button"
            onClick={() => void showReminder()}
            className="text-[13px] font-medium text-brand underline-offset-4 hover:underline"
          >
            {t("reminder.sendTest")}
          </button>
        ) : null}
      </PanelBody>
    </Panel>
  );
}

/* --------------------------------------------------------------- runner -- */

/**
 * Watches the clock while the app is open and shows the reminder when it's due.
 *
 * Renders nothing. Lives in the shell so it works from whichever page happens
 * to be open.
 */
export function ReminderRunner() {
  const queryClient = useQueryClient();
  const fetchSettings = useServerFn(getSettings);
  const fetchEntries = useServerFn(getEntries);
  const save = useServerFn(putReminder);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => fetchSettings() });
  const { data: entries = [] } = useQuery({ queryKey: ["entries"], queryFn: () => fetchEntries() });

  // Guards against firing twice in one tick if both the timer and a focus
  // event decide it's due at the same moment.
  const firing = useRef(false);

  useEffect(() => {
    if (!settings?.reminder_enabled || !settings.reminder_time) return;

    const reminder = {
      enabled: settings.reminder_enabled,
      time: settings.reminder_time,
      lastShown: settings.reminder_last_shown,
    };

    const check = async () => {
      if (firing.current) return;
      const now = new Date();
      const today = toLocalISODate(now);
      const loggedToday = entries.some((entry) => entry.entry_date === today);

      const decision = shouldRemind(reminder, now, loggedToday);
      if (!decision.show) return;

      firing.current = true;
      const shown = await showReminder();
      if (shown) {
        // Record it server-side so the same day's reminder doesn't reappear on
        // another device.
        try {
          await save({ data: { enabled: true, time: reminder.time, last_shown: today } });
          queryClient.invalidateQueries({ queryKey: ["settings"] });
        } catch {
          // Not fatal — worst case it shows once more elsewhere.
        }
      }
      firing.current = false;
    };

    void check();

    // Wake up exactly when it's due, and also on a slow poll in case the
    // device slept through the timer.
    const untilDue = msUntilReminder(reminder, new Date());
    const timers: number[] = [];
    if (untilDue !== null) timers.push(window.setTimeout(check, untilDue + 1000));
    timers.push(window.setInterval(check, 5 * 60 * 1000));

    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      timers.forEach((id) => {
        window.clearTimeout(id);
        window.clearInterval(id);
      });
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [
    settings?.reminder_enabled,
    settings?.reminder_time,
    settings?.reminder_last_shown,
    entries,
    save,
    queryClient,
  ]);

  return null;
}
