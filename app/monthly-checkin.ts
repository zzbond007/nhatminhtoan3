// Đánh giá Tháng: 9 câu sau mỗi 4 tuần học, so với lần trước (hoặc bài đánh giá đầu vào).
// Câu hỏi lấy từ bộ sinh phiên bản đã kiểm chứng (mission-variants) với số phiên bản riêng
// cho từng tháng, nên không trùng 18 câu đầu vào và khác nhau giữa các tháng.
// - 6 câu "vòng quanh": mỗi miền 1 câu chuyển giao, ở chặng cao nhất con đã tới trong miền đó.
// - 3 câu "trọng tâm": luyện sâu từ nhiệm vụ của 3 tuần đầu trong tháng.

import { DOMAINS, type DomainId } from "./content";
import { DEEP_MISSION_LIBRARY, type DeepMission, type DeepQuestion } from "./curriculum";
import { createMissionEdition } from "./mission-variants";
import { PROGRAM_MONTHS, YEAR_WEEKS } from "./year-plan";

export const CHECKIN_SIZE = 9;
export const WEEKS_PER_CHECKIN = 4;

export type CheckInItem = { id: string; domain: DomainId; kind: "vong-quanh" | "trong-tam"; question: DeepQuestion };
export type DomainTally = { correct: number; total: number };
export type CheckInResult = { month: number; finishedAt: string; correct: number; total: number; scores: Record<DomainId, DomainTally>; prompts: string[] };

/** Tháng cần đánh giá tiếp theo, hoặc null khi chưa đủ 4 tuần mới / đã xong cả 9 tháng. */
export function checkInDueMonth(completedWeeks: number, doneCount: number): number | null {
  const next = doneCount + 1;
  if (next > PROGRAM_MONTHS) return null;
  return completedWeeks >= next * WEEKS_PER_CHECKIN ? next : null;
}

/**
 * Lần lượt các câu có thể dùng: nhiệm vụ chính trước, rồi các chặng gần nhất cùng miền;
 * với mỗi nhiệm vụ đi qua các phiên bản (bắt đầu từ phiên bản riêng của tháng) và các vị trí câu.
 */
function* candidates(mission: DeepMission, start: number, questionIndexes: number[]): Generator<DeepQuestion> {
  const sameDomain = [...DEEP_MISSION_LIBRARY[mission.domain]].sort((a, b) => Math.abs(a.sequence - mission.sequence) - Math.abs(b.sequence - mission.sequence));
  for (const source of sameDomain) {
    for (let offset = 0; offset < 12; offset += 1) {
      // autonomy 70 → mức Vừa sức; "số lần hoàn thành" giả định chỉ để chọn phiên bản.
      const edition = createMissionEdition(source, start + offset, 70);
      const questions = [...edition.mission.deepPractice, edition.mission.transfer];
      for (const questionIndex of questionIndexes) if (questions[questionIndex]) yield questions[questionIndex];
    }
  }
}

/** `asked`: các câu đã hỏi ở những lần Đánh giá Tháng trước, để không lặp lại. */
export function buildCheckIn(month: number, reachedSequence: Partial<Record<DomainId, number>>, asked: Iterable<string> = []): CheckInItem[] {
  const items: CheckInItem[] = [];
  const prompts = new Set<string>(asked);
  const push = (item: CheckInItem) => {
    if (prompts.has(item.question.prompt)) return false;
    prompts.add(item.question.prompt);
    items.push(item);
    return true;
  };
  DOMAINS.forEach((domain, index) => {
    const sequence = Math.min(6, Math.max(1, reachedSequence[domain.id] ?? 1));
    const mission = DEEP_MISSION_LIBRARY[domain.id][sequence - 1];
    const id = `checkin-${month}-${index + 1}`;
    for (const question of candidates(mission, month * 5 + 3, [4, 3, 2])) {
      if (push({ id, domain: domain.id, kind: "vong-quanh", question: { ...question, id } })) break;
    }
  });
  const monthWeeks = YEAR_WEEKS.slice((month - 1) * WEEKS_PER_CHECKIN, (month - 1) * WEEKS_PER_CHECKIN + 3);
  monthWeeks.forEach((week, index) => {
    const mission = Object.values(DEEP_MISSION_LIBRARY).flat().find((item) => item.id === week.missionId);
    if (!mission) return;
    const id = `checkin-${month}-${7 + index}`;
    for (const question of candidates(mission, month * 7 + 1, [1, 2, 3])) {
      if (push({ id, domain: mission.domain, kind: "trong-tam", question: { ...question, id } })) break;
    }
  });
  return items;
}

