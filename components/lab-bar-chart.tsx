"use client";

// Biểu đồ cột con tự dựng. Con đếm phiếu (hoặc đọc bảng), rồi kéo đỉnh cột hoặc bấm − / +.
// Khi dựng đúng: hiện thêm cùng dữ liệu trên trục bị cắt, hoặc biểu đồ của một nhóm hỏi khác, để so sánh.

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { chartBallots, checkChart, type ChartSpec, type LabCheck } from "@/app/lab-tools";

type Props = { spec: ChartSpec; onCheck: (check: LabCheck) => void };

function axisStep(max: number) {
  return max <= 10 ? 1 : max <= 20 ? 2 : 10;
}

/** Biểu đồ chỉ để xem (trục có thể không bắt đầu từ 0). */
function MiniChart({ title, names, values, from, max }: { title: string; names: string[]; values: number[]; from: number; max: number }) {
  return (
    <figure className="lab-mini-chart">
      <figcaption>{title}</figcaption>
      <div className="mini-bars">
        <span className="mini-axis"><b>{max}</b><b>{from}</b></span>
        {values.map((value, index) => (
          <div key={names[index]}>
            <span className="mini-track"><i style={{ height: `${Math.max(0, (value - from) / (max - from)) * 100}%` }} /><b>{value}</b></span>
            <small>{names[index]}</small>
          </div>
        ))}
      </div>
    </figure>
  );
}

export function LabBarChart({ spec, onCheck }: Props) {
  const [values, setValues] = useState(() => spec.categories.map(() => 0));
  const dragIndex = useRef<number | null>(null);
  const result = checkChart(spec, values);
  useEffect(() => { onCheck(result); }, [result.ok, result.message]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (index: number, value: number) => setValues((list) => list.map((item, position) => (position === index ? Math.max(0, Math.min(spec.max, value)) : item)));
  function dragTo(event: ReactPointerEvent<HTMLElement>, index: number) {
    const box = event.currentTarget.getBoundingClientRect();
    set(index, Math.round(((box.bottom - event.clientY) / box.height) * spec.max));
  }
  const step = axisStep(spec.max);
  const ticks = Array.from({ length: Math.floor(spec.max / step) + 1 }, (_, index) => spec.max - index * step);
  const ballots = spec.source === "ballots" ? chartBallots(spec) : [];
  const names = spec.categories.map((category) => category.name);

  return (
    <div className="lab-tool lab-chart-tool">
      {spec.source === "ballots"
        ? <div className="lab-ballots" aria-label={`${ballots.length} phiếu trả lời`}>{ballots.map((icon, index) => <span key={index}>{icon}</span>)}<p className="lab-legend">{spec.categories.map((category) => <span key={category.name}>{category.icon} {category.name}</span>)}</p></div>
        : <table className="lab-table"><tbody>{spec.categories.map((category) => <tr key={category.name}><th>{category.name}</th><td>{category.value} {category.icon}</td></tr>)}</tbody></table>}
      <figure className="lab-chart" aria-label={spec.title}>
        <figcaption>{spec.title}</figcaption>
        <div className="lab-chart-body">
          <div className="lab-chart-axis" aria-hidden="true">{ticks.map((tick) => <span key={tick}>{tick}</span>)}</div>
          {spec.categories.map((category, index) => (
            <div key={category.name} className="lab-chart-column">
              <div
                className="lab-chart-track"
                style={{ "--ticks": spec.max / step } as React.CSSProperties}
                onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragIndex.current = index; dragTo(event, index); }}
                onPointerMove={(event) => { if (dragIndex.current === index) dragTo(event, index); }}
                onPointerUp={() => { dragIndex.current = null; }}
                onPointerCancel={() => { dragIndex.current = null; }}
                role="slider"
                aria-label={`Cột ${category.name}`}
                aria-valuemin={0}
                aria-valuemax={spec.max}
                aria-valuenow={values[index]}
                tabIndex={0}
                onKeyDown={(event) => { if (event.key === "ArrowUp") set(index, values[index] + 1); if (event.key === "ArrowDown") set(index, values[index] - 1); }}
              >
                <i style={{ height: `${(values[index] / spec.max) * 100}%` }}><b>{values[index]}</b></i>
              </div>
              <div className="lab-chart-buttons">
                <button type="button" onClick={() => set(index, values[index] - 1)} disabled={values[index] <= 0} aria-label={`Bớt cột ${category.name}`}>−</button>
                <button type="button" onClick={() => set(index, values[index] + 1)} disabled={values[index] >= spec.max} aria-label={`Thêm cột ${category.name}`}>+</button>
              </div>
              <small>{category.icon} {category.name}</small>
            </div>
          ))}
        </div>
      </figure>
      {result.ok && (spec.cutAxisFrom !== undefined || spec.reference) && (
        <div className="lab-compare">
          {spec.cutAxisFrom !== undefined && <>
            <MiniChart title="Trục bắt đầu từ 0" names={names} values={values} from={0} max={spec.max} />
            <MiniChart title={`Trục bắt đầu từ ${spec.cutAxisFrom}`} names={names} values={values} from={spec.cutAxisFrom} max={spec.max} />
          </>}
          {spec.reference && <>
            <MiniChart title="Biểu đồ của con" names={names} values={values} from={0} max={spec.max} />
            <MiniChart title={spec.reference.title} names={names} values={spec.reference.values} from={0} max={spec.max} />
          </>}
        </div>
      )}
    </div>
  );
}
