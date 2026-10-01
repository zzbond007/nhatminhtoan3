// Bốn buổi trong tuần, bốn kiểu hoạt động (WEEKLY_RHYTHM trong year-plan.ts).
// Buổi được chọn theo số lần con đã hoàn thành nhiệm vụ của tuần:
//   0 → Buổi 1 · Khơi tò mò: Dự đoán → Học cụ → 2 trường hợp nhỏ → ghi thắc mắc (không có bước Chiến lược);
//   1 → Buổi 2 · Xưởng chiến lược: Bài mẫu → 2 câu, mỗi câu giải hai cách → so sánh;
//   2 → Buổi 3 · Phòng thử thách: 5 câu theo dải thích ứng (không Dự đoán, không Tương tác);
//   3 → Buổi 4 · Chuyển giao đời sống: 1 câu nhắc lại → 3 câu bối cảnh mới → giải thích;
//   ≥ 4 → ôn tập, dùng khuôn Buổi 3.
// Buổi 5 (bài toán mở) nằm ngoài nhiệm vụ, ở phòng bài toán mở.

import type { DeepMission, DeepQuestion } from "./curriculum";
import { createMissionEdition, difficultyLabel, makeQuestion, type DifficultyBand, type MissionEdition } from "./mission-variants";
import { SECOND_WAY_MIN_ANSWER } from "./second-strategy";
import { LIFE_TRANSFER } from "./variants/life-transfer";
import { WEEKLY_RHYTHM } from "./year-plan";

export type SessionKind = "curiosity" | "strategy" | "challenge" | "transfer" | "review";
export const SESSION_KINDS: SessionKind[] = ["curiosity", "strategy", "challenge", "transfer", "review"];
export type MissionStage = "predict" | "explore" | "strategies" | "practice" | "reflect" | "result";
/** Vai trò của câu trong buổi. `transfer` được tính riêng (như câu chuyển giao trước đây). */
export type QuestionRole = "case" | "practice" | "recall" | "transfer";
/** Cách thứ hai ở Buổi 2: viết phép tính khác, loại trừ phương án sai, hoặc kể bằng lời. */
export type TwoWayMode = "expression" | "eliminate" | "explain";

export type SessionQuestion = { question: DeepQuestion; role: QuestionRole; twoWay?: TwoWayMode };

export type SessionPlan = {
  kind: SessionKind;
  /** Buổi thứ mấy trong tuần (ôn tập dùng khuôn Buổi 3). */
  number: 1 | 2 | 3 | 4;
  label: string;
  /** Tiêu đề hiện cho con: "Buổi 2 · Xưởng chiến lược", hoặc "Ôn tập · Phòng thử thách". */
  title: string;
  description: string;
  stages: MissionStage[];
  stageLabels: Partial<Record<MissionStage, string>>;
  edition: MissionEdition;
  /** Mã phiên bản dùng để chống nhận thưởng hai lần. Buổi 3 giữ mã cũ để hồ sơ cũ không đổi nghĩa. */
  rewardId: string;
  band: DifficultyBand;
  bandLabel: string;
  questions: SessionQuestion[];
  /** Buổi Khơi tò mò dùng trường hợp nhỏ nên không đổi mức thành thạo. */
  countsTowardMastery: boolean;
  reflection: { eyebrow: string; stems: [string, string, string]; starters: string[] };
  /** Phần "giải hai cách" (không bắt buộc) ở bước phản tư. Buổi 2 làm ngay sau từng câu. */
  secondWayInReflect: boolean;
};

const RHYTHM = (session: 1 | 2 | 3 | 4) => WEEKLY_RHYTHM[session - 1];

/** Buổi theo số lần đã hoàn thành nhiệm vụ. */
export function sessionKindFor(completedCount: number): SessionKind {
  const count = Math.max(0, Math.floor(Number(completedCount) || 0));
  return count === 0 ? "curiosity" : count === 1 ? "strategy" : count === 2 ? "challenge" : count === 3 ? "transfer" : "review";
}

