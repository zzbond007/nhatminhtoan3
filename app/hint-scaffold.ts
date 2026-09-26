// Module 4 · Giàn giáo 3 tầng và luật chống lạm dụng gợi ý.
// Tầng 1 – Định hướng (câu hỏi tư duy), Tầng 2 – Trực quan (sơ đồ/phép tính dở dang),
// Tầng 3 – Lời giải từng bước. Dữ liệu gợi ý có sẵn trong curriculum/skill-lab dưới dạng hints[0..2].

export const HINT_TIERS = 3;
/** Số giây khoá nút mở tầng kế tiếp, theo chỉ số tầng sắp mở (1 = tầng 2, 2 = tầng 3). */
export const HINT_LOCK_SECONDS: Record<number, number> = { 1: 15, 2: 15 };

export const HINT_TIER_LABELS = ["Định hướng", "Trực quan", "Lời giải chi tiết"] as const;

/**
 * Gợi ý trong nhiệm vụ có dạng "Tầng 2 · Chọn bước: nội dung"; gợi ý phòng luyện thì không có nhãn
 * và có thể chứa dấu ":" của phép chia ("36 : 6"), nên chỉ bỏ đúng tiền tố "Tầng n …:".
 */
export function hintBody(hint: string) {
  return hint.replace(/^Tầng\s*\d[^:]*:\s*/u, "");
}

/** Thời gian khoá (ms) trước khi được mở tầng tiếp theo, khi con vừa mở tới tầng `depth`. */
export function hintLockMs(depth: number) {
  return (HINT_LOCK_SECONDS[depth] ?? 0) * 1000;
}

export type SparkReward = {
  amount: number;
  selfReliant: boolean;   // huy hiệu "Tự lực"
  needsReview: boolean;   // dùng tới lời giải chi tiết → đánh dấu cần ôn
  label: string;
};

/**
 * Thưởng "Tia sáng" khi con giải đúng một câu:
 * - tự giải đúng ngay lần đầu, không gợi ý: +10 và huy hiệu Tự lực;
 * - dùng tầng 1: +5 · tầng 2: +2 · tầng 3: +1 (ghi nhận hoàn thành nhưng cần ôn lại).
 * Chống đoán mò: không dùng gợi ý nhưng phải thử lại nhiều lần thì tính như tầng 1.
 */
export function sparkRewardFor(hintDepth: number, firstTry: boolean): SparkReward {
  const depth = Math.max(0, Math.min(HINT_TIERS, Math.floor(hintDepth)));
  if (depth === 0 && firstTry) return { amount: 10, selfReliant: true, needsReview: false, label: "+10 Tia sáng · Huy hiệu Tự lực 🏅" };
  if (depth <= 1) return { amount: 5, selfReliant: false, needsReview: false, label: "+5 Tia sáng" };
  if (depth === 2) return { amount: 2, selfReliant: false, needsReview: false, label: "+2 Tia sáng" };
  return { amount: 1, selfReliant: false, needsReview: true, label: "+1 Tia sáng · câu này mình sẽ ôn lại nhé" };
}

/** Sai 2 lần liên tiếp ở cùng một câu → hạ bậc giàn giáo: mở sẵn tầng trực quan (tầng 2). */
export const AUTO_SCAFFOLD_AFTER_WRONG = 2;
export function autoScaffoldDepth(currentDepth: number, consecutiveWrong: number) {
  return consecutiveWrong >= AUTO_SCAFFOLD_AFTER_WRONG ? Math.max(currentDepth, 2) : currentDepth;
}
