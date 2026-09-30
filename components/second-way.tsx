"use client";

// "Giải hai cách": con viết một phép tính khác cho cùng kết quả. Bàn phím gồm số và dấu phép tính,
// phím lớn, không bật bàn phím hệ thống của iPad.

import { Delete } from "lucide-react";
import { applyExpressionKey, checkSecondWay, type ExpressionKey, type SecondWayCheck } from "@/app/second-strategy";

const KEYS: ExpressionKey[] = ["7", "8", "9", "+", "4", "5", "6", "−", "1", "2", "3", "×", "(", "0", ")", ":"];
const KEY_LABELS: Partial<Record<ExpressionKey, string>> = { "+": "Cộng", "−": "Trừ", "×": "Nhân", ":": "Chia", "(": "Mở ngoặc", ")": "Đóng ngoặc" };

type Props = {
  prompt: string;
  answer: number;
  value: string;
  onChange: (value: string) => void;
  check: SecondWayCheck | null;
  onCheck: (check: SecondWayCheck) => void;
};

export function SecondWay({ prompt, answer, value, onChange, check, onCheck }: Props) {
  const done = Boolean(check?.ok);
  function press(key: ExpressionKey) {
    if (done) return;
    onChange(applyExpressionKey(value, key));
  }
  return (
    <div className={`second-way ${done ? "done" : ""}`}>
      <strong>Giải hai cách · thêm 1 mảnh trứng khủng long</strong>
      <p>Con đã tìm ra <b>{answer}</b> cho câu: “{prompt}”. Hãy viết <b>một phép tính khác</b> cũng cho kết quả {answer}.</p>
      <output className="second-way-display" aria-live="polite" aria-label="Phép tính của con">{value || "…"}{done && <span> = {answer}</span>}</output>
      {!done && (
        <div className="second-way-keys">
          {KEYS.map((key) => <button type="button" key={key} onClick={() => press(key)} aria-label={KEY_LABELS[key] ?? `Số ${key}`}>{key}</button>)}
          <button type="button" className="wide" onClick={() => press("backspace")} aria-label="Xoá một ký tự"><Delete /></button>
          <button type="button" className="wide" onClick={() => press("clear")} aria-label="Xoá hết phép tính">C</button>
          <button type="button" className="wide check" onClick={() => onCheck(checkSecondWay(value, answer))} disabled={!value.trim()}>Kiểm tra cách thứ hai</button>
        </div>
      )}
      {check && <p className={`second-way-message ${check.ok ? "ok" : ""}`} aria-live="polite">{check.message}</p>}
      {!done && <small>Không bắt buộc. Con có thể bỏ qua và hoàn thành nhiệm vụ.</small>}
    </div>
  );
}
