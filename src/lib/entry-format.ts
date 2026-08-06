/**
 * How an entry reads on screen.
 *
 * Kept apart from the component so the rules can be tested directly, and so
 * every list that shows an entry formats it the same way.
 */

/**
 * "Jul 31" instead of "2026-07-31".
 *
 * The ISO form is unambiguous but nobody reads a date that way, and the digits
 * all look alike when you're scanning a column of them. Dates in the current
 * year drop the year, because on the rows people actually look at it's noise.
 */
export function readableDate(iso: string, today: Date = new Date()): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;

  const startOf = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const dayDiff = Math.round((startOf(today) - startOf(date)) / 86_400_000);

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";

  const sameYear = date.getFullYear() === today.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/**
 * Categories arrive however they were typed — "Groceries" one day, "rent" the
 * next. Showing them inconsistently makes the whole list look careless.
 *
 * Only the first letter is touched. Title-casing the whole string would turn
 * "iPhone case" into "Iphone Case", which is worse than leaving it alone.
 */
export function tidyLabel(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/** Which of the two amounts on an entry is the one that matters, signed. */
export function signedAmount(entry: { amount_in: number; amount_out: number }): number {
  return entry.amount_in > 0 ? entry.amount_in : -entry.amount_out;
}

/** The words for who can see an entry, or null when it's private. */
export function sharingLabel(entry: {
  household_id: string | null;
  is_split: boolean;
}): "Shared" | "Split" | null {
  if (!entry.household_id) return null;
  return entry.is_split ? "Split" : "Shared";
}

/** What the overflow menu should offer for the sharing state it's in. */
export function nextShareMode(entry: { household_id: string | null; is_split: boolean }): {
  mode: "private" | "visible" | "split";
  label: string;
} {
  if (!entry.household_id) return { mode: "visible", label: "Share with household" };
  if (entry.is_split) return { mode: "private", label: "Make private again" };
  return { mode: "split", label: "Split this one evenly" };
}
