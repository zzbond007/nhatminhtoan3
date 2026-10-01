// Học cụ tương tác ở Buổi 1 (Khơi tò mò). Bốn loại, tự viết, không thư viện ngoài:
//   - grid: lưới ô vuông (vẽ hình chữ nhật, dời ô, tìm hết hình chữ nhật, lát viên 2 ô);
//   - bar-model: sơ đồ đoạn thẳng kéo được;
//   - clock: đồng hồ kéo kim, có bộ đếm thời gian đã trôi qua;
//   - bar-chart: biểu đồ cột con tự dựng từ phiếu hoặc bảng số.
// Tệp này chỉ chứa đặc tả và hàm chấm THUẦN (không React), để bộ kiểm định chạy được:
// mỗi học cụ phải có lời giải mẫu được chấm đúng và trạng thái sai nhận phản hồi riêng.

export type LabCheck = { ok: boolean; message: string };

// ───────────────────────── Lưới ô vuông ─────────────────────────

export type CellKey = `${number}-${number}`;
export const cellKey = (row: number, col: number) => `${row}-${col}` as CellKey;
export const parseCell = (key: string) => key.split("-").map(Number) as [number, number];

type GridBase = { tool: "grid"; rows: number; cols: number };
export type GridRectSpec = GridBase & {
  mode: "rect";
  /** Đơn vị cạnh ô: "ô" (đếm cạnh) hoặc "m". */
  unit: "ô" | "m";
  area?: number;
  perimeter?: number;
  best: "min-perimeter" | "max-area";
  solution: { w: number; h: number };
};
export type GridMoveSpec = GridBase & { mode: "move"; start: CellKey[] };
export type GridFindSpec = GridBase & { mode: "find" };
export type GridDominoSpec = GridBase & { mode: "domino" };
export type GridSpec = GridRectSpec | GridMoveSpec | GridFindSpec | GridDominoSpec;

export function rectArea(w: number, h: number) { return w * h; }
export function rectPerimeter(w: number, h: number) { return 2 * (w + h); }

/** Hình chữ nhật cạnh nguyên tốt nhất theo điều kiện của đặc tả (để chấm, không hiện cho con). */
function bestRect(spec: GridRectSpec) {
  const candidates: { w: number; h: number }[] = [];
  for (let w = 1; w <= 100; w += 1) {
    for (let h = 1; h <= 100; h += 1) {
      if (spec.area !== undefined && w * h !== spec.area) continue;
      if (spec.perimeter !== undefined && 2 * (w + h) !== spec.perimeter) continue;
      candidates.push({ w, h });
    }
  }
  const score = (r: { w: number; h: number }) => (spec.best === "min-perimeter" ? rectPerimeter(r.w, r.h) : -rectArea(r.w, r.h));
  return candidates.reduce((best, r) => (score(r) < score(best) ? r : best), candidates[0]);
}

export function checkRect(spec: GridRectSpec, rect: { w: number; h: number } | null): LabCheck {
  if (!rect) return { ok: false, message: "Kéo từ một ô sang ô khác để vẽ hình chữ nhật." };
  const area = rectArea(rect.w, rect.h);
  const perimeter = rectPerimeter(rect.w, rect.h);
  const fence = spec.unit === "m" ? "Hàng rào" : "Chu vi";
  const areaUnit = spec.unit === "m" ? "m²" : "ô";
  if (spec.area !== undefined && area !== spec.area) return { ok: false, message: `Hình của con có ${area} ô. Cần đúng ${spec.area} ô.` };
  if (spec.perimeter !== undefined && perimeter !== spec.perimeter) {
    return { ok: false, message: spec.unit === "m" ? `Hàng rào của con dài ${perimeter} m. Cần đúng ${spec.perimeter} m.` : `Chu vi của con là ${perimeter}. Cần đúng ${spec.perimeter}.` };
  }
  const best = bestRect(spec);
  if (spec.best === "min-perimeter" && perimeter > rectPerimeter(best.w, best.h)) return { ok: false, message: `Đúng ${area} ô, chu vi ${perimeter}. Có hình nào gọn hơn, chu vi ngắn hơn không?` };
  if (spec.best === "max-area" && area < rectArea(best.w, best.h)) return { ok: false, message: `Đủ ${perimeter} m hàng rào, rộng ${area} ${areaUnit}. Có hình nào rộng hơn không?` };
  return { ok: true, message: spec.best === "min-perimeter" ? `Hình ${rect.h} × ${rect.w}: ${area} ô, chu vi ${perimeter}. Không hình nào gọn hơn.` : `Hình ${rect.h} × ${rect.w}: ${fence.toLocaleLowerCase("vi")} ${perimeter} m, rộng ${area} ${areaUnit}. Không hình nào rộng hơn.` };
}

