"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpenCheck, Brain, CalendarDays, Calculator,
  Check, CheckCircle2, ClipboardCheck, Clock3, CloudDownload, Download, FileUp, Flag,
  Globe2, House, Lightbulb, ListChecks, LockKeyhole, Map, Medal, RefreshCw, Route, Ruler, Shapes,
  ShieldCheck, Sparkles, Target, Trophy, UserRound, Volume2, VolumeX, Tablet, WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { DataChart } from "@/components/data-chart";
import {
  DIAGNOSTIC_QUESTIONS, DOMAINS,
  type DiagnosticQuestion, type DomainId, type PracticeQuestion,
} from "./content";
import {
  ALL_DEEP_MISSIONS, CURRICULUM_VERSION, DAILY_PUZZLES_60, DEEP_MISSION_LIBRARY,
  type DeepMission, type DeepQuestion,
} from "./curriculum";
import { createMissionEdition, PRACTICE_PER_EDITION, VARIANTS_PER_MISSION } from "./mission-variants";
import {
  findPlannedTask, selectEnrichmentTask, validateCuratedPack,
  type ContentCatalog, type CuratedContentPack,
} from "./curated-content";
import {
  MONTH_THEMES, PROGRAM_SESSIONS, WEEKLY_RHYTHM, YEAR_WEEKS, weekProgress,
} from "./year-plan";
import { contentRouteWeek, lessonStageIndex, parseContentRoute } from "./content-route";
import { localCalendarDayIndex, localDayKey } from "./calendar-day";
import { beginMissionSession, editionInputs, sessionSparkGain, sparkPointsOf, type MissionSessionStart } from "./mission-session";
import { correctOnFirstAttempt, missionStrength, wrongAnswerFeedback } from "./learning-feedback";
import {
  buildSkillLabSession, nextSkillLabRecord, STRAND_PRIMERS, WEEKLY_FOCUS_STRANDS, SKILL_LAB_QUESTIONS, SKILL_LAB_QUESTION_COUNT, SKILL_LAB_STRANDS,
  type SkillLabMode, type SkillLabQuestion, type SkillLabRecordLike,
} from "./skill-lab";
import {
  DINO_RARE_REGIONS, DINO_RARE_SPECIES, DINO_REGIONS, DINO_SPECIES, getDinoKindById, getRareSpeciesById, getSpeciesById,
  type DinoSpecies,
} from "./dino/dino-species";
import {
  DINO_SEASONAL_MILESTONES, DINO_STAGE_LABELS, EGG_RARITY_LABELS, SHARDS_TO_HATCH,
  awardLegendaryEgg, awardSeasonalMilestones, normalizeDinoCollection, recordMissionForDino,
  replayMissionHistory, resolveDinoForMission, summarizeDinoIsland,
  type DinoCollection, type DinoMissionOutcome, type MissionCompletionResult,
} from "./dino/dino-collection-engine";
import {
  OPEN_TASK_RARE_CHANCE, RARE_SOURCE_LABELS, advanceMysteryEgg, countBraveAnswers, editionAlreadyRewarded, markEditionRewarded, branchSpeciesForWeek, careForCompanion, claimBranchStation,
  createMysteryEgg, createNest, growRareCompanion, missionRareChance, normalizeMysteryEgg, normalizeNest,
  normalizeRareCollection, openMysteryEgg, rollRareFind,
  type CareAction, type MysteryEggState, type NestState, type RareCollection, type RareSource,
} from "./dino/dino-rewards";
import { DinoEgg, DinoFigure } from "./dino/dino-art";
import { playRewardSound } from "./dino/dino-sound";
import { DinoGallery, DinoJourney, DinoNestPanel, HatchReveal, type GalleryItem, type JourneyStation, type NestFriend } from "./dino/dino-world";
import { AUTHENTIC_TASKS, DINO_MISSION_STORIES } from "./dino/dino-mission-stories";
import { bandForMastery, blendMastery, diagnosticMastery, domainsByNeed, MASTERY_DEFAULT, MASTERY_DOMAINS, normalizeMastery, type MasteryMap } from "./mastery";
import { checkSecondWay, secondWayQuestion, type SecondWayCheck } from "./second-strategy";
import { voiceNoteKey } from "./voice-notes";
import { SecondWay } from "@/components/second-way";
import { VoiceReflection } from "@/components/voice-reflection";
import { decodeProgressCode, encodeProgressCode } from "./progress-code";
import { parentPromptsFor } from "./parent-prompts";
import {
  CLOUD_KEY, cloudStatus, loadFromCloud, normalizeCloudConfig, safeToAutoSave, saveToCloud, validateCloudConfig,
  type CloudConfig,
} from "./cloud-sync";
import {
  abilityInsights, buildCheckIn, checkInDueMonth, normalizeCheckIns, scoreCheckIn, tallyPercent, CHECKIN_SIZE,
  type CheckInItem, type CheckInResult, type DomainTally,
} from "./monthly-checkin";
import { AbilityRadar } from "@/components/ability-radar";
import { HeightOrderVisual, SampleDotsVisual } from "@/components/diagnostic-visuals";
// Nâng cấp v12: bàn phím số ảo, chế độ tập trung, bảng nháp, đọc đề karaoke, gợi ý 3 tầng có khoá,
// động cơ xoắn ốc, Bảo tàng Hóa thạch, Cổng Phụ Huynh và báo cáo Radar Canvas.
import { NumpadAnswer } from "@/components/virtual-numpad";
import { KaraokeReader } from "@/components/karaoke-reader";
import { HintLadderButton, HintStack } from "@/components/hint-ladder";
import { StudyToolbar } from "@/components/study-toolbar";
import { SpiralReviewRoom, type SpiralAttempt } from "@/components/spiral-review-room";
import { ParentPortal, type WeeklyReport } from "@/components/parent-portal";
import { AbilityRadarCanvas } from "@/components/ability-radar-canvas";
import { FossilMuseumCard } from "@/components/fossil-museum";
import { autoScaffoldDepth, sparkRewardFor, type SparkReward } from "./hint-scaffold";
import {
  buildSpiralReviewSet, dueReviewStates, normalizeCognitiveMap, recordCognitiveAttempt,
  type AttemptSource, type CognitiveMap, type CognitiveTarget, type SpiralReviewItem,
} from "./spiral-engine";
import { applyFossilShield, FOSSIL_SHIELDS_PER_MONTH, fossilMuseum, normalizeShieldUses, RHYTHM_SESSIONS_PER_WEEK, type ShieldUse } from "./fossil-streak";
import { migrateStorageData, seedCognitiveStates, STORAGE_KEY, upgradeMissionRecords } from "./storage-migration";
import { withinLastWeek } from "./parent-gate";
import CONTENT_RELEASE from "../public/content-release.json";

type View = "dashboard" | "diagnostic-intro" | "diagnostic" | "diagnostic-result" | "mission" | "enrichment" | "skill-lab" | "spiral-review" | "dino" | "check-in" | "year-plan" | "content-review";
type MissionStage = "predict" | "explore" | "strategies" | "practice" | "transfer" | "reflect" | "result";
type DomainScore = { correct: number; total: number; percent: number; status: "strong" | "developing" | "review" };
type DiagnosticResult = { correct: number; total: number; percent: number; placement: string; scores: Record<DomainId, DomainScore>; finishedAt: string };
type SessionEvidence = { finishedAt: string; firstScore: number; autonomy: number; averageHintDepth: number; transferFirstTry: boolean; editionId?: string; difficulty?: string; usedTwoStrategies?: boolean; braveCount?: number };
type MissionRecord = {
  /** autonomy: mức tự lực trượt (tăng và giảm). bestAutonomy: mức cao nhất từng đạt, dùng để mở khoá chặng sau. */
  bestFirstScore: number; autonomy: number; bestAutonomy: number; hintsUsed: number; maxHintDepth: number;
  retries: number; completedAt: string; reviewAt: string; reflection: string;
  prediction: string; focusNeeds: string[]; completedCount: number; sessions: SessionEvidence[];
};
type SkillLabRecord = SkillLabRecordLike;
type SkillLabSession = { finishedAt: string; mode: SkillLabMode; correctFirst: number; total: number; questionIds: string[] };
type LearningProfile = {
  schemaVersion: number; profileId: string; nickname: string; createdAt: string; savedAt: string;
  diagnostic: DiagnosticResult | null; missionRecords: Record<string, MissionRecord>; discoveryDays: string[];
  enrichmentCompleted: string[]; skillLabRecords: Record<string, SkillLabRecord>; skillLabSessions: SkillLabSession[];
  dinoCollection: DinoCollection; dinoMilestones: number[];
  dinoRares: RareCollection; dinoShinies: string[]; dinoMystery: MysteryEggState; dinoNest: NestState; authenticDone: string[];
  dinoRewardedEditions: string[]; checkIns: CheckInResult[];
  /** v12: Tia sáng thưởng theo độ sâu gợi ý, huy hiệu Tự lực, trạng thái nhận thức, khiên hóa thạch. */
  sparkBonus: number; selfReliantBadges: number; cognitiveStates: CognitiveMap; fossilShieldUses: ShieldUse[];
  /** v13: mức thành thạo hai chiều theo miền (0–100), quyết định dải khó. */
  mastery: MasteryMap;
};
type Prefs = { sound: boolean; largeText: boolean; focusMode: boolean };
type DinoNotice = { speciesId: string; title: string; text: string; reveal?: boolean };
type DinoTab = "to-am" | "bo-suu-tap";
type LegacyRecord = Partial<MissionRecord>;
type UpdateState = "idle" | "checking" | "current" | "available" | "installing" | "offline" | "rejected" | "error";
type PackState = "idle" | "checking" | "available" | "current" | "offline" | "rejected" | "error";
type ContentRelease = typeof CONTENT_RELEASE;

