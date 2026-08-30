"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpenCheck, Brain, Calculator,
  Check, CheckCircle2, ClipboardCheck, Clock3, CloudDownload, Download, FileUp, Flag,
  Lightbulb, LockKeyhole, Map, Medal, RefreshCw, Route, Ruler, Shapes,
  ShieldCheck, Sparkles, Target, Trophy, UserRound, Volume2, Tablet, WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  DIAGNOSTIC_QUESTIONS, DOMAINS,
  type DiagnosticQuestion, type DomainId, type PracticeQuestion,
} from "./content";
import {
  ALL_DEEP_MISSIONS, CURRICULUM_VERSION, DAILY_PUZZLES_60, DEEP_MISSION_LIBRARY,
  type DeepMission, type DeepQuestion,
} from "./curriculum";
import CONTENT_RELEASE from "../public/content-release.json";

type View = "dashboard" | "diagnostic-intro" | "diagnostic" | "diagnostic-result" | "mission";
type MissionStage = "predict" | "explore" | "strategies" | "practice" | "transfer" | "reflect" | "result";
type DomainScore = { correct: number; total: number; percent: number; status: "strong" | "developing" | "review" };
type DiagnosticResult = { correct: number; total: number; percent: number; placement: string; scores: Record<DomainId, DomainScore>; finishedAt: string };
type SessionEvidence = { finishedAt: string; firstScore: number; autonomy: number; averageHintDepth: number; transferFirstTry: boolean };
type MissionRecord = {
  bestFirstScore: number; autonomy: number; hintsUsed: number; maxHintDepth: number;
  retries: number; completedAt: string; reviewAt: string; reflection: string;
  prediction: string; focusNeeds: string[]; completedCount: number; sessions: SessionEvidence[];
};
type LearningProfile = {
  schemaVersion: number; profileId: string; nickname: string; createdAt: string; savedAt: string;
  diagnostic: DiagnosticResult | null; missionRecords: Record<string, MissionRecord>; discoveryDays: string[];
};
type LegacyRecord = Partial<MissionRecord>;
type UpdateState = "idle" | "checking" | "current" | "available" | "installing" | "offline" | "rejected" | "error";
type ContentRelease = typeof CONTENT_RELEASE;

