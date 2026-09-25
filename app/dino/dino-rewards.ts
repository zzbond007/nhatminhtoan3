// dino-rewards.ts
// Phần thưởng ngoài bộ 36 loài cơ bản: loài Hiếm/Huyền thoại độc lập, Trứng Bí Ẩn
// (thưởng theo khoảng thời gian ngẫu nhiên), trạm ẩn trên Hành trình, biến thể sắc màu
// khi đã sưu tầm hết, và Tổ ấm (chăm sóc bạn đồng hành).
// Hàm thuần: mọi yếu tố ngẫu nhiên được truyền vào dưới dạng số 0–1 để test lặp lại được.

import type { DinoStage, MissionCompletionResult } from "./dino-collection-engine";
import { DINO_RARE_SPECIES, getRareSpeciesById, type DinoRareSpecies } from "./dino-species";

export type RareSource = "but-pha" | "hai-cach" | "bai-toan-mo" | "trung-bi-an" | "tram-an";

export interface RareFind {
  rarity: DinoRareSpecies["rarity"];
  stage: DinoStage;
  growth: number;       // số buổi học đã đi cùng khi là bạn đồng hành
  source: RareSource;
  foundAt: string;
}
export type RareCollection = Record<string, RareFind>;

export interface MysteryEggState {
  sessionsSince: number; // số buổi học kể từ quả trứng bí ẩn gần nhất
  target: number;        // ẩn với trẻ: số buổi cần để trứng xuất hiện (3–7, chọn ngẫu nhiên)
  ready: boolean;        // trứng đang nằm chờ trên đảo
}

export type CareAction = "cho-an" | "vuot-ve" | "choi-dua";
export interface NestState {
  companionId: string | null;
  bond: Record<string, number>; // 0–100 cho từng bé
  careDay: string;              // ngày của các lượt chăm sóc bên dưới
  careDone: CareAction[];       // mỗi hành động một lần mỗi ngày
}

export const RARE_SOURCE_LABELS: Record<RareSource, string> = {
  "but-pha": "may mắn khi Bứt phá",
  "hai-cach": "may mắn khi giải hai cách",
  "bai-toan-mo": "may mắn từ bài toán mở",
  "trung-bi-an": "Trứng Bí Ẩn",
  "tram-an": "trạm ẩn trên Hành trình",
};
export const CARE_ACTIONS: Array<{ id: CareAction; label: string; bond: number }> = [
  { id: "cho-an", label: "Cho ăn", bond: 10 },
  { id: "vuot-ve", label: "Vuốt ve", bond: 8 },
  { id: "choi-dua", label: "Chơi đùa", bond: 12 },
];
export const MYSTERY_MIN_SESSIONS = 3;
export const MYSTERY_MAX_SESSIONS = 7;
/** Bạn đồng hành hiếm lớn lên sau số buổi học đi cùng này. */
export const RARE_GROWTH_THRESHOLDS = { "thieu-nien": 2, "truong-thanh": 5 } as const;
export const OPEN_TASK_RARE_CHANCE = 0.4;

export function createMysteryEgg(roll: number): MysteryEggState {
  return { sessionsSince: 0, target: nextMysteryTarget(roll), ready: false };
}

export function nextMysteryTarget(roll: number) {
  const span = MYSTERY_MAX_SESSIONS - MYSTERY_MIN_SESSIONS + 1;
  return MYSTERY_MIN_SESSIONS + Math.min(span - 1, Math.floor(Math.max(0, roll) * span));
}

/** Xác suất nhận loài hiếm sau một nhiệm vụ: chỉ khi Bứt phá hoặc giải hai cách. */
export function missionRareChance(result: Pick<MissionCompletionResult, "band" | "usedTwoStrategies">) {
  return (result.band === "stretch" ? 0.15 : 0) + (result.usedTwoStrategies ? 0.1 : 0);
}

function availableRandomRares(rares: RareCollection) {
  return DINO_RARE_SPECIES.filter((species) => species.pool === "ngau-nhien" && !rares[species.id]);
}

