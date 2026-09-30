// Xáo trộn lựa chọn có hạt giống: thứ tự phụ thuộc DUY NHẤT vào mã câu hỏi,
// nên cùng một câu luôn hiện cùng thứ tự (kể cả khi tải lại, in lại hay chạy test),
// còn đáp án đúng thì trải đều qua các vị trí A, B, C, D.

/** FNV-1a 32 bit: băm mã câu hỏi thành hạt giống. */
export function seedFromId(id: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 — cùng thuật toán với seededRandom của spiral-engine. */
function generator(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates với hạt giống lấy từ `id`. Không sửa mảng gốc. */
export function shuffleById<T>(items: readonly T[], id: string): T[] {
  const result = [...items];
  const random = generator(seedFromId(id));
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

/**
 * Ghép đáp án với các phương án nhiễu khác nhau và khác đáp án.
 * Ứng viên trùng bị bỏ qua, nên bộ sinh đề không bao giờ tạo hai lựa chọn giống nhau.
 */
export function distinctOptions(answer: string | number, candidates: Array<string | number>, count = 3): string[] {
  const chosen = [String(answer)];
  for (const candidate of candidates) {
    const text = String(candidate);
    if (chosen.length < count && !chosen.includes(text)) chosen.push(text);
  }
  return chosen;
}
