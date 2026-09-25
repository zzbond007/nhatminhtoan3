"use client";

import { useState } from "react";
import type { DiagnosticVisual } from "@/app/content";

type SampleDots = Extract<DiagnosticVisual, { kind: "sample-dots" }>;
type HeightOrder = Extract<DiagnosticVisual, { kind: "height-order" }>;

/** d3: 30 chấm là cả lớp, chỉ những chấm tô màu là các bạn đã được hỏi. */
export function SampleDotsVisual({ visual }: { visual: SampleDots }) {
  return (
    <figure className="sample-dots" role="img" aria-label={`Cả lớp ${visual.total} bạn; đã hỏi ${visual.asked} bạn, trong đó ${visual.liked} bạn thích cờ vua; ${visual.total - visual.asked} bạn chưa được hỏi.`}>
      <div className="sample-dots-grid" aria-hidden="true">
        {Array.from({ length: visual.total }, (_, index) => (
          <span key={index} className={index < visual.liked ? "liked" : index < visual.asked ? "asked" : ""} />
        ))}
      </div>
      <figcaption>
        <span><i className="liked" /> Đã hỏi, thích cờ vua ({visual.liked})</span>
        <span><i className="asked" /> Đã hỏi, không thích ({visual.asked - visual.liked})</span>
        <span><i /> Chưa được hỏi ({visual.total - visual.asked})</span>
      </figcaption>
    </figure>
  );
}

/** w3: trẻ tự xếp các bạn từ cao đến thấp; cột chiều cao vẽ theo đúng cách trẻ xếp. Không chấm đúng sai ở bước này. */
export function HeightOrderVisual({ visual, onArranged }: { visual: HeightOrder; onArranged: (arranged: boolean) => void }) {
  const [order, setOrder] = useState<string[]>([]);
  const remaining = visual.people.filter((person) => !order.includes(person));
  const complete = order.length === visual.people.length;

  function pick(person: string) {
    const next = [...order, person];
    setOrder(next);
    if (next.length === visual.people.length) onArranged(true);
  }
  function reset() {
    setOrder([]);
    onArranged(false);
  }

  return (
    <div className="height-order">
      <div className="height-order-clues">
        <strong>Manh mối</strong>
        <ul>{visual.clues.map((clue) => <li key={clue}>{clue}</li>)}</ul>
      </div>
      <p className="height-order-lead">{complete ? "Đây là cách con xếp. Nhìn cột rồi trả lời câu hỏi bên dưới." : `Chạm vào tên để xếp từ cao nhất đến thấp nhất (${order.length + 1}/${visual.people.length}).`}</p>
      <div className="height-order-bars" role="img" aria-label={order.length ? `Con đã xếp từ cao đến thấp: ${order.join(", ")}` : "Chưa xếp bạn nào"}>
        {visual.people.map((_, slot) => {
          const person = order[slot];
          return (
            <div key={slot} className={person ? "filled" : ""}>
              <i style={{ height: `${100 - slot * 26}%` }} />
              <small>{person ?? "?"}</small>
            </div>
          );
        })}
      </div>
      <div className="height-order-actions">
        {remaining.map((person) => <button type="button" key={person} onClick={() => pick(person)}>{person}</button>)}
        {order.length > 0 && <button type="button" className="reset" onClick={reset}>Xếp lại</button>}
      </div>
    </div>
  );
}
