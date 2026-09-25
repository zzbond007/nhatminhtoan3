// dino-collection-engine.ts
// Lớp logic thuần (pure functions) cho hệ thống trứng khủng long.
// Không phụ thuộc React/UI — page.tsx gọi các hàm record*/award* khi con hoàn thành
// nhiệm vụ, bài toán mở hoặc chạm mốc số ngày học.

import type { DomainId } from "../content";
import type { DifficultyBand } from "../mission-variants";
import { DINO_SPECIES, getSpeciesByDomainSlot, getSpeciesById, type DinoSpecies } from "./dino-species";

export type EggRarity = "thuong" | "hiem" | "huyen-thoai" | "dac-biet";
export type DinoStage = "trung" | "con-non" | "thieu-nien" | "truong-thanh";
export type DinoSlot = DinoSpecies["slotInDomain"];

export const SHARDS_TO_HATCH = 4;
/** Mốc tổng số ngày học (không cần liên tiếp) để nở một trứng Đặc biệt. */
export const DINO_SEASONAL_MILESTONES = [7, 30, 60] as const;
export const DINO_STAGES: DinoStage[] = ["trung", "con-non", "thieu-nien", "truong-thanh"];
export const EGG_RARITIES: EggRarity[] = ["thuong", "hiem", "huyen-thoai", "dac-biet"];
export const DINO_STAGE_LABELS: Record<DinoStage, string> = {
  trung: "Trứng đang ấp",
  "con-non": "Khủng long con",
  "thieu-nien": "Thiếu niên",
  "truong-thanh": "Trưởng thành",
};
export const EGG_RARITY_LABELS: Record<EggRarity, string> = {
  thuong: "Thường",
  hiem: "Hiếm",
  "huyen-thoai": "Huyền thoại",
  "dac-biet": "Đặc biệt",
};

/** Kết quả của MỘT lần hoàn thành phiên bản nhiệm vụ — lấy từ completeMission() trong page.tsx. */
export interface MissionCompletionResult {
  band: DifficultyBand;        // MissionEdition.difficulty: support = Gỡ nút, core = Vừa sức, stretch = Bứt phá
  maxHintDepth: number;        // tầng gợi ý sâu nhất đã mở trong buổi (0–3), như MissionRecord.maxHintDepth
  usedTwoStrategies: boolean;  // bước "Nhiều cách" — con và người lớn đánh dấu đã giải bằng cả hai cách
  // Phản tư không tính vào mảnh trứng: bé chưa tự đánh chữ được nên không thưởng theo độ dài lời viết.
}

export interface DinoProgress {
  domain: DomainId;
  slotInDomain: DinoSlot;
  shards: number;               // 0–3 khi đang là trứng, reset về 0 sau khi nở
  stage: DinoStage;
  rarity: EggRarity | null;     // null cho tới khi nở
  timesDomainRevisited: number; // số lần nhiệm vụ này được hoàn thành lại sau khi nở (phục vụ tiến hoá)
}

/** Bộ sưu tập lưu trong LearningProfile, khoá theo DinoSpecies.id. */
export type DinoCollection = Record<string, DinoProgress>;

export interface DinoMissionOutcome {
  speciesId: string;
  shardsEarned: number;
  justHatched: boolean;
  evolvedTo: DinoStage | null;
  progress: DinoProgress;
}

type MissionRef = { domain: DomainId; sequence: number };

/** Mỗi nhiệm vụ (miền + chặng 1–6) ứng đúng một loài: DeepMission.sequence chính là slotInDomain. */
export function resolveDinoForMission(mission: MissionRef): DinoSpecies | undefined {
  return getSpeciesByDomainSlot(mission.domain, mission.sequence);
}

/** Tính số mảnh trứng nhận được từ MỘT lần hoàn thành nhiệm vụ. */
export function calculateShardsEarned(result: MissionCompletionResult): number {
  let shards = result.band === "stretch" || result.maxHintDepth <= 1 ? 2 : 1;
  if (result.usedTwoStrategies) shards += 1;
  return shards;
}

/** Cập nhật tiến trình của một loài sau một lần hoàn thành nhiệm vụ.
 *  Trứng nở trong một phiên bản Bứt phá sẽ có độ hiếm Hiếm.
 *  Trả về tiến trình mới + cờ báo "vừa nở trứng" để UI có thể chạy hiệu ứng. */
