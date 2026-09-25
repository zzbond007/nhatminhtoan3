// dino-world.tsx
// Giao diện Đảo Khủng Long: Hành trình nhiều trạm, Bộ sưu tập (Gallery) và Tổ ấm.
// Component chỉ hiển thị; mọi dữ liệu và hành động do page.tsx truyền vào.

import { useSyncExternalStore } from "react";
import { DinoEgg, DinoFigure, NestScene } from "./dino-art";
import { DINO_STAGE_LABELS, EGG_RARITY_LABELS, SHARDS_TO_HATCH, type DinoStage, type EggRarity } from "./dino-collection-engine";
import { bondLabel, CARE_ACTIONS, type CareAction } from "./dino-rewards";
import type { DinoKind } from "./dino-species";

// ===== Hành trình =====

export type JourneyStation = {
  week: number;
  title: string;
  kind: DinoKind;
  status: "done" | "current" | "open" | "future";
  stage: DinoStage | null;       // null khi chưa nở
  shards: number;
  playable: boolean;
  branch: null | { kind: DinoKind; claimed: boolean };
};

const NARROW_QUERY = "(max-width: 640px)";

/** Màn hẹp (điện thoại) dùng 4 cột và hàng giãn hơn để trạm và trạm ẩn không đè nhau. */
function useNarrowJourney() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(NARROW_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
}

function journeyLayout(narrow: boolean) {
  const cols = narrow ? 4 : 6;
  const stepX = 600 / cols;
  const stepY = narrow ? 200 : 140;
  return {
    cols,
    stepY,
    point(index: number) {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = stepX / 2 + (row % 2 === 0 ? col : cols - 1 - col) * stepX;
      return { x, y: 84 + row * stepY, row };
    },
    branch(point: { x: number; y: number; row: number }) {
      return { x: point.x + (point.row % 2 === 0 ? -stepX / 2 : stepX / 2), y: point.y - stepY * 0.48 };
    },
  };
}

export function DinoJourney({
  stations, onStation, onBranch,
}: {
  stations: JourneyStation[];
  onStation: (station: JourneyStation) => void;
  onBranch: (station: JourneyStation) => void;
}) {
  const layout = journeyLayout(useNarrowJourney());
  const rows = Math.ceil(stations.length / layout.cols);
  const height = 84 + (rows - 1) * layout.stepY + 64;
  const points = stations.map((_, index) => layout.point(index));
  const path = points.map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`).join(" ");
  const currentIndex = stations.findIndex((station) => station.status === "current");
  const donePath = currentIndex > 0 ? points.slice(0, currentIndex + 1).map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`).join(" ") : "";
  const pct = (x: number, y: number) => ({ left: `${(x / 600) * 100}%`, top: `${(y / height) * 100}%` });

  return (
    <div className="dino-journey" style={{ aspectRatio: `600 / ${height}` }}>
      <svg viewBox={`0 0 600 ${height}`} preserveAspectRatio="none" aria-hidden="true" className="dino-journey-path">
        <path d={path} className="trail" />
        {donePath && <path d={donePath} className="trail done" />}
        {stations.map((station, index) => {
          if (!station.branch) return null;
          const point = points[index];
          const branch = layout.branch(point);
          return <path key={`b-${station.week}`} d={`M${point.x} ${point.y} Q${(point.x + branch.x) / 2} ${point.y - 10} ${branch.x} ${branch.y}`} className="trail branch" />;
        })}
      </svg>
      {stations.map((station, index) => {
        const point = points[index];
        const hatched = station.stage !== null;
        return (
          <button
            type="button"
            key={station.week}
            className={`dino-journey-station ${station.status}`}
            style={pct(point.x, point.y)}
            onClick={() => onStation(station)}
            disabled={!station.playable}
            aria-label={`Tuần ${station.week}: ${station.title}. ${station.status === "done" ? "Đã qua" : station.status === "current" ? "Con đang ở đây" : station.playable ? "Đã mở" : "Chưa tới"}${hatched ? `, ${station.kind.name} ${DINO_STAGE_LABELS[station.stage!].toLocaleLowerCase("vi")}` : `, trứng ${station.shards}/${SHARDS_TO_HATCH} mảnh`}`}
          >
            {station.status === "current" && <span className="dino-journey-pin" aria-hidden="true">Con ở đây</span>}
            <span className="dino-journey-art">
              {hatched ? <DinoFigure kind={station.kind} stage={station.stage!} /> : <DinoEgg cracks={station.shards} />}
            </span>
            <small>{station.week}</small>
          </button>
        );
      })}
      {stations.map((station, index) => {
        if (!station.branch) return null;
        const branch = layout.branch(points[index]);
        return (
          <button
            type="button"
            key={`branch-${station.week}`}
            className={`dino-journey-branch ${station.branch.claimed ? "claimed" : "ready"}`}
            style={pct(branch.x, branch.y)}
            onClick={() => onBranch(station)}
            disabled={station.branch.claimed}
            aria-label={station.branch.claimed ? `Trạm ẩn tuần ${station.week}: đã gặp ${station.branch.kind.name}` : `Trạm ẩn tuần ${station.week} vừa mở: chạm để nhận trứng hiếm`}
          >
            <span className="dino-journey-art">{station.branch.claimed ? <DinoFigure kind={station.branch.kind} stage="con-non" /> : <DinoEgg mystery />}</span>
            <small>Trạm ẩn</small>
          </button>
        );
      })}
    </div>
  );
}

// ===== Bộ sưu tập =====

export type GalleryItem = {
  kind: DinoKind;
  region: string;
  owned: boolean;
  stage: DinoStage | null;
  rarity: EggRarity | null;
  shiny: boolean;
  hint: string;
};

