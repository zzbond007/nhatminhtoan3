import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

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

const loadSync = () => vite.ssrLoadModule("/app/cloud-sync.ts");
const config = {
  url: "https://script.google.com/macros/s/AKfycbTESTdeploymentId123/exec",
  familyCode: "nha-minh",
  pin: "2468",
  auto: false,
  lastSyncedAt: null,
};

/** Chạy đúng tệp Apps Script trong Node với Google Sheets giả lập. */
async function fakeAppsScript() {
  const source = await readFile(path.join(root, "docs", "cloud-sync", "MathRaccoonSync.gs"), "utf8");
  const rows = [];
  let created = false;
  const sheet = {
    getDataRange: () => ({ getValues: () => rows.map((row) => [...row]) }),
    getLastRow: () => rows.length,
    getLastColumn: () => Math.max(0, ...rows.map((row) => row.length)),
    appendRow: (values) => rows.push([...values]),
    getRange: (row, column, _rowCount, columnCount) => ({
      clearContent() { rows[row - 1] ??= []; for (let index = 0; index < columnCount; index += 1) rows[row - 1][column - 1 + index] = ""; },
      setNumberFormat() {},
      setValues(values) { rows[row - 1] ??= []; values[0].forEach((value, index) => { rows[row - 1][column - 1 + index] = value; }); },
    }),
  };
  const context = vm.createContext({
    JSON, Date, Math, String, Number,
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => (created ? sheet : null), insertSheet: () => { created = true; return sheet; } }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: (text) => ({ setMimeType: () => ({ text }) }) },
  });
  vm.runInContext(source, context);
  const fetcher = async (_url, init) => {
    const output = context.doPost({ postData: { contents: init.body } });
    return { ok: true, status: 200, json: async () => JSON.parse(output.text) };
  };
  return { rows, fetcher };
}

test("validates the Apps Script URL, family code and PIN", async () => {
  const { validateCloudConfig, pinHash } = await loadSync();

  assert.equal(validateCloudConfig(config), null);
  assert.match(validateCloudConfig({ ...config, url: "https://example.com/exec" }), /Apps Script/);
  assert.match(validateCloudConfig({ ...config, familyCode: "nhà minh" }), /Mã gia đình/);
  assert.match(validateCloudConfig({ ...config, pin: "12" }), /PIN/);

  const hash = await pinHash("nha-minh", "2468");
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(hash, await pinHash(" nha-minh ", "2468 "));
  assert.notEqual(hash, await pinHash("nha-minh", "2469"));
});

test("saves and loads a progress code through the real Apps Script file", async () => {
  const { cloudStatus, loadFromCloud, saveToCloud } = await loadSync();
  const { encodeProgressCode, decodeProgressCode } = await vite.ssrLoadModule("/app/progress-code.ts");
  const { rows, fetcher } = await fakeAppsScript();

  assert.deepEqual(await cloudStatus(config, fetcher), { ok: true, updatedAt: null, code: undefined });
  const code = await encodeProgressCode({ profile: { nickname: "Minh", missionRecords: {} } });
  const saved = await saveToCloud(config, code, fetcher);
  assert.equal(saved.ok, true);
  assert.equal(rows.length, 2, "một dòng tiêu đề và một dòng cho gia đình");
  assert.notEqual(rows[1][1], "2468", "không lưu PIN ở dạng gốc");

  const loaded = await loadFromCloud(config, fetcher);
  assert.equal(loaded.ok, true);
  assert.equal(loaded.code, code);
  assert.equal(loaded.updatedAt, saved.updatedAt);
  assert.deepEqual((await decodeProgressCode(loaded.code)).data.profile.nickname, "Minh");
});

test("rejects a wrong PIN and splits very long codes across cells", async () => {
  const { loadFromCloud, saveToCloud } = await loadSync();
  const { rows, fetcher } = await fakeAppsScript();

  const longCode = `MR1-0123abcd-${"A".repeat(100000)}`;
  assert.equal((await saveToCloud(config, longCode, fetcher)).ok, true);
  assert.equal(rows[1][3], "3");
  assert.ok(rows[1].slice(4).every((cell) => String(cell).length <= 45000));

  const wrong = await loadFromCloud({ ...config, pin: "1111" }, fetcher);
  assert.equal(wrong.ok, false);
  assert.match(wrong.error, /Sai mã PIN/);
  assert.equal((await saveToCloud({ ...config, pin: "1111" }, longCode, fetcher)).ok, false);
  assert.equal((await loadFromCloud(config, fetcher)).code, longCode);
  assert.equal((await saveToCloud(config, "không phải mã", fetcher)).ok, false);
});

test("auto-save only runs after this device matched the cloud and nobody else wrote since", async () => {
  const { safeToAutoSave } = await loadSync();
  const matched = { ...config, auto: true, lastSyncedAt: "2026-09-26T08:00:00.000Z" };

  assert.equal(safeToAutoSave({ ...config, auto: true }, null), false, "máy mới chưa khớp không được tự ghi đè");
  assert.equal(safeToAutoSave(matched, "2026-09-26T08:00:00.000Z"), true);
  assert.equal(safeToAutoSave(matched, "2026-09-26T09:30:00.000Z"), false, "máy khác vừa lưu");
  assert.equal(safeToAutoSave({ ...matched, auto: false }, null), false);
});
