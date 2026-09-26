// Module 6.3 · Lời khuyến nghị đồng hành đi kèm Báo cáo Radar 6 miền tư duy (sau bài khảo sát 18 câu).
// Văn phong tích cực: gọi tên điểm mạnh nổi bật trước, rồi đến "vùng đang bồi đắp" kèm hoạt động
// cụ thể 10 phút tại nhà — không dùng từ "yếu", "kém".

import type { DomainId } from "./content";

export const RADAR_AXIS_LABELS: Record<DomainId, string> = {
  number: "Quy luật", calculation: "Chiến lược", measurement: "Mô hình",
  geometry: "Hình học", data: "Dữ liệu", word: "Logic",
};
/** Thứ tự trục trên biểu đồ theo đề bài: Quy luật, Chiến lược, Mô hình, Hình học, Dữ liệu, Logic. */
export const RADAR_AXIS_ORDER: DomainId[] = ["number", "calculation", "measurement", "geometry", "data", "word"];

const STRENGTH_TEXT: Record<DomainId, string> = {
  number: "Con nhìn ra cấu trúc lặp lại rất nhanh — đây là nền của tư duy đại số sau này.",
  calculation: "Con biết linh hoạt tách, gộp số để tính gọn — dấu hiệu của cảm giác số tốt.",
  measurement: "Con ước lượng có căn cứ và gắn con số với đời thực.",
  geometry: "Con tưởng tượng xoay, ghép hình trong đầu rất tốt.",
  data: "Con đọc số liệu cẩn thận và không vội kết luận.",
  word: "Con xâu chuỗi manh mối chặt chẽ, biết kiểm tra lại lập luận.",
};

const HOME_ACTIVITY: Record<DomainId, { focus: string; activity: string }> = {
  number: { focus: "nhận ra và giải thích quy luật", activity: "Chơi “Máy biến số”: ba mẹ nghĩ một quy tắc (ví dụ +3), đọc 3 số vào–ra, con đoán quy tắc và nói vì sao." },
  calculation: { focus: "chọn chiến lược tính thông minh", activity: "Khi đi chợ, đố con cộng nhẩm hai món bằng cách làm tròn (29 000 + 46 000 → 30 000 + 45 000)." },
  measurement: { focus: "ước lượng và đổi đơn vị", activity: "Trước khi đo, cả nhà cùng đoán chiều dài bàn, cân nặng túi gạo… rồi đo thật và so ai gần hơn." },
  geometry: { focus: "tưởng tượng không gian", activity: "Gấp giấy rồi cắt một nhát, cho con đoán hình khi mở ra; hoặc xếp hình Tangram theo bóng mẫu." },
  data: { focus: "đọc và đếm khả năng", activity: "Cùng con khảo sát “món ăn yêu thích” của cả nhà, vẽ biểu đồ cột bằng giấy dán và đặt 2 câu hỏi về biểu đồ." },
  word: { focus: "lập luận nhiều bước", activity: "Kể một câu đố “ai ngồi ở đâu” với 3 manh mối; khuyến khích con lập bảng và tự kiểm tra từng manh mối." },
};

export type RadarRecommendation = { domain: DomainId; label: string; percent: number; text: string };
export type RadarReport = {
  summary: string;
  strengths: RadarRecommendation[];
  growth: (RadarRecommendation & { activity: string })[];
};

export function buildRadarReport(values: Record<DomainId, number>): RadarReport {
  const ranked = RADAR_AXIS_ORDER.map((domain) => ({ domain, label: RADAR_AXIS_LABELS[domain], percent: Math.round(values[domain] ?? 0) }))
    .sort((a, b) => b.percent - a.percent);
  const top = ranked[0].percent;
  // Điểm mạnh: các miền ≥ 67% hoặc miền cao nhất (luôn có ít nhất một điểm mạnh để khích lệ).
  const strengths = ranked.filter((item, index) => index === 0 || (item.percent >= 67 && item.percent >= top - 17)).slice(0, 2)
    .map((item) => ({ ...item, text: STRENGTH_TEXT[item.domain] }));
  const growth = [...ranked].reverse().filter((item) => !strengths.some((strength) => strength.domain === item.domain) && item.percent < 80).slice(0, 2)
    .map((item) => ({ ...item, text: `Vùng đang bồi đắp: ${HOME_ACTIVITY[item.domain].focus}.`, activity: HOME_ACTIVITY[item.domain].activity }));
  const summary = growth.length
    ? `Điểm sáng nổi bật của con là ${strengths.map((item) => item.label).join(" và ")}. Mỗi tuần, ba mẹ chỉ cần 10 phút trò chuyện quanh ${growth.map((item) => item.label).join(" và ")} là đủ để các miền cân bằng dần.`
    : `Sáu miền của con đều đang vững. Hãy giữ nhịp học đều và cho con thử những bài toán mở để bứt phá thêm.`;
  return { summary, strengths, growth };
}