const NEIGHBOURS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;

/** Chu vi của một hình ghép từ các ô: mỗi ô 4 cạnh, trừ đi hai lần số cặp ô kề nhau. */
export function shapePerimeter(cells: Iterable<string>) {
  const set = new Set(cells);
  let shared = 0;
  set.forEach((key) => {
    const [row, col] = parseCell(key);
    if (set.has(cellKey(row + 1, col))) shared += 1;
    if (set.has(cellKey(row, col + 1))) shared += 1;
  });
  return 4 * set.size - 2 * shared;
}

export function isConnected(cells: Iterable<string>) {
  const set = new Set(cells);
  const first = set.values().next().value;
  if (first === undefined) return false;
  const seen = new Set([first]);
  const queue = [first];
  while (queue.length) {
    const [row, col] = parseCell(queue.shift()!);
    for (const [dr, dc] of NEIGHBOURS) {
      const next = cellKey(row + dr, col + dc);
      if (set.has(next) && !seen.has(next)) { seen.add(next); queue.push(next); }
    }
  }
  return seen.size === set.size;
}

export function checkMove(spec: GridMoveSpec, cells: string[], holding: boolean): LabCheck {
  const start = shapePerimeter(spec.start);
  if (holding) return { ok: false, message: "Con đang cầm một ô. Đặt nó vào một ô trống nhé." };
  if (!isConnected(cells)) return { ok: false, message: "Các ô phải liền nhau thành một hình, chạm nhau bằng cạnh." };
  const perimeter = shapePerimeter(cells);
  if (perimeter === start) return { ok: false, message: `Vẫn ${cells.length} ô, chu vi vẫn ${perimeter}. Thử dời một ô ở góc ra chỗ khác xem chu vi có đổi không?` };
  return { ok: true, message: `Vẫn đúng ${cells.length} ô: không thêm, không bớt. Chu vi đổi từ ${start} thành ${perimeter}.` };
}

export const rectKey = (r0: number, c0: number, r1: number, c1: number) =>
  `${Math.min(r0, r1)}-${Math.min(c0, c1)}-${Math.max(r0, r1)}-${Math.max(c0, c1)}`;

export function allRects(rows: number, cols: number) {
  const keys: string[] = [];
  for (let r0 = 0; r0 < rows; r0 += 1) for (let r1 = r0; r1 < rows; r1 += 1)
    for (let c0 = 0; c0 < cols; c0 += 1) for (let c1 = c0; c1 < cols; c1 += 1) keys.push(rectKey(r0, c0, r1, c1));
  return keys;
}

/** "1-0-1-2" → số ô của hình chữ nhật. */
export function rectCells(key: string) {
  const [r0, c0, r1, c1] = key.split("-").map(Number);
  return (r1 - r0 + 1) * (c1 - c0 + 1);
}

export function checkFind(spec: GridFindSpec, found: string[]): LabCheck {
  const total = allRects(spec.rows, spec.cols).length;
  const unique = new Set(found);
  if (unique.size >= total) return { ok: true, message: `Con đã tìm đủ ${total} hình chữ nhật. Chia theo cỡ giúp ta biết chắc không sót.` };
  return { ok: false, message: `Con tìm được ${unique.size} hình. Vẫn còn hình bị sót. Thử đếm theo cỡ: hình 1 ô, 2 ô, 3 ô… mỗi cỡ có mấy hình?` };
}

export type Domino = [string, string];

export function dominoFits(a: string, b: string) {
  const [r0, c0] = parseCell(a);
  const [r1, c1] = parseCell(b);
  return Math.abs(r0 - r1) + Math.abs(c0 - c1) === 1;
}

