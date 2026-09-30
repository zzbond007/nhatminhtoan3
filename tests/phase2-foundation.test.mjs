// Giai đoạn 2 · đợt nền tảng: thích ứng hai chiều, đánh giá đầu vào 30 câu, giải hai cách thật,
// ghi âm phản tư, cổng phụ huynh.
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

test("mức thành thạo tăng và giảm được (không còn Math.max)", async () => {
  const { blendMastery, bandForMastery, MASTERY_DEFAULT } = await vite.ssrLoadModule("/app/mastery.ts");
  assert.equal(blendMastery(undefined, 72), 72, "buổi đầu tiên lấy luôn kết quả buổi đó");
  assert.equal(blendMastery(90, 40), 70, "0,6 × 90 + 0,4 × 40");
  assert.equal(blendMastery(50, 100), 70);
  assert.equal(blendMastery(100, 250), 100);
  assert.equal(blendMastery(0, -30), 0);

  // Một lần đạt 90 không còn giữ con ở "Bứt phá" mãi: ba buổi khó liên tiếp đưa dải hạ dần.
  let level = 90;
  const bands = [bandForMastery(level)];
  for (const session of [40, 40, 40]) { level = blendMastery(level, session); bands.push(bandForMastery(level)); }
  assert.deepEqual(bands, ["stretch", "core", "core", "support"]);
  // …và làm tốt trở lại thì dải lại lên.
  for (const session of [95, 95, 95, 95]) level = blendMastery(level, session);
  assert.equal(bandForMastery(level), "stretch");

  assert.equal(bandForMastery(54), "support");
  assert.equal(bandForMastery(55), "core");
  assert.equal(bandForMastery(79), "core");
  assert.equal(bandForMastery(80), "stretch");
  assert.equal(bandForMastery(MASTERY_DEFAULT), "core");
});

test("bài đầu vào quyết định dải khó ngay từ buổi đầu tiên", async () => {
  const { diagnosticMastery, bandForMastery } = await vite.ssrLoadModule("/app/mastery.ts");
  const { DIAGNOSTIC_QUESTIONS } = await vite.ssrLoadModule("/app/content.ts");
  const { createMissionEdition } = await vite.ssrLoadModule("/app/mission-variants.ts");
  const { ALL_DEEP_MISSIONS } = await vite.ssrLoadModule("/app/curriculum.ts");

  // Số học: chỉ đúng hai câu dễ. Tính toán: đúng dễ và vừa. Đo lường: đúng hết. Các miền khác: sai hết.
  const correct = DIAGNOSTIC_QUESTIONS.map((question) => (question.domain === "number" && question.difficulty === 1)
    || (question.domain === "calculation" && question.difficulty <= 2)
    || question.domain === "measurement");
  const mastery = diagnosticMastery(DIAGNOSTIC_QUESTIONS, correct);
  assert.deepEqual(mastery, { number: 22, calculation: 67, measurement: 100, geometry: 0, data: 0, word: 0 });
  assert.deepEqual(["number", "calculation", "measurement"].map((domain) => bandForMastery(mastery[domain])), ["support", "core", "stretch"]);

  const firstSession = (id) => createMissionEdition(ALL_DEEP_MISSIONS.find((mission) => mission.id === id), 0, mastery[id.split("-")[0]]).difficulty;
  assert.equal(firstSession("number-1"), "support", "buổi đầu tiên không còn mặc định Vừa sức");
  assert.equal(firstSession("calculation-1"), "core");
  assert.equal(firstSession("measurement-1"), "stretch");
});

