// Ảnh chụp lúc bắt đầu một buổi học nhiệm vụ.
// - Phiên bản bài luyện được cố định suốt buổi: khi buổi học hoàn thành, completedCount tăng,
//   nhưng màn kết quả vẫn phải nói về đúng phiên bản con vừa làm.
// - Số tia sáng lúc bắt đầu được giữ lại để màn kết quả hiện số tia sáng THỰC nhận.

type RecordLike = { completedCount?: number; autonomy?: number; reflection?: string };
type SkillRecordLike = { streak: number; needsReview: boolean };

export type MissionSessionStart = {
  missionId: string;
  completedCount: number;
  autonomy: number;
  sparkPoints: number;
};

export type SparkProfileLike = {
  diagnostic: unknown;
  missionRecords: Record<string, RecordLike>;
  enrichmentCompleted: string[];
  skillLabRecords: Record<string, SkillRecordLike>;
  sparkBonus: number;
};

export const SPARKS_PER_SESSION = 120;
export const SPARKS_PER_REFLECTION = 20;
export const SPARKS_PER_OPEN_TASK = 80;

/** Tổng tia sáng của một hồ sơ (một công thức duy nhất cho tiêu đề, góc phụ huynh và màn kết quả). */
export function sparkPointsOf(profile: SparkProfileLike) {
  const records = Object.values(profile.missionRecords);
  const sessions = records.reduce((sum, record) => sum + (record.completedCount ?? 0), 0);
  const reflections = records.filter((record) => (record.reflection ?? "").trim()).length;
  const mastered = Object.values(profile.skillLabRecords).filter((record) => record.streak >= 2 && !record.needsReview).length;
  return (profile.diagnostic ? 60 : 0) + sessions * SPARKS_PER_SESSION + reflections * SPARKS_PER_REFLECTION
    + profile.enrichmentCompleted.length * SPARKS_PER_OPEN_TASK + mastered * 15 + profile.sparkBonus;
}

export function beginMissionSession(missionId: string, record: RecordLike | undefined, sparkPoints: number): MissionSessionStart {
  return { missionId, completedCount: record?.completedCount ?? 0, autonomy: record?.autonomy ?? 0, sparkPoints };
}

/** Số lần hoàn thành và mức tự lực dùng để chọn phiên bản: lấy từ ảnh chụp đầu buổi nếu đang trong buổi học đó. */
export function editionInputs(session: MissionSessionStart | null, missionId: string, record: RecordLike | undefined) {
  if (session && session.missionId === missionId) return { completedCount: session.completedCount, autonomy: session.autonomy };
  return { completedCount: record?.completedCount ?? 0, autonomy: record?.autonomy ?? 0 };
}

/** Tia sáng thực nhận trong buổi học (không bao giờ âm). */
export function sessionSparkGain(session: MissionSessionStart | null, sparkPointsNow: number) {
  return session ? Math.max(0, sparkPointsNow - session.sparkPoints) : SPARKS_PER_SESSION;
}