export function checkDomino(spec: GridDominoSpec, dominoes: Domino[]): LabCheck {
  const covered = new Set(dominoes.flat());
  const empty: string[] = [];
  for (let row = 0; row < spec.rows; row += 1) for (let col = 0; col < spec.cols; col += 1) if (!covered.has(cellKey(row, col))) empty.push(cellKey(row, col));
  if (!empty.length) return { ok: true, message: `${dominoes.length} viên phủ kín ${spec.rows * spec.cols} ô: không khe hở, không chồng lên nhau.` };
  const isolated = empty.find((key) => {
    const [row, col] = parseCell(key);
    return NEIGHBOURS.every(([dr, dc]) => !empty.includes(cellKey(row + dr, col + dc)));
  });
  if (isolated) return { ok: false, message: "Có một ô trống bị kẹt: không viên 2 ô nào phủ được nó. Gỡ bớt một viên rồi xếp lại nhé." };
  return { ok: false, message: `Còn ${empty.length} ô chưa phủ. Kéo từ một ô sang ô bên cạnh để đặt viên gạch.` };
}

// ───────────────────────── Sơ đồ đoạn thẳng ─────────────────────────

/** Độ dài đoạn = a × x + b, với x là số con kéo. */
export type BarSegmentSpec = { a: number; b: number; text: (x: number) => string; variable?: boolean };
export type BarRowSpec = { label: string; segments: BarSegmentSpec[]; scaleMax?: number; target?: { value: number; text: string } };
export type BarSpec = {
  tool: "bar-model";
  variable: { min: number; max: number; start: number };
  rows: BarRowSpec[];
  /** Nút kéo nằm ngay sau đoạn thứ `after` của hàng `row`. */
  handle: { row: number; after: number };
  answer: number;
  readout: (x: number) => string;
  feedback: (x: number) => string;
};

export const segmentValue = (segment: BarSegmentSpec, x: number) => segment.a * x + segment.b;
export const rowTotal = (row: BarRowSpec, x: number) => row.segments.reduce((sum, segment) => sum + segmentValue(segment, x), 0);

export function checkBar(spec: BarSpec, x: number): LabCheck {
  return x === spec.answer ? { ok: true, message: spec.readout(x) } : { ok: false, message: spec.feedback(x) };
}

// ───────────────────────── Đồng hồ kéo kim ─────────────────────────

export type ClockSpec = {
  tool: "clock";
  hand: "minute" | "hour";
  /** Giờ bắt đầu, tính bằng phút từ 0:00. */
  start: number;
  /** Thời gian cần trôi qua: phút (kim phút) hoặc giờ (kim giờ). */
  elapsed: number;
  max: number;
  step: number;
};

export function clockText(minutes: number) {
  const day = ((minutes % 1440) + 1440) % 1440;
  const hour = Math.floor(day / 60) % 12 || 12;
  return `${hour}:${String(day % 60).padStart(2, "0")}`;
}

export function checkClock(spec: ClockSpec, elapsed: number): LabCheck {
  const unit = spec.hand === "minute" ? "phút" : "giờ";
  const now = spec.start + (spec.hand === "minute" ? elapsed : elapsed * 60);
  if (elapsed === spec.elapsed) {
    return spec.hand === "minute"
      ? { ok: true, message: `Đã trôi qua đúng ${elapsed} phút. Kim chỉ ${clockText(now)}.` }
      : { ok: true, message: `Kim giờ đã đi ${elapsed} giờ và đang chỉ ${Math.floor(now / 60) % 12 || 12} giờ.` };
  }
  if (elapsed < spec.elapsed) return { ok: false, message: `Mới trôi qua ${elapsed} ${unit}. Cần đi đủ ${spec.elapsed} ${unit}.` };
  return { ok: false, message: `Đã trôi qua ${elapsed} ${unit}, quá ${spec.elapsed} ${unit} rồi. Kéo kim lùi lại.` };
}

/** Bước kim mới so với bước cũ, đi theo đường ngắn nhất quanh mặt đồng hồ (để đếm được nhiều vòng). */
export function clockDelta(previous: number, next: number, positions: number) {
  let delta = next - previous;
  if (delta > positions / 2) delta -= positions;
  if (delta < -positions / 2) delta += positions;
  return delta;
}

// ───────────────────────── Biểu đồ cột tự dựng ─────────────────────────

export type ChartCategory = { name: string; icon: string; value: number };
export type ChartSpec = {
  tool: "bar-chart";
  title: string;
  categories: ChartCategory[];
  /** "ballots": phiếu xáo trộn để con đếm; "table": bảng số. */
  source: "ballots" | "table";
  max: number;
  /** Sau khi dựng đúng: vẽ lại cùng dữ liệu với trục bắt đầu từ số này (biểu đồ đánh lừa). */
  cutAxisFrom?: number;
  /** Sau khi dựng đúng: một biểu đồ khác để so sánh (ví dụ chỉ hỏi một nhóm). */
  reference?: { title: string; values: number[] };
};

