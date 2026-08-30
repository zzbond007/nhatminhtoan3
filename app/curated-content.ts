import type { DomainId } from "./content";

export type EnrichmentTask = {
  id: string;
  domain: DomainId;
  level: 1 | 2 | 3;
  title: string;
  minutes: number;
  prompt: string;
  launchQuestions: [string, string, string];
  hints: [string, string, string];
  familyPrompt: string;
  source: {
    title: string;
    url: string;
    adaptationNote: string;
  };
};

export type CuratedContentPack = {
  schemaVersion: 1;
  id: string;
  version: string;
  title: string;
  description: string;
  status: "approved-for-release" | "draft" | "rejected";
  reviewedAt: string;
  reviewedBy: string;
  reviewChecks: {
    curriculumAlignment: boolean;
    answerAndConstraintCheck: boolean;
    childLanguage: boolean;
    copyrightAndSource: boolean;
    privacyAndExternalLinks: boolean;
  };
  tasks: EnrichmentTask[];
};

export type ContentCatalog = {
  schemaVersion: 1;
  version: string;
  status: "approved-for-release" | "draft";
  parentApprovalRequired: true;
  packs: Array<{
    id: string;
    version: string;
    title: string;
    taskCount: number;
    url: string;
    reviewedAt: string;
    reviewedBy: string;
  }>;
};

const ALLOWED_SOURCE_HOSTS = new Set(["moet.gov.vn", "nrich.maths.org", "www.youcubed.org", "youcubed.org"]);

export function validateCuratedPack(value: unknown): value is CuratedContentPack {
  if (!value || typeof value !== "object") return false;
  const pack = value as Partial<CuratedContentPack>;
  const checks = pack.reviewChecks;
  if (pack.schemaVersion !== 1 || pack.status !== "approved-for-release" || !pack.id || !pack.version) return false;
  if (!checks || !Object.values(checks).every(Boolean)) return false;
  if (!Array.isArray(pack.tasks) || pack.tasks.length < 6) return false;
  const ids = new Set<string>();
  return pack.tasks.every((task) => {
    if (!task || typeof task !== "object" || !task.id || ids.has(task.id)) return false;
    ids.add(task.id);
    if (!task.prompt?.trim() || !task.title?.trim() || task.hints?.length !== 3 || task.launchQuestions?.length !== 3) return false;
    try {
      const source = new URL(task.source?.url ?? "");
      return source.protocol === "https:" && ALLOWED_SOURCE_HOSTS.has(source.hostname);
    } catch {
      return false;
    }
  });
}

export function selectEnrichmentTask(pack: CuratedContentPack, completedIds: string[], dayNumber: number) {
  const available = pack.tasks.filter((task) => !completedIds.includes(task.id));
  const pool = available.length ? available : pack.tasks;
  return pool[Math.abs(dayNumber) % pool.length];
}