/** Chọn một loài hiếm chưa có. `legendaryRoll` nhỏ hơn ngưỡng thì ưu tiên Huyền thoại. */
export function pickRareSpecies(rares: RareCollection, pickRoll: number, legendaryRoll: number, legendaryBias = false) {
  const available = availableRandomRares(rares);
  if (!available.length) return undefined;
  const wantsLegend = legendaryRoll < (legendaryBias ? 0.35 : 0.15);
  const preferred = available.filter((species) => (species.rarity === "huyen-thoai") === wantsLegend);
  const pool = preferred.length ? preferred : available;
  return pool[Math.min(pool.length - 1, Math.floor(Math.max(0, pickRoll) * pool.length))];
}

export function addRareFind(rares: RareCollection, species: DinoRareSpecies, source: RareSource, now: string): RareCollection {
  if (rares[species.id]) return rares;
  return { ...rares, [species.id]: { rarity: species.rarity, stage: "con-non", growth: 0, source, foundAt: now } };
}

/** Thử vận may sau khi hoàn thành một hoạt động; trả về loài vừa tìm được (nếu có). */
export function rollRareFind(
  rares: RareCollection,
  chance: number,
  rolls: { chance: number; pick: number; legendary: number },
  source: RareSource,
  now: string,
): { rares: RareCollection; foundId: string | null } {
  if (chance <= 0 || rolls.chance >= chance) return { rares, foundId: null };
  const species = pickRareSpecies(rares, rolls.pick, rolls.legendary, source === "bai-toan-mo");
  if (!species) return { rares, foundId: null };
  return { rares: addRareFind(rares, species, source, now), foundId: species.id };
}

/** Mỗi buổi học hoàn thành đẩy Trứng Bí Ẩn tiến gần hơn; trẻ không biết trước khi nào trứng xuất hiện. */
export function advanceMysteryEgg(state: MysteryEggState): MysteryEggState {
  if (state.ready) return state;
  const sessionsSince = state.sessionsSince + 1;
  return { ...state, sessionsSince, ready: sessionsSince >= state.target };
}

/** Mở Trứng Bí Ẩn: nở một loài hiếm chưa có; hết loài thì tặng biến thể sắc màu cho một bé đã nở. */
export function openMysteryEgg(
  rares: RareCollection,
  shinies: string[],
  hatchedIds: string[],
  state: MysteryEggState,
  rolls: { pick: number; legendary: number; next: number },
  now: string,
): { rares: RareCollection; shinies: string[]; state: MysteryEggState; foundId: string | null; shinyId: string | null } {
  if (!state.ready) return { rares, shinies, state, foundId: null, shinyId: null };
  const nextState = { sessionsSince: 0, target: nextMysteryTarget(rolls.next), ready: false };
  const species = pickRareSpecies(rares, rolls.pick, rolls.legendary, true);
  if (species) return { rares: addRareFind(rares, species, "trung-bi-an", now), shinies, state: nextState, foundId: species.id, shinyId: null };
  const candidates = hatchedIds.filter((id) => !shinies.includes(id));
  const shinyId = candidates.length ? candidates[Math.min(candidates.length - 1, Math.floor(rolls.pick * candidates.length))] : null;
  return { rares, shinies: shinyId ? [...shinies, shinyId] : shinies, state: nextState, foundId: null, shinyId };
}

/** Trạm ẩn: mở khi tuần đó có ít nhất một phiên bản Bứt phá; nhận loài dành riêng cho trạm. */
export function branchSpeciesForWeek(week: number) {
  return DINO_RARE_SPECIES.find((species) => species.pool === "tram-an" && species.branchWeek === week);
}
export function claimBranchStation(rares: RareCollection, week: number, now: string): { rares: RareCollection; foundId: string | null } {
  const species = branchSpeciesForWeek(week);
  if (!species || rares[species.id]) return { rares, foundId: null };
  return { rares: addRareFind(rares, species, "tram-an", now), foundId: species.id };
}

function stageForGrowth(growth: number): DinoStage {
  if (growth >= RARE_GROWTH_THRESHOLDS["truong-thanh"]) return "truong-thanh";
  if (growth >= RARE_GROWTH_THRESHOLDS["thieu-nien"]) return "thieu-nien";
  return "con-non";
}

