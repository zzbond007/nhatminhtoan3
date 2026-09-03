import type { DiagnosticQuestion } from "@/app/content";

export function DataChart({
  question,
  color,
}: {
  question: DiagnosticQuestion;
  color: string;
}) {
  if (!question.context) return null;
  const max = Math.max(1, ...question.context.values.map((item) => item.value));

  return (
    <div
      className="data-chart"
      role="img"
      aria-label={`${question.context.label}: ${question.context.values.map((item) => `${item.name} ${item.value}`).join(", ")}`}
    >
      {question.context.values.map((item) => (
        <div key={item.name}>
          <span>{item.value}</span>
          <i
            style={{ height: `${(item.value / max) * 100}%`, background: color }}
            aria-hidden="true"
          />
          <small>{item.name}</small>
        </div>
      ))}
    </div>
  );
}
