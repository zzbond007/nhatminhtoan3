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

test("marks a question for review only after all three hint tiers were used", async () => {
  const { nextSkillLabRecord } = await vite.ssrLoadModule("/app/skill-lab.ts");

  const exploring = nextSkillLabRecord(undefined, false, 0, "2026-09-26");
  assert.equal(exploring.needsReview, false, "sai khi chưa dùng gợi ý là đang khám phá");
  assert.equal(nextSkillLabRecord(exploring, false, 2, "2026-09-26").needsReview, false);
  const stuck = nextSkillLabRecord(exploring, false, 3, "2026-09-26");
  assert.equal(stuck.needsReview, true);
  assert.equal(stuck.attempts, 3 - 1);

  const once = nextSkillLabRecord(stuck, true, 0, "2026-09-27");
  assert.equal(once.needsReview, true, "cần đúng 2 lần liên tiếp mới ra khỏi hàng ôn");
  assert.equal(nextSkillLabRecord(once, true, 0, "2026-09-28").needsReview, false);
});

test("puts this week's focus strands first in the spiral session", async () => {
  const { buildSkillLabSession, WEEKLY_FOCUS_STRANDS, FOCUS_QUESTIONS_PER_SESSION } = await vite.ssrLoadModule("/app/skill-lab.ts");

  const focus = WEEKLY_FOCUS_STRANDS.geometry;
  const session = buildSkillLabSession({}, 42, "spiral", 10, focus);
  assert.equal(session.length, 10);
  assert.ok(session.slice(0, FOCUS_QUESTIONS_PER_SESSION).every((question) => focus.includes(question.strand)));
  assert.equal(new Set(session.map((question) => question.id)).size, 10);
  assert.ok(new Set(session.map((question) => question.strand)).size >= 6, "phần còn lại vẫn trộn nhiều mảng");
  assert.deepEqual(Object.keys(WEEKLY_FOCUS_STRANDS).sort(), ["calculation", "data", "geometry", "measurement", "number", "word"]);
});

test("brave eggs, rare bonus and one shard award per mission edition", async () => {
  const { BRAVE_RARE_BONUS, countBraveAnswers, editionAlreadyRewarded, markEditionRewarded, missionRareChance } = await vite.ssrLoadModule("/app/dino/dino-rewards.ts");

  assert.equal(countBraveAnswers([true, true, false, true, null], [0, 1, 0, 0, 0]), 2);
  assert.equal(missionRareChance({ band: "core", usedTwoStrategies: false }, true), BRAVE_RARE_BONUS);
  assert.equal(missionRareChance({ band: "core", usedTwoStrategies: false }, false), 0);

  let rewarded = markEditionRewarded([], "number-1-v1-core");
  assert.equal(editionAlreadyRewarded(rewarded, "number-1-v1-core"), true);
  assert.equal(editionAlreadyRewarded(rewarded, "number-1-v2-core"), false);
  assert.equal(markEditionRewarded(rewarded, "number-1-v1-core"), rewarded);
  for (let index = 0; index < 700; index += 1) rewarded = markEditionRewarded(rewarded, `x-${index}`);
  assert.equal(rewarded.length, 600);
});

