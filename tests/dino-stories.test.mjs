import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

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

/** Tập các con số trong câu; "80 000" được đọc là một số. */
function numbers(text) {
  return [...new Set((text.replace(/(\d) (?=\d{3}\b)/g, "$1").match(/\d+/g) ?? []).map(Number))].sort((a, b) => a - b);
}

test("every mission has a dinosaur story and a Session 4 authentic task", async () => {
  const { ALL_DEEP_MISSIONS } = await vite.ssrLoadModule("/app/curriculum.ts");
  const { AUTHENTIC_TASKS, DINO_MISSION_STORIES } = await vite.ssrLoadModule("/app/dino/dino-mission-stories.ts");
  const { DINO_REGIONS } = await vite.ssrLoadModule("/app/dino/dino-species.ts");
  const { resolveDinoForMission } = await vite.ssrLoadModule("/app/dino/dino-collection-engine.ts");

  assert.equal(Object.keys(DINO_MISSION_STORIES).length, 36);
  assert.equal(Object.keys(AUTHENTIC_TASKS).length, 36);
  for (const mission of ALL_DEEP_MISSIONS) {
    const story = DINO_MISSION_STORIES[mission.id];
    const task = AUTHENTIC_TASKS[mission.id];
    assert.ok(story, `${mission.id}: thiếu câu chuyện`);
    assert.ok(task?.title && task.steps.length === 3 && task.share, `${mission.id}: thiếu nhiệm vụ đời thực`);
    const species = resolveDinoForMission(mission);
    const shortName = species.name.split(" ")[0];
    assert.ok(
      story.hook.includes(shortName) || story.hook.includes(DINO_REGIONS[mission.domain].name),
      `${mission.id}: hook phải nhắc loài hoặc vùng đất của nhiệm vụ`,
    );
    assert.equal(mission.hook, story.hook);
    assert.equal(mission.prediction.prompt, story.wonder);
  }
});

test("dinosaur context keeps every number, answer and option unchanged", async () => {
  const { ALL_DEEP_MISSIONS, BASE_DEEP_MISSION_LIBRARY } = await vite.ssrLoadModule("/app/curriculum.ts");
  const base = Object.fromEntries(Object.values(BASE_DEEP_MISSION_LIBRARY).flat().map((mission) => [mission.id, mission]));

  for (const mission of ALL_DEEP_MISSIONS) {
    const original = base[mission.id];
    assert.deepEqual(numbers(mission.prediction.prompt), numbers(original.prediction.prompt), `${mission.id}: số trong câu dự đoán`);
    assert.deepEqual(numbers(mission.lab.prompt), numbers(original.lab.prompt), `${mission.id}: số trong câu thử nghiệm`);
    assert.deepEqual(numbers(mission.practice[0].prompt), numbers(original.practice[0].prompt), `${mission.id}: số trong practice[0]`);
    assert.equal(mission.practice[0].answer, original.practice[0].answer);
    assert.deepEqual(mission.practice[0].options, original.practice[0].options);
    assert.equal(mission.lab.answer, original.lab.answer);
    assert.deepEqual(mission.lab.options, original.lab.options);
    assert.deepEqual(mission.prediction.options, original.prediction.options);
    assert.deepEqual(mission.practice.slice(1), original.practice.slice(1));
    assert.notEqual(mission.hook, original.hook, `${mission.id}: hook chưa được viết lại`);
  }
});
