// Sơ đồ đoạn thẳng (Bar Model / phương pháp Singapore) vẽ bằng SVG từ dữ liệu BarModel của động cơ xoắn ốc.
// Dùng ở tầng gợi ý Trực quan và khi hạ bậc giàn giáo (mở sẵn cho con).

import type { BarModel } from "@/app/spiral-engine";

const WIDTH = 560;
const LABEL_W = 92;
const ROW_H = 44;

export function BarModelVisual({ model }: { model: BarModel }) {
  const longest = Math.max(...model.rows.map((row) => row.segments.reduce((sum, segment) => sum + segment.value, 0)), 1);
  const scale = (WIDTH - LABEL_W - 16) / longest;
  const height = model.rows.length * ROW_H + (model.bracket ? 34 : 8);
  const description = model.rows.map((row) => `${row.label}: ${row.segments.map((segment) => segment.unknown ? "?" : segment.text ?? segment.value).join(" + ")}`).join("; ");
  return (
    <figure className="bar-model">
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={`Sơ đồ đoạn thẳng. ${description}. ${model.bracket?.text ?? ""}`}>
        {model.rows.map((row, rowIndex) => {
          let x = LABEL_W;
          const y = 6 + rowIndex * ROW_H;
          return (
            <g key={rowIndex}>
              <text x={LABEL_W - 10} y={y + 18} textAnchor="end" className="bar-label">{row.label}</text>
              {row.segments.map((segment, index) => {
                const w = segment.value * scale;
                const rect = <g key={index}>
                  <rect x={x} y={y} width={Math.max(8, w)} height={30} rx={5} className={segment.unknown ? "bar-seg unknown" : `bar-seg tone-${rowIndex % 3}`} />
                  {(segment.unknown || segment.text) && w > 18 && <text x={x + w / 2} y={y + 20} textAnchor="middle" className="bar-text">{segment.unknown ? "?" : segment.text}</text>}
                </g>;
                x += w;
                return rect;
              })}
            </g>
          );
        })}
        {model.bracket && (() => {
          const y = model.rows.length * ROW_H + 4;
          const end = LABEL_W + longest * scale;
          return <g className="bar-bracket"><path d={`M${LABEL_W} ${y} v6 H${end} v-6`} /><text x={(LABEL_W + end) / 2} y={y + 24} textAnchor="middle">{model.bracket.text}</text></g>;
        })()}
      </svg>
    </figure>
  );
}