test("monthly check-in: 9 fresh questions every 4 weeks, scored per domain", async () => {
  const { buildCheckIn, checkInDueMonth, scoreCheckIn, normalizeCheckIns, CHECKIN_SIZE } = await vite.ssrLoadModule("/app/monthly-checkin.ts");
  const { DIAGNOSTIC_QUESTIONS } = await vite.ssrLoadModule("/app/content.ts");

  assert.equal(checkInDueMonth(3, 0), null);
  assert.equal(checkInDueMonth(4, 0), 1);
  assert.equal(checkInDueMonth(7, 1), null);
  assert.equal(checkInDueMonth(36, 9), null);

  const reached = { number: 3, calculation: 2, measurement: 1, geometry: 1, data: 1, word: 2 };
  const diagnosticPrompts = new Set(DIAGNOSTIC_QUESTIONS.map((question) => question.prompt));
  const allPrompts = new Set();
  for (let month = 1; month <= 9; month += 1) {
    const items = buildCheckIn(month, reached, allPrompts);
    assert.equal(items.length, CHECKIN_SIZE, `tháng ${month}`);
    assert.equal(new Set(items.map((item) => item.id)).size, CHECKIN_SIZE);
    assert.equal(new Set(items.filter((item) => item.kind === "vong-quanh").map((item) => item.domain)).size, 6);
    items.forEach((item) => {
      const question = item.question;
      assert.ok(!diagnosticPrompts.has(question.prompt));
      assert.ok(!allPrompts.has(question.prompt), `trùng câu giữa các tháng: ${question.prompt}`);
      allPrompts.add(question.prompt);
      if (question.type === "number") assert.match(question.answer, /^-?\d+$/);
      else assert.ok(question.options.includes(question.answer));
    });
  }

  const items = buildCheckIn(2, reached);
  const result = scoreCheckIn(2, items, items.map((_, index) => index % 2 === 0), "2026-09-26T00:00:00.000Z");
  assert.equal(result.total, 9);
  assert.equal(result.correct, 5);
  assert.equal(Object.values(result.scores).reduce((sum, tally) => sum + tally.total, 0), 9);
  assert.deepEqual(normalizeCheckIns([result, { ...result }, { month: 99 }, "rác"]), [result]);
});

test("ability map: radar with six axes and friendly insights", async () => {
  const { AbilityRadar } = await vite.ssrLoadModule("/components/ability-radar.tsx");
  const { abilityInsights } = await vite.ssrLoadModule("/app/monthly-checkin.ts");
  const axes = ["number", "calculation", "measurement", "geometry", "data", "word"].map((id) => ({ id, label: id }));
  const values = { number: 100, calculation: 67, measurement: 33, geometry: 0, data: 67, word: 100 };

  const markup = renderToStaticMarkup(React.createElement(AbilityRadar, { title: "Bản đồ", axes, series: [{ label: "Đầu vào", values, tone: "baseline" }, { label: "Tháng 1", values, tone: "current" }] }));
  assert.equal((markup.match(/class="spoke"/g) ?? []).length, 6);
  assert.equal((markup.match(/<polygon/g) ?? []).length, 3 + 2);
  assert.match(markup, /aria-label="Bản đồ\. Đầu vào: number 100%/);

  const tally = (percent) => ({ correct: percent / 100 * 3, total: 3 });
  const lines = abilityInsights(Object.fromEntries(Object.entries(values).map(([id, percent]) => [id, tally(percent)])), (id) => `miền ${id}`, () => "Nhiệm vụ mẫu");
  assert.match(lines[0], /mạnh về miền number/);
  assert.match(lines[1], /miền geometry.*Nhiệm vụ mẫu/);
  const even = abilityInsights(Object.fromEntries(Object.keys(values).map((id) => [id, tally(67)])), (id) => id, () => "x");
  assert.match(even[0], /lớn đều nhau/);
});

test("parent prompt cards give three open questions and two things to avoid per domain", async () => {
  const { PARENT_PROMPTS, parentPromptsFor } = await vite.ssrLoadModule("/app/parent-prompts.ts");
  for (const card of Object.values(PARENT_PROMPTS)) {
    assert.equal(card.ask.length, 3);
    assert.equal(card.avoid.length, 2);
  }
  const card = parentPromptsFor("number", "Săn quy luật trên lịch");
  assert.match(card.ask[0], /“Săn quy luật trên lịch”/);
});

test("hatch reveal shows the egg halves and the new dinosaur", async () => {
  const { HatchReveal } = await vite.ssrLoadModule("/app/dino/dino-world.tsx");
  const { DINO_SPECIES } = await vite.ssrLoadModule("/app/dino/dino-species.ts");
  const markup = renderToStaticMarkup(React.createElement(HatchReveal, { kind: DINO_SPECIES[0], soundOn: false, caption: "Rex Tí Hon vừa chui ra khỏi trứng!" }));
  assert.equal((markup.match(/hatch-reveal-egg/g) ?? []).length, 2);
  assert.match(markup, /hatch-reveal-dino/);
  assert.match(markup, /aria-label="Rex Tí Hon vừa chui ra khỏi trứng!"/);
});
