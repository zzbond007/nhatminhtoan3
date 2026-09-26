"use client";

// Module 3 · Đề bài có giọng đọc và tô sáng từng từ (karaoke).
// Mỗi từ được bọc <span class="word-token" id="{prefix}w_{index}">; từ đang đọc nhận class .active-highlight.
// Nút: Nghe đọc đề ▶ · Tạm dừng ⏸ / Đọc tiếp ▶ · Đọc lại ↺.

import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { speakWithHighlight, speechSupported, tokenizeForKaraoke, type KaraokeSession, type SpeechState } from "@/app/speech-service";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  lang?: "vi-VN" | "en-US";
  label?: string;
  /** Tiền tố id để hai đoạn đọc trên cùng trang không trùng id (ví dụ đề tiếng Việt + tiếng Anh). */
  idPrefix?: string;
};

function enlargeText() {
  if (document.documentElement.dataset.largeTextOnSpeak !== "off") document.documentElement.classList.add("read-aloud-large");
}

export function KaraokeReader({ text, as: Tag = "h2", className, lang = "vi-VN", label = "Nghe đọc đề", idPrefix = "" }: Props) {
  const tokens = useMemo(() => tokenizeForKaraoke(text), [text]);
  const [active, setActive] = useState(-1);
  const [state, setState] = useState<SpeechState>("idle");
  const session = useRef<KaraokeSession | null>(null);

  // Đổi đề hoặc rời màn hình → dừng đọc để không đọc nhầm câu cũ.
  useEffect(() => () => { session.current?.stop(); session.current = null; }, [text]);

  function start() {
    enlargeText();
    if (!speechSupported()) return;
    session.current?.stop();
    session.current = speakWithHighlight(text, {
      lang,
      rate: lang === "en-US" ? 0.82 : 0.88,
      onWord: setActive,
      onState: setState,
    });
  }
  function togglePause() {
    if (!session.current) return;
    if (state === "paused") session.current.resume();
    else session.current.pause();
  }

  return (
    <div className="karaoke-reader">
      <Tag className={className} lang={lang === "en-US" ? "en" : undefined}>
        {tokens.map((token, position) => token.isWord
          ? <span key={position} id={`${idPrefix}w_${token.index}`} className={`word-token ${token.index === active ? "active-highlight" : ""}`}>{token.text}</span>
          : token.text)}
      </Tag>
      <div className="karaoke-controls">
        {state === "idle"
          ? <button type="button" className="karaoke-button primary" onClick={start} aria-label={label}><Volume2 /> {label}</button>
          : <>
              <button type="button" className="karaoke-button" onClick={togglePause} aria-label={state === "paused" ? "Đọc tiếp" : "Tạm dừng"}>
                {state === "paused" ? <><Play /> Đọc tiếp</> : <><Pause /> Tạm dừng</>}
              </button>
              <button type="button" className="karaoke-button" onClick={start} aria-label="Đọc lại từ đầu"><RotateCcw /> Đọc lại</button>
            </>}
      </div>
    </div>
  );
}
