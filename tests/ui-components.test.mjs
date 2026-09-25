import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
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

async function readCssTree(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return readCssTree(entryPath);
      }
      return entry.name.endsWith(".css") ? readFile(entryPath, "utf8") : "";
    }),
  );
  return contents.join("\n");
}

test("emits child-friendly and offline-update styles", async () => {
  const css = await readCssTree(path.join(root, "dist"));

  assert.match(css, /font-synthesis:\s*none/);
  assert.match(css, /\.offline-update-box/);
  assert.match(css, /\.offline-status/);
  assert.match(css, /\.update-approval/);
  assert.match(css, /\.mission-edition-banner/);
  assert.match(css, /\.content-governance/);
  assert.match(css, /\.enrichment-card/);
  assert.match(css, /\.nine-month-overview/);
  assert.match(css, /\.months-roadmap/);
  assert.match(css, /\.review-pack-grid/);
  assert.match(css, /\.skill-lab-strip/);
  assert.match(css, /\.skill-lab-card/);
  assert.match(css, /\.math-english-prompt/);
  assert.match(css, /\.dino-island/);
  assert.match(css, /\.dino-nest/);
  assert.match(css, /\.dino-hatch-note/);
  assert.match(css, /\.dino-journey-station/);
  assert.match(css, /\.dino-gallery-card/);
  assert.match(css, /\.dino-nest-scene/);
  assert.match(css, /\.progress-code-box/);
  assert.match(css, /\.storage-notice/);
  assert.match(css, /\.authentic-task/);
  assert.match(css, /@keyframes dino-breathe/);
  assert.match(css, /@media\s*\(width>=768px\)\s*and\s*\(width<=1180px\)/);
});

test("resolves every supported GitHub Pages content route", async () => {
  const { contentRouteWeek, lessonStageIndex, parseContentRoute } =
    await vite.ssrLoadModule("/app/content-route.ts");

  assert.deepEqual(
    parseContentRoute("/nhatminhtoan3/week/1/", "", "/nhatminhtoan3"),
    { kind: "week", id: 1, canonicalPath: "/nhatminhtoan3/week/1/" },
  );
  assert.deepEqual(
    parseContentRoute(
      "/nhatminhtoan3/",
      "?route=%2Ftopic%2F36",
      "/nhatminhtoan3",
    ),
    { kind: "topic", id: 36, canonicalPath: "/nhatminhtoan3/topic/36/" },
  );
  assert.deepEqual(
    parseContentRoute("/nhatminhtoan3/assessment/", "", "/nhatminhtoan3"),
    { kind: "assessment", canonicalPath: "/nhatminhtoan3/assessment/" },
  );
  assert.deepEqual(
    parseContentRoute("/nhatminhtoan3/roadmap", "", "/nhatminhtoan3"),
    { kind: "roadmap", canonicalPath: "/nhatminhtoan3/roadmap/" },
  );
  assert.deepEqual(
    parseContentRoute("/nhatminhtoan3/mission/36/", "", "/nhatminhtoan3"),
    { kind: "mission", id: 36, canonicalPath: "/nhatminhtoan3/mission/36/" },
  );
  assert.deepEqual(
    parseContentRoute("/nhatminhtoan3/open-task/36/", "", "/nhatminhtoan3"),
    { kind: "open-task", id: 36, canonicalPath: "/nhatminhtoan3/open-task/36/" },
  );
  assert.equal(contentRouteWeek({ kind: "lesson", id: 180 }), 36);
  assert.equal(contentRouteWeek({ kind: "mission", id: 12 }), 12);
  assert.equal(contentRouteWeek({ kind: "roadmap", canonicalPath: "/roadmap/" }), null);
  assert.equal(lessonStageIndex(1), 0);
  assert.equal(lessonStageIndex(5), 4);
  assert.equal(parseContentRoute("/week/37"), null);
  assert.equal(parseContentRoute("/lesson/181"), null);
  assert.equal(parseContentRoute("/mission/37"), null);
  assert.equal(parseContentRoute("/open-task/37"), null);
  assert.equal(parseContentRoute("/unrelated/1"), null);
});

test("builds specific, encouraging learning feedback", async () => {
  const { correctOnFirstAttempt, missionStrength, wrongAnswerFeedback } =
    await vite.ssrLoadModule("/app/learning-feedback.ts");

  assert.equal(correctOnFirstAttempt(75, 4), 3);
  assert.equal(correctOnFirstAttempt(101, 4), 4);
  assert.equal(
    missionStrength({ firstScore: 75, averageHintDepth: 0.4, transferFirstTry: true }),
    "Mang ý tưởng sang một bài toán mới",
  );
  assert.equal(
    wrongAnswerFeedback(
      { type: "choice", misconception: "Hãy kiểm tra phép nhân với phần chênh lệch." },
      "50 × 5 − 2",
    ),
    "Con đã chọn “50 × 5 − 2”. Hãy kiểm tra phép nhân với phần chênh lệch.",
  );
});

