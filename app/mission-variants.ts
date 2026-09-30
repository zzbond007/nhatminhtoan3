// Bộ sinh phiên bản nhiệm vụ: 36 nhiệm vụ × 12 phiên bản × 3 dải khó.
// Nội dung từng miền nằm trong app/variants/*.ts; tệp này ghép chúng thành một MissionEdition.
import type { DomainId } from "./content";
import type { DeepMission, DeepQuestion, HintLadder } from "./curriculum";
import { shuffleById } from "./option-order";
import { bandForMastery, MASTERY_DEFAULT, type DifficultyBand } from "./mastery";
import { calculationQuestions } from "./variants/calculation";
import { dataQuestions } from "./variants/data";
import { geometryQuestions } from "./variants/geometry";
import { CONTEXTS, withExtra, type Q } from "./variants/kit";
import { measurementQuestions } from "./variants/measurement";
import { numberQuestions } from "./variants/number";
import { wordQuestions } from "./variants/word";

export const VARIANTS_PER_MISSION = 12;
/** Mỗi phiên bản có 4 câu luyện sâu và 1 câu chuyển giao (nhiệm vụ gốc chỉ có 3 câu luyện). */
export const PRACTICE_PER_EDITION = 4;

export type { DifficultyBand };

export type MissionEdition = {
  id: string;
  number: number;
  total: number;
  label: string;
  difficulty: DifficultyBand;
  difficultyLabel: string;
  thinkingLens: string;
  mission: DeepMission;
};

const THINKING_LENSES: Record<DomainId, string[]> = {
  number: ["Nhận ra và kiểm chứng quy luật", "Đếm có hệ thống", "Tìm điều không đổi", "Phát hiện dữ kiện nhiễu", "Suy luận theo chu kỳ", "Tạo và mô tả quy luật"],
  calculation: ["Biến đổi để tính nhẩm", "So sánh nhiều chiến lược", "Đi xuôi – đi ngược", "Giữ cân bằng", "Ước lượng để bắt lỗi", "Sáng tạo biểu thức"],
  measurement: ["Ước lượng và kiểm chứng", "Mô hình hóa giới hạn", "Tối ưu trong điều kiện", "Đọc tỉ lệ", "Lập lịch", "Ra quyết định theo ngân sách"],
  geometry: ["So sánh diện tích – chu vi", "Bảo toàn khi cắt ghép", "Đếm hình có trật tự", "Tưởng tượng không gian", "Lát kín", "Thiết kế tối ưu"],
  data: ["Phân biệt dữ liệu và kết luận", "Liệt kê mọi khả năng", "Đánh giá công bằng", "Đọc biểu đồ phản biện", "Thử nghiệm ngẫu nhiên", "Thiết kế khảo sát"],
  word: ["Suy luận ngược", "Giả sử rồi điều chỉnh", "Tìm nhiều nghiệm", "Đánh giá manh mối", "Thử – sửa có chiến lược", "Chứng minh không bỏ sót"],
};

function hints(ladder: Q["h"]): HintLadder {
  return [`Tầng 1: ${ladder[0]}`, `Tầng 2: ${ladder[1]}`, `Tầng 3: ${ladder[2]}`];
}

