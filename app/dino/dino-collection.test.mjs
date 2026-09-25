import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";

const root = fileURLToPath(new URL("../..", import.meta.url));
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

const loadEngine = () => vite.ssrLoadModule("/app/dino/dino-collection-engine.ts");
const result = (overrides = {}) => ({
  band: "core",
  maxHintDepth: 1,
  usedTwoStrategies: false,
  ...overrides,
});

test("maps all 36 species one-to-one onto the 36 deep missions", async () => {
  const { DINO_SPECIES, DINO_REGIONS } = await vite.ssrLoadModule("/app/dino/dino-species.ts");
  const { resolveDinoForMission, validateDinoSpecies } = await loadEngine();
  const { ALL_DEEP_MISSIONS } = await vite.ssrLoadModule("/app/curriculum.ts");
  const { DOMAINS } = await vite.ssrLoadModule("/app/content.ts");

  assert.equal(DINO_SPECIES.length, 36);
  assert.deepEqual(validateDinoSpecies(), []);
  assert.deepEqual(new Set(Object.keys(DINO_REGIONS)), new Set(DOMAINS.map((domain) => domain.id)));

  const resolved = ALL_DEEP_MISSIONS.map((mission) => resolveDinoForMission(mission));
  assert.ok(resolved.every(Boolean));
  assert.equal(new Set(resolved.map((species) => species.id)).size, 36);
  ALL_DEEP_MISSIONS.forEach((mission, index) => {
    assert.equal(resolved[index].domain, mission.domain);
    assert.equal(resolved[index].slotInDomain, mission.sequence);
  });
});

test("awards egg shards from band, hint depth and two strategies only", async () => {
  const { calculateShardsEarned } = await loadEngine();

  assert.equal(calculateShardsEarned(result({ band: "support", maxHintDepth: 3 })), 1);
  assert.equal(calculateShardsEarned(result({ band: "core", maxHintDepth: 1 })), 2);
  assert.equal(calculateShardsEarned(result({ band: "stretch", maxHintDepth: 3 })), 2);
  assert.equal(calculateShardsEarned(result({ maxHintDepth: 0, usedTwoStrategies: true })), 3);
  assert.equal(calculateShardsEarned({ ...result(), gaveReflection: true }), 2);
});

test("hatches after four shards and evolves on spiral revisits", async () => {
  const { recordMissionForDino, SHARDS_TO_HATCH } = await loadEngine();
  const mission = { domain: "geometry", sequence: 1 };

  const first = recordMissionForDino({}, mission, result());
  assert.equal(first.outcome.speciesId, "kentro-gai-tam-giac");
  assert.equal(first.outcome.shardsEarned, 2);
  assert.equal(first.outcome.justHatched, false);
  assert.equal(first.collection["kentro-gai-tam-giac"].shards, 2);

  const second = recordMissionForDino(first.collection, mission, result({ band: "support" }));
  assert.equal(SHARDS_TO_HATCH, 4);
  assert.equal(second.outcome.justHatched, true);
  assert.equal(second.outcome.evolvedTo, null);
  assert.deepEqual(
    { stage: second.outcome.progress.stage, rarity: second.outcome.progress.rarity, shards: second.outcome.progress.shards },
    { stage: "con-non", rarity: "thuong", shards: 0 },
  );

  const third = recordMissionForDino(second.collection, mission, result());
  assert.equal(third.outcome.evolvedTo, "thieu-nien");

  const fourth = recordMissionForDino(third.collection, mission, result({ band: "core" }));
  assert.equal(fourth.outcome.evolvedTo, null);
  assert.equal(fourth.outcome.progress.stage, "thieu-nien");

  const fifth = recordMissionForDino(fourth.collection, mission, result({ band: "stretch" }));
  assert.equal(fifth.outcome.evolvedTo, "truong-thanh");
  assert.equal(fifth.outcome.progress.timesDomainRevisited, 3);
});

test("keeps the input collection untouched and marks eggs hatched in Bứt phá as rare", async () => {
  const { recordMissionForDino } = await loadEngine();
  const collection = {};
  const mission = { domain: "word", sequence: 1 };

  // Lần đầu luôn là Vừa sức: chưa nở, nên Hiếm vẫn đạt được ở lần làm trứng nở.
  const first = recordMissionForDino(collection, mission, result({ band: "core" }));
  const rare = recordMissionForDino(first.collection, mission, result({ band: "stretch", maxHintDepth: 3 }));

  assert.deepEqual(collection, {});
  assert.equal(rare.outcome.justHatched, true);
  assert.equal(rare.outcome.progress.rarity, "hiem");
  assert.equal(recordMissionForDino(collection, { domain: "word", sequence: 9 }, result()).outcome, null);
});

