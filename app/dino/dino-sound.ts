// dino-sound.ts
// Âm thanh thưởng tạo bằng Web Audio (không cần tệp âm thanh, chạy ngoại tuyến).
// Mặc định TẮT; phụ huynh/bé bật trong Tổ ấm hoặc Góc đồng hành.

export type RewardSound = "brave" | "hatch" | "care";

const NOTES: Record<RewardSound, Array<[number, number, number]>> = {
  // [tần số Hz, bắt đầu (giây), độ dài (giây)]
  brave: [[659.25, 0, 0.14], [880, 0.12, 0.22]],
  care: [[523.25, 0, 0.12], [659.25, 0.1, 0.16]],
  hatch: [[392, 0, 0.12], [523.25, 0.12, 0.12], [659.25, 0.24, 0.12], [783.99, 0.36, 0.34], [1046.5, 0.5, 0.4]],
};

let context: AudioContext | null = null;

export function playRewardSound(kind: RewardSound, enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  try {
    context ??= new AudioContextClass();
    if (context.state === "suspended") void context.resume();
    const start = context.currentTime + 0.02;
    NOTES[kind].forEach(([frequency, offset, length]) => {
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start + offset);
      gain.gain.exponentialRampToValueAtTime(0.18, start + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + length);
      oscillator.connect(gain).connect(context!.destination);
      oscillator.start(start + offset);
      oscillator.stop(start + offset + length + 0.05);
    });
  } catch {
    // Trình duyệt chặn âm thanh: bỏ qua, phần thưởng vẫn hiện bằng hình.
  }
}