/** Giữ lại những phản hồi hợp lệ: khác đáp án, có nội dung, và (với câu trắc nghiệm) ứng với một lựa chọn thật. */
function feedbackFor(input: Q, answer: string, options: string[] | undefined) {
  // Câu điền số: chỉ giữ những đáp án sai mà bàn phím số nhập được (số tự nhiên).
  const entries = Object.entries(input.wrong ?? {}).filter(([key, text]) => key !== answer && text.trim() !== "" && (options ? options.includes(key) : /^\d+$/.test(key)));
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function makeQuestion(id: string, input: Q, band: DifficultyBand): DeepQuestion {
  const answer = String(input.answer);
  // Thứ tự lựa chọn phụ thuộc mã câu hỏi: cùng một câu luôn hiện cùng thứ tự.
  const options = input.options ? shuffleById(input.options.map(String), id) : undefined;
  return {
    id,
    prompt: input.prompt,
    type: input.type,
    answer,
    options,
    hint: input.h[0],
    hints: hints(input.h),
    explanation: input.why,
    challengeTag: input.tag,
    // Khi đáp án sai không thuộc lỗi đã biết, quay về câu hỏi định hướng riêng của bài.
    misconception: `Chưa khớp. ${input.h[0]}`,
    feedbackByAnswer: feedbackFor(input, answer, options),
    steps: input.steps ?? 1,
    extraData: input.extra || undefined,
    // Dải Gỡ nút: sơ đồ của tầng 2 được mở sẵn ngay dưới đề, không tính là dùng gợi ý.
    scaffold: band === "support" ? input.h[1] : undefined,
  };
}

function difficultyLabel(band: DifficultyBand) {
  return band === "support" ? "Gỡ nút" : band === "stretch" ? "Bứt phá" : "Vừa sức";
}

function generateQuestions(domain: DomainId, sequence: number, variant: number, band: DifficultyBand): Q[] {
  if (domain === "number") return numberQuestions(sequence, variant, band);
  if (domain === "calculation") return calculationQuestions(sequence, variant, band);
  if (domain === "measurement") return measurementQuestions(sequence, variant, band);
  if (domain === "geometry") return geometryQuestions(sequence, variant, band);
  if (domain === "data") return dataQuestions(sequence, variant, band);
  return wordQuestions(sequence, variant, band);
}

/** Dải Bứt phá: một câu luyện (ưu tiên câu điền số) mang thêm một dữ kiện thừa để con tự lọc. */
function addExtraData(questions: Q[], domain: DomainId, variant: number) {
  const practice = [1, 2, 3];
  const index = practice.find((position) => questions[position].type === "number") ?? practice[0];
  return questions.map((question, position) => (position === index ? withExtra(question, domain, variant) : question));
}

/**
 * `mastery`: mức thành thạo 0–100 của miền (xem mastery.ts). Dải khó theo mức này ngay từ buổi đầu tiên,
 * nên kết quả đánh giá đầu vào có tác dụng và dải có thể hạ xuống khi con gặp khó.
 */
export function createMissionEdition(base: DeepMission, completedCount = 0, mastery = MASTERY_DEFAULT): MissionEdition {
  const variant = ((completedCount % VARIANTS_PER_MISSION) + VARIANTS_PER_MISSION) % VARIANTS_PER_MISSION;
  const band = bandForMastery(mastery);
  const raw = generateQuestions(base.domain, base.sequence, variant, band);
  const shaped = band === "stretch" ? addExtraData(raw, base.domain, variant) : raw;
  const generated = shaped.map((input, index) => makeQuestion(
    `${base.id}-v${variant + 1}-q${index + 1}`,
    index === 0 ? { ...input, prompt: `Tại ${CONTEXTS[variant]}, ${input.prompt.charAt(0).toLocaleLowerCase("vi")}${input.prompt.slice(1)}` } : input,
    band,
  ));
  const mission: DeepMission = {
    ...base,
    deepPractice: generated.slice(0, PRACTICE_PER_EDITION),
    transfer: generated[PRACTICE_PER_EDITION],
  };
  return {
    id: `${base.id}-v${variant + 1}-${band}`,
    number: variant + 1,
    total: VARIANTS_PER_MISSION,
    label: `Phiên bản ${variant + 1}/${VARIANTS_PER_MISSION}`,
    difficulty: band,
    difficultyLabel: difficultyLabel(band),
    thinkingLens: THINKING_LENSES[base.domain][base.sequence - 1],
    mission,
  };
}

export function validateMissionVariants(missions: DeepMission[]) {
  const errors: string[] = [];
  for (const mission of missions) {
    const openingPrompts = new Set<string>();
    for (let completed = 0; completed < VARIANTS_PER_MISSION; completed += 1) {
      const edition = createMissionEdition(mission, completed, 70);
      const questions = [...edition.mission.deepPractice, edition.mission.transfer];
      if (questions.length !== 5) errors.push(`${edition.id}: cần 5 câu.`);
      openingPrompts.add(questions[0].prompt);
      questions.forEach((question) => {
        if (!question.prompt.trim() || !question.answer.trim()) errors.push(`${question.id}: thiếu đề hoặc đáp án.`);
        if (question.hints.length !== 3) errors.push(`${question.id}: cần 3 tầng gợi ý.`);
        if (question.type === "number" && (!/^\d+$/.test(question.answer) || Number(question.answer) > 100_000)) errors.push(`${question.id}: đáp án số phải là số tự nhiên trong phạm vi 100 000.`);
        if (question.type === "choice" && (!question.options?.includes(question.answer) || new Set(question.options).size !== question.options.length)) errors.push(`${question.id}: lựa chọn trùng nhau hoặc thiếu đáp án.`);
      });
    }
    if (openingPrompts.size !== VARIANTS_PER_MISSION) errors.push(`${mission.id}: câu mở đầu chưa tạo đủ ${VARIANTS_PER_MISSION} biến thể khác nhau.`);
  }
  return errors;
}
