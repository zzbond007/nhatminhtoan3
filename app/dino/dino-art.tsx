// dino-art.tsx
// Vẽ khủng long bằng SVG tham số theo dáng giải phẫu thật: 6 dáng gốc (archetype)
// × đặc điểm riêng từng loài (features). Mỗi con có thân liền mạch, chuyển màu lưng–bụng
// (countershading), vân vảy mờ, chi phía xa tối hơn để tạo chiều sâu, mắt có gờ mày.
// Không dùng ảnh ngoài nên chạy được ngoại tuyến và không vướng bản quyền.

import { useId, type ReactNode } from "react";
import type { DinoStage } from "./dino-collection-engine";
import type { DinoKind, DinoFeature, DinoRareSpecies, DinoSpecies } from "./dino-species";

/** Màu gốc tự nhiên theo vùng: ô liu, nâu gỉ, xanh rêu, cát, đất nung, xám đá. */
const DOMAIN_HUES: Record<DinoSpecies["domain"], number> = {
  number: 92, calculation: 26, measurement: 158, geometry: 40, data: 12, word: 205,
};

/** Tỉ lệ theo giai đoạn: con non đầu và mắt to, gai/sừng nhỏ; trưởng thành cân đối và đủ trang trí. */
export const STAGE_SHAPE: Record<DinoStage, { scale: number; head: number; eye: number; feature: number }> = {
  trung: { scale: 0.55, head: 1.45, eye: 1.45, feature: 0.3 },
  "con-non": { scale: 0.62, head: 1.38, eye: 1.4, feature: 0.4 },
  "thieu-nien": { scale: 0.82, head: 1.15, eye: 1.15, feature: 0.72 },
  "truong-thanh": { scale: 1, head: 1, eye: 1, feature: 1 },
};

export function dinoHue(kind: DinoKind) {
  if ("hue" in kind) return (kind as DinoRareSpecies).hue;
  const species = kind as DinoSpecies;
  return DOMAIN_HUES[species.domain] + (species.slotInDomain - 3.5) * 9;
}

type Paint = {
  top: string; skin: string; belly: string; far: string; line: string;
  accent: string; accentLight: string; ivory: string; iris: string; texture: string; mouth: string;
};

function paint(kind: DinoKind, silhouette: boolean, shiny: boolean): Paint {
  if (silhouette) {
    const ink = "#2d3150";
    return { top: ink, skin: ink, belly: ink, far: "#242842", line: "#242842", accent: "#262a45", accentLight: "#2d3150", ivory: ink, iris: ink, texture: "transparent", mouth: ink };
  }
  const h = (dinoHue(kind) + (shiny ? 160 : 0) + 360) % 360;
  const a = (h + 26) % 360;
  return {
    top: `hsl(${h} 34% 29%)`,
    skin: `hsl(${h} 38% 45%)`,
    belly: `hsl(${(h + 10) % 360} 40% 74%)`,
    far: `hsl(${h} 30% 30%)`,
    line: `hsl(${h} 38% 17%)`,
    accent: `hsl(${a} 52% 40%)`,
    accentLight: `hsl(${a} 58% 60%)`,
    ivory: "#efe4c8",
    iris: shiny ? "#7fd3ff" : "#e7a93a",
    texture: `hsl(${h} 34% 20%)`,
    mouth: `hsl(${h} 30% 24%)`,
  };
}

type Ctx = { p: Paint; has: (feature: DinoFeature) => boolean; f: number; head: number; eye: number; silhouette: boolean };

type Drawing = {
  back?: ReactNode;   // sau thân: buồm, hàng tấm lưng phía xa, cánh phía xa
  far: ReactNode;     // chi phía xa (tối hơn)
  body: string;       // đường viền thân + đuôi + cổ, tô chuyển màu
  texture?: ReactNode; // vân da, cắt theo thân
  near: ReactNode;    // chi phía gần
  front?: ReactNode;  // trên thân: tấm lưng phía gần, giáp, cánh gần
  head: ReactNode;
};

/** Nhóm có tâm biến đổi riêng (đầu phóng to cho con non, gai co lại…). */
function Scaled({ cx, cy, s, children }: { cx: number; cy: number; s: number; children: ReactNode }) {
  return <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>;
}

function Eye({ x, y, r, ctx, brow = true }: { x: number; y: number; r: number; ctx: Ctx; brow?: boolean }) {
  const { p, eye } = ctx;
  const size = r * eye;
  if (ctx.silhouette) return <g className="dino-art-eye" />;
  return (
    <g className="dino-art-eye">
      <circle cx={x} cy={y} r={size + 0.9} fill={p.line} opacity={0.55} />
      <circle cx={x} cy={y} r={size} fill={p.iris} />
      <ellipse cx={x + size * 0.12} cy={y} rx={size * 0.34} ry={size * 0.78} fill="#1a1712" />
      <circle cx={x - size * 0.32} cy={y - size * 0.38} r={size * 0.3} fill="#fff" opacity={0.9} />
      {brow && <path d={`M${x - size * 1.4} ${y - size * 1.05} Q${x} ${y - size * 1.85} ${x + size * 1.5} ${y - size * 1.1}`} fill="none" stroke={p.top} strokeWidth={1.6} strokeLinecap="round" />}
    </g>
  );
}

function Claws({ points, ctx }: { points: Array<[number, number]>; ctx: Ctx }) {
  if (ctx.silhouette) return null;
  return <>{points.map(([x, y], index) => <path key={index} d={`M${x} ${y} q2.4 -0.4 3.2 1.8 l-3.4 0.2 Z`} fill={ctx.p.ivory} stroke={ctx.p.line} strokeWidth={0.4} />)}</>;
}

