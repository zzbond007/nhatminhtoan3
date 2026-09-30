// Bộ kiểm định toán học: duyệt MỌI câu hỏi trẻ có thể gặp và chặn triển khai khi nội dung sai.
// Khác các test còn lại (kiểm tra cơ chế), tệp này kiểm tra tính đúng của toán và của câu chữ.
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

const MAX_ANSWER = 100_000;
const BANDS = { support: 10, core: 70, stretch: 95 };
const SPIRAL_SEEDS = 150;

// ───────────────────────── Thu thập câu hỏi ─────────────────────────

/** Mọi câu được đưa về một dạng chung: { id, group, prompt, type, answer, options, texts }. */
function unify(group, id, question, extraTexts = []) {
  return {
    id, group,
    prompt: question.prompt,
    type: question.type ?? (question.options ? "choice" : "number"),
    answer: question.answer,
    options: question.options,
    texts: [question.prompt, question.answer, question.hint, ...(question.hints ?? []), question.explanation, question.misconception, question.note, ...(question.options ?? []), ...extraTexts]
      .filter((text) => text !== undefined && text !== null).map(String),
  };
}

async function collect() {
  const { DIAGNOSTIC_QUESTIONS, DOMAINS } = await vite.ssrLoadModule("/app/content.ts");
  const { DAILY_PUZZLES, ALL_MISSIONS } = await vite.ssrLoadModule("/app/missions.ts");
  const { ALL_DEEP_MISSIONS, DAILY_PUZZLES_60 } = await vite.ssrLoadModule("/app/curriculum.ts");
  const { createMissionEdition, VARIANTS_PER_MISSION } = await vite.ssrLoadModule("/app/mission-variants.ts");
  const { SKILL_LAB_QUESTIONS } = await vite.ssrLoadModule("/app/skill-lab.ts");
  const { VARIANT_TEMPLATES, generateVariant } = await vite.ssrLoadModule("/app/spiral-engine.ts");
  const { buildCheckIn } = await vite.ssrLoadModule("/app/monthly-checkin.ts");

  const questions = [];
  for (const mission of ALL_DEEP_MISSIONS) {
    for (let variant = 0; variant < VARIANTS_PER_MISSION; variant += 1) {
      for (const [band, autonomy] of Object.entries(BANDS)) {
        // completedCount > 0 để bộ sinh dùng đúng dải khó; phần dư chọn phiên bản.
        const edition = createMissionEdition(mission, variant + VARIANTS_PER_MISSION, autonomy);
        assert.equal(edition.difficulty, band, `${edition.id}: sai dải khó`);
        [...edition.mission.deepPractice, edition.mission.transfer].forEach((question) => {
          questions.push(unify(`variants-${band}`, `${question.id}-${band}`, question));
        });
      }
    }
    [...mission.deepPractice, mission.transfer].forEach((question) => questions.push(unify("missions", question.id, question)));
    questions.push(unify("mission-model", `${mission.id}-model`, { prompt: mission.model.prompt, type: "number", answer: "0" }, [...mission.model.steps, mission.model.answer, mission.idea, mission.wonder, mission.hook]));
  }
  ALL_MISSIONS.forEach((mission) => mission.practice.forEach((question, index) => questions.push(unify("mission-source", `${mission.id}-src${index + 1}`, question))));
  DAILY_PUZZLES_60.forEach((puzzle) => questions.push(unify("daily-60", puzzle.id, { ...puzzle, type: "choice" })));
  DAILY_PUZZLES.forEach((puzzle) => questions.push(unify("daily-legacy", puzzle.id, { ...puzzle, type: "choice" })));
  DIAGNOSTIC_QUESTIONS.forEach((question) => questions.push(unify("diagnostic", question.id, question)));
  SKILL_LAB_QUESTIONS.forEach((question) => questions.push(unify("skill-lab", question.id, question)));
  for (const template of VARIANT_TEMPLATES) {
    for (const level of ["standard", "lowered"]) {
      for (let seed = 1; seed <= SPIRAL_SEEDS; seed += 1) {
        const question = generateVariant(template, seed * 7919 + 13, level);
        const barTexts = (question.bar?.rows ?? []).flatMap((row) => [row.label, ...row.segments.flatMap((segment) => [segment.text, segment.value])]);
        questions.push(unify("spiral", `${question.id}-${level}`, question, barTexts.filter((text) => text !== undefined)));
      }
    }
  }
  for (let month = 1; month <= 9; month += 1) {
    for (let sequence = 1; sequence <= 6; sequence += 1) {
      const reached = Object.fromEntries(DOMAINS.map((domain) => [domain.id, sequence]));
      buildCheckIn(month, reached).forEach((item) => questions.push(unify("check-in", `${item.id}-s${sequence}`, item.question)));
    }
  }
  return { questions, missions: ALL_DEEP_MISSIONS };
}