/** Liên kết /lesson/N: buổi 1–4 của tuần mở đúng kiểu buổi; buổi 5 là bài toán mở (trả về null). */
export function lessonSessionKind(indexInWeek: number): SessionKind | null {
  return (["curiosity", "strategy", "challenge", "transfer"] as const)[indexInWeek] ?? null;
}

/** Buổi dài nhất có 5 câu (Buổi 3 và ôn tập). */
export const SESSION_MAX_QUESTIONS = 5;

const STAGES_OF: Record<SessionKind, MissionStage[]> = {
  curiosity: ["predict", "explore", "practice", "reflect"],
  strategy: ["strategies", "practice", "reflect"],
  challenge: ["practice", "reflect"],
  transfer: ["practice", "reflect"],
  review: ["practice", "reflect"],
};

export function firstStageOf(kind: SessionKind): MissionStage {
  return STAGES_OF[kind][0];
}

export function normalizeSessionKind(value: unknown): SessionKind | undefined {
  return SESSION_KINDS.includes(value as SessionKind) ? value as SessionKind : undefined;
}

export function sessionNumber(kind: SessionKind): 1 | 2 | 3 | 4 {
  return kind === "curiosity" ? 1 : kind === "strategy" ? 2 : kind === "transfer" ? 4 : 3;
}

export function sessionLabel(kind: SessionKind) {
  return kind === "review" ? `Ôn tập · ${RHYTHM(3).label}` : RHYTHM(sessionNumber(kind)).label;
}

export const ROLE_LABELS: Record<QuestionRole, string> = {
  case: "Trường hợp nhỏ · thử để thấy quy luật",
  practice: "Luyện sâu · không lộ đáp án khi sai",
  recall: "Nhắc lại · ý tưởng của tuần",
  transfer: "Bối cảnh mới · mang ý tưởng đi xa",
};

/** Câu điền số có kết quả từ 10 trở lên: viết được một phép tính khác cho cùng kết quả. */
export function expressionEligible(question: Pick<DeepQuestion, "type" | "answer">) {
  return question.type === "number" && /^\d+$/.test(question.answer) && Number(question.answer) >= SECOND_WAY_MIN_ANSWER;
}

export function twoWayModeFor(question: DeepQuestion): TwoWayMode {
  if (expressionEligible(question)) return "expression";
  const distractors = (question.options ?? []).filter((option) => option !== question.answer);
  if (question.type === "choice" && distractors.length && distractors.every((option) => question.feedbackByAnswer?.[option])) return "eliminate";
  return "explain";
}

/** Buổi 2: hai câu, ưu tiên câu viết được phép tính thứ hai, rồi câu trắc nghiệm (loại trừ được). Giữ thứ tự gốc. */
export function pickStrategyQuestions(questions: DeepQuestion[]) {
  const rank = (question: DeepQuestion) => ({ expression: 0, eliminate: 1, explain: 2 })[twoWayModeFor(question)];
  const chosen = questions.map((question, index) => ({ question, index }))
    .sort((a, b) => rank(a.question) - rank(b.question) || a.index - b.index)
    .slice(0, 2)
    .sort((a, b) => a.index - b.index);
  return chosen.map(({ question }) => question);
}

/** Hai câu đời sống của nhiệm vụ, tạo theo cùng quy ước với bộ sinh đề (dải Gỡ nút có sơ đồ mở sẵn). */
export function lifeTransferQuestions(missionId: string, band: DifficultyBand): DeepQuestion[] {
  const inputs = LIFE_TRANSFER[missionId];
  if (!inputs) return [];
  return inputs.map((input, index) => makeQuestion(`${missionId}-doi-song-${index + 1}`, input, band));
}