export function DinoGallery({
  sections, selectedId, onSelect,
}: {
  sections: Array<{ id: string; title: string; items: GalleryItem[] }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const all = sections.flatMap((section) => section.items);
  const owned = all.filter((item) => item.owned).length;
  const selected = all.find((item) => item.kind.id === selectedId && item.owned);
  return (
    <div className="dino-gallery">
      <div className="dino-gallery-count">
        <strong>{owned}/{all.length}</strong>
        <span>{owned === all.length ? "Con đã khám phá mọi loài trên đảo!" : `Còn ${all.length - owned} loài đang chờ con khám phá`}</span>
      </div>
      {selected && (
        <div className="dino-gallery-detail" aria-live="polite">
          <DinoFigure kind={selected.kind} stage={selected.stage ?? "con-non"} shiny={selected.shiny} animated />
          <div>
            <strong>{selected.kind.name}{selected.shiny ? " ✨" : ""}</strong>
            <small>{selected.kind.genus} · {selected.region}{selected.stage ? ` · ${DINO_STAGE_LABELS[selected.stage]}` : ""}{selected.rarity ? ` · ${EGG_RARITY_LABELS[selected.rarity]}` : ""}</small>
            <p>{selected.kind.funFact}</p>
          </div>
        </div>
      )}
      {sections.map((section) => (
        <section key={section.id} className="dino-gallery-section">
          <h3>{section.title} <span>{section.items.filter((item) => item.owned).length}/{section.items.length}</span></h3>
          <div className="dino-gallery-grid">
            {section.items.map((item) => (
              <button
                type="button"
                key={item.kind.id}
                className={`dino-gallery-card ${item.owned ? "owned" : "locked"} ${item.rarity ? `rarity-${item.rarity}` : ""} ${selectedId === item.kind.id ? "selected" : ""}`}
                onClick={() => item.owned && onSelect(item.kind.id)}
                aria-disabled={!item.owned}
                aria-label={item.owned ? `${item.kind.name}, ${DINO_STAGE_LABELS[item.stage ?? "con-non"]}` : `Loài chưa khám phá ở ${item.region}. ${item.hint}`}
              >
                <DinoFigure kind={item.kind} stage={item.owned ? item.stage ?? "con-non" : "truong-thanh"} silhouette={!item.owned} shiny={item.shiny} title={item.owned ? item.kind.name : "Loài chưa khám phá"} />
                <strong>{item.owned ? item.kind.name : "?"}</strong>
                <small>{item.owned ? (item.rarity ? EGG_RARITY_LABELS[item.rarity] : DINO_STAGE_LABELS[item.stage ?? "con-non"]) : item.region}</small>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ===== Tổ ấm =====

export type NestFriend = { kind: DinoKind; stage: DinoStage; shiny: boolean; growHint: string };

export function DinoNestPanel({
  companion, friends, bond, careDoneToday, reaction, reactionKey, onChoose, onCare,
}: {
  companion: NestFriend | null;
  friends: NestFriend[];
  bond: number;
  careDoneToday: CareAction[];
  reaction: string;
  reactionKey: number;
  onChoose: (id: string) => void;
  onCare: (action: CareAction) => void;
}) {
  if (!friends.length) {
    return (
      <div className="dino-nest-empty">
        <DinoEgg cracks={1} />
        <strong>Tổ ấm đang chờ bé khủng long đầu tiên</strong>
        <p>Hoàn thành nhiệm vụ để trứng nở. Bé nở ra sẽ về sống trong tổ này cùng con.</p>
      </div>
    );
  }
  const food = companion?.kind.diet === "an-thit" || companion?.kind.diet === "an-ca" ? "🍖" : "🌿";
  return (
    <div className="dino-nest-panel">
      {companion && (
        <div className="dino-nest-stage">
          <NestScene stage={companion.stage}>
            <DinoFigure key={reactionKey} kind={companion.kind} stage={companion.stage} shiny={companion.shiny} animated className={reactionKey ? "react" : ""} />
          </NestScene>
          <div className="dino-nest-info">
            <div>
              <strong>{companion.kind.name}{companion.shiny ? " ✨" : ""}</strong>
              <small>{DINO_STAGE_LABELS[companion.stage]} · {companion.growHint}</small>
            </div>
            <div className="dino-nest-bond" aria-label={`Gắn bó ${bond}/100, ${bondLabel(bond)}`}>
              <span>Gắn bó · {bondLabel(bond)}</span>
              <div><i style={{ width: `${bond}%` }} /></div>
            </div>
            <div className="dino-nest-actions">
              {CARE_ACTIONS.map((action) => {
                const done = careDoneToday.includes(action.id);
                return (
                  <button type="button" key={action.id} onClick={() => onCare(action.id)} className={done ? "done" : ""} aria-pressed={done}>
                    <span aria-hidden="true">{action.id === "cho-an" ? food : action.id === "vuot-ve" ? "🤲" : "⚽"}</span>
                    {action.label}
                    <small>{done ? "Xong hôm nay" : `+${action.bond} gắn bó`}</small>
                  </button>
                );
              })}
            </div>
            {reaction && <p className="dino-nest-reaction" role="status">{reaction}</p>}
          </div>
        </div>
      )}
      <div className="dino-nest-friends">
        <strong>Chọn bạn đồng hành</strong>
        <div>
          {friends.map((friend) => (
            <button type="button" key={friend.kind.id} className={companion?.kind.id === friend.kind.id ? "active" : ""} onClick={() => onChoose(friend.kind.id)} aria-pressed={companion?.kind.id === friend.kind.id}>
              <DinoFigure kind={friend.kind} stage={friend.stage} shiny={friend.shiny} />
              <small>{friend.kind.name}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
