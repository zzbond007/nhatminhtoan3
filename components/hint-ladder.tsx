"use client";

// Module 4 · Nút mở gợi ý 3 tầng có khoá chống bấm liên tục.
// Sau khi mở một tầng, nút mở tầng kế tiếp bị khoá HINT_LOCK_SECONDS giây và hiện vòng đếm ngược,
// để con thật sự đọc – nghĩ với gợi ý vừa nhận trước khi xin thêm.
// Dùng `key` theo câu hỏi ở nơi gọi để bộ đếm tự làm mới khi sang câu mới.

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HINT_TIER_LABELS, HINT_TIERS, hintBody, hintLockMs } from "@/app/hint-scaffold";

export function HintLadderButton({ depth, onOpen }: { depth: number; onOpen: () => void }) {
  const [lock, setLock] = useState<{ until: number; total: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Mỗi lần tầng gợi ý tăng lên → bắt đầu khoá tầng kế tiếp.
  useEffect(() => {
    const ms = depth > 0 && depth < HINT_TIERS ? hintLockMs(depth) : 0;
    const task = window.setTimeout(() => {
      setLock(ms ? { until: Date.now() + ms, total: ms } : null);
      setNow(Date.now());
    }, 0);
    return () => window.clearTimeout(task);
  }, [depth]);
  useEffect(() => {
    if (!lock) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= lock.until) setLock(null);
    }, 200);
    return () => window.clearInterval(timer);
  }, [lock]);

  const remainingMs = lock ? Math.max(0, lock.until - now) : 0;
  const seconds = Math.ceil(remainingMs / 1000);
  const locked = remainingMs > 0;
  const maxed = depth >= HINT_TIERS;
  const ratio = lock ? remainingMs / lock.total : 0;
  const circumference = 2 * Math.PI * 11;

  return (
    <Button type="button" variant="outline" className={`hint-ladder-button ${locked ? "is-locked" : ""}`} onClick={onOpen} disabled={maxed || locked} aria-live="polite">
      {locked
        ? <span className="hint-countdown" aria-label={`Chờ ${seconds} giây để mở gợi ý tiếp theo`}>
            <svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" className="track" /><circle cx="14" cy="14" r="11" className="ring" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - ratio)} /></svg>
            <b>{seconds}</b>
          </span>
        : <Lightbulb />}
      {maxed ? "Đã mở đủ 3 tầng" : locked ? `Suy nghĩ thêm với gợi ý ${depth} nhé…` : `Gợi ý ${depth + 1} · ${HINT_TIER_LABELS[depth]}`}
    </Button>
  );
}

/** Hộp gợi ý hiển thị các tầng đã mở (tầng mới nhất ở cuối, nhấn mạnh). */
export function HintStack({ hints, depth }: { hints: readonly string[]; depth: number }) {
  if (depth <= 0) return null;
  return (
    <div className="hint-stack tiered">
      {hints.slice(0, depth).map((hint, index) => (
        <div className={`hint-box tier-${index + 1} ${index === depth - 1 ? "latest" : ""}`} key={index}>
          <Lightbulb />
          <div><strong>Gợi ý {index + 1} · {HINT_TIER_LABELS[index]}</strong><p>{hintBody(hint)}</p></div>
        </div>
      ))}
    </div>
  );
}