const REFLECTIONS: Record<SessionKind, SessionPlan["reflection"]> = {
  curiosity: {
    eyebrow: "Ghi thắc mắc · câu hỏi của con quan trọng",
    stems: ["Sau khi thử, con đang thắc mắc điều gì?", "Nếu đổi một con số, con đoán điều gì sẽ xảy ra?", "Dự đoán lúc đầu của con có đứng vững không?"],
    starters: ["Con muốn biết vì sao lại như vậy.", "Nếu số lớn hơn thì sao?", "Có cách nào nhanh hơn không?", "Dự đoán của con đã đúng.", "Con đã đổi ý sau khi thử.", "Con muốn thử với số khác."],
  },
  strategy: {
    eyebrow: "So sánh hai cách",
    stems: ["Hai cách của con có cho cùng kết quả không?", "Cách nào nhanh hơn? Cách nào dễ kiểm tra hơn?", "Lần sau gặp bài giống vậy, con chọn cách nào? Vì sao?"],
    starters: ["Hai cách cho cùng một kết quả.", "Cách thứ nhất nhanh hơn.", "Cách thứ hai dễ kiểm tra hơn.", "Loại trừ giúp con chắc chắn hơn.", "Tách số giúp con tính nhẩm.", "Con muốn thử thêm cách khác."],
  },
  challenge: {
    eyebrow: "Phản tư · biến cách làm thành hiểu biết",
    stems: ["", "Lúc đầu con dự đoán gì, sau đó bằng chứng nào làm con đổi hoặc giữ ý kiến?", "Nếu dạy lại cho một bạn, con sẽ bắt đầu bằng câu hỏi nào?"],
    starters: ["Con tự làm được hết.", "Con cần gợi ý ở một câu.", "Con đã sửa được một lỗi sai.", "Con đã thử một cách khác.", "Lúc đầu con đoán chưa đúng.", "Con muốn làm lại câu khó nhất."],
  },
  transfer: {
    eyebrow: "Giải thích · ý tưởng đi được bao xa",
    stems: ["Ý tưởng nào con mang từ bài cũ sang bài mới?", "Ở nhà hay ngoài phố, con gặp bài toán giống vậy ở đâu?", "Con kiểm tra lại đáp án bằng cách nào?"],
    starters: ["Con dùng lại cách làm cũ.", "Bài mới chỉ đổi câu chuyện.", "Con kiểm tra bằng cách tính ngược.", "Con gặp bài này khi đi chợ.", "Con cần đọc kỹ dữ kiện hơn.", "Con tự làm được hết."],
  },
  review: { eyebrow: "", stems: ["", "", ""], starters: [] },
};
REFLECTIONS.review = REFLECTIONS.challenge;

const STAGE_LABELS: Record<SessionKind, Partial<Record<MissionStage, string>>> = {
  curiosity: { predict: "Dự đoán", explore: "Học cụ", practice: "Trường hợp nhỏ", reflect: "Thắc mắc" },
  strategy: { strategies: "Bài mẫu", practice: "Giải hai cách", reflect: "So sánh" },
  challenge: { practice: "Thử thách 5 câu", reflect: "Phản tư" },
  transfer: { practice: "Nhắc lại · bối cảnh mới", reflect: "Giải thích" },
  review: { practice: "Ôn 5 câu", reflect: "Phản tư" },
};

/** Mức thành thạo thấp nhất: buộc bộ sinh đề dùng dải Gỡ nút (số nhỏ, ít bước). */
const SMALL_CASE_MASTERY = 0;

