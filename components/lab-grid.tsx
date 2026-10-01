"use client";

// Lưới ô vuông xếp hình. Một cử chỉ chung cho iPad và chuột (pointer events):
// kéo từ ô này sang ô khác, HOẶC chạm ô thứ nhất rồi chạm ô thứ hai.
// Bốn chế độ: vẽ hình chữ nhật, dời ô (bảo toàn diện tích), tìm hết hình chữ nhật, lát viên 2 ô.

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  allRects, cellKey, checkDomino, checkFind, checkMove, checkRect, dominoFits, rectArea, rectCells, rectKey, rectPerimeter, shapePerimeter,
  type Domino, type GridSpec, type LabCheck,
} from "@/app/lab-tools";

type Cell = { row: number; col: number };
type Props = { spec: GridSpec; onCheck: (check: LabCheck) => void };

const sameCell = (a: Cell | null, b: Cell | null) => Boolean(a && b && a.row === b.row && a.col === b.col);
const dims = (a: Cell, b: Cell) => ({ w: Math.abs(a.col - b.col) + 1, h: Math.abs(a.row - b.row) + 1 });
const inside = (cell: Cell, a: Cell, b: Cell) =>
  cell.row >= Math.min(a.row, b.row) && cell.row <= Math.max(a.row, b.row) && cell.col >= Math.min(a.col, b.col) && cell.col <= Math.max(a.col, b.col);