/** Chân cột (khủng long đi bốn chân) có khớp gối nhẹ, bàn chân loe và móng. */
function Column({ x, top, w, fill, ctx }: { x: number; top: number; w: number; fill: string; ctx: Ctx }) {
  const b = 110;
  return (
    <g>
      <path d={`M${x} ${top} C${x - 2} ${top + 10} ${x + 1} ${b - 14} ${x - 1} ${b - 5} Q${x - 2} ${b} ${x + 2} ${b} L${x + w + 2} ${b} Q${x + w + 4} ${b} ${x + w + 2} ${b - 5} C${x + w} ${b - 14} ${x + w + 2} ${top + 10} ${x + w} ${top} Z`} fill={fill} stroke={ctx.p.line} strokeWidth={0.9} strokeLinejoin="round" />
      <Claws points={[[x, b - 1.2], [x + w * 0.45, b - 1.2]]} ctx={ctx} />
    </g>
  );
}

/** Chân sau kiểu khủng long đi hai chân: đùi cơ bắp, cẳng chân chéo, bàn chân ba ngón. */
function HindLeg({ hx, hy, fill, ctx, slim = false, sickle = false }: { hx: number; hy: number; fill: string; ctx: Ctx; slim?: boolean; sickle?: boolean }) {
  const t = slim ? 0.62 : 1;
  const knee = hy + 22;
  return (
    <g>
      <path d={`M${hx - 2 * t} ${knee - 3} C${hx + 3 * t} ${knee - 2} ${hx + 6 * t} ${knee} ${hx + 5 * t} ${knee + 4} C${hx + 3} 95 ${hx + 2} 99 ${hx + 1.5} 101.5 L${hx + 11} 108 Q${hx + 13} 110 ${hx + 10} 110 L${hx - 6} 110 Q${hx - 8.5} 110 ${hx - 7} 106.5 L${hx - 5} 101 C${hx - 5} 96 ${hx - 4 * t} ${knee + 4} ${hx - 2 * t} ${knee - 3} Z`} fill={fill} stroke={ctx.p.line} strokeWidth={0.9} strokeLinejoin="round" />
      <path d={`M${hx - 12 * t} ${hy - 4} C${hx - 17 * t} ${hy + 10} ${hx - 9 * t} ${knee + 3} ${hx + 1 * t} ${knee + 2} C${hx + 10 * t} ${knee + 1} ${hx + 14 * t} ${hy + 12} ${hx + 9 * t} ${hy - 1} C${hx + 5 * t} ${hy - 9} ${hx - 7 * t} ${hy - 10} ${hx - 12 * t} ${hy - 4} Z`} fill={fill} stroke={ctx.p.line} strokeWidth={0.8} strokeOpacity={0.45} strokeLinejoin="round" />
      <Claws points={[[hx + 9, 108.6], [hx + 3, 108.8]]} ctx={ctx} />
      {sickle && !ctx.silhouette && <path d={`M${hx - 2} 103 q3 -6 7 -4 q-3 1 -4.5 5 Z`} fill={ctx.p.ivory} stroke={ctx.p.line} strokeWidth={0.5} />}
    </g>
  );
}

function scalesTexture(ctx: Ctx, rows: Array<[number, number, number]>) {
  if (ctx.silhouette) return null;
  // rows: [y, xStart, xEnd] — chấm vảy so le theo hàng.
  return <g fill={ctx.p.texture} opacity={0.16}>{rows.flatMap(([y, x0, x1], row) => Array.from({ length: Math.max(0, Math.floor((x1 - x0) / 5)) }, (_, index) => <ellipse key={`${row}-${index}`} cx={x0 + index * 5 + (row % 2) * 2.5} cy={y} rx={1.5} ry={1.1} />))}</g>;
}

function stripes(ctx: Ctx, xs: number[], top: number, bottom: number) {
  if (ctx.silhouette) return null;
  return <g stroke={ctx.p.top} strokeWidth={3.4} strokeLinecap="round" opacity={0.42}>{xs.map((x) => <path key={x} d={`M${x} ${top} q-2 ${(bottom - top) / 2} -1 ${bottom - top}`} fill="none" />)}</g>;
}

