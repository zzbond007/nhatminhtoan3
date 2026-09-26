"use client";

// Module 1 · Bàn phím số ảo.
// Ô đáp án là readOnly + inputMode="none" nên iPad KHÔNG bật bàn phím hệ thống (vốn che nửa màn hình
// và có cả chữ cái gây xao nhãng). Trẻ nhập bằng các phím lớn ≥ 54px ngay dưới đề; máy tính có bàn
// phím cứng vẫn gõ số, Backspace và Enter được.

import { useEffect, useRef } from "react";
import { Check, Delete } from "lucide-react";
import { applyNumpadKey, keyboardToNumpadKey, type NumpadKey, type NumpadOptions } from "@/app/numpad";

function haptic() {
  // Rung phản hồi rất nhẹ; Safari iOS không hỗ trợ vibrate nên chỉ Android/Chrome có rung.
  try { if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(10); } catch { /* bỏ qua */ }
}

type Props = NumpadOptions & {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
};

export function NumpadAnswer({ value, onChange, onSubmit, disabled = false, label = "Đáp án của con", placeholder = "?", ...options }: Props) {
  const valueRef = useRef(value);
  const submitRef = useRef(onSubmit);
  useEffect(() => { valueRef.current = value; submitRef.current = onSubmit; });

  function press(key: NumpadKey) {
    if (disabled) return;
    haptic();
    onChange(applyNumpadKey(value, key, options));
  }
  function submit() {
    if (disabled || !value || value === "-") return;
    haptic();
    onSubmit?.();
  }

  // Bàn phím cứng (máy tính): chỉ nhận khi con không đang gõ vào ô văn bản khác (ví dụ ô phản tư).
  useEffect(() => {
    if (disabled) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || (target.tagName === "INPUT" && !(target as HTMLInputElement).readOnly) || target.isContentEditable)) return;
      if (event.key === "Enter") {
        if (valueRef.current && submitRef.current) { event.preventDefault(); submitRef.current(); }
        return;
      }
      const key = keyboardToNumpadKey(event.key);
      if (!key) return;
      event.preventDefault();
      onChange(applyNumpadKey(valueRef.current, key, options));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // options là đối tượng mới mỗi lần render; chỉ các cờ bên trong mới quan trọng.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, onChange, options.allowNegative, options.allowDecimal, options.maxDigits]);

  const digitRows: NumpadKey[][] = [["7", "8", "9"], ["4", "5", "6"], ["1", "2", "3"]];
  const extraKey: NumpadKey = options.allowNegative ? "sign" : options.allowDecimal ? "decimal" : "clear";
  const extraLabel = extraKey === "sign" ? "±" : extraKey === "decimal" ? "," : "C";
  const extraAria = extraKey === "sign" ? "Đổi dấu âm" : extraKey === "decimal" ? "Dấu phẩy" : "Xóa hết";

  return (
    <div className={`numpad-answer ${disabled ? "is-disabled" : ""}`}>
      <label className="numpad-display">
        <span>{label}</span>
        <input
          readOnly
          inputMode="none"
          value={value}
          placeholder={placeholder}
          aria-label={`${label}: ${value || "chưa nhập"}`}
          aria-live="polite"
          disabled={disabled}
          className="numpad-input"
          onFocus={(event) => event.currentTarget.blur()}
        />
      </label>
      <div className="virtual-numpad" role="group" aria-label="Bàn phím số">
        {digitRows.map((row) => row.map((key) => (
          <button type="button" key={key} className="numpad-key" onClick={() => press(key)} disabled={disabled} aria-label={`Số ${key}`}>{key}</button>
        )))}
        <button type="button" className="numpad-key action" style={{ gridColumn: 4, gridRow: 1 }} onClick={() => press("backspace")} disabled={disabled || !value} aria-label="Xóa một số"><Delete /></button>
        <button type="button" className="numpad-key action" style={{ gridColumn: 4, gridRow: 2 }} onClick={() => press(extraKey)} disabled={disabled} aria-label={extraAria}>{extraLabel}</button>
        <button type="button" className="numpad-key zero" style={{ gridColumn: "1 / span 3", gridRow: 4 }} onClick={() => press("0")} disabled={disabled} aria-label="Số 0">0</button>
        <button type="button" className="numpad-key submit" style={{ gridColumn: 4, gridRow: "3 / span 2" }} onClick={submit} disabled={disabled || !value || !onSubmit} aria-label="Gửi đáp án"><Check /></button>
      </div>
    </div>
  );
}
