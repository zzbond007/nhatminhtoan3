// Module 6.1 · Thẻ "Bảo tàng Hóa thạch": số hóa thạch (tuần đạt nhịp 5 buổi) không bao giờ giảm,
// tiến độ tuần này, số Khiên còn lại trong tháng và nút dùng khiên khi tuần trước còn thiếu 1–2 buổi.

import { Bone, Shield } from "lucide-react";
import { FOSSIL_SHIELDS_PER_MONTH, RHYTHM_SESSIONS_PER_WEEK, type FossilMuseum } from "@/app/fossil-streak";

const SHELF_ICON = { met: "🦴", rescued: "🛡️", resting: "·", "in-progress": "⏳" } as const;
const SHELF_LABEL = { met: "đạt nhịp", rescued: "được khiên cứu", resting: "tuần nghỉ", "in-progress": "đang học" } as const;

export function FossilMuseumCard({ museum, onRescue }: { museum: FossilMuseum; onRescue: () => void }) {
  const learned = museum.thisWeek?.learnedDays ?? 0;
  return (
    <section className="fossil-museum" aria-label="Bảo tàng Hóa thạch">
      <div className="fossil-head">
        <Bone />
        <div>
          <p className="eyebrow">Bảo tàng Hóa thạch · nhịp {RHYTHM_SESSIONS_PER_WEEK} buổi/tuần</p>
          <h3><strong>{museum.fossils}</strong> hóa thạch trong bảo tàng</h3>
          <small>Mỗi tuần học đủ {RHYTHM_SESSIONS_PER_WEEK} buổi cất thêm một hóa thạch. Hóa thạch đã có không bao giờ mất.</small>
        </div>
      </div>
      <div className="fossil-week" aria-label={`Tuần này đã học ${learned} trên ${RHYTHM_SESSIONS_PER_WEEK} buổi`}>
        {Array.from({ length: RHYTHM_SESSIONS_PER_WEEK }, (_, index) => <i key={index} className={index < learned ? "done" : ""} />)}
        <span>{learned >= RHYTHM_SESSIONS_PER_WEEK ? "Tuần này đã đủ nhịp! 🎉" : `Tuần này ${learned}/${RHYTHM_SESSIONS_PER_WEEK} buổi`}</span>
      </div>
      <div className="fossil-shelf" aria-label="Kệ trưng bày 8 tuần gần nhất">
        {museum.recentWeeks.map((week) => (
          <span key={week.weekStart} className={`shelf-slot ${week.status}`} title={`Tuần từ ${week.weekStart}: ${week.learnedDays} buổi · ${SHELF_LABEL[week.status]}`}>{SHELF_ICON[week.status]}</span>
        ))}
      </div>
      <div className="fossil-shields">
        <span><Shield /> {museum.shieldsLeft}/{FOSSIL_SHIELDS_PER_MONTH} Khiên hóa thạch tháng này</span>
        {museum.rescue && museum.shieldsLeft > 0 && (
          <button type="button" onClick={onRescue} className="fossil-rescue">
            Dùng {museum.rescue.missing} khiên cứu tuần trước
          </button>
        )}
      </div>
    </section>
  );
}
