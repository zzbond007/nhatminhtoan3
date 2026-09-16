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

test("covers eight supplemental strands with six valid questions each", async () => {
  const {
    SKILL_LAB_QUESTION_COUNT,
    SKILL_LAB_QUESTIONS,
    SKILL_LAB_STRANDS,
    validateSkillLabQuestions,
  } = await vite.ssrLoadModule("/app/skill-lab.ts");

  assert.equal(SKILL_LAB_STRANDS.length, 8);
  assert.equal(SKILL_LAB_QUESTION_COUNT, 48);
  assert.equal(new Set(SKILL_LAB_QUESTIONS.map((question) => question.id)).size, 48);
  assert.deepEqual(validateSkillLabQuestions(), []);

  for (const strand of SKILL_LAB_STRANDS) {
    assert.equal(
      SKILL_LAB_QUESTIONS.filter((question) => question.strand === strand.id).length,
      6,
    );
  }
  assert.ok(SKILL_LAB_QUESTIONS.every((question) => question.hints.length === 3));
});

test("builds a deterministic ten-question spiral that touches every strand", async () => {
  const { buildSkillLabSession, SKILL_LAB_STRANDS } =
    await vite.ssrLoadModule("/app/skill-lab.ts");

  const first = buildSkillLabSession({}, 1234, "spiral", 10);
  const repeat = buildSkillLabSession({}, 1234, "spiral", 10);

  assert.equal(first.length, 10);
  assert.equal(new Set(first.map((question) => question.id)).size, 10);
  assert.deepEqual(first.map((question) => question.id), repeat.map((question) => question.id));
  assert.deepEqual(
    new Set(first.map((question) => question.strand)),
    new Set(SKILL_LAB_STRANDS.map((strand) => strand.id)),
  );
});

test("puts marked mistakes into a focused review session", async () => {
  const { buildSkillLabSession } = await vite.ssrLoadModule("/app/skill-lab.ts");
  const records = {
    "fr-03": { attempts: 2, correct: 1, streak: 1, needsReview: true, lastAttemptAt: "2026-09-16" },
    "op-02": { attempts: 1, correct: 0, streak: 0, needsReview: true, lastAttemptAt: "2026-09-16" },
    "pv-01": { attempts: 3, correct: 3, streak: 3, needsReview: false, lastAttemptAt: "2026-09-16" },
  };

  const review = buildSkillLabSession(records, 9, "review", 10);

  assert.deepEqual(
    new Set(review.map((question) => question.id)),
    new Set(["fr-03", "op-02"]),
  );
});
