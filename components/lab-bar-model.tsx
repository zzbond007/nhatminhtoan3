"use client";

// Sơ đồ đoạn thẳng kéo được. Con kéo nút tròn (hoặc bấm − / +) để đổi số chưa biết;
// mọi đoạn phụ thuộc số ấy dài ra hoặc ngắn lại ngay, nên con THẤY khi hai thanh bằng nhau.
// Cách vẽ giống components/bar-model.tsx (SVG, nhãn bên trái, đoạn tô màu).

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { checkBar, rowTotal, segmentValue, type BarSpec, type LabCheck } from "@/app/lab-tools";

const WIDTH = 560;
const LABEL_W = 118;
const ROW_H = 62;
const BAR_H = 34;
const TRACK = WIDTH - LABEL_W - 26;

type Props = { spec: BarSpec; onCheck: (check: LabCheck) => void };

export function LabBarModel({ spec, onCheck }: Props) {
  const [x, setX] = useState(spec.variable.start);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const result = checkBar(spec, x);
  useEffect(() => { onCheck(result); }, [result.ok, result.message]); // eslint-disable-line react-hooks/exhaustive-deps

  // Thang đo cố định cho cả buổi (không co giãn khi kéo), để độ dài so được bằng mắt.
  const range = Array.from({ length: spec.variable.max - spec.variable.min + 1 }, (_, index) => spec.variable.min + index);
  const sharedMax = Math.max(1, ...spec.rows.filter((row) => !row.scaleMax).flatMap((row) => [...range.map((value) => rowTotal(row, value)), row.target?.value ?? 0]));
  const scaleOf = (rowIndex: number) => TRACK / (spec.rows[rowIndex].scaleMax ?? sharedMax);
  const handleRow = spec.rows[spec.handle.row];
  const handleSegments = handleRow.segments.slice(0, spec.handle.after + 1);
  const slope = handleSegments.reduce((sum, segment) => sum + segment.a, 0);
  const offset = handleSegments.reduce((sum, segment) => sum + segment.b, 0);
  const handleX = LABEL_W + (slope * x + offset) * scaleOf(spec.handle.row);
  const handleY = 8 + spec.handle.row * ROW_H + BAR_H / 2;
  const height = spec.rows.length * ROW_H + 10;

  const clamp = (value: number) => Math.max(spec.variable.min, Math.min(spec.variable.max, value));
  function moveTo(event: ReactPointerEvent<SVGSVGElement>) {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box || !slope) return;
    const svgX = ((event.clientX - box.left) / box.width) * WIDTH;
    const partial = (svgX - LABEL_W) / scaleOf(spec.handle.row);
    setX(clamp(Math.round((partial - offset) / slope)));
  }

  return (
    <div className="lab-tool lab-bar-tool">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${height}`}
        className={`lab-bar-svg ${dragging ? "dragging" : ""}`}
        role="img"
        aria-label={`Sơ đồ đoạn thẳng. ${spec.readout(x)}`}
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); moveTo(event); }}
        onPointerMove={(event) => { if (dragging) moveTo(event); }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {spec.rows.map((row, rowIndex) => {
          const y = 8 + rowIndex * ROW_H;
          const scale = scaleOf(rowIndex);
          let left = LABEL_W;
          return (
            <g key={row.label}>
              <text x={LABEL_W - 10} y={y + BAR_H / 2 + 5} textAnchor="end" className="bar-label">{row.label}</text>
              {row.segments.map((segment, index) => {
                const value = segmentValue(segment, x);
                const width = Math.max(0, value * scale);
                const start = left;
                left += width;
                if (width <= 0) return null;
                const text = segment.text(x);
                return (
                  <g key={index}>
                    <rect x={start} y={y} width={width} height={BAR_H} rx={6} className={`bar-seg ${segment.variable ? "variable" : `tone-${(rowIndex + index) % 3}`}`} />
                    {text && width > 22 && <text x={start + width / 2} y={y + BAR_H / 2 + 5} textAnchor="middle" className="bar-text">{text}</text>}
                  </g>
                );
              })}
              {row.target && (() => {
                const tx = LABEL_W + row.target.value * scale;
                return <g className="bar-target"><line x1={tx} x2={tx} y1={y - 4} y2={y + BAR_H + 4} /><text x={tx} y={y + BAR_H + 18} textAnchor="middle">{row.target.text}</text></g>;
              })()}
            </g>
          );
        })}
        <g className="bar-handle">
          <circle cx={handleX} cy={handleY} r={22} />
          <path d={`M${handleX - 7} ${handleY} h14 M${handleX - 7} ${handleY} l5 -5 M${handleX - 7} ${handleY} l5 5 M${handleX + 7} ${handleY} l-5 -5 M${handleX + 7} ${handleY} l-5 5`} />
        </g>
      </svg>
      <div className="lab-stepper">
        <button type="button" onClick={() => setX(clamp(x - 1))} disabled={x <= spec.variable.min} aria-label="Bớt 1">−</button>
        <output aria-live="polite">{spec.readout(x)}</output>
        <button type="button" onClick={() => setX(clamp(x + 1))} disabled={x >= spec.variable.max} aria-label="Thêm 1">+</button>
      </div>
    </div>
  );
}