test("đánh giá đầu vào có 5 câu mỗi miền: 2 dễ, 2 vừa, 1 khó", async () => {
  const { DIAGNOSTIC_QUESTIONS, DIAGNOSTIC_PER_DOMAIN, DOMAINS } = await vite.ssrLoadModule("/app/content.ts");
  assert.equal(DIAGNOSTIC_PER_DOMAIN, 5);
  assert.equal(DIAGNOSTIC_QUESTIONS.length, 30);
  assert.equal(new Set(DIAGNOSTIC_QUESTIONS.map((question) => question.id)).size, 30);
  assert.equal(new Set(DIAGNOSTIC_QUESTIONS.map((question) => question.prompt)).size, 30);
  for (const domain of DOMAINS) {
    const difficulties = DIAGNOSTIC_QUESTIONS.filter((question) => question.domain === domain.id).map((question) => question.difficulty);
    assert.deepEqual(difficulties, [1, 1, 2, 2, 3], `${domain.id}: xếp từ dễ đến khó`);
  }
  // Các câu cùng miền đứng liền nhau để màn đánh giá hiện đúng tên miền.
  assert.deepEqual([...new Set(DIAGNOSTIC_QUESTIONS.map((question) => question.domain))], DOMAINS.map((domain) => domain.id));
});

test("lộ trình gợi ý miền cần luyện nhất trước, không còn sắp theo “gần 67%”", async () => {
  const { domainsByNeed } = await vite.ssrLoadModule("/app/mastery.ts");
  assert.deepEqual(domainsByNeed({ number: 67, calculation: 90, measurement: 30, geometry: 67, data: 100, word: 45 }), ["measurement", "word", "number", "geometry", "calculation", "data"]);
});

test("hồ sơ v12 lên v13: không mất tiến trình, không nhiệm vụ nào bị khoá lại", async () => {
  const { migrateStorageData, upgradeProfileData, STORAGE_KEY, STORAGE_SCHEMA, STORAGE_SCHEMA_KEY, STORAGE_BACKUP_KEY_V13 } = await vite.ssrLoadModule("/app/storage-migration.ts");
  const { bandForMastery } = await vite.ssrLoadModule("/app/mastery.ts");
  const session = (finishedAt, autonomy) => ({ finishedAt, firstScore: autonomy, autonomy, averageHintDepth: 0, transferFirstTry: true });
  const oldProfile = {
    schemaVersion: 11, profileId: "p", nickname: "Bé Na", createdAt: "2026-08-01T00:00:00.000Z",
    discoveryDays: ["2026-09-01", "2026-09-02", "2026-09-03"],
    diagnostic: { correct: 12, total: 18, percent: 67, placement: "x", finishedAt: "2026-08-01T00:00:00.000Z", scores: Object.fromEntries(["number", "calculation", "measurement", "geometry", "data", "word"].map((id) => [id, { correct: 2, total: 3, percent: id === "word" ? 33 : 67, status: "developing" }])) },
    missionRecords: {
      // Từng đạt 90 (lưu bằng Math.max) nhưng hai buổi gần đây chỉ 50 và 40.
      "number-1": { bestFirstScore: 100, autonomy: 90, completedCount: 3, reflection: "Con thích dãy số.", focusNeeds: [], sessions: [session("2026-09-01T10:00:00.000Z", 90), session("2026-09-02T10:00:00.000Z", 50), session("2026-09-03T10:00:00.000Z", 40)] },
      // Bản ghi rất cũ: không có danh sách buổi học.
      "calculation-1": { bestFirstScore: 75, autonomy: 60, completedCount: 1, reflection: "", focusNeeds: [] },
    },
    enrichmentCompleted: ["w01-dieu-tra-quy-luat"], sparkBonus: 40, selfReliantBadges: 2, cognitiveStates: {}, fossilShieldUses: [],
    dinoCollection: { "rex-ti-hon": { stage: "con-non", shards: 0 } }, checkIns: [],
  };
  const store = new Map([[STORAGE_KEY, JSON.stringify(oldProfile)], [STORAGE_SCHEMA_KEY, "12"]]);
  const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => { store.set(key, value); } };
  const migrated = migrateStorageData(storage);

  assert.equal(STORAGE_SCHEMA, 13);
  assert.equal(store.get(STORAGE_SCHEMA_KEY), "13");
  assert.equal(store.get(STORAGE_BACKUP_KEY_V13), JSON.stringify(oldProfile), "giữ bản sao nguyên văn trước khi nâng cấp");

  // Không mất gì.
  for (const field of ["profileId", "nickname", "createdAt", "discoveryDays", "diagnostic", "enrichmentCompleted", "sparkBonus", "selfReliantBadges", "dinoCollection", "checkIns"]) {
    assert.deepEqual(migrated[field], oldProfile[field], field);
  }
  const number1 = migrated.missionRecords["number-1"];
  assert.equal(number1.completedCount, 3);
  assert.equal(number1.reflection, "Con thích dãy số.");
  assert.equal(number1.sessions.length, 3);
  assert.equal(number1.bestFirstScore, 100);

  // Mức cao nhất được giữ riêng để mở khoá; mức trượt phản ánh các buổi gần đây.
  assert.equal(number1.bestAutonomy, 90);
  assert.equal(number1.autonomy, 60, "90 → 0,6×90+0,4×50 = 74 → 0,6×74+0,4×40 = 60");
  assert.ok(number1.bestAutonomy >= 55, "chặng kế tiếp vẫn mở");
  assert.deepEqual([migrated.missionRecords["calculation-1"].bestAutonomy, migrated.missionRecords["calculation-1"].autonomy], [60, 60]);

  // Mức thành thạo theo miền: bắt đầu từ bài đầu vào rồi trộn các buổi đã lưu.
  assert.equal(migrated.mastery.number, 56, "67 → 76 → 66 → 56");
  assert.equal(bandForMastery(migrated.mastery.number), "core", "không còn kẹt ở Bứt phá");
  assert.equal(migrated.mastery.calculation, 64, "0,6×67 + 0,4×60");
  assert.equal(migrated.mastery.word, 33, "miền chưa học lấy từ bài đầu vào");
  assert.equal(migrated.mastery.geometry, 67);

  // Chạy lại nhiều lần vẫn cho cùng kết quả.
  assert.deepEqual(upgradeProfileData(migrated), migrated);
  assert.deepEqual(migrateStorageData(storage), migrated);

  // Hồ sơ chưa làm bài đầu vào và chưa học gì: mọi miền ở mức mặc định "Vừa sức".
  const empty = upgradeProfileData({ profileId: "new" });
  assert.deepEqual(Object.values(empty.mastery), [65, 65, 65, 65, 65, 65]);
});

