// Giai đoạn 1: ngày theo giờ địa phương, phiên bản cố định trong buổi học, tia sáng thực nhận, xáo trộn có hạt giống.
process.env.TZ = "Asia/Ho_Chi_Minh";

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

test("ngày học được ghi theo giờ địa phương, không theo giờ UTC", async () => {
  const { localDayKey, localCalendarDayIndex } = await vite.ssrLoadModule("/app/calendar-day.ts");
  // 6 giờ 30 sáng 10/03 ở Việt Nam vẫn là 23:30 ngày 09/03 theo giờ UTC.
  const earlyMorning = new Date("2026-03-09T23:30:00.000Z");
  assert.equal(earlyMorning.getHours(), 6, "test phải chạy ở múi giờ Việt Nam");
  assert.equal(earlyMorning.toISOString().slice(0, 10), "2026-03-09");
  assert.equal(localDayKey(earlyMorning), "2026-03-10");
  // Khoá ngày và chỉ số ngày (câu đố ngày) đổi cùng lúc, đúng nửa đêm địa phương.
  const beforeMidnight = new Date("2026-03-10T16:59:00.000Z");
  const afterMidnight = new Date("2026-03-10T17:01:00.000Z");
  assert.equal(localDayKey(beforeMidnight), "2026-03-10");
  assert.equal(localDayKey(afterMidnight), "2026-03-11");
  assert.equal(localCalendarDayIndex(afterMidnight) - localCalendarDayIndex(beforeMidnight), 1);
  assert.equal(localCalendarDayIndex(earlyMorning), localCalendarDayIndex(beforeMidnight));
  assert.equal(localDayKey(new Date(2026, 0, 5)), "2026-01-05");
});

test("hồ sơ cũ giữ nguyên chuỗi ngày sau khi chuyển sang ngày địa phương", async () => {
  const { migrateStorageData, STORAGE_KEY } = await vite.ssrLoadModule("/app/storage-migration.ts");
  const { learningStreak } = await vite.ssrLoadModule("/app/learning-streak.ts");
  const { fossilMuseum } = await vite.ssrLoadModule("/app/fossil-streak.ts");
  const { localDayKey } = await vite.ssrLoadModule("/app/calendar-day.ts");
  // Hồ sơ cũ: các ngày được ghi bằng toISOString() (UTC) — cùng định dạng YYYY-MM-DD.
  const oldDays = ["2026-03-04", "2026-03-05", "2026-03-06", "2026-03-07", "2026-03-08", "2026-03-09"];
  const oldProfile = { schemaVersion: 11, profileId: "p", nickname: "Bé", discoveryDays: oldDays, missionRecords: { "number-1": { completedCount: 2, autonomy: 70, reflection: "" } } };
  const store = new Map([[STORAGE_KEY, JSON.stringify(oldProfile)]]);
  const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => { store.set(key, value); } };
  const migrated = migrateStorageData(storage);
  assert.deepEqual(migrated.discoveryDays, oldDays, "không ngày học nào bị mất hay bị đổi");
  assert.deepEqual(migrated.missionRecords, oldProfile.missionRecords);

  // Sáng 10/03 (giờ Việt Nam), trước 7 giờ: chuỗi 6 ngày vẫn còn nguyên và buổi học mới nối tiếp thành 7.
  const today = localDayKey(new Date("2026-03-09T23:30:00.000Z"));
  assert.equal(learningStreak(migrated.discoveryDays, today).streak, 6);
  const withToday = [...migrated.discoveryDays, today];
  assert.equal(learningStreak(withToday, today).streak, 7);
  assert.equal(new Set(withToday).size, 7, "buổi sáng sớm không bị ghi đè lên ngày hôm trước");
  assert.ok(fossilMuseum(withToday, [], today));
});

test("phiên bản bài luyện đứng yên suốt một buổi học", async () => {
  const { beginMissionSession, editionInputs } = await vite.ssrLoadModule("/app/mission-session.ts");
  const { createMissionEdition } = await vite.ssrLoadModule("/app/mission-variants.ts");
  const { ALL_DEEP_MISSIONS } = await vite.ssrLoadModule("/app/curriculum.ts");
  const mission = ALL_DEEP_MISSIONS.find((item) => item.id === "calculation-1");
  const edition = (session, record) => {
    const inputs = editionInputs(session, mission.id, record);
    return createMissionEdition(mission, inputs.completedCount, inputs.autonomy);
  };

  const before = { completedCount: 1, autonomy: 70 };
  const session = beginMissionSession(mission.id, before, 500);
  const during = edition(session, before);
  // Hoàn thành buổi học: completedCount tăng và autonomy đổi — màn kết quả vẫn phải là phiên bản vừa làm.
  const afterRecord = { completedCount: 2, autonomy: 95 };
  const onResultScreen = edition(session, afterRecord);
  assert.equal(onResultScreen.id, during.id);
  assert.deepEqual(onResultScreen.mission.deepPractice.map((q) => q.prompt), during.mission.deepPractice.map((q) => q.prompt));
  // Buổi học kế tiếp mới sang phiên bản mới.
  const next = edition(beginMissionSession(mission.id, afterRecord, 640), afterRecord);
  assert.notEqual(next.id, during.id);
  // Ảnh chụp của nhiệm vụ khác không ảnh hưởng.
  assert.deepEqual(editionInputs(beginMissionSession("word-1", undefined, 0), mission.id, afterRecord), { completedCount: 2, autonomy: 95 });
  assert.deepEqual(editionInputs(null, mission.id, undefined), { completedCount: 0, autonomy: 0 });
});