// ===== 1. Săn mồi lớn (Tyrannosaurus, Allosaurus, Spinosaurus…) =====
function predator(ctx: Ctx): Drawing {
  const { p, has, f, head } = ctx;
  const snout = has("longSnout") ? 12 : 0;
  const body = "M103 43 C95 45 88 51 80 53 C68 55 57 53 45 55 C31 57 16 57 2 54 C15 61 30 66 45 70 C53 76 61 84 74 84 C86 84 94 78 96 70 C98 64 103 60 110 58 Z";
  return {
    back: has("sail") && <Scaled cx={72} cy={54} s={f}>
      <path d="M46 56 C50 34 60 16 72 14 C86 14 96 34 98 54 Z" fill={p.accent} stroke={p.line} strokeWidth={0.9} />
      {!ctx.silhouette && <path d="M54 55 L57 30 M62 54 L64 20 M72 53 L72 16 M82 53 L81 20 M90 54 L88 32" stroke={p.accentLight} strokeWidth={1.4} opacity={0.6} />}
    </Scaled>,
    far: <>
      <HindLeg hx={56} hy={70} fill={p.far} ctx={ctx} sickle={has("sickleClaw")} />
      <path d="M90 72 q4 5 2 10" stroke={p.far} strokeWidth={has("tinyArms") ? 2.2 : 2.8} fill="none" strokeLinecap="round" />
    </>,
    body,
    texture: <>
      {scalesTexture(ctx, [[58, 30, 90], [63, 40, 94], [68, 50, 92], [73, 58, 88]])}
      {has("feathers") && !ctx.silhouette && <path d="M8 55 l-5 -5 M16 56 l-4 -6 M24 57 l-3 -6 M50 54 l-2 -6 M58 53 l-1 -6 M66 53 l0 -6" stroke={p.accent} strokeWidth={2.2} strokeLinecap="round" opacity={0.9} />}
    </>,
    near: <>
      <HindLeg hx={66} hy={68} fill={p.skin} ctx={ctx} sickle={has("sickleClaw")} />
      <path d={has("tinyArms") ? "M94 71 q3 3 2 6" : "M94 70 q7 5 5 12"} stroke={p.skin} strokeWidth={has("tinyArms") ? 2.6 : 3.4} fill="none" strokeLinecap="round" />
      {!has("tinyArms") && <Claws points={[[98, 81]]} ctx={ctx} />}
    </>,
    head: <Scaled cx={108} cy={50} s={head}>
      <path d={`M99 43 C102 34 113 31 124 33 C${132 + snout} 34 ${138 + snout} 38 ${139 + snout} 43 C${139 + snout} 47 ${136 + snout} 50 ${131 + snout} 51 L108 55 C102 55 98 50 99 43 Z`} fill={p.skin} stroke={p.line} strokeWidth={1} strokeLinejoin="round" />
      <path d={`M107 52 L${131 + snout} 51 C${129 + snout} 55 ${123 + snout} 58 112 58 C108 58 106 55 107 52 Z`} fill={p.belly} stroke={p.line} strokeWidth={0.9} />
      {has("teeth") && !ctx.silhouette && <path d={`M113 51.3 l1.2 2.2 l1.2 -2.2 l1.2 2.2 l1.2 -2.2 l1.2 2.2 l1.2 -2.2 l1.2 2.2 l1.2 -2.2${snout ? " l1.2 2.2 l1.2 -2.2 l1.2 2.2 l1.2 -2.2" : ""}`} fill={p.ivory} stroke={p.ivory} strokeWidth={0.6} strokeLinejoin="round" />}
      {!ctx.silhouette && <path d={`M${136 + snout} 40 q1 1 0 2`} stroke={p.line} strokeWidth={1.2} strokeLinecap="round" fill="none" />}
      {has("browCrest") && <path d="M106 34 l2 -4 l2 3 l2 -4 l2 3 l2 -3 l1 4" fill={p.accent} stroke={p.line} strokeWidth={0.7} strokeLinejoin="round" />}
      {has("browHorns") && <path d="M106 35 C104 28 105 24 108 21 C109 26 110 30 111 34 Z M113 34 C113 27 115 23 119 21 C118 26 117 30 117 34 Z" fill={p.ivory} stroke={p.line} strokeWidth={0.8} />}
      {has("noseHorn") && <path d={`M${125 + snout} 34 C${126 + snout} 28 ${128 + snout} 25 ${131 + snout} 23 C${130 + snout} 28 ${130 + snout} 32 ${130 + snout} 35 Z`} fill={p.ivory} stroke={p.line} strokeWidth={0.8} />}
      {has("doubleCrest") && <path d="M101 38 C104 24 116 18 130 26 C120 26 112 30 106 40 Z M104 40 C108 28 120 24 134 32 C124 32 116 35 110 42 Z" fill={p.accent} stroke={p.line} strokeWidth={0.8} />}
      <Eye x={111} y={40} r={2.6} ctx={ctx} />
    </Scaled>,
  };
}

// ===== 2. Khủng long sừng (Triceratops, Styracosaurus, Torosaurus…) =====
function horn(ctx: Ctx): Drawing {
  const { p, has, f, head } = ctx;
  // Diềm lớn (Torosaurus), diềm thường, hoặc diềm nhỏ của loài sừng nguyên thuỷ có mỏ (Leptoceratops).
  const big = has("bigFrill") ? 1.22 : has("beak") ? 0.68 : 1;
  const frillSpikes = has("frillSpikes");
  return {
    far: <>
      <Column x={48} top={82} w={10} fill={p.far} ctx={ctx} />
      <Column x={88} top={82} w={9} fill={p.far} ctx={ctx} />
    </>,
    body: "M40 70 C32 70 20 73 8 79 C19 83 31 85 42 86 C48 94 60 97 72 97 C87 97 99 93 104 85 C108 77 106 66 100 60 C90 52 70 49 56 53 C48 55 43 61 40 70 Z",
    texture: <>{scalesTexture(ctx, [[58, 50, 96], [64, 42, 102], [70, 40, 104], [76, 42, 102], [82, 46, 100]])}</>,
    near: <>
      <Column x={58} top={80} w={12} fill={p.skin} ctx={ctx} />
      <Column x={96} top={82} w={10} fill={p.skin} ctx={ctx} />
    </>,
    head: <Scaled cx={112} cy={72} s={head}>
      {has("frill") && <Scaled cx={104} cy={62} s={0.55 + 0.45 * f}>
        {frillSpikes && <g fill={p.ivory} stroke={p.line} strokeWidth={0.7}>
          {[[-150, 11], [-122, 14], [-95, 15], [-68, 14], [-42, 11]].map(([deg, len]) => {
            const rad = (deg * Math.PI) / 180;
            const rx = 16 * big, ry = 21 * big;
            const bx = 104 + Math.cos(rad) * rx, by = 62 + Math.sin(rad) * ry;
            const tx = 104 + Math.cos(rad) * (rx + len), ty = 62 + Math.sin(rad) * (ry + len);
            const nx = -Math.sin(rad) * 2.6, ny = Math.cos(rad) * 2.6;
            return <path key={deg} d={`M${bx + nx} ${by + ny} L${tx} ${ty} L${bx - nx} ${by - ny} Z`} />;
          })}
        </g>}
        <ellipse cx={104} cy={62} rx={16 * big} ry={21 * big} transform="rotate(-18 104 62)" fill={p.accent} stroke={p.line} strokeWidth={1} />
        {!ctx.silhouette && <>
          <ellipse cx={104} cy={62} rx={11 * big} ry={15 * big} transform="rotate(-18 104 62)" fill={p.accentLight} opacity={0.5} />
          <path d={`M${104 - 13 * big} ${62 - 10 * big} q-2 3 0 6 M${104 - 15 * big} ${62 + 2} q-2 3 0 6 M${104 - 6 * big} ${62 - 19 * big} q3 -1 5 1`} stroke={p.line} strokeWidth={1} fill="none" opacity={0.5} />
        </>}
      </Scaled>}
      <path d={`M98 64 C106 57 120 58 128 64 C134 68 ${has("beak") ? 140 : 138} 73 ${has("beak") ? 138 : 136} 79 C133 84 125 87 116 87 C106 87 98 79 98 64 Z`} fill={p.skin} stroke={p.line} strokeWidth={1} strokeLinejoin="round" />
      {!ctx.silhouette && <path d="M114 82 C120 83 126 82 132 80" stroke={p.mouth} strokeWidth={1.1} fill="none" strokeLinecap="round" />}
      <path d={`M${has("beak") ? 133 : 131} 71 C${has("beak") ? 142 : 138} 73 ${has("beak") ? 142 : 139} 80 134 84 L130 80 Z`} fill={p.top} stroke={p.line} strokeWidth={0.8} />
      {has("browHorns") && <Scaled cx={114} cy={62} s={0.35 + 0.65 * f}>
        <path d="M110 63 C112 51 119 42 131 34 C124 43 120 53 118 64 Z" fill={p.ivory} stroke={p.line} strokeWidth={0.9} />
        {!ctx.silhouette && <path d="M113 60 C116 52 121 45 127 39" stroke="#c9b58a" strokeWidth={1} fill="none" />}
      </Scaled>}
      {has("noseHorn") && <Scaled cx={128} cy={68} s={0.35 + 0.65 * f}><path d="M124 68 C125 60 128 55 133 50 C132 57 131 64 131 69 Z" fill={p.ivory} stroke={p.line} strokeWidth={0.9} /></Scaled>}
      <Eye x={114} y={69} r={2.4} ctx={ctx} />
    </Scaled>,
  };
}

