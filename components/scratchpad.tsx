"use client";

// Module 2 · Bảng vẽ nháp tích hợp.
// Lớp canvas trong suốt phủ lên đề bài để con vẽ sơ đồ đoạn thẳng, đánh dấu hình, đặt tính nháp.
// - Bút chì 3 màu (xanh dương, đỏ, đen), Tẩy (destination-out) và Xóa hết.
// - Pointer Events cho chuột/bút/cảm ứng; mỗi ngón tay (pointerId) có nét riêng → vẽ đa điểm.
// - Thêm touchstart/touchmove với { passive: false } để chặn Safari cuộn trang khi đang vẽ.
// - Nét vẽ giữ nguyên khi đóng/mở bảng; tự xoá khi chuyển sang câu mới (đổi resetKey).

import { useEffect, useRef, useState } from "react";
import { Eraser, PencilLine, Trash2, X } from "lucide-react";

const PEN_COLORS = [
  { id: "blue", value: "#2563eb", label: "Bút xanh dương" },
  { id: "red", value: "#dc2626", label: "Bút đỏ" },
  { id: "black", value: "#1f2937", label: "Bút đen" },
] as const;
type Tool = (typeof PEN_COLORS)[number]["id"] | "eraser";

export function Scratchpad({ open, onClose, resetKey }: { open: boolean; onClose: () => void; resetKey: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("blue");
  const toolRef = useRef<Tool>(tool);
  const strokes = useRef(new Map<number, { x: number; y: number }>());
  useEffect(() => { toolRef.current = tool; }, [tool]);

  // Kích thước canvas theo khung nhìn × devicePixelRatio để nét sắc trên màn Retina; giữ hình khi xoay iPad.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 3);
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      if (canvas.width === width && canvas.height === height) return;
      const snapshot = canvas.width && canvas.height ? document.createElement("canvas") : null;
      if (snapshot) {
        snapshot.width = canvas.width; snapshot.height = canvas.height;
        snapshot.getContext("2d")?.drawImage(canvas, 0, 0);
      }
      canvas.width = width; canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (snapshot) context.drawImage(snapshot, 0, 0, snapshot.width / ratio, snapshot.height / ratio);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [open]);

  // Câu mới → bảng nháp sạch.
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      context.save(); context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, canvas.width, canvas.height); context.restore();
    }
  }, [resetKey]);

  // Chặn cuộn/phóng to của Safari khi ngón tay chạm canvas (React gắn touch listener ở chế độ passive).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const block = (event: TouchEvent) => { if (event.cancelable) event.preventDefault(); };
    canvas.addEventListener("touchstart", block, { passive: false });
    canvas.addEventListener("touchmove", block, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", block);
      canvas.removeEventListener("touchmove", block);
    };
  }, []);

  function position(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function drawSegment(from: { x: number; y: number }, to: { x: number; y: number }, pressure: number) {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const current = toolRef.current;
    context.globalCompositeOperation = current === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = current === "eraser" ? "rgba(0,0,0,1)" : PEN_COLORS.find((pen) => pen.id === current)!.value;
    // Bút Apple Pencil có áp lực → nét đậm nhạt tự nhiên; ngón tay/chuột dùng độ dày cố định.
    const base = current === "eraser" ? 28 : 3.6;
    context.lineWidth = current === "eraser" ? base : base * (pressure > 0 && pressure !== 0.5 ? 0.6 + pressure : 1);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  }
  function onPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = position(event);
    strokes.current.set(event.pointerId, point);
    drawSegment(point, { x: point.x + 0.01, y: point.y + 0.01 }, event.pressure);
  }
  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const last = strokes.current.get(event.pointerId);
    if (!last) return;
    event.preventDefault();
    // Gộp các sự kiện trung gian (coalesced) để nét cong mượt khi vẽ nhanh.
    const events = typeof event.nativeEvent.getCoalescedEvents === "function" ? event.nativeEvent.getCoalescedEvents() : [];
    const rect = event.currentTarget.getBoundingClientRect();
    let from = last;
    (events.length ? events : [event.nativeEvent]).forEach((item) => {
      const to = { x: item.clientX - rect.left, y: item.clientY - rect.top };
      drawSegment(from, to, item.pressure);
      from = to;
    });
    strokes.current.set(event.pointerId, from);
  }
  function endStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    strokes.current.delete(event.pointerId);
  }
  function clearAll() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.save(); context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, canvas.width, canvas.height); context.restore();
  }

  return (
    <div className={`scratchpad-layer ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <canvas
        ref={canvasRef}
        className="scratchpad-canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onPointerLeave={endStroke}
        aria-label="Bảng vẽ nháp"
        role="img"
      />
      <div className="scratchpad-toolbar" role="toolbar" aria-label="Công cụ vẽ nháp">
        <span className="scratchpad-title"><PencilLine /> Nháp</span>
        {PEN_COLORS.map((pen) => (
          <button key={pen.id} type="button" className={`scratch-tool pen ${tool === pen.id ? "active" : ""}`} onClick={() => setTool(pen.id)} aria-label={pen.label} aria-pressed={tool === pen.id}>
            <i style={{ background: pen.value }} />
          </button>
        ))}
        <button type="button" className={`scratch-tool ${tool === "eraser" ? "active" : ""}`} onClick={() => setTool("eraser")} aria-label="Tẩy" aria-pressed={tool === "eraser"}><Eraser /></button>
        <button type="button" className="scratch-tool" onClick={clearAll} aria-label="Xóa hết"><Trash2 /></button>
        <button type="button" className="scratch-tool close" onClick={onClose} aria-label="Đóng bảng nháp"><X /></button>
      </div>
    </div>
  );
}
