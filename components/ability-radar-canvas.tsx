"use client";

// Module 6.3 · Biểu đồ Radar 6 miền tư duy vẽ bằng HTML5 Canvas.
// Nét sắc trên màn Retina nhờ nhân kích thước canvas theo devicePixelRatio; tự vẽ lại khi đổi kích thước.
// Kèm khuyến nghị đồng hành (radar-report.ts) ngay bên dưới biểu đồ.

import { useEffect, useRef } from "react";
import type { DomainId } from "@/app/content";
import { buildRadarReport, RADAR_AXIS_LABELS, RADAR_AXIS_ORDER } from "@/app/radar-report";

function drawRadar(canvas: HTMLCanvasElement, values: Record<DomainId, number>) {
  const size = canvas.clientWidth || 320;
  const ratio = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.round(size * ratio);
  canvas.height = Math.round(size * ratio);
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, size, size);

  const center = size / 2;
  // Chừa lề đủ cho nhãn hai dòng (tên trục + %) ở trục trái/phải để không bị cắt trên màn hẹp.
  const radius = size * 0.28;
  const count = RADAR_AXIS_ORDER.length;
  const point = (index: number, r: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    return [center + Math.cos(angle) * r, center + Math.sin(angle) * r] as const;
  };
  const styles = getComputedStyle(canvas);
  const ink = styles.getPropertyValue("--ink").trim() || "#222746";
  const line = styles.getPropertyValue("--line-strong").trim() || "#c4cbe3";
  const brand = styles.getPropertyValue("--green").trim() || "#5c49d8";

  // Lưới: 5 vòng ứng với 20%, 40%, …, 100%.
  for (let ring = 1; ring <= 5; ring += 1) {
    context.beginPath();
    for (let index = 0; index < count; index += 1) {
      const [x, y] = point(index, (radius * ring) / 5);
      if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
    }
    context.closePath();
    context.strokeStyle = line;
    context.lineWidth = ring === 5 ? 1.4 : 0.8;
    context.stroke();
  }
  // Trục và nhãn.
  context.font = `700 ${Math.max(11, size * 0.042)}px ui-rounded, -apple-system, "Segoe UI", sans-serif`;
  context.textBaseline = "middle";
  RADAR_AXIS_ORDER.forEach((domain, index) => {
    const [x, y] = point(index, radius);
    context.beginPath(); context.moveTo(center, center); context.lineTo(x, y);
    context.strokeStyle = line; context.lineWidth = 0.8; context.stroke();
    const [lx, ly] = point(index, radius + size * 0.13);
    context.fillStyle = ink;
    context.textAlign = "center";
    context.fillText(RADAR_AXIS_LABELS[domain], lx, ly - 7);
    context.fillStyle = brand;
    context.fillText(`${Math.round(values[domain] ?? 0)}%`, lx, ly + 9);
  });
  // Vùng năng lực.
  context.beginPath();
  RADAR_AXIS_ORDER.forEach((domain, index) => {
    const [x, y] = point(index, radius * Math.max(0.04, (values[domain] ?? 0) / 100));
    if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
  });
  context.closePath();
  context.fillStyle = "rgba(92, 73, 216, 0.22)";
  context.fill();
  context.strokeStyle = brand;
  context.lineWidth = 2.4;
  context.lineJoin = "round";
  context.stroke();
  RADAR_AXIS_ORDER.forEach((domain, index) => {
    const [x, y] = point(index, radius * Math.max(0.04, (values[domain] ?? 0) / 100));
    context.beginPath(); context.arc(x, y, 4.2, 0, Math.PI * 2);
    context.fillStyle = "#fff"; context.fill();
    context.lineWidth = 2.2; context.strokeStyle = brand; context.stroke();
  });
}

export function AbilityRadarCanvas({ values, title }: { values: Record<DomainId, number>; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const report = buildRadarReport(values);
  const valueKey = RADAR_AXIS_ORDER.map((domain) => Math.round(values[domain] ?? 0)).join(",");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const current = Object.fromEntries(RADAR_AXIS_ORDER.map((domain, index) => [domain, Number(valueKey.split(",")[index])])) as Record<DomainId, number>;
    const redraw = () => drawRadar(canvas, current);
    redraw();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(redraw) : null;
    observer?.observe(canvas);
    return () => observer?.disconnect();
  }, [valueKey]);

  const description = RADAR_AXIS_ORDER.map((domain) => `${RADAR_AXIS_LABELS[domain]} ${Math.round(values[domain] ?? 0)}%`).join(", ");
  return (
    <div className="radar-report">
      <canvas ref={canvasRef} className="radar-canvas" role="img" aria-label={`${title}: ${description}`} />
      <div className="radar-advice">
        <p className="radar-summary">{report.summary}</p>
        <div className="radar-columns">
          <div className="radar-strengths">
            <h3>🌟 Điểm mạnh vượt trội</h3>
            {report.strengths.map((item) => <p key={item.domain}><strong>{item.label} · {item.percent}%</strong> {item.text}</p>)}
          </div>
          {report.growth.length > 0 && <div className="radar-growth">
            <h3>🌱 Vùng đang bồi đắp</h3>
            {report.growth.map((item) => <p key={item.domain}><strong>{item.label} · {item.percent}%</strong> {item.text} <em>Gợi ý tại nhà: {item.activity}</em></p>)}
          </div>}
        </div>
      </div>
    </div>
  );
}
