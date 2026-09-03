const DAY_MS = 86_400_000;

/**
 * Stable index for the user's local calendar date. Unlike Date.now() / DAY_MS,
 * this changes at local midnight instead of midnight UTC.
 */
export function localCalendarDayIndex(date = new Date()) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS,
  );
}