/** Thứ tự phiếu xáo theo một quy tắc cố định: con phải đếm, không đọc theo nhóm. */
export function chartBallots(spec: ChartSpec) {
  const ballots = spec.categories.flatMap((category) => Array.from({ length: category.value }, () => category.icon));
  return ballots.map((icon, index) => ({ icon, order: (index * 7 + 3) % ballots.length })).sort((a, b) => a.order - b.order).map(({ icon }) => icon);
}

export function checkChart(spec: ChartSpec, values: number[]): LabCheck {
  if (values.every((value) => value === 0)) return { ok: false, message: "Kéo đỉnh từng cột lên cho bằng số liệu." };
  const wrong = spec.categories.find((category, index) => values[index] !== category.value);
  if (wrong) return { ok: false, message: `Cột “${wrong.name}” chưa khớp. ${spec.source === "ballots" ? `Đếm lại các phiếu ${wrong.icon} nhé.` : "Đọc lại con số trong bảng nhé."}` };
  return { ok: true, message: "Biểu đồ của con khớp với số liệu." };
}

// ───────────────────────── Học cụ của từng nhiệm vụ ─────────────────────────

export type LabToolSpec = GridSpec | BarSpec | ClockSpec | ChartSpec;
export type LabTool = {
  prompt: string;
  /** Tóm tắt lời giải (dùng cho trường `answer` của bài Tương tác). */
  answer: string;
  /** Lời giải thích hiện khi con làm đúng. */
  explanation: string;
  spec: LabToolSpec;
};

const plural = (x: number, unit: string) => `${x} ${unit}`;