// ===== 3. Chân thằn lằn cổ dài (Brachiosaurus, Diplodocus, Argentinosaurus…) =====
function longneck(ctx: Ctx): Drawing {
  const { p, has, f, head } = ctx;
  const lift = has("tallFront") ? 7 : 0;
  const arch = has("archNeck");
  const tip: [number, number] = arch ? [128, 14] : has("tallFront") ? [116, 12] : [120, 22];
  const whip = has("whipTail");
  const tailTip = whip ? "-8 66" : "2 72";
  // Một đường liền: gốc đuôi → chóp đuôi → bụng → ngực → mép trước cổ → đầu → mép sau cổ → lưng.
  const body = `M36 68 C24 66 12 67 ${tailTip} C12 76 24 81 36 84 C42 93 56 96 70 96 C84 96 96 ${92 - lift} 100 ${84 - lift} `
    + `C104 ${74 - lift} ${tip[0] + 2} ${tip[1] + (arch ? 32 : 28)} ${tip[0] + 4} ${tip[1] + 6} L${tip[0] - 6} ${tip[1] + 2} `
    + `C${tip[0] - 10} ${tip[1] + 20} 98 ${52 - lift} 84 ${55 - lift} C70 ${53 - lift / 2} 48 56 36 68 Z`;
  return {
    back: has("neckSpines") && <Scaled cx={100} cy={48} s={f}>
      <g fill={p.accent} stroke={p.line} strokeWidth={0.7}>
        {[[88, 62, -8], [95, 56, -4], [101, 48, 0], [106, 40, 4], [110, 32, 8], [74, 58, -6], [64, 58, -10]].map(([x, y, tilt], index) => <path key={index} d={`M${x - 2.4} ${y} L${x + tilt * 0.6} ${y - 15} L${x + 2.4} ${y} Z`} />)}
      </g>
    </Scaled>,
    far: <>
      <Column x={42} top={84} w={11} fill={p.far} ctx={ctx} />
      <Column x={82} top={84 - lift} w={11} fill={p.far} ctx={ctx} />
    </>,
    body,
    texture: <>{scalesTexture(ctx, [[62, 44, 84], [68, 36, 92], [74, 34, 96], [80, 36, 96], [86, 44, 92]])}</>,
    near: <>
      <Column x={54} top={82} w={13} fill={p.skin} ctx={ctx} />
      <Column x={92} top={82 - lift} w={12} fill={p.skin} ctx={ctx} />
    </>,
    head: <Scaled cx={tip[0] + 2} cy={tip[1]} s={head}>
      {has("wideMouth")
        ? <path d={`M${tip[0] - 7} ${tip[1] - 5} C${tip[0]} ${tip[1] - 9} ${tip[0] + 12} ${tip[1] - 8} ${tip[0] + 15} ${tip[1] - 5} L${tip[0] + 16} ${tip[1] + 5} C${tip[0] + 8} ${tip[1] + 8} ${tip[0]} ${tip[1] + 8} ${tip[0] - 6} ${tip[1] + 6} Z`} fill={p.skin} stroke={p.line} strokeWidth={0.9} />
        : <path d={`M${tip[0] - 8} ${tip[1] + 2} C${tip[0] - 7} ${tip[1] - 7} ${tip[0] + 5} ${tip[1] - 9} ${tip[0] + 12} ${tip[1] - 3} C${tip[0] + 15} ${tip[1]} ${tip[0] + 14} ${tip[1] + 5} ${tip[0] + 9} ${tip[1] + 6} C${tip[0] + 2} ${tip[1] + 7} ${tip[0] - 6} ${tip[1] + 7} ${tip[0] - 8} ${tip[1] + 2} Z`} fill={p.skin} stroke={p.line} strokeWidth={0.9} />}
      {has("tallFront") && !ctx.silhouette && <path d={`M${tip[0] - 2} ${tip[1] - 6} q4 -6 9 -2`} fill={p.skin} stroke={p.line} strokeWidth={0.8} />}
      {has("wideMouth") && !ctx.silhouette && <path d={`M${tip[0] + 15} ${tip[1] - 3} l0 7`} stroke={p.ivory} strokeWidth={1.6} strokeDasharray="1 0.8" />}
      {!ctx.silhouette && <path d={`M${tip[0] + 2} ${tip[1] + 4} q5 1 10 -1`} stroke={p.mouth} strokeWidth={0.8} fill="none" />}
      <Eye x={tip[0] + 1} y={tip[1] - 1} r={1.9} ctx={ctx} brow={false} />
    </Scaled>,
  };
}

