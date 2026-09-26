// Module 5 · Động cơ luyện tập xoắn ốc.
// 1) Trạng thái nhận thức cho từng dạng bài: { topicId, skillTag, masteryLevel 0–5, lastAttemptDate, errorCount }.
// 2) Lặp lại ngắt quãng: làm sai → needsReview = true, đến hạn sau 24 giờ trong "Phòng Luyện Xoắn Ốc".
// 3) Bộ sinh biến thể đẳng cấu: giữ nguyên cấu trúc logic của đề, chỉ thay số liệu trong phạm vi lớp 3.
// 4) Sai 2 lần liên tiếp → hạ bậc giàn giáo: số nhỏ hơn và mở sẵn sơ đồ đoạn thẳng (bar model).
// Toàn bộ là hàm thuần (không đụng DOM/localStorage) để kiểm thử và tái tạo đúng từ hạt giống (seed).

import type { DomainId } from "./content";
import type { SkillLabStrandId } from "./skill-lab";

export const REVIEW_DELAY_MS = 24 * 60 * 60 * 1000;
export const MAX_MASTERY = 5;
export const LOWER_SCAFFOLD_AFTER = 2;

// ───────────────────────── Trạng thái nhận thức ─────────────────────────

export type CognitiveState = {
  topicId: string;
  skillTag: string;
  domain?: DomainId;
  strand?: SkillLabStrandId;
  masteryLevel: number;       // 0–5
  lastAttemptDate: string;    // ISO
  errorCount: number;         // tổng số lần sai
  consecutiveErrors: number;  // số lần sai liên tiếp gần nhất
  needsReview: boolean;
  reviewDueAt: string | null; // ISO; chỉ có ý nghĩa khi needsReview
};
export type CognitiveMap = Record<string, CognitiveState>;
export type CognitiveTarget = Pick<CognitiveState, "topicId" | "skillTag" | "domain" | "strand">;
export type AttemptSource = "practice" | "review";

export function cognitiveKey(topicId: string, skillTag: string) {
  return `${topicId}::${skillTag}`;
}

export function recordCognitiveAttempt(
  map: CognitiveMap,
  target: CognitiveTarget,
  attempt: { correct: boolean; hintDepth: number; now: string; source?: AttemptSource },
): CognitiveMap {
  const key = cognitiveKey(target.topicId, target.skillTag);
  const previous: CognitiveState = map[key] ?? {
    ...target, masteryLevel: 0, lastAttemptDate: attempt.now, errorCount: 0, consecutiveErrors: 0, needsReview: false, reviewDueAt: null,
  };
  const dueIn24h = new Date(new Date(attempt.now).getTime() + REVIEW_DELAY_MS).toISOString();
  let next: CognitiveState;
  if (!attempt.correct) {
    next = {
      ...previous,
      masteryLevel: Math.max(0, previous.masteryLevel - 1),
      errorCount: previous.errorCount + 1,
      consecutiveErrors: previous.consecutiveErrors + 1,
      needsReview: true,
      // Đã có lịch ôn sớm hơn thì giữ lịch cũ, không đẩy lùi mãi.
      reviewDueAt: previous.needsReview && previous.reviewDueAt && previous.reviewDueAt < dueIn24h ? previous.reviewDueAt : dueIn24h,
    };
  } else if (attempt.hintDepth >= 3) {
    // Đúng nhờ lời giải chi tiết: ghi nhận hoàn thành nhưng chưa vững → hẹn ôn sau 24 giờ.
    next = { ...previous, consecutiveErrors: 0, needsReview: true, reviewDueAt: previous.needsReview && previous.reviewDueAt ? previous.reviewDueAt : dueIn24h };
  } else {
    const gain = attempt.hintDepth <= 1 ? 1 : 0;
    const clearsReview = attempt.source === "review";
    next = {
      ...previous,
      masteryLevel: Math.min(MAX_MASTERY, previous.masteryLevel + gain),
      consecutiveErrors: 0,
      needsReview: clearsReview ? false : previous.needsReview,
      reviewDueAt: clearsReview ? null : previous.reviewDueAt,
    };
  }
  next.lastAttemptDate = attempt.now;
  next.domain = target.domain ?? previous.domain;
  next.strand = target.strand ?? previous.strand;
  return { ...map, [key]: next };
}