export function buildSession(base: DeepMission, completedCount: number, mastery: number, kind: SessionKind = sessionKindFor(completedCount)): SessionPlan {
  const number = sessionNumber(kind);
  const adaptive = createMissionEdition(base, completedCount, mastery);
  const edition = kind === "curiosity" ? createMissionEdition(base, completedCount, SMALL_CASE_MASTERY) : adaptive;
  const all = [...edition.mission.deepPractice, edition.mission.transfer];
  let questions: SessionQuestion[];
  if (kind === "curiosity") {
    // Trường hợp nhỏ để khám phá sau học cụ: không mở sẵn sơ đồ, con tự nhìn ra cấu trúc.
    questions = edition.mission.deepPractice.slice(0, 2).map((question) => ({ question: { ...question, scaffold: undefined }, role: "case" }));
  } else if (kind === "strategy") {
    questions = pickStrategyQuestions(all).map((question) => ({ question, role: "practice", twoWay: twoWayModeFor(question) }));
  } else if (kind === "transfer") {
    // Câu nhắc lại phải khác khuôn với câu chuyển giao (ở dải Gỡ nút, câu chuyển giao có thể cùng khuôn với câu 1).
    const shape = (text: string) => text.replace(/^Tại [^,]+, /, "").replace(/\d+/g, "#").toLocaleLowerCase("vi");
    const recall = edition.mission.deepPractice.find((question) => shape(question.prompt) !== shape(edition.mission.transfer.prompt)) ?? edition.mission.deepPractice[0];
    questions = [
      { question: recall, role: "recall" },
      { question: edition.mission.transfer, role: "transfer" },
      ...lifeTransferQuestions(base.id, edition.difficulty).map((question): SessionQuestion => ({ question, role: "transfer" })),
    ];
  } else {
    questions = [
      ...edition.mission.deepPractice.map((question): SessionQuestion => ({ question, role: "practice" })),
      { question: edition.mission.transfer, role: "transfer" },
    ];
  }
  const stems = REFLECTIONS[kind].stems;
  return {
    kind,
    number,
    label: sessionLabel(kind),
    title: kind === "review" ? sessionLabel(kind) : `Buổi ${number} · ${sessionLabel(kind)}`,
    description: RHYTHM(number).description,
    stages: STAGES_OF[kind],
    stageLabels: STAGE_LABELS[kind],
    edition,
    rewardId: kind === "challenge" || kind === "review" ? edition.id : `${edition.id}-${kind}`,
    band: edition.difficulty,
    bandLabel: kind === "curiosity" ? "Trường hợp nhỏ" : difficultyLabel(edition.difficulty),
    questions,
    countsTowardMastery: kind !== "curiosity",
    reflection: { ...REFLECTIONS[kind], stems: kind === "challenge" || kind === "review" ? [base.reflection, stems[1], stems[2]] : stems },
    secondWayInReflect: kind === "challenge" || kind === "review" || kind === "transfer",
  };
}

export type SessionScore = { firstScore: number; autonomy: number; averageHintDepth: number; transferFirstTry: boolean; hasTransfer: boolean };

/**
 * Điểm của một buổi. Với Buổi 3 (4 câu luyện + 1 câu chuyển giao) cho đúng kết quả như công thức cũ:
 * 0,6 × điểm lần đầu + 0,2 × độc lập gợi ý + 0,2 × chuyển giao (100 nếu đúng ngay, 40 nếu chưa).
 */
export function scoreSession(roles: QuestionRole[], firstAttempts: (boolean | null)[], hintDepths: number[]): SessionScore {
  const rate = (indexes: number[]) => indexes.length ? indexes.filter((index) => firstAttempts[index] === true).length / indexes.length : 0;
  const transferIndexes = roles.map((role, index) => (role === "transfer" ? index : -1)).filter((index) => index >= 0);
  const practiceIndexes = roles.map((role, index) => (role === "transfer" ? -1 : index)).filter((index) => index >= 0);
  const hasTransfer = transferIndexes.length > 0;
  const firstScore = Math.round(rate(practiceIndexes.length ? practiceIndexes : transferIndexes) * 100);
  const depths = roles.map((_, index) => hintDepths[index] ?? 0);
  const averageHintDepth = depths.length ? depths.reduce((sum, depth) => sum + depth, 0) / depths.length : 0;
  const hintIndependence = Math.max(0, Math.round(100 - (averageHintDepth / 3) * 100));
  const transferRate = hasTransfer ? rate(transferIndexes) : firstScore / 100;
  const autonomy = Math.round(firstScore * .6 + hintIndependence * .2 + (40 + 60 * transferRate) * .2);
  return { firstScore, autonomy, averageHintDepth: Number(averageHintDepth.toFixed(2)), transferFirstTry: hasTransfer && transferRate === 1, hasTransfer };
}
