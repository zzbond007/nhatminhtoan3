// Module 1 · Logic thuần của bàn phím số ảo: nhận một phím, trả về giá trị mới của ô đáp án.
// Tách khỏi giao diện để kiểm thử được bằng node:test và dùng lại ở mọi ô nhập số.

export type NumpadKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "backspace" | "clear" | "sign" | "decimal";

export type NumpadOptions = {
  /** Cho phép dấu âm (bài lớp 3 hầu như không cần; mặc định tắt). */
  allowNegative?: boolean;
  /** Cho phép dấu phẩy thập phân kiểu Việt Nam ("," hiển thị). */
  allowDecimal?: boolean;
  /** Số chữ số tối đa, tránh trẻ bấm giữ tạo chuỗi dài vô nghĩa. */
  maxDigits?: number;
};

export const NUMPAD_DEFAULT_MAX_DIGITS = 7;

export function applyNumpadKey(value: string, key: NumpadKey, options: NumpadOptions = {}): string {
  const maxDigits = options.maxDigits ?? NUMPAD_DEFAULT_MAX_DIGITS;
  const negative = value.startsWith("-");
  const body = negative ? value.slice(1) : value;

  if (key === "backspace") return value.slice(0, -1) === "-" ? "" : value.slice(0, -1);
  if (key === "clear") return "";
  if (key === "sign") {
    if (!options.allowNegative) return value;
    return negative ? body : `-${body}`;
  }
  if (key === "decimal") {
    if (!options.allowDecimal || body.includes(",")) return value;
    return `${negative ? "-" : ""}${body || "0"},`;
  }
  // Phím số: bỏ số 0 vô nghĩa ở đầu ("07" → "7") và giới hạn độ dài.
  if (body.replace(",", "").length >= maxDigits) return value;
  const nextBody = body === "0" ? key : `${body}${key}`;
  return `${negative ? "-" : ""}${nextBody}`;
}

/** Ánh xạ phím cứng (máy tính có bàn phím) sang phím ảo; trả về null nếu không liên quan. */
export function keyboardToNumpadKey(key: string): NumpadKey | null {
  if (/^[0-9]$/.test(key)) return key as NumpadKey;
  if (key === "Backspace") return "backspace";
  if (key === "Delete" || key === "Escape") return "clear";
  if (key === "-") return "sign";
  if (key === "," || key === ".") return "decimal";
  return null;
}
