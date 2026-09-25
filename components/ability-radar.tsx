// Bản đồ Năng lực 6 Chiều: biểu đồ lục giác, mỗi trục là một miền tư duy (0–100%).
// Có thể chồng hai lớp (lần trước và lần này) để phụ huynh thấy con tiến bộ ở đâu.

export type RadarAxis = { id: string; label: string };
export type RadarSeries = { label: string; values: Record<string, number>; tone: "baseline" | "current" };

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 104;

function point(index: number, count: number, ratio: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  return [CENTER + Math.cos(angle) * RADIUS * ratio, CENTER + Math.sin(angle) * RADIUS * ratio] as const;
}

export function AbilityRadar({ axes, series, title }: { axes: RadarAxis[]; series: RadarSeries[]; title: string }) {
  const rings = [1 / 3, 2 / 3, 1];
  const describe = series.map((item) => `${item.label}: ${axes.map((axis) => `${axis.label} ${Math.round(item.values[axis.id] ?? 0)}%`).join(", ")}`).join(". ");
  return (
    <figure className="ability-radar">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${title}. ${describe}`}>
        {rings.map((ring) => <polygon key={ring} points={axes.map((_, index) => point(index, axes.length, ring).join(",")).join(" ")} className="ring" />)}
        {axes.map((axis, index) => {
          const [x, y] = point(index, axes.length, 1);
          const [lx, ly] = point(index, axes.length, 1.24);
          return (
            <g key={axis.id}>
              <line x1={CENTER} y1={CENTER} x2={x} y2={y} className="spoke" />
              <text x={lx} y={ly} textAnchor={Math.abs(lx - CENTER) < 8 ? "middle" : lx > CENTER ? "start" : "end"} dominantBaseline="middle" className="axis-label">{axis.label}</text>
            </g>
          );
        })}
        {series.map((item) => (
          <g key={item.label} className={`series ${item.tone}`}>
            <polygon points={axes.map((axis, index) => point(index, axes.length, Math.max(0.04, (item.values[axis.id] ?? 0) / 100)).join(",")).join(" ")} />
            {axes.map((axis, index) => {
              const [x, y] = point(index, axes.length, Math.max(0.04, (item.values[axis.id] ?? 0) / 100));
              return <circle key={axis.id} cx={x} cy={y} r={3.6} />;
            })}
          </g>
        ))}
      </svg>
      {series.length > 1 && <figcaption>{series.map((item) => <span key={item.label} className={item.tone}><i /> {item.label}</span>)}</figcaption>}
    </figure>
  );
}
