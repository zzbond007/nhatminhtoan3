"use client";

// Module 6.2 · Cổng Phụ Huynh ở Buổi 5 (bài toán mở).
// Nút "Dành cho Ba Mẹ" → cổng khoá bằng một phép nhân (ví dụ 8 × 7 = ?). Mở khoá xong hiển thị:
//   • Mục tiêu giáo dục của tuần;
//   • 3 câu hỏi Socratic để trò chuyện cùng con (không đưa đáp án máy móc);
//   • Bản tóm tắt bài làm 7 ngày qua + nút In / Lưu PDF (dùng hộp thoại in của trình duyệt → "Lưu thành PDF").

import { useEffect, useState } from "react";
import { KeyRound, LockKeyhole, Printer, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NumpadAnswer } from "@/components/virtual-numpad";
import { checkGateAnswer, createGateChallenge, GATE_LOCK_MS, GATE_MAX_TRIES, type GateChallenge } from "@/app/parent-gate";

export type WeeklyReportMission = { title: string; date: string; firstScore: number; autonomy: number; hintDepth: number; reflection: string; difficulty: string };
export type WeeklyReport = {
  nickname: string;
  weekNumber: number;
  weekTitle: string;
  bigQuestion: string;
  goal: string;
  parentLookFor: string;
  socratic: [string, string, string];
  avoid: string[];
  missions: WeeklyReportMission[];
  skillLab: { date: string; correctFirst: number; total: number }[];
  studyDays: number;
  sparkBonus: number;
  selfReliantBadges: number;
  reviewSkills: string[];
};

const DIFFICULTY_LABEL: Record<string, string> = { support: "Gỡ nút", core: "Vừa sức", stretch: "Bứt phá" };