export function applyMissionCompletion(
  progress: DinoProgress,
  result: MissionCompletionResult,
): { progress: DinoProgress; justHatched: boolean } {
  const earned = calculateShardsEarned(result);
  const isButPha = result.band === "stretch";

  if (progress.stage === "trung") {
    const newShards = Math.min(progress.shards + earned, SHARDS_TO_HATCH);
    if (newShards >= SHARDS_TO_HATCH) {
      return {
        progress: { ...progress, shards: 0, stage: "con-non", rarity: isButPha ? "hiem" : "thuong" },
        justHatched: true,
      };
    }
    return { progress: { ...progress, shards: newShards }, justHatched: false };
  }

  // Đã nở rồi — lần hoàn thành này góp phần tiến hoá khi chủ đề quay lại ở vòng xoắn ốc sau.
  return {
    progress: {
      ...progress,
      timesDomainRevisited: progress.timesDomainRevisited + 1,
      stage: nextStage(progress.stage, isButPha, progress.timesDomainRevisited + 1),
    },
    justHatched: false,
  };
}

function nextStage(current: DinoStage, isButPha: boolean, revisitCount: number): DinoStage {
  if (current === "con-non" && revisitCount >= 1) return "thieu-nien";
  if (current === "thieu-nien" && isButPha) return "truong-thanh";
  return current;
}

/** Ghi một lần hoàn thành nhiệm vụ vào bộ sưu tập. Không đổi `collection` đầu vào. */
export function recordMissionForDino(
  collection: DinoCollection,
  mission: MissionRef,
  result: MissionCompletionResult,
): { collection: DinoCollection; outcome: DinoMissionOutcome | null } {
  const species = resolveDinoForMission(mission);
  if (!species) return { collection, outcome: null };
  const previous = collection[species.id] ?? createInitialProgress(species.domain, species.slotInDomain);
  const { progress, justHatched } = applyMissionCompletion(previous, result);
  return {
    collection: { ...collection, [species.id]: progress },
    outcome: {
      speciesId: species.id,
      shardsEarned: calculateShardsEarned(result),
      justHatched,
      evolvedTo: previous.stage !== "trung" && progress.stage !== previous.stage ? progress.stage : null,
      progress,
    },
  };
}

/** Dựng lại bộ sưu tập từ lịch sử nhiệm vụ đã làm trước khi có Đảo Khủng Long. */
export function replayMissionHistory(history: Array<{ mission: MissionRef; results: MissionCompletionResult[] }>): DinoCollection {
  return history.reduce(
    (collection, entry) => entry.results.reduce((current, result) => recordMissionForDino(current, entry.mission, result).collection, collection),
    {} as DinoCollection,
  );
}

/** Nở tức thì (độ hiếm Huyền thoại). */
export function hatchLegendary(progress: DinoProgress): DinoProgress {
  return { ...progress, shards: 0, stage: "con-non", rarity: "huyen-thoai" };
}

/** Nở đặc biệt theo mốc số ngày học. */
export function hatchSeasonal(progress: DinoProgress): DinoProgress {
  return { ...progress, shards: 0, stage: "con-non", rarity: "dac-biet" };
}

function isUnhatched(collection: DinoCollection, species: DinoSpecies) {
  return (collection[species.id]?.stage ?? "trung") === "trung";
}

function hatchSpecies(
  collection: DinoCollection,
  species: DinoSpecies,
  hatch: (progress: DinoProgress) => DinoProgress,
): { collection: DinoCollection; outcome: DinoMissionOutcome } {
  const progress = hatch(collection[species.id] ?? createInitialProgress(species.domain, species.slotInDomain));
  return {
    collection: { ...collection, [species.id]: progress },
    outcome: { speciesId: species.id, shardsEarned: 0, justHatched: true, evolvedTo: null, progress },
  };
}

/** Bài toán mở: nở ngay trứng của nhiệm vụ gắn với tuần đó; nếu trứng ấy đã nở thì
 *  chọn trứng chưa nở đầu tiên cùng miền. Không có trứng nào thì không thay đổi. */
export function awardLegendaryEgg(
  collection: DinoCollection,
  target: { domain: DomainId; sequence?: number },
): { collection: DinoCollection; outcome: DinoMissionOutcome | null } {
  const preferred = target.sequence ? resolveDinoForMission({ domain: target.domain, sequence: target.sequence }) : undefined;
  const species = preferred && isUnhatched(collection, preferred)
    ? preferred
    : DINO_SPECIES.filter((item) => item.domain === target.domain).sort((a, b) => a.slotInDomain - b.slotInDomain).find((item) => isUnhatched(collection, item));
  if (!species) return { collection, outcome: null };
  return hatchSpecies(collection, species, hatchLegendary);
}