test("rotates daily content at the user's local midnight", async () => {
  const { localCalendarDayIndex } = await vite.ssrLoadModule("/app/calendar-day.ts");
  const beforeMidnight = new Date(2026, 8, 3, 23, 59, 59);
  const afterMidnight = new Date(2026, 8, 4, 0, 0, 1);
  const laterSameDay = new Date(2026, 8, 4, 18, 30, 0);

  assert.equal(localCalendarDayIndex(afterMidnight), localCalendarDayIndex(laterSameDay));
  assert.equal(localCalendarDayIndex(afterMidnight) - localCalendarDayIndex(beforeMidnight), 1);
});

test("renders the d1 diagnostic chart with all values and accessible context", async () => {
  const { DataChart } = await vite.ssrLoadModule("/components/data-chart.tsx");
  const { DIAGNOSTIC_QUESTIONS } = await vite.ssrLoadModule("/app/content.ts");
  const question = DIAGNOSTIC_QUESTIONS.find((item) => item.id === "d1");
  assert.ok(question?.context);

  const html = renderToStaticMarkup(
    React.createElement(DataChart, { question, color: "#1b9a83" }),
  );
  assert.match(html, /role="img"/);
  assert.match(html, /Số trang: T2 5, T3 9, T4 3, T5 7/);
  assert.match(html, /height:100%/);
  assert.equal((html.match(/<small>/g) ?? []).length, 4);
});

test("covers all 36 weeks and 180 planned sessions", async () => {
  const { ALL_DEEP_MISSIONS } = await vite.ssrLoadModule("/app/curriculum.ts");
  const { PROGRAM_MONTHS, PROGRAM_SESSIONS, PROGRAM_WEEKS, YEAR_WEEKS } = await vite.ssrLoadModule("/app/year-plan.ts");
  const catalog = JSON.parse(await readFile(path.join(root, "public", "content-catalog.json"), "utf8"));
  const packs = await Promise.all(catalog.packs.map((item) => readFile(path.join(root, "public", item.url), "utf8").then(JSON.parse)));
  const tasks = packs.flatMap((pack) => pack.tasks);

  assert.equal(PROGRAM_MONTHS, 9);
  assert.equal(PROGRAM_WEEKS, 36);
  assert.equal(PROGRAM_SESSIONS, 180);
  assert.equal(YEAR_WEEKS.length, 36);
  assert.equal(new Set(YEAR_WEEKS.map((week) => week.missionId)).size, 36);
  assert.equal(new Set(YEAR_WEEKS.map((week) => week.taskId)).size, 36);
  assert.ok(YEAR_WEEKS.every((week) => ALL_DEEP_MISSIONS.some((mission) => mission.id === week.missionId)));
  assert.equal(packs.length, 9);
  assert.equal(tasks.length, 36);
  assert.deepEqual(tasks.map((task) => task.id), YEAR_WEEKS.map((week) => week.taskId));
  assert.deepEqual([...new Set(tasks.map((task) => task.week))].sort((a, b) => a - b), Array.from({ length: 36 }, (_, index) => index + 1));
  for (const domain of ["number", "calculation", "measurement", "geometry", "data", "word"]) {
    assert.equal(tasks.filter((task) => task.domain === domain).length, 6);
  }
});

test("validates all 432 adaptive mission editions", async () => {
  const { ALL_DEEP_MISSIONS } = await vite.ssrLoadModule("/app/curriculum.ts");
  const { createMissionEdition, validateMissionVariants, VARIANTS_PER_MISSION } = await vite.ssrLoadModule("/app/mission-variants.ts");

  assert.equal(ALL_DEEP_MISSIONS.length * VARIANTS_PER_MISSION, 432);
  assert.deepEqual(validateMissionVariants(ALL_DEEP_MISSIONS), []);
  const first = createMissionEdition(ALL_DEEP_MISSIONS[0], 0, 0);
  const repeat = createMissionEdition(ALL_DEEP_MISSIONS[0], 1, 90);
  assert.notEqual(first.id, repeat.id);
  assert.notEqual(first.mission.deepPractice[0].prompt, repeat.mission.deepPractice[0].prompt);
  assert.equal(repeat.difficulty, "stretch");
});

test("forwards progress semantics to the primitive", async () => {
  const { Progress } = await vite.ssrLoadModule("/components/ui/progress.tsx");
  const html = renderToStaticMarkup(React.createElement(Progress, { value: 37 }));

  assert.match(html, /aria-valuenow="37"/);
  assert.match(html, /aria-valuetext="37%"/);
  assert.match(html, /data-state="loading"/);
});

test("emits chart themes for the starter's media dark mode", async () => {
  const { ChartStyle } = await vite.ssrLoadModule("/components/ui/chart.tsx");
  const html = renderToStaticMarkup(
    React.createElement(ChartStyle, {
      id: "contract",
      config: {
        latency: { theme: { light: "#ffffff", dark: "#000000" } },
      },
    }),
  );

  assert.match(html, /\[data-chart=contract\]/);
  assert.match(html, /@media \(prefers-color-scheme: dark\)/);
  assert.doesNotMatch(html, /\.dark/);
});

test("renders sidebar skeletons deterministically", async () => {
  const { SidebarMenuSkeleton } = await vite.ssrLoadModule(
    "/components/ui/sidebar.tsx",
  );
  const first = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));
  const second = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));

  assert.equal(first, second);
  assert.match(first, /--skeleton-width:70%/);
});