// ===== 4. Tấm lưng và giáp (Stegosaurus, Ankylosaurus, Kentrosaurus…) =====
function plate(ctx: Ctx): Drawing {
  const { p, has, f, head } = ctx;
  const backPlates: Array<[number, number, number]> = [[42, 66, 9], [52, 59, 13], [63, 55, 16], [74, 55, 15], [85, 59, 12], [95, 66, 8]];
  const kite = (x: number, y: number, h: number, shade: string, key: string) => <path key={key} d={`M${x - h * 0.42} ${y + 3} C${x - h * 0.5} ${y - h * 0.4} ${x - h * 0.2} ${y - h * 0.95} ${x + h * 0.08} ${y - h} C${x + h * 0.4} ${y - h * 0.7} ${x + h * 0.5} ${y - h * 0.2} ${x + h * 0.42} ${y + 3} Z`} fill={shade} stroke={p.line} strokeWidth={0.8} />;
  return {
    back: <>
      {has("plates") && <Scaled cx={68} cy={62} s={f}>{backPlates.map(([x, y, h], index) => kite(x + 4, y - 1, h * 0.85, p.accent, `bp-${index}`))}</Scaled>}
      {has("club") && <Scaled cx={6} cy={76} s={0.5 + 0.5 * f}><path d="M-2 76 C-2 69 4 67 8 70 C11 67 16 69 16 75 C16 81 11 83 8 80 C4 83 -2 82 -2 76 Z" fill={p.top} stroke={p.line} strokeWidth={0.9} /></Scaled>}
      {has("tailSpikes") && <Scaled cx={10} cy={76} s={f}><g fill={p.ivory} stroke={p.line} strokeWidth={0.7}><path d="M8 75 L-4 62 L12 72 Z" /><path d="M14 75 L4 60 L17 72 Z" /><path d="M8 79 L-5 86 L11 80 Z" /><path d="M14 80 L4 90 L17 80 Z" /></g></Scaled>}
    </>,
    far: <>
      <Column x={46} top={86} w={10} fill={p.far} ctx={ctx} />
      <Column x={86} top={86} w={9} fill={p.far} ctx={ctx} />
    </>,
    body: "M30 84 C33 66 52 55 72 55 C91 55 104 66 108 78 C112 80 118 82 123 83 C127 85 127 90 122 92 C116 94 108 92 104 89 C96 94 84 96 70 96 C54 96 40 94 34 90 C24 88 14 84 4 76 C14 80 22 82 30 84 Z",
    texture: <>
      {scalesTexture(ctx, [[64, 50, 94], [70, 40, 102], [76, 36, 104], [82, 34, 104], [88, 38, 100]])}
      {has("armor") && !ctx.silhouette && <g fill={p.accent} stroke={p.line} strokeWidth={0.5} opacity={0.75}>
        {[[42, 76], [49, 69], [57, 64], [65, 61], [73, 60], [81, 61], [89, 64], [96, 69], [102, 75], [46, 83], [54, 77], [62, 73], [70, 71], [78, 71], [86, 73], [94, 77], [52, 88], [60, 83], [68, 80], [76, 80], [84, 82], [92, 86]].map(([x, y], index) => has("blocks")
          ? <rect key={index} x={x - 2.6} y={y - 2.2} width={5.2} height={4.4} rx={1.1} />
          : <ellipse key={index} cx={x} cy={y} rx={2.8} ry={2.2} />)}
      </g>}
    </>,
    near: <>
      <Column x={56} top={86} w={12} fill={p.skin} ctx={ctx} />
      <Column x={94} top={86} w={11} fill={p.skin} ctx={ctx} />
    </>,
    front: <>
      {has("plates") && <Scaled cx={68} cy={62} s={f}>{backPlates.map(([x, y, h], index) => kite(x, y, h, p.accentLight, `fp-${index}`))}</Scaled>}
      {has("shoulderSpikes") && <Scaled cx={96} cy={72} s={f}><path d="M92 72 C98 64 104 58 112 52 C108 60 102 68 98 76 Z" fill={p.ivory} stroke={p.line} strokeWidth={0.8} /></Scaled>}
      {has("armor") && <Scaled cx={70} cy={80} s={f}><g fill={p.ivory} stroke={p.line} strokeWidth={0.6}>{[[40, 84], [52, 90], [88, 90], [100, 84]].map(([x, y], index) => <path key={index} d={`M${x - 3} ${y} L${x + (x < 70 ? -6 : 6)} ${y + 5} L${x + 3} ${y + 1} Z`} />)}</g></Scaled>}
    </>,
    head: <Scaled cx={118} cy={86} s={head}>
      <path d="M110 80 C116 77 124 79 128 84 C130 88 127 92 121 92 C115 92 110 89 109 85 Z" fill={p.skin} stroke={p.line} strokeWidth={0.9} />
      {!ctx.silhouette && <path d="M118 89 q5 1 9 -1" stroke={p.mouth} strokeWidth={0.8} fill="none" />}
      <Eye x={119} y={83.5} r={1.8} ctx={ctx} />
    </Scaled>,
  };
}