export function LabGrid({ spec, onCheck }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ start: Cell; moved: boolean } | null>(null);
  // Chạm-chạm: ô đầu tiên đang chờ ô thứ hai.
  const [pending, setPending] = useState<Cell | null>(null);
  const [hover, setHover] = useState<Cell | null>(null);
  const [rect, setRect] = useState<{ a: Cell; b: Cell } | null>(null);
  const [tried, setTried] = useState<{ w: number; h: number }[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [lastFound, setLastFound] = useState<{ key: string; fresh: boolean } | null>(null);
  const [dominoes, setDominoes] = useState<Domino[]>([]);
  const [filled, setFilled] = useState<string[]>(spec.mode === "move" ? spec.start : []);
  const [held, setHeld] = useState<string | null>(null);

  const check = (): LabCheck => {
    if (spec.mode === "rect") return checkRect(spec, rect ? dims(rect.a, rect.b) : null);
    if (spec.mode === "find") return checkFind(spec, found);
    if (spec.mode === "domino") return checkDomino(spec, dominoes);
    return checkMove(spec, filled, held !== null);
  };
  const result = check();
  useEffect(() => { onCheck(result); }, [result.ok, result.message]); // eslint-disable-line react-hooks/exhaustive-deps

  function cellAt(event: ReactPointerEvent): Cell | null {
    const board = boardRef.current?.getBoundingClientRect();
    if (!board) return null;
    const col = Math.floor(((event.clientX - board.left) / board.width) * spec.cols);
    const row = Math.floor(((event.clientY - board.top) / board.height) * spec.rows);
    return row >= 0 && row < spec.rows && col >= 0 && col < spec.cols ? { row, col } : null;
  }

  /** Hoàn tất một cử chỉ từ ô a đến ô b (a = b nghĩa là chạm một ô). */
  function commit(a: Cell, b: Cell) {
    if (spec.mode === "move") {
      if (!sameCell(a, b)) return;
      const key = cellKey(b.row, b.col);
      if (held === null && filled.includes(key)) { setFilled(filled.filter((item) => item !== key)); setHeld(key); }
      else if (held !== null && !filled.includes(key)) { setFilled([...filled, key]); setHeld(null); }
      return;
    }
    if (spec.mode === "domino") {
      const ka = cellKey(a.row, a.col);
      const kb = cellKey(b.row, b.col);
      const owner = dominoes.findIndex((domino) => domino.includes(kb));
      if (sameCell(a, b) && owner >= 0 && !pending) { setDominoes(dominoes.filter((_, index) => index !== owner)); return; }
      if (dominoFits(ka, kb) && !dominoes.some((domino) => domino.includes(ka) || domino.includes(kb))) setDominoes([...dominoes, [ka, kb]]);
      return;
    }
    if (spec.mode === "rect") {
      setRect({ a, b });
      const size = dims(a, b);
      setTried((list) => (list.some((item) => (item.w === size.w && item.h === size.h) || (item.w === size.h && item.h === size.w)) ? list : [...list, size].slice(-6)));
      return;
    }
    const key = rectKey(a.row, a.col, b.row, b.col);
    setRect({ a, b });
    setLastFound({ key, fresh: !found.includes(key) });
    if (!found.includes(key)) setFound([...found, key]);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const cell = cellAt(event);
    if (!cell) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ start: cell, moved: false });
    setHover(cell);
  }
  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag) return;
    const cell = cellAt(event);
    if (!cell || sameCell(cell, hover)) return;
    setHover(cell);
    if (!drag.moved && !sameCell(cell, drag.start)) setDrag({ ...drag, moved: true });
  }
  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    setDrag(null);
    const end = cellAt(event) ?? hover;
    setHover(null);
    if (!drag || !end) return;
    if (drag.moved && !sameCell(drag.start, end)) { setPending(null); commit(drag.start, end); return; }
    // Chạm một ô.
    if (spec.mode === "move") { commit(end, end); return; }
    if (pending && !sameCell(pending, end)) { commit(pending, end); setPending(null); return; }
    if (spec.mode === "domino" && dominoes.some((domino) => domino.includes(cellKey(end.row, end.col)))) { commit(end, end); return; }
    if (sameCell(pending, end)) {
      // Chạm lại cùng ô: với hình chữ nhật và tìm hình, đó là hình 1 ô.
      setPending(null);
      if (spec.mode === "rect" || spec.mode === "find") commit(end, end);
      return;
    }
    setPending(end);
  }

  function reset() {
    setPending(null); setRect(null); setTried([]); setFound([]); setLastFound(null); setDominoes([]);
    if (spec.mode === "move") { setFilled(spec.start); setHeld(null); }
  }

  const preview = drag && hover ? { a: drag.start, b: hover } : pending ? { a: pending, b: pending } : rect;
  const dominoIndex = (key: string) => dominoes.findIndex((domino) => domino.includes(key));
  const cells = [];
  for (let row = 0; row < spec.rows; row += 1) {
    for (let col = 0; col < spec.cols; col += 1) {
      const key = cellKey(row, col);
      const classes = ["lab-cell"];
      if (preview && (spec.mode === "rect" || spec.mode === "find") && inside({ row, col }, preview.a, preview.b)) classes.push("on");
      if (sameCell(pending, { row, col })) classes.push("pending");
      if (spec.mode === "move" && filled.includes(key)) classes.push("filled");
      if (spec.mode === "move" && held === key) classes.push("held-origin");
      const owner = dominoIndex(key);
      if (owner >= 0) classes.push("domino", `tone-${owner % 4}`);
      cells.push(<span key={key} className={classes.join(" ")} />);
    }
  }

  const current = rect ? dims(rect.a, rect.b) : null;
  const groups = spec.mode === "find" ? [...new Set(allRects(spec.rows, spec.cols).map(rectCells))].sort((a, b) => a - b).map((size) => ({ size, count: found.filter((key) => rectCells(key) === size).length })) : [];

  return (
    <div className="lab-tool lab-grid-tool">
      <div
        ref={boardRef}
        className={`lab-grid mode-${spec.mode}`}
        style={{ "--cols": spec.cols, "--rows": spec.rows, "--cell-max": spec.cols <= 4 ? "76px" : "52px" } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { setDrag(null); setHover(null); }}
        role="application"
        aria-label={`Lưới ${spec.rows} hàng, ${spec.cols} cột. Kéo từ ô này sang ô khác, hoặc chạm hai ô.`}
      >
        {cells}
      </div>
      <div className="lab-readout" aria-live="polite">
        {spec.mode === "rect" && (current
          ? <p><strong>Hình {current.h} × {current.w}</strong> · Diện tích {rectArea(current.w, current.h)} {spec.unit === "m" ? "m²" : "ô"} · {spec.unit === "m" ? "Hàng rào" : "Chu vi"} {rectPerimeter(current.w, current.h)}{spec.unit === "m" ? " m" : ""}</p>
          : <p>Kéo trên lưới để vẽ một hình chữ nhật.</p>)}
        {spec.mode === "rect" && tried.length > 1 && <ul className="lab-tried" aria-label="Các hình con đã thử">{tried.map((item) => <li key={`${item.w}x${item.h}`}>{item.h} × {item.w}<small>{spec.unit === "m" ? `${rectArea(item.w, item.h)} m² · rào ${rectPerimeter(item.w, item.h)} m` : `${rectArea(item.w, item.h)} ô · chu vi ${rectPerimeter(item.w, item.h)}`}</small></li>)}</ul>}
        {spec.mode === "find" && <>
          <p>{lastFound ? (lastFound.fresh ? <><strong>Tìm thấy!</strong> Hình {rectCells(lastFound.key)} ô.</> : <>Hình này con đã tìm rồi.</>) : "Kéo để chọn một hình chữ nhật, kể cả hình gồm nhiều ô."}</p>
          <ul className="lab-tried">{groups.map((group) => <li key={group.size}>{group.size} ô<small>{group.count} hình</small></li>)}</ul>
          <p className="lab-count">Đã tìm: <strong>{found.length}</strong> hình</p>
        </>}
        {spec.mode === "domino" && <p>Đã đặt <strong>{dominoes.length}</strong> viên · Còn <strong>{spec.rows * spec.cols - dominoes.length * 2}</strong> ô trống. Chạm vào một viên để gỡ.</p>}
        {spec.mode === "move" && <p>Diện tích <strong>{filled.length + (held ? 1 : 0)} ô</strong>{held ? " · đang cầm 1 ô" : <> · Chu vi <strong>{shapePerimeter(filled)}</strong></>}</p>}
      </div>
      <button type="button" className="lab-reset" onClick={reset}>Làm lại từ đầu</button>
    </div>
  );
}