const STORAGE_NOTICE_KEY = "math-raccoon-storage-notice-v1";
const PREFS_KEY = "math-raccoon-prefs-v1";
const DEFAULT_PREFS: Prefs = { sound: false, largeText: true, focusMode: true };
const APPROVED_PACK_KEY = "math-raccoon-approved-packs-v2";
const LEGACY_APPROVED_PACK_KEY = "math-raccoon-approved-pack-v1";
const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const CONTENT_RELEASE_URL = `${APP_BASE_PATH}/content-release.json`;
const CONTENT_CATALOG_URL = `${APP_BASE_PATH}/content-catalog.json`;
const DAY = 86_400_000;
/** Câu phản tư chạm để chọn: trẻ lớp 3 gõ tiếng Việt có dấu rất chậm. */
const REFLECTION_STARTERS = [
  "Con tự làm được hết.",
  "Con cần gợi ý ở một câu.",
  "Con đã sửa được một lỗi sai.",
  "Con đã thử một cách khác.",
  "Lúc đầu con đoán chưa đúng.",
  "Con muốn làm lại câu khó nhất.",
];
/** Lời phản tư được lưu khi con chỉ ghi âm mà không viết. */
const VOICE_REFLECTION_TEXT = "🎙 Con đã ghi âm lời phản tư.";
/** Buổi học không có câu điền số: cách thứ hai được kể bằng lời (ghi âm, hoặc viết từ chừng này ký tự). */
const SPOKEN_SECOND_WAY_MIN = 20;
const DOMAIN_ICONS: Record<DomainId, typeof Calculator> = {
  number: Target, calculation: Calculator, measurement: Ruler,
  geometry: Shapes, data: BarChart3, word: BookOpenCheck,
};
const STAGES: { id: MissionStage; short: string; label: string }[] = [
  { id: "predict", short: "1", label: "Thử trước" },
  { id: "explore", short: "2", label: "Tương tác" },
  { id: "strategies", short: "3", label: "Nhiều cách" },
  { id: "practice", short: "4", label: "Luyện sâu" },
  { id: "transfer", short: "5", label: "Chuyển giao" },
  { id: "reflect", short: "6", label: "Phản tư" },
];

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `mr-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function freshProfile(): LearningProfile {
  const now = new Date().toISOString();
  return { schemaVersion: CURRICULUM_VERSION, profileId: uid(), nickname: "Nhà thám hiểm", createdAt: now, savedAt: now, diagnostic: null, missionRecords: {}, discoveryDays: [], enrichmentCompleted: [], skillLabRecords: {}, skillLabSessions: [], dinoCollection: {}, dinoMilestones: [], dinoRares: {}, dinoShinies: [], dinoMystery: createMysteryEgg(Math.random()), dinoNest: createNest(), authenticDone: [], dinoRewardedEditions: [], checkIns: [], sparkBonus: 0, selfReliantBadges: 0, cognitiveStates: {}, fossilShieldUses: [], mastery: Object.fromEntries(MASTERY_DOMAINS.map((domain) => [domain, MASTERY_DEFAULT])) as MasteryMap };
}
function normalize(value: string, numeric = false) {
  if (numeric) return value.replace(/[^0-9-]/g, "");
  return value.trim().toLocaleLowerCase("vi").replace(/\s+/g, " ");
}
function answerIsCorrect(question: Pick<PracticeQuestion, "type" | "answer">, value: string) {
  return normalize(value, question.type === "number") === normalize(question.answer, question.type === "number");
}
function scoreStatus(percent: number): DomainScore["status"] {
  return percent >= 80 ? "strong" : percent >= 50 ? "developing" : "review";
}
function placementFor(percent: number) {
  if (percent >= 85) return "Nhà thám hiểm cấp Sao";
  if (percent >= 65) return "Nhà thám hiểm cấp La bàn";
  if (percent >= 40) return "Nhà thám hiểm cấp Dấu chân";
  return "Nhà thám hiểm mới bắt đầu";
}
function compareReleaseVersions(left: string, right: string) {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}
function migrateRecord(record: LegacyRecord): MissionRecord {
  const now = new Date().toISOString();
  return {
    bestFirstScore: record.bestFirstScore ?? 0,
    autonomy: record.autonomy ?? 0,
    bestAutonomy: Math.max(record.bestAutonomy ?? 0, record.autonomy ?? 0),
    hintsUsed: record.hintsUsed ?? 0,
    maxHintDepth: record.maxHintDepth ?? (record.hintsUsed ? 1 : 0),
    retries: record.retries ?? 0,
    completedAt: record.completedAt ?? now,
    reviewAt: record.reviewAt ?? now,
    reflection: record.reflection ?? "",
    prediction: record.prediction ?? "",
    focusNeeds: Array.isArray(record.focusNeeds) ? record.focusNeeds : [],
    completedCount: record.completedCount ?? 1,
    sessions: Array.isArray(record.sessions) ? record.sessions.slice(-10) : [],
  };
}
function migrateProfile(raw: unknown): LearningProfile {
  const base = freshProfile();
  if (!raw || typeof raw !== "object") return base;
  const value = raw as Partial<LearningProfile> & { lessonScores?: Partial<Record<DomainId, number>> };
  const missionRecords: Record<string, MissionRecord> = {};
  if (value.missionRecords && typeof value.missionRecords === "object") {
    // Hồ sơ nhập từ tệp/mã tiến trình cũ chưa qua migrateStorageData: tách bestAutonomy khỏi autonomy ở đây.
    Object.entries(upgradeMissionRecords(value.missionRecords) ?? {}).forEach(([id, record]) => {
      if (record && typeof record === "object") missionRecords[id] = migrateRecord(record as LegacyRecord);
    });
  } else if (value.lessonScores) {
    Object.entries(value.lessonScores).forEach(([domain, score]) => {
      missionRecords[`${domain}-1`] = migrateRecord({ bestFirstScore: score, autonomy: score });
    });
  }
  const skillLabRecords: Record<string, SkillLabRecord> = {};
  if (value.skillLabRecords && typeof value.skillLabRecords === "object") {
    Object.entries(value.skillLabRecords).forEach(([id, record]) => {
      if (!record || typeof record !== "object") return;
      const candidate = record as Partial<SkillLabRecord>;
      skillLabRecords[id] = {
        attempts: Math.max(0, Number(candidate.attempts) || 0),
        correct: Math.max(0, Number(candidate.correct) || 0),
        streak: Math.max(0, Number(candidate.streak) || 0),
        needsReview: Boolean(candidate.needsReview),
        lastAttemptAt: typeof candidate.lastAttemptAt === "string" ? candidate.lastAttemptAt : "",
      };
    });
  }
  return {
    schemaVersion: CURRICULUM_VERSION,
    profileId: typeof value.profileId === "string" ? value.profileId : base.profileId,
    nickname: typeof value.nickname === "string" && value.nickname.trim() ? value.nickname.slice(0, 30) : base.nickname,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : base.createdAt,
    savedAt: new Date().toISOString(),
    diagnostic: value.diagnostic && typeof value.diagnostic === "object" ? value.diagnostic as DiagnosticResult : null,
    missionRecords,
    discoveryDays: Array.isArray(value.discoveryDays) ? value.discoveryDays.filter((day): day is string => typeof day === "string") : [],
    enrichmentCompleted: Array.isArray(value.enrichmentCompleted) ? value.enrichmentCompleted.filter((id): id is string => typeof id === "string") : [],
    skillLabRecords,
    skillLabSessions: Array.isArray(value.skillLabSessions) ? value.skillLabSessions.filter((session): session is SkillLabSession => Boolean(session && typeof session === "object" && typeof session.finishedAt === "string")).slice(-30) : [],
    dinoCollection: value.dinoCollection === undefined ? rebuildDinoCollection(missionRecords) : normalizeDinoCollection(value.dinoCollection),
    dinoMilestones: Array.isArray(value.dinoMilestones) ? DINO_SEASONAL_MILESTONES.filter((milestone) => value.dinoMilestones!.includes(milestone)) : [],
    dinoRares: normalizeRareCollection(value.dinoRares),
    dinoShinies: Array.isArray(value.dinoShinies) ? value.dinoShinies.filter((id): id is string => typeof id === "string" && Boolean(getDinoKindById(id))) : [],
    dinoMystery: normalizeMysteryEgg(value.dinoMystery, Math.random()),
    dinoNest: normalizeNest(value.dinoNest),
    checkIns: normalizeCheckIns(value.checkIns),
    dinoRewardedEditions: Array.isArray(value.dinoRewardedEditions) ? value.dinoRewardedEditions.filter((id): id is string => typeof id === "string").slice(-600) : [],
    authenticDone: Array.isArray(value.authenticDone) ? value.authenticDone.filter((id): id is string => typeof id === "string" && Boolean(AUTHENTIC_TASKS[id])) : [],
    sparkBonus: Math.max(0, Math.floor(Number(value.sparkBonus) || 0)),
    selfReliantBadges: Math.max(0, Math.floor(Number(value.selfReliantBadges) || 0)),
    // Hồ sơ cũ (nhập từ tệp sao lưu/mã tiến trình trước v12) chưa có bản đồ nhận thức → gieo từ dữ liệu cũ.
    cognitiveStates: normalizeCognitiveMap(value.cognitiveStates === undefined ? seedCognitiveStates(value as Record<string, unknown>) : value.cognitiveStates),
    fossilShieldUses: normalizeShieldUses(value.fossilShieldUses),
    // Thiếu `mastery` (hồ sơ trước v13) → dựng lại từ bài đầu vào và các buổi học đã lưu trong dữ liệu gốc.
    mastery: normalizeMastery((value as { mastery?: unknown }).mastery, value.diagnostic, value.missionRecords as Record<string, { autonomy?: unknown; sessions?: unknown }> | undefined),
  };
}
/** Hồ sơ từ trước v9 chưa có Đảo Khủng Long: phát lại các buổi đã ghi để con không mất trứng đã xứng đáng. */
function rebuildDinoCollection(missionRecords: Record<string, MissionRecord>): DinoCollection {
  return replayMissionHistory(ALL_DEEP_MISSIONS.filter((mission) => missionRecords[mission.id]).map((mission) => {
    const record = missionRecords[mission.id];
    const logged = record.sessions.map((session): MissionCompletionResult => ({
      band: session.difficulty === "support" || session.difficulty === "stretch" ? session.difficulty : "core",
      maxHintDepth: Math.ceil(Number(session.averageHintDepth) || 0),
      usedTwoStrategies: Boolean(session.usedTwoStrategies),
    }));
    const untracked = Array.from({ length: Math.max(0, record.completedCount - logged.length) }, (): MissionCompletionResult => ({ band: "core", maxHintDepth: record.maxHintDepth, usedTwoStrategies: false }));
    return { mission, results: [...untracked, ...logged] };
  }));
}

function AppHeader({ back, onHome, sparkPoints, completedMissions, totalSessions, current }: { back?: () => void; onHome: () => void; sparkPoints: number; completedMissions: number; totalSessions?: number; current?: "home" | "assessment" | "roadmap" }) {
  const homePath = `${APP_BASE_PATH}/`;
  const assessmentPath = `${APP_BASE_PATH}/assessment/`;
  const roadmapPath = `${APP_BASE_PATH}/roadmap/`;
  return <header className="app-header"><div className="header-left">{back && <Button variant="ghost" size="icon" onClick={back} aria-label="Quay lại" className="back-button"><ArrowLeft /></Button>}<button className="brand" onClick={onHome} type="button"><span className="brand-icon">🦝</span><span>Math Raccoon <small>CLB Toán nâng cao lớp 3</small></span></button></div><nav className="global-nav" aria-label="Điều hướng chính"><a href={homePath} aria-current={current === "home" ? "page" : undefined}><House /> Trang chủ</a><a href={assessmentPath} aria-current={current === "assessment" ? "page" : undefined}><ClipboardCheck /> Đánh giá</a><a href={roadmapPath} aria-current={current === "roadmap" ? "page" : undefined}><CalendarDays /> Lộ trình</a></nav><div className="header-badges"><a href={roadmapPath} aria-label={sparkPoints ? `${sparkPoints} tia sáng, mở trang tiến độ` : "Bắt đầu hành trình, mở lộ trình"}><Sparkles /> {sparkPoints ? <>{sparkPoints}<span> tia sáng</span></> : "Bắt đầu hành trình!"}</a><a href={roadmapPath} aria-label={`${completedMissions} trên 36 chủ đề, mở lộ trình`}><Trophy /> {completedMissions ? <>{completedMissions}/36<span>{typeof totalSessions === "number" ? ` · ${totalSessions} lượt` : " chủ đề"}</span></> : <>36<span> chủ đề đang chờ</span></>}</a></div></header>;
}

function SpeakButton({ text, dark = false, lang = "vi-VN", label = "Nghe đọc đề" }: { text: string; dark?: boolean; lang?: "vi-VN" | "en-US"; label?: string }) {
  function speak() {
    if (!("speechSynthesis" in window)) {
      if (document.documentElement.dataset.largeTextOnSpeak !== "off") document.documentElement.classList.add("read-aloud-large");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.normalize("NFC"));
    utterance.lang = lang;
    utterance.rate = lang === "en-US" ? .82 : .88;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
    if (document.documentElement.dataset.largeTextOnSpeak !== "off") document.documentElement.classList.add("read-aloud-large");
  }
  return <Button type="button" variant="outline" onClick={speak} className={`speak-button ${dark ? "dark" : ""}`} aria-label={label}><Volume2 /> {label}</Button>;
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [learning, setLearning] = useState<LearningProfile>(() => freshProfile());
  const [hydrated, setHydrated] = useState(false);
  const [backupStatus, setBackupStatus] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const [diagnosticIndex, setDiagnosticIndex] = useState(0);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<string[]>(Array(DIAGNOSTIC_QUESTIONS.length).fill(""));
  const [missionId, setMissionId] = useState("geometry-1");
  // Ảnh chụp đầu buổi học: cố định phiên bản bài luyện và nhớ số tia sáng để tính phần thực nhận.
  const [missionSession, setMissionSession] = useState<MissionSessionStart | null>(null);
  // “Bây giờ” của ứng dụng. Tính lại khi ứng dụng được mở lại hoặc sang ngày mới,
  // để chuỗi ngày, lịch ôn và câu đố ngày không bị kẹt ở ngày PWA được nạp.
  const [sessionNow, setSessionNow] = useState(() => Date.now());
  const todayKey = localDayKey(new Date(sessionNow));
  const localDayIndex = localCalendarDayIndex(new Date(sessionNow));
  const [stage, setStage] = useState<MissionStage>("predict");
  const [predictionChoice, setPredictionChoice] = useState("");
  const [predictionRevealed, setPredictionRevealed] = useState(false);
  const [labChoice, setLabChoice] = useState("");
  const [labChecked, setLabChecked] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceChecked, setPracticeChecked] = useState(false);
  const [firstAttempts, setFirstAttempts] = useState<(boolean | null)[]>([]);
  const [attemptCounts, setAttemptCounts] = useState<number[]>([]);
  const [hintDepths, setHintDepths] = useState<number[]>([]);
  const [transferAnswer, setTransferAnswer] = useState("");
  const [transferChecked, setTransferChecked] = useState(false);
  const [transferFirst, setTransferFirst] = useState<boolean | null>(null);
  const [transferAttempts, setTransferAttempts] = useState(0);
  const [transferHintDepth, setTransferHintDepth] = useState(0);
  const [reflectionPrompt, setReflectionPrompt] = useState(0);
  const [reflectionDraft, setReflectionDraft] = useState("");
  const [showFullMap, setShowFullMap] = useState(false);
  const [dailyChoice, setDailyChoice] = useState("");
  const [dailyChecked, setDailyChecked] = useState(false);
  const [skillLabMode, setSkillLabMode] = useState<SkillLabMode>("spiral");
  const [skillLabQuestionIds, setSkillLabQuestionIds] = useState<string[]>([]);
  const [skillLabIndex, setSkillLabIndex] = useState(0);
  const [skillLabAnswer, setSkillLabAnswer] = useState("");
  const [skillLabChecked, setSkillLabChecked] = useState(false);
  const [skillLabHintDepth, setSkillLabHintDepth] = useState(0);
  const [skillLabFirstTry, setSkillLabFirstTry] = useState<boolean | null>(null);
  const [skillLabResults, setSkillLabResults] = useState<Array<{ id: string; firstTry: boolean }>>([]);
  const [skillLabFinished, setSkillLabFinished] = useState(false);
  const [usedTwoStrategies, setUsedTwoStrategies] = useState(false);
  // Giải hai cách: phép tính thứ hai con nhập và kết quả kiểm tra; ghi âm lời phản tư.
  const [secondWayDraft, setSecondWayDraft] = useState("");
  const [secondWayCheck, setSecondWayCheck] = useState<SecondWayCheck | null>(null);
  const [hasVoiceNote, setHasVoiceNote] = useState(false);
  // Nội dung vượt lớp: những phần dẫn nhập con đã đọc trong vòng luyện này.
  const [primersSeen, setPrimersSeen] = useState<string[]>([]);
  const [dinoOutcome, setDinoOutcome] = useState<DinoMissionOutcome | null>(null);
  const [dinoNotice, setDinoNotice] = useState<DinoNotice | null>(null);
  const [dinoTab, setDinoTab] = useState<DinoTab>("to-am");
  const [gallerySelected, setGallerySelected] = useState<string | null>(null);
  const [nestReaction, setNestReaction] = useState({ text: "", key: 0 });
  const [rewardNotes, setRewardNotes] = useState<string[]>([]);
  const [progressCode, setProgressCode] = useState("");
  const [progressCodeInput, setProgressCodeInput] = useState("");
  const [progressCodeStatus, setProgressCodeStatus] = useState("");
  const [storageNoticeOpen, setStorageNoticeOpen] = useState(false);
  const [diagnosticArranged, setDiagnosticArranged] = useState<Record<string, boolean>>({});
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [checkInItems, setCheckInItems] = useState<CheckInItem[]>([]);
  const [checkInMonth, setCheckInMonth] = useState(0);
  const [checkInIndex, setCheckInIndex] = useState(0);
  const [checkInAnswers, setCheckInAnswers] = useState<string[]>([]);
  const [checkInFinished, setCheckInFinished] = useState(false);
  const [cloud, setCloud] = useState<CloudConfig>(() => normalizeCloudConfig(null));
  const [cloudStatusText, setCloudStatusText] = useState("");
  const [cloudBusy, setCloudBusy] = useState(false);
  const cloudRef = useRef(cloud);
  const navCurrent = view === "dashboard" ? "home" : view.startsWith("diagnostic") || view === "check-in" ? "assessment" : view === "year-plan" ? "roadmap" : undefined;
  const [online, setOnline] = useState(true);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateState, setUpdateState] = useState<UpdateState>("idle");
  const [availableRelease, setAvailableRelease] = useState<ContentRelease | null>(null);
  const [packState, setPackState] = useState<PackState>("idle");
  const [reviewPacks, setReviewPacks] = useState<CuratedContentPack[]>([]);
  const [curatedPacks, setCuratedPacks] = useState<CuratedContentPack[]>([]);
  const [enrichmentHintDepth, setEnrichmentHintDepth] = useState(0);
  const [enrichmentReflection, setEnrichmentReflection] = useState("");
  // v12 · trợ lực theo từng câu: số lần sai liên tiếp (hạ bậc giàn giáo), phần thưởng vừa nhận, Phòng Luyện Xoắn Ốc.
  const [wrongStreak, setWrongStreak] = useState(0);
  const [lastSpark, setLastSpark] = useState<SparkReward | null>(null);
  const [scaffoldNotice, setScaffoldNotice] = useState(false);
  const [spiralItems, setSpiralItems] = useState<SpiralReviewItem[]>([]);
  const serviceWorkerRef = useRef<ServiceWorkerRegistration | null>(null);
  const updateReloadRef = useRef(false);
  const deepLinkHandledRef = useRef(false);
  // Hồ sơ mới nhất cho các hiệu ứng chạy trễ (liên kết sâu) mà không cần chạy lại mỗi khi hồ sơ đổi.
  const learningRef = useRef(learning);
  useEffect(() => { learningRef.current = learning; }, [learning]);
  const [linkedWeekNumber, setLinkedWeekNumber] = useState<number | null>(null);
  const [linkedOpenTaskWeek, setLinkedOpenTaskWeek] = useState<number | null>(null);

  useEffect(() => {
    const refreshNow = () => { if (document.visibilityState === "visible") setSessionNow(Date.now()); };
    // Ứng dụng mở liên tục qua nửa đêm: chỉ cập nhật khi ngày địa phương đã đổi.
    const midnightWatch = window.setInterval(() => setSessionNow((previous) => (localDayKey(new Date(previous)) === localDayKey() ? previous : Date.now())), 60_000);
    document.addEventListener("visibilitychange", refreshNow);
    window.addEventListener("pageshow", refreshNow);
    window.addEventListener("focus", refreshNow);
    return () => {
      window.clearInterval(midnightWatch);
      document.removeEventListener("visibilitychange", refreshNow);
      window.removeEventListener("pageshow", refreshNow);
      window.removeEventListener("focus", refreshNow);
    };
  }, []);
  useEffect(() => {
    const task = window.setTimeout(() => {
      try {
        // migrateStorageData: đọc khoá v11 hoặc các khoá cũ v10→v3, sao lưu bản gốc một lần, bổ sung trường v12.
        const saved = migrateStorageData(window.localStorage);
        if (saved) setLearning(migrateProfile(saved));
      } catch { setBackupStatus("Không đọc được hồ sơ cũ; một hồ sơ mới đã được mở an toàn."); }
      try { setStorageNoticeOpen(!window.localStorage.getItem(STORAGE_NOTICE_KEY)); } catch { setStorageNoticeOpen(true); }
      try { setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? "{}") }); } catch { /* dùng mặc định */ }
      try { setCloud(normalizeCloudConfig(JSON.parse(window.localStorage.getItem(CLOUD_KEY) ?? "null"))); } catch { /* chưa cấu hình đồng bộ */ }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(task);
  }, []);
  useEffect(() => {
    if (!hydrated || deepLinkHandledRef.current) return;
    const task = window.setTimeout(() => {
      const route = parseContentRoute(window.location.pathname, window.location.search, APP_BASE_PATH);
      if (!route) return;
      deepLinkHandledRef.current = true;

      if (window.location.pathname !== route.canonicalPath) {
        window.history.replaceState(null, "", route.canonicalPath);
      }
      if (route.kind === "assessment") {
        setView("diagnostic-intro");
        return;
      }
      if (route.kind === "roadmap" || route.kind === "week") {
        const routeWeek = contentRouteWeek(route);
        if (routeWeek) setLinkedWeekNumber(routeWeek);
        setView("year-plan");
        return;
      }
      const weekNumber = contentRouteWeek(route);
      if (!weekNumber) return;
      setLinkedWeekNumber(weekNumber);
      if (route.kind === "open-task") {
        setLinkedOpenTaskWeek(weekNumber);
        setView(learning.diagnostic ? "content-review" : "diagnostic-intro");
        return;
      }
      if (!learning.diagnostic) {
        setView("diagnostic-intro");
        return;
      }

      const linkedWeek = YEAR_WEEKS[weekNumber - 1];
      const linkedMission = ALL_DEEP_MISSIONS.find((mission) => mission.id === linkedWeek?.missionId);
      if (!linkedMission) {
        setView("year-plan");
        return;
      }
      const linkedStage: MissionStage = route.kind === "lesson"
        ? (["predict", "strategies", "practice", "transfer", "reflect"] as MissionStage[])[lessonStageIndex(route.id)]
        : "predict";
      setMissionId(linkedMission.id);
      setMissionSession(beginMissionSession(linkedMission.id, learningRef.current.missionRecords[linkedMission.id], learningRef.current.mastery[linkedMission.domain], sparkPointsOf(learningRef.current)));
      setStage(linkedStage);
      setPredictionChoice("");
      setPredictionRevealed(false);
      setLabChoice("");
      setLabChecked(false);
      setPracticeIndex(0);
      setPracticeAnswer("");
      setPracticeChecked(false);
      setFirstAttempts(Array(PRACTICE_PER_EDITION).fill(null));
      setAttemptCounts(Array(PRACTICE_PER_EDITION).fill(0));
      setHintDepths(Array(PRACTICE_PER_EDITION).fill(0));
      setTransferAnswer("");
      setTransferChecked(false);
      setTransferFirst(null);
      setTransferAttempts(0);
      setTransferHintDepth(0);
      setReflectionPrompt(0);
      setReflectionDraft("");
      setUsedTwoStrategies(false); setSecondWayDraft(""); setSecondWayCheck(null); setHasVoiceNote(false);
      setView("mission");
    }, 0);
    return () => window.clearTimeout(task);
  }, [hydrated, learning.diagnostic]);
  useEffect(() => {
    if (view !== "year-plan" || !linkedWeekNumber) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`week-${linkedWeekNumber}`)?.scrollIntoView({ block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [linkedWeekNumber, view]);
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...learning, schemaVersion: CURRICULUM_VERSION, savedAt: new Date().toISOString() }));
  }, [hydrated, learning]);
  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* không lưu được thì vẫn dùng trong phiên */ }
    document.documentElement.dataset.largeTextOnSpeak = prefs.largeText ? "on" : "off";
  }, [hydrated, prefs]);
  useEffect(() => {
    cloudRef.current = cloud;
    if (!hydrated) return;
    try { window.localStorage.setItem(CLOUD_KEY, JSON.stringify(cloud)); } catch { /* bỏ qua */ }
  }, [hydrated, cloud]);
  useEffect(() => {
    if (!hydrated) return;
    const config = cloudRef.current;
    if (!config.auto || !config.lastSyncedAt || !navigator.onLine) return;
    const timer = window.setTimeout(async () => {
      const status = await cloudStatus(config);
      if (!status.ok) { setCloudStatusText(status.error); return; }
      if (!safeToAutoSave(config, status.updatedAt)) {
        setCloud((current) => ({ ...current, auto: false }));
        setCloudStatusText("Máy khác vừa lưu tiến trình lên đám mây nên tự động đồng bộ đã tạm dừng. Hãy bấm “Tải từ đám mây” hoặc “Lưu lên đám mây” để chọn bản giữ lại.");
        return;
      }
      const code = await encodeProgressCode({ product: "Math Raccoon", schemaVersion: CURRICULUM_VERSION, exportedAt: new Date().toISOString(), profile: learning });
      const saved = await saveToCloud(config, code);
      if (!saved.ok) { setCloudStatusText(saved.error); return; }
      setCloud((current) => ({ ...current, lastSyncedAt: saved.updatedAt }));
      setCloudStatusText(`Đã tự động lưu lúc ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}.`);
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [hydrated, learning]);
  useEffect(() => {
    document.documentElement.classList.remove("read-aloud-large");
  }, [view, stage, practiceIndex, diagnosticIndex, skillLabIndex]);
  useEffect(() => {
    if (!hydrated) return;
    const award = awardSeasonalMilestones(learning.dinoCollection, learning.discoveryDays.length, learning.dinoMilestones);
    if (!award.milestones.length) return;
    const task = window.setTimeout(() => {
      setLearning((profile) => {
        const next = awardSeasonalMilestones(profile.dinoCollection, profile.discoveryDays.length, profile.dinoMilestones);
        return { ...profile, dinoCollection: next.collection, dinoMilestones: [...profile.dinoMilestones, ...next.milestones] };
      });
      const hatched = award.outcomes.at(-1);
      const species = hatched ? getSpeciesById(hatched.speciesId) : undefined;
      if (species) setDinoNotice({ speciesId: species.id, title: `Mốc ${award.milestones.at(-1)} ngày học: trứng Đặc biệt đã nở!`, text: `${species.name} (${species.genus}) chui ra để mừng sự bền bỉ của con. ${species.funFact}` });
    }, 0);
    return () => window.clearTimeout(task);
  }, [hydrated, learning.dinoCollection, learning.discoveryDays.length, learning.dinoMilestones]);
  useEffect(() => {
    if (!hydrated) return;
    const approved = window.localStorage.getItem(APPROVED_PACK_KEY);
    const legacy = window.localStorage.getItem(LEGACY_APPROVED_PACK_KEY);
    if (!approved && !legacy) return;
    const loadApprovedPacks = async () => {
      try {
        const saved = approved
          ? JSON.parse(approved) as Array<{ id?: string; version?: string; url?: string }>
          : [JSON.parse(legacy!) as { id?: string; version?: string; url?: string }];
        const loaded = await Promise.all(saved.filter((item) => item.url).map(async (item) => {
          const response = await fetch(`${APP_BASE_PATH}/${item.url!.replace(/^\//, "")}`);
          const pack = await response.json() as unknown;
          return validateCuratedPack(pack) && pack.id === item.id && pack.version === item.version ? pack : null;
        }));
        const valid = loaded.filter((pack): pack is CuratedContentPack => Boolean(pack));
        if (valid.length) {
          setCuratedPacks(valid);
          setPackState("current");
        }
      } catch {
        setPackState(window.navigator.onLine ? "error" : "offline");
      }
    };
    void loadApprovedPacks();
  }, [hydrated]);
  useEffect(() => {
    const syncOnlineState = () => setOnline(window.navigator.onLine);
    syncOnlineState();
    window.addEventListener("online", syncOnlineState);
    window.addEventListener("offline", syncOnlineState);

    if (!("serviceWorker" in navigator)) {
      return () => {
        window.removeEventListener("online", syncOnlineState);
        window.removeEventListener("offline", syncOnlineState);
      };
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(`${APP_BASE_PATH}/sw.js`, { scope: `${APP_BASE_PATH}/` });
        serviceWorkerRef.current = registration;
        await navigator.serviceWorker.ready;
        setOfflineReady(true);
      } catch {
        setOfflineReady(false);
      }
    };
    const reloadForUpdate = () => {
      if (!updateReloadRef.current) return;
      updateReloadRef.current = false;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", reloadForUpdate);
    void register();

    return () => {
      window.removeEventListener("online", syncOnlineState);
      window.removeEventListener("offline", syncOnlineState);
      navigator.serviceWorker.removeEventListener("controllerchange", reloadForUpdate);
    };
  }, []);

  const roadmap = useMemo(() => {
    if (!learning.diagnostic) return DOMAINS;
    // Thứ tự 36 tuần là cố định; danh sách này chỉ dùng để gợi ý nhiệm vụ tự chọn, miền cần luyện nhất đứng trước.
    return domainsByNeed(learning.mastery).map((id) => DOMAINS.find((domain) => domain.id === id)!);
  }, [learning.diagnostic, learning.mastery]);
  const currentBaseMission = ALL_DEEP_MISSIONS.find((mission) => mission.id === missionId) ?? ALL_DEEP_MISSIONS[0];
  const currentRecord = learning.missionRecords[currentBaseMission.id];
  const domainMastery = learning.mastery[currentBaseMission.domain];
  // Phiên bản được cố định theo ảnh chụp đầu buổi: hoàn thành bài không làm màn kết quả nhảy sang phiên bản kế tiếp.
  const currentEdition = useMemo(() => {
    const inputs = editionInputs(missionSession, currentBaseMission.id, currentRecord, domainMastery);
    return createMissionEdition(currentBaseMission, inputs.completedCount, inputs.mastery);
  }, [currentBaseMission, currentRecord, missionSession, domainMastery]);
  const currentMission = currentEdition.mission;
  const currentPractice = currentMission.deepPractice[practiceIndex];
  const secondWayTarget = secondWayQuestion([...currentMission.deepPractice, currentMission.transfer]);
  // Buổi không có câu điền số: cách thứ hai được kể bằng lời phản tư (ghi âm hoặc viết đủ dài).
  const spokenSecondWay = !secondWayTarget && (hasVoiceNote || reflectionDraft.trim().length >= SPOKEN_SECOND_WAY_MIN);
  const solvedTwoWays = secondWayTarget ? usedTwoStrategies && checkSecondWay(secondWayDraft, Number(secondWayTarget.answer)).ok : spokenSecondWay;
  const currentPracticeCorrect = practiceChecked && answerIsCorrect(currentPractice, practiceAnswer);
  const transferCorrect = transferChecked && answerIsCorrect(currentMission.transfer, transferAnswer);
  const currentDiagnostic = DIAGNOSTIC_QUESTIONS[diagnosticIndex];
  const todayPuzzle = DAILY_PUZZLES_60[localDayIndex % DAILY_PUZZLES_60.length];
  const skillLabQuestions = skillLabQuestionIds.map((id) => SKILL_LAB_QUESTIONS.find((question) => question.id === id)).filter((question): question is SkillLabQuestion => Boolean(question));
  const currentSkillLabQuestion = skillLabQuestions[skillLabIndex];
  const currentSkillLabStrand = currentSkillLabQuestion ? SKILL_LAB_STRANDS.find((strand) => strand.id === currentSkillLabQuestion.strand) : null;
  const beyondTopic = currentSkillLabQuestion?.beyondGrade;
  const primer = beyondTopic ? STRAND_PRIMERS[beyondTopic] : null;
  // Câu vượt lớp đầu tiên của mỗi chủ đề trong vòng luyện: đọc phần dẫn nhập rồi mới trả lời.
  const primerPending = Boolean(beyondTopic && !primersSeen.includes(beyondTopic));
  const currentSkillLabCorrect = Boolean(currentSkillLabQuestion && skillLabChecked && answerIsCorrect(currentSkillLabQuestion, skillLabAnswer));
  const skillLabReviewCount = Object.values(learning.skillLabRecords).filter((record) => record.needsReview).length;
  const skillLabMasteredCount = Object.values(learning.skillLabRecords).filter((record) => record.streak >= 2 && !record.needsReview).length;
  const skillLabAttemptedCount = Object.values(learning.skillLabRecords).filter((record) => record.attempts > 0).length;
  const dinoSummary = summarizeDinoIsland(learning.dinoCollection);
  const learnedToday = learning.discoveryDays.includes(todayKey);
  const rareCount = Object.keys(learning.dinoRares).length;
  const missionForSpecies = (species: DinoSpecies) => DEEP_MISSION_LIBRARY[species.domain][species.slotInDomain - 1];
  const nestFriends: NestFriend[] = [
    ...DINO_SPECIES.flatMap((species): NestFriend[] => {
      const progress = learning.dinoCollection[species.id];
      if (!progress || progress.stage === "trung") return [];
      const mission = missionForSpecies(species);
      const growHint = progress.stage === "con-non" ? `Ôn lại “${mission.title}” để bé lớn thêm` : progress.stage === "thieu-nien" ? `Bứt phá ở “${mission.title}” để bé trưởng thành` : "Lớn hết cỡ rồi—chăm sóc mỗi ngày để thêm gắn bó";
      return [{ kind: species, stage: progress.stage, shiny: learning.dinoShinies.includes(species.id), growHint }];
    }),
    ...DINO_RARE_SPECIES.flatMap((species): NestFriend[] => {
      const find = learning.dinoRares[species.id];
      if (!find) return [];
      const growHint = find.stage === "truong-thanh" ? "Lớn hết cỡ rồi—chăm sóc mỗi ngày để thêm gắn bó" : "Chọn làm bạn đồng hành để bé lớn lên sau mỗi buổi học";
      return [{ kind: species, stage: find.stage, shiny: learning.dinoShinies.includes(species.id), growHint }];
    }),
  ];
  const companion = nestFriends.find((friend) => friend.kind.id === learning.dinoNest.companionId) ?? nestFriends[0] ?? null;
  const careDoneToday = learning.dinoNest.careDay === todayKey ? learning.dinoNest.careDone : [];
  const galleryItem = (species: DinoSpecies): GalleryItem => {
    const progress = learning.dinoCollection[species.id];
    const owned = Boolean(progress && progress.stage !== "trung");
    return { kind: species, region: DINO_REGIONS[species.domain].name, owned, stage: owned ? progress!.stage : null, rarity: owned ? progress!.rarity : null, shiny: learning.dinoShinies.includes(species.id), hint: `Hoàn thành nhiệm vụ “${missionForSpecies(species).title}”.` };
  };
  const rareGalleryItem = (species: (typeof DINO_RARE_SPECIES)[number]): GalleryItem => {
    const find = learning.dinoRares[species.id];
    return { kind: species, region: DINO_RARE_REGIONS[species.pool].name, owned: Boolean(find), stage: find?.stage ?? null, rarity: species.rarity, shiny: learning.dinoShinies.includes(species.id), hint: species.pool === "tram-an" ? `Bứt phá ở tuần ${species.branchWeek} để mở trạm ẩn.` : "Có thể nở từ Trứng Bí Ẩn hoặc khi con Bứt phá, giải hai cách, làm bài toán mở." };
  };
  const gallerySections = [
    ...DOMAINS.map((domain) => ({ id: domain.id, title: `${DINO_REGIONS[domain.id].name} · ${domain.short}`, items: DINO_SPECIES.filter((species) => species.domain === domain.id).map(galleryItem) })),
    { id: "tram-an", title: `${DINO_RARE_REGIONS["tram-an"].name} · loài Hiếm`, items: DINO_RARE_SPECIES.filter((species) => species.pool === "tram-an").map(rareGalleryItem) },
    { id: "ngau-nhien", title: `${DINO_RARE_REGIONS["ngau-nhien"].name} · Hiếm & Huyền thoại`, items: DINO_RARE_SPECIES.filter((species) => species.pool === "ngau-nhien").map(rareGalleryItem) },
  ];
  const completedMissions = Object.keys(learning.missionRecords).filter((id) => ALL_DEEP_MISSIONS.some((mission) => mission.id === id)).length;
  const totalSessions = Object.values(learning.missionRecords).reduce((sum, record) => sum + record.completedCount, 0);
  const reflectionCount = Object.values(learning.missionRecords).filter((record) => record.reflection.trim()).length;
  const totalHints = Object.values(learning.missionRecords).reduce((sum, record) => sum + record.hintsUsed, 0);
  const totalRetries = Object.values(learning.missionRecords).reduce((sum, record) => sum + record.retries, 0);
  const sparkPoints = sparkPointsOf(learning);
  const sessionSparks = sessionSparkGain(missionSession, sparkPoints);
  const museum = fossilMuseum(learning.discoveryDays, learning.fossilShieldUses, todayKey);
  const spiralDueCount = dueReviewStates(learning.cognitiveStates, new Date(sessionNow).toISOString()).length;
  const missionCounts = Object.fromEntries(Object.entries(learning.missionRecords).map(([id, record]) => [id, record.completedCount]));
  const yearProgress = YEAR_WEEKS.map((week) => ({ week, progress: weekProgress(week, missionCounts, learning.enrichmentCompleted) }));
  const completedWeeks = yearProgress.filter((item) => item.progress.complete).length;
  const linkedYearItem = linkedWeekNumber ? yearProgress[linkedWeekNumber - 1] : null;
  const activeYearItem = linkedYearItem ?? yearProgress.find((item) => !item.progress.complete) ?? yearProgress[yearProgress.length - 1];
  const activeWeek = activeYearItem.week;
  const activeWeekProgress = activeYearItem.progress;
  const plannedEnrichmentTask = findPlannedTask(curatedPacks, activeWeek.taskId);
  const fallbackPack = curatedPacks[0];
  const enrichmentTask = plannedEnrichmentTask ?? (fallbackPack ? selectEnrichmentTask(fallbackPack, learning.enrichmentCompleted, localDayIndex) : null);

  useEffect(() => {
    if (!linkedOpenTaskWeek || !learning.diagnostic || !plannedEnrichmentTask) return;
    const task = window.setTimeout(() => {
      setEnrichmentHintDepth(0);
      setEnrichmentReflection("");
      setLinkedOpenTaskWeek(null);
      setView("enrichment");
      scrollTop();
    }, 0);
    return () => window.clearTimeout(task);
  }, [learning.diagnostic, linkedOpenTaskWeek, plannedEnrichmentTask]);

  function missionIsUnlocked(mission: DeepMission) {
    if (mission.sequence === 1) return true;
    if (mission.sequence === 2) return Boolean(learning.missionRecords[`${mission.domain}-1`]) || (learning.diagnostic?.scores[mission.domain].percent ?? 0) >= 80;
    const previous = learning.missionRecords[`${mission.domain}-${mission.sequence - 1}`];
    return Boolean(previous && previous.bestAutonomy >= 55);
  }
  function nextForDomain(domain: DomainId) {
    const missions = DEEP_MISSION_LIBRARY[domain];
    return missions.find((mission) => missionIsUnlocked(mission) && !learning.missionRecords[mission.id])
      ?? missions.find((mission) => missionIsUnlocked(mission) && new Date(learning.missionRecords[mission.id]?.reviewAt ?? Infinity).getTime() <= sessionNow)
      ?? [...missions].reverse().find(missionIsUnlocked) ?? missions[0];
  }
  const dueMissions = ALL_DEEP_MISSIONS.filter((mission) => learning.missionRecords[mission.id] && new Date(learning.missionRecords[mission.id].reviewAt).getTime() <= sessionNow).sort((a, b) => learning.missionRecords[a.id].autonomy - learning.missionRecords[b.id].autonomy);
  const adaptivePlan = roadmap.map((domain) => nextForDomain(domain.id));
  const yearMission = ALL_DEEP_MISSIONS.find((mission) => mission.id === activeWeek.missionId) ?? adaptivePlan[0];
  const recommendedMission = yearMission;
  const choiceMission = adaptivePlan.find((mission) => mission.id !== recommendedMission.id && !learning.missionRecords[mission.id]) ?? ALL_DEEP_MISSIONS.find((mission) => mission.id !== recommendedMission.id && missionIsUnlocked(mission)) ?? recommendedMission;
  const activeWeekNeedsOpenTask = activeWeekProgress.guided === 4 && !activeWeekProgress.openTask;
  const dueCheckInMonth = learning.diagnostic ? checkInDueMonth(completedWeeks, learning.checkIns.length) : null;
  const reachedSequence = Object.fromEntries(DOMAINS.map((domain) => [domain.id, Math.max(1, ...DEEP_MISSION_LIBRARY[domain.id].filter((mission) => learning.missionRecords[mission.id]).map((mission) => mission.sequence))])) as Record<DomainId, number>;
  const domainShort = (id: DomainId) => DOMAINS.find((domain) => domain.id === id)?.short ?? id;
  const radarAxes = DOMAINS.map((domain) => ({ id: domain.id, label: domain.short }));
  const tallyValues = (scores: Record<DomainId, DomainTally>) => Object.fromEntries(DOMAINS.map((domain) => [domain.id, tallyPercent(scores[domain.id])]));
  const weeklyFocusStrands = WEEKLY_FOCUS_STRANDS[activeWeek.domain].map((id) => SKILL_LAB_STRANDS.find((strand) => strand.id === id)!).filter(Boolean);
  const journeyStations: JourneyStation[] = yearProgress.map(({ week, progress }) => {
    const mission = ALL_DEEP_MISSIONS.find((item) => item.id === week.missionId) ?? ALL_DEEP_MISSIONS[0];
    const species = resolveDinoForMission(mission) ?? DINO_SPECIES[0];
    const egg = learning.dinoCollection[species.id];
    const record = learning.missionRecords[mission.id];
    const branchSpecies = branchSpeciesForWeek(week.week);
    const brokeThrough = Boolean(record?.sessions.some((session) => session.difficulty === "stretch"));
    return {
      week: week.week,
      title: mission.title,
      kind: species,
      status: progress.complete ? "done" : week.week === activeWeek.week ? "current" : record ? "open" : "future",
      stage: egg && egg.stage !== "trung" ? egg.stage : null,
      shards: egg?.stage === "trung" ? egg.shards : 0,
      playable: Boolean(learning.diagnostic) && missionIsUnlocked(mission),
      branch: branchSpecies && brokeThrough ? { kind: branchSpecies, claimed: Boolean(learning.dinoRares[branchSpecies.id]) } : null,
    };
  });

  function scrollTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }
  /** Sang câu mới: xoá đếm sai liên tiếp, phần thưởng và thông báo hạ bậc của câu trước. */
  function resetQuestionAids() { setWrongStreak(0); setLastSpark(null); setScaffoldNotice(false); }
  /**
   * Ghi một lần kiểm tra đáp án vào bản đồ nhận thức (Module 5) và trao Tia sáng theo độ sâu gợi ý (Module 4).
   * Trả về độ sâu gợi ý mới nếu cần hạ bậc giàn giáo (sai 2 lần liên tiếp → mở sẵn tầng Trực quan).
   */
  function recordSolve(target: CognitiveTarget, correct: boolean, hintDepth: number, firstTry: boolean, source: AttemptSource = "practice") {
    const now = new Date().toISOString();
    const reward = correct ? sparkRewardFor(hintDepth, firstTry) : null;
    setLearning((profile) => ({
      ...profile,
      cognitiveStates: recordCognitiveAttempt(profile.cognitiveStates, target, { correct, hintDepth, now, source }),
      sparkBonus: profile.sparkBonus + (reward?.amount ?? 0),
      selfReliantBadges: profile.selfReliantBadges + (reward?.selfReliant ? 1 : 0),
    }));
    setLastSpark(reward);
    if (correct) { setWrongStreak(0); return hintDepth; }
    const streak = wrongStreak + 1;
    setWrongStreak(streak);
    const scaffolded = autoScaffoldDepth(hintDepth, streak);
    if (scaffolded !== hintDepth) setScaffoldNotice(true);
    return scaffolded;
  }
  function toggleFocusMode() { setPrefs((current) => ({ ...current, focusMode: !current.focusMode })); }
  function openSpiralReview() {
    const items = buildSpiralReviewSet(learning.cognitiveStates, new Date().toISOString(), localDayIndex + learning.skillLabSessions.length);
    if (!items.length) return;
    setSpiralItems(items); setView("spiral-review"); scrollTop();
  }
  function handleSpiralAttempt({ item, correct, hintDepth, reward }: SpiralAttempt) {
    const now = new Date().toISOString();
    const today = localDayKey();
    setLearning((profile) => ({
      ...profile,
      cognitiveStates: recordCognitiveAttempt(profile.cognitiveStates, item.source, { correct, hintDepth, now, source: "review" }),
      sparkBonus: profile.sparkBonus + (reward?.amount ?? 0),
      selfReliantBadges: profile.selfReliantBadges + (reward?.selfReliant ? 1 : 0),
      discoveryDays: correct && !profile.discoveryDays.includes(today) ? [...profile.discoveryDays, today] : profile.discoveryDays,
    }));
  }
  function rescueWithFossilShield() {
    setLearning((profile) => ({ ...profile, fossilShieldUses: applyFossilShield(profile.discoveryDays, profile.fossilShieldUses, localDayKey(), new Date().toISOString()) }));
  }
  /** Báo cáo tuần cho Cổng Phụ Huynh (Module 6.2): mục tiêu tuần, câu hỏi Socratic, bài làm 7 ngày qua. */
  function buildWeeklyReport(domain: DomainId, taskTitle: string): WeeklyReport {
    const now = Date.now();
    const weekMission = ALL_DEEP_MISSIONS.find((mission) => mission.id === activeWeek.missionId);
    const prompts = parentPromptsFor(domain, taskTitle);
    const missions = ALL_DEEP_MISSIONS.flatMap((mission) => (learning.missionRecords[mission.id]?.sessions ?? [])
      .filter((session) => withinLastWeek(session.finishedAt, now))
      .map((session) => ({ title: mission.title, date: session.finishedAt, firstScore: session.firstScore, autonomy: session.autonomy, hintDepth: session.averageHintDepth, reflection: learning.missionRecords[mission.id].reflection, difficulty: session.difficulty ?? "core" })))
      .sort((a, b) => a.date.localeCompare(b.date));
    return {
      nickname: learning.nickname,
      weekNumber: activeWeek.week,
      weekTitle: activeWeek.title,
      bigQuestion: activeWeek.bigQuestion,
      goal: weekMission?.goal ?? activeWeek.title,
      parentLookFor: activeWeek.parentLookFor,
      socratic: prompts.ask,
      avoid: prompts.avoid,
      missions,
      skillLab: learning.skillLabSessions.filter((session) => withinLastWeek(session.finishedAt, now)).map((session) => ({ date: session.finishedAt, correctFirst: session.correctFirst, total: session.total })),
      studyDays: learning.discoveryDays.filter((day) => withinLastWeek(`${day}T12:00:00.000Z`, now + DAY)).length,
      sparkBonus: learning.sparkBonus,
      selfReliantBadges: learning.selfReliantBadges,
      // Câu phòng luyện lưu skillTag là mã câu (ví dụ "fr-03") → hiển thị tên mảng cho phụ huynh dễ đọc.
      reviewSkills: [...new Set(Object.values(learning.cognitiveStates).filter((state) => state.needsReview).map((state) => (state.strand ? SKILL_LAB_STRANDS.find((strand) => strand.id === state.strand)?.name : undefined) ?? state.skillTag))].slice(0, 6),
    };
  }
  function goDashboard() { setLinkedOpenTaskWeek(null); setView("dashboard"); scrollTop(); }
  function openSkillLab() {
    setSkillLabQuestionIds([]); setSkillLabIndex(0); setSkillLabAnswer(""); setSkillLabChecked(false);
    setSkillLabHintDepth(0); setSkillLabFirstTry(null); setSkillLabResults([]); setSkillLabFinished(false);
    setView("skill-lab"); scrollTop();
  }
  function startSkillLab(mode: SkillLabMode) {
    const session = buildSkillLabSession(learning.skillLabRecords, localDayIndex + learning.skillLabSessions.length, mode, 10, mode === "spiral" ? weeklyFocusStrands.map((strand) => strand.id) : []);
    setSkillLabMode(mode); setSkillLabQuestionIds(session.map((question) => question.id)); setSkillLabIndex(0); setPrimersSeen([]);
    setSkillLabAnswer(""); setSkillLabChecked(false); setSkillLabHintDepth(0); setSkillLabFirstTry(null);
    setSkillLabResults([]); setSkillLabFinished(false); resetQuestionAids(); setView("skill-lab"); scrollTop();
  }
  function checkSkillLab() {
    if (!currentSkillLabQuestion || !skillLabAnswer || skillLabChecked) return;
    const correct = answerIsCorrect(currentSkillLabQuestion, skillLabAnswer);
    const now = new Date().toISOString();
    setSkillLabChecked(true);
    const scaffolded = recordSolve({ topicId: `lab:${currentSkillLabQuestion.strand}`, skillTag: currentSkillLabQuestion.id, strand: currentSkillLabQuestion.strand }, correct, skillLabHintDepth, skillLabFirstTry === null);
    if (scaffolded !== skillLabHintDepth) setSkillLabHintDepth(scaffolded);
    if (skillLabFirstTry === null) setSkillLabFirstTry(correct);
    setLearning((profile) => {
      const next: SkillLabRecord = nextSkillLabRecord(profile.skillLabRecords[currentSkillLabQuestion.id], correct, skillLabHintDepth, now);
      return { ...profile, skillLabRecords: { ...profile.skillLabRecords, [currentSkillLabQuestion.id]: next } };
    });
  }
  function retrySkillLab() { setSkillLabAnswer(""); setSkillLabChecked(false); scrollTop(); }
  function nextSkillLabQuestion() {
    if (!currentSkillLabQuestion || !currentSkillLabCorrect) return;
    const finalResults = [...skillLabResults, { id: currentSkillLabQuestion.id, firstTry: Boolean(skillLabFirstTry) }];
    if (skillLabIndex === skillLabQuestions.length - 1) {
      const today = localDayKey();
      const session: SkillLabSession = {
        finishedAt: new Date().toISOString(), mode: skillLabMode,
        correctFirst: finalResults.filter((result) => result.firstTry).length,
        total: finalResults.length, questionIds: finalResults.map((result) => result.id),
      };
      setLearning((profile) => ({
        ...profile,
        skillLabSessions: [...profile.skillLabSessions, session].slice(-30),
        dinoMystery: advanceMysteryEgg(profile.dinoMystery),
        discoveryDays: profile.discoveryDays.includes(today) ? profile.discoveryDays : [...profile.discoveryDays, today],
      }));
      setSkillLabResults(finalResults); setSkillLabFinished(true); scrollTop(); return;
    }
    setSkillLabResults(finalResults); setSkillLabIndex((index) => index + 1); setSkillLabAnswer("");
    setSkillLabChecked(false); setSkillLabHintDepth(0); setSkillLabFirstTry(null); resetQuestionAids(); scrollTop();
  }
  function startYearRecommendation() {
    if (activeWeekNeedsOpenTask) {
      if (plannedEnrichmentTask) startEnrichment();
      else { setView("content-review"); scrollTop(); }
      return;
    }
    startMission(yearMission);
  }
  function beginDiagnostic() { setDiagnosticIndex(0); setDiagnosticAnswers(Array(DIAGNOSTIC_QUESTIONS.length).fill("")); setView("diagnostic"); scrollTop(); }
  function finishDiagnostic() {
    const raw = Object.fromEntries(DOMAINS.map((domain) => [domain.id, { correct: 0, total: 0 }])) as Record<DomainId, { correct: number; total: number }>;
    DIAGNOSTIC_QUESTIONS.forEach((question, index) => { raw[question.domain].total += 1; if (answerIsCorrect(question, diagnosticAnswers[index])) raw[question.domain].correct += 1; });
    const scores = Object.fromEntries(DOMAINS.map((domain) => { const item = raw[domain.id]; const percent = Math.round((item.correct / item.total) * 100); return [domain.id, { ...item, percent, status: scoreStatus(percent) }]; })) as Record<DomainId, DomainScore>;
    const correct = Object.values(raw).reduce((sum, item) => sum + item.correct, 0);
    const percent = Math.round((correct / DIAGNOSTIC_QUESTIONS.length) * 100);
    const today = localDayKey();
    // Mức thành thạo khởi đầu theo miền. Miền đã có buổi học thì trộn vào thay vì ghi đè (khi làm lại bài đầu vào).
    const measured = diagnosticMastery(DIAGNOSTIC_QUESTIONS, DIAGNOSTIC_QUESTIONS.map((question, index) => answerIsCorrect(question, diagnosticAnswers[index])));
    setLearning((profile) => ({ ...profile, mastery: Object.fromEntries(MASTERY_DOMAINS.map((domain) => [domain, Object.keys(profile.missionRecords).some((id) => id.startsWith(`${domain}-`)) ? blendMastery(profile.mastery[domain], measured[domain]) : measured[domain]])) as MasteryMap, diagnostic: { correct, total: DIAGNOSTIC_QUESTIONS.length, percent, placement: placementFor(percent), scores, finishedAt: new Date().toISOString() }, discoveryDays: profile.discoveryDays.includes(today) ? profile.discoveryDays : [...profile.discoveryDays, today] }));
    setView("diagnostic-result"); scrollTop();
  }
  function diagnosticNext() { if (diagnosticIndex === DIAGNOSTIC_QUESTIONS.length - 1) finishDiagnostic(); else setDiagnosticIndex((index) => index + 1); }
  function startMission(mission: DeepMission) {
    if (!learning.diagnostic) { setView("diagnostic-intro"); return; }
    if (!missionIsUnlocked(mission)) return;
    setMissionId(mission.id); setMissionSession(beginMissionSession(mission.id, learning.missionRecords[mission.id], learning.mastery[mission.domain], sparkPoints));
    setSecondWayDraft(""); setSecondWayCheck(null); setHasVoiceNote(false);
    setStage("predict"); setPredictionChoice(""); setPredictionRevealed(false);
    setLabChoice(""); setLabChecked(false); setPracticeIndex(0); setPracticeAnswer(""); setPracticeChecked(false);
    setFirstAttempts(Array(PRACTICE_PER_EDITION).fill(null)); setAttemptCounts(Array(PRACTICE_PER_EDITION).fill(0)); setHintDepths(Array(PRACTICE_PER_EDITION).fill(0));
    setTransferAnswer(""); setTransferChecked(false); setTransferFirst(null); setTransferAttempts(0); setTransferHintDepth(0);
    setReflectionPrompt(0); setReflectionDraft(learning.missionRecords[mission.id]?.reflection ?? ""); setUsedTwoStrategies(false); setDinoOutcome(null); setRewardNotes([]); resetQuestionAids(); setView("mission"); scrollTop();
  }
  function goStage(next: MissionStage) { setStage(next); resetQuestionAids(); scrollTop(); }
  function checkPractice() {
    if (!practiceAnswer || practiceChecked) return;
    const correct = answerIsCorrect(currentPractice, practiceAnswer); setPracticeChecked(true);
    const scaffolded = recordSolve({ topicId: currentMission.id, skillTag: currentPractice.challengeTag ?? currentMission.unit, domain: currentMission.domain }, correct, hintDepths[practiceIndex], firstAttempts[practiceIndex] === null);
    if (scaffolded !== hintDepths[practiceIndex]) setHintDepths((depths) => depths.map((depth, index) => index === practiceIndex ? scaffolded : depth));
    if (correct && firstAttempts[practiceIndex] === null && hintDepths[practiceIndex] === 0) playRewardSound("brave", prefs.sound);
    setAttemptCounts((values) => values.map((value, index) => index === practiceIndex ? value + 1 : value));
    setFirstAttempts((values) => values.map((value, index) => index === practiceIndex && value === null ? correct : value));
  }
  function nextPractice() {
    if (!currentPracticeCorrect) return;
    if (practiceIndex === currentMission.deepPractice.length - 1) { goStage("transfer"); return; }
    setPracticeIndex((index) => index + 1); setPracticeAnswer(""); setPracticeChecked(false); resetQuestionAids(); scrollTop();
  }
  function checkTransfer() {
    if (!transferAnswer || transferChecked) return;
    const correct = answerIsCorrect(currentMission.transfer, transferAnswer); setTransferChecked(true); setTransferAttempts((value) => value + 1);
    const scaffolded = recordSolve({ topicId: currentMission.id, skillTag: currentMission.transfer.challengeTag ?? `Chuyển giao: ${currentMission.unit}`, domain: currentMission.domain }, correct, transferHintDepth, transferFirst === null);
    if (scaffolded !== transferHintDepth) setTransferHintDepth(scaffolded);
    if (transferFirst === null) setTransferFirst(correct);
    if (correct && transferFirst === null && transferHintDepth === 0) playRewardSound("brave", prefs.sound);
  }
  function completeMission() {
    const rightFirst = firstAttempts.filter(Boolean).length;
    const firstScore = Math.round((rightFirst / currentMission.deepPractice.length) * 100);
    const allDepths = [...hintDepths, transferHintDepth];
    const averageHintDepth = allDepths.reduce((sum, value) => sum + value, 0) / allDepths.length;
    const hintIndependence = Math.max(0, Math.round(100 - (averageHintDepth / 3) * 100));
    const autonomy = Math.round(firstScore * .6 + hintIndependence * .2 + (transferFirst ? 100 : 40) * .2);
    const reviewDays = autonomy >= 85 ? 12 : autonomy >= 65 ? 5 : 2;
    const now = new Date(); const hintsUsed = allDepths.filter((depth) => depth > 0).length; const maxHintDepth = Math.max(...allDepths);
    const retries = attemptCounts.reduce((sum, count) => sum + Math.max(0, count - 1), 0) + Math.max(0, transferAttempts - 1);
    const focusNeeds = currentMission.deepPractice.filter((_, index) => firstAttempts[index] === false || hintDepths[index] > 0).map((question) => question.challengeTag ?? currentMission.unit);
    if (!transferFirst) focusNeeds.push(`Chuyển giao: ${currentMission.transfer.challengeTag ?? currentMission.unit}`);
    const session: SessionEvidence = { finishedAt: now.toISOString(), firstScore, autonomy, averageHintDepth: Number(averageHintDepth.toFixed(2)), transferFirstTry: Boolean(transferFirst), editionId: currentEdition.id, difficulty: currentEdition.difficulty, usedTwoStrategies: solvedTwoWays };
    const today = localDayKey(now);
    const dinoResult: MissionCompletionResult = { band: currentEdition.difficulty, maxHintDepth, usedTwoStrategies: solvedTwoWays };
    const braveCount = countBraveAnswers([...firstAttempts, transferFirst], [...hintDepths, transferHintDepth]);
    const braveAll = braveCount === currentMission.deepPractice.length + 1;
    session.braveCount = braveCount;
    const repeatedEdition = editionAlreadyRewarded(learning.dinoRewardedEditions, currentEdition.id);
    setDinoOutcome(repeatedEdition ? null : recordMissionForDino(learning.dinoCollection, currentMission, dinoResult).outcome);
    const rareSource: RareSource = braveAll ? "dung-cam" : dinoResult.band === "stretch" ? "but-pha" : "hai-cach";
    const rarePlan = rollRarePlan(repeatedEdition ? 0 : missionRareChance(dinoResult, braveAll), rareSource);
    setRewardNotes([
      ...(repeatedEdition ? ["Phiên bản này con đã nhận mảnh trứng rồi, lần này là ôn tập. Làm phiên bản mới để nhận thêm mảnh."] : []),
      ...rewardMessages(applySessionRewards(learning, rarePlan), rareSource),
    ]);
    setLearning((current) => applySessionRewards(current, rarePlan).profile);
    setLearning((profile) => {
      const previous = profile.missionRecords[currentMission.id];
      const record: MissionRecord = { bestFirstScore: Math.max(previous?.bestFirstScore ?? 0, firstScore), autonomy: blendMastery(previous?.autonomy, autonomy), bestAutonomy: Math.max(previous?.bestAutonomy ?? 0, autonomy), hintsUsed, maxHintDepth, retries, completedAt: now.toISOString(), reviewAt: new Date(now.getTime() + reviewDays * DAY).toISOString(), reflection: reflectionDraft.trim() || (hasVoiceNote ? VOICE_REFLECTION_TEXT : ""), prediction: predictionChoice, focusNeeds: [...new Set(focusNeeds)], completedCount: (previous?.completedCount ?? 0) + 1, sessions: [...(previous?.sessions ?? []), session].slice(-10) };
      return { ...profile, mastery: { ...profile.mastery, [currentMission.domain]: blendMastery(profile.mastery[currentMission.domain], autonomy) }, missionRecords: { ...profile.missionRecords, [currentMission.id]: record }, discoveryDays: profile.discoveryDays.includes(today) ? profile.discoveryDays : [...profile.discoveryDays, today], dinoCollection: repeatedEdition ? profile.dinoCollection : recordMissionForDino(profile.dinoCollection, currentMission, dinoResult).collection, dinoRewardedEditions: markEditionRewarded(profile.dinoRewardedEditions, currentEdition.id) };
    });
    goStage("result");
  }
  type RarePlan = { chance: number; source: RareSource; rolls: { chance: number; pick: number; legendary: number } } | null;
  function rollRarePlan(chance: number, source: RareSource): RarePlan {
    return chance > 0 ? { chance, source, rolls: { chance: Math.random(), pick: Math.random(), legendary: Math.random() } } : null;
  }
  /** Phần thưởng chung sau một buổi học: vận may loài hiếm, Trứng Bí Ẩn tiến gần hơn, bạn đồng hành hiếm lớn thêm. */
  function applySessionRewards(profile: LearningProfile, plan: RarePlan) {
    const found = plan ? rollRareFind(profile.dinoRares, plan.chance, plan.rolls, plan.source, new Date().toISOString()) : { rares: profile.dinoRares, foundId: null };
    const companionId = profile.dinoNest.companionId ?? companion?.kind.id ?? null;
    const rares = growRareCompanion(found.rares, companionId);
    const mystery = advanceMysteryEgg(profile.dinoMystery);
    const grownRare = companionId && profile.dinoRares[companionId] && rares[companionId].stage !== profile.dinoRares[companionId].stage ? companionId : null;
    return { profile: { ...profile, dinoRares: rares, dinoMystery: mystery }, foundId: found.foundId, mysteryAppeared: !profile.dinoMystery.ready && mystery.ready, grownRare, grownStage: grownRare ? rares[grownRare].stage : null };
  }
  function rewardMessages(result: ReturnType<typeof applySessionRewards>, source?: RareSource) {
    const notes: string[] = [];
    const found = result.foundId ? getRareSpeciesById(result.foundId) : undefined;
    if (found) notes.push(`May mắn ${source ? `(${RARE_SOURCE_LABELS[source]})` : ""}: trứng ${EGG_RARITY_LABELS[found.rarity]} nở ra ${found.name}! ${found.funFact}`);
    const grown = result.grownRare ? getRareSpeciesById(result.grownRare) : undefined;
    if (grown && result.grownStage) notes.push(`${grown.name} đi học cùng con và đã lớn thành ${DINO_STAGE_LABELS[result.grownStage].toLocaleLowerCase("vi")}.`);
    if (result.mysteryAppeared) notes.push("Có tiếng lách cách trên Đảo Khủng Long: một Trứng Bí Ẩn vừa xuất hiện!");
    return notes;
  }
  function hatchedDinoIds(profile: LearningProfile) {
    return [...DINO_SPECIES.filter((species) => (profile.dinoCollection[species.id]?.stage ?? "trung") !== "trung").map((species) => species.id), ...Object.keys(profile.dinoRares)];
  }
  function openDinoWorld(tab: DinoTab = "to-am") { setDinoTab(tab); setView("dino"); scrollTop(); }
  function openMysteryEggNow() {
    if (!learning.dinoMystery.ready) return;
    const rolls = { pick: Math.random(), legendary: Math.random(), next: Math.random() };
    const now = new Date().toISOString();
    const preview = openMysteryEgg(learning.dinoRares, learning.dinoShinies, hatchedDinoIds(learning), learning.dinoMystery, rolls, now);
    setLearning((profile) => {
      const next = openMysteryEgg(profile.dinoRares, profile.dinoShinies, hatchedDinoIds(profile), profile.dinoMystery, rolls, now);
      return { ...profile, dinoRares: next.rares, dinoShinies: next.shinies, dinoMystery: next.state };
    });
    const kind = preview.foundId ? getRareSpeciesById(preview.foundId) : preview.shinyId ? getDinoKindById(preview.shinyId) : undefined;
    if (preview.foundId && kind) setDinoNotice({ reveal: true, speciesId: kind.id, title: `Trứng Bí Ẩn nở ra ${kind.name}!`, text: `${kind.genus} · loài ${EGG_RARITY_LABELS[(kind as (typeof DINO_RARE_SPECIES)[number]).rarity]}. ${kind.funFact}` });
    else if (preview.shinyId && kind) setDinoNotice({ speciesId: kind.id, title: `${kind.name} đổi sang bộ màu lấp lánh ✨`, text: "Con đã gặp mọi loài hiếm trên đảo, nên Trứng Bí Ẩn tặng một bộ màu hiếm cho bạn cũ." });
  }
  function claimJourneyBranch(station: JourneyStation) {
    if (!station.branch || station.branch.claimed) return;
    const now = new Date().toISOString();
    setLearning((profile) => ({ ...profile, dinoRares: claimBranchStation(profile.dinoRares, station.week, now).rares }));
    const kind = station.branch.kind;
    setDinoNotice({ speciesId: kind.id, title: `Trạm ẩn tuần ${station.week}: gặp ${kind.name}!`, text: `Con đã Bứt phá ở “${station.title}”, nên trạm ẩn mở ra một loài Hiếm. ${kind.funFact}` });
  }
  function chooseCompanion(id: string) {
    setLearning((profile) => ({ ...profile, dinoNest: { ...profile.dinoNest, companionId: id } }));
    setNestReaction({ text: "", key: 0 });
  }
  function careForDino(action: CareAction) {
    if (!companion) return;
    const nest = { ...learning.dinoNest, companionId: companion.kind.id };
    const preview = careForCompanion(nest, action, localDayKey());
    setLearning((profile) => ({ ...profile, dinoNest: careForCompanion({ ...profile.dinoNest, companionId: companion.kind.id }, action, localDayKey()).nest }));
    const lines: Record<CareAction, string> = {
      "cho-an": `${companion.kind.name} ăn ngon lành rồi vẫy đuôi cảm ơn con.`,
      "vuot-ve": `${companion.kind.name} dụi đầu vào tay con, thở đều và mắt lim dim.`,
      "choi-dua": `${companion.kind.name} nhảy tưng tưng quanh tổ, vui quá!`,
    };
    if (preview.gained) playRewardSound("care", prefs.sound);
    setNestReaction((current) => ({ text: preview.gained ? `${lines[action]} (+${preview.gained} gắn bó)` : `${lines[action]} Hôm nay con đã làm việc này rồi—mai mình chơi tiếp nhé.`, key: current.key + 1 }));
  }
  function markAuthenticDone(missionId: string) {
    setLearning((profile) => ({ ...profile, authenticDone: profile.authenticDone.includes(missionId) ? profile.authenticDone : [...profile.authenticDone, missionId] }));
  }
  function dismissStorageNotice() {
    try { window.localStorage.setItem(STORAGE_NOTICE_KEY, new Date().toISOString()); } catch { /* vẫn đóng banner trong phiên này */ }
    setStorageNoticeOpen(false);
  }
  async function createProgressCode() {
    const code = await encodeProgressCode({ product: "Math Raccoon", schemaVersion: CURRICULUM_VERSION, exportedAt: new Date().toISOString(), profile: learning });
    setProgressCode(code);
    try {
      await navigator.clipboard.writeText(code);
      setProgressCodeStatus(`Đã tạo và sao chép mã (${code.length.toLocaleString("vi-VN")} ký tự). Hãy dán vào Ghi chú hoặc gửi cho chính mình để cất giữ.`);
    } catch {
      setProgressCodeStatus("Đã tạo mã. Chạm vào ô mã, chọn tất cả rồi sao chép để cất giữ.");
    }
  }
  async function restoreFromProgressCode() {
    if (!progressCodeInput.trim()) return;
    const result = await decodeProgressCode(progressCodeInput);
    if (!result.ok) { setProgressCodeStatus(result.reason); return; }
    const raw = result.data as { profile?: unknown };
    const candidate = raw && typeof raw === "object" && "profile" in raw ? raw.profile : raw;
    if (!candidate || typeof candidate !== "object" || !("missionRecords" in candidate) || !("schemaVersion" in candidate)) {
      setProgressCodeStatus("Mã hợp lệ nhưng không chứa hồ sơ Math Raccoon; dữ liệu hiện tại được giữ nguyên.");
      return;
    }
    const migrated = migrateProfile(candidate);
    setLearning(migrated);
    setProgressCodeInput("");
    setProgressCodeStatus(`Đã khôi phục hồ sơ “${migrated.nickname}”: ${Object.keys(migrated.missionRecords).length} nhiệm vụ, ${Object.values(migrated.dinoCollection).filter((item) => item.stage !== "trung").length + Object.keys(migrated.dinoRares).length} bé khủng long.`);
  }
  function startCheckIn(month: number) {
    const items = buildCheckIn(month, reachedSequence, learning.checkIns.flatMap((entry) => entry.prompts));
    setCheckInMonth(month); setCheckInItems(items); setCheckInIndex(0); setCheckInAnswers(Array(items.length).fill(""));
    setCheckInFinished(false); setView("check-in"); scrollTop();
  }
  function nextCheckInQuestion() {
    if (!checkInAnswers[checkInIndex]) return;
    if (checkInIndex < checkInItems.length - 1) { setCheckInIndex((index) => index + 1); scrollTop(); return; }
    const today = localDayKey();
    const result = scoreCheckIn(checkInMonth, checkInItems, checkInItems.map((item, index) => answerIsCorrect(item.question, checkInAnswers[index])), new Date().toISOString());
    setLearning((profile) => ({
      ...profile,
      checkIns: normalizeCheckIns([...profile.checkIns.filter((entry) => entry.month !== result.month), result]),
      discoveryDays: profile.discoveryDays.includes(today) ? profile.discoveryDays : [...profile.discoveryDays, today],
    }));
    setCheckInFinished(true); scrollTop();
  }
  function updateCloud(patch: Partial<CloudConfig>) {
    setCloud((current) => ({ ...current, ...patch, ...(patch.url !== undefined || patch.familyCode !== undefined || patch.pin !== undefined ? { lastSyncedAt: null, auto: false } : {}) }));
  }
  async function cloudSaveNow() {
    const problem = validateCloudConfig(cloud);
    if (problem) { setCloudStatusText(problem); return; }
    setCloudBusy(true); setCloudStatusText("Đang lưu lên đám mây…");
    const code = await encodeProgressCode({ product: "Math Raccoon", schemaVersion: CURRICULUM_VERSION, exportedAt: new Date().toISOString(), profile: learning });
    const saved = await saveToCloud(cloud, code);
    setCloudBusy(false);
    if (!saved.ok) { setCloudStatusText(saved.error); return; }
    setCloud((current) => ({ ...current, lastSyncedAt: saved.updatedAt }));
    setCloudStatusText("Đã lưu toàn bộ tiến trình lên Google Sheets của gia đình.");
  }
  async function cloudLoadNow() {
    const problem = validateCloudConfig(cloud);
    if (problem) { setCloudStatusText(problem); return; }
    setCloudBusy(true); setCloudStatusText("Đang tải từ đám mây…");
    const loaded = await loadFromCloud(cloud);
    setCloudBusy(false);
    if (!loaded.ok || !loaded.code) { setCloudStatusText(loaded.ok ? "Đám mây chưa có dữ liệu." : loaded.error); return; }
    const decoded = await decodeProgressCode(loaded.code);
    const raw = decoded.ok ? decoded.data as { profile?: unknown } : null;
    const candidate = raw && typeof raw === "object" && "profile" in raw ? raw.profile : raw;
    if (!candidate || typeof candidate !== "object" || !("missionRecords" in candidate)) { setCloudStatusText(decoded.ok ? "Dữ liệu trên đám mây không phải hồ sơ Math Raccoon." : decoded.reason); return; }
    const migrated = migrateProfile(candidate);
    setLearning(migrated);
    setCloud((current) => ({ ...current, lastSyncedAt: loaded.updatedAt }));
    setCloudStatusText(`Đã tải hồ sơ “${migrated.nickname}” từ đám mây (${Object.keys(migrated.missionRecords).length} nhiệm vụ).`);
  }
  function exportBackup() {
    const blob = new Blob([JSON.stringify({ product: "Math Raccoon", schemaVersion: CURRICULUM_VERSION, exportedAt: new Date().toISOString(), profile: learning }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `math-raccoon-${localDayKey()}.json`; link.click(); URL.revokeObjectURL(url);
    setBackupStatus("Đã tạo bản sao lưu. Hãy giữ tệp này ở nơi an toàn.");
  }
  async function importBackup(file?: File) {
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text()) as { profile?: unknown } | LearningProfile;
      const candidate = "profile" in raw ? raw.profile : raw;
      if (!candidate || typeof candidate !== "object" || !("missionRecords" in candidate) || !("schemaVersion" in candidate)) throw new Error("invalid");
      const migrated = migrateProfile(candidate);
      setLearning(migrated); setBackupStatus(`Đã khôi phục hồ sơ “${migrated.nickname}” với ${Object.keys(migrated.missionRecords).length} nhiệm vụ.`);
    } catch { setBackupStatus("Tệp không đúng định dạng Math Raccoon; dữ liệu hiện tại được giữ nguyên."); }
    finally { if (importRef.current) importRef.current.value = ""; }
  }
  async function checkForContentUpdate() {
    if (!window.navigator.onLine) {
      setUpdateState("offline");
      return;
    }
    setUpdateState("checking");
    try {
      const response = await fetch(`${CONTENT_RELEASE_URL}?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("release-unavailable");
      const release = await response.json() as ContentRelease;
      if (release.approval.status !== "approved-for-release" || !release.approval.parentApprovalRequired) {
        setAvailableRelease(null);
        setUpdateState("rejected");
        return;
      }
      const newer = compareReleaseVersions(release.version, CONTENT_RELEASE.version) > 0;
      setAvailableRelease(newer ? release : null);
      setUpdateState(newer ? "available" : "current");
    } catch {
      setUpdateState("error");
    }
  }
  async function installContentUpdate() {
    setUpdateState("installing");
    updateReloadRef.current = true;
    try {
      const registration = serviceWorkerRef.current ?? await navigator.serviceWorker?.getRegistration(`${APP_BASE_PATH}/`);
      if (!registration) {
        window.location.reload();
        return;
      }
      await registration.update();
      if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
      else window.setTimeout(() => window.location.reload(), 900);
    } catch {
      updateReloadRef.current = false;
      setUpdateState("error");
    }
  }
  async function checkCuratedContent() {
    if (!window.navigator.onLine) { setPackState("offline"); return; }
    setPackState("checking");
    try {
      const catalogResponse = await fetch(`${CONTENT_CATALOG_URL}?t=${Date.now()}`, { cache: "no-store" });
      if (!catalogResponse.ok) throw new Error("catalog-unavailable");
      const catalog = await catalogResponse.json() as ContentCatalog;
      if (catalog.schemaVersion !== 1 || catalog.status !== "approved-for-release" || catalog.parentApprovalRequired !== true || !catalog.packs.length) {
        setPackState("rejected"); return;
      }
      const packs = await Promise.all(catalog.packs.map(async (item) => {
        const response = await fetch(`${APP_BASE_PATH}/${item.url.replace(/^\//, "")}?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("pack-unavailable");
        const pack = await response.json() as unknown;
        if (!validateCuratedPack(pack) || pack.id !== item.id || pack.version !== item.version || pack.tasks.length !== item.taskCount) throw new Error("pack-rejected");
        return pack;
      }));
      setReviewPacks(packs);
      const hasNewPack = packs.some((pack) => !curatedPacks.some((current) => current.id === pack.id && current.version === pack.version));
      setPackState(hasNewPack ? "available" : "current");
    } catch {
      setPackState("error");
    }
  }
  function approveCuratedPack(pack: CuratedContentPack) {
    const next = [...curatedPacks.filter((current) => current.id !== pack.id), pack].sort((a, b) => (a.month ?? 0) - (b.month ?? 0));
    const saved = next.map((item) => ({ id: item.id, version: item.version, url: `content-packs/${item.id}.json`, approvedAt: new Date().toISOString() }));
    window.localStorage.setItem(APPROVED_PACK_KEY, JSON.stringify(saved));
    setCuratedPacks(next);
    const allApproved = reviewPacks.every((item) => next.some((current) => current.id === item.id && current.version === item.version));
    setPackState(allApproved ? "current" : "available");
  }
  function startEnrichment() {
    if (!enrichmentTask) return;
    setEnrichmentHintDepth(0); setEnrichmentReflection(""); setView("enrichment"); scrollTop();
  }
  function completeEnrichment() {
    if (!enrichmentTask || enrichmentReflection.trim().length < 5) return;
    const today = localDayKey();
    const firstTime = !learning.enrichmentCompleted.includes(enrichmentTask.id);
    const weekMission = enrichmentTask.week ? ALL_DEEP_MISSIONS.find((mission) => mission.id === YEAR_WEEKS[enrichmentTask.week! - 1]?.missionId) : undefined;
    const legendaryTarget = weekMission ?? { domain: enrichmentTask.domain };
    const legendary = firstTime ? awardLegendaryEgg(learning.dinoCollection, legendaryTarget).outcome : null;
    const legendarySpecies = legendary ? getSpeciesById(legendary.speciesId) : undefined;
    setLearning((profile) => ({
      ...profile,
      enrichmentCompleted: profile.enrichmentCompleted.includes(enrichmentTask.id) ? profile.enrichmentCompleted : [...profile.enrichmentCompleted, enrichmentTask.id],
      discoveryDays: profile.discoveryDays.includes(today) ? profile.discoveryDays : [...profile.discoveryDays, today],
      dinoCollection: firstTime ? awardLegendaryEgg(profile.dinoCollection, legendaryTarget).collection : profile.dinoCollection,
    }));
    const rarePlan = rollRarePlan(firstTime ? OPEN_TASK_RARE_CHANCE : 0, "bai-toan-mo");
    const bonus = rewardMessages(applySessionRewards(learning, rarePlan), "bai-toan-mo");
    setLearning((current) => applySessionRewards(current, rarePlan).profile);
    if (legendarySpecies) setDinoNotice({ speciesId: legendarySpecies.id, title: `Bài toán mở làm nở trứng Huyền thoại: ${legendarySpecies.name}!`, text: [`${legendarySpecies.genus} · ${DINO_REGIONS[legendarySpecies.domain].name}. ${legendarySpecies.funFact}`, ...bonus].join(" ") });
    else if (bonus.length) setDinoNotice({ speciesId: learning.dinoNest.companionId ?? "", title: "Tin vui từ Đảo Khủng Long", text: bonus.join(" ") });
    goDashboard();
  }
  function renderBraveEgg(firstTry: boolean | null, hintDepth: number, solved: boolean) {
    const state = firstTry === true && hintDepth === 0 && solved ? "earned" : hintDepth > 0 || firstTry === false ? "lost" : "ready";
    return <div className={`brave-egg ${state}`} aria-live="polite"><DinoEgg hue={state === "lost" ? 220 : 45} /><span>{state === "earned" ? "Trứng Dũng cảm sáng lên! Con tự làm, không cần gợi ý." : state === "lost" ? "Câu này con đã mở gợi ý hoặc thử lại—không sao, dùng gợi ý cũng là học." : "Thử tự làm không cần gợi ý → Trứng Dũng cảm!"}</span></div>;
  }
  /** Câu trả lời dạng số dùng bàn phím số ảo (Module 1): ô readOnly nên iPad không bật bàn phím hệ thống. */
  function renderAnswerInput(question: DiagnosticQuestion | DeepQuestion | SkillLabQuestion, value: string, onChange: (value: string) => void, disabled = false, onSubmit?: () => void) {
    if (question.type === "number") return <div className="number-answer-wrap"><NumpadAnswer value={value} onChange={onChange} onSubmit={onSubmit} disabled={disabled} /><span>Chỉ nhập số, không cần ghi đơn vị</span></div>;
    return <RadioGroup value={value} onValueChange={onChange} disabled={disabled} className="answer-list">{question.options?.map((option, index) => <label key={option} className="answer-row"><RadioGroupItem value={option} id={`${"id" in question ? question.id : "q"}-${index}`} /><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span></label>)}</RadioGroup>;
  }
  if (view === "skill-lab") {
    if (skillLabFinished) {
      const firstTryScore = skillLabResults.filter((result) => result.firstTry).length;
      const reviewStrands = [...new Set(skillLabResults.filter((result) => !result.firstTry).map((result) => SKILL_LAB_QUESTIONS.find((question) => question.id === result.id)?.strand).filter(Boolean))]
        .map((id) => SKILL_LAB_STRANDS.find((strand) => strand.id === id)).filter((strand): strand is NonNullable<typeof strand> => Boolean(strand));
      return <main className="app-shell min-h-screen"><div className="page-wrap narrow"><AppHeader current={navCurrent} back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} totalSessions={totalSessions} /><section className="skill-lab-result"><div className="skill-lab-result-mark">{firstTryScore === skillLabResults.length ? "🌟" : "🧭"}</div><p className="eyebrow">Kết thúc vòng luyện xoắn ốc</p><h1>{firstTryScore}/{skillLabResults.length} câu đúng ngay lần đầu</h1><p>Mọi câu đều đã được con giải đúng. Hệ thống chỉ giữ lại những ý tưởng cần gọi lại, không phạt việc thử và sửa.</p><div className="skill-lab-result-stats"><div><strong>{skillLabMasteredCount}</strong><span>Câu đã vững</span></div><div><strong>{skillLabReviewCount}</strong><span>Câu cần gọi lại</span></div><div><strong>{learning.skillLabSessions.length}</strong><span>Vòng đã hoàn thành</span></div></div>{reviewStrands.length > 0 ? <div className="skill-lab-focus"><Lightbulb /><div><strong>Lần sau nên gọi lại</strong><p>{reviewStrands.map((strand) => strand.short).join(" · ")}</p></div></div> : <div className="skill-lab-focus success"><CheckCircle2 /><div><strong>Vòng này không có câu nào cần sửa</strong><p>Con có thể nghỉ hoặc trở lại lộ trình 36 tuần.</p></div></div>}<div className="result-actions"><Button variant="outline" onClick={() => startSkillLab("spiral")}><RefreshCw /> Vòng 10 câu mới</Button><Button onClick={goDashboard} className="primary-action small">Về hành trình chính <ArrowRight /></Button></div></section></div></main>;
    }
    if (!currentSkillLabQuestion || !currentSkillLabStrand) {
      return <main className="app-shell min-h-screen"><div className="page-wrap"><AppHeader current={navCurrent} back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} totalSessions={totalSessions} /><section className="skill-lab-hero"><div><p className="eyebrow">Phòng luyện xoắn ốc · nội dung bổ sung</p><h1>Lấp khoảng trống, không biến việc học thành cày đề</h1><p>Mỗi vòng chọn 10 câu từ tám mảng còn thiếu trong lộ trình chính. Câu làm sai sẽ quay lại có chủ đích; mỗi câu vẫn giữ ba tầng gợi ý và lời giải.</p><div className="skill-lab-actions"><Button onClick={() => startSkillLab("spiral")} className="primary-action"><RefreshCw /> Bắt đầu 10 câu hôm nay</Button><Button variant="outline" onClick={() => startSkillLab("review")} disabled={skillLabReviewCount === 0}><Lightbulb /> {skillLabReviewCount ? `Ôn ${skillLabReviewCount} câu chưa vững` : "Chưa có câu cần ôn"}</Button></div></div><div className="skill-lab-summary"><span className="skill-lab-focus-chip"><strong>{weeklyFocusStrands.map((strand) => strand.emoji).join(" ")}</strong> Mảng nổi bật tuần {activeWeek.week}: {weeklyFocusStrands.map((strand) => strand.short).join(", ")}</span><span><strong>{SKILL_LAB_QUESTION_COUNT}</strong> câu gốc</span><span><strong>8</strong> mảng bổ sung</span><span><strong>{skillLabAttemptedCount}</strong> câu đã thử</span><span><strong>{skillLabMasteredCount}</strong> câu đã vững</span></div></section><section className="spiral-variant-strip"><span aria-hidden="true">🌀</span><div><p className="eyebrow">Phòng Luyện Xoắn Ốc · biến thể số liệu mới</p><h2>{spiralDueCount ? `${spiralDueCount} dạng bài đến hạn ôn hôm nay` : "Chưa có dạng bài đến hạn ôn"}</h2><p>Dạng bài con làm sai sẽ quay lại sau 24 giờ với số liệu mới nhưng cùng cấu trúc. Sai 2 lần liên tiếp thì số được làm nhỏ lại và sơ đồ đoạn thẳng mở sẵn.</p></div><Button onClick={openSpiralReview} disabled={!spiralDueCount} className="primary-action small">Vào phòng ôn <ArrowRight /></Button></section><section className="skill-lab-strands"><div className="panel-heading"><div><p className="eyebrow">Ma trận bổ sung</p><h2>Tám mảng được chọn sau khi đối chiếu chương trình</h2></div><span>Mỗi mảng 6 câu · không đếm giờ</span></div><div>{SKILL_LAB_STRANDS.map((strand) => { const records = SKILL_LAB_QUESTIONS.filter((question) => question.strand === strand.id).map((question) => learning.skillLabRecords[question.id]).filter(Boolean); const mastered = records.filter((record) => record.streak >= 2 && !record.needsReview).length; return <article key={strand.id}><span style={{ background: strand.soft, color: strand.color }}>{strand.emoji}</span><div><strong>{strand.name}</strong><p>{strand.description}</p><small>{mastered}/6 câu đã vững</small></div></article>; })}</div></section><p className="skill-lab-note"><ShieldCheck /> Nội dung được biên soạn lại theo triết lý Math Raccoon; không sao chép ngân hàng câu hỏi của chương trình đối chiếu.</p></div></main>;
    }
    return <main className="app-shell min-h-screen"><div className="page-wrap narrow"><AppHeader current={navCurrent} back={openSkillLab} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} totalSessions={totalSessions} /><section className="skill-lab-progress"><div><p className="eyebrow">{skillLabMode === "review" ? "Ôn câu chưa vững" : "Vòng luyện xoắn ốc"}</p><strong>Câu {skillLabIndex + 1}/{skillLabQuestions.length}</strong></div><span>{currentSkillLabStrand.emoji} {currentSkillLabStrand.short}</span></section><Progress value={((skillLabIndex + (currentSkillLabCorrect ? 1 : 0)) / skillLabQuestions.length) * 100} className="diagnostic-progress" /><section className="skill-lab-card"><div className="question-meta"><span style={{ background: currentSkillLabStrand.soft, color: currentSkillLabStrand.color }}>{currentSkillLabStrand.emoji}</span><div><small>Mảng bổ sung</small><strong>{currentSkillLabStrand.name}</strong></div><em>Gợi ý {skillLabHintDepth}/3</em></div>{primer && <div className={`beyond-grade ${primerPending ? "pending" : ""}`}><span className="beyond-grade-badge">Vượt lớp</span>{primerPending ? <><strong>Trước khi trả lời: {primer.title}</strong><p>{primer.idea}</p><p className="beyond-grade-example">{primer.example}</p><Button variant="outline" onClick={() => setPrimersSeen((seen) => [...seen, beyondTopic!])}>Con đã đọc, xem câu hỏi</Button></> : <small>Câu này đi xa hơn chương trình lớp 3 một bước: {primer.title.toLocaleLowerCase("vi")}.</small>}</div>}<KaraokeReader key={`lab-${currentSkillLabQuestion.id}`} text={currentSkillLabQuestion.prompt} as="h1" />{currentSkillLabQuestion.englishPrompt && <div className="math-english-prompt"><Globe2 /><div><small>Math English</small><KaraokeReader key={`lab-en-${currentSkillLabQuestion.id}`} text={currentSkillLabQuestion.englishPrompt} as="strong" lang="en-US" label="Nghe tiếng Anh" idPrefix="en-" /></div></div>}{currentSkillLabQuestion.diagram && <pre className="skill-lab-diagram" role="img" aria-label={`Sơ đồ cho câu hỏi: ${currentSkillLabQuestion.diagram.replace(/\n/g, "; ")}`}>{currentSkillLabQuestion.diagram}</pre>}{!primerPending && renderAnswerInput(currentSkillLabQuestion, skillLabAnswer, setSkillLabAnswer, skillLabChecked, checkSkillLab)}{scaffoldNotice && !currentSkillLabCorrect && <p className="scaffold-note"><Sparkles /> Con đã thử 2 lần—mình mở sẵn gợi ý Trực quan để con nhìn rõ cấu trúc bài nhé.</p>}{!currentSkillLabCorrect && <HintStack hints={currentSkillLabQuestion.hints} depth={skillLabHintDepth} />}{skillLabChecked && <div className={`feedback ${currentSkillLabCorrect ? "correct" : "incorrect"}`}><span>{currentSkillLabCorrect ? <Check /> : <RefreshCw />}</span><div><strong>{currentSkillLabCorrect ? "Đúng rồi—ý tưởng đang đứng vững" : "Chưa khớp—hãy sửa cách nghĩ"}</strong><p>{currentSkillLabCorrect ? currentSkillLabQuestion.explanation : currentSkillLabQuestion.misconception}</p>{currentSkillLabCorrect && lastSpark && <p className="spark-earned">{lastSpark.label}</p>}</div></div>}<div className="practice-actions">{!currentSkillLabCorrect && <HintLadderButton key={`hint-lab-${currentSkillLabQuestion.id}`} depth={skillLabHintDepth} onOpen={() => setSkillLabHintDepth((depth) => Math.min(3, depth + 1))} />}{skillLabChecked && !currentSkillLabCorrect ? <Button onClick={retrySkillLab}>Sửa cách làm</Button> : currentSkillLabCorrect ? <Button onClick={nextSkillLabQuestion} className="primary-action small">{skillLabIndex === skillLabQuestions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"} <ArrowRight /></Button> : <Button onClick={checkSkillLab} disabled={!skillLabAnswer}>Kiểm tra</Button>}</div></section><p className="diagnostic-note"><LockKeyhole /> Không có đồng hồ đếm ngược. Sai lúc đầu là đang khám phá; câu chỉ vào vòng ôn khi con đã mở đủ 3 tầng gợi ý mà vẫn chưa ra.</p><StudyToolbar focusOn={prefs.focusMode} onToggleFocus={toggleFocusMode} resetKey={`lab-${currentSkillLabQuestion.id}`} /></div></main>;
  }
  if (view === "spiral-review") {
    return <main className="app-shell min-h-screen"><div className="page-wrap narrow"><AppHeader current={navCurrent} back={openSkillLab} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} totalSessions={totalSessions} /><SpiralReviewRoom key={spiralItems.map((item) => item.question.id).join("|")} items={spiralItems} onAttempt={handleSpiralAttempt} onExit={openSkillLab} focusOn={prefs.focusMode} onToggleFocus={toggleFocusMode} /></div></main>;
  }
  if (view === "check-in" && checkInItems.length) {
    if (checkInFinished) {
      const result = learning.checkIns.find((entry) => entry.month === checkInMonth);
      const previous = [...learning.checkIns].reverse().find((entry) => entry.month < checkInMonth);
      const baseline = previous ? { label: `Tháng ${previous.month}`, scores: previous.scores } : learning.diagnostic ? { label: "Đánh giá đầu vào", scores: learning.diagnostic.scores } : null;
      if (result) return <main className="app-shell min-h-screen"><div className="page-wrap narrow"><AppHeader current={navCurrent} back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} /><section className="checkin-result"><p className="eyebrow">Đánh giá Tháng {result.month} · xong</p><h1>{result.correct}/{result.total} câu đúng</h1><p>Không có đồng hồ và không so với bạn khác. Kết quả giúp chọn độ khó cho tháng tới và cho thấy con đã đi xa đến đâu.</p><AbilityRadar title="Bản đồ năng lực 6 chiều" axes={radarAxes} series={[...(baseline ? [{ label: baseline.label, values: tallyValues(baseline.scores), tone: "baseline" as const }] : []), { label: `Tháng ${result.month}`, values: tallyValues(result.scores), tone: "current" as const }]} /><div className="checkin-compare">{DOMAINS.map((domain) => { const before = baseline?.scores[domain.id]; const now = result.scores[domain.id]; return <div key={domain.id}><strong>{domain.short}</strong><div><small>{baseline ? `${baseline.label}: ${before?.correct ?? 0}/${before?.total ?? 0}` : "Lần đầu"}</small><Progress value={tallyPercent(before)} className="checkin-bar before" /><small>Tháng {result.month}: {now.correct}/{now.total}</small><Progress value={tallyPercent(now)} className="checkin-bar now" /></div></div>; })}</div><ul className="ability-insights">{abilityInsights(result.scores, domainShort, (id) => nextForDomain(id).title).map((line) => <li key={line}>{line}</li>)}</ul><div className="result-actions"><Button onClick={goDashboard} className="primary-action small">Về hành trình <ArrowRight /></Button></div></section></div></main>;
    }
    const item = checkInItems[checkInIndex];
    const domain = DOMAINS.find((entry) => entry.id === item.domain)!; const Icon = DOMAIN_ICONS[domain.id];
    return <main className="app-shell min-h-screen"><div className="page-wrap narrow"><AppHeader current={navCurrent} back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} /><section className="assessment-progress"><div><p className="eyebrow">Đánh giá Tháng {checkInMonth} · {CHECKIN_SIZE} câu</p><strong>Câu {checkInIndex + 1} / {checkInItems.length}</strong></div><span>{item.kind === "trong-tam" ? "Trọng tâm tháng" : "Vòng quanh 6 miền"}</span></section><Progress value={((checkInIndex + 1) / checkInItems.length) * 100} className="diagnostic-progress" /><section className="diagnostic-card"><div className="question-meta"><span style={{ background: domain.soft, color: domain.color }}><Icon /></span><div><small>Miền tư duy</small><strong>{domain.name}</strong></div></div><KaraokeReader key={`checkin-${checkInIndex}`} text={item.question.prompt} as="h1" />{renderAnswerInput(item.question, checkInAnswers[checkInIndex] ?? "", (value) => setCheckInAnswers((answers) => answers.map((answer, index) => index === checkInIndex ? value : answer)), false, nextCheckInQuestion)}<div className="assessment-navigation"><Button variant="outline" onClick={() => setCheckInIndex((index) => Math.max(0, index - 1))} disabled={checkInIndex === 0}><ArrowLeft /> Câu trước</Button><Button onClick={nextCheckInQuestion} disabled={!checkInAnswers[checkInIndex]} className="primary-action small">{checkInIndex === checkInItems.length - 1 ? "Xem bản đồ năng lực" : "Câu tiếp theo"} <ArrowRight /></Button></div></section><p className="diagnostic-note"><LockKeyhole /> Không gợi ý, không đồng hồ. Con cứ làm theo cách con nghĩ—kết quả chỉ để chọn bài vừa sức.</p><StudyToolbar focusOn={prefs.focusMode} onToggleFocus={toggleFocusMode} resetKey={`checkin-${checkInMonth}-${checkInIndex}`} /></div></main>;
  }
  if (view === "dino") {
    return <main className="app-shell min-h-screen"><div className="page-wrap"><AppHeader current={navCurrent} back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} totalSessions={totalSessions} /><section className="dino-world-hero"><div><p className="eyebrow">Đảo Khủng Long · {dinoSummary.hatched + rareCount}/{DINO_SPECIES.length + DINO_RARE_SPECIES.length} loài</p><h1>{dinoTab === "to-am" ? "Tổ ấm của bạn đồng hành" : "Bộ sưu tập khủng long"}</h1><p>{dinoTab === "to-am" ? "Chọn một bé đã nở để chăm sóc mỗi ngày. Bé lớn lên thật sự khi con học: ôn lại nhiệm vụ, Bứt phá, hoặc đưa bé hiếm đi học cùng." : "Mỗi ô là một loài. Ô tối là loài con chưa gặp—tên vùng đất cho con biết nên tìm ở đâu."}</p></div><div className="dino-world-tabs" role="tablist" aria-label="Khu vực trên đảo"><button type="button" role="tab" aria-selected={dinoTab === "to-am"} className={dinoTab === "to-am" ? "active" : ""} onClick={() => setDinoTab("to-am")}>Tổ ấm</button><button type="button" role="tab" aria-selected={dinoTab === "bo-suu-tap"} className={dinoTab === "bo-suu-tap" ? "active" : ""} onClick={() => setDinoTab("bo-suu-tap")}>Bộ sưu tập</button></div></section><FossilMuseumCard museum={museum} onRescue={rescueWithFossilShield} />{dinoNotice && <div className="dino-hatch-note celebrate" aria-live="polite"><span>{getDinoKindById(dinoNotice.speciesId) ? <DinoFigure kind={getDinoKindById(dinoNotice.speciesId)!} stage="con-non" animated /> : <Sparkles />}</span><div><strong>{dinoNotice.title}</strong><p>{dinoNotice.text}</p></div><Button variant="outline" onClick={() => { setGallerySelected(dinoNotice.speciesId || null); setDinoNotice(null); setDinoTab("bo-suu-tap"); }}>Xem bé</Button></div>}{learning.dinoMystery.ready && <button type="button" className="dino-mystery" onClick={openMysteryEggNow}><DinoEgg mystery /><span><strong>Một Trứng Bí Ẩn vừa xuất hiện!</strong><small>Chạm để xem ai chui ra</small></span></button>}{dinoNotice?.reveal && getDinoKindById(dinoNotice.speciesId) && <HatchReveal kind={getDinoKindById(dinoNotice.speciesId)!} soundOn={prefs.sound} caption={dinoNotice.title} />}<button type="button" className="sound-toggle" aria-pressed={prefs.sound} onClick={() => setPrefs((current) => ({ ...current, sound: !current.sound }))}>{prefs.sound ? <Volume2 /> : <VolumeX />} Âm thanh thưởng: {prefs.sound ? "đang bật" : "đang tắt"}</button><section className="dino-world-panel">{dinoTab === "to-am" ? <DinoNestPanel companion={companion} friends={nestFriends} bond={companion ? learning.dinoNest.bond[companion.kind.id] ?? 0 : 0} careDoneToday={careDoneToday} reaction={nestReaction.text} reactionKey={nestReaction.key} onChoose={chooseCompanion} onCare={careForDino} /> : <DinoGallery sections={gallerySections} selectedId={gallerySelected} onSelect={setGallerySelected} />}</section></div></main>;
  }
  if (view === "diagnostic-intro") return <main className="app-shell min-h-screen"><div className="page-wrap"><AppHeader current={navCurrent} back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} /><section className="assessment-intro"><div className="assessment-mark"><ClipboardCheck /></div><p className="eyebrow">Khám phá năng lực</p><h1>Tìm đúng vùng thử thách<br />khiến con muốn tiến thêm</h1><p className="lead">{DIAGNOSTIC_QUESTIONS.length} câu quan sát sáu kiểu tư duy, mỗi kiểu 5 câu từ dễ đến khó. Kết quả chỉ dùng để chọn độ khó ban đầu cho từng miền—không xếp hạng con, không chạy đua thời gian.</p><div className="assessment-facts"><div><Clock3 /><strong>20–25 phút</strong><span>Có thể nghỉ giữa chừng</span></div><div><Brain /><strong>6 kiểu tư duy</strong><span>Từ quy luật đến logic</span></div><div><Route /><strong>36 nhiệm vụ sâu</strong><span>Mỗi nhiệm vụ có chuyển giao</span></div></div><div className="assessment-rules"><h2>Ba điều giúp dữ liệu phản ánh đúng con</h2><ul><li>Để con tự nghĩ; người lớn chỉ giúp đọc đề nếu cần.</li><li>Không nhắc đáp án. Câu chưa làm được giúp chọn điểm bắt đầu.</li><li>Khuyến khích con nói “con đang thử cách này”.</li></ul></div><Button size="lg" onClick={beginDiagnostic} className="primary-action">Bắt đầu khám phá <ArrowRight /></Button></section></div></main>;

  if (view === "diagnostic") {
    const domain = DOMAINS.find((item) => item.id === currentDiagnostic.domain)!; const Icon = DOMAIN_ICONS[domain.id];
    return <main className="app-shell min-h-screen"><div className="page-wrap narrow"><AppHeader current={navCurrent} back={() => setView("diagnostic-intro")} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} /><section className="assessment-progress"><div><p className="eyebrow">Khám phá năng lực</p><strong>Thử thách {diagnosticIndex + 1} / {DIAGNOSTIC_QUESTIONS.length}</strong></div><span>{domain.name}</span></section><Progress value={((diagnosticIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100} className="diagnostic-progress" /><section className="diagnostic-card"><div className="question-meta"><span style={{ background: domain.soft, color: domain.color }}><Icon /></span><div><small>Ống kính tư duy</small><strong>{domain.name}</strong></div><em>Độ thử thách {currentDiagnostic.difficulty}/3</em></div><p className="skill-label">Năng lực: {currentDiagnostic.skill}</p><KaraokeReader key={`diag-${currentDiagnostic.id}`} text={currentDiagnostic.prompt} as="h1" />{currentDiagnostic.context && <DataChart question={currentDiagnostic} color={domain.color} />}{currentDiagnostic.visual?.kind === "sample-dots" && <SampleDotsVisual visual={currentDiagnostic.visual} />}{currentDiagnostic.visual?.kind === "height-order" && <HeightOrderVisual key={currentDiagnostic.id} visual={currentDiagnostic.visual} onArranged={(ready) => setDiagnosticArranged((current) => ({ ...current, [currentDiagnostic.id]: ready }))} />}{currentDiagnostic.visual?.kind !== "height-order" || diagnosticArranged[currentDiagnostic.id] ? renderAnswerInput(currentDiagnostic, diagnosticAnswers[diagnosticIndex], (value) => setDiagnosticAnswers((answers) => answers.map((answer, index) => index === diagnosticIndex ? value : answer)), false, diagnosticNext) : <p className="height-order-wait">Xếp xong ba bạn thì các lựa chọn trả lời sẽ hiện ra.</p>}<div className="assessment-navigation"><Button variant="outline" onClick={() => setDiagnosticIndex((index) => Math.max(0, index - 1))} disabled={diagnosticIndex === 0}><ArrowLeft /> Câu trước</Button><Button onClick={diagnosticNext} disabled={!diagnosticAnswers[diagnosticIndex]} className="primary-action small">{diagnosticIndex === DIAGNOSTIC_QUESTIONS.length - 1 ? "Nộp bài" : "Câu tiếp theo"} <ArrowRight /></Button></div></section><p className="diagnostic-note"><LockKeyhole /> Không có đồng hồ đếm ngược. Con được quyền suy nghĩ chậm và chắc.</p><StudyToolbar focusOn={prefs.focusMode} onToggleFocus={toggleFocusMode} resetKey={`diag-${currentDiagnostic.id}`} /></div></main>;
  }

  if (view === "diagnostic-result" && learning.diagnostic) {
    const result = learning.diagnostic;
    return <main className="app-shell min-h-screen"><div className="page-wrap"><AppHeader current={navCurrent} back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} /><section className="result-hero"><div className="score-ring" style={{ "--score": `${result.percent * 3.6}deg` } as React.CSSProperties}><div><strong>{result.percent}%</strong><span>{result.correct}/{result.total} câu</span></div></div><div><p className="eyebrow">Hồ sơ khám phá</p><h1>{result.placement}</h1><p>Điểm đầu vào quyết định nơi bắt đầu; mức tự lực, độ sâu gợi ý và câu chuyển giao sẽ tiếp tục điều chỉnh lộ trình.</p></div></section><section className="ability-map-panel"><div><p className="eyebrow">Bản đồ Năng lực 6 Chiều</p><h2>Con mạnh ở đâu, nên thử thêm ở đâu?</h2><ul className="ability-insights">{abilityInsights(result.scores, domainShort, (id) => nextForDomain(id).title).map((line) => <li key={line}>{line}</li>)}</ul></div><AbilityRadarCanvas title="Báo cáo Radar 6 miền tư duy sau bài khảo sát đầu vào" values={tallyValues(result.scores) as Record<DomainId, number>} /></section><section className="result-layout"><div className="result-panel"><div className="panel-heading"><div><p className="eyebrow">Bản đồ tư duy</p><h2>Sáu miền năng lực</h2></div><span>{Math.round(result.total / DOMAINS.length)} câu / miền</span></div><div className="domain-results">{DOMAINS.map((domain) => { const score = result.scores[domain.id]; const Icon = DOMAIN_ICONS[domain.id]; return <div className="domain-result" key={domain.id}><span className="domain-result-icon" style={{ background: domain.soft, color: domain.color }}><Icon /></span><div><strong>{domain.name}</strong><Progress value={score.percent} className={`score-progress ${score.status}`} /></div><em>{score.correct}/{score.total}</em><small>{score.status === "strong" ? "Sẵn sàng bứt phá" : score.status === "developing" ? "Đúng vùng thử thách" : "Cần gợi mở từng bước"}</small></div>; })}</div></div><aside className="roadmap-panel"><p className="eyebrow">Đề xuất đầu tiên</p><h2>{recommendedMission.title}</h2><p>Bắt đầu gần vùng 67% để con có chiến thắng sớm nhưng vẫn phải suy nghĩ. Mỗi miền có 6 nhiệm vụ.</p><ol>{adaptivePlan.map((mission, index) => <li key={mission.id}><span>{index + 1}</span><div><strong>{mission.title}</strong><small>{DOMAINS.find((d) => d.id === mission.domain)?.short} · chặng {mission.sequence}/6</small></div>{index === 0 && <em>Khởi hành</em>}</li>)}</ol><Button onClick={() => startMission(recommendedMission)} className="primary-action w-full">Nhận nhiệm vụ <ArrowRight /></Button></aside></section></div></main>;
  }

  if (view === "year-plan") {
    return <main className="app-shell min-h-screen"><div className="page-wrap"><AppHeader current={navCurrent} back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} totalSessions={totalSessions} />
      <section className="year-hero"><div><p className="eyebrow">Lộ trình nâng cao trọn 9 tháng</p><h1>36 tuần để lớn lên như một nhà toán học nhỏ</h1><p>Mỗi tuần gồm bốn nhiệm vụ biến thể và một bài toán mở. Tiến theo mức hoàn thành, không ép con chạy theo ngày.</p></div><div className="year-progress-ring"><strong>{completedWeeks}</strong><span>/36 tuần</span></div></section>
      <section className="active-week-card"><div><span>Tuần đang học · {activeWeek.week}</span><h2>{activeWeek.title}</h2><p>{activeWeek.bigQuestion}</p><div className="week-dots">{WEEKLY_RHYTHM.map((item, index) => <i key={item.session} className={index < activeWeekProgress.total ? "done" : index === activeWeekProgress.total ? "current" : ""}>{index + 1}</i>)}</div><small>{activeWeekProgress.total}/5 buổi hoàn thành · {activeWeek.parentLookFor}</small></div><Button onClick={startYearRecommendation} className="primary-action small">{activeWeekNeedsOpenTask ? plannedEnrichmentTask ? "Làm bài toán mở" : "Nhờ người lớn duyệt tháng này" : `Bắt đầu buổi ${activeWeekProgress.guided + 1}`} <ArrowRight /></Button></section>
      <section className="weekly-rhythm"><div className="panel-heading"><div><p className="eyebrow">Nhịp học mỗi tuần</p><h2>Năm buổi, năm kiểu hoạt động</h2></div><span>15–20 phút/buổi</span></div><div>{WEEKLY_RHYTHM.map((item) => <article key={item.session}><span>{item.session}</span><strong>{item.label}</strong><p>{item.description}</p></article>)}</div></section>
      <section className="months-roadmap"><div className="panel-heading"><div><p className="eyebrow">Toàn cảnh chương trình</p><h2>9 tháng · {PROGRAM_SESSIONS} buổi có cấu trúc</h2></div><Button variant="outline" onClick={() => { setView("content-review"); scrollTop(); }}><ListChecks /> Kho phụ huynh kiểm duyệt</Button></div>{MONTH_THEMES.map((theme, monthIndex) => <details key={theme} open={activeWeek.month === monthIndex + 1}><summary><span>Tháng {monthIndex + 1}</span><strong>{theme}</strong><small>{yearProgress.filter((item) => item.week.month === monthIndex + 1 && item.progress.complete).length}/4 tuần</small></summary><div className="month-weeks">{yearProgress.filter((item) => item.week.month === monthIndex + 1).map(({ week, progress }) => { const domain = DOMAINS.find((item) => item.id === week.domain)!; const mission = ALL_DEEP_MISSIONS.find((item) => item.id === week.missionId)!; return <article key={week.week} className={week.week === activeWeek.week ? "active" : progress.complete ? "complete" : ""}><span style={{ background: domain.soft, color: domain.color }}>Tuần {week.week}</span><h3>{week.title}</h3><p>{week.bigQuestion}</p><small>{domain.short} · {progress.total}/5 buổi</small><Button variant="outline" disabled={!missionIsUnlocked(mission)} onClick={() => progress.guided < 4 ? startMission(mission) : week.week === activeWeek.week ? startYearRecommendation() : undefined}>{progress.complete ? "Đã hoàn thành" : progress.guided < 4 ? "Mở bài tuần" : "Bài toán mở"}</Button></article>; })}</div></details>)}</section>
    </div></main>;
  }

  if (view === "content-review") {
    return <main className="app-shell min-h-screen"><div className="page-wrap"><AppHeader current={navCurrent} back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} />
      <section className="review-hero"><ShieldCheck /><div><p className="eyebrow">Phòng kiểm duyệt của phụ huynh</p><h1>36 bài toán mở, chia thành 9 gói tháng</h1><p>Mỗi bài có đề, vật liệu, ba tầng gợi ý, hướng dẫn đáp án và nguồn phương pháp. Nội dung chỉ mở cho bé sau khi phụ huynh duyệt từng tháng.</p></div></section>
      <div className="review-toolbar"><div><strong>{curatedPacks.filter((pack) => pack.month).length}/9 tháng đã duyệt</strong><span>Gói đã duyệt được lưu trên iPad để học ngoại tuyến.</span></div><Button onClick={checkCuratedContent} disabled={packState === "checking"} className="primary-action small"><Globe2 /> {packState === "checking" ? "Đang tải kho…" : reviewPacks.length ? "Kiểm tra bản mới" : "Tải kho 9 tháng để xem"}</Button></div>
      {linkedOpenTaskWeek && <p className="review-state"><CalendarDays /> Để mở bài toán tuần {linkedOpenTaskWeek}, phụ huynh hãy tải kho và duyệt gói tháng {Math.ceil(linkedOpenTaskWeek / 4)}.</p>}
      {packState === "offline" && <p className="review-state">Không có mạng; các tháng đã duyệt vẫn sử dụng được.</p>}{packState === "error" && <p className="review-state warning">Chưa tải được kho. Nội dung đang dùng được giữ nguyên.</p>}
      <section className="review-pack-grid">{reviewPacks.map((pack) => { const approved = curatedPacks.some((item) => item.id === pack.id && item.version === pack.version); return <article className={`review-pack ${approved ? "approved" : ""}`} key={pack.id}><header><div><span>Tháng {pack.month}</span><h2>{pack.title.replace(/^Tháng \d+ · /, "")}</h2><p>Tuần {pack.weekRange?.[0]}–{pack.weekRange?.[1]} · {pack.tasks.length} bài toán mở</p></div>{approved ? <em><CheckCircle2 /> Đã duyệt</em> : <em>Chờ phụ huynh</em>}</header><p>{pack.description}</p><div className="review-task-list">{pack.tasks.map((task) => <details key={task.id}><summary><span>Tuần {task.week}</span><strong>{task.title}</strong></summary><div><h3>Đề cho bé</h3><p>{task.prompt}</p><p><b>Vật liệu:</b> {task.materials}</p><h3>Ba tầng gợi ý</h3><ol>{task.hints.map((hint) => <li key={hint}>{hint}</li>)}</ol><h3>Hướng dẫn kiểm tra</h3><p>{task.answerGuide}</p><h3>Mở rộng</h3><p>{task.extension}</p><a href={task.source.url} target="_blank" rel="noreferrer">Nguồn phương pháp: {task.source.title}</a></div></details>)}</div><Button onClick={() => approveCuratedPack(pack)} disabled={approved} className="primary-action w-full">{approved ? "Tháng này đã được cài" : "Tôi đã xem · Duyệt và cài tháng này"}</Button></article>; })}</section>
      {!reviewPacks.length && <section className="review-empty"><CalendarDays /><h2>Kho 9 tháng đã sẵn sàng để tải</h2><p>Nhấn nút phía trên khi có Internet. Hệ thống sẽ kiểm tra đủ 9 gói và 36 bài trước khi hiển thị cho anh duyệt.</p></section>}
    </div></main>;
  }

  if (view === "enrichment" && enrichmentTask) {
    const domain = DOMAINS.find((item) => item.id === enrichmentTask.domain)!;
    const Icon = DOMAIN_ICONS[enrichmentTask.domain];
    return <main className="app-shell min-h-screen"><div className="page-wrap narrow"><AppHeader current={navCurrent} back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} totalSessions={totalSessions} /><section className="enrichment-hero"><span style={{ background: domain.soft, color: domain.color }}><Icon /></span><div><p className="eyebrow">Tuần {enrichmentTask.week ?? activeWeek.week} · Phòng bài toán mở · {domain.short}</p><h1>{enrichmentTask.title}</h1><p>Không chỉ có một con đường đúng</p><div className="task-tags"><span><Clock3 /> {enrichmentTask.minutes} phút</span><span><UserRound /> Cần người lớn cùng làm</span></div></div></section><section className="deep-card enrichment-card"><div className="source-chip"><Globe2 /><span>Nội dung Internet đã biên soạn và kiểm duyệt · không mở liên kết cho trẻ</span></div>{enrichmentTask.materials && <p className="task-materials"><Tablet /> <strong>Chuẩn bị:</strong> {enrichmentTask.materials}</p>}<KaraokeReader key={`open-${enrichmentTask.id}`} text={enrichmentTask.prompt} /><div className="launch-grid">{enrichmentTask.launchQuestions.map((question, index) => <div key={question}><span>{index + 1}</span><p>{question}</p></div>)}</div><div className="enrichment-actions"><Button variant="outline" onClick={() => setEnrichmentHintDepth((depth) => Math.min(3, depth + 1))} disabled={enrichmentHintDepth === 3}><Lightbulb /> {enrichmentHintDepth === 0 ? "Mở gợi ý tầng 1" : enrichmentHintDepth === 3 ? "Đã mở đủ gợi ý" : `Mở gợi ý tầng ${enrichmentHintDepth + 1}`}</Button></div>{enrichmentHintDepth > 0 && <div className="hint-stack">{enrichmentTask.hints.slice(0, enrichmentHintDepth).map((hint, index) => <div className="hint-box" key={hint}><Lightbulb /><div><strong>Gợi ý tầng {index + 1}</strong><p>{hint}</p></div></div>)}</div>}{enrichmentTask.extension && <div className="family-prompt"><Sparkles /><div><strong>Nếu con muốn đi xa hơn</strong><p>{enrichmentTask.extension}</p></div></div>}<div className="family-prompt"><UserRound /><div><strong>Cùng người lớn đào sâu</strong><p>{enrichmentTask.familyPrompt}</p></div></div><ParentPortal report={buildWeeklyReport(enrichmentTask.domain, enrichmentTask.title)} /><details className="parent-prompts"><summary><ShieldCheck /> Thẻ gợi mở cho phụ huynh <small>không cần biết đáp án</small></summary><div><strong>Bố/mẹ có thể hỏi con</strong><ol>{parentPromptsFor(enrichmentTask.domain, enrichmentTask.title).ask.map((line) => <li key={line}>{line}</li>)}</ol><strong>Bố/mẹ không nên</strong><ul>{parentPromptsFor(enrichmentTask.domain, enrichmentTask.title).avoid.map((line) => <li key={line}>{line}</li>)}</ul></div></details><label className="enrichment-reflection"><span>Con đã thử cách nào? Con phát hiện điều gì?</span><Textarea value={enrichmentReflection} onChange={(event) => setEnrichmentReflection(event.target.value)} placeholder="Con đã thử… và con nhận ra…" /></label><div className="stage-actions"><Button variant="outline" onClick={goDashboard}>Để lần sau</Button><Button onClick={completeEnrichment} disabled={enrichmentReflection.trim().length < 5} className="primary-action small">Ghi nhận khám phá{learning.enrichmentCompleted.includes(enrichmentTask.id) ? "" : " · +80 tia sáng"} <Medal /></Button></div><details className="source-detail"><summary>Dành cho phụ huynh: đáp án, lưu ý và nguồn</summary>{enrichmentTask.answerGuide && <p><strong>Hướng dẫn kiểm tra:</strong> {enrichmentTask.answerGuide}</p>}{enrichmentTask.reviewNotes && <p><strong>Cách đồng hành:</strong> {enrichmentTask.reviewNotes}</p>}<p>{enrichmentTask.source.adaptationNote}</p><a href={enrichmentTask.source.url} target="_blank" rel="noreferrer">{enrichmentTask.source.title}</a></details></section></div></main>;
  }

  if (view === "mission") {
    const domain = DOMAINS.find((item) => item.id === currentMission.domain)!; const Icon = DOMAIN_ICONS[currentMission.domain]; const record = learning.missionRecords[currentMission.id];
    const missionSpecies = resolveDinoForMission(currentMission);
    const missionEgg = missionSpecies ? learning.dinoCollection[missionSpecies.id] : undefined;
    if (stage === "result") {
      const latestSession = record?.sessions.at(-1);
      const sessionAutonomy = latestSession?.autonomy ?? record?.autonomy ?? 0;
      const masteryNow = learning.mastery[currentMission.domain];
      const firstTryCorrect = correctOnFirstAttempt(latestSession?.firstScore ?? record?.bestFirstScore ?? 0, currentMission.deepPractice.length);
      const outcomeSpecies = dinoOutcome ? getSpeciesById(dinoOutcome.speciesId) : undefined;
      const authenticTask = AUTHENTIC_TASKS[currentMission.id];
      const braveCount = latestSession?.braveCount ?? 0;
      const braveTotal = currentMission.deepPractice.length + 1;
      return <main className="app-shell min-h-screen"><div className="page-wrap narrow"><AppHeader current={navCurrent} back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} /><section className="lesson-result"><div className="mastery-badge passed"><Medal /></div><p className="eyebrow">Buổi học hoàn thành · +{sessionSparks} tia sáng</p><h1>{sessionAutonomy >= 85 ? "Nhà nghiên cứu tự lực" : sessionAutonomy >= 65 ? "Nhà chiến lược bền bỉ" : "Nhà thám hiểm dám sửa"}</h1><p>Hệ thống ghi nhận không chỉ đáp án: đúng lần đầu, độ sâu gợi ý, số lần thử lại và khả năng dùng ý tưởng trong câu mới.</p><p className="mastery-next">Mức thành thạo miền {domain.short}: <strong>{masteryNow}%</strong> · buổi sau con làm mức <strong>{bandForMastery(masteryNow) === "support" ? "Gỡ nút" : bandForMastery(masteryNow) === "stretch" ? "Bứt phá" : "Vừa sức"}</strong>.</p><div className="result-strength"><Sparkles /><div><span>Điểm mạnh nổi bật</span><strong>{missionStrength(latestSession)}</strong></div></div><div className="mastery-meter"><Progress value={sessionAutonomy} /><span style={{ left: `${Math.max(8, sessionAutonomy)}%` }}>{sessionAutonomy}% tự lực buổi này</span></div><div className="evidence-grid"><div><strong>{firstTryCorrect}/{currentMission.deepPractice.length}</strong><span>câu đúng ngay lần đầu</span></div><div><strong>{latestSession?.firstScore ?? record?.bestFirstScore ?? 0}%</strong><span>điểm lần đầu buổi này</span></div><div><strong>{record?.maxHintDepth ?? 0}/3</strong><span>gợi ý sâu nhất</span></div><div><strong>{latestSession?.transferFirstTry ? "Đạt" : "Cần ôn"}</strong><span>chuyển giao lần đầu</span></div></div>{record?.focusNeeds.length ? <div className="adaptive-note"><Brain /><div><strong>Động cơ thích ứng đã ghi nhận</strong><p>Gặp lại sau: {record.focusNeeds.join(" · ")}. Lịch ôn: {new Date(record.reviewAt).toLocaleDateString("vi-VN")}.</p></div></div> : <div className="adaptive-note"><CheckCircle2 /><div><strong>Ý tưởng đã đứng vững</strong><p>Con giải độc lập và chuyển được sang tình huống mới.</p></div></div>}<div className="result-advice"><Lightbulb /><div><strong>Phát hiện con đã ghi</strong><p>{record?.reflection}</p>{record?.prediction && currentMission.prediction.answer && <p className="prediction-check">{record.prediction === currentMission.prediction.answer ? `Dự đoán ban đầu của con đã được bằng chứng xác nhận: “${record.prediction}”.` : `Lúc đầu con đoán: “${record.prediction}”. Bằng chứng cho thấy: “${currentMission.prediction.answer}”. Đổi ý khi có bằng chứng là cách làm của nhà toán học.`}</p>}<VoiceReflection noteKey={voiceNoteKey(currentMission.id)} readOnly /></div></div>{dinoOutcome && outcomeSpecies && <div className={`dino-hatch-note ${dinoOutcome.justHatched || dinoOutcome.evolvedTo ? "celebrate" : ""}`}><span>{dinoOutcome.progress.stage === "trung" ? <DinoEgg cracks={dinoOutcome.progress.shards} /> : <DinoFigure kind={outcomeSpecies} stage={dinoOutcome.progress.stage} animated />}</span><div><strong>{dinoOutcome.justHatched ? `Trứng đã nở: ${outcomeSpecies.name}!` : dinoOutcome.evolvedTo ? `${outcomeSpecies.name} đã lớn thành ${DINO_STAGE_LABELS[dinoOutcome.evolvedTo].toLocaleLowerCase("vi")}!` : dinoOutcome.progress.stage === "trung" ? `+${dinoOutcome.shardsEarned} mảnh trứng · ${dinoOutcome.progress.shards}/${SHARDS_TO_HATCH}` : `${outcomeSpecies.name} vui vì con quay lại`}</strong><p>{dinoOutcome.justHatched ? `${outcomeSpecies.genus} · độ hiếm ${EGG_RARITY_LABELS[dinoOutcome.progress.rarity ?? "thuong"]}. ${outcomeSpecies.funFact}` : dinoOutcome.progress.stage === "trung" ? `Trứng ở ${DINO_REGIONS[outcomeSpecies.domain].name} đang ấm dần. Làm phiên bản mới của nhiệm vụ này để trứng nở.` : dinoOutcome.progress.stage === "thieu-nien" ? `Hoàn thành một phiên bản mức Bứt phá để ${outcomeSpecies.name} trưởng thành.` : `${outcomeSpecies.name} đã trưởng thành ở ${DINO_REGIONS[outcomeSpecies.domain].name}.`}</p></div></div>}{dinoOutcome?.justHatched && outcomeSpecies && <HatchReveal kind={outcomeSpecies} soundOn={prefs.sound} caption={`${outcomeSpecies.name} vừa chui ra khỏi trứng!`} />}<div className={`brave-summary ${braveCount === braveTotal ? "all" : ""}`}><DinoEgg hue={braveCount === braveTotal ? 45 : 200} /><div><strong>Trứng Dũng cảm: {braveCount}/{braveTotal} câu tự làm không cần gợi ý</strong><p>{braveCount === braveTotal ? "Trọn vẹn! Con có thêm cơ hội gặp một loài khủng long hiếm." : "Câu nào con thử trước khi mở gợi ý đều làm trứng ấm hơn. Lần sau thử thêm một câu nhé."}</p></div></div>{rewardNotes.map((note) => <div key={note} className="dino-hatch-note celebrate"><span><Sparkles /></span><div><p>{note}</p></div></div>)}{authenticTask && <section className={`authentic-task ${record?.completedCount === 4 ? "highlight" : ""}`}><div className="authentic-task-heading"><span><House /></span><div><p className="eyebrow">{record?.completedCount === 4 ? "Buổi 4 tuần này · Chuyển giao đời sống" : "Nhiệm vụ đời thực · làm cùng người lớn"}</p><h2>{authenticTask.title}</h2></div></div><ol>{authenticTask.steps.map((step) => <li key={step}>{step}</li>)}</ol><p className="authentic-task-share"><strong>Cùng kể lại:</strong> {authenticTask.share}</p><div className="authentic-task-actions"><Button variant="outline" onClick={() => window.print()}><Download /> In nhiệm vụ</Button>{learning.authenticDone.includes(currentMission.id) ? <span className="pack-success"><CheckCircle2 /> Đã làm cùng người lớn</span> : <Button variant="outline" onClick={() => markAuthenticDone(currentMission.id)}><CheckCircle2 /> Đã làm xong cùng người lớn</Button>}</div></section>}<div className="result-actions"><Button variant="outline" onClick={() => startMission(currentMission)}><RefreshCw /> Thử phiên bản khác</Button><Button onClick={startYearRecommendation} className="primary-action small">Buổi tiếp theo trong tuần <ArrowRight /></Button></div></section></div></main>;
    }
    return <main className="app-shell min-h-screen"><div className="page-wrap mission-wrap"><AppHeader current={navCurrent} back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} /><section className="lesson-heading"><span className="lesson-icon" style={{ background: domain.soft, color: domain.color }}><Icon /></span><div><p className="eyebrow">{domain.name} · chặng {currentMission.sequence}/6</p><h1>{currentMission.title}</h1><p>{currentMission.goal}</p></div></section><nav className="deep-steps">{STAGES.map((item) => { const currentIndex = STAGES.findIndex((step) => step.id === stage); const itemIndex = STAGES.findIndex((step) => step.id === item.id); return <span key={item.id} className={item.id === stage ? "active" : itemIndex < currentIndex ? "done" : ""}><strong>{itemIndex < currentIndex ? <Check /> : item.short}</strong>{item.label}</span>; })}</nav>
      <section className="mission-edition-banner"><div><RefreshCw /><span><strong>{currentEdition.label}</strong><small>Bài luyện thay đổi sau mỗi lần hoàn thành</small></span></div><div><Brain /><span><strong>Ống kính: {currentEdition.thinkingLens}</strong><small>Mức thích ứng: {currentEdition.difficultyLabel}</small></span></div><em>{VARIANTS_PER_MISSION * ALL_DEEP_MISSIONS.length} phiên bản trong toàn chương trình</em></section>
      {missionSpecies && DINO_MISSION_STORIES[currentMission.id] && <section className="dino-story-banner"><span>{missionEgg && missionEgg.stage !== "trung" ? <DinoFigure kind={missionSpecies} stage={missionEgg.stage} animated /> : <DinoEgg cracks={missionEgg?.shards ?? 0} />}</span><div><small>{DINO_REGIONS[missionSpecies.domain].name} · {missionEgg && missionEgg.stage !== "trung" ? missionSpecies.name : `trứng ${missionEgg?.shards ?? 0}/${SHARDS_TO_HATCH} mảnh`}</small><p>{currentMission.hook}</p></div></section>}
      <section className="mission-guide" aria-label="Chuẩn bị cho nhiệm vụ"><div><Clock3 /><span><strong>{currentMission.durationMinutes} phút</strong><small>Một buổi vừa đủ</small></span></div><div><Tablet /><span><strong>Con cần</strong><small>{currentMission.materials.join(" · ")}</small></span></div><div><Target /><span><strong>Đích khám phá</strong><small>{currentMission.realWorldConnection}</small></span></div></section>
      {stage === "predict" && <section className="deep-card predict-card"><p className="eyebrow">Thử trước khi được dạy</p><KaraokeReader key={`predict-${currentMission.id}`} text={currentMission.prediction.prompt} /><p className="stage-lead">Hãy chọn ý con đang nghĩ. Dự đoán sai vẫn có giá trị vì nó cho ta thứ để kiểm tra.</p><RadioGroup value={predictionChoice} onValueChange={(value) => { setPredictionChoice(value); setPredictionRevealed(false); }} className="prediction-options">{currentMission.prediction.options.map((option) => <label key={option}><RadioGroupItem value={option} /><span>{option}</span></label>)}</RadioGroup>{predictionRevealed && <div className="evidence-reveal"><Lightbulb /><div><strong>Giữ lại dự đoán này</strong><p>{currentMission.prediction.reveal}</p><small>Dự đoán con đã ghim: {predictionChoice}</small></div></div>}<div className="stage-actions"><Button variant="outline" onClick={() => setPredictionRevealed(true)} disabled={!predictionChoice}>Ghim dự đoán</Button><Button onClick={() => goStage("explore")} disabled={!predictionRevealed} className="primary-action small">Vào phòng thử nghiệm <ArrowRight /></Button></div></section>}
      {stage === "explore" && <section className="deep-card"><p className="eyebrow">Bài tương tác</p><KaraokeReader key={`lab-${currentMission.id}`} text={currentMission.lab.prompt} /><p className="stage-lead">Chạm vào một phương án, quan sát dữ kiện rồi kiểm tra.</p><div className={`lab-options ${currentMission.lab.type === "tile-rectangles" ? "tile-lab" : ""}`}>{currentMission.lab.options.map((option) => <button type="button" key={option.value} className={labChoice === option.value ? "selected" : ""} onClick={() => { setLabChoice(option.value); setLabChecked(false); }}>{currentMission.lab.type === "tile-rectangles" && <TileRectangle value={option.value} />}<strong>{option.label}</strong><span>{option.note}</span></button>)}</div>{labChecked && <div className={`feedback ${labChoice === currentMission.lab.answer ? "correct" : "incorrect"}`}><span>{labChoice === currentMission.lab.answer ? <Check /> : <RefreshCw />}</span><div><strong>{labChoice === currentMission.lab.answer ? "Bằng chứng khớp" : "Một thử nghiệm hữu ích"}</strong><p>{labChoice === currentMission.lab.answer ? currentMission.lab.explanation : "Đọc lại dữ kiện và thử một phương án khác. Chưa cần xem lời giải."}</p></div></div>}<div className="stage-actions"><Button variant="outline" onClick={() => setLabChecked(true)} disabled={!labChoice}>Kiểm tra bằng chứng</Button><Button onClick={() => goStage("strategies")} disabled={!labChecked || labChoice !== currentMission.lab.answer} className="primary-action small">So sánh nhiều cách <ArrowRight /></Button></div></section>}
      {stage === "strategies" && <section><div className="strategies-heading"><div><p className="eyebrow">Một bài toán · nhiều con đường</p><h2>Không có một cách tốt nhất cho mọi bài</h2></div><p>Đọc hai chiến lược và chọn cách hợp với dữ kiện hơn.</p></div><div className="strategy-grid">{currentMission.strategies.map((strategy, index) => <article key={strategy.name} className={index === 0 ? "strategy-a" : "strategy-b"}><span>Cách {index + 1}</span><h3>{strategy.name}</h3><p>{strategy.when}</p>{index === 0 && <p className="strategy-model"><strong>Bài mẫu:</strong> {currentMission.model.prompt}</p>}<ol>{strategy.steps.map((step, stepIndex) => <li key={step}><strong>{stepIndex + 1}</strong>{step}</li>)}</ol>{index === 0 && <p className="strategy-model answer">{currentMission.model.answer}</p>}</article>)}</div><div className="strategy-bridge"><Brain /><div><strong>Câu hỏi chọn chiến lược</strong><p>Với bài sắp tới, con sẽ bắt đầu bằng cách nào? Vì sao?</p></div><Button onClick={() => goStage("practice")} className="primary-action small">Tự mình thử <ArrowRight /></Button></div></section>}
      {stage === "practice" && <section className="deep-card practice-deep"><div className="practice-header"><div><p className="eyebrow">Luyện sâu · không lộ đáp án khi sai</p><h1>{currentMission.title}</h1></div><span>Bài {practiceIndex + 1}/{currentMission.deepPractice.length}</span></div><Progress value={((practiceIndex + (currentPracticeCorrect ? 1 : 0)) / currentMission.deepPractice.length) * 100} className="diagnostic-progress" /><div className="practice-topline"><div className="practice-number">{practiceIndex + 1}</div>{currentPractice.challengeTag && <span className="challenge-tag">{currentPractice.challengeTag}</span>}<span className="hint-depth-label">Gợi ý {hintDepths[practiceIndex]}/3</span></div>{renderBraveEgg(firstAttempts[practiceIndex], hintDepths[practiceIndex], currentPracticeCorrect)}<KaraokeReader key={`practice-${currentMission.id}-${practiceIndex}`} text={currentPractice.prompt} />{currentPractice.scaffold && <div className="open-scaffold"><Lightbulb /><p><strong>Sơ đồ mở sẵn</strong>{currentPractice.scaffold}</p></div>}{renderAnswerInput(currentPractice, practiceAnswer, setPracticeAnswer, practiceChecked, checkPractice)}{scaffoldNotice && !currentPracticeCorrect && <p className="scaffold-note"><Sparkles /> Con đã thử 2 lần—mình mở sẵn gợi ý Trực quan để con nhìn rõ cấu trúc bài nhé.</p>}{!currentPracticeCorrect && <HintStack hints={currentPractice.hints} depth={hintDepths[practiceIndex]} />}{practiceChecked && <div className={`feedback ${currentPracticeCorrect ? "correct" : "incorrect"}`}><span>{currentPracticeCorrect ? <Check /> : <RefreshCw />}</span><div><strong>{currentPracticeCorrect ? "Ý tưởng đứng vững" : "Chưa khớp—đừng bỏ cuộc"}</strong><p>{currentPracticeCorrect ? currentPractice.explanation : wrongAnswerFeedback(currentPractice, practiceAnswer)}</p>{currentPracticeCorrect && lastSpark && <p className="spark-earned">{lastSpark.label}</p>}</div></div>}<div className="practice-actions">{!currentPracticeCorrect && <HintLadderButton key={`hint-${currentMission.id}-${practiceIndex}`} depth={hintDepths[practiceIndex]} onOpen={() => setHintDepths((depths) => depths.map((depth, index) => index === practiceIndex ? Math.min(3, depth + 1) : depth))} />}{practiceChecked && !currentPracticeCorrect ? <Button onClick={() => { setPracticeAnswer(""); setPracticeChecked(false); }}>Sửa cách làm</Button> : currentPracticeCorrect ? <Button onClick={nextPractice} className="primary-action small">{practiceIndex === currentMission.deepPractice.length - 1 ? "Câu chuyển giao" : "Bài tiếp theo"} <ArrowRight /></Button> : <Button onClick={checkPractice} disabled={!practiceAnswer}>Kiểm tra</Button>}</div></section>}
      {stage === "transfer" && <section className="deep-card transfer-card"><p className="eyebrow">Câu chuyển giao · tình huống mới</p>{renderBraveEgg(transferFirst, transferHintDepth, transferCorrect)}<KaraokeReader key={`transfer-${currentMission.id}`} text={currentMission.transfer.prompt} />{currentMission.transfer.scaffold && <div className="open-scaffold"><Lightbulb /><p><strong>Sơ đồ mở sẵn</strong>{currentMission.transfer.scaffold}</p></div>}<p className="stage-lead">Hãy mang ý tưởng cốt lõi sang bài mới.</p>{renderAnswerInput(currentMission.transfer, transferAnswer, setTransferAnswer, transferChecked, checkTransfer)}{scaffoldNotice && !transferCorrect && <p className="scaffold-note"><Sparkles /> Con đã thử 2 lần—mình mở sẵn gợi ý Trực quan để con nhìn rõ cấu trúc bài nhé.</p>}{!transferCorrect && <HintStack hints={currentMission.transfer.hints} depth={transferHintDepth} />}{transferChecked && <div className={`feedback ${transferCorrect ? "correct" : "incorrect"}`}><span>{transferCorrect ? <Check /> : <RefreshCw />}</span><div><strong>{transferCorrect ? "Con đã chuyển được ý tưởng" : "Bài mới đang lộ một khoảng trống"}</strong><p>{transferCorrect ? currentMission.transfer.explanation : wrongAnswerFeedback(currentMission.transfer, transferAnswer)}</p>{transferCorrect && lastSpark && <p className="spark-earned">{lastSpark.label}</p>}</div></div>}<div className="practice-actions">{!transferCorrect && <HintLadderButton key={`hint-transfer-${currentMission.id}`} depth={transferHintDepth} onOpen={() => setTransferHintDepth((depth) => Math.min(3, depth + 1))} />}{transferChecked && !transferCorrect ? <Button onClick={() => { setTransferAnswer(""); setTransferChecked(false); }}>Thử lại</Button> : transferCorrect ? <Button onClick={() => goStage("reflect")} className="primary-action small">Nói ra điều con hiểu <ArrowRight /></Button> : <Button onClick={checkTransfer} disabled={!transferAnswer}>Kiểm tra chuyển giao</Button>}</div></section>}
      {stage === "reflect" && <section className="deep-card reflect-card"><p className="eyebrow">Phản tư · biến cách làm thành hiểu biết</p><h2>{currentMission.reflectionStems[reflectionPrompt]}</h2><p className="stage-lead">Con có thể nói để người lớn ghi lại. Một câu thật có giá trị hơn một đoạn văn “đẹp”.</p><div className="success-checklist"><strong>Ba dấu hiệu con đã thật sự hiểu</strong><ul>{currentMission.successCriteria.map((criterion) => <li key={criterion}><CheckCircle2 />{criterion}</li>)}</ul></div><div className="reflection-prompts">{currentMission.reflectionStems.map((prompt, index) => <button type="button" key={prompt} className={reflectionPrompt === index ? "active" : ""} onClick={() => setReflectionPrompt(index)}>Câu hỏi {index + 1}</button>)}</div><div className="reflection-starters" role="group" aria-label="Chọn câu đúng với con"><span>Chạm câu đúng với con:</span>{REFLECTION_STARTERS.map((starter) => <button type="button" key={starter} className={reflectionDraft.includes(starter) ? "active" : ""} onClick={() => setReflectionDraft((draft) => draft.includes(starter) ? draft.replace(starter, "").replace(/\s+/g, " ").trim() : `${draft.trim()} ${starter}`.trim())}>{starter}</button>)}</div><Textarea value={reflectionDraft} onChange={(event) => setReflectionDraft(event.target.value)} placeholder="Con nghĩ… / Lúc đầu con… / Cách khác là…" /><VoiceReflection key={`voice-${currentMission.id}`} noteKey={voiceNoteKey(currentMission.id)} onChange={setHasVoiceNote} /><div className="reflection-quality"><ShieldCheck /><p>Không chấm chính tả. Lời phản tư giúp phụ huynh thấy sự thay đổi trong cách nghĩ.</p></div>{secondWayTarget ? <SecondWay prompt={secondWayTarget.prompt} answer={Number(secondWayTarget.answer)} value={secondWayDraft} onChange={(value) => { setSecondWayDraft(value); setSecondWayCheck(null); setUsedTwoStrategies(false); }} check={secondWayCheck} onCheck={(check) => { setSecondWayCheck(check); setUsedTwoStrategies(check.ok); }} /> : <div className={`second-way ${spokenSecondWay ? "done" : ""}`}><strong>Giải hai cách · thêm 1 mảnh trứng khủng long</strong><p>Buổi này không có câu tính số. Con hãy kể một cách nghĩ khác trong lời phản tư: ghi âm, hoặc viết ít nhất {SPOKEN_SECOND_WAY_MIN} chữ cái.</p>{spokenSecondWay && <p className="second-way-message ok">Đã ghi nhận cách thứ hai của con.</p>}</div>}<div className="stage-actions"><Button onClick={completeMission} disabled={reflectionDraft.trim().length < 5 && !hasVoiceNote} className="primary-action small">Hoàn thành nhiệm vụ <Medal /></Button></div></section>}
      <StudyToolbar focusOn={prefs.focusMode} onToggleFocus={toggleFocusMode} resetKey={`${currentMission.id}-${stage}-${practiceIndex}`} />
    </div></main>;
  }

  return <main className="app-shell min-h-screen"><div className="page-wrap"><AppHeader current={navCurrent} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} />{storageNoticeOpen && <section className="storage-notice" role="note"><ShieldCheck /><div><strong>Tiến trình của con đang lưu trên trình duyệt này</strong><p>Nếu xoá dữ liệu Safari, đổi máy hoặc dùng chế độ riêng tư, tia sáng và khủng long có thể mất. Thỉnh thoảng hãy mở Góc đồng hành, bấm “Xuất mã tiến trình” và cất mã vào Ghi chú.</p></div><div className="storage-notice-actions"><Button variant="outline" onClick={() => { dismissStorageNotice(); document.getElementById("progress-code")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>Xuất mã ngay</Button><Button variant="ghost" onClick={dismissStorageNotice}>Đã hiểu</Button></div></section>}<section className="dashboard-hero"><div className="hero-copy"><p className="eyebrow">{learning.diagnostic ? `Xin chào ${learning.nickname}` : "Chương trình nâng cao 9 tháng · 15–20 phút/buổi"}</p><h1>{learning.diagnostic ? `Tuần ${activeWeek.week}: ${activeWeek.title}` : "Mỗi bài toán là một cuộc phiêu lưu"}</h1><p>{learning.diagnostic ? `${activeWeek.bigQuestion} Con đang ở buổi ${Math.min(5, activeWeekProgress.total + 1)}/5 của tuần này.` : "Không học lại bài trên lớp. Con dự đoán, thử, sửa và giải thích như một nhà toán học nhỏ."}</p><div className="hero-actions">{learning.diagnostic ? <><Button onClick={startYearRecommendation} className="primary-action">{activeWeekNeedsOpenTask ? plannedEnrichmentTask ? "Làm bài toán mở" : "Nhờ người lớn duyệt nội dung" : "Bắt đầu buổi hôm nay"} <ArrowRight /></Button><Button variant="outline" onClick={() => { setView("year-plan"); scrollTop(); }}><CalendarDays /> Xem lộ trình 9 tháng</Button></> : <Button onClick={() => setView("diagnostic-intro")} className="primary-action">Khám phá năng lực <ClipboardCheck /></Button>}</div></div><aside className="daily-puzzle"><div className="puzzle-heading"><span>🦝</span><div><p className="eyebrow">Câu đố 60 ngày</p><strong>Ba mươi giây để tò mò</strong></div></div><h2>{todayPuzzle.prompt}<small>{todayPuzzle.note}</small></h2><SpeakButton text={todayPuzzle.prompt} dark /><RadioGroup value={dailyChoice} onValueChange={(value) => { setDailyChoice(value); setDailyChecked(false); }} className="puzzle-options">{todayPuzzle.options.map((option) => <label key={option}><RadioGroupItem value={option} /><span>{option}</span></label>)}</RadioGroup>{dailyChecked && <div className={`puzzle-feedback ${dailyChoice === todayPuzzle.answer ? "success" : "try"}`}>{dailyChoice === todayPuzzle.answer ? todayPuzzle.explanation : todayPuzzle.hint}</div>}<Button variant="outline" onClick={() => setDailyChecked(true)} disabled={!dailyChoice}>Mở khóa câu đố</Button></aside></section>
    <section className="skill-lab-strip"><div className="skill-lab-strip-icon">🧠</div><div><p className="eyebrow">Phòng luyện xoắn ốc · Mảng nổi bật tuần {activeWeek.week}</p><h2>{weeklyFocusStrands.map((strand) => `${strand.emoji} ${strand.short}`).join(" · ")}</h2><p>10 câu ngắn: 4 câu đầu thuộc mảng nổi bật của tuần để con thấy mình tiến bộ rõ, phần còn lại trộn đủ tám mảng; câu chưa vững tự quay lại ở vòng sau.</p></div><div className="skill-lab-strip-stats"><span><strong>{skillLabMasteredCount}</strong> đã vững</span><span><strong>{skillLabReviewCount}</strong> cần ôn</span></div><Button onClick={openSkillLab} className="primary-action small">Mở phòng luyện <ArrowRight /></Button></section>
    {learning.diagnostic && <section className="today-section"><div className="panel-heading"><div><p className="eyebrow">Ba lựa chọn hôm nay</p><h2>Có lộ trình, vẫn giữ quyền lựa chọn</h2></div><span>Tuần {activeWeek.week}/36 · {activeWeekProgress.total}/5 buổi</span></div><div className="today-grid"><button type="button" className="today-card recommended" onClick={startYearRecommendation}><span className="today-badge"><CalendarDays /> Theo lộ trình 9 tháng</span><strong>{activeWeekNeedsOpenTask ? plannedEnrichmentTask?.title ?? "Chờ phụ huynh mở bài toán tuần" : recommendedMission.title}</strong><p>{activeWeekNeedsOpenTask ? "Buổi 5: điều tra một bài toán mở và bảo vệ cách làm." : `Buổi ${activeWeekProgress.guided + 1}/5 · phiên bản mới thích ứng theo mức tự lực.`}</p><em>Bắt đầu <ArrowRight /></em></button><button type="button" className="today-card choice" onClick={() => startMission(choiceMission)}><span className="today-badge"><Sparkles /> Con tự chọn</span><strong>{choiceMission.title}</strong><p>Một miền khác đang mở. Quyền lựa chọn giúp con sở hữu hành trình.</p><em>Khám phá <ArrowRight /></em></button>{dueMissions[0] ? <button type="button" className="today-card review" onClick={() => startMission(dueMissions[0])}><span className="today-badge"><RefreshCw /> Ôn đúng lúc</span><strong>{dueMissions[0].title}</strong><p>Ôn ngắn để kiểm tra ý tưởng còn đứng vững sau thời gian nghỉ.</p><em>Gọi lại ý tưởng <ArrowRight /></em></button> : <div className="today-card review"><span className="today-badge"><CheckCircle2 /> Chưa có bài đến hạn</span><strong>Khoảng nghỉ cũng là học</strong><p>Câu đố 60 ngày phía trên là đủ cho lựa chọn thứ ba hôm nay.</p><em>Không cần học thêm</em></div>}</div></section>}
    {learning.diagnostic && <section className="enrichment-strip"><div className="enrichment-copy"><span><Globe2 /></span><div><p className="eyebrow">Kho mở rộng có kiểm duyệt</p><h2>{enrichmentTask ? enrichmentTask.title : "Bài toán mới từ nguồn toán tư duy uy tín"}</h2><p>{enrichmentTask ? `⏱ ${enrichmentTask.minutes} phút · Cần người lớn cùng làm. Thử, tạo giả thuyết và bảo vệ cách làm.` : "Nội dung Internet không đi thẳng tới trẻ. Phụ huynh kiểm tra và duyệt gói trước khi sử dụng."}</p></div></div>{enrichmentTask ? <Button onClick={startEnrichment} className="primary-action small">Vào phòng bài toán mở <ArrowRight /></Button> : <span className="enrichment-wait"><ShieldCheck /> Chờ phụ huynh duyệt ở Góc đồng hành</span>}</section>}
    {learning.diagnostic && <section className="content-governance"><div className="governance-heading"><ShieldCheck /><div><p className="eyebrow">Cổng nội dung dành cho phụ huynh</p><h2>Kho 9 tháng đã được chia nhỏ để anh xem và duyệt</h2><p>36 bài toán mở nằm trong 9 gói tháng. Mỗi bài có hướng dẫn đáp án, vật liệu, câu mở rộng và nguồn phương pháp; không có nội dung Internet nào đi thẳng tới trẻ.</p></div></div><div className="governance-actions"><Button variant="outline" onClick={() => { setView("content-review"); scrollTop(); }}><ListChecks /> Mở phòng kiểm duyệt 9 tháng</Button><span className="pack-success"><CheckCircle2 /> {curatedPacks.filter((pack) => pack.month).length}/9 tháng đã duyệt trên iPad</span></div></section>}
    <section className="nine-month-overview"><div><p className="eyebrow">Chương trình học dài hạn</p><h2>Không còn là kho bài dùng hết trong một ngày</h2><p>36 tuần được xếp theo vòng xoáy: số học, tính toán, đo lường, hình học, dữ liệu và giải quyết vấn đề quay lại ở độ sâu cao hơn.</p></div><div className="nine-month-stats"><span><strong>9</strong> tháng</span><span><strong>36</strong> tuần</span><span><strong>180</strong> buổi lõi</span><span><strong>36</strong> bài toán mở</span></div><Button variant="outline" onClick={() => { setView("year-plan"); scrollTop(); }}><CalendarDays /> Xem toàn bộ lộ trình</Button></section>
    <section className="program-scale"><div><strong>36</strong><span>chủ đề cốt lõi</span></div><div><strong>432</strong><span>phiên bản nhiệm vụ</span></div><div><strong>2.160+</strong><span>câu luyện có gợi ý</span></div><div><strong>36</strong><span>bài toán mở/năm</span></div></section>
    <section className="learning-cycle deep-cycle"><p className="eyebrow">Chuẩn chung cho mọi nhiệm vụ</p>{["Thử trước", "Tương tác", "Hai cách", "Gợi ý 3 tầng", "Chuyển giao", "Phản tư"].map((label, index) => <div key={label}><span>{index + 1}</span><strong>{label}</strong><small>{["Ghim dự đoán", "Tạo bằng chứng", "Chọn chiến lược", "Không lộ đáp án sớm", "Dùng trong bài mới", "Nói ra điều hiểu"][index]}</small></div>)}</section>
    {dueCheckInMonth && <section className="checkin-strip"><ClipboardCheck /><div><p className="eyebrow">Đánh giá Tháng {dueCheckInMonth}</p><h2>Con đã học đủ {dueCheckInMonth * 4} tuần—xem mình tiến bộ đến đâu nhé</h2><p>{CHECKIN_SIZE} câu, khoảng 10 phút, không gợi ý và không đồng hồ. Kết quả so với {learning.checkIns.length ? `tháng ${learning.checkIns.at(-1)!.month}` : "bài đánh giá đầu vào"}.</p></div><Button onClick={() => startCheckIn(dueCheckInMonth)} className="primary-action small">Bắt đầu <ArrowRight /></Button></section>}<section className="dino-island" aria-label="Đảo Khủng Long"><div className="dino-island-head"><button type="button" className="dino-island-companion" onClick={() => openDinoWorld("to-am")} aria-label={companion ? `Thăm ${companion.kind.name} trong Tổ ấm` : "Mở Tổ ấm"}>{companion ? <DinoFigure kind={companion.kind} stage={companion.stage} shiny={companion.shiny} animated /> : <DinoEgg cracks={1} />}</button><div><p className="eyebrow">Đảo Khủng Long</p><h2>{dinoSummary.hatched + rareCount}/{DINO_SPECIES.length + DINO_RARE_SPECIES.length} loài đã khám phá</h2><p className="dino-island-lead">Mỗi phiên bản nhiệm vụ cho mảnh trứng; đủ {SHARDS_TO_HATCH} mảnh thì trứng nở. Bài toán mở nở trứng Huyền thoại, mốc {DINO_SEASONAL_MILESTONES.join(", ")} ngày học nở trứng Đặc biệt, và thỉnh thoảng một Trứng Bí Ẩn sẽ bất ngờ xuất hiện.</p></div><div className="dino-island-stats"><span><strong>{dinoSummary.warming}</strong> trứng đang ấp</span><span><strong>{rareCount}</strong> loài hiếm</span><button type="button" className={`dino-streak ${learnedToday ? "" : "resting"}`} onClick={() => openDinoWorld("to-am")}><strong>🦴 {museum.fossils} hóa thạch</strong>{`Tuần này ${museum.thisWeek?.learnedDays ?? 0}/${RHYTHM_SESSIONS_PER_WEEK} buổi${learnedToday ? "" : " · hôm nay Khủng Long nghỉ ngơi 🦕"}`}<small>{museum.rescue ? `Tuần trước thiếu ${museum.rescue.missing} buổi—chạm để dùng khiên` : `${museum.shieldsLeft}/${FOSSIL_SHIELDS_PER_MONTH} Khiên hóa thạch tháng này`}</small></button></div></div>{dinoNotice && <div className="dino-hatch-note celebrate" aria-live="polite"><span>{getDinoKindById(dinoNotice.speciesId) ? <DinoFigure kind={getDinoKindById(dinoNotice.speciesId)!} stage="con-non" animated /> : <Sparkles />}</span><div><strong>{dinoNotice.title}</strong><p>{dinoNotice.text}</p></div><Button variant="outline" onClick={() => { setGallerySelected(dinoNotice.speciesId || null); setDinoNotice(null); openDinoWorld("bo-suu-tap"); }}>Xem bé</Button></div>}{learning.dinoMystery.ready && <button type="button" className="dino-mystery" onClick={openMysteryEggNow}><DinoEgg mystery /><span><strong>Một Trứng Bí Ẩn vừa xuất hiện!</strong><small>Chạm để xem ai chui ra</small></span></button>}<div className="dino-island-actions"><Button onClick={() => openDinoWorld("to-am")} className="primary-action small">Vào Tổ ấm <ArrowRight /></Button><Button variant="outline" onClick={() => openDinoWorld("bo-suu-tap")}>Bộ sưu tập {DINO_SPECIES.length + DINO_RARE_SPECIES.length} loài</Button></div></section>
    <section className="dashboard-layout"><div className="curriculum-panel"><div className="panel-heading"><div><p className="eyebrow">Hành trình phiêu lưu thích ứng</p><h2>36 trạm · mỗi trạm một bé khủng long</h2></div><Button variant="outline" onClick={() => setShowFullMap((value) => !value)}>{showFullMap ? "Xem Hành trình" : "Xem theo 6 miền"} <Map /></Button></div>{!showFullMap ? <DinoJourney stations={journeyStations} onStation={(station) => { if (!learning.diagnostic) { setView("diagnostic-intro"); return; } const mission = ALL_DEEP_MISSIONS.find((item) => item.id === YEAR_WEEKS[station.week - 1]?.missionId); if (mission) startMission(mission); }} onBranch={claimJourneyBranch} /> : <div className="domain-map">{DOMAINS.map((domain) => { const Icon = DOMAIN_ICONS[domain.id]; return <section key={domain.id} className="domain-track"><div className="domain-track-heading"><span style={{ background: domain.soft, color: domain.color }}><Icon /></span><div><strong>{domain.name}</strong><small>{domain.description}</small></div></div><div className="track-missions">{DEEP_MISSION_LIBRARY[domain.id].map((mission) => { const record = learning.missionRecords[mission.id]; const unlocked = Boolean(learning.diagnostic) && missionIsUnlocked(mission); const isRecommended = learning.diagnostic && mission.id === recommendedMission.id; return <button key={mission.id} type="button" onClick={() => learning.diagnostic ? (unlocked ? startMission(mission) : undefined) : setView("diagnostic-intro")} className={`${record ? "complete" : ""} ${isRecommended ? "recommended" : ""} ${learning.diagnostic && !unlocked ? "locked" : ""}`}><span>{mission.sequence}</span><div><strong>{mission.title}</strong><small>{record ? `${record.autonomy}% tự lực · gợi ý ${record.maxHintDepth}/3` : unlocked ? "Sẵn sàng" : "Chưa mở"}</small></div>{record ? <CheckCircle2 /> : !unlocked ? <LockKeyhole /> : <Flag />}</button>; })}</div></section>; })}</div>}</div>
      <aside className="parent-panel"><p className="eyebrow">Góc đồng hành · hồ sơ v{CURRICULUM_VERSION}</p><h2>Dữ liệu để hiểu cách học, không chỉ đếm điểm</h2><div className="ipad-install-tip"><Tablet /><p><strong>Dùng như ứng dụng trên iPad</strong><span>Mở bằng Safari → Chia sẻ → Thêm vào Màn hình chính.</span></p></div><div className="offline-update-box"><div className="offline-status"><span className={online ? "online" : "offline"}>{online ? <CheckCircle2 /> : <WifiOff />}{online ? "Đang có mạng" : "Đang ngoại tuyến"}</span><span className={offlineReady ? "ready" : "pending"}>{offlineReady ? <ShieldCheck /> : <RefreshCw />}{offlineReady ? "Đã sẵn sàng học ngoại tuyến" : "Đang chuẩn bị dữ liệu ngoại tuyến"}</span></div><div className="release-heading"><CloudDownload /><p><strong>Nội dung {CONTENT_RELEASE.version}</strong><span>Chỉ nhận bản phát hành đã kiểm tra và cần phụ huynh chủ động xác nhận.</span></p></div><Button variant="outline" onClick={checkForContentUpdate} disabled={updateState === "checking" || updateState === "installing"} className="w-full"><RefreshCw /> {updateState === "checking" ? "Đang kiểm tra…" : "Kiểm tra nội dung mới"}</Button>{updateState === "current" && <small role="status" className="update-message success">Đây là bản nội dung mới nhất đã được duyệt.</small>}{updateState === "offline" && <small role="status" className="update-message">Không có mạng. Con vẫn học bằng nội dung đã lưu trên iPad.</small>}{updateState === "rejected" && <small role="alert" className="update-message warning">Bản mới chưa đủ trạng thái kiểm duyệt nên không được cài.</small>}{updateState === "error" && <small role="alert" className="update-message warning">Chưa kiểm tra được bản mới. Nội dung hiện tại vẫn được giữ nguyên.</small>}{updateState === "available" && availableRelease && <div className="update-approval" role="status"><strong>Có bản {availableRelease.version}</strong><ul>{availableRelease.notes.slice(0, 3).map((note) => <li key={note}>{note}</li>)}</ul><p>Phụ huynh xem nội dung trên rồi mới cho phép tải.</p><Button onClick={installContentUpdate} className="primary-action w-full"><CloudDownload /> Phụ huynh đồng ý cập nhật</Button></div>}{updateState === "installing" && <small role="status" className="update-message success">Đang cài bản đã duyệt và sẽ mở lại ứng dụng…</small>}</div>{learning.diagnostic ? <><label className="nickname-field"><UserRound /><span>Tên gọi của con</span><Input value={learning.nickname} maxLength={30} onChange={(event) => setLearning((profile) => ({ ...profile, nickname: event.target.value }))} /></label><div className="parent-score"><strong>{sparkPoints}</strong><span>tia sáng tò mò · {learning.discoveryDays.length} ngày khám phá</span></div><div className="adaptive-stats"><div><strong>{completedMissions}</strong><span>Nhiệm vụ / 36</span></div><div><strong>{totalHints}</strong><span>Bài đã dùng gợi ý</span></div><div><strong>{totalRetries}</strong><span>Lần thử lại</span></div><div><strong>{reflectionCount}</strong><span>Phản tư đã ghi</span></div></div><div className="adaptive-summary"><Brain /><div><strong>{dueMissions.length ? `${dueMissions.length} nhiệm vụ đến lịch ôn` : "Lịch ôn đang được giãn theo mức tự lực"}</strong><p>Đề xuất dùng đúng lần đầu, độ sâu gợi ý, chuyển giao và thời gian.</p></div></div><div className="parent-tip"><Lightbulb /><p>Hỏi con: <strong>“Bằng chứng nào làm con đổi ý?”</strong> thay vì “đúng bao nhiêu?”.</p></div><div className="backup-box"><div><ShieldCheck /><p><strong>Sao lưu hồ sơ</strong><span>Dữ liệu lưu trên thiết bị. Tải JSON để chuyển máy hoặc phòng khi trình duyệt bị xóa.</span></p></div><div><Button variant="outline" onClick={exportBackup}><Download /> Sao lưu</Button><Button variant="outline" onClick={() => importRef.current?.click()}><FileUp /> Khôi phục</Button><input ref={importRef} type="file" accept="application/json,.json" hidden onChange={(event) => importBackup(event.target.files?.[0])} /></div>{backupStatus && <small role="status">{backupStatus}</small>}</div><Button variant="outline" onClick={() => setView("diagnostic-intro")} className="w-full"><RefreshCw /> Khám phá lại năng lực</Button></> : <><div className="empty-diagnostic"><ClipboardCheck /><strong>Chưa có bản đồ tư duy</strong><p>Bài đầu vào giúp chọn đúng độ khó và mở hành trình 36 nhiệm vụ.</p></div><Button onClick={() => setView("diagnostic-intro")} className="primary-action w-full">Tạo hành trình cho con</Button></>}<div className="progress-code-box" id="progress-code"><div><CloudDownload /><p><strong>Mã tiến trình</strong><span>Gói toàn bộ tia sáng, mảnh trứng, khủng long và kết quả đánh giá thành một đoạn mã. Dán mã vào máy khác để học tiếp.</span></p></div><Button variant="outline" onClick={createProgressCode} className="w-full"><Download /> Xuất mã tiến trình</Button>{progressCode && <Textarea readOnly value={progressCode} onFocus={(event) => event.currentTarget.select()} aria-label="Mã tiến trình vừa tạo" className="progress-code-output" />}<Textarea value={progressCodeInput} onChange={(event) => setProgressCodeInput(event.target.value)} placeholder="Dán mã bắt đầu bằng MR1…" aria-label="Nhập mã tiến trình" className="progress-code-input" /><Button variant="outline" onClick={restoreFromProgressCode} disabled={!progressCodeInput.trim()} className="w-full"><FileUp /> Nhập mã tiến trình</Button>{progressCodeStatus && <small role="status">{progressCodeStatus}</small>}</div><details className="cloud-sync-box"><summary><CloudDownload /> Đồng bộ Google Sheets <small>{cloud.lastSyncedAt ? `Đã khớp ${new Date(cloud.lastSyncedAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}` : "Chưa bật"}</small></summary><div><p>Tiến trình lưu vào Google Sheets của chính gia đình, không qua máy chủ nào khác. Cài một lần:</p><ol><li>Tạo một Google Sheets mới → <b>Tiện ích mở rộng → Apps Script</b>.</li><li>Dán mã <code>MathRaccoonSync.gs</code> (trong thư mục <code>docs/cloud-sync</code> của dự án) rồi bấm Lưu.</li><li><b>Triển khai → Tùy chọn triển khai mới → Ứng dụng web</b>; thực thi với tư cách “Tôi”, ai cũng truy cập được.</li><li>Dán đường dẫn kết thúc bằng <code>/exec</code> vào ô dưới, đặt mã gia đình và mã PIN.</li><li>Máy đầu tiên bấm <b>Lưu lên đám mây</b>; máy khác nhập cùng mã rồi bấm <b>Tải từ đám mây</b>.</li></ol><Input value={cloud.url} onChange={(event) => updateCloud({ url: event.target.value.trim() })} placeholder="https://script.google.com/macros/s/…/exec" aria-label="Đường dẫn Apps Script" /><div className="cloud-sync-fields"><Input value={cloud.familyCode} onChange={(event) => updateCloud({ familyCode: event.target.value.trim() })} placeholder="Mã gia đình, ví dụ nha-minh" aria-label="Mã gia đình" /><Input value={cloud.pin} onChange={(event) => updateCloud({ pin: event.target.value.replace(/\D/g, "").slice(0, 8) })} type="password" inputMode="numeric" placeholder="Mã PIN 4–8 số" aria-label="Mã PIN" /></div><div className="cloud-sync-actions"><Button variant="outline" onClick={cloudSaveNow} disabled={cloudBusy}><CloudDownload /> Lưu lên đám mây</Button><Button variant="outline" onClick={cloudLoadNow} disabled={cloudBusy}><Download /> Tải từ đám mây</Button></div><label className="cloud-sync-auto"><input type="checkbox" checked={cloud.auto} disabled={!cloud.lastSyncedAt} onChange={(event) => setCloud((current) => ({ ...current, auto: event.target.checked }))} /> Tự động lưu sau mỗi thay đổi {cloud.lastSyncedAt ? "" : "(bật được sau lần lưu hoặc tải đầu tiên)"}</label>{cloudStatusText && <small role="status">{cloudStatusText}</small>}</div></details><div className="prefs-box"><strong>Tuỳ chọn hiển thị</strong><label><input type="checkbox" checked={prefs.largeText} onChange={(event) => setPrefs((current) => ({ ...current, largeText: event.target.checked }))} /> Phóng to chữ đề bài khi bấm “Nghe đọc đề”</label><label><input type="checkbox" checked={prefs.sound} onChange={(event) => setPrefs((current) => ({ ...current, sound: event.target.checked }))} /> Âm thanh thưởng (nở trứng, Trứng Dũng cảm)</label></div></aside></section>
  </div></main>;
}

function TileRectangle({ value }: { value: string }) {
  const [rows, columns] = value.split("x").map(Number);
  return <span className="tile-rectangle" style={{ "--rows": rows, "--columns": columns } as React.CSSProperties} aria-label={`Hình ${rows} hàng, ${columns} cột`}>{Array.from({ length: rows * columns }, (_, index) => <i key={index} />)}</span>;
}