// ===== 5. Nhanh nhẹn: chim-khủng long và thằn lằn bay (Velociraptor, Gallimimus, Pteranodon…) =====
function flock(ctx: Ctx): Drawing {
  const { p, has, f, head } = ctx;
  if (has("wings")) {
    const span = 0.55 + 0.45 * f;
    return {
      back: <Scaled cx={72} cy={62} s={span}>
        <path d="M70 60 C56 46 36 34 10 28 C22 40 36 52 44 58 C52 64 60 70 66 72 Z" fill={p.accent} stroke={p.line} strokeWidth={0.9} />
        {!ctx.silhouette && <path d="M70 60 C56 46 36 34 10 28" stroke={p.top} strokeWidth={2} fill="none" />}
      </Scaled>,
      far: <path d="M68 74 l-3 10 l-3 2" stroke={p.far} strokeWidth={2.2} fill="none" strokeLinecap="round" />,
      body: "M60 66 C62 58 70 55 78 56 C86 57 90 62 88 68 C86 74 78 78 70 77 C64 76 59 72 60 66 Z",
      texture: <>{has("feathers") && !ctx.silhouette && <g fill={p.accentLight} opacity={0.45}><ellipse cx={72} cy={62} rx={7} ry={3} /></g>}</>,
      near: <path d="M76 76 l1 10 l3 2" stroke={p.skin} strokeWidth={2.4} fill="none" strokeLinecap="round" />,
      front: <Scaled cx={78} cy={62} s={span}>
        <path d="M80 59 C96 44 118 32 150 28 C136 42 118 56 102 64 C94 68 86 71 80 72 Z" fill={p.accentLight} stroke={p.line} strokeWidth={0.9} />
        {!ctx.silhouette && <path d="M80 59 C96 44 118 32 150 28 M86 66 C100 58 116 50 132 42" stroke={p.accent} strokeWidth={1.2} fill="none" opacity={0.7} />}
      </Scaled>,
      head: <Scaled cx={88} cy={52} s={head}>
        <path d="M82 60 C84 54 88 50 92 50 L94 56 C90 58 86 61 84 64 Z" fill={p.skin} stroke={p.line} strokeWidth={0.8} />
        <path d="M86 50 C90 45 97 44 101 47 L132 52 L101 55 C95 56 88 55 86 50 Z" fill={p.skin} stroke={p.line} strokeWidth={0.9} strokeLinejoin="round" />
        {has("crest") && <path d="M88 47 C82 38 74 32 62 30 C72 36 80 42 86 50 Z" fill={p.accent} stroke={p.line} strokeWidth={0.8} />}
        {!ctx.silhouette && <path d="M101 52 L128 52" stroke={p.mouth} strokeWidth={0.7} />}
        <Eye x={95} y={49} r={1.9} ctx={ctx} />
      </Scaled>,
    };
  }
  const neck = has("longNeck") ? 8 : 0;
  return {
    back: has("feathers") && !ctx.silhouette && <g stroke={p.accent} strokeWidth={2} strokeLinecap="round">
      <path d="M6 54 l-6 -3 M10 57 l-7 1 M14 55 l-5 -5 M18 58 l-6 1" />
    </g>,
    far: <>
      <HindLeg hx={60} hy={66} fill={p.far} ctx={ctx} slim sickle={has("sickleClaw")} />
      <path d={has("bigClaws") ? "M88 64 q6 5 4 12 M90 64 q8 3 8 11" : "M88 64 q6 4 4 10"} stroke={p.far} strokeWidth={2.2} fill="none" strokeLinecap="round" />
    </>,
    body: `M${96} ${42 - neck} C91 ${48 - neck / 2} 86 54 77 57 C67 59 57 59 46 59 C32 59 18 57 4 53 C18 60 31 65 45 67 C55 72 66 75 77 73 C86 71 92 64 ${99} ${48 - neck / 2} Z`,
    texture: <>
      {scalesTexture(ctx, [[58, 44, 84], [63, 50, 88], [68, 58, 84]])}
      {has("stripes") && stripes(ctx, [50, 58, 66, 74], 56, 70)}
      {has("ringTail") && !ctx.silhouette && <g stroke={p.top} strokeWidth={3.2} opacity={0.6}><path d="M10 52 l2 8 M18 54 l2 8 M26 55 l2 8 M34 56 l2 9" /></g>}
      {has("feathers") && !ctx.silhouette && <g fill={p.accentLight} opacity={0.35}><ellipse cx={70} cy={60} rx={14} ry={4} /></g>}
    </>,
    near: <>
      <HindLeg hx={68} hy={64} fill={p.skin} ctx={ctx} slim sickle={has("sickleClaw")} />
      <path d={has("bigClaws") ? "M90 62 q9 5 8 14 M92 62 q11 2 12 12" : "M90 62 q7 4 6 11"} stroke={p.skin} strokeWidth={2.8} fill="none" strokeLinecap="round" />
      {has("bigClaws") && !ctx.silhouette && <path d="M98 76 q1 5 -2 8 M104 74 q2 5 -1 9" stroke={p.ivory} strokeWidth={1.6} fill="none" strokeLinecap="round" />}
      {has("feathers") && !ctx.silhouette && <path d="M90 62 q4 8 10 10" stroke={p.accent} strokeWidth={3.2} fill="none" strokeLinecap="round" opacity={0.85} />}
    </>,
    head: <Scaled cx={102} cy={42 - neck} s={head}>
      <path d={`M93 ${41 - neck} C96 ${34 - neck} 105 ${32 - neck} 113 ${35 - neck} C118 ${37 - neck} 121 ${40 - neck} 119 ${43 - neck} L101 ${47 - neck} C96 ${47 - neck} 92 ${45 - neck} 93 ${41 - neck} Z`} fill={p.skin} stroke={p.line} strokeWidth={0.9} strokeLinejoin="round" />
      {!ctx.silhouette && <path d={`M103 ${44.5 - neck} L118 ${42 - neck}`} stroke={p.mouth} strokeWidth={0.7} />}
      {has("crest") && <path d={`M97 ${36 - neck} C98 ${26 - neck} 104 ${22 - neck} 111 ${25 - neck} C107 ${28 - neck} 105 ${32 - neck} 105 ${36 - neck} Z`} fill={p.accent} stroke={p.line} strokeWidth={0.8} />}
      {has("feathers") && !ctx.silhouette && <path d={`M93 ${38 - neck} l-5 -3 M93 ${41 - neck} l-6 0`} stroke={p.accent} strokeWidth={1.8} strokeLinecap="round" />}
      <Eye x={102} y={39 - neck} r={has("bigEyes") ? 2.7 : 2} ctx={ctx} />
    </Scaled>,
  };
}