export function isDueForReview(state: CognitiveState, now: string) {
  return state.needsReview && Boolean(state.reviewDueAt) && state.reviewDueAt! <= now;
}

export function dueReviewStates(map: CognitiveMap, now: string) {
  return Object.values(map)
    .filter((state) => isDueForReview(state, now))
    .sort((a, b) => a.masteryLevel - b.masteryLevel || b.errorCount - a.errorCount || a.reviewDueAt!.localeCompare(b.reviewDueAt!));
}

export type ScaffoldLevel = "standard" | "lowered";
export function scaffoldLevelFor(state: Pick<CognitiveState, "consecutiveErrors">): ScaffoldLevel {
  return state.consecutiveErrors >= LOWER_SCAFFOLD_AFTER ? "lowered" : "standard";
}

export function normalizeCognitiveMap(raw: unknown): CognitiveMap {
  if (!raw || typeof raw !== "object") return {};
  const result: CognitiveMap = {};
  Object.values(raw as Record<string, unknown>).forEach((value) => {
    if (!value || typeof value !== "object") return;
    const item = value as Partial<CognitiveState>;
    if (typeof item.topicId !== "string" || typeof item.skillTag !== "string") return;
    const clamp = (n: unknown, max = Number.MAX_SAFE_INTEGER) => Math.max(0, Math.min(max, Math.floor(Number(n) || 0)));
    result[cognitiveKey(item.topicId, item.skillTag)] = {
      topicId: item.topicId,
      skillTag: item.skillTag.slice(0, 80),
      domain: item.domain,
      strand: item.strand,
      masteryLevel: clamp(item.masteryLevel, MAX_MASTERY),
      lastAttemptDate: typeof item.lastAttemptDate === "string" ? item.lastAttemptDate : "",
      errorCount: clamp(item.errorCount),
      consecutiveErrors: clamp(item.consecutiveErrors),
      needsReview: Boolean(item.needsReview),
      reviewDueAt: typeof item.reviewDueAt === "string" ? item.reviewDueAt : null,
    };
  });
  return result;
}

// ───────────────────────── Bộ sinh biến thể đẳng cấu ─────────────────────────

/** Bộ sinh số giả ngẫu nhiên có hạt giống (mulberry32): cùng seed → cùng đề, tiện kiểm thử và in lại. */
export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rng = () => number;
const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
const pick = <T,>(rng: Rng, items: readonly T[]) => items[Math.floor(rng() * items.length)];

/** Sơ đồ đoạn thẳng: mỗi hàng là một thanh gồm các đoạn; đoạn `unknown` hiện dấu "?". */
export type BarModel = {
  rows: { label: string; segments: { value: number; text?: string; unknown?: boolean }[] }[];
  bracket?: { text: string };
};

export type VariantQuestion = {
  id: string;
  templateId: string;
  skillTag: string;
  level: ScaffoldLevel;
  prompt: string;
  type: "number";
  answer: string;
  hints: [string, string, string];
  explanation: string;
  misconception: string;
  bar?: BarModel;
};

type Built = {
  vars: Record<string, string | number>;
  answer: number;
  hints: [string, string, string];
  explanation: string;
  misconception: string;
  bar?: BarModel;
};

export type VariantTemplate = {
  id: string;
  skillTag: string;
  domains: DomainId[];
  strands: SkillLabStrandId[];
  /** Mẫu đề với các ô {tên}; mọi biến thể dùng chung một mẫu nên cấu trúc logic không đổi. */
  text: string;
  build(rng: Rng, level: ScaffoldLevel): Built;
};

export function fillTemplate(text: string, vars: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => (name in vars ? String(vars[name]) : whole));
}

const BIPEDS = ["Khủng long bạo chúa", "Khủng long Velociraptor", "Khủng long mỏ vịt Parasaurolophus"] as const;
const QUADRUPEDS = ["Khủng long ba sừng", "Khủng long gai Stegosaurus", "Khủng long cổ dài"] as const;

