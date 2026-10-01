"use client";

// Chọn học cụ theo đặc tả của bài Tương tác (xem app/lab-tools.ts).

import type { LabCheck, LabToolSpec } from "@/app/lab-tools";
import { LabBarChart } from "./lab-bar-chart";
import { LabBarModel } from "./lab-bar-model";
import { LabClock } from "./lab-clock";
import { LabGrid } from "./lab-grid";

export function LabTool({ spec, onCheck }: { spec: LabToolSpec; onCheck: (check: LabCheck) => void }) {
  if (spec.tool === "grid") return <LabGrid spec={spec} onCheck={onCheck} />;
  if (spec.tool === "bar-model") return <LabBarModel spec={spec} onCheck={onCheck} />;
  if (spec.tool === "clock") return <LabClock spec={spec} onCheck={onCheck} />;
  return <LabBarChart spec={spec} onCheck={onCheck} />;
}