export function ParentPortal({ report }: { report: WeeklyReport }) {
  const [stage, setStage] = useState<"closed" | "gate" | "open">("closed");
  const [challenge, setChallenge] = useState<GateChallenge>(() => createGateChallenge(() => 0));
  const [input, setInput] = useState("");
  const [tries, setTries] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!lockedUntil) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= lockedUntil) { setLockedUntil(0); setTries(0); setMessage(""); }
    }, 500);
    return () => window.clearInterval(timer);
  }, [lockedUntil]);

  // In chỉ phần báo cáo: gắn lớp lên <html> trong lúc in rồi gỡ sau khi in xong.
  useEffect(() => {
    const cleanup = () => document.documentElement.classList.remove("print-parent-report");
    window.addEventListener("afterprint", cleanup);
    return () => { window.removeEventListener("afterprint", cleanup); cleanup(); };
  }, []);

  function openGate() {
    setChallenge(createGateChallenge());
    setInput(""); setMessage(""); setStage("gate");
  }
  function submitGate() {
    if (lockedUntil) return;
    if (checkGateAnswer(challenge, input)) { setStage("open"); setTries(0); return; }
    const used = tries + 1;
    setTries(used); setInput("");
    if (used >= GATE_MAX_TRIES) {
      const until = Date.now() + GATE_LOCK_MS;
      setLockedUntil(until); setNow(Date.now());
      setMessage("Cổng tạm khoá 30 giây. Ba mẹ quay lại sau nhé.");
    } else {
      setChallenge(createGateChallenge());
      setMessage(`Chưa đúng. Còn ${GATE_MAX_TRIES - used} lần thử.`);
    }
  }
  function printReport() {
    document.documentElement.classList.add("print-parent-report");
    window.print();
  }

  const lockSeconds = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;

  return (
    <>
      <button type="button" className="parent-portal-trigger" onClick={openGate}><ShieldCheck /> Dành cho Ba Mẹ</button>

      {stage === "gate" && (
        <div className="parent-gate-backdrop" role="dialog" aria-modal="true" aria-labelledby="parent-gate-title">
          <div className="parent-gate">
            <button type="button" className="parent-gate-close" onClick={() => setStage("closed")} aria-label="Đóng"><X /></button>
            <KeyRound className="parent-gate-icon" />
            <h2 id="parent-gate-title">Khu vực dành cho Ba Mẹ</h2>
            <p>Để mở, ba mẹ hãy trả lời:</p>
            <p className="parent-gate-question">{challenge.prompt}</p>
            <NumpadAnswer value={input} onChange={setInput} onSubmit={submitGate} disabled={Boolean(lockedUntil)} label="Kết quả" maxDigits={3} />
            {message && <p className="parent-gate-message" aria-live="polite">{lockedUntil ? <><LockKeyhole /> {message} ({lockSeconds}s)</> : message}</p>}
          </div>
        </div>
      )}

      {stage === "open" && (
        <section className="parent-report" aria-labelledby="parent-report-title">
          <header className="parent-report-head">
            <div>
              <p className="eyebrow">Dành cho Ba Mẹ · Tuần {report.weekNumber}</p>
              <h2 id="parent-report-title">{report.weekTitle}</h2>
              <p className="parent-report-meta">Hồ sơ: {report.nickname} · In lúc {new Date().toLocaleDateString("vi-VN")}</p>
            </div>
            <div className="parent-report-actions">
              <Button variant="outline" onClick={printReport}><Printer /> In / Lưu PDF</Button>
              <Button variant="ghost" onClick={() => setStage("closed")} aria-label="Đóng khu vực phụ huynh"><X /></Button>
            </div>
          </header>

          <div className="parent-report-grid">
            <article>
              <h3>🎯 Mục tiêu giáo dục của tuần</h3>
              <p><strong>Câu hỏi lớn:</strong> {report.bigQuestion}</p>
              <p><strong>Con sẽ học được:</strong> {report.goal}</p>
              <p><strong>Ba mẹ quan sát:</strong> {report.parentLookFor}</p>
            </article>
            <article>
              <h3>💬 3 câu hỏi gợi mở để trò chuyện cùng con</h3>
              <ol className="socratic-list">{report.socratic.map((line) => <li key={line}>{line}</li>)}</ol>
              <p className="parent-report-note">Hãy chờ con nói hết, rồi hỏi tiếp “Làm sao con biết?”. Không cần đưa đáp án.</p>
              <ul className="parent-avoid">{report.avoid.map((line) => <li key={line}>{line}</li>)}</ul>
            </article>
          </div>

          <article className="parent-week-summary">
            <h3>📒 Tóm tắt bài làm 7 ngày qua</h3>
            <div className="parent-stats">
              <span><strong>{report.studyDays}</strong> ngày học</span>
              <span><strong>{report.missions.length}</strong> buổi nhiệm vụ</span>
              <span><strong>{report.selfReliantBadges}</strong> huy hiệu Tự lực</span>
              <span><strong>+{report.sparkBonus}</strong> tia sáng thưởng</span>
            </div>
            {report.missions.length
              ? <table className="parent-table">
                  <thead><tr><th>Ngày</th><th>Nhiệm vụ</th><th>Dải</th><th>Đúng lần đầu</th><th>Tự lực</th><th>Gợi ý TB</th></tr></thead>
                  <tbody>{report.missions.map((mission, index) => <tr key={index}><td>{new Date(mission.date).toLocaleDateString("vi-VN")}</td><td>{mission.title}{mission.reflection && <small>“{mission.reflection}”</small>}</td><td>{DIFFICULTY_LABEL[mission.difficulty] ?? "Vừa sức"}</td><td>{mission.firstScore}%</td><td>{mission.autonomy}%</td><td>{mission.hintDepth.toFixed(1)}/3</td></tr>)}</tbody>
                </table>
              : <p>Tuần này con chưa hoàn thành nhiệm vụ nào—một buổi 15 phút là đủ để bắt đầu lại.</p>}
            {report.skillLab.length > 0 && <p><strong>Phòng luyện:</strong> {report.skillLab.map((session) => `${new Date(session.date).toLocaleDateString("vi-VN")}: ${session.correctFirst}/${session.total} đúng lần đầu`).join(" · ")}</p>}
            {report.reviewSkills.length > 0 && <p><strong>Dạng bài đang được ôn xoắn ốc:</strong> {report.reviewSkills.join(", ")}.</p>}
          </article>
        </section>
      )}
    </>
  );
}