export const VARIANT_TEMPLATES: VariantTemplate[] = [
  {
    id: "dino-legs",
    skillTag: "Chia theo nhóm bằng nhau",
    domains: ["calculation", "word"],
    strands: ["operations", "math-english"],
    text: "{dino} có {legs} chân. Một đàn {dino} có tổng cộng {total} chân. Hỏi đàn có bao nhiêu con?",
    build(rng, level) {
      const legs = pick(rng, [2, 4] as const);
      const dino = legs === 2 ? pick(rng, BIPEDS) : pick(rng, QUADRUPEDS);
      const count = level === "lowered" ? int(rng, 2, 5) : int(rng, 3, 9);
      const total = legs * count;
      return {
        vars: { dino, legs, total }, answer: count,
        hints: [
          `Mỗi con có ${legs} chân. Nếu cứ ${legs} chân là một con, ta cần tìm ${total} chân chia được thành mấy nhóm ${legs}?`,
          `Sơ đồ: ${total} chân chia thành các nhóm ${legs} chân. Tính ${total} : ${legs} = ?`,
          `${total} : ${legs} = ${count}. Vậy đàn có ${count} con (thử lại: ${count} × ${legs} = ${total}).`,
        ],
        explanation: `${total} : ${legs} = ${count} con.`,
        misconception: `Tổng số chân cần chia cho số chân của MỘT con, không nhân hay trừ.`,
        bar: { rows: [{ label: "Tổng chân", segments: Array.from({ length: count }, () => ({ value: legs, text: String(legs) })) }], bracket: { text: `${total} chân · mỗi ô là 1 con` } },
      };
    },
  },
  {
    id: "egg-groups",
    skillTag: "Nhân các nhóm bằng nhau",
    domains: ["calculation", "number"],
    strands: ["operations"],
    text: "Mỗi tổ khủng long có {per} quả trứng. Trên đảo có {groups} tổ như vậy. Hỏi có tất cả bao nhiêu quả trứng?",
    build(rng, level) {
      const per = level === "lowered" ? int(rng, 2, 5) : int(rng, 3, 9);
      const groups = level === "lowered" ? int(rng, 2, 5) : int(rng, 4, 9);
      return {
        vars: { per, groups }, answer: per * groups,
        hints: [
          `Có ${groups} tổ, tổ nào cũng có số trứng bằng nhau. Phép tính nào gộp nhanh các nhóm bằng nhau?`,
          `Sơ đồ: ${groups} đoạn, mỗi đoạn ${per}. Tính ${per} × ${groups} = ?`,
          `${per} × ${groups} = ${per * groups}. Có tất cả ${per * groups} quả trứng.`,
        ],
        explanation: `${per} × ${groups} = ${per * groups} quả trứng.`,
        misconception: "Các nhóm bằng nhau dùng phép nhân; cộng số trứng một tổ với số tổ là nhầm ý nghĩa.",
        bar: { rows: [{ label: "Trứng", segments: Array.from({ length: groups }, () => ({ value: per, text: String(per) })) }], bracket: { text: "? quả trứng" } },
      };
    },
  },
  {
    id: "fern-share",
    skillTag: "Chia đều",
    domains: ["calculation", "measurement"],
    strands: ["operations", "fractions"],
    text: "Có {total} chiếc lá dương xỉ chia đều cho {kids} bé khủng long. Hỏi mỗi bé được mấy chiếc lá?",
    build(rng, level) {
      const kids = level === "lowered" ? int(rng, 2, 4) : int(rng, 3, 9);
      const each = level === "lowered" ? int(rng, 2, 5) : int(rng, 4, 9);
      const total = kids * each;
      return {
        vars: { total, kids }, answer: each,
        hints: [
          `“Chia đều” nghĩa là mỗi bé nhận phần bằng nhau. Ta tìm một phần trong ${kids} phần bằng nhau.`,
          `Sơ đồ: thanh ${total} lá cắt thành ${kids} đoạn bằng nhau. Tính ${total} : ${kids} = ?`,
          `${total} : ${kids} = ${each}. Mỗi bé được ${each} chiếc lá.`,
        ],
        explanation: `${total} : ${kids} = ${each} chiếc lá.`,
        misconception: "Chia đều cho số bé, không trừ số bé khỏi số lá.",
        bar: { rows: [{ label: "Lá", segments: Array.from({ length: kids }, (_, index) => ({ value: each, unknown: index === 0 })) }], bracket: { text: `${total} chiếc lá` } },
      };
    },
  },
  {
    id: "sum-difference",
    skillTag: "Tổng – hiệu",
    domains: ["word", "number"],
    strands: ["logic"],
    text: "Hai bé khủng long hái được tổng cộng {sum} quả mọng. Bé lớn hái nhiều hơn bé nhỏ {diff} quả. Hỏi bé lớn hái được bao nhiêu quả?",
    build(rng, level) {
      const small = level === "lowered" ? int(rng, 3, 10) : int(rng, 12, 45);
      const diff = level === "lowered" ? int(rng, 2, 6) : int(rng, 4, 20);
      const big = small + diff;
      const sum = big + small;
      return {
        vars: { sum, diff }, answer: big,
        hints: [
          "Vẽ hai thanh: thanh bé lớn dài hơn thanh bé nhỏ một đoạn bằng hiệu. Nếu bỏ phần dài hơn đi thì hai thanh thế nào?",
          `Sơ đồ: (${sum} + ${diff}) là hai lần số của bé lớn. Tính (${sum} + ${diff}) : 2 = ?`,
          `(${sum} + ${diff}) : 2 = ${big}. Bé lớn hái ${big} quả, bé nhỏ hái ${small} quả (kiểm tra: ${big} + ${small} = ${sum}).`,
        ],
        explanation: `Số lớn = (tổng + hiệu) : 2 = (${sum} + ${diff}) : 2 = ${big}.`,
        misconception: "Chia đôi tổng chỉ đúng khi hai phần bằng nhau; ở đây phải bù hoặc bớt phần hiệu trước.",
        bar: {
          rows: [
            { label: "Bé lớn", segments: [{ value: small, unknown: true }, { value: diff, text: String(diff) }] },
            { label: "Bé nhỏ", segments: [{ value: small }] },
          ],
          bracket: { text: `Tổng ${sum} quả` },
        },
      };
    },
  },
  {
    id: "times-compare",
    skillTag: "Gấp một số lên nhiều lần",
    domains: ["word", "measurement"],
    strands: ["logic", "operations"],
    text: "Bé khủng long cổ dài cao {small} gang tay. Mẹ của bé cao gấp {times} lần bé. Hỏi mẹ cao bao nhiêu gang tay?",
    build(rng, level) {
      const small = level === "lowered" ? int(rng, 2, 5) : int(rng, 4, 9);
      const times = level === "lowered" ? int(rng, 2, 4) : int(rng, 3, 9);
      return {
        vars: { small, times }, answer: small * times,
        hints: [
          `“Gấp ${times} lần” nghĩa là chiều cao của mẹ bằng ${times} đoạn, mỗi đoạn dài bằng chiều cao của bé.`,
          `Sơ đồ: bé 1 đoạn ${small}, mẹ ${times} đoạn như thế. Tính ${small} × ${times} = ?`,
          `${small} × ${times} = ${small * times}. Mẹ cao ${small * times} gang tay.`,
        ],
        explanation: `${small} × ${times} = ${small * times} gang tay.`,
        misconception: `“Gấp ${times} lần” là nhân với ${times}, không phải cộng thêm ${times}.`,
        bar: {
          rows: [
            { label: "Bé", segments: [{ value: small, text: String(small) }] },
            { label: "Mẹ", segments: Array.from({ length: times }, () => ({ value: small })) },
          ],
          bracket: { text: "Mẹ: ? gang tay" },
        },
      };
    },
  },
  {
    id: "future-age",
    skillTag: "Tính ngược từ tương lai",
    domains: ["word"],
    strands: ["logic"],
    text: "{years} năm nữa bé khủng long ba sừng tròn {future} tuổi. Hỏi hiện nay bé bao nhiêu tuổi?",
    build(rng, level) {
      const now = level === "lowered" ? int(rng, 2, 6) : int(rng, 5, 15);
      const years = level === "lowered" ? int(rng, 1, 3) : int(rng, 3, 9);
      const future = now + years;
      return {
        vars: { years, future }, answer: now,
        hints: [
          "Tuổi trong tương lai = tuổi hiện nay + số năm. Muốn quay về hiện nay ta làm phép tính ngược nào?",
          `Sơ đồ: [hiện nay ?] + [${years} năm] = ${future}. Tính ${future} − ${years} = ?`,
          `${future} − ${years} = ${now}. Hiện nay bé ${now} tuổi.`,
        ],
        explanation: `${future} − ${years} = ${now} tuổi.`,
        misconception: "Đi ngược từ tương lai về hiện tại phải trừ số năm, không cộng thêm.",
        bar: { rows: [{ label: "Tuổi", segments: [{ value: now, unknown: true }, { value: years, text: `${years} năm` }] }], bracket: { text: `${future} tuổi` } },
      };
    },
  },
  {
    id: "egg-remainder",
    skillTag: "Phép chia có dư",
    domains: ["number", "calculation"],
    strands: ["number-theory"],
    text: "Có {total} quả trứng xếp vào các khay, mỗi khay {per} quả. Xếp được nhiều khay đầy nhất thì còn dư mấy quả trứng?",
    build(rng, level) {
      const per = level === "lowered" ? int(rng, 3, 5) : int(rng, 4, 9);
      const trays = level === "lowered" ? int(rng, 2, 4) : int(rng, 3, 9);
      const rest = int(rng, 1, per - 1);
      const total = per * trays + rest;
      return {
        vars: { total, per }, answer: rest,
        hints: [
          `Tìm số lớn nhất trong bảng nhân ${per} mà không vượt quá ${total}.`,
          `${per} × ${trays} = ${per * trays}. Tính ${total} − ${per * trays} = ?`,
          `${total} : ${per} = ${trays} (dư ${rest}). Còn dư ${rest} quả trứng.`,
        ],
        explanation: `${total} : ${per} = ${trays} dư ${rest}.`,
        misconception: "Đề hỏi số dư, không hỏi số khay; và số dư luôn nhỏ hơn số chia.",
        bar: { rows: [{ label: "Trứng", segments: [...Array.from({ length: trays }, () => ({ value: per, text: String(per) })), { value: rest, unknown: true }] }], bracket: { text: `${total} quả` } },
      };
    },
  },
  {
    id: "pen-perimeter",
    skillTag: "Chu vi hình chữ nhật",
    domains: ["geometry", "measurement"],
    strands: ["visual-spatial"],
    text: "Chuồng khủng long hình chữ nhật dài {length} m, rộng {width} m. Người ta rào xung quanh chuồng. Hỏi hàng rào dài bao nhiêu mét?",
    build(rng, level) {
      const length = level === "lowered" ? int(rng, 3, 8) : int(rng, 9, 35);
      const width = level === "lowered" ? int(rng, 2, length - 1) : int(rng, 4, length - 2);
      const perimeter = (length + width) * 2;
      return {
        vars: { length, width }, answer: perimeter,
        hints: [
          "Rào xung quanh là đi hết đường bao. Hình chữ nhật có mấy cạnh, những cạnh nào bằng nhau?",
          `Sơ đồ: dài + rộng = nửa vòng rào. Tính (${length} + ${width}) × 2 = ?`,
          `(${length} + ${width}) × 2 = ${perimeter}. Hàng rào dài ${perimeter} m.`,
        ],
        explanation: `Chu vi = (dài + rộng) × 2 = (${length} + ${width}) × 2 = ${perimeter} m.`,
        misconception: "Chu vi là đường bao (cộng các cạnh), không phải nhân dài với rộng (đó là diện tích).",
        bar: { rows: [{ label: "Nửa vòng", segments: [{ value: length, text: `${length} m` }, { value: width, text: `${width} m` }] }, { label: "Nửa còn lại", segments: [{ value: length, text: `${length} m` }, { value: width, text: `${width} m` }] }], bracket: { text: "Cả vòng rào: ? m" } },
      };
    },
  },
  {
    id: "fraction-of-herd",
    skillTag: "Tìm một phần mấy của một số",
    domains: ["measurement", "number"],
    strands: ["fractions"],
    text: "Một đàn có {total} con khủng long. 1/{parts} số con trong đàn là khủng long ăn thịt. Hỏi có bao nhiêu con ăn thịt?",
    build(rng, level) {
      const parts = level === "lowered" ? int(rng, 2, 3) : int(rng, 3, 9);
      const each = level === "lowered" ? int(rng, 2, 5) : int(rng, 3, 9);
      const total = parts * each;
      return {
        vars: { total, parts }, answer: each,
        hints: [
          `“1/${parts} số con” nghĩa là chia cả đàn thành ${parts} phần bằng nhau rồi lấy 1 phần.`,
          `Sơ đồ: thanh ${total} con cắt thành ${parts} đoạn. Tính ${total} : ${parts} = ?`,
          `${total} : ${parts} = ${each}. Có ${each} con ăn thịt.`,
        ],
        explanation: `1/${parts} của ${total} là ${total} : ${parts} = ${each}.`,
        misconception: `Tìm 1/${parts} của một số là chia cho ${parts}, không phải trừ đi ${parts}.`,
        bar: { rows: [{ label: "Cả đàn", segments: Array.from({ length: parts }, (_, index) => ({ value: each, unknown: index === 0 })) }], bracket: { text: `${total} con` } },
      };
    },
  },
  {
    id: "hat-scarf",
    skillTag: "Quy tắc nhân khi chọn",
    domains: ["data"],
    strands: ["combinatorics"],
    text: "Bé khủng long có {hats} chiếc mũ và {scarves} chiếc khăn khác nhau. Mỗi lần đi chơi bé đội 1 mũ và quàng 1 khăn. Hỏi có bao nhiêu cách chọn khác nhau?",
    build(rng, level) {
      const hats = level === "lowered" ? int(rng, 2, 3) : int(rng, 3, 6);
      const scarves = level === "lowered" ? int(rng, 2, 3) : int(rng, 3, 7);
      return {
        vars: { hats, scarves }, answer: hats * scarves,
        hints: [
          "Thử giữ nguyên một chiếc mũ: chiếc mũ đó đi được với mấy chiếc khăn?",
          `Mỗi mũ ghép với ${scarves} khăn, có ${hats} mũ. Tính ${hats} × ${scarves} = ?`,
          `${hats} × ${scarves} = ${hats * scarves} cách chọn.`,
        ],
        explanation: `${hats} × ${scarves} = ${hats * scarves} cách.`,
        misconception: "Chọn một món từ mỗi nhóm thì nhân số lựa chọn, không cộng.",
        bar: { rows: Array.from({ length: hats }, (_, index) => ({ label: `Mũ ${index + 1}`, segments: Array.from({ length: scarves }, () => ({ value: 1 })) })), bracket: { text: "Mỗi ô là một cách" } },
      };
    },
  },
  {
    id: "step-pattern",
    skillTag: "Quy luật dãy số cách đều",
    domains: ["number"],
    strands: ["place-value", "number-theory"],
    text: "Bé khủng long nhảy trên các phiến đá đánh số {a}, {b}, {c}, {d}, … Hỏi phiến đá tiếp theo mang số mấy?",
    build(rng, level) {
      const step = level === "lowered" ? pick(rng, [2, 5, 10] as const) : int(rng, 3, 9);
      const start = level === "lowered" ? int(rng, 1, 10) : int(rng, 10, 60);
      const [a, b, c, d] = [0, 1, 2, 3].map((index) => start + index * step);
      return {
        vars: { a, b, c, d }, answer: d + step,
        hints: [
          "So sánh hai số đứng cạnh nhau: số sau hơn số trước bao nhiêu? Có luôn như vậy không?",
          `Mỗi bước cộng ${step}: ${a} → ${b} → ${c} → ${d} → ? Tính ${d} + ${step} = ?`,
          `${d} + ${step} = ${d + step}. Phiến đá tiếp theo là ${d + step}.`,
        ],
        explanation: `Dãy tăng đều ${step} đơn vị nên số tiếp theo là ${d + step}.`,
        misconception: "Cần kiểm tra quy luật trên nhiều cặp số, không chỉ hai số cuối.",
      };
    },
  },
  {
    id: "order-of-ops",
    skillTag: "Thứ tự thực hiện phép tính",
    domains: ["calculation"],
    strands: ["operations"],
    text: "Bé khủng long tính biểu thức {a} + {b} × {c}. Hỏi kết quả đúng là bao nhiêu?",
    build(rng, level) {
      const a = level === "lowered" ? int(rng, 2, 10) : int(rng, 10, 90);
      const b = level === "lowered" ? int(rng, 2, 4) : int(rng, 3, 9);
      const c = level === "lowered" ? int(rng, 2, 5) : int(rng, 3, 9);
      return {
        vars: { a, b, c }, answer: a + b * c,
        hints: [
          "Trong biểu thức có cả cộng và nhân, không có ngoặc. Phép tính nào được làm trước?",
          `Nhân trước: ${b} × ${c} = ?; sau đó ${a} + (kết quả) = ?`,
          `${b} × ${c} = ${b * c}; ${a} + ${b * c} = ${a + b * c}.`,
        ],
        explanation: `Nhân trước, cộng sau: ${a} + ${b * c} = ${a + b * c}.`,
        misconception: `Nếu cộng ${a} + ${b} trước sẽ ra ${(a + b) * c}; phép nhân phải làm trước phép cộng.`,
      };
    },
  },
];