test("giải hai cách: phải nhập một phép tính khác cho cùng kết quả", async () => {
  const { checkSecondWay, evaluateExpression, secondWayQuestion, applyExpressionKey } = await vite.ssrLoadModule("/app/second-strategy.ts");
  assert.equal(evaluateExpression("300 + 36"), 336);
  assert.equal(evaluateExpression("(9 + 6) × 2"), 30);
  assert.equal(evaluateExpression("48 : 6 − 2"), 6);
  assert.equal(evaluateExpression("2 + 3 × 4"), 14);
  assert.equal(evaluateExpression("7 : 0"), null);
  assert.equal(evaluateExpression("3 + "), null);
  assert.equal(evaluateExpression("alert(1)"), null);

  assert.equal(checkSecondWay("300 + 36", 336).reason, "ok");
  assert.equal(checkSecondWay("340 − 4", 336).ok, true);
  assert.equal(checkSecondWay("", 336).reason, "empty");
  assert.equal(checkSecondWay("336", 336).reason, "no-operator");
  assert.equal(checkSecondWay("300 + 35", 336).reason, "wrong");
  assert.equal(checkSecondWay("336 + 0", 336).reason, "trivial");
  assert.equal(checkSecondWay("336 × 1", 336).reason, "trivial");
  assert.equal(checkSecondWay("1 × 336", 336).reason, "trivial");
  assert.equal(checkSecondWay("(300 + ", 336).reason, "invalid");
  assert.equal(checkSecondWay("100 + 1", 101).reason, "ok", "số 1 và 0 trong một phép tính thật vẫn hợp lệ");
  assert.equal(checkSecondWay("10 × 10", 100).reason, "ok");

  let typed = "";
  for (const key of ["3", "0", "0", "+", "3", "6"]) typed = applyExpressionKey(typed, key);
  assert.equal(typed, "300 + 36");
  assert.equal(applyExpressionKey(typed, "backspace"), "300 + 3");
  assert.equal(applyExpressionKey("300 + ", "backspace"), "300");
  assert.equal(applyExpressionKey(typed, "clear"), "");

  const questions = [
    { type: "choice", answer: "Có", prompt: "a" },
    { type: "number", answer: "2", prompt: "b" },
    { type: "number", answer: "336", prompt: "c" },
    { type: "number", answer: "12", prompt: "d" },
  ];
  assert.equal(secondWayQuestion(questions).prompt, "c", "chọn câu có kết quả lớn nhất: dễ tách ghép nhất");
  assert.equal(secondWayQuestion(questions.slice(0, 2)), null);
});

