// Module 6.2 · Cổng Phụ Huynh: phép nhân hai chữ số trong bảng 6–9 (ví dụ 8 × 7) đủ khó để trẻ lớp 3
// không bấm bừa, nhưng người lớn trả lời trong 2 giây. Sai 3 lần → khoá 30 giây.

export const GATE_MAX_TRIES = 3;
export const GATE_LOCK_MS = 30_000;

export type GateChallenge = { a: number; b: number; answer: number };

export function createGateChallenge(random: () => number = Math.random): GateChallenge {
  const a = 6 + Math.floor(random() * 4);
  const b = 6 + Math.floor(random() * 4);
  return { a, b, answer: a * b };
}

export function checkGateAnswer(challenge: GateChallenge, input: string) {
  return input.trim() !== "" && Number(input) === challenge.answer;
}

/** Lấy các mục trong 7 ngày gần nhất tính tới `now` (ISO). */
export function withinLastWeek(iso: string, now: number) {
  const time = new Date(iso).getTime();
  return Number.isFinite(time) && time <= now && now - time <= 7 * 86_400_000;
}