// ===== 6. Chân chim ăn cỏ (Parasaurolophus, Iguanodon, Pachycephalosaurus…) =====
function stripe(ctx: Ctx): Drawing {
  const { p, has, f, head } = ctx;
  const stiff = has("stiffTail");
  const tail = stiff ? "C30 60 16 60 3 60 C16 66 30 70 44 73" : "C30 60 16 60 4 57 C16 65 30 71 44 74";
  return {
    back: <>
      {has("sail") && <Scaled cx={70} cy={56} s={f}><path d="M46 60 C52 42 62 34 72 34 C84 34 92 44 96 58 Z" fill={p.accent} stroke={p.line} strokeWidth={0.9} /></Scaled>}
    </>,
    far: <>
      <HindLeg hx={58} hy={70} fill={p.far} ctx={ctx} />
      <path d="M90 72 C94 82 94 94 96 105 l4 1" stroke={p.far} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    body: `M101 46 C95 51 89 56 80 57 C67 55 55 55 44 58 ${tail} C54 84 67 90 80 88 C92 86 99 76 105 60 Z`,
    texture: <>
      {scalesTexture(ctx, [[62, 46, 92], [67, 52, 94], [72, 56, 92], [77, 62, 88]])}
      {has("stripes") && stripes(ctx, [52, 60, 68, 76, 84], 58, 80)}
    </>,
    near: <>
      <HindLeg hx={68} hy={68} fill={p.skin} ctx={ctx} />
      <path d="M95 72 C99 82 99 94 101 105 l5 1" stroke={p.skin} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {has("thumbSpike") && <Scaled cx={100} cy={98} s={f}><path d="M99 98 L106 92 L103 101 Z" fill={p.ivory} stroke={p.line} strokeWidth={0.7} /></Scaled>}
    </>,
    head: <Scaled cx={112} cy={48} s={head}>
      {has("tubeCrest") && <Scaled cx={104} cy={42} s={0.45 + 0.55 * f}>
        <path d="M103 43 C94 32 82 26 68 23 C66 26 67 29 70 30 C84 33 94 40 101 49 Z" fill={p.accent} stroke={p.line} strokeWidth={0.9} />
      </Scaled>}
      {has("dome")
        ? <path d="M96 49 C95 36 104 29 114 30 C124 31 128 38 128 46 C131 49 130 54 125 55 L104 56 C99 56 96 53 96 49 Z" fill={p.skin} stroke={p.line} strokeWidth={1} />
        : <path d={`M97 46 C100 38 110 36 120 39 C126 41 ${has("duckbill") ? 134 : 130} 44 ${has("duckbill") ? 135 : 131} 49 C${has("duckbill") ? 131 : 128} 53 118 55 106 55 C100 55 96 51 97 46 Z`} fill={p.skin} stroke={p.line} strokeWidth={1} strokeLinejoin="round" />}
      {has("dome") && !ctx.silhouette && <>
        <path d="M100 40 C104 31 118 28 125 38" stroke={p.accentLight} strokeWidth={3.2} fill="none" strokeLinecap="round" opacity={0.8} />
        <g fill={p.ivory} stroke={p.line} strokeWidth={0.5}><circle cx={98} cy={44} r={1.4} /><circle cx={126} cy={42} r={1.3} /><circle cx={100} cy={38} r={1.2} /></g>
      </>}
      {has("duckbill") && !ctx.silhouette && <path d="M122 50 C128 49 132 50 134 52" stroke={p.mouth} strokeWidth={1} fill="none" />}
      {!has("duckbill") && !ctx.silhouette && <path d="M110 52 C116 53 122 52 128 50" stroke={p.mouth} strokeWidth={0.9} fill="none" />}
      <Eye x={110} y={43} r={2.3} ctx={ctx} />
    </Scaled>,
  };
}

const DRAWERS = { predator, horn, longneck, plate, flock, stripe } as const;

function svgId(raw: string) {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "");
}

export function DinoFigure({
  kind, stage = "truong-thanh", silhouette = false, shiny = false, animated = false, title, className = "",
}: {
  kind: DinoKind; stage?: DinoStage; silhouette?: boolean; shiny?: boolean; animated?: boolean; title?: string; className?: string;
}) {
  const uid = svgId(useId());
  const shape = STAGE_SHAPE[stage];
  const giant = kind.features.includes("giant") ? 1.06 : 1;
  const p = paint(kind, silhouette, shiny);
  const ctx: Ctx = { p, has: (feature) => kind.features.includes(feature), f: shape.feature, head: shape.head, eye: shape.eye, silhouette };
  const skinId = `${uid}-skin`;
  const drawing = DRAWERS[kind.archetype](ctx);
  const scale = shape.scale * giant;
  const clipId = `${uid}-clip`;
  return (
    <svg viewBox="0 0 160 120" className={`dino-art ${animated ? "animated" : ""} ${silhouette ? "silhouette" : ""} ${className}`} role="img" aria-label={title ?? kind.name} data-archetype={kind.archetype} data-stage={stage}>
      <defs>
        <linearGradient id={skinId} gradientUnits="userSpaceOnUse" x1="0" y1="36" x2="0" y2="98">
          <stop offset="0" stopColor={p.top} />
          <stop offset="0.5" stopColor={p.skin} />
          <stop offset="1" stopColor={p.belly} />
        </linearGradient>
        <clipPath id={clipId}><path d={drawing.body} /></clipPath>
      </defs>
      <ellipse cx={80} cy={112} rx={44 * scale} ry={4.5} className="dino-art-shadow" />
      <g transform={`translate(80 111) scale(${scale}) translate(-80 -111)`}>
        <g className="dino-art-body">
          {drawing.back}
          {drawing.far}
          <path d={drawing.body} fill={silhouette ? p.skin : `url(#${skinId})`} stroke={p.line} strokeWidth={1.1} strokeLinejoin="round" />
          {drawing.texture && <g clipPath={`url(#${clipId})`}>{drawing.texture}</g>}
          {drawing.near}
          {drawing.front}
          {drawing.head}
        </g>
      </g>
      {silhouette && <text x={80} y={72} textAnchor="middle" className="dino-art-unknown">?</text>}
    </svg>
  );
}

