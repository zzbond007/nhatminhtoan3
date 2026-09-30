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

/**
 * Khoá ngày YYYY-MM-DD theo giờ ĐỊA PHƯƠNG của máy — cùng định dạng với discoveryDays.
 * Không dùng toISOString(): đó là giờ UTC, nên ở Việt Nam một buổi học trước 7 giờ sáng
 * sẽ bị ghi sang ngày hôm trước.
 */
export function localDayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
