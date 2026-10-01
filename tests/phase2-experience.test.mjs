// Giai đoạn 2 · đợt trải nghiệm: bốn buổi trong tuần khác nhau, bốn học cụ tương tác,
// và hồ sơ cũ vẫn đọc đúng sau khi buổi học có thêm trường `kind`.
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

const plan = await vite.ssrLoadModule("/app/session-plan.ts");
const tools = await vite.ssrLoadModule("/app/lab-tools.ts");
const { ALL_DEEP_MISSIONS } = await vite.ssrLoadModule("/app/curriculum.ts");
const mission = (id) => ALL_DEEP_MISSIONS.find((item) => item.id === id);

test("buổi được chọn theo số lần đã hoàn thành nhiệm vụ của tuần", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 9].map(plan.sessionKindFor), ["curiosity", "strategy", "challenge", "transfer", "review", "review"]);
  assert.deepEqual([0, 1, 2, 3].map((kind) => plan.sessionNumber(plan.sessionKindFor(kind))), [1, 2, 3, 4]);
  assert.equal(plan.sessionNumber("review"), 3, "ôn tập dùng khuôn Buổi 3");
  // Nhãn lấy từ WEEKLY_RHYTHM.
  assert.deepEqual(["curiosity", "strategy", "challenge", "transfer"].map(plan.sessionLabel), ["Khơi tò mò", "Xưởng chiến lược", "Phòng thử thách", "Chuyển giao đời sống"]);
  // Liên kết /lesson/N: buổi 1–4 là nhiệm vụ, buổi 5 là bài toán mở.
  assert.deepEqual([0, 1, 2, 3, 4].map(plan.lessonSessionKind), ["curiosity", "strategy", "challenge", "transfer", null]);
  assert.deepEqual(["curiosity", "strategy", "challenge", "transfer", "review"].map(plan.firstStageOf), ["predict", "strategies", "practice", "practice", "practice"]);
});

test("điểm Buổi 3 giữ đúng công thức cũ; buổi không có chuyển giao không bị phạt", () => {
  const roles = ["practice", "practice", "practice", "practice", "transfer"];
  const old = (first, depths, transferFirst) => {
    const firstScore = Math.round((first.filter(Boolean).length / 4) * 100);
    const average = depths.reduce((sum, value) => sum + value, 0) / depths.length;
    return Math.round(firstScore * .6 + Math.max(0, Math.round(100 - (average / 3) * 100)) * .2 + (transferFirst ? 100 : 40) * .2);
  };
  const cases = [
    [[true, true, true, true, true], [0, 0, 0, 0, 0]],
    [[true, false, true, null, false], [0, 2, 0, 1, 3]],
    [[false, false, false, false, true], [3, 3, 1, 0, 0]],
  ];
  for (const [first, depths] of cases) {
    const score = plan.scoreSession(roles, first, depths);
    assert.equal(score.autonomy, old(first.slice(0, 4), depths, first[4] === true));
    assert.equal(score.transferFirstTry, first[4] === true);
  }
  const twoCases = plan.scoreSession(["case", "case"], [true, true], [0, 0]);
  assert.equal(twoCases.autonomy, 100);
  assert.equal(twoCases.hasTransfer, false);
  // Buổi 4: chuyển giao tính theo tỉ lệ ba câu bối cảnh mới.
  const transfer = plan.scoreSession(["recall", "transfer", "transfer", "transfer"], [true, true, false, true], [0, 0, 1, 0]);
  assert.equal(transfer.firstScore, 100);
  assert.equal(transfer.transferFirstTry, false);
});

test("Buổi 2 ưu tiên câu viết được phép tính thứ hai, giữ thứ tự gốc", () => {
  const q = (id, type, answer, options) => ({ id, type, answer, options, prompt: id, hints: ["a?", "b", "c"], feedbackByAnswer: options ? Object.fromEntries(options.filter((o) => o !== answer).map((o) => [o, "Phản hồi đủ dài cho lựa chọn sai."])) : undefined });
  const list = [q("a", "choice", "X", ["X", "Y"]), q("b", "number", "4"), q("c", "number", "48"), q("d", "number", "120"), q("e", "choice", "Z", ["Z", "W"])];
  assert.deepEqual(plan.pickStrategyQuestions(list).map((item) => item.id), ["c", "d"]);
  assert.deepEqual(plan.pickStrategyQuestions([list[0], list[1], list[4]]).map((item) => item.id), ["a", "e"]);
  assert.deepEqual([list[0], list[1], list[2]].map(plan.twoWayModeFor), ["eliminate", "explain", "expression"]);
});

test("Buổi 4 có câu bối cảnh đời sống riêng cho mọi nhiệm vụ, chung quy ước với bộ sinh đề", () => {
  for (const item of ALL_DEEP_MISSIONS) {
    const support = plan.lifeTransferQuestions(item.id, "support");
    const core = plan.lifeTransferQuestions(item.id, "core");
    assert.equal(core.length, 2, item.id);
    assert.ok(support.every((question) => question.scaffold), `${item.id}: dải Gỡ nút mở sẵn sơ đồ`);
    assert.ok(core.every((question) => !question.scaffold && question.challengeTag === "Đời sống"));
  }
  const built = plan.buildSession(mission("word-1"), 3, 70);
  assert.equal(built.questions[2].question.id, "word-1-doi-song-1");
});