test("cổng phụ huynh hỏi phần trăm, không hỏi bảng nhân", async () => {
  const { createGateChallenge, checkGateAnswer, GATE_PERCENTS } = await vite.ssrLoadModule("/app/parent-gate.ts");
  let seed = 1;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const prompts = new Set();
  for (let index = 0; index < 400; index += 1) {
    const challenge = createGateChallenge(random);
    assert.ok(GATE_PERCENTS.includes(challenge.percent));
    assert.ok(![10, 50, 100].includes(challenge.percent));
    assert.ok(challenge.base >= 120 && challenge.base <= 480 && challenge.base % 20 === 0);
    assert.ok(Number.isInteger(challenge.answer) && challenge.answer > 0 && challenge.answer < 1000);
    assert.equal(challenge.answer * 100, challenge.percent * challenge.base);
    assert.match(challenge.prompt, /^\d+% của \d+ = \?$/);
    assert.equal(checkGateAnswer(challenge, String(challenge.answer)), true);
    assert.equal(checkGateAnswer(challenge, String(challenge.answer + 1)), false);
    prompts.add(challenge.prompt);
  }
  assert.ok(prompts.size > 60, "đủ nhiều câu khác nhau để không thuộc lòng được");
  assert.equal(createGateChallenge(() => 0.999999).base, 480);
});

test("ghi âm phản tư: khoá theo nhiệm vụ và tự dọn bản ghi cũ", async () => {
  const { voiceNoteKey, voiceNotesToPrune, voiceRecordingSupported, loadVoiceNote, VOICE_MAX_NOTES } = await vite.ssrLoadModule("/app/voice-notes.ts");
  assert.equal(voiceNoteKey("word-3"), "mission:word-3");
  const notes = Array.from({ length: VOICE_MAX_NOTES + 3 }, (_, index) => ({ key: `k${index}`, savedAt: `2026-09-${String(index + 1).padStart(2, "0")}` }));
  assert.deepEqual(voiceNotesToPrune(notes).sort(), ["k0", "k1", "k2"]);
  assert.deepEqual(voiceNotesToPrune(notes.slice(0, 5)), []);
  // Môi trường không có micro/IndexedDB: không ném lỗi, chỉ báo là không hỗ trợ.
  assert.equal(voiceRecordingSupported(), false);
  assert.equal(await loadVoiceNote("mission:word-3"), null);
});

test("phần lớn buổi học có câu điền số để giải hai cách", async () => {
  const { secondWayQuestion } = await vite.ssrLoadModule("/app/second-strategy.ts");
  const { createMissionEdition, VARIANTS_PER_MISSION } = await vite.ssrLoadModule("/app/mission-variants.ts");
  const { ALL_DEEP_MISSIONS } = await vite.ssrLoadModule("/app/curriculum.ts");
  const spokenOnly = new Set();
  for (const mission of ALL_DEEP_MISSIONS) {
    for (let completed = 0; completed < VARIANTS_PER_MISSION; completed += 1) {
      const edition = createMissionEdition(mission, completed, 70);
      if (!secondWayQuestion([...edition.mission.deepPractice, edition.mission.transfer])) spokenOnly.add(mission.id);
    }
  }
  // Những nhiệm vụ này không có câu tính số đủ lớn: cách thứ hai được kể bằng lời phản tư.
  // (calculation-3: vài phiên bản có đáp án nhỏ hơn 10.)
  assert.deepEqual([...spokenOnly].sort(), ["calculation-3", "data-3", "data-5", "data-6", "geometry-4"]);
});