test("màn kết quả hiện số tia sáng thực nhận", async () => {
  const { beginMissionSession, sessionSparkGain, sparkPointsOf } = await vite.ssrLoadModule("/app/mission-session.ts");
  const profile = {
    diagnostic: {},
    missionRecords: { "number-1": { completedCount: 1, autonomy: 70, reflection: "" } },
    enrichmentCompleted: ["t1"],
    skillLabRecords: { a: { streak: 2, needsReview: false }, b: { streak: 2, needsReview: true } },
    sparkBonus: 7,
  };
  assert.equal(sparkPointsOf(profile), 60 + 120 + 80 + 15 + 7);
  const session = beginMissionSession("number-1", profile.missionRecords["number-1"], sparkPointsOf(profile));
  // Buổi học: +120, lần đầu viết phản tư +20, thưởng theo gợi ý +23.
  const after = { ...profile, sparkBonus: 30, missionRecords: { "number-1": { completedCount: 2, autonomy: 80, reflection: "Con đã thử hai cách." } } };
  assert.equal(sessionSparkGain(session, sparkPointsOf(after)), 163);
  // Không bao giờ hiện số âm.
  assert.equal(sessionSparkGain(session, sparkPointsOf(profile) - 5), 0);
  assert.equal(sessionSparkGain(null, 999), 120);
});

test("xáo trộn lựa chọn ổn định theo mã câu hỏi và không tạo lựa chọn trùng", async () => {
  const { shuffleById, distinctOptions } = await vite.ssrLoadModule("/app/option-order.ts");
  const items = ["A", "B", "C", "D"];
  assert.deepEqual(shuffleById(items, "q-1"), shuffleById(items, "q-1"));
  assert.deepEqual([...shuffleById(items, "q-1")].sort(), items);
  assert.deepEqual(items, ["A", "B", "C", "D"], "không sửa mảng gốc");
  const orders = new Set(Array.from({ length: 40 }, (_, index) => shuffleById(items, `q-${index}`).join("")));
  assert.ok(orders.size > 10, "mã khác nhau cho nhiều thứ tự khác nhau");
  assert.deepEqual(distinctOptions("8:35", ["8:35", "8:45", "8:45", "8:25"]), ["8:35", "8:45", "8:25"]);
  assert.deepEqual(distinctOptions(6, [6, 36, "6", 12, 24], 4), ["6", "36", "12", "24"]);
});

test("tuần 2: nhiệm vụ tính nhẩm không còn số âm ở bất kỳ phiên bản và dải khó nào", async () => {
  const { createMissionEdition } = await vite.ssrLoadModule("/app/mission-variants.ts");
  const { ALL_DEEP_MISSIONS } = await vite.ssrLoadModule("/app/curriculum.ts");
  const mission = ALL_DEEP_MISSIONS.find((item) => item.id === "calculation-1");
  for (let completed = 0; completed < 36; completed += 1) {
    for (const autonomy of [0, 70, 95]) {
      const edition = createMissionEdition(mission, completed, autonomy);
      const [first, , , fourth] = edition.mission.deepPractice;
      const [, base, add] = first.prompt.match(/(\d+) \+ (\d+)/).map(Number);
      const gap = Math.ceil(base / 100) * 100 - base;
      assert.ok(gap >= 1 && gap <= 5, `${edition.id}: ${base} phải cách số tròn trăm 1–5 đơn vị`);
      assert.equal(Number(first.answer), base + add);
      assert.equal(Number(fourth.answer), add - gap);
      assert.ok(Number(fourth.answer) > 0);
    }
  }
});

test("mọi phiên bản có đúng số câu luyện mà màn nhiệm vụ cấp chỗ ghi nhận", async () => {
  // Trước đây mảng ghi lần thử/gợi ý dài theo nhiệm vụ gốc (3 câu) trong khi phiên bản có 4 câu:
  // câu thứ tư không mở được gợi ý và điểm lần đầu không bao giờ vượt 75%.
  const { createMissionEdition, PRACTICE_PER_EDITION, VARIANTS_PER_MISSION } = await vite.ssrLoadModule("/app/mission-variants.ts");
  const { ALL_DEEP_MISSIONS } = await vite.ssrLoadModule("/app/curriculum.ts");
  assert.equal(PRACTICE_PER_EDITION, 4);
  for (const mission of ALL_DEEP_MISSIONS) {
    for (let completed = 0; completed < VARIANTS_PER_MISSION; completed += 1) {
      const edition = createMissionEdition(mission, completed, 70);
      assert.equal(edition.mission.deepPractice.length, PRACTICE_PER_EDITION, edition.id);
      assert.ok(edition.mission.transfer, edition.id);
    }
  }
});