test("lưới ô vuông: chu vi, liền khối, đếm hình chữ nhật, lát viên 2 ô", () => {
  const { shapePerimeter, isConnected, allRects, checkRect, checkMove, checkFind, checkDomino, cellKey, LAB_TOOLS } = tools;
  const block = [cellKey(0, 0), cellKey(0, 1), cellKey(1, 0), cellKey(1, 1)];
  assert.equal(shapePerimeter(block), 8);
  assert.equal(shapePerimeter([cellKey(0, 0), cellKey(0, 1), cellKey(0, 2)]), 8);
  assert.equal(isConnected(block), true);
  assert.equal(isConnected([cellKey(0, 0), cellKey(1, 1)]), false);
  assert.equal(allRects(2, 3).length, 18);
  assert.equal(allRects(1, 4).length, 10);

  const g1 = LAB_TOOLS["geometry-1"].spec;
  assert.equal(checkRect(g1, { w: 4, h: 3 }).ok, true);
  assert.equal(checkRect(g1, { w: 3, h: 4 }).ok, true, "xoay hình vẫn đúng");
  assert.match(checkRect(g1, { w: 6, h: 2 }).message, /gọn hơn/);
  assert.match(checkRect(g1, { w: 5, h: 2 }).message, /10 ô/);
  const m3 = LAB_TOOLS["measurement-3"].spec;
  assert.equal(checkRect(m3, { w: 6, h: 6 }).ok, true);
  assert.match(checkRect(m3, { w: 7, h: 5 }).message, /rộng hơn/);
  assert.match(checkRect(m3, { w: 5, h: 5 }).message, /20 m/);

  const g2 = LAB_TOOLS["geometry-2"].spec;
  assert.equal(checkMove(g2, g2.start, false).ok, false, "chưa dời ô nào thì chu vi chưa đổi");
  assert.match(checkMove(g2, g2.start.slice(1), true).message, /đang cầm/);
  assert.match(checkMove(g2, [...g2.start.slice(1), cellKey(4, 6)], false).message, /liền nhau/);

  const g3 = LAB_TOOLS["geometry-3"].spec;
  assert.equal(checkFind(g3, allRects(2, 3)).ok, true);
  assert.equal(checkFind(g3, [...allRects(2, 3).slice(1), allRects(2, 3)[1]]).ok, false, "tìm trùng không được tính hai lần");

  const g5 = LAB_TOOLS["geometry-5"].spec;
  assert.match(checkDomino(g5, [[cellKey(0, 1), cellKey(0, 2)], [cellKey(1, 0), cellKey(2, 0)]]).message, /bị kẹt/, "ô góc (0,0) bị cô lập");
  assert.match(checkDomino(g5, [[cellKey(0, 0), cellKey(0, 1)]]).message, /Còn 10 ô/);
});

test("đồng hồ đếm được nhiều vòng; biểu đồ cột và sơ đồ đoạn thẳng chấm đúng", () => {
  const { clockDelta, clockText, checkClock, chartBallots, checkChart, checkBar, rowTotal, LAB_TOOLS } = tools;
  assert.equal(clockDelta(11, 0, 12), 1, "qua số 12 theo chiều kim đồng hồ");
  assert.equal(clockDelta(0, 11, 12), -1);
  assert.equal(clockText(8 * 60 + 55), "8:55");
  assert.equal(clockText(24 * 60), "12:00");
  const n5 = LAB_TOOLS["number-5"].spec;
  assert.match(checkClock(n5, 15).message, /chỉ 12 giờ/);
  assert.match(checkClock(n5, 3).message, /Mới trôi qua 3 giờ/, "kim chỉ 12 giờ nhưng mới đi 3 giờ: chưa đủ");
  const m5 = LAB_TOOLS["measurement-5"].spec;
  assert.match(checkClock(m5, 35).message, /8:55/);

  const d1 = LAB_TOOLS["data-1"].spec;
  const ballots = chartBallots(d1);
  assert.equal(ballots.length, 10);
  d1.categories.forEach((category) => assert.equal(ballots.filter((icon) => icon === category.icon).length, category.value));
  assert.notDeepEqual(ballots, [...ballots].sort(), "phiếu được xáo, con phải đếm");
  assert.equal(checkChart(d1, [6, 3, 1]).ok, true);
  assert.match(checkChart(d1, [6, 2, 1]).message, /Leo núi/);

  const w2 = LAB_TOOLS["word-2"].spec;
  assert.equal(rowTotal(w2.rows[0], 4), 6, "tổng số con không đổi khi kéo vạch chia");
  assert.equal(rowTotal(w2.rows[1], 3), 18);
  assert.equal(checkBar(w2, 3).ok, true);
  assert.match(checkBar(w2, 1).message, /còn thiếu 4/);
  const c4 = LAB_TOOLS["calculation-4"].spec;
  for (let x = c4.variable.min; x <= c4.variable.max; x += 1) assert.equal(rowTotal(c4.rows[0], x), 65, "giữ tổng");
});

