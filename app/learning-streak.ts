// Chuỗi ngày học có "ngày nghỉ có phép": mỗi tháng tự bù tối đa REST_DAYS_PER_MONTH ngày vắng
// để một lần ốm hay bận không làm mất cả chuỗi. Ngày dùng cùng định dạng YYYY-MM-DD với discoveryDays.

export const REST_DAYS_PER_MONTH = 2;

const DAY_MS = 86_400_000;

function toTime(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year, month - 1, date);
}
function toDay(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}

export type LearningStreak = {
  streak: number;          // số ngày có học trong chuỗi hiện tại
  learnedToday: boolean;
  restDays: string[];      // các ngày vắng đã được bù trong chuỗi
  restUsedThisMonth: number;
};

export function learningStreak(days: string[], today: string): LearningStreak {
  const learned = new Set(days.filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)));
  const learnedToday = learned.has(today);
  const earliest = [...learned].sort()[0];
  const empty = { streak: 0, learnedToday, restDays: [], restUsedThisMonth: 0 };
  if (!earliest) return empty;

  const usedByMonth: Record<string, number> = {};
  const committedRest: string[] = [];
  let pendingRest: string[] = [];
  let streak = 0;
  // Hôm nay chưa học không làm đứt chuỗi: vẫn còn cả ngày để học.
  for (let cursor = toTime(today) - (learnedToday ? 0 : DAY_MS); cursor >= toTime(earliest); cursor -= DAY_MS) {
    const day = toDay(cursor);
    if (learned.has(day)) {
      streak += 1;
      committedRest.push(...pendingRest);
      pendingRest = [];
      continue;
    }
    const month = day.slice(0, 7);
    const used = (usedByMonth[month] ?? 0);
    if (used >= REST_DAYS_PER_MONTH) break;
    usedByMonth[month] = used + 1;
    pendingRest.push(day);
  }
  const thisMonth = today.slice(0, 7);
  return {
    streak,
    learnedToday,
    restDays: committedRest,
    restUsedThisMonth: committedRest.filter((day) => day.startsWith(thisMonth)).length,
  };
}