export const LAB_TOOLS: Record<string, LabTool> = {
  "geometry-1": {
    prompt: "Kentro có 12 phiến đá vuông. Kéo trên lưới để vẽ tổ hình chữ nhật gồm đúng 12 ô. Tìm tổ có hàng rào ngắn nhất.",
    answer: "3x4",
    explanation: "Các tổ 1 × 12, 2 × 6, 3 × 4 đều có 12 ô. Tổ 3 × 4 có hai cạnh gần nhau nhất nên chu vi 14 là ngắn nhất.",
    spec: { tool: "grid", mode: "rect", rows: 5, cols: 12, unit: "ô", area: 12, best: "min-perimeter", solution: { w: 4, h: 3 } },
  },
  "geometry-2": {
    prompt: "Tấm giáp của Nodo gồm 12 ô. Chạm một ô để nhấc lên, chạm ô trống để đặt xuống. Dời ô để tạo hình mới. Diện tích và chu vi thay đổi ra sao?",
    answer: "giữ diện tích",
    explanation: "Dời ô không thêm, không bớt ô nào nên diện tích luôn là 12 ô. Chu vi thì có thể đổi theo hình dạng.",
    spec: {
      tool: "grid", mode: "move", rows: 5, cols: 7,
      start: [cellKey(1, 2), cellKey(1, 3), cellKey(1, 4), cellKey(1, 5), cellKey(2, 2), cellKey(2, 3), cellKey(2, 4), cellKey(2, 5), cellKey(3, 2), cellKey(3, 3), cellKey(3, 4), cellKey(3, 5)],
    },
  },
  "geometry-3": {
    prompt: "Vân trên cánh Ptero là lưới 2 × 3. Kéo để chọn từng hình chữ nhật con tìm thấy. Tìm hết, không bỏ sót.",
    answer: "18",
    explanation: "Lưới 2 × 3 có 18 hình chữ nhật. Theo cỡ: 6 hình 1 ô, 7 hình 2 ô, 2 hình 3 ô, 2 hình 4 ô, 1 hình 6 ô.",
    spec: { tool: "grid", mode: "find", rows: 2, cols: 3 },
  },
  "geometry-5": {
    prompt: "Sai muốn lát kín nền hang 3 × 4 ô bằng viên đá dài 2 ô. Kéo từ một ô sang ô bên cạnh để đặt viên đá. Lát kín, không chồng lên nhau.",
    answer: "6 viên",
    explanation: "6 viên đá 2 ô phủ kín 12 ô. Cạnh thẳng ghép khít vào nhau nên không để lại khe hở.",
    spec: { tool: "grid", mode: "domino", rows: 3, cols: 4 },
  },
  "geometry-6": {
    prompt: "Toro có 24 ô đá. Kéo trên lưới để vẽ sân hình chữ nhật gồm đúng 24 ô. Tìm sân có đường viền ngắn nhất.",
    answer: "4x6",
    explanation: "Các sân 2 × 12, 3 × 8, 4 × 6 đều có 24 ô. Sân 4 × 6 có hai cạnh gần nhau nhất nên chu vi 20 là ngắn nhất.",
    spec: { tool: "grid", mode: "rect", rows: 8, cols: 12, unit: "ô", area: 24, best: "min-perimeter", solution: { w: 6, h: 4 } },
  },
  "measurement-3": {
    prompt: "Có 24 m hàng rào làm ao cho Spino. Mỗi cạnh ô dài 1 m. Kéo trên lưới để vẽ ao hình chữ nhật có hàng rào đúng 24 m. Tìm ao rộng nhất.",
    answer: "6x6",
    explanation: "Các ao có hàng rào 24 m: 1 × 11, 2 × 10, 3 × 9, 4 × 8, 5 × 7, 6 × 6. Ao 6 × 6 rộng nhất: 36 m².",
    spec: { tool: "grid", mode: "rect", rows: 8, cols: 11, unit: "m", perimeter: 24, best: "max-area", solution: { w: 6, h: 6 } },
  },
  "word-1": {
    prompt: "Trood nhặt thêm 15 viên đá băng thì có 43 viên. Kéo đầu thanh “Lúc đầu” cho tới khi hai thanh dài bằng nhau.",
    answer: "28",
    explanation: "Hai thanh dài bằng nhau khi lúc đầu có 28 viên: 28 + 15 = 43. Đi ngược: 43 − 15 = 28.",
    spec: {
      tool: "bar-model",
      variable: { min: 0, max: 60, start: 10 },
      rows: [
        { label: "Lúc đầu, rồi nhặt thêm", segments: [{ a: 1, b: 0, text: (x) => (x ? String(x) : ""), variable: true }, { a: 0, b: 15, text: () => "15" }] },
        { label: "Cuối cùng", segments: [{ a: 0, b: 43, text: () => "43" }] },
      ],
      handle: { row: 0, after: 0 },
      answer: 28,
      readout: (x) => `Lúc đầu ${x} viên, nhặt thêm 15: ${x} + 15 = ${x + 15} viên.`,
      feedback: (x) => (x + 15 > 43 ? `${x} + 15 = ${x + 15}, nhiều hơn 43. Kéo ngắn lại.` : `${x} + 15 = ${x + 15}, còn ít hơn 43. Kéo dài thêm.`),
    },
  },
  "word-2": {
    prompt: "Có 6 con khủng long, tổng 18 chân. Kéo vạch chia giữa loài 2 chân và loài 4 chân cho tới khi đủ 18 chân.",
    answer: "3",
    explanation: "3 con đi 2 chân và 3 con đi 4 chân: 6 + 12 = 18 chân. Mỗi lần đổi một con 2 chân thành 4 chân, tổng tăng 2 chân.",
    spec: {
      tool: "bar-model",
      variable: { min: 0, max: 6, start: 0 },
      rows: [
        { label: "Số con", scaleMax: 6, segments: [{ a: -1, b: 6, text: (x) => (6 - x ? plural(6 - x, "con 2 chân") : "") }, { a: 1, b: 0, text: (x) => (x ? plural(x, "con 4 chân") : ""), variable: true }] },
        { label: "Số chân", scaleMax: 24, target: { value: 18, text: "18 chân" }, segments: [{ a: -2, b: 12, text: (x) => (6 - x ? String(2 * (6 - x)) : "") }, { a: 4, b: 0, text: (x) => (x ? String(4 * x) : "") }] },
      ],
      handle: { row: 0, after: 0 },
      answer: 3,
      readout: (x) => `${6 - x} con 2 chân và ${x} con 4 chân: ${2 * (6 - x)} + ${4 * x} = ${12 + 2 * x} chân.`,
      feedback: (x) => {
        const legs = 12 + 2 * x;
        return legs < 18
          ? `${2 * (6 - x)} + ${4 * x} = ${legs} chân, còn thiếu ${18 - legs}. Đổi thêm con 2 chân thành 4 chân.`
          : `${2 * (6 - x)} + ${4 * x} = ${legs} chân, thừa ${legs - 18}. Đổi bớt con 4 chân thành 2 chân.`;
      },
    },
  },
  "calculation-3": {
    prompt: "Vách đá của Allo: □ × 4 + 3 = 35. Kéo để đổi độ dài mỗi phần □ cho tới khi hai thanh dài bằng nhau.",
    answer: "8",
    explanation: "□ = 8 vì 8 × 4 + 3 = 35. Đi ngược: bớt 3 trước, rồi chia 4.",
    spec: {
      tool: "bar-model",
      variable: { min: 1, max: 12, start: 3 },
      rows: [
        { label: "□ × 4 + 3", segments: [1, 2, 3, 4].map((): BarSegmentSpec => ({ a: 1, b: 0, text: (x) => String(x), variable: true })).concat([{ a: 0, b: 3, text: () => "3" }]) },
        { label: "Kết quả", segments: [{ a: 0, b: 35, text: () => "35" }] },
      ],
      handle: { row: 0, after: 3 },
      answer: 8,
      readout: (x) => `□ = ${x}: ${x} × 4 + 3 = ${4 * x + 3}.`,
      feedback: (x) => (4 * x + 3 > 35 ? `${x} × 4 + 3 = ${4 * x + 3}, nhiều hơn 35. Thu ngắn mỗi phần.` : `${x} × 4 + 3 = ${4 * x + 3}, còn ít hơn 35. Kéo dài mỗi phần.`),
    },
  },
  "calculation-4": {
    prompt: "Eu có 38 hạt ở túi trái và 27 hạt ở túi phải. Kéo vạch chia để chuyển hạt sang túi trái cho tròn chục. Tổng có đổi không?",
    answer: "40 + 25",
    explanation: "Chuyển 2 hạt sang trái: 38 + 27 = 40 + 25 = 65. Tổng giữ nguyên, mà cộng số tròn chục dễ hơn hẳn.",
    spec: {
      tool: "bar-model",
      variable: { min: 0, max: 10, start: 0 },
      rows: [
        { label: "Hai túi", segments: [{ a: 1, b: 38, text: (x) => String(38 + x), variable: true }, { a: -1, b: 27, text: (x) => String(27 - x) }] },
        { label: "Tổng", segments: [{ a: 0, b: 65, text: () => "65" }] },
      ],
      handle: { row: 0, after: 0 },
      answer: 2,
      readout: (x) => `${38 + x} + ${27 - x} = 65.`,
      feedback: (x) => (x < 2 ? `Túi trái có ${38 + x} hạt, chưa tròn chục. Chuyển thêm sang trái.` : `Túi trái có ${38 + x} hạt, đã vượt số tròn chục gần nhất. Chuyển bớt về túi phải.`),
    },
  },
  "measurement-5": {
    prompt: "Ptera bắt đầu dạy con bay lúc 8:20 và dạy 35 phút. Kéo kim phút tới lúc buổi dạy kết thúc.",
    answer: "8:55",
    explanation: "Từ 8:20, thêm 35 phút là 8:55. Đếm theo mốc 5 phút: 8:25, 8:30, … đủ 7 mốc.",
    spec: { tool: "clock", hand: "minute", start: 8 * 60 + 20, elapsed: 35, max: 180, step: 5 },
  },
  "number-5": {
    prompt: "Bây giờ là 9 giờ. Trứng của Anky sẽ nở sau 15 giờ nữa. Kéo kim giờ đi đủ 15 giờ. Lúc trứng nở, đồng hồ chỉ mấy giờ?",
    answer: "12 giờ",
    explanation: "15 giờ = 12 giờ + 3 giờ. Kim giờ quay đủ một vòng 12 giờ thì về lại 9 giờ, đi thêm 3 giờ nữa là 12 giờ.",
    spec: { tool: "clock", hand: "hour", start: 9 * 60, elapsed: 15, max: 30, step: 1 },
  },
  "data-1": {
    prompt: "Hỏi 10 bạn khủng long ở Bờ Biển San Hô: “Bạn thích làm gì nhất?” Đếm phiếu rồi kéo đỉnh từng cột cho đúng.",
    answer: "6-3-1",
    explanation: "6 trong 10 bạn được hỏi thích tắm biển. Biểu đồ chỉ nói về 10 bạn này, chưa nói về những bạn chưa được hỏi.",
    spec: {
      tool: "bar-chart", title: "Hoạt động yêu thích (10 bạn)", source: "ballots", max: 10,
      categories: [{ name: "Tắm biển", icon: "🌊", value: 6 }, { name: "Leo núi", icon: "⛰️", value: 3 }, { name: "Đào cát", icon: "🏖️", value: 1 }],
    },
  },
  "data-4": {
    prompt: "Micro đếm dấu chân: thứ Hai có 48, thứ Ba có 50. Dựng hai cột cho đúng số liệu, rồi xem cùng dữ liệu trên trục khác.",
    answer: "48-50",
    explanation: "Hai cột thật chỉ chênh 2 dấu chân. Khi trục bắt đầu từ 45, cột thứ Ba trông cao hơn hẳn dù số liệu không đổi.",
    spec: {
      tool: "bar-chart", title: "Dấu chân mỗi ngày", source: "table", max: 60, cutAxisFrom: 45,
      categories: [{ name: "Thứ Hai", icon: "🐾", value: 48 }, { name: "Thứ Ba", icon: "🐾", value: 50 }],
    },
  },
  "data-6": {
    prompt: "Lepto hỏi 12 bạn ở cả ba tổ: “Bạn thích trò chơi nào nhất?” Đếm phiếu rồi dựng biểu đồ.",
    answer: "4-5-3",
    explanation: "Hỏi cả ba tổ thì Bơi được chọn nhiều nhất. Nếu chỉ hỏi đội chạy, ta sẽ tưởng cả đảo thích chạy đua.",
    spec: {
      tool: "bar-chart", title: "Trò chơi yêu thích (12 bạn, ba tổ)", source: "ballots", max: 8,
      categories: [{ name: "Chạy đua", icon: "🏃", value: 4 }, { name: "Bơi", icon: "🏊", value: 5 }, { name: "Đố vui", icon: "🧩", value: 3 }],
      reference: { title: "Nếu chỉ hỏi 6 bạn đội chạy", values: [6, 0, 0] },
    },
  },
};

