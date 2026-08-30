import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const release = JSON.parse(await readFile(new URL("../public/content-release.json", import.meta.url), "utf8"));
const requiredChecks = ["curriculumAlignment", "answerVerification", "childLanguage", "privacyAndExternalLinks"];

if (!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(release.version ?? "")) {
  throw new Error("Content release version must use YYYY.MM.DD.N format.");
}
if (release.approval?.status !== "approved-for-release") {
  throw new Error("Content release is blocked: approval status is not approved-for-release.");
}
if (release.approval?.parentApprovalRequired !== true) {
  throw new Error("Content release must require parent approval on the device.");
}
for (const check of requiredChecks) {
  if (release.approval?.checks?.[check] !== true) throw new Error(`Content release check failed: ${check}.`);
}
if (!Array.isArray(release.notes) || release.notes.length === 0) {
  throw new Error("Content release must include parent-facing release notes.");
}

console.log(`Content release ${release.version} passed the review gate.`);

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(await readFile(path.join(projectRoot, "public", "content-catalog.json"), "utf8"));
if (catalog.schemaVersion !== 1 || catalog.status !== "approved-for-release" || catalog.parentApprovalRequired !== true) {
  throw new Error("Curated content catalog did not pass the parent-approval gate.");
}
const allowedDomains = new Set(["number", "calculation", "measurement", "geometry", "data", "word"]);
const allowedHosts = new Set(["moet.gov.vn", "nrich.maths.org", "www.youcubed.org", "youcubed.org"]);
for (const item of catalog.packs ?? []) {
  const packPath = path.join(projectRoot, "public", item.url);
  const pack = JSON.parse(await readFile(packPath, "utf8"));
  if (pack.id !== item.id || pack.version !== item.version || pack.status !== "approved-for-release") throw new Error(`${item.id}: pack identity or approval failed.`);
  if (!pack.reviewChecks || !Object.values(pack.reviewChecks).every(Boolean)) throw new Error(`${item.id}: one or more review checks failed.`);
  if (!Array.isArray(pack.tasks) || pack.tasks.length !== item.taskCount) throw new Error(`${item.id}: task count does not match the catalog.`);
  const ids = new Set();
  for (const task of pack.tasks) {
    if (!task.id || ids.has(task.id)) throw new Error(`${item.id}: duplicate or missing task id.`);
    ids.add(task.id);
    if (!allowedDomains.has(task.domain) || !task.prompt || task.hints?.length !== 3 || task.launchQuestions?.length !== 3) throw new Error(`${task.id}: invalid learning structure.`);
    const source = new URL(task.source?.url ?? "");
    if (source.protocol !== "https:" || !allowedHosts.has(source.hostname)) throw new Error(`${task.id}: source is not on the reviewed allowlist.`);
  }
  console.log(`Curated pack ${pack.id}@${pack.version} passed with ${pack.tasks.length} tasks.`);
}