/** Chọn mẫu phù hợp với trạng thái: ưu tiên trùng skillTag, rồi trùng mảng phòng luyện, rồi trùng miền. */
export function templatesForState(state: Pick<CognitiveState, "skillTag" | "domain" | "strand">) {
  const exact = VARIANT_TEMPLATES.filter((template) => template.skillTag === state.skillTag);
  if (exact.length) return exact;
  const byStrand = state.strand ? VARIANT_TEMPLATES.filter((template) => template.strands.includes(state.strand!)) : [];
  if (byStrand.length) return byStrand;
  const byDomain = state.domain ? VARIANT_TEMPLATES.filter((template) => template.domains.includes(state.domain!)) : [];
  return byDomain.length ? byDomain : VARIANT_TEMPLATES;
}

/** Sinh một biến thể đẳng cấu từ mẫu: cùng seed + cùng mức → cùng đề. */
export function generateVariant(template: VariantTemplate, seed: number, level: ScaffoldLevel = "standard"): VariantQuestion {
  const built = template.build(seededRandom(seed), level);
  return {
    id: `${template.id}-${level === "lowered" ? "L" : "S"}-${seed >>> 0}`,
    templateId: template.id,
    skillTag: template.skillTag,
    level,
    prompt: fillTemplate(template.text, built.vars),
    type: "number",
    answer: String(built.answer),
    hints: built.hints,
    explanation: built.explanation,
    misconception: built.misconception,
    bar: built.bar,
  };
}

export type SpiralReviewItem = { sourceKey: string; source: CognitiveTarget; question: VariantQuestion };

/**
 * Lập "Phòng Luyện Xoắn Ốc": mỗi dạng đến hạn ôn nhận tối đa 2 biến thể số liệu mới.
 * Dạng đang sai liên tiếp ≥ 2 lần được hạ bậc (số nhỏ, mở sẵn sơ đồ).
 */
export function buildSpiralReviewSet(map: CognitiveMap, now: string, seed: number, count = 6): SpiralReviewItem[] {
  const due = dueReviewStates(map, now);
  const items: SpiralReviewItem[] = [];
  for (let round = 0; round < 2 && items.length < count; round += 1) {
    due.forEach((state, index) => {
      if (items.length >= count) return;
      const templates = templatesForState(state);
      const template = templates[(seed + index + round) % templates.length];
      const question = generateVariant(template, seed * 131 + index * 17 + round * 7919, scaffoldLevelFor(state));
      items.push({ sourceKey: cognitiveKey(state.topicId, state.skillTag), source: { topicId: state.topicId, skillTag: state.skillTag, domain: state.domain, strand: state.strand }, question });
    });
  }
  return items;
}
