"use client";

// Module 1.2 + 2 · Chế độ tập trung và thanh công cụ học tập nổi.
// Khi con đang giải bài, lớp "focus-mode" trên <html> làm mờ/ẩn điều hướng chính, huy hiệu, bản đồ đảo,
// dải thông tin nhiệm vụ và thanh tiến độ phụ (xem globals.css). Màn hình chỉ còn: đề, hình minh hoạ,
// vùng nhập, nút nghe đọc và nút gợi ý. Thanh công cụ nổi cho phép bật bảng nháp và tắt/bật tập trung.

import { useEffect, useState } from "react";
import { Focus, PencilLine } from "lucide-react";
import { Scratchpad } from "@/components/scratchpad";

export function useFocusMode(active: boolean) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("focus-mode", active);
    return () => root.classList.remove("focus-mode");
  }, [active]);
}

export function StudyToolbar({ focusOn, onToggleFocus, resetKey }: { focusOn: boolean; onToggleFocus: () => void; resetKey: string }) {
  const [padOpen, setPadOpen] = useState(false);
  useFocusMode(focusOn);
  return (
    <>
      <Scratchpad open={padOpen} onClose={() => setPadOpen(false)} resetKey={resetKey} />
      <div className="study-toolbar" role="toolbar" aria-label="Công cụ học tập">
        <button type="button" className={`study-tool ${padOpen ? "active" : ""}`} onClick={() => setPadOpen((value) => !value)} aria-pressed={padOpen}>
          <PencilLine /> <span>{padOpen ? "Cất nháp" : "Vẽ nháp"}</span>
        </button>
        <button type="button" className={`study-tool ${focusOn ? "active" : ""}`} onClick={onToggleFocus} aria-pressed={focusOn}>
          <Focus /> <span>{focusOn ? "Đang tập trung" : "Tập trung"}</span>
        </button>
      </div>
    </>
  );
}
