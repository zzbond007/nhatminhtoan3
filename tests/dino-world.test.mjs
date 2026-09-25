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

const loadRewards = () => vite.ssrLoadModule("/app/dino/dino-rewards.ts");

test("draws 48 distinct dinosaurs whose body visibly grows by stage", async () => {
  const { DinoFigure } = await vite.ssrLoadModule("/app/dino/dino-art.tsx");
  const { DINO_RARE_SPECIES, DINO_SPECIES } = await vite.ssrLoadModule("/app/dino/dino-species.ts");
  const kinds = [...DINO_SPECIES, ...DINO_RARE_SPECIES];
  assert.equal(kinds.length, 48);
  assert.equal(new Set(kinds.map((kind) => kind.id)).size, 48);
  assert.deepEqual(new Set(kinds.map((kind) => kind.archetype)), new Set(["stripe", "horn", "longneck", "plate", "flock", "predator"]));

  const adults = kinds.map((kind) => renderToStaticMarkup(React.createElement(DinoFigure, { kind })));
  assert.equal(new Set(adults).size, 48, "mỗi loài phải có hình vẽ khác nhau");

  const rex = DINO_SPECIES.find((kind) => kind.id === "rex-ti-hon");
  const scaleOf = (stage) => Number(/scale\(([\d.]+)\) translate\(-80 -111\)/.exec(renderToStaticMarkup(React.createElement(DinoFigure, { kind: rex, stage })))[1]);
  assert.ok(scaleOf("con-non") < scaleOf("thieu-nien") && scaleOf("thieu-nien") < scaleOf("truong-thanh"));

  const locked = renderToStaticMarkup(React.createElement(DinoFigure, { kind: rex, silhouette: true, title: "Loài chưa khám phá" }));
  assert.match(locked, /class="dino-art\s+silhouette/);
  assert.match(locked, />\?</);
  assert.doesNotMatch(locked, /Rex Tí Hon/);
});

test("rare finds depend on chance and never repeat a species", async () => {
  const { missionRareChance, rollRareFind, OPEN_TASK_RARE_CHANCE } = await loadRewards();

  assert.equal(missionRareChance({ band: "core", usedTwoStrategies: false }), 0);
  assert.equal(missionRareChance({ band: "stretch", usedTwoStrategies: true }), 0.25);
  assert.equal(OPEN_TASK_RARE_CHANCE, 0.4);

  const miss = rollRareFind({}, 0.25, { chance: 0.9, pick: 0, legendary: 0.9 }, "but-pha", "2026-09-25");
  assert.equal(miss.foundId, null);

  let rares = {};
  const found = new Set();
  for (let index = 0; index < 8; index += 1) {
    const roll = rollRareFind(rares, 1, { chance: 0, pick: 0.5, legendary: 0.9 }, "bai-toan-mo", "2026-09-25");
    rares = roll.rares;
    if (roll.foundId) found.add(roll.foundId);
  }
  assert.equal(found.size, 6, "chỉ 6 loài thuộc Đảo Bí Ẩn; loài trạm ẩn để dành cho Hành trình");
  assert.ok([...found].every((id) => rares[id].stage === "con-non"));
});

test("mystery eggs appear after a hidden 3–7 sessions and hatch rares, then shiny variants", async () => {
  const { advanceMysteryEgg, createMysteryEgg, openMysteryEgg } = await loadRewards();

  assert.equal(createMysteryEgg(0).target, 3);
  assert.equal(createMysteryEgg(0.999).target, 7);

  let state = createMysteryEgg(0.3);
  for (let index = 0; index < state.target - 1; index += 1) state = advanceMysteryEgg(state);
  assert.equal(state.ready, false);
  state = advanceMysteryEgg(state);
  assert.equal(state.ready, true);
  assert.equal(advanceMysteryEgg(state).sessionsSince, state.sessionsSince, "trứng đang chờ không đếm thêm");

  const opened = openMysteryEgg({}, [], ["rex-ti-hon"], state, { pick: 0, legendary: 0, next: 0.5 }, "2026-09-25");
  assert.ok(opened.foundId);
  assert.equal(opened.state.ready, false);
  assert.equal(opened.state.sessionsSince, 0);

  const allRandom = ["sino-duoi-soc", "kosmo-nhieu-sung", "ourano-buom-hien", "theri-vuot-dai", "quetzal-sai-canh", "giga-chua-te"];
  const owned = Object.fromEntries(allRandom.map((id) => [id, { rarity: "hiem", stage: "con-non", growth: 0, source: "trung-bi-an", foundAt: "" }]));
  const shiny = openMysteryEgg(owned, [], ["rex-ti-hon"], { sessionsSince: 5, target: 5, ready: true }, { pick: 0, legendary: 0, next: 0 }, "2026-09-25");
  assert.equal(shiny.foundId, null);
  assert.equal(shiny.shinyId, "rex-ti-hon");
  assert.deepEqual(shiny.shinies, ["rex-ti-hon"]);
});

test("hidden journey stations give their reserved species once", async () => {
  const { branchSpeciesForWeek, claimBranchStation } = await loadRewards();

  assert.deepEqual([6, 12, 18, 24, 30, 36].map((week) => Boolean(branchSpeciesForWeek(week))), [true, true, true, true, true, true]);
  assert.equal(branchSpeciesForWeek(7), undefined);
  const first = claimBranchStation({}, 6, "2026-09-25");
  assert.equal(first.foundId, "psitta-mo-vet");
  assert.equal(claimBranchStation(first.rares, 6, "2026-09-25").foundId, null);
});

test("nest care adds bond once per action per day and rare companions grow with lessons", async () => {
  const { careForCompanion, createNest, growRareCompanion, bondLabel } = await loadRewards();

  let nest = { ...createNest(), companionId: "rex-ti-hon" };
  let result = careForCompanion(nest, "cho-an", "2026-09-25");
  assert.equal(result.gained, 10);
  nest = result.nest;
  assert.equal(careForCompanion(nest, "cho-an", "2026-09-25").gained, 0);
  assert.equal(careForCompanion(nest, "cho-an", "2026-09-26").gained, 10);
  assert.equal(bondLabel(10), "Mới quen");
  assert.equal(bondLabel(75), "Tri kỷ");

  let rares = { "giga-chua-te": { rarity: "huyen-thoai", stage: "con-non", growth: 0, source: "trung-bi-an", foundAt: "" } };
  const stages = [];
  for (let index = 0; index < 5; index += 1) {
    rares = growRareCompanion(rares, "giga-chua-te");
    stages.push(rares["giga-chua-te"].stage);
  }
  assert.deepEqual(stages, ["con-non", "thieu-nien", "thieu-nien", "thieu-nien", "truong-thanh"]);
  assert.deepEqual(growRareCompanion(rares, "rex-ti-hon"), rares);
});

test("learning streak forgives up to two rest days a month", async () => {
  const { learningStreak } = await vite.ssrLoadModule("/app/learning-streak.ts");

  const withOneGap = learningStreak(["2026-09-20", "2026-09-21", "2026-09-23", "2026-09-24"], "2026-09-25");
  assert.deepEqual({ streak: withOneGap.streak, learnedToday: withOneGap.learnedToday, restDays: withOneGap.restDays }, { streak: 4, learnedToday: false, restDays: ["2026-09-22"] });
  assert.equal(withOneGap.restUsedThisMonth, 1);

  const tooManyGaps = learningStreak(["2026-09-10", "2026-09-14", "2026-09-15"], "2026-09-15");
  assert.equal(tooManyGaps.streak, 2);

  assert.equal(learningStreak([], "2026-09-25").streak, 0);
  assert.equal(learningStreak(["2026-09-25"], "2026-09-25").learnedToday, true);
});

test("assessment visuals make d1, d3 and w3 concrete", async () => {
  const { DIAGNOSTIC_QUESTIONS } = await vite.ssrLoadModule("/app/content.ts");
  const { DataChart } = await vite.ssrLoadModule("/components/data-chart.tsx");
  const { HeightOrderVisual, SampleDotsVisual } = await vite.ssrLoadModule("/components/diagnostic-visuals.tsx");
  const find = (id) => DIAGNOSTIC_QUESTIONS.find((question) => question.id === id);

  const chart = renderToStaticMarkup(React.createElement(DataChart, { question: find("d1"), color: "#1b9a83" }));
  assert.deepEqual([...chart.matchAll(/class="data-chart-value"[^>]*>(\d+)</g)].map((match) => Number(match[1])), [5, 9, 3, 7]);
  assert.match(chart, /aria-label="Số trang: T2 5, T3 9, T4 3, T5 7"/);

  const d3 = find("d3");
  assert.equal(d3.answer, "Không, mẫu khảo sát chưa đủ");
  const dots = renderToStaticMarkup(React.createElement(SampleDotsVisual, { visual: d3.visual }));
  assert.equal((dots.match(/<span class="(?:liked|asked|)"><\/span>/g) ?? []).length, 30);
  assert.equal((dots.match(/<span class="liked"><\/span>/g) ?? []).length, 6);
  assert.equal((dots.match(/<span class="asked"><\/span>/g) ?? []).length, 4);

  const w3 = find("w3");
  assert.equal(w3.visual.kind, "height-order");
  assert.notEqual(w3.visual.people[0], w3.answer, "không đặt đáp án đúng lên đầu danh sách");
  const board = renderToStaticMarkup(React.createElement(HeightOrderVisual, { visual: w3.visual, onArranged: () => {} }));
  assert.match(board, /An cao hơn Bình\./);
  assert.equal((board.match(/<button/g) ?? []).length, 3);
});