const STORAGE_KEY = "math-raccoon-learning-v5";
const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const CONTENT_RELEASE_URL = `${APP_BASE_PATH}/content-release.json`;
const DAY = 86_400_000;
const SESSION_NOW = Date.now();
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
  return { schemaVersion: CURRICULUM_VERSION, profileId: uid(), nickname: "Nhà thám hiểm", createdAt: now, savedAt: now, diagnostic: null, missionRecords: {}, discoveryDays: [] };
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
    Object.entries(value.missionRecords).forEach(([id, record]) => {
      if (record && typeof record === "object") missionRecords[id] = migrateRecord(record as LegacyRecord);
    });
  } else if (value.lessonScores) {
    Object.entries(value.lessonScores).forEach(([domain, score]) => {
      missionRecords[`${domain}-1`] = migrateRecord({ bestFirstScore: score, autonomy: score });
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
  };
}

function AppHeader({ back, onHome, sparkPoints, completedMissions }: { back?: () => void; onHome: () => void; sparkPoints: number; completedMissions: number }) {
  return <header className="app-header"><div className="header-left">{back && <Button variant="ghost" size="icon" onClick={back} aria-label="Quay lại" className="back-button"><ArrowLeft /></Button>}<button className="brand" onClick={onHome} type="button"><span className="brand-icon">🦝</span><span>Math Raccoon <small>CLB Toán nâng cao lớp 3</small></span></button></div><div className="header-badges"><span><Sparkles /> {sparkPoints} tia sáng</span><span><Trophy /> {completedMissions}/36 nhiệm vụ</span></div></header>;
}

function SpeakButton({ text, dark = false }: { text: string; dark?: boolean }) {
  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.normalize("NFC"));
    utterance.lang = "vi-VN";
    utterance.rate = .88;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }
  return <Button type="button" variant="outline" onClick={speak} className={`speak-button ${dark ? "dark" : ""}`} aria-label="Nghe đọc đề"><Volume2 /> Nghe đọc đề</Button>;
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
  const [online, setOnline] = useState(true);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateState, setUpdateState] = useState<UpdateState>("idle");
  const [availableRelease, setAvailableRelease] = useState<ContentRelease | null>(null);
  const serviceWorkerRef = useRef<ServiceWorkerRegistration | null>(null);
  const updateReloadRef = useRef(false);

  useEffect(() => {
    const task = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem("math-raccoon-learning-v4") ?? window.localStorage.getItem("math-raccoon-learning-v3");
        if (saved) setLearning(migrateProfile(JSON.parse(saved)));
      } catch { setBackupStatus("Không đọc được hồ sơ cũ; một hồ sơ mới đã được mở an toàn."); }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(task);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...learning, schemaVersion: CURRICULUM_VERSION, savedAt: new Date().toISOString() }));
  }, [hydrated, learning]);
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
    return [...DOMAINS].sort((a, b) => Math.abs(learning.diagnostic!.scores[a.id].percent - 67) - Math.abs(learning.diagnostic!.scores[b.id].percent - 67));
  }, [learning.diagnostic]);
  const currentMission = ALL_DEEP_MISSIONS.find((mission) => mission.id === missionId) ?? ALL_DEEP_MISSIONS[0];
  const currentPractice = currentMission.deepPractice[practiceIndex];
  const currentPracticeCorrect = practiceChecked && answerIsCorrect(currentPractice, practiceAnswer);
  const transferCorrect = transferChecked && answerIsCorrect(currentMission.transfer, transferAnswer);
  const currentDiagnostic = DIAGNOSTIC_QUESTIONS[diagnosticIndex];
  const todayPuzzle = DAILY_PUZZLES_60[Math.floor(SESSION_NOW / DAY) % DAILY_PUZZLES_60.length];
  const completedMissions = Object.keys(learning.missionRecords).filter((id) => ALL_DEEP_MISSIONS.some((mission) => mission.id === id)).length;
  const reflectionCount = Object.values(learning.missionRecords).filter((record) => record.reflection.trim()).length;
  const totalHints = Object.values(learning.missionRecords).reduce((sum, record) => sum + record.hintsUsed, 0);
  const totalRetries = Object.values(learning.missionRecords).reduce((sum, record) => sum + record.retries, 0);
  const sparkPoints = (learning.diagnostic ? 60 : 0) + completedMissions * 120 + reflectionCount * 20;

  function missionIsUnlocked(mission: DeepMission) {
    if (mission.sequence === 1) return true;
    if (mission.sequence === 2) return Boolean(learning.missionRecords[`${mission.domain}-1`]) || (learning.diagnostic?.scores[mission.domain].percent ?? 0) >= 80;
    const previous = learning.missionRecords[`${mission.domain}-${mission.sequence - 1}`];
    return Boolean(previous && previous.autonomy >= 55);
  }
  function nextForDomain(domain: DomainId) {
    const missions = DEEP_MISSION_LIBRARY[domain];
    return missions.find((mission) => missionIsUnlocked(mission) && !learning.missionRecords[mission.id])
      ?? missions.find((mission) => missionIsUnlocked(mission) && new Date(learning.missionRecords[mission.id]?.reviewAt ?? Infinity).getTime() <= SESSION_NOW)
      ?? [...missions].reverse().find(missionIsUnlocked) ?? missions[0];
  }
  const dueMissions = ALL_DEEP_MISSIONS.filter((mission) => learning.missionRecords[mission.id] && new Date(learning.missionRecords[mission.id].reviewAt).getTime() <= SESSION_NOW).sort((a, b) => learning.missionRecords[a.id].autonomy - learning.missionRecords[b.id].autonomy);
  const adaptivePlan = roadmap.map((domain) => nextForDomain(domain.id));
  const recommendedMission = dueMissions[0] ?? adaptivePlan.find((mission) => !learning.missionRecords[mission.id]) ?? adaptivePlan[0];
  const choiceMission = adaptivePlan.find((mission) => mission.id !== recommendedMission.id && !learning.missionRecords[mission.id]) ?? ALL_DEEP_MISSIONS.find((mission) => mission.id !== recommendedMission.id && missionIsUnlocked(mission)) ?? recommendedMission;

  function scrollTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }
  function goDashboard() { setView("dashboard"); scrollTop(); }
  function beginDiagnostic() { setDiagnosticIndex(0); setDiagnosticAnswers(Array(DIAGNOSTIC_QUESTIONS.length).fill("")); setView("diagnostic"); scrollTop(); }
  function finishDiagnostic() {
    const raw = Object.fromEntries(DOMAINS.map((domain) => [domain.id, { correct: 0, total: 0 }])) as Record<DomainId, { correct: number; total: number }>;
    DIAGNOSTIC_QUESTIONS.forEach((question, index) => { raw[question.domain].total += 1; if (answerIsCorrect(question, diagnosticAnswers[index])) raw[question.domain].correct += 1; });
    const scores = Object.fromEntries(DOMAINS.map((domain) => { const item = raw[domain.id]; const percent = Math.round((item.correct / item.total) * 100); return [domain.id, { ...item, percent, status: scoreStatus(percent) }]; })) as Record<DomainId, DomainScore>;
    const correct = Object.values(raw).reduce((sum, item) => sum + item.correct, 0);
    const percent = Math.round((correct / DIAGNOSTIC_QUESTIONS.length) * 100);
    const today = new Date().toISOString().slice(0, 10);
    setLearning((profile) => ({ ...profile, diagnostic: { correct, total: DIAGNOSTIC_QUESTIONS.length, percent, placement: placementFor(percent), scores, finishedAt: new Date().toISOString() }, discoveryDays: profile.discoveryDays.includes(today) ? profile.discoveryDays : [...profile.discoveryDays, today] }));
    setView("diagnostic-result"); scrollTop();
  }
  function diagnosticNext() { if (diagnosticIndex === DIAGNOSTIC_QUESTIONS.length - 1) finishDiagnostic(); else setDiagnosticIndex((index) => index + 1); }
  function startMission(mission: DeepMission) {
    if (!learning.diagnostic) { setView("diagnostic-intro"); return; }
    if (!missionIsUnlocked(mission)) return;
    setMissionId(mission.id); setStage("predict"); setPredictionChoice(""); setPredictionRevealed(false);
    setLabChoice(""); setLabChecked(false); setPracticeIndex(0); setPracticeAnswer(""); setPracticeChecked(false);
    setFirstAttempts(Array(mission.deepPractice.length).fill(null)); setAttemptCounts(Array(mission.deepPractice.length).fill(0)); setHintDepths(Array(mission.deepPractice.length).fill(0));
    setTransferAnswer(""); setTransferChecked(false); setTransferFirst(null); setTransferAttempts(0); setTransferHintDepth(0);
    setReflectionPrompt(0); setReflectionDraft(learning.missionRecords[mission.id]?.reflection ?? ""); setView("mission"); scrollTop();
  }
  function goStage(next: MissionStage) { setStage(next); scrollTop(); }
  function checkPractice() {
    if (!practiceAnswer || practiceChecked) return;
    const correct = answerIsCorrect(currentPractice, practiceAnswer); setPracticeChecked(true);
    setAttemptCounts((values) => values.map((value, index) => index === practiceIndex ? value + 1 : value));
    setFirstAttempts((values) => values.map((value, index) => index === practiceIndex && value === null ? correct : value));
  }
  function nextPractice() {
    if (!currentPracticeCorrect) return;
    if (practiceIndex === currentMission.deepPractice.length - 1) { goStage("transfer"); return; }
    setPracticeIndex((index) => index + 1); setPracticeAnswer(""); setPracticeChecked(false); scrollTop();
  }
  function checkTransfer() {
    if (!transferAnswer || transferChecked) return;
    const correct = answerIsCorrect(currentMission.transfer, transferAnswer); setTransferChecked(true); setTransferAttempts((value) => value + 1);
    if (transferFirst === null) setTransferFirst(correct);
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
    const session: SessionEvidence = { finishedAt: now.toISOString(), firstScore, autonomy, averageHintDepth: Number(averageHintDepth.toFixed(2)), transferFirstTry: Boolean(transferFirst) };
    const today = now.toISOString().slice(0, 10);
    setLearning((profile) => {
      const previous = profile.missionRecords[currentMission.id];
      const record: MissionRecord = { bestFirstScore: Math.max(previous?.bestFirstScore ?? 0, firstScore), autonomy: Math.max(previous?.autonomy ?? 0, autonomy), hintsUsed, maxHintDepth, retries, completedAt: now.toISOString(), reviewAt: new Date(now.getTime() + reviewDays * DAY).toISOString(), reflection: reflectionDraft.trim(), prediction: predictionChoice, focusNeeds: [...new Set(focusNeeds)], completedCount: (previous?.completedCount ?? 0) + 1, sessions: [...(previous?.sessions ?? []), session].slice(-10) };
      return { ...profile, missionRecords: { ...profile.missionRecords, [currentMission.id]: record }, discoveryDays: profile.discoveryDays.includes(today) ? profile.discoveryDays : [...profile.discoveryDays, today] };
    });
    goStage("result");
  }
  function exportBackup() {
    const blob = new Blob([JSON.stringify({ product: "Math Raccoon", schemaVersion: CURRICULUM_VERSION, exportedAt: new Date().toISOString(), profile: learning }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `math-raccoon-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url);
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
  function renderAnswerInput(question: DiagnosticQuestion | DeepQuestion, value: string, onChange: (value: string) => void, disabled = false) {
    if (question.type === "number") return <div className="number-answer-wrap"><Input value={value} onChange={(event) => onChange(event.target.value)} inputMode="numeric" disabled={disabled} placeholder="Nhập đáp án" aria-label="Nhập đáp án bằng số" className="number-answer" /><span>Chỉ nhập số, không cần ghi đơn vị</span></div>;
    return <RadioGroup value={value} onValueChange={onChange} disabled={disabled} className="answer-list">{question.options?.map((option, index) => <label key={option} className="answer-row"><RadioGroupItem value={option} id={`${"id" in question ? question.id : "q"}-${index}`} /><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span></label>)}</RadioGroup>;
  }
  if (view === "diagnostic-intro") return <main className="app-shell min-h-screen"><div className="page-wrap"><AppHeader back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} /><section className="assessment-intro"><div className="assessment-mark"><ClipboardCheck /></div><p className="eyebrow">Khám phá năng lực</p><h1>Tìm đúng vùng thử thách<br />khiến con muốn tiến thêm</h1><p className="lead">18 câu quan sát sáu kiểu tư duy. Kết quả chỉ dùng để chọn độ khó và thứ tự nhiệm vụ—không xếp hạng con, không chạy đua thời gian.</p><div className="assessment-facts"><div><Clock3 /><strong>15–20 phút</strong><span>Có thể nghỉ giữa chừng</span></div><div><Brain /><strong>6 kiểu tư duy</strong><span>Từ quy luật đến logic</span></div><div><Route /><strong>36 nhiệm vụ sâu</strong><span>Mỗi nhiệm vụ có chuyển giao</span></div></div><div className="assessment-rules"><h2>Ba điều giúp dữ liệu phản ánh đúng con</h2><ul><li>Để con tự nghĩ; người lớn chỉ giúp đọc đề nếu cần.</li><li>Không nhắc đáp án. Câu chưa làm được giúp chọn điểm bắt đầu.</li><li>Khuyến khích con nói “con đang thử cách này”.</li></ul></div><Button size="lg" onClick={beginDiagnostic} className="primary-action">Bắt đầu khám phá <ArrowRight /></Button></section></div></main>;

  if (view === "diagnostic") {
    const domain = DOMAINS.find((item) => item.id === currentDiagnostic.domain)!; const Icon = DOMAIN_ICONS[domain.id];
    return <main className="app-shell min-h-screen"><div className="page-wrap narrow"><AppHeader back={() => setView("diagnostic-intro")} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} /><section className="assessment-progress"><div><p className="eyebrow">Khám phá năng lực</p><strong>Thử thách {diagnosticIndex + 1} / {DIAGNOSTIC_QUESTIONS.length}</strong></div><span>{domain.name}</span></section><Progress value={((diagnosticIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100} className="diagnostic-progress" /><section className="diagnostic-card"><div className="question-meta"><span style={{ background: domain.soft, color: domain.color }}><Icon /></span><div><small>Ống kính tư duy</small><strong>{domain.name}</strong></div><em>Độ thử thách {currentDiagnostic.difficulty}/3</em></div><p className="skill-label">Năng lực: {currentDiagnostic.skill}</p><h1>{currentDiagnostic.prompt}</h1><SpeakButton text={currentDiagnostic.prompt} />{currentDiagnostic.context && <DataChart question={currentDiagnostic} color={domain.color} />}{renderAnswerInput(currentDiagnostic, diagnosticAnswers[diagnosticIndex], (value) => setDiagnosticAnswers((answers) => answers.map((answer, index) => index === diagnosticIndex ? value : answer)))}<div className="assessment-navigation"><Button variant="outline" onClick={() => setDiagnosticIndex((index) => Math.max(0, index - 1))} disabled={diagnosticIndex === 0}><ArrowLeft /> Câu trước</Button><Button onClick={diagnosticNext} disabled={!diagnosticAnswers[diagnosticIndex]} className="primary-action small">{diagnosticIndex === DIAGNOSTIC_QUESTIONS.length - 1 ? "Nộp bài" : "Câu tiếp theo"} <ArrowRight /></Button></div></section><p className="diagnostic-note"><LockKeyhole /> Không có đồng hồ đếm ngược. Con được quyền suy nghĩ chậm và chắc.</p></div></main>;
  }

  if (view === "diagnostic-result" && learning.diagnostic) {
    const result = learning.diagnostic;
    return <main className="app-shell min-h-screen"><div className="page-wrap"><AppHeader back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} /><section className="result-hero"><div className="score-ring" style={{ "--score": `${result.percent * 3.6}deg` } as React.CSSProperties}><div><strong>{result.percent}%</strong><span>{result.correct}/{result.total} câu</span></div></div><div><p className="eyebrow">Hồ sơ khám phá</p><h1>{result.placement}</h1><p>Điểm đầu vào quyết định nơi bắt đầu; mức tự lực, độ sâu gợi ý và câu chuyển giao sẽ tiếp tục điều chỉnh lộ trình.</p></div></section><section className="result-layout"><div className="result-panel"><div className="panel-heading"><div><p className="eyebrow">Bản đồ tư duy</p><h2>Sáu miền năng lực</h2></div><span>3 câu / miền</span></div><div className="domain-results">{DOMAINS.map((domain) => { const score = result.scores[domain.id]; const Icon = DOMAIN_ICONS[domain.id]; return <div className="domain-result" key={domain.id}><span className="domain-result-icon" style={{ background: domain.soft, color: domain.color }}><Icon /></span><div><strong>{domain.name}</strong><Progress value={score.percent} className={`score-progress ${score.status}`} /></div><em>{score.correct}/{score.total}</em><small>{score.status === "strong" ? "Sẵn sàng bứt phá" : score.status === "developing" ? "Đúng vùng thử thách" : "Cần gợi mở từng bước"}</small></div>; })}</div></div><aside className="roadmap-panel"><p className="eyebrow">Đề xuất đầu tiên</p><h2>{recommendedMission.title}</h2><p>Bắt đầu gần vùng 67% để con có chiến thắng sớm nhưng vẫn phải suy nghĩ. Mỗi miền có 6 nhiệm vụ.</p><ol>{adaptivePlan.map((mission, index) => <li key={mission.id}><span>{index + 1}</span><div><strong>{mission.title}</strong><small>{DOMAINS.find((d) => d.id === mission.domain)?.short} · chặng {mission.sequence}/6</small></div>{index === 0 && <em>Khởi hành</em>}</li>)}</ol><Button onClick={() => startMission(recommendedMission)} className="primary-action w-full">Nhận nhiệm vụ <ArrowRight /></Button></aside></section></div></main>;
  }

  if (view === "mission") {
    const domain = DOMAINS.find((item) => item.id === currentMission.domain)!; const Icon = DOMAIN_ICONS[currentMission.domain]; const record = learning.missionRecords[currentMission.id];
    if (stage === "result") {
      const next = nextForDomain(currentMission.domain);
      return <main className="app-shell min-h-screen"><div className="page-wrap narrow"><AppHeader back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} /><section className="lesson-result"><div className="mastery-badge passed"><Medal /></div><p className="eyebrow">Nhiệm vụ hoàn thành · +120 tia sáng</p><h1>{(record?.autonomy ?? 0) >= 85 ? "Nhà nghiên cứu tự lực" : (record?.autonomy ?? 0) >= 65 ? "Nhà chiến lược bền bỉ" : "Nhà thám hiểm dám sửa"}</h1><p>Hệ thống ghi nhận không chỉ đáp án: đúng lần đầu, độ sâu gợi ý, số lần thử lại và khả năng dùng ý tưởng trong câu mới.</p><div className="mastery-meter"><Progress value={record?.autonomy ?? 0} /><span style={{ left: `${Math.max(8, record?.autonomy ?? 0)}%` }}>{record?.autonomy ?? 0}% tự lực</span></div><div className="evidence-grid"><div><strong>{record?.bestFirstScore ?? 0}%</strong><span>đúng lần đầu tốt nhất</span></div><div><strong>{record?.maxHintDepth ?? 0}/3</strong><span>gợi ý sâu nhất</span></div><div><strong>{record?.sessions.at(-1)?.transferFirstTry ? "Đạt" : "Cần ôn"}</strong><span>chuyển giao lần đầu</span></div></div>{record?.focusNeeds.length ? <div className="adaptive-note"><Brain /><div><strong>Động cơ thích ứng đã ghi nhận</strong><p>Gặp lại sau: {record.focusNeeds.join(" · ")}. Lịch ôn: {new Date(record.reviewAt).toLocaleDateString("vi-VN")}.</p></div></div> : <div className="adaptive-note"><CheckCircle2 /><div><strong>Ý tưởng đã đứng vững</strong><p>Con giải độc lập và chuyển được sang tình huống mới.</p></div></div>}<div className="result-advice"><Lightbulb /><div><strong>Phát hiện con đã ghi</strong><p>{record?.reflection}</p></div></div><div className="result-actions"><Button variant="outline" onClick={() => startMission(currentMission)}><RefreshCw /> Thử lại cách khác</Button><Button onClick={() => startMission(next.id === currentMission.id ? recommendedMission : next)} className="primary-action small">Nhiệm vụ tiếp theo <ArrowRight /></Button></div></section></div></main>;
    }
    return <main className="app-shell min-h-screen"><div className="page-wrap mission-wrap"><AppHeader back={goDashboard} onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} /><section className="lesson-heading"><span className="lesson-icon" style={{ background: domain.soft, color: domain.color }}><Icon /></span><div><p className="eyebrow">{domain.name} · chặng {currentMission.sequence}/6</p><h1>{currentMission.title}</h1><p>{currentMission.goal}</p></div></section><nav className="deep-steps">{STAGES.map((item) => { const currentIndex = STAGES.findIndex((step) => step.id === stage); const itemIndex = STAGES.findIndex((step) => step.id === item.id); return <span key={item.id} className={item.id === stage ? "active" : itemIndex < currentIndex ? "done" : ""}><strong>{itemIndex < currentIndex ? <Check /> : item.short}</strong>{item.label}</span>; })}</nav>
      <section className="mission-guide" aria-label="Chuẩn bị cho nhiệm vụ"><div><Clock3 /><span><strong>{currentMission.durationMinutes} phút</strong><small>Một buổi vừa đủ</small></span></div><div><Tablet /><span><strong>Con cần</strong><small>{currentMission.materials.join(" · ")}</small></span></div><div><Target /><span><strong>Đích khám phá</strong><small>{currentMission.realWorldConnection}</small></span></div></section>
      {stage === "predict" && <section className="deep-card predict-card"><p className="eyebrow">Thử trước khi được dạy</p><h2>{currentMission.prediction.prompt}</h2><SpeakButton text={currentMission.prediction.prompt} /><p className="stage-lead">Hãy chọn ý con đang nghĩ. Dự đoán sai vẫn có giá trị vì nó cho ta thứ để kiểm tra.</p><RadioGroup value={predictionChoice} onValueChange={(value) => { setPredictionChoice(value); setPredictionRevealed(false); }} className="prediction-options">{currentMission.prediction.options.map((option) => <label key={option}><RadioGroupItem value={option} /><span>{option}</span></label>)}</RadioGroup>{predictionRevealed && <div className="evidence-reveal"><Lightbulb /><div><strong>Giữ lại dự đoán này</strong><p>{currentMission.prediction.reveal}</p>{currentMission.prediction.answer && <small>Ý sẽ được kiểm chứng: {currentMission.prediction.answer}</small>}</div></div>}<div className="stage-actions"><Button variant="outline" onClick={() => setPredictionRevealed(true)} disabled={!predictionChoice}>Ghim dự đoán</Button><Button onClick={() => goStage("explore")} disabled={!predictionRevealed} className="primary-action small">Vào phòng thử nghiệm <ArrowRight /></Button></div></section>}
      {stage === "explore" && <section className="deep-card"><p className="eyebrow">Bài tương tác</p><h2>{currentMission.lab.prompt}</h2><SpeakButton text={currentMission.lab.prompt} /><p className="stage-lead">Chạm vào một phương án, quan sát dữ kiện rồi kiểm tra.</p><div className={`lab-options ${currentMission.lab.type === "tile-rectangles" ? "tile-lab" : ""}`}>{currentMission.lab.options.map((option) => <button type="button" key={option.value} className={labChoice === option.value ? "selected" : ""} onClick={() => { setLabChoice(option.value); setLabChecked(false); }}>{currentMission.lab.type === "tile-rectangles" && <TileRectangle value={option.value} />}<strong>{option.label}</strong><span>{option.note}</span></button>)}</div>{labChecked && <div className={`feedback ${labChoice === currentMission.lab.answer ? "correct" : "incorrect"}`}><span>{labChoice === currentMission.lab.answer ? <Check /> : <RefreshCw />}</span><div><strong>{labChoice === currentMission.lab.answer ? "Bằng chứng khớp" : "Một thử nghiệm hữu ích"}</strong><p>{labChoice === currentMission.lab.answer ? currentMission.lab.explanation : "Đọc lại dữ kiện và thử một phương án khác. Chưa cần xem lời giải."}</p></div></div>}<div className="stage-actions"><Button variant="outline" onClick={() => setLabChecked(true)} disabled={!labChoice}>Kiểm tra bằng chứng</Button><Button onClick={() => goStage("strategies")} disabled={!labChecked || labChoice !== currentMission.lab.answer} className="primary-action small">So sánh nhiều cách <ArrowRight /></Button></div></section>}
      {stage === "strategies" && <section><div className="strategies-heading"><div><p className="eyebrow">Một bài toán · nhiều con đường</p><h2>Không có một cách tốt nhất cho mọi bài</h2></div><p>Đọc hai chiến lược và chọn cách hợp với dữ kiện hơn.</p></div><div className="strategy-grid">{currentMission.strategies.map((strategy, index) => <article key={strategy.name} className={index === 0 ? "strategy-a" : "strategy-b"}><span>Cách {index + 1}</span><h3>{strategy.name}</h3><p>{strategy.when}</p><ol>{strategy.steps.map((step, stepIndex) => <li key={step}><strong>{stepIndex + 1}</strong>{step}</li>)}</ol></article>)}</div><div className="strategy-bridge"><Brain /><div><strong>Câu hỏi chọn chiến lược</strong><p>Với bài sắp tới, con sẽ bắt đầu bằng cách nào? Vì sao?</p></div><Button onClick={() => goStage("practice")} className="primary-action small">Tự mình thử <ArrowRight /></Button></div></section>}
      {stage === "practice" && <section className="deep-card practice-deep"><div className="practice-header"><div><p className="eyebrow">Luyện sâu · không lộ đáp án khi sai</p><h1>{currentMission.title}</h1></div><span>Bài {practiceIndex + 1}/{currentMission.deepPractice.length}</span></div><Progress value={((practiceIndex + (currentPracticeCorrect ? 1 : 0)) / currentMission.deepPractice.length) * 100} className="diagnostic-progress" /><div className="practice-topline"><div className="practice-number">{practiceIndex + 1}</div>{currentPractice.challengeTag && <span className="challenge-tag">{currentPractice.challengeTag}</span>}<span className="hint-depth-label">Gợi ý {hintDepths[practiceIndex]}/3</span></div><h2>{currentPractice.prompt}</h2><SpeakButton text={currentPractice.prompt} />{renderAnswerInput(currentPractice, practiceAnswer, setPracticeAnswer, practiceChecked)}{hintDepths[practiceIndex] > 0 && !currentPracticeCorrect && <div className="hint-box"><Lightbulb /><div><strong>Gợi ý tầng {hintDepths[practiceIndex]}</strong><p>{currentPractice.hints[hintDepths[practiceIndex] - 1].split(":").slice(1).join(":")}</p></div></div>}{practiceChecked && <div className={`feedback ${currentPracticeCorrect ? "correct" : "incorrect"}`}><span>{currentPracticeCorrect ? <Check /> : <RefreshCw />}</span><div><strong>{currentPracticeCorrect ? "Ý tưởng đứng vững" : "Chưa khớp—đừng bỏ cuộc"}</strong><p>{currentPracticeCorrect ? currentPractice.explanation : currentPractice.misconception}</p></div></div>}<div className="practice-actions">{!currentPracticeCorrect && <Button variant="outline" onClick={() => setHintDepths((depths) => depths.map((depth, index) => index === practiceIndex ? Math.min(3, depth + 1) : depth))} disabled={hintDepths[practiceIndex] === 3}><Lightbulb /> {hintDepths[practiceIndex] === 0 ? "Mở gợi ý tầng 1" : hintDepths[practiceIndex] === 3 ? "Đã mở đủ 3 tầng" : `Mở gợi ý tầng ${hintDepths[practiceIndex] + 1}`}</Button>}{practiceChecked && !currentPracticeCorrect ? <Button onClick={() => { setPracticeAnswer(""); setPracticeChecked(false); }}>Sửa cách làm</Button> : currentPracticeCorrect ? <Button onClick={nextPractice} className="primary-action small">{practiceIndex === currentMission.deepPractice.length - 1 ? "Câu chuyển giao" : "Bài tiếp theo"} <ArrowRight /></Button> : <Button onClick={checkPractice} disabled={!practiceAnswer}>Kiểm tra</Button>}</div></section>}
      {stage === "transfer" && <section className="deep-card transfer-card"><p className="eyebrow">Câu chuyển giao · tình huống mới</p><h2>{currentMission.transfer.prompt}</h2><SpeakButton text={currentMission.transfer.prompt} /><p className="stage-lead">Hãy mang ý tưởng cốt lõi sang bài mới.</p>{renderAnswerInput(currentMission.transfer, transferAnswer, setTransferAnswer, transferChecked)}{transferHintDepth > 0 && !transferCorrect && <div className="hint-box"><Lightbulb /><div><strong>Gợi ý tầng {transferHintDepth}</strong><p>{currentMission.transfer.hints[transferHintDepth - 1].split(":").slice(1).join(":")}</p></div></div>}{transferChecked && <div className={`feedback ${transferCorrect ? "correct" : "incorrect"}`}><span>{transferCorrect ? <Check /> : <RefreshCw />}</span><div><strong>{transferCorrect ? "Con đã chuyển được ý tưởng" : "Bài mới đang lộ một khoảng trống"}</strong><p>{transferCorrect ? currentMission.transfer.explanation : currentMission.transfer.misconception}</p></div></div>}<div className="practice-actions">{!transferCorrect && <Button variant="outline" onClick={() => setTransferHintDepth((depth) => Math.min(3, depth + 1))} disabled={transferHintDepth === 3}><Lightbulb /> Gợi ý {transferHintDepth}/3</Button>}{transferChecked && !transferCorrect ? <Button onClick={() => { setTransferAnswer(""); setTransferChecked(false); }}>Thử lại</Button> : transferCorrect ? <Button onClick={() => goStage("reflect")} className="primary-action small">Nói ra điều con hiểu <ArrowRight /></Button> : <Button onClick={checkTransfer} disabled={!transferAnswer}>Kiểm tra chuyển giao</Button>}</div></section>}
      {stage === "reflect" && <section className="deep-card reflect-card"><p className="eyebrow">Phản tư · biến cách làm thành hiểu biết</p><h2>{currentMission.reflectionStems[reflectionPrompt]}</h2><p className="stage-lead">Con có thể nói để người lớn ghi lại. Một câu thật có giá trị hơn một đoạn văn “đẹp”.</p><div className="success-checklist"><strong>Ba dấu hiệu con đã thật sự hiểu</strong><ul>{currentMission.successCriteria.map((criterion) => <li key={criterion}><CheckCircle2 />{criterion}</li>)}</ul></div><div className="reflection-prompts">{currentMission.reflectionStems.map((prompt, index) => <button type="button" key={prompt} className={reflectionPrompt === index ? "active" : ""} onClick={() => setReflectionPrompt(index)}>Câu hỏi {index + 1}</button>)}</div><Textarea value={reflectionDraft} onChange={(event) => setReflectionDraft(event.target.value)} placeholder="Con nghĩ… / Lúc đầu con… / Cách khác là…" /><div className="reflection-quality"><ShieldCheck /><p>Không chấm chính tả. Lời phản tư giúp phụ huynh thấy sự thay đổi trong cách nghĩ.</p></div><div className="stage-actions"><Button onClick={completeMission} disabled={reflectionDraft.trim().length < 5} className="primary-action small">Hoàn thành nhiệm vụ <Medal /></Button></div></section>}
    </div></main>;
  }

  return <main className="app-shell min-h-screen"><div className="page-wrap"><AppHeader onHome={goDashboard} sparkPoints={sparkPoints} completedMissions={completedMissions} /><section className="dashboard-hero"><div className="hero-copy"><p className="eyebrow">Câu lạc bộ toán sau giờ học · 15–20 phút/buổi</p><h1>{learning.diagnostic ? `Hôm nay, ${learning.nickname} chọn một cuộc phiêu lưu` : "Mỗi bài toán là một cuộc phiêu lưu"}</h1><p>{learning.diagnostic ? "Chỉ ba lựa chọn để con không bị ngợp: một nhiệm vụ hệ thống đề xuất, một nhiệm vụ con tự chọn và một lần ôn đúng lúc." : "Không học lại bài trên lớp. Con dự đoán, thử, sửa và giải thích như một nhà toán học nhỏ."}</p><div className="hero-actions">{learning.diagnostic ? <Button onClick={() => startMission(recommendedMission)} className="primary-action">Bắt đầu lựa chọn đề xuất <ArrowRight /></Button> : <Button onClick={() => setView("diagnostic-intro")} className="primary-action">Khám phá năng lực <ClipboardCheck /></Button>}</div></div><aside className="daily-puzzle"><div className="puzzle-heading"><span>🦝</span><div><p className="eyebrow">Câu đố 60 ngày</p><strong>Ba mươi giây để tò mò</strong></div></div><h2>{todayPuzzle.prompt}<small>{todayPuzzle.note}</small></h2><SpeakButton text={todayPuzzle.prompt} dark /><RadioGroup value={dailyChoice} onValueChange={(value) => { setDailyChoice(value); setDailyChecked(false); }} className="puzzle-options">{todayPuzzle.options.map((option) => <label key={option}><RadioGroupItem value={option} /><span>{option}</span></label>)}</RadioGroup>{dailyChecked && <div className={`puzzle-feedback ${dailyChoice === todayPuzzle.answer ? "success" : "try"}`}>{dailyChoice === todayPuzzle.answer ? todayPuzzle.explanation : todayPuzzle.hint}</div>}<Button variant="outline" onClick={() => setDailyChecked(true)} disabled={!dailyChoice}>Mở khóa câu đố</Button></aside></section>
    {learning.diagnostic && <section className="today-section"><div className="panel-heading"><div><p className="eyebrow">Ba lựa chọn hôm nay</p><h2>Ít lựa chọn hơn, chủ động hơn</h2></div><span>Hệ thống giải thích lý do đề xuất</span></div><div className="today-grid"><button type="button" className="today-card recommended" onClick={() => startMission(recommendedMission)}><span className="today-badge"><Brain /> Hệ thống đề xuất</span><strong>{recommendedMission.title}</strong><p>{dueMissions[0] ? "Đến lịch ôn: trí nhớ cần được gọi lại trước khi học mới." : `Vừa sức theo đầu vào và mức tự lực · chặng ${recommendedMission.sequence}/6.`}</p><em>Bắt đầu <ArrowRight /></em></button><button type="button" className="today-card choice" onClick={() => startMission(choiceMission)}><span className="today-badge"><Sparkles /> Con tự chọn</span><strong>{choiceMission.title}</strong><p>Một miền khác đang mở. Quyền lựa chọn giúp con sở hữu hành trình.</p><em>Khám phá <ArrowRight /></em></button>{dueMissions[0] ? <button type="button" className="today-card review" onClick={() => startMission(dueMissions[0])}><span className="today-badge"><RefreshCw /> Ôn đúng lúc</span><strong>{dueMissions[0].title}</strong><p>Ôn ngắn để kiểm tra ý tưởng còn đứng vững sau thời gian nghỉ.</p><em>Gọi lại ý tưởng <ArrowRight /></em></button> : <div className="today-card review"><span className="today-badge"><CheckCircle2 /> Chưa có bài đến hạn</span><strong>Khoảng nghỉ cũng là học</strong><p>Câu đố 60 ngày phía trên là đủ cho lựa chọn thứ ba hôm nay.</p><em>Không cần học thêm</em></div>}</div></section>}
    <section className="learning-cycle deep-cycle"><p className="eyebrow">Chuẩn chung cho mọi nhiệm vụ</p>{["Thử trước", "Tương tác", "Hai cách", "Gợi ý 3 tầng", "Chuyển giao", "Phản tư"].map((label, index) => <div key={label}><span>{index + 1}</span><strong>{label}</strong><small>{["Ghim dự đoán", "Tạo bằng chứng", "Chọn chiến lược", "Không lộ đáp án sớm", "Dùng trong bài mới", "Nói ra điều hiểu"][index]}</small></div>)}</section>
    <section className="dashboard-layout"><div className="curriculum-panel"><div className="panel-heading"><div><p className="eyebrow">Bản đồ phiêu lưu thích ứng</p><h2>36 nhiệm vụ · 6 miền tư duy</h2></div><Button variant="outline" onClick={() => setShowFullMap((value) => !value)}>{showFullMap ? "Thu gọn bản đồ" : "Xem đủ 36 nhiệm vụ"} <Map /></Button></div>{!showFullMap ? <div className="map-summary">{DOMAINS.map((domain) => { const completed = DEEP_MISSION_LIBRARY[domain.id].filter((mission) => learning.missionRecords[mission.id]).length; const Icon = DOMAIN_ICONS[domain.id]; return <div key={domain.id}><span style={{ background: domain.soft, color: domain.color }}><Icon /></span><strong>{domain.short}</strong><Progress value={(completed / 6) * 100} /><small>{completed}/6 nhiệm vụ</small></div>; })}</div> : <div className="domain-map">{DOMAINS.map((domain) => { const Icon = DOMAIN_ICONS[domain.id]; return <section key={domain.id} className="domain-track"><div className="domain-track-heading"><span style={{ background: domain.soft, color: domain.color }}><Icon /></span><div><strong>{domain.name}</strong><small>{domain.description}</small></div></div><div className="track-missions">{DEEP_MISSION_LIBRARY[domain.id].map((mission) => { const record = learning.missionRecords[mission.id]; const unlocked = Boolean(learning.diagnostic) && missionIsUnlocked(mission); const isRecommended = learning.diagnostic && mission.id === recommendedMission.id; return <button key={mission.id} type="button" onClick={() => learning.diagnostic ? (unlocked ? startMission(mission) : undefined) : setView("diagnostic-intro")} className={`${record ? "complete" : ""} ${isRecommended ? "recommended" : ""} ${learning.diagnostic && !unlocked ? "locked" : ""}`}><span>{mission.sequence}</span><div><strong>{mission.title}</strong><small>{record ? `${record.autonomy}% tự lực · gợi ý ${record.maxHintDepth}/3` : unlocked ? "Sẵn sàng" : "Chưa mở"}</small></div>{record ? <CheckCircle2 /> : !unlocked ? <LockKeyhole /> : <Flag />}</button>; })}</div></section>; })}</div>}</div>
      <aside className="parent-panel"><p className="eyebrow">Góc đồng hành · hồ sơ v{CURRICULUM_VERSION}</p><h2>Dữ liệu để hiểu cách học, không chỉ đếm điểm</h2><div className="ipad-install-tip"><Tablet /><p><strong>Dùng như ứng dụng trên iPad</strong><span>Mở bằng Safari → Chia sẻ → Thêm vào Màn hình chính.</span></p></div><div className="offline-update-box"><div className="offline-status"><span className={online ? "online" : "offline"}>{online ? <CheckCircle2 /> : <WifiOff />}{online ? "Đang có mạng" : "Đang ngoại tuyến"}</span><span className={offlineReady ? "ready" : "pending"}>{offlineReady ? <ShieldCheck /> : <RefreshCw />}{offlineReady ? "Đã sẵn sàng học ngoại tuyến" : "Đang chuẩn bị dữ liệu ngoại tuyến"}</span></div><div className="release-heading"><CloudDownload /><p><strong>Nội dung {CONTENT_RELEASE.version}</strong><span>Chỉ nhận bản phát hành đã kiểm tra và cần phụ huynh chủ động xác nhận.</span></p></div><Button variant="outline" onClick={checkForContentUpdate} disabled={updateState === "checking" || updateState === "installing"} className="w-full"><RefreshCw /> {updateState === "checking" ? "Đang kiểm tra…" : "Kiểm tra nội dung mới"}</Button>{updateState === "current" && <small role="status" className="update-message success">Đây là bản nội dung mới nhất đã được duyệt.</small>}{updateState === "offline" && <small role="status" className="update-message">Không có mạng. Con vẫn học bằng nội dung đã lưu trên iPad.</small>}{updateState === "rejected" && <small role="alert" className="update-message warning">Bản mới chưa đủ trạng thái kiểm duyệt nên không được cài.</small>}{updateState === "error" && <small role="alert" className="update-message warning">Chưa kiểm tra được bản mới. Nội dung hiện tại vẫn được giữ nguyên.</small>}{updateState === "available" && availableRelease && <div className="update-approval" role="status"><strong>Có bản {availableRelease.version}</strong><ul>{availableRelease.notes.slice(0, 3).map((note) => <li key={note}>{note}</li>)}</ul><p>Phụ huynh xem nội dung trên rồi mới cho phép tải.</p><Button onClick={installContentUpdate} className="primary-action w-full"><CloudDownload /> Phụ huynh đồng ý cập nhật</Button></div>}{updateState === "installing" && <small role="status" className="update-message success">Đang cài bản đã duyệt và sẽ mở lại ứng dụng…</small>}</div>{learning.diagnostic ? <><label className="nickname-field"><UserRound /><span>Tên gọi của con</span><Input value={learning.nickname} maxLength={30} onChange={(event) => setLearning((profile) => ({ ...profile, nickname: event.target.value }))} /></label><div className="parent-score"><strong>{sparkPoints}</strong><span>tia sáng tò mò · {learning.discoveryDays.length} ngày khám phá</span></div><div className="adaptive-stats"><div><strong>{completedMissions}</strong><span>Nhiệm vụ / 36</span></div><div><strong>{totalHints}</strong><span>Bài đã dùng gợi ý</span></div><div><strong>{totalRetries}</strong><span>Lần thử lại</span></div><div><strong>{reflectionCount}</strong><span>Phản tư đã ghi</span></div></div><div className="adaptive-summary"><Brain /><div><strong>{dueMissions.length ? `${dueMissions.length} nhiệm vụ đến lịch ôn` : "Lịch ôn đang được giãn theo mức tự lực"}</strong><p>Đề xuất dùng đúng lần đầu, độ sâu gợi ý, chuyển giao và thời gian.</p></div></div><div className="parent-tip"><Lightbulb /><p>Hỏi con: <strong>“Bằng chứng nào làm con đổi ý?”</strong> thay vì “đúng bao nhiêu?”.</p></div><div className="backup-box"><div><ShieldCheck /><p><strong>Sao lưu hồ sơ</strong><span>Dữ liệu lưu trên thiết bị. Tải JSON để chuyển máy hoặc phòng khi trình duyệt bị xóa.</span></p></div><div><Button variant="outline" onClick={exportBackup}><Download /> Sao lưu</Button><Button variant="outline" onClick={() => importRef.current?.click()}><FileUp /> Khôi phục</Button><input ref={importRef} type="file" accept="application/json,.json" hidden onChange={(event) => importBackup(event.target.files?.[0])} /></div>{backupStatus && <small role="status">{backupStatus}</small>}</div><Button variant="outline" onClick={() => setView("diagnostic-intro")} className="w-full"><RefreshCw /> Khám phá lại năng lực</Button></> : <><div className="empty-diagnostic"><ClipboardCheck /><strong>Chưa có bản đồ tư duy</strong><p>Bài đầu vào giúp chọn đúng độ khó và mở hành trình 36 nhiệm vụ.</p></div><Button onClick={() => setView("diagnostic-intro")} className="primary-action w-full">Tạo hành trình cho con</Button></>}</aside></section>
  </div></main>;
}

function TileRectangle({ value }: { value: string }) {
  const [rows, columns] = value.split("x").map(Number);
  return <span className="tile-rectangle" style={{ "--rows": rows, "--columns": columns } as React.CSSProperties} aria-label={`Hình ${rows} hàng, ${columns} cột`}>{Array.from({ length: rows * columns }, (_, index) => <i key={index} />)}</span>;
}
function DataChart({ question, color }: { question: DiagnosticQuestion; color: string }) {
  if (!question.context) return null;
  const max = Math.max(...question.context.values.map((item) => item.value));
  return <div className="data-chart" role="img" aria-label={`${question.context.label}: ${question.context.values.map((item) => `${item.name} ${item.value}`).join(", ")}`}>{question.context.values.map((item) => <div key={item.name}><span>{item.value}</span><i style={{ height: `${(item.value / max) * 100}%`, background: color }} /><small>{item.name}</small></div>)}</div>;
}
