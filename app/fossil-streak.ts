// Module 6.1 · "Bảo tàng Hóa thạch" — chuỗi học tập nhân văn.
// - Không đếm "ngày liên tiếp" và KHÔNG BAO GIỜ reset về 0: mỗi tuần đạt "Nhịp 5 buổi/tuần" được
//   cất thêm một hóa thạch vào bảo tàng; tuần chưa đạt chỉ là "tuần nghỉ", hóa thạch cũ vẫn còn nguyên.
// - Mỗi tháng có sẵn 2 "Khiên hóa thạch": mỗi khiên bù 1 buổi còn thiếu của tuần vừa qua (khi con ốm/bận),
//   dùng được trong suốt tuần kế tiếp. Lượt dùng khiên được lưu trong hồ sơ (localStorage).
// Ngày có định dạng YYYY-MM-DD giống discoveryDays.

export const RHYTHM_SESSIONS_PER_WEEK = 5;
export const FOSSIL_SHIELDS_PER_MONTH = 2;

const DAY_MS = 86_400_000;

export type ShieldUse = { week: string; days: number; month: string; usedAt: string };
export type RhythmWeekStatus = "met" | "rescued" | "resting" | "in-progress";
export type RhythmWeek = { weekStart: string; learnedDays: number; shieldDays: number; status: RhythmWeekStatus };

function toTime(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year, month - 1, date);
}
function toDay(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}
/** Thứ Hai đầu tuần chứa ngày `day`. */
export function weekStartOf(day: string) {
  const time = toTime(day);
  const weekday = (new Date(time).getUTCDay() + 6) % 7; // Thứ Hai = 0
  return toDay(time - weekday * DAY_MS);
}

export function shieldsLeft(uses: ShieldUse[], today: string) {
  const month = today.slice(0, 7);
  const used = uses.filter((use) => use.month === month).reduce((sum, use) => sum + use.days, 0);
  return Math.max(0, FOSSIL_SHIELDS_PER_MONTH - used);
}

export function rhythmWeeks(days: string[], uses: ShieldUse[], today: string): RhythmWeek[] {
  const learned = [...new Set(days.filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day) && day <= today))].sort();
  if (!learned.length) return [];
  const byWeek = new Map<string, number>();
  learned.forEach((day) => byWeek.set(weekStartOf(day), (byWeek.get(weekStartOf(day)) ?? 0) + 1));
  const shieldByWeek = new Map<string, number>();
  uses.forEach((use) => shieldByWeek.set(use.week, (shieldByWeek.get(use.week) ?? 0) + use.days));

  const currentWeek = weekStartOf(today);
  const weeks: RhythmWeek[] = [];
  for (let cursor = toTime(weekStartOf(learned[0])); cursor <= toTime(currentWeek); cursor += 7 * DAY_MS) {
    const weekStart = toDay(cursor);
    const learnedDays = byWeek.get(weekStart) ?? 0;
    const shieldDays = shieldByWeek.get(weekStart) ?? 0;
    let status: RhythmWeekStatus;
    if (learnedDays >= RHYTHM_SESSIONS_PER_WEEK) status = "met";
    else if (learnedDays + shieldDays >= RHYTHM_SESSIONS_PER_WEEK) status = "rescued";
    else status = weekStart === currentWeek ? "in-progress" : "resting";
    weeks.push({ weekStart, learnedDays, shieldDays, status });
  }
  return weeks;
}

export type RescueCandidate = { week: string; missing: number };

/** Tuần vừa kết thúc còn thiếu ≤ số khiên còn lại → có thể cứu. Chỉ cứu được trong tuần kế tiếp. */
export function rescueCandidate(days: string[], uses: ShieldUse[], today: string): RescueCandidate | null {
  const previousWeek = toDay(toTime(weekStartOf(today)) - 7 * DAY_MS);
  const week = rhythmWeeks(days, uses, today).find((item) => item.weekStart === previousWeek);
  if (!week || week.status !== "resting" || week.learnedDays === 0) return null;
  const missing = RHYTHM_SESSIONS_PER_WEEK - week.learnedDays - week.shieldDays;
  return missing <= shieldsLeft(uses, today) ? { week: previousWeek, missing } : null;
}

export function applyFossilShield(days: string[], uses: ShieldUse[], today: string, now: string): ShieldUse[] {
  const candidate = rescueCandidate(days, uses, today);
  if (!candidate) return uses;
  return [...uses, { week: candidate.week, days: candidate.missing, month: today.slice(0, 7), usedAt: now }];
}

export type FossilMuseum = {
  fossils: number;            // tổng số tuần đạt nhịp (không bao giờ giảm)
  rescuedFossils: number;
  thisWeek: RhythmWeek | null;
  shieldsLeft: number;
  rescue: RescueCandidate | null;
  recentWeeks: RhythmWeek[];  // 8 tuần gần nhất để vẽ kệ trưng bày
};

export function fossilMuseum(days: string[], uses: ShieldUse[], today: string): FossilMuseum {
  const weeks = rhythmWeeks(days, uses, today);
  const currentWeek = weekStartOf(today);
  return {
    fossils: weeks.filter((week) => week.status === "met" || week.status === "rescued").length,
    rescuedFossils: weeks.filter((week) => week.status === "rescued").length,
    thisWeek: weeks.find((week) => week.weekStart === currentWeek) ?? null,
    shieldsLeft: shieldsLeft(uses, today),
    rescue: rescueCandidate(days, uses, today),
    recentWeeks: weeks.slice(-8),
  };
}

export function normalizeShieldUses(raw: unknown): ShieldUse[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item): ShieldUse[] => {
    if (!item || typeof item !== "object") return [];
    const use = item as Partial<ShieldUse>;
    if (typeof use.week !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(use.week) || typeof use.month !== "string") return [];
    const days = Math.max(1, Math.min(FOSSIL_SHIELDS_PER_MONTH, Math.floor(Number(use.days) || 0)));
    return [{ week: use.week, days, month: use.month.slice(0, 7), usedAt: typeof use.usedAt === "string" ? use.usedAt : "" }];
  }).slice(-60);
}
