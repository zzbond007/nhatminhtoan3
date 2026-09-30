// Bộ đồ nghề chung cho bộ sinh phiên bản nhiệm vụ (mỗi miền một tệp trong thư mục này).
//
// Quy ước cho MỌI câu hỏi:
// - h[0] (tầng 1 · Định hướng) là một CÂU HỎI riêng của bài, giúp con tự nhìn ra hướng đi;
// - h[1] (tầng 2 · Trực quan) nêu sơ đồ hoặc phép tính dở dang;
// - h[2] (tầng 3 · Từng bước) dẫn các bước còn lại nhưng KHÔNG nêu thẳng đáp án;
// - wrong: mỗi đáp án sai hay gặp (phương án nhiễu hoặc một số sai) gắn với một lỗi tư duy cụ thể
//   và lời phản hồi riêng cho lỗi đó.
// Ba dải khó khác nhau về CẤU TRÚC, không chỉ về số liệu:
// - Gỡ nút (support): số nhỏ hơn, câu chuyển giao ít bước hơn, mở sẵn sơ đồ của tầng 2;
// - Bứt phá (stretch): câu chuyển giao nhiều bước hơn và có câu chứa dữ kiện thừa.

import type { AnswerType, DomainId } from "../content";
import type { DifficultyBand } from "../mastery";

export type Band = DifficultyBand;

export type Q = {
  prompt: string;
  type: AnswerType;
  answer: string | number;
  options?: Array<string | number>;
  h: [string, string, string];
  why: string;
  tag: string;
  /** Số bước suy luận cần làm (mặc định 1). */
  steps?: number;
  wrong?: Record<string, string>;
  /** Đề có một dữ kiện không cần dùng. */
  extra?: boolean;
};

type Extras = { steps?: number; wrong?: Record<string | number, string> };

/** Câu điền số. */
export function num(prompt: string, answer: number, h: Q["h"], why: string, tag: string, extras: Extras = {}): Q {
  return { prompt, type: "number", answer, h, why, tag, steps: extras.steps, wrong: extras.wrong as Record<string, string> | undefined };
}

/** Câu trắc nghiệm: `options` gồm cả đáp án; thứ tự được xáo theo mã câu hỏi ở bước sau. */
export function pick(prompt: string, answer: string | number, options: Array<string | number>, h: Q["h"], why: string, tag: string, extras: Extras = {}): Q {
  return { prompt, type: "choice", answer, options, h, why, tag, steps: extras.steps, wrong: extras.wrong as Record<string, string> | undefined };
}

export function mod(value: number, size: number) { return ((value % size) + size) % size; }
export function clock(minutes: number) { return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`; }
export function byBand<T>(band: Band, support: T, core: T, stretch: T): T {
  return band === "support" ? support : band === "stretch" ? stretch : core;
}

export const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
export const CONTEXTS = ["vườn trường", "trạm không gian", "xưởng thủ công", "thư viện", "cửa hàng nhỏ", "sân thể thao", "bảo tàng", "trại hè", "phòng thí nghiệm", "khu phố", "câu lạc bộ", "chuyến dã ngoại"];
/** Những nơi đo bằng mét là hợp lý nhất (không quá nhỏ, không dài tới ki-lô-mét). */
export const METRE_PLACES = ["lớp học", "sân trường", "hành lang", "thư viện", "bể bơi", "sân bóng", "vườn trường", "phòng thể chất", "nhà xe", "sân khấu", "phòng ăn", "bãi cát"];

/**
 * Dữ kiện thừa cho dải Bứt phá: một câu có con số nhưng không liên quan tới điều cần tìm.
 * Con phải tự lọc dữ kiện thay vì dùng mọi con số xuất hiện trong đề.
 */
const EXTRA_DATA: Record<DomainId, string[]> = {
  number: ["Bạn Sóc năm nay 9 tuổi.", "Trên bàn có 3 cây bút chì.", "Hôm đó là ngày 12.", "Lớp bạn Thỏ có 4 tổ."],
  calculation: ["Cửa hàng mở cửa lúc 8 giờ.", "Quầy hàng có 2 người bán.", "Hôm đó là thứ Năm, ngày 14.", "Chiếc cân đặt trên bàn cao 1 m."],
  measurement: ["Hôm ấy trời 28 độ.", "Cả nhóm có 5 bạn.", "Chiếc thước có 2 màu.", "Bạn Gấu học lớp 3."],
  geometry: ["Tấm bìa có 2 mặt màu xanh.", "Bạn Mèo dùng 3 cây bút màu.", "Tờ giấy được gấp 1 lần trước đó.", "Trên bàn có 5 chiếc kéo."],
  data: ["Cuộc khảo sát làm trong 2 ngày.", "Bảng được kẻ bằng 3 màu mực.", "Bạn ghi số liệu 9 tuổi.", "Lớp học ở tầng 2."],
  word: ["Câu chuyện xảy ra lúc 7 giờ sáng.", "Nhà bạn An ở số 15.", "Hôm ấy là ngày 20.", "Bạn Bình cao hơn bạn An 2 cm."],
};

export function extraSentence(domain: DomainId, v: number) {
  const pool = EXTRA_DATA[domain];
  return pool[mod(v, pool.length)];
}

/** Thêm một dữ kiện thừa vào đầu đề và nhắc điều đó trong lời giải. */
export function withExtra(question: Q, domain: DomainId, v: number): Q {
  const sentence = extraSentence(domain, v);
  return {
    ...question,
    prompt: `${sentence} ${question.prompt}`,
    why: `${question.why} Dữ kiện “${sentence.replace(/\.$/, "")}” không cần dùng.`,
    extra: true,
  };
}

export type SequenceBuilder = (v: number, band: Band) => Q[];