/** Bé hiếm đang là bạn đồng hành lớn thêm sau mỗi buổi học con hoàn thành. */
export function growRareCompanion(rares: RareCollection, companionId: string | null): RareCollection {
  if (!companionId || !rares[companionId]) return rares;
  const current = rares[companionId];
  const growth = current.growth + 1;
  return { ...rares, [companionId]: { ...current, growth, stage: stageForGrowth(growth) } };
}

export function createNest(): NestState {
  return { companionId: null, bond: {}, careDay: "", careDone: [] };
}

/** Chăm sóc bạn đồng hành: mỗi hành động được cộng gắn bó một lần mỗi ngày để không bấm liên tục. */
export function careForCompanion(nest: NestState, action: CareAction, today: string): { nest: NestState; gained: number } {
  if (!nest.companionId) return { nest, gained: 0 };
  const careDone = nest.careDay === today ? nest.careDone : [];
  if (careDone.includes(action)) return { nest: { ...nest, careDay: today, careDone }, gained: 0 };
  const current = nest.bond[nest.companionId] ?? 0;
  const bonus = CARE_ACTIONS.find((item) => item.id === action)?.bond ?? 0;
  const next = Math.min(100, current + bonus);
  return {
    nest: { ...nest, bond: { ...nest.bond, [nest.companionId]: next }, careDay: today, careDone: [...careDone, action] },
    gained: next - current,
  };
}

export function bondLabel(bond: number) {
  if (bond >= 70) return "Tri kỷ";
  if (bond >= 30) return "Thân thiết";
  return "Mới quen";
}

/** Đọc lại dữ liệu phần thưởng từ hồ sơ đã lưu; bỏ mục không hợp lệ. */
export function normalizeRareCollection(raw: unknown): RareCollection {
  const rares: RareCollection = {};
  if (!raw || typeof raw !== "object") return rares;
  const sources = Object.keys(RARE_SOURCE_LABELS) as RareSource[];
  Object.entries(raw).forEach(([id, value]) => {
    const species = getRareSpeciesById(id);
    if (!species || !value || typeof value !== "object") return;
    const candidate = value as Partial<RareFind>;
    const growth = Math.max(0, Math.floor(Number(candidate.growth) || 0));
    rares[id] = {
      rarity: species.rarity,
      growth,
      stage: stageForGrowth(growth),
      source: sources.includes(candidate.source as RareSource) ? candidate.source as RareSource : "trung-bi-an",
      foundAt: typeof candidate.foundAt === "string" ? candidate.foundAt : "",
    };
  });
  return rares;
}

export function normalizeMysteryEgg(raw: unknown, roll: number): MysteryEggState {
  if (!raw || typeof raw !== "object") return createMysteryEgg(roll);
  const candidate = raw as Partial<MysteryEggState>;
  const target = Math.floor(Number(candidate.target));
  return {
    sessionsSince: Math.max(0, Math.floor(Number(candidate.sessionsSince) || 0)),
    target: target >= MYSTERY_MIN_SESSIONS && target <= MYSTERY_MAX_SESSIONS ? target : nextMysteryTarget(roll),
    ready: Boolean(candidate.ready),
  };
}

export function normalizeNest(raw: unknown): NestState {
  if (!raw || typeof raw !== "object") return createNest();
  const candidate = raw as Partial<NestState>;
  const bond: Record<string, number> = {};
  if (candidate.bond && typeof candidate.bond === "object") {
    Object.entries(candidate.bond).forEach(([id, value]) => { bond[id] = Math.max(0, Math.min(100, Math.floor(Number(value) || 0))); });
  }
  const actions = CARE_ACTIONS.map((item) => item.id);
  return {
    companionId: typeof candidate.companionId === "string" ? candidate.companionId : null,
    bond,
    careDay: typeof candidate.careDay === "string" ? candidate.careDay : "",
    careDone: Array.isArray(candidate.careDone) ? candidate.careDone.filter((action): action is CareAction => actions.includes(action as CareAction)) : [],
  };
}
