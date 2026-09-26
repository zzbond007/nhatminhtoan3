// Module 3 · Dịch vụ đọc đề đồng bộ tô sáng (karaoke) dựa trên Web Speech API.
// - Tách đề thành các "từ" kèm vị trí ký tự để khớp với charIndex của sự kiện onboundary.
// - Safari iPad với một số giọng tiếng Việt KHÔNG phát onboundary: khi đó dịch vụ tự chuyển
//   sang tô sáng theo ước lượng thời gian (dựa trên số âm tiết và tốc độ đọc) để trẻ vẫn thấy chữ chạy.

export type WordToken = { index: number; text: string; start: number; end: number; isWord: boolean };

/** Tách văn bản thành token; khoảng trắng được giữ lại như token "không phải từ" để hiển thị đúng. */
export function tokenizeForKaraoke(text: string): WordToken[] {
  const source = text.normalize("NFC");
  const tokens: WordToken[] = [];
  const pattern = /\s+|[^\s]+/g;
  let match: RegExpExecArray | null;
  let wordIndex = 0;
  while ((match = pattern.exec(source))) {
    const isWord = !/^\s+$/.test(match[0]);
    tokens.push({ index: isWord ? wordIndex++ : -1, text: match[0], start: match.index, end: match.index + match[0].length, isWord });
  }
  return tokens;
}

/** Tìm chỉ số từ tương ứng với vị trí ký tự mà trình duyệt báo trong onboundary. */
export function wordIndexAtChar(tokens: WordToken[], charIndex: number): number {
  let found = -1;
  for (const token of tokens) {
    if (!token.isWord) continue;
    if (token.start > charIndex) break;
    found = token.index;
    if (charIndex < token.end) break;
  }
  return found;
}

/** Ước lượng thời điểm (ms) bắt đầu đọc mỗi từ khi không có onboundary. Tiếng Việt ~ 1 âm tiết/từ. */
export function estimateWordTimeline(tokens: WordToken[], rate: number): number[] {
  const msPerWord = 380 / Math.max(0.5, rate);
  const times: number[] = [];
  let clock = 0;
  tokens.filter((token) => token.isWord).forEach((token) => {
    times.push(clock);
    // Dấu câu cuối từ tạo khoảng nghỉ; số dài đọc lâu hơn ("1250" → "một nghìn hai trăm năm mươi").
    const digits = (token.text.match(/\d/g) ?? []).length;
    const pause = /[.,;:!?…]$/.test(token.text) ? 260 : 0;
    clock += msPerWord * Math.max(1, digits * 0.9) + pause;
  });
  return times;
}

export type SpeechState = "idle" | "speaking" | "paused";

export type KaraokeSession = {
  pause(): void;
  resume(): void;
  stop(): void;
};

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

/** Chọn giọng tiếng Việt nếu hệ thống có; nếu không, để trình duyệt tự chọn theo lang. */
function pickVoice(lang: string) {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang === lang) ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
}

/**
 * Đọc văn bản và gọi onWord(chỉ số từ) mỗi khi chuyển từ; onWord(-1) khi kết thúc.
 * Chỉ một phiên đọc tồn tại tại một thời điểm (speechSynthesis là tài nguyên chung).
 */
export function speakWithHighlight(
  text: string,
  { lang = "vi-VN", rate = 0.88, onWord, onState }: { lang?: string; rate?: number; onWord: (index: number) => void; onState: (state: SpeechState) => void },
): KaraokeSession {
  const tokens = tokenizeForKaraoke(text);
  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text.normalize("NFC"));
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1.05;
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;

  // Bộ tô sáng dự phòng theo thời gian.
  const timeline = estimateWordTimeline(tokens, rate);
  let boundarySeen = false;
  let fallbackTimer: number | undefined;
  let fallbackStartedAt = 0;
  let fallbackElapsed = 0;
  let currentWord = -1;
  let finished = false;

  const setWord = (index: number) => {
    if (index === currentWord) return;
    currentWord = index;
    onWord(index);
  };
  const tickFallback = () => {
    const elapsed = fallbackElapsed + (performance.now() - fallbackStartedAt);
    let index = 0;
    while (index + 1 < timeline.length && timeline[index + 1] <= elapsed) index += 1;
    setWord(index);
  };
  const startFallback = () => {
    if (boundarySeen || fallbackTimer !== undefined || finished) return;
    fallbackStartedAt = performance.now();
    fallbackTimer = window.setInterval(tickFallback, 90);
  };
  const stopFallback = (keepElapsed: boolean) => {
    if (fallbackTimer === undefined) return;
    window.clearInterval(fallbackTimer);
    fallbackTimer = undefined;
    fallbackElapsed = keepElapsed ? fallbackElapsed + (performance.now() - fallbackStartedAt) : 0;
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    stopFallback(false);
    window.clearTimeout(fallbackArm);
    setWord(-1);
    onState("idle");
  };

  utterance.onboundary = (event) => {
    if (event.name && event.name !== "word") return;
    boundarySeen = true;
    stopFallback(false);
    setWord(wordIndexAtChar(tokens, event.charIndex));
  };
  utterance.onstart = () => {
    onState("speaking");
    setWord(0);
  };
  utterance.onend = finish;
  utterance.onerror = finish;

  // Nếu sau 600ms chưa có onboundary nào → bật chế độ ước lượng.
  const fallbackArm = window.setTimeout(startFallback, 600);
  synth.speak(utterance);

  return {
    pause() {
      if (finished) return;
      synth.pause();
      stopFallback(true);
      onState("paused");
    },
    resume() {
      if (finished) return;
      synth.resume();
      if (!boundarySeen) {
        fallbackStartedAt = performance.now();
        fallbackTimer = window.setInterval(tickFallback, 90);
      }
      onState("speaking");
    },
    stop() {
      synth.cancel();
      finish();
    },
  };
}