test("replays earlier mission history into eggs", async () => {
  const { replayMissionHistory } = await loadEngine();

  const collection = replayMissionHistory([
    { mission: { domain: "number", sequence: 1 }, results: [result(), result({ band: "stretch" })] },
    { mission: { domain: "data", sequence: 2 }, results: [result({ band: "support", maxHintDepth: 3 })] },
  ]);

  assert.equal(collection["rex-ti-hon"].stage, "con-non");
  assert.equal(collection["rex-ti-hon"].rarity, "hiem");
  assert.equal(collection["maia-me-hien"].stage, "trung");
  assert.equal(collection["maia-me-hien"].shards, 1);
});

test("hatches legendary eggs from open tasks without resetting grown dinosaurs", async () => {
  const { awardLegendaryEgg } = await loadEngine();

  const first = awardLegendaryEgg({}, { domain: "geometry", sequence: 3 });
  assert.equal(first.outcome.speciesId, "ptero-hinh-thoi");
  assert.equal(first.outcome.progress.rarity, "huyen-thoai");

  const grown = { ...first.collection, "ptero-hinh-thoi": { ...first.collection["ptero-hinh-thoi"], stage: "truong-thanh" } };
  const fallback = awardLegendaryEgg(grown, { domain: "geometry", sequence: 3 });
  assert.equal(fallback.outcome.speciesId, "kentro-gai-tam-giac");
  assert.equal(fallback.collection["ptero-hinh-thoi"].stage, "truong-thanh");

  let full = {};
  for (let sequence = 1; sequence <= 6; sequence += 1) full = awardLegendaryEgg(full, { domain: "data", sequence }).collection;
  assert.equal(awardLegendaryEgg(full, { domain: "data" }).outcome, null);
});

test("awards one special egg per learning-day milestone", async () => {
  const { awardSeasonalMilestones, pendingSeasonalMilestones } = await loadEngine();

  assert.deepEqual(pendingSeasonalMilestones(6, []), []);
  assert.deepEqual(pendingSeasonalMilestones(31, [7]), [30]);

  const award = awardSeasonalMilestones({}, 30, []);
  assert.deepEqual(award.milestones, [7, 30]);
  assert.equal(award.outcomes.length, 2);
  assert.notEqual(award.outcomes[0].speciesId, award.outcomes[1].speciesId);
  assert.ok(award.outcomes.every((outcome) => outcome.progress.rarity === "dac-biet"));
  assert.deepEqual(awardSeasonalMilestones(award.collection, 30, award.milestones).milestones, []);
});

test("normalizes saved collections and summarizes the island", async () => {
  const { normalizeDinoCollection, summarizeDinoIsland } = await loadEngine();

  const collection = normalizeDinoCollection({
    "rex-ti-hon": { shards: 9, stage: "trung", rarity: "hiem", domain: "word" },
    "bra-co-dai": { stage: "truong-thanh", rarity: "khong-ro", timesDomainRevisited: 2 },
    "ovi-ap-trung": { stage: "con-non", rarity: "huyen-thoai" },
    "khong-ton-tai": { stage: "con-non" },
    "velo-tinh-ranh": null,
  });

  assert.deepEqual(Object.keys(collection).sort(), ["bra-co-dai", "ovi-ap-trung", "rex-ti-hon"]);
  assert.deepEqual(
    { domain: collection["rex-ti-hon"].domain, shards: collection["rex-ti-hon"].shards, rarity: collection["rex-ti-hon"].rarity },
    { domain: "number", shards: 3, rarity: null },
  );
  assert.equal(collection["bra-co-dai"].rarity, "thuong");
  assert.equal(collection["ovi-ap-trung"].rarity, "huyen-thoai");
  assert.deepEqual(normalizeDinoCollection("hỏng"), {});
  assert.deepEqual(summarizeDinoIsland(collection), { total: 36, hatched: 2, warming: 1, grown: 1 });
});
