import {
  shouldRemind,
  msUntilReminder,
  isValidTime,
  formatTime,
  toLocalISODate,
  DEFAULT_REMINDER_TIME,
  type ReminderSettings,
} from "../src/lib/reminders.ts";

let pass = 0,
  fail = 0;
const ok = (c: boolean, l: string) => {
  if (c) pass++;
  else {
    fail++;
    console.log("FAIL: " + l);
  }
};
const eq = (a: unknown, b: unknown, l: string) => {
  const same = JSON.stringify(a) === JSON.stringify(b);
  if (!same) console.log(`FAIL: ${l} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
  same ? pass++ : fail++;
};

const at = (h: number, m = 0) => {
  const d = new Date(2026, 7, 5, h, m, 0, 0);
  return d;
};
const s = (over: Partial<ReminderSettings> = {}): ReminderSettings => ({
  enabled: true,
  time: "18:00",
  lastShown: null,
  ...over,
});

// --- time validation
ok(isValidTime("18:00"), "24h time valid");
ok(isValidTime("00:00"), "midnight valid");
ok(isValidTime("23:59"), "last minute valid");
ok(!isValidTime("24:00"), "24:00 rejected");
ok(!isValidTime("7:00"), "unpadded hour rejected");
ok(!isValidTime("18:60"), "minute 60 rejected");
ok(!isValidTime(""), "empty rejected");
ok(isValidTime(DEFAULT_REMINDER_TIME), "the default is itself valid");

// --- the core decision
eq(shouldRemind(s(), at(19), false), { show: true }, "after the time, nothing logged: remind");
eq(shouldRemind(s(), at(17, 59), false).show, false, "one minute early: stay quiet");
eq(shouldRemind(s(), at(18, 0), false), { show: true }, "exactly on the minute counts");
eq((shouldRemind(s(), at(17), false) as { reason: string }).reason, "too-early", "reason reported");

// Already logged today — the habit already happened, so no nagging.
eq(
  (shouldRemind(s(), at(19), true) as { reason: string }).reason,
  "logged-today",
  "nothing logged is the whole point; if it's logged, stay quiet",
);

// Once per day only.
eq(
  (shouldRemind(s({ lastShown: "2026-08-05" }), at(19), false) as { reason: string }).reason,
  "already-shown",
  "same day doesn't re-nag",
);
eq(
  shouldRemind(s({ lastShown: "2026-08-04" }), at(19), false),
  { show: true },
  "yesterday's reminder doesn't block today's",
);

// Off means off.
eq(
  (shouldRemind(s({ enabled: false }), at(23), false) as { reason: string }).reason,
  "disabled",
  "disabled never fires",
);
eq(
  (shouldRemind(s({ time: "nope" }), at(23), false) as { reason: string }).reason,
  "disabled",
  "a broken time is treated as off rather than firing at random",
);

// --- countdown
{
  const ms = msUntilReminder(s({ time: "18:00" }), at(17, 0));
  eq(ms, 60 * 60 * 1000, "an hour before is an hour of waiting");
  eq(msUntilReminder(s({ time: "18:00" }), at(19)), null, "already past: no timer");
  eq(msUntilReminder(s({ enabled: false }), at(9)), null, "disabled: no timer");
  eq(msUntilReminder(s({ time: "bad" }), at(9)), null, "invalid time: no timer");
}

// --- display
ok(formatTime("18:00").length > 0, "formats a time for reading");
eq(formatTime("nonsense"), "nonsense", "unparseable time passes through untouched");
eq(toLocalISODate(new Date(2026, 0, 9)), "2026-01-09", "local date is zero padded");

// A reminder set for just after midnight must still work.
eq(
  shouldRemind(s({ time: "00:30" }), at(1), false),
  { show: true },
  "early-morning reminder fires",
);
eq(shouldRemind(s({ time: "00:30" }), at(0, 15), false).show, false, "…but not before its time");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