/** Quả trứng có đổ bóng, đốm và vết nứt; `cracks` 0–4 khớp số mảnh trứng đã có. */
export function DinoEgg({ hue = 40, cracks = 0, mystery = false, className = "" }: { hue?: number; cracks?: number; mystery?: boolean; className?: string }) {
  const uid = svgId(useId());
  const shell = `${uid}-shell`;
  return (
    <svg viewBox="0 0 60 70" className={`dino-egg ${mystery ? "mystery" : ""} ${className}`} role="img" aria-label={mystery ? "Trứng Bí Ẩn" : `Trứng, ${cracks} mảnh`}>
      <defs>
        {mystery
          ? <linearGradient id={shell} x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#c9b8ff" /><stop offset="0.5" stopColor="#ffd98a" /><stop offset="1" stopColor="#8fd9c8" /></linearGradient>
          : <radialGradient id={shell} cx="0.38" cy="0.32" r="0.75"><stop offset="0" stopColor={`hsl(${hue} 60% 95%)`} /><stop offset="0.65" stopColor={`hsl(${hue} 45% 84%)`} /><stop offset="1" stopColor={`hsl(${hue} 32% 66%)`} /></radialGradient>}
      </defs>
      <ellipse cx={30} cy={64} rx={18} ry={3.5} className="dino-art-shadow" />
      <path d="M30 4 C44 4 54 28 54 42 C54 56 43 64 30 64 C17 64 6 56 6 42 C6 28 16 4 30 4 Z" fill={`url(#${shell})`} stroke={`hsl(${hue} 30% 48%)`} strokeWidth={1.2} />
      {!mystery && <g fill={`hsl(${hue} 32% 58%)`} opacity={0.7}><ellipse cx={21} cy={30} rx={3.2} ry={2.4} /><ellipse cx={38} cy={44} rx={4} ry={3} /><ellipse cx={33} cy={22} rx={1.8} ry={1.4} /><ellipse cx={18} cy={48} rx={2.2} ry={1.7} /><ellipse cx={42} cy={30} rx={1.6} ry={1.2} /></g>}
      <ellipse cx={22} cy={20} rx={4} ry={7} fill="#fff" opacity={0.45} transform="rotate(-20 22 20)" />
      {mystery && <text x={30} y={45} textAnchor="middle" fontSize={22} fontWeight={900} fill="#4937bd">?</text>}
      {cracks >= 1 && <path d="M17 22 l6 5 l-3 5 l6 4" stroke="#5c4a2c" strokeWidth={1.3} fill="none" strokeLinejoin="round" />}
      {cracks >= 2 && <path d="M41 18 l-5 6 l4 4 l-4 6" stroke="#5c4a2c" strokeWidth={1.3} fill="none" strokeLinejoin="round" />}
      {cracks >= 3 && <path d="M11 44 l8 -2 l3 5 l7 -3" stroke="#5c4a2c" strokeWidth={1.3} fill="none" strokeLinejoin="round" />}
    </svg>
  );
}

/** Cảnh tổ ấm: đồi xa, cây tuế, dương xỉ và tổ cành; cây cối lớn dần theo bé khủng long. */
export function NestScene({ stage, children }: { stage: DinoStage; children: ReactNode }) {
  const grow = stage === "truong-thanh" ? 1 : stage === "thieu-nien" ? 0.74 : 0.48;
  const fern = (x: number, s: number, key: string) => (
    <g key={key} transform={`translate(${x} 152) scale(${s}) translate(${-x} -152)`} className="fern">
      {[-62, -38, -14, 12, 36, 58].map((deg) => <path key={deg} d={`M${x} 152 q${deg * 0.45} -34 ${deg * 0.9} -52`} />)}
    </g>
  );
  return (
    <div className="dino-nest-scene" data-stage={stage}>
      <svg viewBox="0 0 320 200" className="dino-nest-backdrop" aria-hidden="true">
        <path d="M0 132 C50 110 90 118 140 124 C200 112 250 104 320 120 L320 200 L0 200 Z" className="hill-far" />
        <path d="M0 150 C60 138 120 146 170 142 C230 136 280 140 320 146 L320 200 L0 200 Z" className="ground" />
        <g transform={`translate(44 152) scale(${grow}) translate(-44 -152)`}>
          <path d="M40 152 C42 128 41 110 44 90 L50 90 C52 110 51 128 54 152 Z" className="trunk" />
          <g className="palm">{[-70, -40, -12, 16, 44, 72].map((deg) => <path key={deg} d={`M47 90 q${deg * 0.6} -26 ${deg * 1.1} -10`} />)}</g>
        </g>
        {fern(282, grow, "fern-right")}
        {stage !== "con-non" && fern(250, grow * 0.6, "fern-small")}
        {stage !== "con-non" && <g className="flowers"><circle cx={96} cy={150} r={3.5} /><circle cx={226} cy={152} r={3.5} /><circle cx={112} cy={155} r={2.8} /></g>}
        {stage === "truong-thanh" && <g className="rocks"><ellipse cx={206} cy={158} rx={15} ry={7} /><ellipse cx={126} cy={162} rx={9} ry={4.5} /></g>}
        <ellipse cx={160} cy={163} rx={78 * (0.72 + 0.28 * grow)} ry={13} className="nest" />
        <path d={`M${160 - 70 * (0.72 + 0.28 * grow)} 160 q70 12 ${140 * (0.72 + 0.28 * grow)} 0`} className="nest-twigs" />
      </svg>
      <div className="dino-nest-actor">{children}</div>
    </div>
  );
}
