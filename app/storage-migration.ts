// Tương thích ngược · migrateStorageData()
// Hồ sơ vẫn nằm ở khoá "math-raccoon-learning-v11" (không đổi khoá để bản cũ của ứng dụng vẫn đọc được
// nếu phụ huynh quay về). Hàm này:
//   1. tìm hồ sơ ở khoá hiện tại hoặc các khoá cũ v10 → v3 và chép sang khoá hiện tại (không xoá khoá cũ);
//   2. trước lần nâng cấp đầu tiên, cất một bản sao nguyên văn vào STORAGE_BACKUP_KEY để có đường lui;
//   3. bổ sung các trường mới với giá trị mặc định an toàn (Tia sáng thưởng, trạng thái nhận thức, khiên hóa thạch);
//   4. gieo trạng thái nhận thức từ dữ liệu cũ (câu phòng luyện cần ôn, điểm vướng trong nhiệm vụ)
//      để Phòng Luyện Xoắn Ốc có bài ngay từ ngày đầu nâng cấp.
// Không bao giờ ném lỗi: dữ liệu hỏng → trả về null và giữ nguyên localStorage.

import { cognitiveKey, REVIEW_DELAY_MS, type CognitiveMap } from "./spiral-engine";
import type { DomainId } from "./content";
import type { SkillLabStrandId } from "./skill-lab";

export const STORAGE_KEY = "math-raccoon-learning-v11";
export const LEGACY_STORAGE_KEYS = ["math-raccoon-learning-v10", "math-raccoon-learning-v9", "math-raccoon-learning-v8", "math-raccoon-learning-v7", "math-raccoon-learning-v6", "math-raccoon-learning-v5", "math-raccoon-learning-v4", "math-raccoon-learning-v3"];
export const STORAGE_SCHEMA_KEY = "math-raccoon-storage-schema";
export const STORAGE_BACKUP_KEY = "math-raccoon-backup-before-v12";
export const STORAGE_SCHEMA = 12;

type StorageLike = Pick<Storage, "getItem" | "setItem">;
type RawProfile = Record<string, unknown>;

const DOMAIN_IDS: DomainId[] = ["number", "calculation", "measurement", "geometry", "data", "word"];
const STRAND_PREFIX: Record<string, SkillLabStrandId> = {
  pv: "place-value", fr: "fractions", op: "operations", nt: "number-theory",
  lg: "logic", cb: "combinatorics", vs: "visual-spatial", en: "math-english",
};

function plusDay(iso: unknown) {
  const time = typeof iso === "string" ? new Date(iso).getTime() : NaN;
  return new Date((Number.isFinite(time) ? time : Date.now()) + REVIEW_DELAY_MS).toISOString();
}

/** Gieo bản đồ nhận thức từ hồ sơ trước v12 (chỉ chạy khi hồ sơ chưa có cognitiveStates). */
export function seedCognitiveStates(profile: RawProfile): CognitiveMap {
  const map: CognitiveMap = {};
  const labRecords = profile.skillLabRecords && typeof profile.skillLabRecords === "object" ? profile.skillLabRecords as Record<string, Record<string, unknown>> : {};
  Object.entries(labRecords).forEach(([questionId, record]) => {
    if (!record || typeof record !== "object" || !record.needsReview) return;
    const strand = STRAND_PREFIX[questionId.split("-")[0]];
    if (!strand) return;
    const attempts = Number(record.attempts) || 0;
    const correct = Number(record.correct) || 0;
    map[cognitiveKey(`lab:${strand}`, questionId)] = {
      topicId: `lab:${strand}`, skillTag: questionId, strand,
      masteryLevel: Math.min(5, Number(record.streak) || 0),
      lastAttemptDate: typeof record.lastAttemptAt === "string" ? record.lastAttemptAt : "",
      errorCount: Math.max(1, attempts - correct), consecutiveErrors: 0,
      needsReview: true, reviewDueAt: plusDay(record.lastAttemptAt),
    };
  });
  const missionRecords = profile.missionRecords && typeof profile.missionRecords === "object" ? profile.missionRecords as Record<string, Record<string, unknown>> : {};
  Object.entries(missionRecords).forEach(([missionId, record]) => {
    const domain = missionId.split("-")[0] as DomainId;
    if (!DOMAIN_IDS.includes(domain) || !record || !Array.isArray(record.focusNeeds)) return;
    record.focusNeeds.filter((tag): tag is string => typeof tag === "string" && tag.trim() !== "").slice(0, 4).forEach((tag) => {
      map[cognitiveKey(missionId, tag)] = {
        topicId: missionId, skillTag: tag.slice(0, 80), domain,
        masteryLevel: 1, lastAttemptDate: typeof record.completedAt === "string" ? record.completedAt : "",
        errorCount: 1, consecutiveErrors: 0, needsReview: true, reviewDueAt: plusDay(record.completedAt),
      };
    });
  });
  return map;
}

/** Nâng cấp dữ liệu thô của hồ sơ lên cấu trúc v12 (thuần, không đụng storage). */
export function upgradeProfileData(raw: RawProfile): RawProfile {
  return {
    ...raw,
    sparkBonus: Math.max(0, Math.floor(Number(raw.sparkBonus) || 0)),
    selfReliantBadges: Math.max(0, Math.floor(Number(raw.selfReliantBadges) || 0)),
    cognitiveStates: raw.cognitiveStates && typeof raw.cognitiveStates === "object" ? raw.cognitiveStates : seedCognitiveStates(raw),
    fossilShieldUses: Array.isArray(raw.fossilShieldUses) ? raw.fossilShieldUses : [],
  };
}

export function migrateStorageData(storage: StorageLike): RawProfile | null {
  let text: string | null = null;
  let sourceKey = STORAGE_KEY;
  try {
    text = storage.getItem(STORAGE_KEY);
    if (!text) {
      for (const key of LEGACY_STORAGE_KEYS) {
        text = storage.getItem(key);
        if (text) { sourceKey = key; break; }
      }
    }
  } catch {
    return null;
  }
  if (!text) return null;

  let raw: RawProfile;
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    raw = parsed as RawProfile;
  } catch {
    return null;
  }

  const schema = Number(safeGet(storage, STORAGE_SCHEMA_KEY)) || 0;
  if (schema >= STORAGE_SCHEMA && sourceKey === STORAGE_KEY) return upgradeProfileData(raw);

  // Lần đầu nâng cấp: giữ bản sao nguyên văn (chỉ ghi một lần, không đè bản sao cũ hơn).
  if (!safeGet(storage, STORAGE_BACKUP_KEY)) safeSet(storage, STORAGE_BACKUP_KEY, text);
  const upgraded = upgradeProfileData(raw);
  safeSet(storage, STORAGE_KEY, JSON.stringify(upgraded));
  safeSet(storage, STORAGE_SCHEMA_KEY, String(STORAGE_SCHEMA));
  return upgraded;
}

function safeGet(storage: StorageLike, key: string) {
  try { return storage.getItem(key); } catch { return null; }
}
function safeSet(storage: StorageLike, key: string, value: string) {
  try { storage.setItem(key, value); } catch { /* bộ nhớ đầy hoặc chế độ riêng tư: bỏ qua, vẫn dùng dữ liệu trong phiên */ }
}
