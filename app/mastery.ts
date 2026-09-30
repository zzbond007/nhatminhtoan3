// Mức thành thạo hai chiều.
// Trước đây `autonomy` được lưu bằng Math.max: một lần đạt 85 là ở dải "Bứt phá" mãi mãi,
// còn lần đầu luôn là "Vừa sức" và kết quả đánh giá đầu vào không được dùng.
// Nay mỗi miền có một mức thành thạo 0–100 là trung bình trượt có trọng số:
//   mới = 0,6 × cũ + 0,4 × kết quả buổi vừa học
// nên mức này tăng khi con làm tốt và giảm khi con gặp khó. Mức khởi đầu lấy từ bài đánh giá đầu vào.

import type { DomainId } from "./content";

export type DifficultyBand = "support" | "core" | "stretch";
export type MasteryMap = Record<DomainId, number>;

export const MASTERY_DOMAINS: DomainId[] = ["number", "calculation", "measurement", "geometry", "data", "word"];
/** Trọng số của buổi học mới nhất trong trung bình trượt. */
export const MASTERY_NEW_WEIGHT = 0.4;
/** Chưa có dữ liệu nào về miền này: bắt đầu ở giữa dải "Vừa sức". */
export const MASTERY_DEFAULT = 65;
export const SUPPORT_BELOW = 55;
export const STRETCH_FROM = 80;
/** Trọng số theo độ khó của câu đầu vào: dễ 1, vừa 2, khó 3. */
export const DIAGNOSTIC_WEIGHTS: Record<number, number> = { 1: 1, 2: 2, 3: 3 };

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Trộn kết quả một buổi học vào mức hiện có. Chưa có mức nào thì lấy luôn kết quả buổi đó. */
export function blendMastery(previous: number | undefined | null, sessionScore: number) {
  if (previous === undefined || previous === null || !Number.isFinite(previous)) return clamp(sessionScore);
  return clamp(previous * (1 - MASTERY_NEW_WEIGHT) + sessionScore * MASTERY_NEW_WEIGHT);
}

export function bandForMastery(level: number): DifficultyBand {
  if (level < SUPPORT_BELOW) return "support";
  if (level >= STRETCH_FROM) return "stretch";
  return "core";
}

type DiagnosticItem = { domain: DomainId; difficulty: number };

/**
 * Mức khởi đầu của từng miền từ bài đầu vào, có tính độ khó:
 * chỉ đúng câu dễ → Gỡ nút, đúng câu dễ và vừa → Vừa sức, đúng cả câu khó → Bứt phá.
 */
export function diagnosticMastery(questions: DiagnosticItem[], correctness: boolean[]): MasteryMap {
  const earned = Object.fromEntries(MASTERY_DOMAINS.map((domain) => [domain, 0])) as MasteryMap;
  const possible = Object.fromEntries(MASTERY_DOMAINS.map((domain) => [domain, 0])) as MasteryMap;
  questions.forEach((question, index) => {
    const weight = DIAGNOSTIC_WEIGHTS[question.difficulty] ?? 1;
    possible[question.domain] += weight;
    if (correctness[index]) earned[question.domain] += weight;
  });
  return Object.fromEntries(MASTERY_DOMAINS.map((domain) => [domain, possible[domain] ? clamp((earned[domain] / possible[domain]) * 100) : MASTERY_DEFAULT])) as MasteryMap;
}

type SessionLike = { finishedAt?: unknown; autonomy?: unknown };
type RecordLike = { autonomy?: unknown; bestAutonomy?: unknown; sessions?: unknown };
type DiagnosticLike = { scores?: Partial<Record<DomainId, { percent?: unknown }>> } | null | undefined;

function sessionsOf(record: RecordLike): { finishedAt: string; autonomy: number }[] {
  if (!Array.isArray(record.sessions)) return [];
  return (record.sessions as SessionLike[])
    .filter((session) => session && typeof session === "object" && Number.isFinite(Number(session.autonomy)))
    .map((session) => ({ finishedAt: typeof session.finishedAt === "string" ? session.finishedAt : "", autonomy: Number(session.autonomy) }));
}

/** Mức tự lực trượt của MỘT nhiệm vụ, tính lại từ các buổi đã lưu (hồ sơ cũ chỉ lưu mức cao nhất). */
export function replayRecordAutonomy(record: RecordLike) {
  const sessions = sessionsOf(record);
  const stored = Number(record.autonomy);
  if (!sessions.length) return Number.isFinite(stored) ? clamp(stored) : 0;
  return sessions.reduce<number | undefined>((level, session) => blendMastery(level, session.autonomy), undefined) ?? 0;
}

/**
 * Dựng lại mức thành thạo theo miền cho hồ sơ chưa có trường `mastery`:
 * bắt đầu từ bài đầu vào rồi lần lượt trộn mọi buổi học đã lưu theo thứ tự thời gian.
 */
export function rebuildMastery(diagnostic: DiagnosticLike, missionRecords: Record<string, RecordLike> | undefined): MasteryMap {
  const result = {} as MasteryMap;
  for (const domain of MASTERY_DOMAINS) {
    const percent = Number(diagnostic?.scores?.[domain]?.percent);
    let level: number | undefined = Number.isFinite(percent) ? clamp(percent) : undefined;
    const events: { finishedAt: string; autonomy: number }[] = [];
    Object.entries(missionRecords ?? {}).forEach(([missionId, record]) => {
      if (!record || typeof record !== "object" || missionId.split("-")[0] !== domain) return;
      const sessions = sessionsOf(record);
      if (sessions.length) events.push(...sessions);
      else if (Number.isFinite(Number(record.autonomy))) events.push({ finishedAt: "", autonomy: Number(record.autonomy) });
    });
    events.sort((left, right) => left.finishedAt.localeCompare(right.finishedAt));
    events.forEach((event) => { level = blendMastery(level, event.autonomy); });
    result[domain] = level ?? MASTERY_DEFAULT;
  }
  return result;
}

/** Đọc `mastery` đã lưu; miền nào thiếu hoặc hỏng thì dựng lại từ dữ liệu khác của hồ sơ. */
export function normalizeMastery(raw: unknown, diagnostic: DiagnosticLike, missionRecords: Record<string, RecordLike> | undefined): MasteryMap {
  const rebuilt = rebuildMastery(diagnostic, missionRecords);
  if (!raw || typeof raw !== "object") return rebuilt;
  const saved = raw as Partial<Record<DomainId, unknown>>;
  return Object.fromEntries(MASTERY_DOMAINS.map((domain) => {
    const value = Number(saved[domain]);
    return [domain, saved[domain] !== undefined && saved[domain] !== null && Number.isFinite(value) ? clamp(value) : rebuilt[domain]];
  })) as MasteryMap;
}

/** Miền yếu nhất trước — dùng để gợi ý nhiệm vụ tự chọn (thứ tự 36 tuần thì cố định). */
export function domainsByNeed(mastery: MasteryMap): DomainId[] {
  return [...MASTERY_DOMAINS].sort((left, right) => mastery[left] - mastery[right] || MASTERY_DOMAINS.indexOf(left) - MASTERY_DOMAINS.indexOf(right));
}