/** Các mốc ngày học vừa đạt nhưng chưa được thưởng. */
export function pendingSeasonalMilestones(learningDays: number, awarded: number[]): number[] {
  return DINO_SEASONAL_MILESTONES.filter((milestone) => learningDays >= milestone && !awarded.includes(milestone));
}

/** Mốc ngày học: nở một trứng chưa nở, chọn cố định theo mốc để kết quả lặp lại được. */
export function awardSeasonalEgg(
  collection: DinoCollection,
  milestone: number,
): { collection: DinoCollection; outcome: DinoMissionOutcome | null } {
  const start = (milestone * 5) % DINO_SPECIES.length;
  const ordered = [...DINO_SPECIES.slice(start), ...DINO_SPECIES.slice(0, start)];
  const species = ordered.find((item) => isUnhatched(collection, item));
  if (!species) return { collection, outcome: null };
  return hatchSpecies(collection, species, hatchSeasonal);
}

/** Thưởng mọi mốc ngày học còn nợ; mốc vẫn được ghi nhận dù đảo đã hết trứng để không thưởng lặp. */
export function awardSeasonalMilestones(
  collection: DinoCollection,
  learningDays: number,
  awarded: number[],
): { collection: DinoCollection; milestones: number[]; outcomes: DinoMissionOutcome[] } {
  const milestones = pendingSeasonalMilestones(learningDays, awarded);
  const outcomes: DinoMissionOutcome[] = [];
  const next = milestones.reduce((current, milestone) => {
    const award = awardSeasonalEgg(current, milestone);
    if (award.outcome) outcomes.push(award.outcome);
    return award.collection;
  }, collection);
  return { collection: next, milestones, outcomes };
}

export function createInitialProgress(domain: DomainId, slotInDomain: DinoSlot): DinoProgress {
  return { domain, slotInDomain, shards: 0, stage: "trung", rarity: null, timesDomainRevisited: 0 };
}

/** Đọc lại bộ sưu tập từ hồ sơ đã lưu / tệp sao lưu; bỏ mọi mục không hợp lệ. */
export function normalizeDinoCollection(raw: unknown): DinoCollection {
  const collection: DinoCollection = {};
  if (!raw || typeof raw !== "object") return collection;
  Object.entries(raw).forEach(([id, value]) => {
    const species = getSpeciesById(id);
    if (!species || !value || typeof value !== "object") return;
    const candidate = value as Partial<DinoProgress>;
    const stage = DINO_STAGES.includes(candidate.stage as DinoStage) ? candidate.stage as DinoStage : "trung";
    const rarity = stage !== "trung" && EGG_RARITIES.includes(candidate.rarity as EggRarity) ? candidate.rarity as EggRarity : stage === "trung" ? null : "thuong";
    collection[id] = {
      domain: species.domain,
      slotInDomain: species.slotInDomain,
      shards: stage === "trung" ? Math.max(0, Math.min(SHARDS_TO_HATCH - 1, Math.floor(Number(candidate.shards) || 0))) : 0,
      stage,
      rarity,
      timesDomainRevisited: Math.max(0, Math.floor(Number(candidate.timesDomainRevisited) || 0)),
    };
  });
  return collection;
}

export function summarizeDinoIsland(collection: DinoCollection) {
  const entries = Object.values(collection);
  return {
    total: DINO_SPECIES.length,
    hatched: entries.filter((progress) => progress.stage !== "trung").length,
    warming: entries.filter((progress) => progress.stage === "trung" && progress.shards > 0).length,
    grown: entries.filter((progress) => progress.stage === "truong-thanh").length,
  };
}

export function validateDinoSpecies() {
  const errors: string[] = [];
  const ids = new Set<string>();
  DINO_SPECIES.forEach((species) => {
    if (ids.has(species.id)) errors.push(`${species.id}: mã loài bị trùng.`);
    ids.add(species.id);
    if (!species.name.trim() || !species.genus.trim() || !species.funFact.trim()) errors.push(`${species.id}: thiếu tên hoặc thông tin.`);
  });
  const domains = [...new Set(DINO_SPECIES.map((species) => species.domain))];
  if (domains.length !== 6) errors.push(`Cần đúng 6 miền, hiện có ${domains.length}.`);
  domains.forEach((domain) => {
    const slots = DINO_SPECIES.filter((species) => species.domain === domain).map((species) => species.slotInDomain).sort();
    if (slots.join(",") !== "1,2,3,4,5,6") errors.push(`${domain}: cần đủ 6 vị trí 1–6, hiện có ${slots.join(",")}.`);
  });
  return errors;
}
