import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  await vite.close();
});

test("Module 1: numpad keys edit the answer safely", async () => {
  const { applyNumpadKey, keyboardToNumpadKey } = await vite.ssrLoadModule("/app/numpad.ts");
  assert.equal(applyNumpadKey("", "7"), "7");
  assert.equal(applyNumpadKey("0", "5"), "5", "bỏ số 0 vô nghĩa ở đầu");
  assert.equal(applyNumpadKey("12", "backspace"), "1");
  assert.equal(applyNumpadKey("12", "clear"), "");
  assert.equal(applyNumpadKey("12", "sign"), "12", "dấu âm tắt mặc định");
  assert.equal(applyNumpadKey("12", "sign", { allowNegative: true }), "-12");
  assert.equal(applyNumpadKey("-1", "backspace", { allowNegative: true }), "");
  assert.equal(applyNumpadKey("1234567", "8"), "1234567", "giới hạn 7 chữ số");
  assert.equal(applyNumpadKey("3", "decimal", { allowDecimal: true }), "3,");
  assert.equal(keyboardToNumpadKey("Backspace"), "backspace");
  assert.equal(keyboardToNumpadKey("a"), null);
});

test("Module 1: answer field is read-only so the iPad keyboard stays hidden", async () => {
  const { NumpadAnswer } = await vite.ssrLoadModule("/components/virtual-numpad.tsx");
  const html = renderToStaticMarkup(React.createElement(NumpadAnswer, { value: "42", onChange() {}, onSubmit() {} }));
  assert.match(html, /readOnly|readonly/);
  assert.match(html, /inputMode="none"|inputmode="none"/);
  assert.equal((html.match(/class="numpad-key/g) ?? []).length, 13, "9 phím 1–9 + phím 0 rộng + ⌫ + C + ✔");
});

test("Module 3: karaoke tokens map boundary char indexes to words", async () => {
  const { tokenizeForKaraoke, wordIndexAtChar, estimateWordTimeline } = await vite.ssrLoadModule("/app/speech-service.ts");
  const tokens = tokenizeForKaraoke("Có 24 chân, mỗi con 2 chân.");
  const words = tokens.filter((token) => token.isWord);
  assert.deepEqual(words.map((token) => token.text), ["Có", "24", "chân,", "mỗi", "con", "2", "chân."]);
  assert.equal(tokens.map((token) => token.text).join(""), "Có 24 chân, mỗi con 2 chân.", "ghép lại đúng nguyên văn");
  assert.equal(wordIndexAtChar(tokens, 0), 0);
  assert.equal(wordIndexAtChar(tokens, 3), 1);
  assert.equal(wordIndexAtChar(tokens, 12), 3);
  const timeline = estimateWordTimeline(tokens, 1);
  assert.equal(timeline.length, words.length);
  assert.ok(timeline.every((time, index) => index === 0 || time > timeline[index - 1]));
});

test("Module 3: reader wraps every word in a word-token span", async () => {
  const { KaraokeReader } = await vite.ssrLoadModule("/components/karaoke-reader.tsx");
  const html = renderToStaticMarkup(React.createElement(KaraokeReader, { text: "Hỏi đàn có bao nhiêu con?" }));
  assert.equal((html.match(/class="word-token/g) ?? []).length, 6);
  assert.match(html, /id="w_0"/);
  assert.match(html, /Nghe đọc đề/);
});

test("Module 4: spark rewards follow hint depth and anti-gaming rules", async () => {
  const { sparkRewardFor, hintBody, hintLockMs, autoScaffoldDepth } = await vite.ssrLoadModule("/app/hint-scaffold.ts");
  assert.deepEqual([sparkRewardFor(0, true).amount, sparkRewardFor(0, true).selfReliant], [10, true]);
  assert.equal(sparkRewardFor(0, false).amount, 5, "không gợi ý nhưng đoán nhiều lần không được 10");
  assert.equal(sparkRewardFor(1, true).amount, 5);
  assert.equal(sparkRewardFor(2, true).amount, 2);
  assert.deepEqual([sparkRewardFor(3, true).amount, sparkRewardFor(3, true).needsReview], [1, true]);
  assert.equal(hintLockMs(1), 15000, "mở tầng 1 xong phải chờ 15 giây mới mở tầng 2");
  assert.equal(hintBody("Tầng 2 · Chọn bước: 24 : 3 = ?"), "24 : 3 = ?");
  assert.equal(hintBody("36 : 6 = 6; 6 × 2 = 12."), "36 : 6 = 6; 6 × 2 = 12.", "không cắt nhầm dấu chia");
  assert.equal(autoScaffoldDepth(0, 1), 0);
  assert.equal(autoScaffoldDepth(0, 2), 2);
  assert.equal(autoScaffoldDepth(3, 2), 3);
});

test("Module 5: wrong answers come back for review after 24 hours", async () => {
  const { recordCognitiveAttempt, dueReviewStates, scaffoldLevelFor, cognitiveKey } = await vite.ssrLoadModule("/app/spiral-engine.ts");
  const target = { topicId: "word-2", skillTag: "Tổng – hiệu", domain: "word" };
  let map = recordCognitiveAttempt({}, target, { correct: false, hintDepth: 0, now: "2026-09-26T08:00:00.000Z" });
  const state = map[cognitiveKey("word-2", "Tổng – hiệu")];
  assert.equal(state.needsReview, true);
  assert.equal(state.errorCount, 1);
  assert.equal(state.reviewDueAt, "2026-09-27T08:00:00.000Z");
  assert.equal(dueReviewStates(map, "2026-09-26T20:00:00.000Z").length, 0, "chưa đủ 24 giờ");
  assert.equal(dueReviewStates(map, "2026-09-27T08:00:00.000Z").length, 1);

  map = recordCognitiveAttempt(map, target, { correct: false, hintDepth: 1, now: "2026-09-26T08:05:00.000Z" });
  assert.equal(scaffoldLevelFor(map[cognitiveKey("word-2", "Tổng – hiệu")]), "lowered", "sai 2 lần liên tiếp → hạ bậc");

  map = recordCognitiveAttempt(map, target, { correct: true, hintDepth: 0, now: "2026-09-27T09:00:00.000Z", source: "review" });
  const reviewed = map[cognitiveKey("word-2", "Tổng – hiệu")];
  assert.equal(reviewed.needsReview, false);
  assert.equal(reviewed.consecutiveErrors, 0);
  assert.equal(reviewed.masteryLevel, 1);

  const withSolution = recordCognitiveAttempt({}, target, { correct: true, hintDepth: 3, now: "2026-09-26T08:00:00.000Z" });
  assert.equal(withSolution[cognitiveKey("word-2", "Tổng – hiệu")].needsReview, true, "đúng nhờ lời giải chi tiết vẫn cần ôn");
});

test("Module 5: isomorphic variants keep the logic and stay in grade-3 range", async () => {
  const { VARIANT_TEMPLATES, generateVariant, fillTemplate } = await vite.ssrLoadModule("/app/spiral-engine.ts");
  assert.equal(
    fillTemplate("{dino} có {legs} chân. Một đàn có tổng cộng {total} chân.", { dino: "Khủng long ba sừng", legs: 4, total: 24 }),
    "Khủng long ba sừng có 4 chân. Một đàn có tổng cộng 24 chân.",
  );
  for (const template of VARIANT_TEMPLATES) {
    for (let seed = 1; seed <= 200; seed += 1) {
      for (const level of ["standard", "lowered"]) {
        const question = generateVariant(template, seed, level);
        assert.doesNotMatch(question.prompt, /\{\w+\}/, `${template.id}: còn ô trống chưa điền`);
        const answer = Number(question.answer);
        assert.ok(Number.isInteger(answer) && answer > 0 && answer <= 10000, `${template.id} seed ${seed}: đáp án ${question.answer} ngoài phạm vi lớp 3`);
        const numbers = (question.prompt.match(/\d+/g) ?? []).map(Number);
        assert.ok(numbers.every((value) => value <= 10000), `${template.id}: số trong đề quá lớn`);
        assert.equal(question.hints.length, 3);
      }
    }
    assert.deepEqual(generateVariant(template, 7), generateVariant(template, 7), `${template.id}: cùng seed phải cùng đề`);
  }
  // Kiểm tra lại logic của mẫu đề "chân khủng long": tổng chân chia hết cho số chân mỗi con.
  const legs = VARIANT_TEMPLATES.find((template) => template.id === "dino-legs");
  for (let seed = 1; seed <= 100; seed += 1) {
    const question = generateVariant(legs, seed);
    const [perDino, total] = question.prompt.match(/\d+/g).map(Number);
    assert.equal(total % perDino, 0);
    assert.equal(total / perDino, Number(question.answer));
  }
  // Mức hạ bậc dùng số nhỏ hơn.
  const lowered = generateVariant(VARIANT_TEMPLATES.find((template) => template.id === "sum-difference"), 3, "lowered");
  assert.ok(Number(lowered.answer) <= 16);
});

test("Module 5: spiral review set only uses due skills", async () => {
  const { buildSpiralReviewSet, recordCognitiveAttempt } = await vite.ssrLoadModule("/app/spiral-engine.ts");
  let map = recordCognitiveAttempt({}, { topicId: "lab:fractions", skillTag: "fr-03", strand: "fractions" }, { correct: false, hintDepth: 3, now: "2026-09-20T08:00:00.000Z" });
  map = recordCognitiveAttempt(map, { topicId: "geometry-2", skillTag: "Chu vi", domain: "geometry" }, { correct: false, hintDepth: 0, now: "2026-09-26T07:00:00.000Z" });
  const set = buildSpiralReviewSet(map, "2026-09-26T08:00:00.000Z", 11);
  assert.equal(set.length, 2, "chỉ dạng phân số đến hạn, mỗi dạng 2 biến thể");
  assert.ok(set.every((item) => item.source.topicId === "lab:fractions"));
  assert.ok(set.every((item) => ["fraction-of-herd", "fern-share"].includes(item.question.templateId)), "chỉ dùng mẫu thuộc mảng phân số");
  assert.notEqual(set[0].question.id, set[1].question.id);
});

test("Module 6.1: fossil museum never resets and shields rescue a short week", async () => {
  const { fossilMuseum, applyFossilShield, weekStartOf } = await vite.ssrLoadModule("/app/fossil-streak.ts");
  assert.equal(weekStartOf("2026-09-26"), "2026-09-21", "thứ Bảy thuộc tuần bắt đầu thứ Hai 21/9");
  const fullWeek = ["2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11"];
  const shortWeek = ["2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17"];
  const days = [...fullWeek, ...shortWeek, "2026-09-21"];
  const before = fossilMuseum(days, [], "2026-09-22");
  assert.equal(before.fossils, 1);
  assert.deepEqual(before.rescue, { week: "2026-09-14", missing: 1 });
  assert.equal(before.shieldsLeft, 2);

  const uses = applyFossilShield(days, [], "2026-09-22", "2026-09-22T10:00:00.000Z");
  const after = fossilMuseum(days, uses, "2026-09-22");
  assert.equal(after.fossils, 2);
  assert.equal(after.rescuedFossils, 1);
  assert.equal(after.shieldsLeft, 1);
  assert.equal(after.rescue, null);

  // Nghỉ cả tuần không làm mất hóa thạch cũ (không reset về 0).
  const later = fossilMuseum(days, uses, "2026-10-14");
  assert.equal(later.fossils, 2);
  assert.equal(later.shieldsLeft, 2, "sang tháng mới lại có đủ 2 khiên");
});

test("Module 6.2: parent gate needs the right product", async () => {
  const { createGateChallenge, checkGateAnswer } = await vite.ssrLoadModule("/app/parent-gate.ts");
  const challenge = createGateChallenge(() => 0.7);
  assert.deepEqual(challenge, { percent: 40, base: 380, answer: 152, prompt: "40% của 380 = ?" });
  assert.equal(checkGateAnswer(challenge, "152"), true);
  assert.equal(checkGateAnswer(challenge, "150"), false);
  assert.equal(checkGateAnswer(challenge, ""), false);
});

test("Module 6.3: radar report names strengths first and gives home activities", async () => {
  const { buildRadarReport, RADAR_AXIS_ORDER, RADAR_AXIS_LABELS } = await vite.ssrLoadModule("/app/radar-report.ts");
  assert.deepEqual(RADAR_AXIS_ORDER.map((id) => RADAR_AXIS_LABELS[id]), ["Quy luật", "Chiến lược", "Mô hình", "Hình học", "Dữ liệu", "Logic"]);
  const report = buildRadarReport({ number: 100, calculation: 67, measurement: 33, geometry: 100, data: 67, word: 0 });
  assert.ok(report.strengths.some((item) => item.domain === "number"));
  assert.equal(report.growth[0].domain, "word");
  assert.ok(report.growth.every((item) => item.activity.length > 20));
  assert.doesNotMatch(JSON.stringify(report), /yếu|kém/);
});

test("migrateStorageData keeps old progress and adds v12 fields", async () => {
  const { migrateStorageData, STORAGE_KEY, STORAGE_BACKUP_KEY, STORAGE_SCHEMA_KEY } = await vite.ssrLoadModule("/app/storage-migration.ts");
  const legacy = {
    schemaVersion: 10, profileId: "p1", nickname: "Bé Na",
    missionRecords: { "word-2": { completedCount: 2, completedAt: "2026-09-01T00:00:00.000Z", focusNeeds: ["Tổng – hiệu"], sessions: [] } },
    skillLabRecords: { "fr-03": { attempts: 3, correct: 1, streak: 0, needsReview: true, lastAttemptAt: "2026-09-02T00:00:00.000Z" } },
    discoveryDays: ["2026-09-01"],
  };
  const store = new Map([["math-raccoon-learning-v10", JSON.stringify(legacy)]]);
  const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };

  const migrated = migrateStorageData(storage);
  assert.equal(migrated.nickname, "Bé Na");
  assert.equal(migrated.missionRecords["word-2"].completedCount, 2, "không mất tiến độ cũ");
  assert.equal(migrated.sparkBonus, 0);
  assert.deepEqual(migrated.fossilShieldUses, []);
  assert.ok(migrated.cognitiveStates["word-2::Tổng – hiệu"].needsReview);
  assert.equal(migrated.cognitiveStates["lab:fractions::fr-03"].errorCount, 2);
  assert.equal(store.get(STORAGE_BACKUP_KEY), JSON.stringify(legacy), "giữ bản sao gốc trước khi nâng cấp");
  assert.equal(store.get(STORAGE_SCHEMA_KEY), "13");
  assert.ok(store.has(STORAGE_KEY));
  assert.ok(store.has("math-raccoon-learning-v10"), "không xoá khoá cũ");

  // Lần mở thứ hai: đọc từ khoá hiện tại, không ghi đè bản sao lưu.
  store.set(STORAGE_KEY, JSON.stringify({ ...migrated, sparkBonus: 25 }));
  const second = migrateStorageData(storage);
  assert.equal(second.sparkBonus, 25);
  assert.equal(store.get(STORAGE_BACKUP_KEY), JSON.stringify(legacy));

  const broken = { getItem: () => "{không phải json", setItem() { throw new Error("không được ghi"); } };
  assert.equal(migrateStorageData(broken), null);
});