// ───────────────────────── Lời giải mẫu (cho bộ kiểm định) ─────────────────────────

/** Chấm lời giải mẫu và một trạng thái sai điển hình của học cụ. */
export function labToolSelfCheck(spec: LabToolSpec): { solution: LabCheck; wrong: LabCheck } {
  if (spec.tool === "grid") {
    if (spec.mode === "rect") {
      const wrongRect = spec.area !== undefined ? { w: spec.area, h: 1 } : { w: spec.perimeter! / 2 - 1, h: 1 };
      return { solution: checkRect(spec, spec.solution), wrong: checkRect(spec, wrongRect) };
    }
    if (spec.mode === "move") {
      // Nhấc ô góc trên trái, đặt lên phía trên ô kế bên: vẫn liền khối, chu vi tăng thêm 2.
      const [row, col] = parseCell(spec.start[0]);
      const moved = [...spec.start.slice(1), cellKey(row - 1, col + 1)];
      return { solution: checkMove(spec, moved, false), wrong: checkMove(spec, spec.start, false) };
    }
    if (spec.mode === "find") {
      const all = allRects(spec.rows, spec.cols);
      return { solution: checkFind(spec, all), wrong: checkFind(spec, all.filter((key) => rectCells(key) === 1)) };
    }
    const tiling: Domino[] = [];
    for (let row = 0; row < spec.rows; row += 1) for (let col = 0; col + 1 < spec.cols; col += 2) tiling.push([cellKey(row, col), cellKey(row, col + 1)]);
    return { solution: checkDomino(spec, tiling), wrong: checkDomino(spec, tiling.slice(1)) };
  }
  if (spec.tool === "bar-model") return { solution: checkBar(spec, spec.answer), wrong: checkBar(spec, spec.answer === spec.variable.min ? spec.answer + 1 : spec.variable.min) };
  if (spec.tool === "clock") return { solution: checkClock(spec, spec.elapsed), wrong: checkClock(spec, spec.elapsed - spec.step) };
  return { solution: checkChart(spec, spec.categories.map((category) => category.value)), wrong: checkChart(spec, spec.categories.map((category, index) => category.value + (index === 0 ? 1 : 0))) };
}
