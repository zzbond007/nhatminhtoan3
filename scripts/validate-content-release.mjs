import { readFile } from "node:fs/promises";

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