const collected = await collect();
const { questions } = collected;

function report(errors, limit = Number(process.env.AUDIT_LIMIT ?? 25)) {
  if (!errors.length) return;
  const shown = errors.slice(0, limit).join("\n");
  assert.fail(`${errors.length} lỗi nội dung:\n${shown}${errors.length > limit ? `\n… và ${errors.length - limit} lỗi khác` : ""}`);
}

// ───────────────────────── Bộ tính biểu thức số học ─────────────────────────

/** "18 000" → "18000" (dấu cách ngăn hàng nghìn kiểu Việt Nam). */
function joinThousands(text) {
  return text.replace(/(?<![\d])(\d{1,3})((?: \d{3})+)(?!\d)/g, (whole) => whole.replace(/ /g, ""));
}

/** Tính một biểu thức chỉ gồm số, + − × : và ngoặc. Trả về null nếu không phải biểu thức hợp lệ. */
function evaluate(expression) {
  const tokens = joinThousands(expression).match(/\d+|[+−×:()\-x]/g);
  if (!tokens || tokens.join("") !== joinThousands(expression).replace(/\s+/g, "")) return null;
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  function primary() {
    const token = take();
    if (token === "(") {
      const value = sum();
      if (take() !== ")") throw new Error("ngoặc");
      return value;
    }
    if (!/^\d+$/.test(token ?? "")) throw new Error("số");
    return Number(token);
  }
  function product() {
    let value = primary();
    while (peek() === "×" || peek() === "x" || peek() === ":") {
      const operator = take();
      const right = primary();
      value = operator === ":" ? value / right : value * right;
    }
    return value;
  }
  function sum() {
    let value = product();
    while (peek() === "+" || peek() === "−" || peek() === "-") {
      const operator = take();
      const right = product();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }
  try {
    const value = sum();
    return position === tokens.length && Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

const ARITHMETIC_TAIL = /([\d(][\d\s+−×:()x\-]*)$/;
const ARITHMETIC_HEAD = /^([\d(][\d\s+−×:()x\-]*)/;
const hasOperator = (text) => /[+−×:x\-]/.test(text);

/**
 * Tìm mọi đẳng thức số học viết trong câu chữ ("3 × 18 000 = 54 000", "(9 + 6) × 2 = 30")
 * và trả về những đẳng thức SAI. Vế có chữ, ô trống hay dấu hỏi được bỏ qua.
 */
function wrongEqualities(text) {
  const wrong = [];
  // "Tầng 3: 6 − 3 = 3" — nhãn tầng gợi ý không phải phép chia.
  const body = String(text).replace(/^Tầng \d[^:]*:\s*/, "");
  for (const clause of body.split(/[.;,!?…·→]|\s[–—]\s/)) {
    // Đề cố ý nêu một phép tính sai để trẻ bắt lỗi (“Một bạn tính …”, “Đổi đúng một dấu …”) hoặc dùng phép toán tự đặt (⊙).
    if (/[Bb]ạn [^=]*tính|Đổi đúng một dấu|⊙/.test(clause)) continue;
    const parts = clause.split("=");
    for (let index = 0; index + 1 < parts.length; index += 1) {
      const leftRaw = parts[index].trimEnd();
      const rightRaw = parts[index + 1].trimStart();
      const leftMatch = leftRaw.match(ARITHMETIC_TAIL);
      const rightMatch = rightRaw.match(ARITHMETIC_HEAD);
      if (!leftMatch || !rightMatch) continue;
      const before = leftRaw.slice(0, leftMatch.index).trimEnd().slice(-1);
      const afterText = rightRaw.slice(rightMatch[1].length);
      const after = afterText.trimStart().slice(0, 1);
      if (/[\d/+−×:\-<>□?_|]/.test(before) || /[/+−×:\-<>□?|]/.test(after)) continue;
      const leftText = leftMatch[1].trim();
      const rightText = rightMatch[1].trim();
      if (!hasOperator(leftText) && !hasOperator(rightText)) continue;
      const left = evaluate(leftText);
      const right = evaluate(rightText);
      if (left === null || right === null) continue;
      const remainder = afterText.match(/^\s*\(?dư (\d+)/);
      if (remainder) {
        const division = leftText.match(/^(\d+) : (\d+)$/);
        if (division && Number(division[1]) === right * Number(division[2]) + Number(remainder[1]) && Number(remainder[1]) < Number(division[2])) continue;
      }
      if (Math.abs(left - right) > 1e-9) wrong.push(`${leftText} = ${rightText}`);
    }
  }
  return wrong;
}

test("bộ tính biểu thức của chính bộ kiểm định hoạt động đúng", () => {
  assert.equal(evaluate("3 × 18 000"), 54000);
  assert.equal(evaluate("90 − (35 + 40 + 10)"), 5);
  assert.equal(evaluate("(120 000 − 20 000) : 25 000"), 4);
  assert.equal(evaluate("8:45"), 8 / 45);
  assert.equal(evaluate("2 +"), null);
  assert.deepEqual(wrongEqualities("48 × 5 = (50 − 2) × 5 = 50 × 5 − 10."), []);
  assert.deepEqual(wrongEqualities("351 + 294 = 700."), ["351 + 294 = 700"]);
  assert.deepEqual(wrongEqualities("17 : 5 = 3 dư 2."), []);
  assert.deepEqual(wrongEqualities("□ × 3 + 2 = 17; 1 m 2 dm = 120 cm; A = 12 · P = 26"), []);
});

// ───────────────────────── Các phép kiểm định ─────────────────────────

test("có đủ các nguồn câu hỏi", () => {
  const count = (group) => questions.filter((question) => question.group === group).length;
  assert.equal(count("variants-core"), 36 * 12 * 5);
  assert.equal(count("variants-support"), 36 * 12 * 5);
  assert.equal(count("variants-stretch"), 36 * 12 * 5);
  assert.equal(count("daily-60"), 60);
  assert.ok(count("diagnostic") >= 18);
  assert.equal(count("skill-lab"), 48);
  assert.ok(count("spiral") > 0);
  assert.equal(count("check-in"), 9 * 6 * 9);
});

test("đáp án dạng số là số tự nhiên trong phạm vi 100 000", () => {
  const errors = [];
  for (const question of questions) {
    if (question.type !== "number" || question.group === "mission-model") continue;
    if (!/^\d+$/.test(question.answer)) errors.push(`${question.id}: đáp án “${question.answer}” không phải số tự nhiên. Đề: ${question.prompt}`);
    else if (Number(question.answer) > MAX_ANSWER) errors.push(`${question.id}: đáp án ${question.answer} vượt 100 000.`);
    else if (String(Number(question.answer)) !== question.answer) errors.push(`${question.id}: đáp án “${question.answer}” có số 0 thừa ở đầu.`);
  }
  report(errors);
});

test("lựa chọn không trùng nhau và chứa đúng một đáp án", () => {
  const errors = [];
  const key = (text) => String(text).trim().toLocaleLowerCase("vi").replace(/\s+/g, " ");
  for (const question of questions) {
    if (question.type !== "choice") continue;
    const options = question.options ?? [];
    if (options.length < 2) errors.push(`${question.id}: cần ít nhất 2 lựa chọn.`);
    if (new Set(options.map(key)).size !== options.length) errors.push(`${question.id}: lựa chọn trùng nhau [${options.join(" | ")}]. Đề: ${question.prompt}`);
    if (options.filter((option) => key(option) === key(question.answer)).length !== 1) errors.push(`${question.id}: đáp án “${question.answer}” không nằm trong lựa chọn [${options.join(" | ")}].`);
  }
  report(errors);
});

test("câu chữ không chứa số âm, NaN, undefined hay ký hiệu ngoài chương trình", () => {
  const checks = [
    [/NaN|undefined|Infinity|\[object|null\b/, "giá trị lập trình lọt vào câu chữ"],
    [/[+−×:]\s*[-−]\s*\d/, "chuỗi dạng “+ -”"],
    [/(^|[^\dA-Za-zÀ-ỹ)])-\d/, "số âm"],
    [/(^|[=(,;:])\s*−\s*\d/, "số âm"],
    [/kết quả âm|số âm/i, "nhắc tới số âm"],
    [/\|/, "ký hiệu giá trị tuyệt đối"],
    [/\d\.\d/, "số thập phân"],
    [/\{\w+\}/, "ô mẫu chưa được điền"],
  ];
  const errors = [];
  for (const question of questions) {
    for (const text of question.texts) {
      for (const [pattern, label] of checks) {
        if (pattern.test(text)) errors.push(`${question.id}: ${label} trong “${text}”`);
      }
    }
  }
  report(errors);
});

test("mọi đẳng thức số học viết trong đề, gợi ý và lời giải đều đúng", () => {
  const errors = [];
  for (const question of questions) {
    for (const text of question.texts) {
      for (const wrong of wrongEqualities(text)) errors.push(`${question.id}: đẳng thức sai “${wrong}” trong “${text}”`);
    }
  }
  report(errors);
});

test("câu “gần số nào nhất” có đáp án là lựa chọn gần giá trị chính xác nhất, không mơ hồ", () => {
  const errors = [];
  let checked = 0;
  for (const question of questions) {
    const match = question.prompt.match(/^(.*?)\s+gần số nào nhất/);
    if (!match || question.type !== "choice") continue;
    const expressionText = match[1].match(ARITHMETIC_TAIL)?.[1];
    const exact = expressionText ? evaluate(expressionText.trim()) : null;
    if (exact === null) { errors.push(`${question.id}: không đọc được phép tính trong “${question.prompt}”`); continue; }
    checked += 1;
    const options = (question.options ?? []).map(Number);
    if (options.some(Number.isNaN)) { errors.push(`${question.id}: lựa chọn phải là số.`); continue; }
    const ranked = [...options].sort((a, b) => Math.abs(a - exact) - Math.abs(b - exact));
    const margin = Math.abs(ranked[1] - exact) - Math.abs(ranked[0] - exact);
    if (String(ranked[0]) !== question.answer) errors.push(`${question.id}: ${expressionText.trim()} = ${exact}, gần ${ranked[0]} nhất nhưng đáp án ghi ${question.answer}.`);
    else if (margin < 20) errors.push(`${question.id}: ${exact} cách hai lựa chọn ${ranked[0]} và ${ranked[1]} gần như nhau (mơ hồ).`);
    const addends = expressionText.trim().match(/^(\d+) \+ (\d+)$/);
    if (addends) {
      const estimate = Math.round(Number(addends[1]) / 100) * 100 + Math.round(Number(addends[2]) / 100) * 100;
      if (String(estimate) !== question.answer) errors.push(`${question.id}: làm tròn từng số hạng cho ${estimate}, khác đáp án ${question.answer} (giá trị chính xác ${exact}).`);
    }
  }
  assert.ok(checked > 0, "phải tìm thấy câu ước lượng để kiểm");
  report(errors);
});

test("câu “biểu thức nào bằng …” có đúng một lựa chọn bằng giá trị cần tìm", () => {
  const errors = [];
  let checked = 0;
  for (const question of questions) {
    const match = question.prompt.match(/(?:nào bằng|cùng kết quả với)\s+([\d\s+−×:()]+)\?/);
    if (!match || question.type !== "choice") continue;
    const target = evaluate(match[1].trim());
    const values = (question.options ?? []).map((option) => evaluate(option));
    if (target === null || values.some((value) => value === null)) continue;
    checked += 1;
    const equal = question.options.filter((_, index) => Math.abs(values[index] - target) < 1e-9);
    if (equal.length !== 1 || equal[0] !== question.answer) errors.push(`${question.id}: cần đúng một lựa chọn bằng ${target}, tìm thấy [${equal.join(" | ")}], đáp án ghi “${question.answer}”.`);
  }
  assert.ok(checked > 0, "phải tìm thấy câu so sánh biểu thức để kiểm");
  report(errors);
});

test("câu “kết quả nào chắc chắn sai” chỉ có một lựa chọn sai", () => {
  const errors = [];
  let checked = 0;
  for (const question of questions) {
    const match = question.prompt.match(/chắc chắn sai với\s+([\d\s+−×:()]+)\?/);
    if (!match) continue;
    checked += 1;
    const exact = evaluate(match[1].trim());
    const numericWrong = (question.options ?? []).filter((option) => /^\d+$/.test(option) && Number(option) !== exact);
    if (numericWrong.length !== 1 || numericWrong[0] !== question.answer) errors.push(`${question.id}: ${match[1].trim()} = ${exact}; các lựa chọn số sai là [${numericWrong.join(" | ")}], đáp án ghi “${question.answer}”.`);
  }
  assert.ok(checked > 0);
  report(errors);
});

// Giải lại độc lập những dạng đề đọc được bằng mẫu câu, rồi so với đáp án của bộ sinh đề.
const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const weekdayIndex = (name) => WEEKDAYS.findIndex((day) => day.toLocaleLowerCase("vi") === name.toLocaleLowerCase("vi"));
const minutesOf = (text) => { const [hour, minute] = text.split(":").map(Number); return hour * 60 + minute; };
const clockOf = (minutes) => `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
const SOLVERS = [
  [/Hôm nay là (Chủ nhật|[Tt]hứ \S+)\.[^.]*?[Ss]au (\d+) ngày/i, (m) => WEEKDAYS[(weekdayIndex(m[1]) + Number(m[2])) % 7]],
  [/Ngày 1 là (Chủ nhật|[Tt]hứ \S+)\. Ngày (\d+) là thứ mấy/i, (m) => WEEKDAYS[(weekdayIndex(m[1]) + Number(m[2]) - 1) % 7]],
  [/Đồng hồ (?:đang )?chỉ (\d+) giờ\. Sau (\d+) giờ/i, (m) => { const hour = (Number(m[1]) + Number(m[2]) - 1) % 12 + 1; return [String(hour), `${hour} giờ`]; }],
  [/vòng Đỏ – Vàng – Xanh\. Lần 1 là Đỏ\. Lần (\d+) là màu gì/i, (m) => ["Đỏ", "Vàng", "Xanh"][(Number(m[1]) - 1) % 3]],
  [/[Bb]ắt đầu (?:lúc )?(\d+:\d\d), (?:học|hoạt động) (\d+) phút\. Kết thúc lúc nào/i, (m) => clockOf(minutesOf(m[1]) + Number(m[2]))],
  [/Có (\d+) con gồm gà 2 chân và chó 4 chân, tổng (\d+) chân\. Có bao nhiêu con chó/i, (m) => String((Number(m[2]) - 2 * Number(m[1])) / 2)],
  [/Tìm số: □ × (\d+) \+ (\d+) = (\d+)/i, (m) => String((Number(m[3]) - Number(m[2])) / Number(m[1]))],
  [/Dãy bắt đầu (\d+), mỗi bước cộng (\d+)\. Số thứ tư là/i, (m) => String(Number(m[1]) + 3 * Number(m[2]))],
  [/Một số ×4 rồi \+3 được (\d+)\. Số đó là/i, (m) => String((Number(m[1]) - 3) / 4)],
  [/Hình (\d+)×(\d+) có chu vi bao nhiêu/i, (m) => String(2 * (Number(m[1]) + Number(m[2])))],
  [/^(?:Tại [^,]+, )?[Tt]ính (?:nhẩm thuận tiện|nhanh|bằng cách tách): ([\d\s+−×]+?)\.?$/i, (m) => String(evaluate(m[1].trim()))],
  [/^(\d+ \+ \d+) bằng bao nhiêu\?$/i, (m) => String(evaluate(m[1]))],
];

test("đáp án khớp với lời giải độc lập của bộ kiểm định", () => {
  const errors = [];
  const used = new Set();
  for (const question of questions) {
    if (question.group === "mission-model") continue; // bài mẫu ghi đáp án thành câu văn
    SOLVERS.forEach(([pattern, solve], index) => {
      const match = question.prompt.match(pattern);
      if (!match) return;
      used.add(index);
      const expected = [solve(match)].flat();
      if (!expected.includes(question.answer)) errors.push(`${question.id}: đáp án ghi “${question.answer}” nhưng giải lại được “${expected[0]}”. Đề: ${question.prompt}`);
    });
  }
  const unused = SOLVERS.map(([pattern], index) => (used.has(index) ? null : String(pattern))).filter(Boolean);
  assert.deepEqual(unused, [], "mỗi mẫu giải lại phải khớp ít nhất một câu");
  report(errors);
});

test("vị trí đáp án đúng trải đều giữa các lựa chọn", () => {
  const errors = [];
  const groups = new Map();
  for (const question of questions) {
    if (question.type !== "choice" || !question.options?.includes(question.answer)) continue;
    if (question.group === "variants-support" || question.group === "variants-stretch" || question.group === "check-in") continue; // cùng id với variants-core
    const name = `${question.group} · ${question.options.length} lựa chọn`;
    if (!groups.has(name)) groups.set(name, { size: question.options.length, positions: [] });
    groups.get(name).positions.push(question.options.indexOf(question.answer));
  }
  for (const [name, { size, positions }] of groups) {
    const total = positions.length;
    if (total < 8 || size < 2) continue;
    const expected = 1 / size;
    const shares = Array.from({ length: size }, (_, index) => positions.filter((position) => position === index).length / total);
    const summary = shares.map((share, index) => `${String.fromCharCode(65 + index)} ${Math.round(share * 100)}%`).join(", ");
    if (total >= 40) {
      const tolerance = Math.max(0.12, 3 * Math.sqrt((expected * (1 - expected)) / total));
      if (shares.some((share) => Math.abs(share - expected) > tolerance)) errors.push(`${name} (${total} câu): đáp án đúng phân bố lệch — ${summary}.`);
    } else if (size >= 3 && shares.some((share) => share > 0.6)) {
      errors.push(`${name} (${total} câu): đáp án đúng dồn vào một vị trí — ${summary}.`);
    }
  }
  report(errors);
});

test("cùng một câu luôn hiện cùng thứ tự lựa chọn", async () => {
  const first = questions.filter((question) => question.type === "choice").map((question) => `${question.id}:${question.options.join("|")}`);
  const again = (await collect()).questions.filter((question) => question.type === "choice").map((question) => `${question.id}:${question.options.join("|")}`);
  assert.deepEqual(again, first);
});

test("bài Tương tác có phương án nhiễu thật và ghi chú trung tính", () => {
  const errors = [];
  for (const mission of collected.missions) {
    const { lab } = mission;
    const values = lab.options.map((option) => option.value);
    if (new Set(values).size !== values.length) errors.push(`${mission.id}: bài Tương tác có lựa chọn trùng nhau.`);
    if (values.filter((value) => value === lab.answer).length !== 1) errors.push(`${mission.id}: bài Tương tác phải chứa đúng một đáp án.`);
    if (values.length < 3 && mission.practice[0].type === "number") errors.push(`${mission.id}: bài Tương tác cần ít nhất 3 lựa chọn.`);
    if (lab.type !== "choice") continue;
    const source = mission.practice[0];
    if (source.type === "number") {
      const filler = lab.options.filter((option) => !/^\d+$/.test(option.value));
      if (filler.length) errors.push(`${mission.id}: bài Tương tác dùng lựa chọn độn “${filler.map((option) => option.label).join(" | ")}” thay cho phương án nhiễu bằng số.`);
    }
    if (new Set(lab.options.map((option) => option.note)).size !== 1) errors.push(`${mission.id}: ghi chú của bài Tương tác làm lộ đáp án.`);
    if (lab.options.some((option) => /kiểm chứng|đáp án|đúng/i.test(option.note))) errors.push(`${mission.id}: ghi chú “${lab.options[0].note}” không trung tính.`);
  }
  report(errors);
});
