// Bộ kiểm định sư phạm (Giai đoạn 2 · đợt nội dung). Chặn triển khai khi:
// - gợi ý tầng 1 không phải câu hỏi, hoặc tầng 3 nêu thẳng đáp án;
// - một phương án nhiễu không có phản hồi riêng cho lỗi tư duy của nó;
// - ba dải khó chỉ khác nhau về số liệu mà không khác về cấu trúc;
// - bước Dự đoán dùng lựa chọn chung chung, không có nội dung toán;
// - bài mẫu trùng với bài Tương tác hoặc câu luyện;
// - nội dung vượt chương trình lớp 3 không được gắn nhãn và không có phần dẫn nhập.
import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  logLevel: "silent",
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true, watch: null, hmr: false },
});

after(async () => {
  await vite.close();
});

const { ALL_DEEP_MISSIONS } = await vite.ssrLoadModule("/app/curriculum.ts");
const { createMissionEdition, VARIANTS_PER_MISSION } = await vite.ssrLoadModule("/app/mission-variants.ts");
const BANDS = { support: 10, core: 70, stretch: 95 };

function editionsOf(mission, variant) {
  return Object.fromEntries(Object.entries(BANDS).map(([band, mastery]) => {
    const edition = createMissionEdition(mission, variant, mastery);
    assert.equal(edition.difficulty, band);
    return [band, [...edition.mission.deepPractice, edition.mission.transfer]];
  }));
}

function forEveryQuestion(visit) {
  for (const mission of ALL_DEEP_MISSIONS) {
    for (let variant = 0; variant < VARIANTS_PER_MISSION; variant += 1) {
      const bands = editionsOf(mission, variant);
      for (const [band, questions] of Object.entries(bands)) questions.forEach((question, index) => visit(question, { mission, variant, band, index }));
    }
  }
}

function report(errors, limit = Number(process.env.AUDIT_LIMIT ?? 25)) {
  if (!errors.length) return;
  assert.fail(`${errors.length} lỗi sư phạm:\n${errors.slice(0, limit).join("\n")}${errors.length > limit ? `\n… và ${errors.length - limit} lỗi khác` : ""}`);
}

const body = (hint) => hint.replace(/^Tầng \d[^:]*:\s*/, "");
const standalone = (text, number) => new RegExp(`(^|[^\\d])${number}([^\\d]|$)`).test(text);
/** Những đáp án là từ thông dụng (“Không”, “Có”…): xuất hiện trong gợi ý không có nghĩa là lộ đáp án. */
const COMMON_WORDS = new Set(["có", "không", "đúng", "sai", "chẵn", "lẻ", "đỏ", "xanh", "vàng", "mét", "như nhau", "diện tích"]);

test("gợi ý tầng 1 là câu hỏi định hướng; tầng 3 không nêu thẳng đáp án", () => {
  const errors = [];
  forEveryQuestion((question, { band }) => {
    const [first, , third] = question.hints.map(body);
    const id = `${question.id}-${band}`;
    if (!first.trim().endsWith("?")) errors.push(`${id}: tầng 1 phải là câu hỏi — “${first}”`);
    if (/^(Đáp án|Kết quả là|Chọn \S+\.$)/.test(third)) errors.push(`${id}: tầng 3 nêu thẳng đáp án — “${third}”`);
    const inPrompt = question.prompt.toLocaleLowerCase("vi").includes(question.answer.toLocaleLowerCase("vi"));
    if (question.type === "number") {
      // Tầng 3 được nhắc các số của đề và của phép tính dở dang, nhưng không được NÊU KẾT QUẢ:
      // "… = 36", "là 36", "được 36", "có 36 …", hay "đếm từ 1 đến 36" (đếm xong chính là đáp án).
      const stated = new RegExp(`(=|\\blà|được|\\bcó|\\bra|bằng)\\s+${question.answer}([^\\d]|$)|từ 1 đến ${question.answer}([^\\d]|$)`);
      if (stated.test(third) && !standalone(question.prompt, question.answer)) errors.push(`${id}: tầng 3 nêu kết quả ${question.answer} — “${third}”`);
    } else if (!inPrompt && !COMMON_WORDS.has(question.answer.toLocaleLowerCase("vi")) && third.toLocaleLowerCase("vi").includes(question.answer.toLocaleLowerCase("vi"))) {
      errors.push(`${id}: tầng 3 chứa đáp án “${question.answer}” — “${third}”`);
    }
    if (new Set(question.hints.map(body)).size !== 3) errors.push(`${id}: ba tầng gợi ý phải khác nhau.`);
  });
  report(errors);
});

