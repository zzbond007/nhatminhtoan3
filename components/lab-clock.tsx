"use client";

// Đồng hồ kéo kim. Con kéo đầu kim (vòng tròn lớn, dễ chạm trên iPad) hoặc bấm − / +.
// Bộ đếm "đã trôi qua" cộng dồn theo chiều kim quay, kể cả khi kim đi quá một vòng,
// nên con thấy được: 15 giờ sau thì kim giờ quay đủ một vòng rồi đi thêm 3 giờ.

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { checkClock, clockDelta, type ClockSpec, type LabCheck } from "@/app/lab-tools";

const SIZE = 280;
const C = SIZE / 2;
const FACE = 124;

type Props = { spec: ClockSpec; onCheck: (check: LabCheck) => void };

const point = (angle: number, radius: number) => ({ x: C + radius * Math.sin(angle), y: C - radius * Math.cos(angle) });

export function LabClock({ spec, onCheck }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const result = checkClock(spec, elapsed);
  useEffect(() => { onCheck(result); }, [result.ok, result.message]); // eslint-disable-line react-hooks/exhaustive-deps

  const timeOf = (value: number) => spec.start + value * (spec.hand === "minute" ? 1 : 60);
  /** Vị trí kim đang được kéo, theo 12 nấc của mặt đồng hồ. */
  const positionOf = (value: number) => (spec.hand === "minute" ? Math.round((timeOf(value) % 60) / 5) % 12 : Math.floor(timeOf(value) / 60) % 12);
  const now = timeOf(elapsed);
  const minuteAngle = ((now % 60) / 60) * Math.PI * 2;
  const hourAngle = ((now % 720) / 720) * Math.PI * 2;
  const activeAngle = spec.hand === "minute" ? minuteAngle : hourAngle;
  const tip = point(activeAngle, spec.hand === "minute" ? 96 : 66);
  const unit = spec.hand === "minute" ? "phút" : "giờ";

  const clamp = (value: number) => Math.max(0, Math.min(spec.max, value));
  function moveTo(event: ReactPointerEvent<SVGSVGElement>) {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const dx = ((event.clientX - box.left) / box.width) * SIZE - C;
    const dy = ((event.clientY - box.top) / box.height) * SIZE - C;
    if (Math.hypot(dx, dy) < 18) return;
    const angle = (Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2);
    const next = Math.round((angle / (Math.PI * 2)) * 12) % 12;
    // Kim phút: mỗi nấc là 5 phút; kim giờ: mỗi nấc là 1 giờ.
    setElapsed((value) => clamp(value + clockDelta(positionOf(value), next, 12) * (spec.hand === "minute" ? 5 : 1)));
  }

  return (
    <div className="lab-tool lab-clock-tool">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={`lab-clock ${dragging ? "dragging" : ""}`}
        role="img"
        aria-label={`Đồng hồ. Đã trôi qua ${elapsed} ${unit}.`}
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); moveTo(event); }}
        onPointerMove={(event) => { if (dragging) moveTo(event); }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <circle cx={C} cy={C} r={FACE} className="clock-face" />
        {Array.from({ length: 60 }, (_, index) => {
          const outer = point((index / 60) * Math.PI * 2, FACE - 4);
          const inner = point((index / 60) * Math.PI * 2, index % 5 === 0 ? FACE - 16 : FACE - 10);
          return <line key={index} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} className={index % 5 === 0 ? "tick major" : "tick"} />;
        })}
        {Array.from({ length: 12 }, (_, index) => {
          const label = point(((index + 1) / 12) * Math.PI * 2, FACE - 32);
          return <text key={index} x={label.x} y={label.y + 7} textAnchor="middle" className="clock-number">{index + 1}</text>;
        })}
        <line x1={C} y1={C} x2={point(hourAngle, 66).x} y2={point(hourAngle, 66).y} className={`hand hour ${spec.hand === "hour" ? "active" : ""}`} />
        <line x1={C} y1={C} x2={point(minuteAngle, 96).x} y2={point(minuteAngle, 96).y} className={`hand minute ${spec.hand === "minute" ? "active" : ""}`} />
        <circle cx={C} cy={C} r={6} className="clock-pin" />
        <circle cx={tip.x} cy={tip.y} r={22} className="clock-grip" />
      </svg>
      <div className="lab-stepper">
        <button type="button" onClick={() => setElapsed(clamp(elapsed - (spec.hand === "minute" ? spec.step : 1)))} disabled={elapsed <= 0} aria-label={`Lùi ${spec.hand === "minute" ? spec.step : 1} ${unit}`}>−</button>
        <output aria-live="polite">Đã trôi qua: <strong>{elapsed} {unit}</strong>{spec.hand === "hour" && elapsed >= 12 ? " · kim giờ đã quay đủ một vòng" : ""}</output>
        <button type="button" onClick={() => setElapsed(clamp(elapsed + (spec.hand === "minute" ? spec.step : 1)))} disabled={elapsed >= spec.max} aria-label={`Thêm ${spec.hand === "minute" ? spec.step : 1} ${unit}`}>+</button>
      </div>
      <small className="lab-hint">{spec.hand === "minute" ? "Kéo vòng tròn ở đầu kim phút. Mỗi nấc là 5 phút." : "Kéo vòng tròn ở đầu kim giờ. Mỗi nấc là 1 giờ."}</small>
    </div>
  );
}
