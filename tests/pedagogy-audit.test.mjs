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

const { lifeTransferQuestions } = await vite.ssrLoadModule("/app/session-plan.ts");
/** Câu bối cảnh đời sống của Buổi 4 (hai câu mỗi nhiệm vụ), ở cả ba dải. */
function forEveryLifeQuestion(visit) {
  for (const mission of ALL_DEEP_MISSIONS) {
    for (const band of Object.keys(BANDS)) lifeTransferQuestions(mission.id, band).forEach((question, index) => visit(question, { mission, variant: 0, band, index }));
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
  const visit = (question, { band }) => {
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
  };
  forEveryQuestion(visit);
  forEveryLifeQuestion(visit);
  report(errors);
});

test("mỗi đáp án sai hay gặp có phản hồi riêng cho lỗi tư duy của nó", async () => {
  const { wrongAnswerFeedback } = await vite.ssrLoadModule("/app/learning-feedback.ts");
  const errors = [];
  const feedbackTexts = new Set();
  const visit = (question, { band }) => {
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
  };
  forEveryQuestion(visit);
  forEveryLifeQuestion(visit);
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

// ───────────────────────── Đợt trải nghiệm: bốn buổi trong tuần và học cụ ─────────────────────────

test("bốn buổi trong tuần khác nhau đúng như WEEKLY_RHYTHM", async () => {
  const { buildSession } = await vite.ssrLoadModule("/app/session-plan.ts");
  const errors = [];
  for (const mission of ALL_DEEP_MISSIONS) {
    for (const mastery of Object.values(BANDS)) {
      for (let count = 0; count < 6; count += 1) {
        const plan = buildSession(mission, count, mastery);
        const id = `${mission.id}-lan${count + 1}-${mastery}`;
        const roles = plan.questions.map((item) => item.role);
        const prompts = plan.questions.map((item) => item.question.prompt);
        if (new Set(prompts).size !== prompts.length) errors.push(`${id}: câu trong buổi bị trùng.`);
        if (count === 0) {
          if (plan.kind !== "curiosity" || plan.stages.join() !== "predict,explore,practice,reflect") errors.push(`${id}: Buổi 1 phải là Dự đoán → Học cụ → trường hợp nhỏ → thắc mắc.`);
          if (roles.join() !== "case,case") errors.push(`${id}: Buổi 1 cần đúng 2 trường hợp nhỏ.`);
          if (plan.band !== "support" || plan.questions.some((item) => item.question.scaffold)) errors.push(`${id}: trường hợp nhỏ lấy từ dải Gỡ nút và không mở sẵn sơ đồ.`);
          if (plan.countsTowardMastery) errors.push(`${id}: Buổi 1 không được đổi mức thành thạo.`);
        } else if (count === 1) {
          if (plan.kind !== "strategy" || plan.stages.join() !== "strategies,practice,reflect") errors.push(`${id}: Buổi 2 phải là Bài mẫu → giải hai cách → so sánh.`);
          if (plan.questions.length !== 2 || plan.questions.some((item) => !item.twoWay)) errors.push(`${id}: Buổi 2 cần 2 câu, câu nào cũng có cách thứ hai.`);
        } else if (count === 3) {
          if (plan.kind !== "transfer" || plan.stages.join() !== "practice,reflect") errors.push(`${id}: Buổi 4 sai khuôn.`);
          if (roles.join() !== "recall,transfer,transfer,transfer") errors.push(`${id}: Buổi 4 cần 1 câu nhắc lại và 3 câu bối cảnh mới, hiện là ${roles.join()}.`);
        } else {
          // Buổi 3 và ôn tập (từ lần thứ 5): 5 câu theo dải thích ứng, không Dự đoán, không Tương tác.
          if (plan.stages.join() !== "practice,reflect") errors.push(`${id}: Phòng thử thách không có Dự đoán hay Tương tác.`);
          if (plan.questions.length !== 5) errors.push(`${id}: Phòng thử thách cần 5 câu.`);
          if (plan.kind !== (count === 2 ? "challenge" : "review")) errors.push(`${id}: lần ${count + 1} phải là ${count === 2 ? "Buổi 3" : "ôn tập"}.`);
        }
        if (count !== 0 && plan.stages.includes("strategies") !== (count === 1)) errors.push(`${id}: chỉ Buổi 2 có bước Bài mẫu.`);
        if (plan.stages.includes("predict") !== (count === 0) || plan.stages.includes("explore") !== (count === 0)) errors.push(`${id}: chỉ Buổi 1 có Dự đoán và Tương tác.`);
        if (plan.reflection.stems.some((stem) => !stem.trim()) || plan.reflection.starters.length < 4) errors.push(`${id}: thiếu câu phản tư riêng của buổi.`);
      }
    }
  }
  report(errors);
});

test("Buổi 2: cách thứ hai của mỗi câu làm được thật", async () => {
  const { buildSession, expressionEligible } = await vite.ssrLoadModule("/app/session-plan.ts");
  const { checkSecondWay } = await vite.ssrLoadModule("/app/second-strategy.ts");
  const errors = [];
  const modes = { expression: 0, eliminate: 0, explain: 0 };
  for (const mission of ALL_DEEP_MISSIONS) {
    for (const mastery of Object.values(BANDS)) {
      for (let variant = 0; variant < VARIANTS_PER_MISSION; variant += 1) {
        // Lần hoàn thành thứ 2 (+12k) luôn là Buổi 2; phần dư chọn phiên bản.
        const plan = buildSession(mission, 1 + variant, mastery, "strategy");
        for (const { question, twoWay } of plan.questions) {
          modes[twoWay] += 1;
          if (twoWay === "expression") {
            if (!expressionEligible(question)) errors.push(`${question.id}: câu không viết được phép tính thứ hai.`);
            // Luôn có ít nhất một phép tính khác hợp lệ (ví dụ tách thành tổng hai số).
            const answer = Number(question.answer);
            if (!checkSecondWay(`${answer - 4} + 4`, answer).ok) errors.push(`${question.id}: bộ kiểm cách thứ hai từ chối một phép tính đúng.`);
          }
          if (twoWay === "eliminate") {
            const distractors = question.options.filter((option) => option !== question.answer);
            if (distractors.some((option) => !question.feedbackByAnswer?.[option])) errors.push(`${question.id}: loại trừ cần lý do cho mọi phương án sai.`);
          }
        }
      }
    }
  }
  // Kể bằng lời chỉ là đường lui; phần lớn câu phải có cách thứ hai được ứng dụng tự kiểm.
  const total = modes.expression + modes.eliminate + modes.explain;
  assert.ok(modes.explain / total < 0.35, `quá nhiều câu chỉ kể bằng lời: ${JSON.stringify(modes)}`);
  report(errors);
});

test("Buổi 4: ba câu bối cảnh mới khác nhau và khác câu nhắc lại", async () => {
  const { buildSession } = await vite.ssrLoadModule("/app/session-plan.ts");
  const { LIFE_TRANSFER: LIFE } = await vite.ssrLoadModule("/app/variants/life-transfer.ts");
  const errors = [];
  assert.equal(Object.keys(LIFE).length, 36, "mỗi nhiệm vụ có hai câu đời sống");
  for (const mission of ALL_DEEP_MISSIONS) {
    if (LIFE[mission.id]?.length !== 2) errors.push(`${mission.id}: cần 2 câu đời sống.`);
    for (const mastery of Object.values(BANDS)) {
      const plan = buildSession(mission, 3, mastery);
      const [recall, ...fresh] = plan.questions.map((item) => item.question.prompt);
      const strip = (text) => text.replace(/\d+/g, "#").replace(/^Tại [^,]+, /, "").toLocaleLowerCase("vi");
      if (fresh.some((prompt) => strip(prompt) === strip(recall))) errors.push(`${mission.id}: câu bối cảnh mới chỉ là câu nhắc lại đổi số.`);
      if (new Set(fresh.map(strip)).size !== 3) errors.push(`${mission.id}: ba câu bối cảnh mới phải khác khuôn.`);
    }
  }
  report(errors);
});

test("học cụ: 15 nhiệm vụ có thao tác thật, lời giải mẫu được chấm đúng, thao tác sai có phản hồi", async () => {
  const { LAB_TOOLS, labToolSelfCheck } = await vite.ssrLoadModule("/app/lab-tools.ts");
  const expected = {
    grid: ["geometry-1", "geometry-2", "geometry-3", "geometry-5", "geometry-6", "measurement-3"],
    "bar-model": ["word-1", "word-2", "calculation-3", "calculation-4"],
    clock: ["measurement-5", "number-5"],
    "bar-chart": ["data-1", "data-4", "data-6"],
  };
  const errors = [];
  const withTool = ALL_DEEP_MISSIONS.filter((mission) => mission.lab.type !== "choice");
  assert.equal(withTool.length, 15, `cần 15/36 nhiệm vụ có học cụ, hiện có ${withTool.length}`);
  for (const [tool, ids] of Object.entries(expected)) {
    for (const id of ids) {
      const mission = ALL_DEEP_MISSIONS.find((item) => item.id === id);
      if (mission.lab.type !== tool || mission.lab.tool?.tool !== tool) errors.push(`${id}: cần học cụ ${tool}, hiện là ${mission.lab.type}.`);
    }
  }
  for (const [id, tool] of Object.entries(LAB_TOOLS)) {
    const { solution, wrong } = labToolSelfCheck(tool.spec);
    if (!solution.ok) errors.push(`${id}: lời giải mẫu bị chấm sai — “${solution.message}”`);
    if (wrong.ok || wrong.message.trim().length < 15) errors.push(`${id}: thao tác sai cần phản hồi riêng — “${wrong.message}”`);
    // Chữ cho trẻ: câu ngắn (mỗi câu tối đa 25 tiếng).
    for (const sentence of `${tool.prompt} ${tool.explanation}`.split(/(?<=[.?!])\s+/)) {
      if (sentence.split(/\s+/).length > 25) errors.push(`${id}: câu quá dài — “${sentence}”`);
    }
  }
  report(errors);
});