test("mỗi đáp án sai hay gặp có phản hồi riêng cho lỗi tư duy của nó", async () => {
  const { wrongAnswerFeedback } = await vite.ssrLoadModule("/app/learning-feedback.ts");
  const errors = [];
  const feedbackTexts = new Set();
  forEveryQuestion((question, { band }) => {
    const id = `${question.id}-${band}`;
    const feedback = question.feedbackByAnswer ?? {};
    if (question.answer in feedback) errors.push(`${id}: đáp án đúng không được có phản hồi sai.`);
    if (question.type === "choice") {
      for (const option of question.options.filter((value) => value !== question.answer)) {
        if (!feedback[option]) errors.push(`${id}: phương án nhiễu “${option}” chưa có phản hồi riêng.`);
        else if (!wrongAnswerFeedback(question, option).includes(feedback[option])) errors.push(`${id}: phản hồi của “${option}” không được dùng.`);
      }
    } else {
      const keys = Object.keys(feedback);
      if (!keys.length) errors.push(`${id}: câu điền số cần ít nhất một đáp án sai hay gặp kèm phản hồi. Đề: ${question.prompt}`);
      for (const key of keys) {
        if (wrongAnswerFeedback(question, key) !== feedback[key]) errors.push(`${id}: phản hồi cho số ${key} không được dùng.`);
      }
      // Sai kiểu khác: phản hồi chung là câu hỏi định hướng của chính bài này.
      if (!wrongAnswerFeedback(question, "99999").includes(body(question.hints[0]))) errors.push(`${id}: phản hồi chung phải dẫn về câu hỏi định hướng của bài.`);
    }
    Object.values(feedback).forEach((text) => {
      feedbackTexts.add(text);
      if (text.trim().length < 15) errors.push(`${id}: phản hồi quá ngắn — “${text}”`);
    });
  });
  assert.ok(feedbackTexts.size > 300, `cần nhiều phản hồi khác nhau, hiện có ${feedbackTexts.size}`);
  report(errors);
});

test("ba dải khó khác nhau về cấu trúc, không chỉ về số liệu", () => {
  const errors = [];
  const total = (questions) => questions.reduce((sum, question) => sum + (question.steps ?? 1), 0);
  for (const mission of ALL_DEEP_MISSIONS) {
    for (let variant = 0; variant < VARIANTS_PER_MISSION; variant += 1) {
      const { support, core, stretch } = editionsOf(mission, variant);
      const id = `${mission.id}-v${variant + 1}`;
      // Gỡ nút: ít bước hơn và sơ đồ mở sẵn ở mọi câu.
      if (!(total(support) < total(core))) errors.push(`${id}: Gỡ nút (${total(support)} bước) phải ít bước hơn Vừa sức (${total(core)}).`);
      if (!(total(core) < total(stretch))) errors.push(`${id}: Bứt phá (${total(stretch)} bước) phải nhiều bước hơn Vừa sức (${total(core)}).`);
      if (support.some((question) => !question.scaffold)) errors.push(`${id}: Gỡ nút phải mở sẵn sơ đồ ở mọi câu.`);
      if ([...core, ...stretch].some((question) => question.scaffold)) errors.push(`${id}: chỉ Gỡ nút mới mở sẵn sơ đồ.`);
      // Câu chuyển giao: 1 bước → nhiều bước hơn ở mỗi dải.
      const steps = [support, core, stretch].map((questions) => questions[4].steps ?? 1);
      if (!(steps[0] < steps[1] && steps[1] < steps[2])) errors.push(`${id}: câu chuyển giao cần số bước tăng dần theo dải, hiện là ${steps.join(" / ")}.`);
      if (new Set([support[4].prompt, core[4].prompt, stretch[4].prompt]).size !== 3) errors.push(`${id}: câu chuyển giao của ba dải phải là ba đề khác nhau.`);
      // Bứt phá: có đúng một câu chứa dữ kiện thừa, và lời giải nói rõ dữ kiện nào không cần dùng.
      const extra = stretch.filter((question) => question.extraData);
      if (extra.length !== 1) errors.push(`${id}: Bứt phá cần đúng một câu có dữ kiện thừa, hiện có ${extra.length}.`);
      else if (!/không cần dùng/.test(extra[0].explanation)) errors.push(`${id}: lời giải phải chỉ ra dữ kiện thừa.`);
      if ([...support, ...core].some((question) => question.extraData)) errors.push(`${id}: chỉ Bứt phá mới có dữ kiện thừa.`);
    }
  }
  report(errors);
});

