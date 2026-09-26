"use client";

// Module 5 · "Phòng Luyện Xoắn Ốc — Biến thể": ôn các dạng bài đến hạn (sai từ ≥ 24 giờ trước)
// bằng đề cùng cấu trúc nhưng số liệu mới. Sai 2 lần liên tiếp ở một câu → câu được thay bằng biến thể
// hạ bậc (số nhỏ hơn) và sơ đồ đoạn thẳng được mở sẵn.

import { useState } from "react";
import { ArrowRight, Check, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NumpadAnswer } from "@/components/virtual-numpad";
import { KaraokeReader } from "@/components/karaoke-reader";
import { HintLadderButton, HintStack } from "@/components/hint-ladder";
import { BarModelVisual } from "@/components/bar-model";
import { StudyToolbar } from "@/components/study-toolbar";
import { AUTO_SCAFFOLD_AFTER_WRONG, sparkRewardFor, type SparkReward } from "@/app/hint-scaffold";
import { generateVariant, VARIANT_TEMPLATES, type SpiralReviewItem } from "@/app/spiral-engine";

export type SpiralAttempt = { item: SpiralReviewItem; correct: boolean; hintDepth: number; reward: SparkReward | null };

type Props = {
  items: SpiralReviewItem[];
  onAttempt: (attempt: SpiralAttempt) => void;
  onExit: () => void;
  focusOn: boolean;
  onToggleFocus: () => void;
};

export function SpiralReviewRoom({ items: initialItems, onAttempt, onExit, focusOn, onToggleFocus }: Props) {
  const [items, setItems] = useState(initialItems);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [hintDepth, setHintDepth] = useState(0);
  const [firstTry, setFirstTry] = useState<boolean | null>(null);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [reward, setReward] = useState<SparkReward | null>(null);
  const [lowered, setLowered] = useState(false);
  const [solved, setSolved] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const item = items[index];
  const question = item?.question;
  const correct = Boolean(question && checked && answer === question.answer);
  const showBar = Boolean(question?.bar && (question.level === "lowered" || hintDepth >= 2));

  if (finished || !item || !question) {
    const selfSolved = solved.filter(Boolean).length;
    return (
      <section className="spiral-room-done deep-card">
        <p className="eyebrow">Phòng Luyện Xoắn Ốc · hoàn thành</p>
        <h1>Con đã hoàn thành {items.length} câu ôn với số liệu mới!</h1>
        <p>{selfSolved} câu con tự làm được ngay lần đầu. Dạng nào còn vướng sẽ quay lại sau 24 giờ—đó là cách bộ não ghi nhớ lâu.</p>
        <Button onClick={onExit} className="primary-action small">Về phòng luyện <ArrowRight /></Button>
      </section>
    );
  }

  function check() {
    if (!answer || checked || !question) return;
    const isCorrect = answer === question.answer;
    const isFirst = firstTry === null;
    setChecked(true);
    if (isFirst) setFirstTry(isCorrect);
    if (isCorrect) {
      const earned = sparkRewardFor(hintDepth, isFirst);
      setReward(earned);
      setWrongStreak(0);
      setSolved((values) => { const next = [...values]; next[index] = isFirst && hintDepth === 0; return next; });
      onAttempt({ item, correct: true, hintDepth, reward: earned });
      return;
    }
    const streak = wrongStreak + 1;
    setWrongStreak(streak);
    onAttempt({ item, correct: false, hintDepth, reward: null });
    // Sai 2 lần liên tiếp → hạ bậc: đổi sang biến thể số nhỏ hơn, mở sẵn sơ đồ trực quan.
    if (streak >= AUTO_SCAFFOLD_AFTER_WRONG && question.level !== "lowered") {
      const template = VARIANT_TEMPLATES.find((entry) => entry.id === question.templateId);
      if (template) {
        const easier = generateVariant(template, (Number(question.id.split("-").at(-1)) || 1) + 1, "lowered");
        setItems((list) => list.map((entry, position) => position === index ? { ...entry, question: easier } : entry));
        setAnswer(""); setChecked(false); setWrongStreak(0); setLowered(true);
        setHintDepth((depth) => Math.max(depth, 2));
      }
    }
  }
  function next() {
    if (index === items.length - 1) { setFinished(true); return; }
    setIndex((value) => value + 1);
    setAnswer(""); setChecked(false); setHintDepth(0); setFirstTry(null); setWrongStreak(0); setReward(null); setLowered(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <section className="skill-lab-progress">
        <div><p className="eyebrow">Phòng Luyện Xoắn Ốc · biến thể số liệu mới</p><strong>Câu {index + 1}/{items.length}</strong></div>
        <span>🌀 {question.skillTag}</span>
      </section>
      <Progress value={((index + (correct ? 1 : 0)) / items.length) * 100} className="diagnostic-progress" />
      <section className="skill-lab-card spiral-card">
        <div className="question-meta"><span className="spiral-emoji">🌀</span><div><small>Ôn lại dạng</small><strong>{question.skillTag}</strong></div><em>Gợi ý {hintDepth}/3</em></div>
        {lowered && <p className="scaffold-note"><Sparkles /> Mình đổi sang số nhỏ hơn và mở sẵn sơ đồ để con nhìn rõ cấu trúc nhé.</p>}
        <KaraokeReader key={question.id} text={question.prompt} as="h1" />
        {showBar && question.bar && <BarModelVisual model={question.bar} />}
        <NumpadAnswer value={answer} onChange={setAnswer} onSubmit={check} disabled={checked} />
        {!correct && <HintStack hints={question.hints} depth={hintDepth} />}
        {checked && <div className={`feedback ${correct ? "correct" : "incorrect"}`}><span>{correct ? <Check /> : <RefreshCw />}</span><div><strong>{correct ? "Đúng rồi—cấu trúc bài vẫn thế, chỉ số liệu đổi thôi!" : "Chưa khớp—thử nhìn lại cấu trúc bài"}</strong><p>{correct ? question.explanation : question.misconception}</p>{correct && reward && <p className="spark-earned">{reward.label}</p>}</div></div>}
        <div className="practice-actions">
          {!correct && <HintLadderButton key={question.id} depth={hintDepth} onOpen={() => setHintDepth((depth) => Math.min(3, depth + 1))} />}
          {checked && !correct ? <Button onClick={() => { setAnswer(""); setChecked(false); }}>Sửa cách làm</Button>
            : correct ? <Button onClick={next} className="primary-action small">{index === items.length - 1 ? "Xem kết quả" : "Câu tiếp theo"} <ArrowRight /></Button>
            : <Button onClick={check} disabled={!answer}>Kiểm tra</Button>}
        </div>
      </section>
      <StudyToolbar focusOn={focusOn} onToggleFocus={onToggleFocus} resetKey={question.id} />
    </>
  );
}
