/**
 * The daily nudge to log the day's takings.
 *
 * An honest description of what this can and can't do, because the difference
 * matters and the UI has to tell the truth about it:
 *
 * This app has no push server. There is no backend process that can wake a
 * phone at 6pm and deliver a notification. What it *can* do is notice, when
 * the app is opened or is sitting open, that today's reminder time has passed
 * and today's reminder hasn't been shown yet — and show it then.
 *
 * In practice that means: reliable while the app is open or installed and
 * recently used; not a substitute for a phone alarm if the app hasn't been
 * opened all day. The settings screen says exactly this rather than implying
 * an alarm clock.
 *
 * The scheduling decision is a pure function so it can be tested properly.
 */

export type ReminderSettings = {
  enabled: boolean;
  /** "HH:MM", 24-hour. */
  time: string;
  /** ISO date of the last day a reminder was actually shown. */
  lastShown: string | null;
};

export const DEFAULT_REMINDER_TIME = "18:00";

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/** "18:00" → "6:00 pm", in the reader's own locale where possible. */
export function formatTime(value: string): string {
  if (!isValidTime(value)) return value;
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  try {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return value;
  }
}

export type ReminderDecision =
  | { show: false; reason: "disabled" | "too-early" | "already-shown" | "logged-today" }
  | { show: true };

/**
 * Should a reminder appear right now?
 *
 * Deliberate choices here:
 *  - Nothing before the chosen time. A reminder that fires early is noise.
 *  - Once per day, tracked by date, so reopening the app doesn't re-nag.
 *  - Nothing at all if something has already been logged today. The whole
 *    point is the habit; if the habit already happened, stay quiet.
 */
export function shouldRemind(
  settings: ReminderSettings,
  now: Date,
  hasLoggedToday: boolean,
): ReminderDecision {
  if (!settings.enabled || !isValidTime(settings.time)) return { show: false, reason: "disabled" };
  if (hasLoggedToday) return { show: false, reason: "logged-today" };

  const today = toLocalISODate(now);
  if (settings.lastShown === today) return { show: false, reason: "already-shown" };

  const [hours, minutes] = settings.time.split(":").map(Number);
  const dueAt = new Date(now);
  dueAt.setHours(hours, minutes, 0, 0);
  if (now < dueAt) return { show: false, reason: "too-early" };

  return { show: true };
}

/**
 * Milliseconds until the next reminder, or null when there isn't one today.
 *
 * Used to set a timer while the app is open, so someone with the app on a
 * counter all day gets the nudge without having to touch it.
 */
export function msUntilReminder(settings: ReminderSettings, now: Date): number | null {
  if (!settings.enabled || !isValidTime(settings.time)) return null;
  const [hours, minutes] = settings.time.split(":").map(Number);
  const dueAt = new Date(now);
  dueAt.setHours(hours, minutes, 0, 0);
  const diff = dueAt.getTime() - now.getTime();
  return diff > 0 ? diff : null;
}

export function toLocalISODate(date: Date): string {
  return date.toLocaleDateString("en-CA");
}

export type PermissionState = "unsupported" | "default" | "granted" | "denied";

export function notificationSupport(): PermissionState {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission as PermissionState;
}

/**
 * iOS only allows web notifications for an app added to the home screen, and
 * silently does nothing otherwise. Better to say so than let someone flip a
 * switch that can't work.
 */
export function needsInstallFirst(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (!isIos) return false;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true;
  return !standalone;
}

export const REMINDER_TITLE = "Today's takings";
export const REMINDER_BODY = "A minute now saves an evening later. Log what came in and went out.";

/**
 * Show the notification.
 *
 * Goes through the service worker when one is registered, because that's the
 * only path that works on Android and on installed iOS apps. Falls back to a
 * page-level notification on desktop browsers.
 */
export async function showReminder(): Promise<boolean> {
  if (notificationSupport() !== "granted") return false;

  const options: NotificationOptions = {
    body: REMINDER_BODY,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "simplebooks-daily",
    requireInteraction: false,
  };

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification(REMINDER_TITLE, options);
      return true;
    }
  } catch {
    // Fall through to the page-level path below.
  }

  try {
    new Notification(REMINDER_TITLE, options);
    return true;
  } catch {
    return false;
  }
}