test("Gỡ nút dùng số nhỏ hơn ở các miền tính toán", () => {
  // So số lớn nhất xuất hiện trong bốn câu luyện của mỗi phiên bản, lấy trung bình trên 12 phiên bản.
  const largest = (questions) => Math.max(0, ...questions.slice(0, 4).flatMap((question) => (question.prompt.replace(/(\d) (\d{3})/g, "$1$2").match(/\d+/g) ?? []).map(Number)));
  const errors = [];
  for (const mission of ALL_DEEP_MISSIONS.filter((item) => ["number", "calculation", "measurement"].includes(item.domain))) {
    let support = 0; let core = 0;
    for (let variant = 0; variant < VARIANTS_PER_MISSION; variant += 1) {
      const bands = editionsOf(mission, variant);
      support += largest(bands.support); core += largest(bands.core);
    }
    if (support > core) errors.push(`${mission.id}: số liệu Gỡ nút (trung bình ${Math.round(support / 12)}) lớn hơn Vừa sức (${Math.round(core / 12)}).`);
  }
  report(errors);
});

test("bước Dự đoán có hai nhận định toán học riêng cho từng nhiệm vụ", async () => {
  const { PREDICTIONS, PREDICTION_UNSURE } = await vite.ssrLoadModule("/app/predictions.ts");
  const errors = [];
  const seen = new Set();
  let answerFirst = 0;
  for (const mission of ALL_DEEP_MISSIONS) {
    const { options, answer, reveal } = mission.prediction;
    if (!PREDICTIONS[mission.id]) { errors.push(`${mission.id}: thiếu bộ dự đoán.`); continue; }
    if (options.length !== 3 || options[2] !== PREDICTION_UNSURE) errors.push(`${mission.id}: cần hai nhận định và lựa chọn “${PREDICTION_UNSURE}”.`);
    if (!answer || !options.slice(0, 2).includes(answer)) errors.push(`${mission.id}: đáp án dự đoán phải là một trong hai nhận định.`);
    if (options.some((option) => /Con đã có một dự đoán|Con nghĩ có hơn một cách/.test(option))) errors.push(`${mission.id}: còn dùng lựa chọn chung chung.`);
    if (options.slice(0, 2).some((option) => option.length < 6)) errors.push(`${mission.id}: nhận định quá ngắn để có nội dung toán.`);
    if (answer && reveal.includes(answer)) errors.push(`${mission.id}: lời dẫn sau khi ghim dự đoán không được nêu đáp án.`);
    const key = options.slice(0, 2).join(" | ");
    if (seen.has(key)) errors.push(`${mission.id}: bộ dự đoán trùng với nhiệm vụ khác.`);
    seen.add(key);
    if (options[0] === answer) answerFirst += 1;
  }
  assert.ok(answerFirst >= 12 && answerFirst <= 24, `nhận định đúng không được luôn đứng một chỗ (đứng đầu ${answerFirst}/36 lần)`);
  report(errors);
});