export function emptyTally(): Record<DomainId, DomainTally> {
  return Object.fromEntries(DOMAINS.map((domain) => [domain.id, { correct: 0, total: 0 }])) as Record<DomainId, DomainTally>;
}

export function scoreCheckIn(month: number, items: CheckInItem[], correctness: boolean[], finishedAt: string): CheckInResult {
  const scores = emptyTally();
  items.forEach((item, index) => {
    scores[item.domain].total += 1;
    if (correctness[index]) scores[item.domain].correct += 1;
  });
  const correct = correctness.filter(Boolean).length;
  return { month, finishedAt, correct, total: items.length, scores, prompts: items.map((item) => item.question.prompt) };
}

export function tallyPercent(tally: DomainTally | undefined) {
  return tally && tally.total ? Math.round((tally.correct / tally.total) * 100) : 0;
}

export function normalizeCheckIns(raw: unknown): CheckInResult[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry): CheckInResult[] => {
    if (!entry || typeof entry !== "object") return [];
    const value = entry as Partial<CheckInResult>;
    const month = Math.floor(Number(value.month));
    if (!(month >= 1 && month <= PROGRAM_MONTHS) || typeof value.finishedAt !== "string" || !value.scores) return [];
    const scores = emptyTally();
    DOMAINS.forEach((domain) => {
      const tally = (value.scores as Record<string, Partial<DomainTally>>)[domain.id];
      scores[domain.id] = { correct: Math.max(0, Math.floor(Number(tally?.correct) || 0)), total: Math.max(0, Math.floor(Number(tally?.total) || 0)) };
    });
    return [{ month, prompts: Array.isArray(value.prompts) ? value.prompts.filter((prompt): prompt is string => typeof prompt === "string") : [], finishedAt: value.finishedAt, correct: Math.max(0, Math.floor(Number(value.correct) || 0)), total: Math.max(0, Math.floor(Number(value.total) || 0)), scores }];
  }).sort((a, b) => a.month - b.month).filter((entry, index, list) => list.findIndex((other) => other.month === entry.month) === index);
}

/** 2–3 dòng gợi ý bằng lời thân thiện cho phụ huynh không chuyên toán. */
export function abilityInsights(
  scores: Record<DomainId, DomainTally>,
  domainName: (id: DomainId) => string,
  nextMissionTitle: (id: DomainId) => string,
): string[] {
  const ranked = DOMAINS.map((domain) => ({ id: domain.id, percent: tallyPercent(scores[domain.id]) })).sort((a, b) => b.percent - a.percent);
  const best = ranked[0];
  const weakest = ranked[ranked.length - 1];
  if (best.percent === weakest.percent && best.percent < 50) {
    return [
      "Lần này các câu còn khá thử thách với con—đó là tín hiệu tốt để chọn bài vừa sức hơn. 🦕",
      "Tuần tới hãy ôn lại các nhiệm vụ đã học và dùng gợi ý từng tầng; lần Đánh giá Tháng sau sẽ cho thấy thay đổi.",
      "Điểm này chỉ để chọn độ khó phù hợp, không để so sánh con với bạn khác.",
    ];
  }
  if (best.percent === weakest.percent) {
    return [
      "Sáu miền tư duy của con đang lớn đều nhau. 🦕",
      "Cứ đi theo Hành trình từng tuần; mỗi tháng làm Đánh giá Tháng 9 câu để thấy con tiến bộ.",
    ];
  }
  return [
    `Con rất mạnh về ${domainName(best.id)}! 🦕`,
    `Hãy thử thêm ${domainName(weakest.id)} nhé—bắt đầu từ nhiệm vụ “${nextMissionTitle(weakest.id)}”, dùng gợi ý từng tầng khi cần.`,
    "Điểm này chỉ để chọn độ khó phù hợp, không để so sánh con với bạn khác.",
  ];
}