test("hồ sơ cũ: buổi không có `kind` vẫn tính như trước; buổi Khơi tò mò không đổi mức thành thạo", async () => {
  const { migrateStorageData, upgradeProfileData, STORAGE_KEY, STORAGE_SCHEMA_KEY } = await vite.ssrLoadModule("/app/storage-migration.ts");
  const { replayRecordAutonomy, normalizeMastery, countsTowardMastery } = await vite.ssrLoadModule("/app/mastery.ts");
  const session = (finishedAt, autonomy, kind) => ({ finishedAt, firstScore: autonomy, autonomy, averageHintDepth: 0, transferFirstTry: true, ...(kind ? { kind } : {}) });

  // Hồ sơ v13 lưu trước đợt này: không có trường kind ở buổi nào.
  const stored = {
    schemaVersion: 11, profileId: "p", nickname: "Bé Na", createdAt: "2026-08-01T00:00:00.000Z",
    diagnostic: null, discoveryDays: ["2026-09-01"], enrichmentCompleted: [], sparkBonus: 0, selfReliantBadges: 0, cognitiveStates: {}, fossilShieldUses: [],
    mastery: { number: 70, calculation: 65, measurement: 65, geometry: 65, data: 65, word: 65 },
    missionRecords: { "number-1": { bestFirstScore: 80, autonomy: 74, bestAutonomy: 90, completedCount: 2, reflection: "", focusNeeds: [], sessions: [session("2026-09-01T10:00:00.000Z", 90), session("2026-09-02T10:00:00.000Z", 50)] } },
  };
  const store = new Map([[STORAGE_KEY, JSON.stringify(stored)], [STORAGE_SCHEMA_KEY, "13"]]);
  const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => { store.set(key, value); } };
  const loaded = migrateStorageData(storage);
  assert.deepEqual(loaded.missionRecords, stored.missionRecords, "không đổi bản ghi nào");
  assert.deepEqual(loaded.mastery, stored.mastery, "không đổi mức thành thạo");
  assert.equal(replayRecordAutonomy(stored.missionRecords["number-1"]), 74, "0,6 × 90 + 0,4 × 50");

  // Buổi Khơi tò mò được lưu nhưng bị bỏ qua khi dựng lại mức tự lực và mức thành thạo.
  const withCuriosity = { ...stored.missionRecords["number-1"], sessions: [session("2026-08-31T10:00:00.000Z", 100, "curiosity"), ...stored.missionRecords["number-1"].sessions] };
  assert.equal(replayRecordAutonomy(withCuriosity), 74);
  assert.deepEqual(
    normalizeMastery(undefined, null, { "number-1": withCuriosity }),
    normalizeMastery(undefined, null, { "number-1": stored.missionRecords["number-1"] }),
  );
  assert.equal(countsTowardMastery({ kind: "curiosity" }), false);
  assert.equal(countsTowardMastery({}), true);
  assert.equal(countsTowardMastery({ kind: "strategy" }), true);

  // Lỗi tìm thấy khi thử trên trình duyệt: sau Buổi 1, bản ghi có autonomy 0; Buổi 2 không được trộn với số 0 đó.
  const { nextRecordAutonomy, hasScoredSession } = await vite.ssrLoadModule("/app/mastery.ts");
  const afterCuriosity = { autonomy: 0, sessions: [session("2026-10-01T10:00:00.000Z", 100, "curiosity")] };
  assert.equal(hasScoredSession(afterCuriosity), false);
  assert.equal(nextRecordAutonomy(afterCuriosity, 100, true), 100, "buổi được tính đầu tiên lấy luôn kết quả");
  assert.equal(nextRecordAutonomy(afterCuriosity, 100, false), 0, "Buổi 1 không đổi mức");
  assert.equal(nextRecordAutonomy(undefined, 80, true), 80);
  assert.equal(nextRecordAutonomy({ autonomy: 90, sessions: [session("x", 90, "challenge")] }, 40, true), 70, "0,6 × 90 + 0,4 × 40");
  assert.equal(hasScoredSession({ autonomy: 60 }), true, "bản ghi rất cũ không có danh sách buổi vẫn được tính");

  // Trường mới đi qua bước nâng cấp nguyên vẹn; giá trị lạ được làm sạch khi đọc.
  const upgraded = upgradeProfileData({ ...stored, missionRecords: { "number-1": withCuriosity } });
  assert.equal(upgraded.missionRecords["number-1"].sessions[0].kind, "curiosity");
  assert.equal(plan.normalizeSessionKind("curiosity"), "curiosity");
  assert.equal(plan.normalizeSessionKind("lạ"), undefined);
  assert.equal(plan.normalizeSessionKind(undefined), undefined);
});