test("bài mẫu không trùng bài Tương tác và câu luyện", () => {
  const errors = [];
  const norm = (text) => text.toLocaleLowerCase("vi").replace(/\s+/g, " ").trim();
  const numbers = (text) => (text.match(/\d+/g) ?? []).join(",");
  for (const mission of ALL_DEEP_MISSIONS) {
    const model = mission.model;
    const others = [["bài Tương tác", mission.lab.prompt], ...mission.practice.map((question, index) => [`câu luyện ${index + 1}`, question.prompt])];
    for (const [name, prompt] of others) {
      if (norm(prompt) === norm(model.prompt)) errors.push(`${mission.id}: bài mẫu trùng ${name}.`);
      else if (mission.lab.type === "choice" && numbers(prompt) !== "" && numbers(prompt) === numbers(model.prompt)) errors.push(`${mission.id}: bài mẫu dùng cùng số liệu với ${name} — “${prompt}”`);
    }
    if (model.steps.length < 3) errors.push(`${mission.id}: bài mẫu cần ít nhất 3 bước.`);
    if (model.steps.some((step) => /Đổi một dữ kiện nhỏ và kiểm tra/.test(step))) errors.push(`${mission.id}: bài mẫu còn dùng bước chung chung.`);
    // Câu luyện đầu tiên của mỗi phiên bản cũng không được là bài mẫu.
    for (let variant = 0; variant < VARIANTS_PER_MISSION; variant += 1) {
      const first = createMissionEdition(mission, variant, 70).mission.deepPractice[0];
      if (norm(first.prompt).endsWith(norm(model.prompt))) errors.push(`${mission.id}-v${variant + 1}: câu luyện đầu tiên trùng bài mẫu.`);
    }
  }
  report(errors);
});

test("nội dung vượt lớp được gắn nhãn và có phần dẫn nhập", async () => {
  const { SKILL_LAB_QUESTIONS, STRAND_PRIMERS, isBeyondGrade } = await vite.ssrLoadModule("/app/skill-lab.ts");
  const errors = [];
  // Phân số tổng quát (tử số khác 1), phân số bằng nhau, ước và bội vượt chương trình lớp 3 (GDPT 2018).
  const beyondPattern = /(^|[^\d])[2-9]\/\d|phân số nào bằng|(^|[^\p{L}])bội([^\p{L}]|$)|(^|[^\p{L}])ước (của|số)|là ước([^\p{L}]|$)|fraction/iu;
  for (const question of SKILL_LAB_QUESTIONS) {
    const text = [question.prompt, question.englishPrompt ?? "", ...(question.options ?? []), ...question.hints].join(" ");
    const beyond = isBeyondGrade(question);
    if (beyondPattern.test(text) && !beyond) errors.push(`${question.id}: có nội dung vượt lớp nhưng chưa gắn nhãn — ${question.prompt}`);
    if (beyond && !STRAND_PRIMERS[question.beyondGrade]) errors.push(`${question.id}: nhãn vượt lớp “${question.beyondGrade}” chưa có phần dẫn nhập.`);
  }
  const flagged = SKILL_LAB_QUESTIONS.filter(isBeyondGrade);
  assert.ok(flagged.length >= 6, `cần gắn nhãn các câu vượt lớp, hiện có ${flagged.length}`);
  assert.ok(flagged.length < SKILL_LAB_QUESTIONS.length / 2, "không gắn nhãn tràn lan");
  for (const [topic, primer] of Object.entries(STRAND_PRIMERS)) {
    if (!primer.title || !primer.idea || !primer.example || primer.idea.length < 30) errors.push(`${topic}: phần dẫn nhập cần tiêu đề, ý chính và ví dụ.`);
    if (!flagged.some((question) => question.beyondGrade === topic)) errors.push(`${topic}: phần dẫn nhập không gắn với câu nào.`);
  }
  report(errors);
});

test("nhiệm vụ không dùng thuật ngữ vượt lớp (bội, ước, phân số tổng quát)", () => {
  const errors = [];
  forEveryQuestion((question, { band }) => {
    const text = [question.prompt, ...question.hints, question.explanation, ...(question.options ?? []), ...Object.values(question.feedbackByAnswer ?? {})].join(" ");
    if (/(^|[^\p{L}])bội([^\p{L}]|$)|(^|[^\p{L}])ước (của|số)|là ước([^\p{L}]|$)|\d+\/\d+|phân số/iu.test(text)) errors.push(`${question.id}-${band}: dùng thuật ngữ vượt lớp — ${text.slice(0, 120)}`);
  });
  report(errors);
});
