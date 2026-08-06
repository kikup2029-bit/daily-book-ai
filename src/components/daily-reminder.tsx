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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, Badge, Field, Panel, PanelBody, PanelHeader } from "@/components/ui/kit";

/* ------------------------------------------------------------- settings -- */

export function ReminderSettings() {
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
      setError("Pick a time first.");
      return;
    }

    if (permission === "unsupported") {
      setError("This browser can't show notifications.");
      return;
    }

    if (permission !== "granted") {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
      if (result !== "granted") {
        setError(
          result === "denied"
            ? "Your browser is blocking notifications for this site. Allow them in your browser settings, then try again."
            : "Notifications weren't allowed, so the reminder can't be shown.",
        );
        return;
      }
    }

    store.mutate({ enabled: true, time });
  };

  if (isLoading) {
    return (
      <Panel>
        <PanelHeader title="Daily reminder" />
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
        title="Daily reminder"
        description="A nudge to log the day, so the habit sticks."
        action={
          enabled ? (
            <Badge tone="positive">
              <Check className="size-3" aria-hidden="true" /> On at {formatTime(time)}
            </Badge>
          ) : (
            <Badge tone="neutral">Off</Badge>
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
          Once the time you pick has passed, the app shows a notification the next time it&apos;s
          open or running in the background. It won&apos;t fire on a phone that hasn&apos;t opened
          the app all day — there&apos;s no server sending these, which is also why they cost
          nothing and no one else sees your data.
        </p>

        {mustInstall ? (
          <Alert tone="warning" title="Add it to your home screen first">
            iPhone only allows notifications for apps added to the home screen. Tap Share, then Add
            to Home Screen, open it from the new icon, and come back here.
          </Alert>
        ) : null}

        {permission === "denied" ? (
          <Alert tone="negative" title="Notifications are blocked">
            Your browser is blocking notifications for this site. You&apos;ll need to allow them in
            your browser settings before this can work.
          </Alert>
        ) : null}

        {permission === "unsupported" ? (
          <Alert tone="warning" title="This browser can't show notifications">
            Everything else still works — you just won&apos;t get the nudge here.
          </Alert>
        ) : null}

        <div className="flex flex-wrap items-end gap-3">
          <Field id="reminder-time" label="Remind me at" className="w-40">
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
                Save time
              </Button>
              <Button
                variant="ghost"
                loading={store.isPending && store.variables?.enabled === false}
                onClick={() => store.mutate({ enabled: false, time })}
              >
                <BellOff aria-hidden="true" /> Turn off
              </Button>
            </>
          ) : (
            <Button
              variant="brand"
              loading={store.isPending}
              onClick={turnOn}
              disabled={permission === "unsupported"}
            >
              <Bell aria-hidden="true" /> Turn on reminders
            </Button>
          )}
        </div>

        {error ? <Alert tone="negative">{error}</Alert> : null}
        {savedNote && !error ? <Alert tone="positive">Saved.</Alert> : null}

        {enabled && permission === "granted" ? (
          <button
            type="button"
            onClick={() => void showReminder()}
            className="text-[13px] font-medium text-brand underline-offset-4 hover:underline"
          >
            Send a test notification now
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
