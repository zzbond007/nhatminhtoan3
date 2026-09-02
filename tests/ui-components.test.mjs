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
  assert.match(css, /\.github-profile-gate/);
  assert.match(css, /\.github-sync-box/);
  assert.match(css, /@media\s*\(width>=768px\)\s*and\s*\(width<=1180px\)/);
});

test("encrypts and round-trips the authoritative GitHub profile", async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  let storedContent = "";
  let storedSha = "";
  globalThis.window = { btoa: globalThis.btoa, atob: globalThis.atob };
  globalThis.fetch = async (_url, init = {}) => {
    if (init.method === "PUT") {
      const body = JSON.parse(init.body);
      storedContent = body.content;
      storedSha = `sha-${storedContent.length}`;
      return Response.json({ content: { sha: storedSha } });
    }
    if (!storedContent) return new Response("Not found", { status: 404 });
    return Response.json({ content: storedContent, sha: storedSha });
  };
  try {
    const store = await vite.ssrLoadModule("/app/github-learning-store.ts");
    const connection = {
      token: "github_pat_test_12345678901234567890",
      passphrase: "mat-khau-rat-dai-2026",
    };
    const profile = {
      schemaVersion: 8,
      profileId: "profile-1",
      nickname: "Nhà thám hiểm",
      missionRecords: { "number-1": { completedCount: 1 } },
    };
    const saved = await store.saveGitHubProfile(connection, profile, null);

    assert.equal(saved.sha, storedSha);
    assert.ok(storedContent);
    assert.doesNotMatch(storedContent, /Nhà thám hiểm/);
    const loaded = await store.loadGitHubProfile(connection);
    assert.deepEqual(loaded.profile, profile);
    await assert.rejects(
      () =>
        store.loadGitHubProfile({
          ...connection,
          passphrase: "mat-khau-sai-2026",
        }),
      /profile-decryption-failed/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
  }
});

test("does not persist learning history in Safari", async () => {
  const page = await readFile(path.join(root, "app/page.tsx"), "utf8");
  const store = await readFile(
    path.join(root, "app/github-learning-store.ts"),
    "utf8",
  );

  assert.doesNotMatch(page, /localStorage\.setItem/);
  assert.match(page, /localStorage\.removeItem/);
  assert.match(store, /AES-GCM/);
  assert.match(store, /learning-data/);
  assert.match(store, /profiles\/math-raccoon\.enc\.json/);
});

test("covers all 36 weeks and 180 planned sessions", async () => {
  const { ALL_DEEP_MISSIONS } = await vite.ssrLoadModule("/app/curriculum.ts");
  const { PROGRAM_MONTHS, PROGRAM_SESSIONS, PROGRAM_WEEKS, YEAR_WEEKS } =
    await vite.ssrLoadModule("/app/year-plan.ts");
  const catalog = JSON.parse(
    await readFile(path.join(root, "public", "content-catalog.json"), "utf8"),
  );
  const packs = await Promise.all(
    catalog.packs.map((item) =>
      readFile(path.join(root, "public", item.url), "utf8").then(JSON.parse),
    ),
  );
  const tasks = packs.flatMap((pack) => pack.tasks);

  assert.equal(PROGRAM_MONTHS, 9);
  assert.equal(PROGRAM_WEEKS, 36);
  assert.equal(PROGRAM_SESSIONS, 180);
  assert.equal(YEAR_WEEKS.length, 36);
  assert.equal(new Set(YEAR_WEEKS.map((week) => week.missionId)).size, 36);
  assert.equal(new Set(YEAR_WEEKS.map((week) => week.taskId)).size, 36);
  assert.ok(
    YEAR_WEEKS.every((week) =>
      ALL_DEEP_MISSIONS.some((mission) => mission.id === week.missionId),
    ),
  );
  assert.equal(packs.length, 9);
  assert.equal(tasks.length, 36);
  assert.deepEqual(
    tasks.map((task) => task.id),
    YEAR_WEEKS.map((week) => week.taskId),
  );
  assert.deepEqual(
    [...new Set(tasks.map((task) => task.week))].sort((a, b) => a - b),
    Array.from({ length: 36 }, (_, index) => index + 1),
  );
  for (const domain of [
    "number",
    "calculation",
    "measurement",
    "geometry",
    "data",
    "word",
  ]) {
    assert.equal(tasks.filter((task) => task.domain === domain).length, 6);
  }
});

test("validates all 432 adaptive mission editions", async () => {
  const { ALL_DEEP_MISSIONS } = await vite.ssrLoadModule("/app/curriculum.ts");
  const {
    createMissionEdition,
    validateMissionVariants,
    VARIANTS_PER_MISSION,
  } = await vite.ssrLoadModule("/app/mission-variants.ts");

  assert.equal(ALL_DEEP_MISSIONS.length * VARIANTS_PER_MISSION, 432);
  assert.deepEqual(validateMissionVariants(ALL_DEEP_MISSIONS), []);
  const first = createMissionEdition(ALL_DEEP_MISSIONS[0], 0, 0);
  const repeat = createMissionEdition(ALL_DEEP_MISSIONS[0], 1, 90);
  assert.notEqual(first.id, repeat.id);
  assert.notEqual(
    first.mission.deepPractice[0].prompt,
    repeat.mission.deepPractice[0].prompt,
  );
  assert.equal(repeat.difficulty, "stretch");
});

test("forwards progress semantics to the primitive", async () => {
  const { Progress } = await vite.ssrLoadModule("/components/ui/progress.tsx");
  const html = renderToStaticMarkup(
    React.createElement(Progress, { value: 37 }),
  );

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
