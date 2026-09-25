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

const sample = {
  product: "Math Raccoon",
  schemaVersion: 10,
  profile: {
    schemaVersion: 10,
    nickname: "Nhà thám hiểm",
    missionRecords: { "number-1": { completedCount: 3, reflection: "Con thử cách tách số trước." } },
    dinoCollection: { "rex-ti-hon": { stage: "thieu-nien", rarity: "hiem", shards: 0, timesDomainRevisited: 1 } },
    discoveryDays: Array.from({ length: 60 }, (_, index) => `2026-08-${String((index % 28) + 1).padStart(2, "0")}`),
  },
};

test("round-trips a full profile through a compressed progress code", async () => {
  const { decodeProgressCode, encodeProgressCode } = await vite.ssrLoadModule("/app/progress-code.ts");

  const code = await encodeProgressCode(sample);
  assert.match(code, /^MR1Z-[0-9a-f]{8}-[A-Za-z0-9_-]+$/);
  assert.ok(code.length < JSON.stringify(sample).length, "mã nén phải ngắn hơn JSON gốc");

  const result = await decodeProgressCode(code);
  assert.equal(result.ok, true);
  assert.deepEqual(result.data, sample);
});

test("accepts codes pasted with line breaks and spaces", async () => {
  const { decodeProgressCode, encodeProgressCode } = await vite.ssrLoadModule("/app/progress-code.ts");
  const code = await encodeProgressCode(sample);
  const pasted = `  ${code.slice(0, 40)}\n${code.slice(40, 90)} \r\n${code.slice(90)}\n`;

  const result = await decodeProgressCode(pasted);
  assert.equal(result.ok, true);
  assert.deepEqual(result.data, sample);
});

test("rejects truncated, edited or foreign codes without throwing", async () => {
  const { decodeProgressCode, encodeProgressCode } = await vite.ssrLoadModule("/app/progress-code.ts");
  const code = await encodeProgressCode(sample);
  const flipped = code.slice(0, -3) + (code.at(-3) === "A" ? "B" : "A") + code.slice(-2);

  for (const bad of [code.slice(0, -10), flipped, "xin chào", "", "MR1Z-00000000-abc"]) {
    const result = await decodeProgressCode(bad);
    assert.equal(result.ok, false, `phải từ chối: ${bad.slice(0, 20)}`);
    assert.ok(result.reason.length > 10);
  }
});

test("still reads uncompressed MR1 codes", async () => {
  const { decodeProgressCode } = await vite.ssrLoadModule("/app/progress-code.ts");
  const payload = Buffer.from(JSON.stringify(sample), "utf8").toString("base64url");
  let hash = 0x811c9dc5;
  for (const char of payload) hash = Math.imul(hash ^ char.charCodeAt(0), 0x01000193) >>> 0;

  const result = await decodeProgressCode(`MR1-${hash.toString(16).padStart(8, "0")}-${payload}`);
  assert.equal(result.ok, true);
  assert.equal(result.data.profile.nickname, "Nhà thám hiểm");
});
