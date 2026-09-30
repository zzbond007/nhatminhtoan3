// Module 6.2 · Cổng Phụ Huynh.
// Thử thách là một câu PHẦN TRĂM (ví dụ "25% của 360"): kiến thức lớp 5, trẻ lớp 3 chưa học nên không
// tự mở được, còn người lớn nhẩm trong vài giây. (Trước đây là phép nhân trong bảng 6–9 — đúng thứ trẻ
// lớp 3 đã thuộc lòng.) Sai 3 lần → khoá 30 giây.

export const GATE_MAX_TRIES = 3;
export const GATE_LOCK_MS = 30_000;

/** Không dùng 10%, 50%, 100%: quá dễ đoán bằng cách bỏ số 0 hoặc chia đôi. */
export const GATE_PERCENTS = [15, 20, 25, 30, 40, 60, 75] as const;

export type GateChallenge = { percent: number; base: number; answer: number; prompt: string };

export function createGateChallenge(random: () => number = Math.random): GateChallenge {
  const percent = GATE_PERCENTS[Math.min(GATE_PERCENTS.length - 1, Math.floor(random() * GATE_PERCENTS.length))];
  // Bội của 20 từ 120 đến 480: mọi tỉ lệ ở trên đều cho kết quả là số tự nhiên.
  const base = 20 * (6 + Math.min(18, Math.floor(random() * 19)));
  return { percent, base, answer: (percent * base) / 100, prompt: `${percent}% của ${base} = ?` };
}

export function checkGateAnswer(challenge: Pick<GateChallenge, "answer">, input: string) {
  return input.trim() !== "" && Number(input) === challenge.answer;
}

/** Lấy các mục trong 7 ngày gần nhất tính tới `now` (ISO). */
export function withinLastWeek(iso: string, now: number) {
  const time = new Date(iso).getTime();
  return Number.isFinite(time) && time <= now && now - time <= 7 * 86_400_000;
}
