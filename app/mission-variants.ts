import type { AnswerType, DomainId } from "./content";
import type { DeepMission, DeepQuestion, HintLadder } from "./curriculum";
import { distinctOptions, shuffleById } from "./option-order";
import { bandForMastery, MASTERY_DEFAULT, type DifficultyBand } from "./mastery";

export const VARIANTS_PER_MISSION = 12;
/** Mỗi phiên bản có 4 câu luyện sâu và 1 câu chuyển giao (nhiệm vụ gốc chỉ có 3 câu luyện). */
export const PRACTICE_PER_EDITION = 4;

export type { DifficultyBand };

export type MissionEdition = {
  id: string;
  number: number;
  total: number;
  label: string;
  difficulty: DifficultyBand;
  difficultyLabel: string;
  thinkingLens: string;
  mission: DeepMission;
};

type QuestionInput = {
  prompt: string;
  type: AnswerType;
  answer: string | number;
  hint1: string;
  hint2: string;
  hint3: string;
  explanation: string;
  options?: Array<string | number>;
  tag: string;
  misconception?: string;
};

const THINKING_LENSES: Record<DomainId, string[]> = {
  number: ["Nhận ra và kiểm chứng quy luật", "Đếm có hệ thống", "Tìm điều không đổi", "Phát hiện dữ kiện nhiễu", "Suy luận theo chu kỳ", "Tạo và mô tả quy luật"],
  calculation: ["Biến đổi để tính nhẩm", "So sánh nhiều chiến lược", "Đi xuôi – đi ngược", "Giữ cân bằng", "Ước lượng để bắt lỗi", "Sáng tạo biểu thức"],
  measurement: ["Ước lượng và kiểm chứng", "Mô hình hóa giới hạn", "Tối ưu trong điều kiện", "Đọc tỉ lệ", "Lập lịch", "Ra quyết định theo ngân sách"],
  geometry: ["So sánh diện tích – chu vi", "Bảo toàn khi cắt ghép", "Đếm hình có trật tự", "Tưởng tượng không gian", "Lát kín", "Thiết kế tối ưu"],
  data: ["Phân biệt dữ liệu và kết luận", "Liệt kê mọi khả năng", "Đánh giá công bằng", "Đọc biểu đồ phản biện", "Thử nghiệm ngẫu nhiên", "Thiết kế khảo sát"],
  word: ["Suy luận ngược", "Giả sử rồi điều chỉnh", "Tìm nhiều nghiệm", "Đánh giá manh mối", "Thử – sửa có chiến lược", "Chứng minh không bỏ sót"],
};

const CONTEXTS = ["vườn trường", "trạm không gian", "xưởng thủ công", "thư viện", "cửa hàng nhỏ", "sân thể thao", "bảo tàng", "trại hè", "phòng thí nghiệm", "khu phố", "câu lạc bộ", "chuyến dã ngoại"];
/** Những nơi đo bằng mét là hợp lý nhất (không quá nhỏ, không dài tới ki-lô-mét). */
const METRE_PLACES = ["lớp học", "sân trường", "hành lang", "thư viện", "bể bơi", "sân bóng", "vườn trường", "phòng thể chất", "nhà xe", "sân khấu", "phòng ăn", "bãi cát"];
const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

function mod(value: number, size: number) { return ((value % size) + size) % size; }
function options(values: Array<string | number>) { return values.map(String); }
function clock(minutes: number) { return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`; }
function hints(one: string, two: string, three: string): HintLadder {
  return [`Tầng 1: ${one}`, `Tầng 2: ${two}`, `Tầng 3: ${three}`];
}
function makeQuestion(id: string, input: QuestionInput): DeepQuestion {
  return {
    id,
    prompt: input.prompt,
    type: input.type,
    answer: String(input.answer),
    // Thứ tự lựa chọn phụ thuộc mã câu hỏi: cùng một câu luôn hiện cùng thứ tự.
    options: input.options ? shuffleById(options(input.options), id) : undefined,
    hint: input.hint1,
    hints: hints(input.hint1, input.hint2, input.hint3),
    explanation: input.explanation,
    challengeTag: input.tag,
    misconception: input.misconception ?? "Con có thể đã tính đúng một phần nhưng chưa kiểm tra đủ điều kiện. Hãy dùng gợi ý theo từng tầng.",
  };
}

function difficultyLabel(band: DifficultyBand) {
  return band === "support" ? "Gỡ nút" : band === "stretch" ? "Bứt phá" : "Vừa sức";
}

function numberQuestions(sequence: number, v: number, band: DifficultyBand): QuestionInput[] {
  const lift = band === "stretch" ? 2 : band === "support" ? 0 : 1;
  if (sequence === 1) {
    const start = 3 + v; const step = 3 + mod(v + lift, 6);
    return [
      { prompt: `Dãy ${start}, ${start + step}, ${start + 2 * step}, ${start + 3 * step}, … có số tiếp theo là bao nhiêu?`, type: "number", answer: start + 4 * step, hint1: "So sánh hai số đứng cạnh nhau.", hint2: `Mỗi bước tăng cùng ${step} đơn vị.`, hint3: `Lấy ${start + 3 * step} cộng ${step}.`, explanation: `Các khoảng cách đều bằng ${step}, nên số tiếp theo là ${start + 4 * step}.`, tag: "Quy luật cộng" },
      { prompt: `Điền số còn thiếu: ${start}, ${start + step}, □, ${start + 3 * step}, ${start + 4 * step}.`, type: "number", answer: start + 2 * step, hint1: "Kiểm tra khoảng cách ở cả hai phía ô trống.", hint2: `Ô trống lớn hơn ${start + step} đúng ${step}.`, hint3: `${start + step} + ${step} = ?`, explanation: `Dãy tăng đều ${step}; số thiếu là ${start + 2 * step}.`, tag: "Số bị che" },
      { prompt: `Quy luật nào mô tả đúng dãy ${start}, ${start + step}, ${start + 2 * step}, ${start + 3 * step}?`, type: "choice", answer: `Mỗi bước cộng ${step}`, options: [`Mỗi bước cộng ${step - 1}`, `Mỗi bước cộng ${step}`, `Mỗi bước nhân 2`, `Cộng lần lượt 1, 2, 3`], hint1: "Tính ba khoảng cách liên tiếp.", hint2: "Một quy luật đúng phải giải thích mọi bước.", hint3: `${start + step} − ${start} = ${step}.`, explanation: `Mọi bước đều cộng ${step}.`, tag: "Mô tả quy luật" },
      { prompt: `Bạn Sóc dự đoán số sau ${start + 3 * step} là ${start + 3 * step + step + 1}. Dự đoán ấy đúng hay sai?`, type: "choice", answer: "Sai", options: ["Đúng", "Sai", "Chưa đủ dữ kiện"], hint1: "Dùng chính quy luật đã kiểm tra.", hint2: `Số tiếp theo phải tăng ${step}, không phải ${step + 1}.`, hint3: `Đáp án đúng là ${start + 4 * step}.`, explanation: `Dự đoán sai 1 đơn vị; số đúng là ${start + 4 * step}.`, tag: "Kiểm chứng dự đoán" },
      { prompt: `Một dãy bắt đầu từ ${start + 2}, mỗi bước cộng ${step + 1}. Số thứ sáu là bao nhiêu?`, type: "number", answer: start + 2 + 5 * (step + 1), hint1: "Từ số thứ nhất đến số thứ sáu có mấy bước nhảy?", hint2: "Có 5 bước nhảy bằng nhau.", hint3: `Tính ${start + 2} + 5 × ${step + 1}.`, explanation: `Có 5 lần cộng ${step + 1}; số thứ sáu là ${start + 2 + 5 * (step + 1)}.`, tag: "Chuyển giao" },
    ];
  }
  if (sequence === 2) {
    const a = 1 + mod(v, 3); const b = 4 + mod(v, 3); const c = 7 + mod(v, 3);
    const digits = [a, b, c]; const sorted = [...digits].sort((x, y) => x - y); const largest = [...sorted].reverse().join("");
    const threshold = b * 100;
    return [
      { prompt: `Dùng ${a}, ${b}, ${c} đúng một lần để lập số có ba chữ số. Có tất cả bao nhiêu số khác nhau?`, type: "number", answer: 6, hint1: "Cố định chữ số hàng trăm trước.", hint2: "Mỗi lựa chọn hàng trăm có 2 cách xếp hai chữ số còn lại.", hint3: "Có 3 × 2 cách.", explanation: "Ba chữ số khác nhau tạo 3 × 2 × 1 = 6 số.", tag: "Đếm có hệ thống" },
      { prompt: `Số lớn nhất lập từ ${a}, ${b}, ${c}, mỗi chữ số dùng đúng một lần, là số nào?`, type: "number", answer: largest, hint1: "Hàng cao nhất cần chữ số lớn nhất.", hint2: "Xếp các chữ số theo thứ tự giảm dần.", hint3: `Thứ tự là ${[...sorted].reverse().join(", ")}.`, explanation: `Xếp giảm dần được ${largest}.`, tag: "Giá trị theo vị trí" },
      { prompt: `Có bao nhiêu số lập từ ${a}, ${b}, ${c} đúng một lần và lớn hơn ${threshold}?`, type: "number", answer: 4, hint1: `Hàng trăm phải là ${b} hoặc ${c}.`, hint2: "Với mỗi hàng trăm phù hợp có 2 cách xếp phần còn lại.", hint3: "Tính 2 × 2.", explanation: `Chọn hàng trăm là ${b} hoặc ${c}; mỗi lựa chọn có 2 cách, tổng cộng 4.`, tag: "Lọc điều kiện" },
      { prompt: `Số nào không thể lập từ ${a}, ${b}, ${c} nếu mỗi chữ số chỉ dùng một lần?`, type: "choice", answer: `${a}${a}${c}`, options: [`${a}${b}${c}`, `${b}${c}${a}`, `${c}${a}${b}`, `${a}${a}${c}`], hint1: "Kiểm tra chữ số nào bị lặp.", hint2: "Mỗi chữ số chỉ được dùng một lần.", hint3: `Phương án ${a}${a}${c} dùng ${a} hai lần.`, explanation: `${a}${a}${c} vi phạm điều kiện không lặp.`, tag: "Kiểm tra ràng buộc" },
      { prompt: `Dùng 0, ${b}, ${c} đúng một lần. Có bao nhiêu số có ba chữ số?`, type: "number", answer: 4, hint1: "Số có ba chữ số không thể bắt đầu bằng 0.", hint2: `Hàng trăm có 2 lựa chọn: ${b} hoặc ${c}.`, hint3: "Mỗi lựa chọn có 2 cách xếp hai chữ số còn lại.", explanation: "Có 2 × 2 = 4 số; các cách bắt đầu bằng 0 bị loại.", tag: "Chuyển giao có số 0" },
    ];
  }
  if (sequence === 3) {
    const odd1 = 101 + 2 * v; const odd2 = 205 + 2 * mod(v + 2, 10); const even = 240 + 2 * v;
    return [
      { prompt: `Không tính đầy đủ: ${odd1} + ${odd2} là số chẵn hay lẻ?`, type: "choice", answer: "Chẵn", options: ["Chẵn", "Lẻ", "Không xác định"], hint1: "Nhìn chữ số tận cùng.", hint2: "Cả hai số đều lẻ.", hint3: "Lẻ + lẻ = chẵn.", explanation: "Hai phần dư 1 ghép thành một cặp, nên lẻ cộng lẻ là chẵn.", tag: "Bất biến chẵn–lẻ" },
      { prompt: `Không tính đầy đủ: ${even} + ${odd1} là số chẵn hay lẻ?`, type: "choice", answer: "Lẻ", options: ["Chẵn", "Lẻ", "Luôn bằng 0"], hint1: "Phân loại từng số.", hint2: `${even} chẵn, ${odd1} lẻ.`, hint3: "Chẵn + lẻ = lẻ.", explanation: "Thêm một số chẵn không làm mất phần dư 1 của số lẻ.", tag: "Dự đoán" },
      { prompt: `Tổng của ${3 + 2 * mod(v, 3)} số lẻ là chẵn hay lẻ?`, type: "choice", answer: "Lẻ", options: ["Chẵn", "Lẻ", "Không thể biết"], hint1: "Số lượng số hạng đang là chẵn hay lẻ?", hint2: "Ghép các số lẻ thành từng cặp.", hint3: "Các cặp cho tổng chẵn và còn dư một số lẻ.", explanation: "Một số lẻ lượng số lẻ cộng lại vẫn cho kết quả lẻ.", tag: "Khái quát" },
      { prompt: `Một số lẻ cộng 1 rồi nhân ${3 + 2 * mod(v, 2)}. Kết quả chắc chắn là gì?`, type: "choice", answer: "Số chẵn", options: ["Số chẵn", "Số lẻ", "Không xác định"], hint1: "Xét sau bước cộng 1 trước.", hint2: "Số lẻ cộng 1 thành số chẵn.", hint3: "Số chẵn nhân số nào cũng chẵn.", explanation: "Sau bước đầu đã là số chẵn; phép nhân giữ tính chẵn.", tag: "Chuỗi hai bước" },
      { prompt: `Ba số liên tiếp có số giữa là ${20 + v}. Tổng của chúng là bao nhiêu?`, type: "number", answer: 3 * (20 + v), hint1: "Hai số ngoài cách số giữa cùng một khoảng.", hint2: "Ghép số nhỏ và số lớn được hai lần số giữa.", hint3: `Tổng bằng 3 × ${20 + v}.`, explanation: `Ba số là ${19 + v}, ${20 + v}, ${21 + v}; tổng bằng ${3 * (20 + v)}.`, tag: "Chuyển giao đối xứng" },
    ];
  }
  if (sequence === 4) {
    const start = 4 + v; const step = 3 + mod(v, 5); const wrongIndex = 3; const wrong = start + wrongIndex * step + 1;
    return [
      { prompt: `Số nào làm hỏng quy luật ${start}, ${start + step}, ${start + 2 * step}, ${wrong}, ${start + 4 * step}?`, type: "number", answer: wrong, hint1: "Tính các khoảng cách liên tiếp.", hint2: `Quy luật hợp lý là mỗi bước cộng ${step}.`, hint3: `Vị trí thứ tư đáng lẽ là ${start + 3 * step}.`, explanation: `${wrong} lệch 1 so với số đúng ${start + 3 * step}.`, tag: "Phát hiện nhiễu" },
      { prompt: `Dãy ${2 + mod(v, 4)}, ${(2 + mod(v, 4)) * 2}, ${(2 + mod(v, 4)) * 4}, ${(2 + mod(v, 4)) * 8}, … có số tiếp theo là bao nhiêu?`, type: "number", answer: (2 + mod(v, 4)) * 16, hint1: "So sánh bằng phép nhân.", hint2: "Mỗi số gấp đôi số trước.", hint3: `Lấy ${(2 + mod(v, 4)) * 8} × 2.`, explanation: `Dãy nhân 2 nên số tiếp theo là ${(2 + mod(v, 4)) * 16}.`, tag: "Quy luật nhân" },
      { prompt: `Dãy bắt đầu ${start}, tăng lần lượt 2, 4, 6, 8. Số thứ năm là bao nhiêu?`, type: "number", answer: start + 20, hint1: "Các bước tăng không bằng nhau.", hint2: "Cộng lần lượt 2 rồi 4 rồi 6 rồi 8.", hint3: `Tổng phần tăng là 2 + 4 + 6 + 8 = 20.`, explanation: `Số thứ năm là ${start} + 20 = ${start + 20}.`, tag: "Khoảng cách thay đổi" },
      { prompt: `Quy luật “mỗi bước cộng ${step}” có khớp mọi số trong dãy ${start}, ${start + step}, ${start + 2 * step}, ${wrong}?`, type: "choice", answer: "Không", options: ["Có", "Không", "Chỉ khớp số cuối"], hint1: "Một ví dụ phản chứng là đủ để bác bỏ.", hint2: "Kiểm tra bước cuối.", hint3: `${wrong} − ${start + 2 * step} = ${step + 1}.`, explanation: `Bước cuối tăng ${step + 1}, nên quy luật không khớp mọi bước.`, tag: "Phản chứng" },
      { prompt: `Sửa đúng một số để dãy ${start}, ${start + step}, ${start + 2 * step}, ${wrong}, ${start + 4 * step} tăng đều. Số thay vào là bao nhiêu?`, type: "number", answer: start + 3 * step, hint1: "Giữ nguyên quy luật của ba số đầu.", hint2: `Tiếp tục cộng ${step}.`, hint3: `${start + 2 * step} + ${step} = ?`, explanation: `Thay ${wrong} bằng ${start + 3 * step} thì mọi khoảng cách đều là ${step}.`, tag: "Chuyển giao sửa dữ liệu" },
    ];
  }
  if (sequence === 5) {
    const startDay = 1 + mod(v + 1, 6); const days = 8 + v; const resultDay = mod(startDay + days, 7);
    const hour = 1 + mod(v + 7, 11); const after = 13 + mod(v, 8); const resultHour = mod(hour + after - 1, 12) + 1;
    return [
      { prompt: `Hôm nay là ${WEEKDAYS[startDay]}. Sau ${days} ngày là thứ mấy?`, type: "choice", answer: WEEKDAYS[resultDay], options: [WEEKDAYS[resultDay], WEEKDAYS[mod(resultDay + 1, 7)], WEEKDAYS[mod(resultDay + 2, 7)], WEEKDAYS[mod(resultDay + 6, 7)]], hint1: "Tách các tuần trọn vẹn.", hint2: `${days} chia 7 dư ${days % 7}.`, hint3: `Tiến ${days % 7} ngày từ ${WEEKDAYS[startDay]}.`, explanation: `Các tuần trọn vẹn không đổi thứ; phần dư đưa ta đến ${WEEKDAYS[resultDay]}.`, tag: "Chu kỳ tuần" },
      { prompt: `Đồng hồ đang chỉ ${hour} giờ. Sau ${after} giờ sẽ chỉ mấy giờ?`, type: "number", answer: resultHour, hint1: "Mặt đồng hồ lặp lại sau 12 giờ.", hint2: `${after} giờ = 12 giờ + ${after - 12} giờ.`, hint3: `Tiến ${after - 12} giờ từ ${hour}.`, explanation: `Bỏ một vòng 12 giờ, đồng hồ chỉ ${resultHour} giờ.`, tag: "Chu kỳ 12" },
      { prompt: `Một hoạt động lặp lại mỗi ${3 + mod(v, 4)} ngày. Lần đầu vào ngày ${2 + mod(v, 5)}. Lần thứ tư vào ngày nào?`, type: "number", answer: 2 + mod(v, 5) + 3 * (3 + mod(v, 4)), hint1: "Giữa lần thứ nhất và lần thứ tư có mấy khoảng?", hint2: "Có 3 khoảng bằng nhau.", hint3: `Lấy ngày đầu cộng 3 × chu kỳ.`, explanation: `Lần thứ tư cách lần đầu 3 chu kỳ, nên rơi vào ngày ${2 + mod(v, 5) + 3 * (3 + mod(v, 4))}.`, tag: "Mốc và khoảng" },
      { prompt: `Một đèn đổi màu theo vòng Đỏ – Vàng – Xanh. Lần 1 là Đỏ. Lần ${10 + v} là màu gì?`, type: "choice", answer: ["Xanh", "Đỏ", "Vàng"][mod(10 + v, 3)], options: ["Đỏ", "Vàng", "Xanh"], hint1: "Mỗi vòng có 3 lần.", hint2: `Xét số dư của ${10 + v} khi chia 3.`, hint3: "Dư 1 là Đỏ, dư 2 là Vàng, chia hết là Xanh.", explanation: `Theo chu kỳ 3 màu, lần ${10 + v} là ${["Xanh", "Đỏ", "Vàng"][mod(10 + v, 3)]}.`, tag: "Chu kỳ màu" },
      { prompt: `Ngày 1 là ${WEEKDAYS[startDay]}. Ngày ${22 + v} là thứ mấy?`, type: "choice", answer: WEEKDAYS[mod(startDay + 21 + v, 7)], options: [WEEKDAYS[mod(startDay + 21 + v, 7)], WEEKDAYS[mod(startDay + 22 + v, 7)], WEEKDAYS[mod(startDay + 20 + v, 7)]], hint1: "Từ ngày 1 đến ngày cần tìm ít hơn số ghi trên lịch 1 ngày.", hint2: `Khoảng cách là ${21 + v} ngày.`, hint3: `Lấy ${21 + v} chia 7 rồi tiến phần dư.`, explanation: `Sau ${21 + v} ngày, ta đến ${WEEKDAYS[mod(startDay + 21 + v, 7)]}.`, tag: "Chuyển giao lịch" },
    ];
  }
  const start = 2 + mod(v, 8); const multiplier = 2 + mod(v, 3); const add = 1 + mod(v, 5);
  const second = start * multiplier + add; const third = second * multiplier + add;
  return [
    { prompt: `Dãy bắt đầu ${start}; mỗi bước nhân ${multiplier} rồi cộng ${add}. Số thứ ba là bao nhiêu?`, type: "number", answer: third, hint1: "Mỗi bước phải làm đủ hai thao tác.", hint2: `Bước 1 được ${second}.`, hint3: `${second} × ${multiplier} + ${add} = ?`, explanation: `${start} → ${second} → ${third}.`, tag: "Tạo theo luật" },
    { prompt: `Mô tả nào tạo đúng dãy ${start}, ${start + 3}, ${start + 6}, ${start + 9}?`, type: "choice", answer: "Mỗi bước cộng 3", options: ["Mỗi bước cộng 2", "Mỗi bước cộng 3", "Mỗi bước nhân 3", "Cộng lần lượt 1, 2, 3"], hint1: "Tính khoảng cách.", hint2: "Các khoảng cách đều như nhau.", hint3: "Mỗi số sau hơn số trước 3.", explanation: "Quy luật đủ rõ là mỗi bước cộng 3.", tag: "Mô tả rõ" },
    { prompt: `Dãy bắt đầu ${20 + v}, bớt lần lượt 1, 2, 3, 4. Số thứ năm là bao nhiêu?`, type: "number", answer: 10 + v, hint1: "Có bốn lần bớt.", hint2: "Tổng số bị bớt là 1 + 2 + 3 + 4.", hint3: `Lấy ${20 + v} − 10.`, explanation: `Sau bốn bước, số thứ năm là ${10 + v}.`, tag: "Luật thay đổi" },
    { prompt: `Hai dãy cùng bắt đầu ${start}, ${start + 3}, ${start + 6}. Chỉ ba số này có đủ để khẳng định duy nhất một quy luật không?`, type: "choice", answer: "Không", options: ["Có", "Không", "Chỉ khi số đầu chẵn"], hint1: "Có thể nghĩ ra hơn một cách tạo số tiếp theo không?", hint2: "Một số ít dữ kiện có thể khớp nhiều quy luật.", hint3: "Ta cần mô tả hoặc thêm số để phân biệt.", explanation: "Ba số đầu có thể được giải thích bởi nhiều quy luật; cần thêm điều kiện.", tag: "Tư duy phản biện" },
    { prompt: `Tạo theo luật: bắt đầu ${start + 1}, cộng lần lượt 2, 4, 6, 8. Số thứ năm là bao nhiêu?`, type: "number", answer: start + 21, hint1: "Viết từng bước thay vì đoán.", hint2: "Tổng phần tăng là 20.", hint3: `${start + 1} + 20 = ?`, explanation: `Dãy đi qua ${start + 3}, ${start + 7}, ${start + 13} và kết thúc ở ${start + 21}.`, tag: "Chuyển giao sáng tạo" },
  ];
}

function calculationQuestions(sequence: number, v: number, band: DifficultyBand): QuestionInput[] {
  const bump = band === "stretch" ? 20 : band === "support" ? 0 : 10;
  if (sequence === 1) {
    // Số hạng thứ nhất luôn cách số tròn trăm từ 1 đến 5 đơn vị, nên phần chuyển sang luôn nhỏ hơn số hạng thứ hai.
    const move = 1 + mod(v, 5); const round = 100 * (2 + mod(v, 4) + bump / 10); const base = round - move; const add = 37 + mod(v, 20);
    return [
      { prompt: `Tính nhẩm thuận tiện: ${base} + ${add}.`, type: "number", answer: base + add, hint1: `Đưa ${base} lên số tròn ${round}.`, hint2: `Chuyển ${move} từ số hạng thứ hai sang số hạng thứ nhất.`, hint3: `${round} + ${add - move} = ?`, explanation: `${base} + ${add} = ${round} + ${add - move} = ${base + add}.`, tag: "Bù trừ" },
      { prompt: `Tính nhanh: ${round + 3} − ${98 - mod(v, 5)}.`, type: "number", answer: round + 3 - (98 - mod(v, 5)), hint1: "Cùng tăng hai số để số trừ thành tròn trăm.", hint2: `Cần cộng ${2 + mod(v, 5)} vào cả hai số.`, hint3: `${round + 5 + mod(v, 5)} − 100 = ?`, explanation: `Giữ hiệu không đổi, kết quả là ${round + 3 - (98 - mod(v, 5))}.`, tag: "Giữ hiệu" },
      { prompt: `Biểu thức nào thuận tiện nhất để tính ${99 - mod(v, 3)} × ${6 + mod(v, 3)}?`, type: "choice", answer: `100 × ${6 + mod(v, 3)} − ${1 + mod(v, 3)} × ${6 + mod(v, 3)}`, options: [`100 × ${6 + mod(v, 3)} − ${1 + mod(v, 3)} × ${6 + mod(v, 3)}`, `${90 - mod(v, 3)} + ${6 + mod(v, 3)}`, `${99 - mod(v, 3)} + ${6 + mod(v, 3)}`, `100 × ${6 + mod(v, 3)} + ${6 + mod(v, 3)}`], hint1: "So sánh thừa số với 100.", hint2: `Thừa số đầu ít hơn 100 đúng ${1 + mod(v, 3)}.`, hint3: "Nhân 100 rồi bớt phần đã thêm.", explanation: "Dùng số gần tròn giúp tính nhẩm và giữ đúng giá trị.", tag: "Chọn chiến lược" },
      { prompt: `Điền số để tổng không đổi: ${base} + ${add} = ${base + move} + □.`, type: "number", answer: add - move, hint1: "Số thứ nhất tăng bao nhiêu?", hint2: `Nó tăng ${move}, nên số kia phải giảm ${move}.`, hint3: `${add} − ${move} = ?`, explanation: `Chuyển ${move} giữa hai số hạng, ô trống là ${add - move}.`, tag: "Giải thích biến đổi" },
      { prompt: `Tính nhẩm và kiểm tra bằng cách khác: ${49 + v} + ${53 + v}.`, type: "number", answer: 102 + 2 * v, hint1: "Ghép hai phần gần 50.", hint2: `${49 + v} + ${53 + v} = 100 + ${2 + 2 * v}.`, hint3: `Kết quả là ${102 + 2 * v}.`, explanation: `Tách 50 + 50 = 100; hai phần còn lại cộng thêm ${2 + 2 * v}.`, tag: "Chuyển giao" },
    ];
  }
  if (sequence === 2) {
    const factor = 4 + mod(v, 5); const tens = 20 + 10 * mod(v, 4); const ones = 2 + mod(v, 7); const value = tens + ones;
    return [
      { prompt: `Tính bằng cách tách: ${value} × ${factor}.`, type: "number", answer: value * factor, hint1: `Tách ${value} thành ${tens} + ${ones}.`, hint2: `Tính ${tens} × ${factor} và ${ones} × ${factor}.`, hint3: `Cộng ${tens * factor} + ${ones * factor}.`, explanation: `${value} × ${factor} = ${tens * factor} + ${ones * factor} = ${value * factor}.`, tag: "Phân phối" },
      { prompt: `Tính nhanh: ${99 - mod(v, 4)} × ${factor}.`, type: "number", answer: (99 - mod(v, 4)) * factor, hint1: "Dùng 100 làm mốc.", hint2: `Tính 100 × ${factor} rồi bớt ${(1 + mod(v, 4))} × ${factor}.`, hint3: `${100 * factor} − ${(1 + mod(v, 4)) * factor} = ?`, explanation: `Kết quả là ${(99 - mod(v, 4)) * factor}.`, tag: "Số gần tròn" },
      { prompt: `Cách nào cho thấy rõ nhất vì sao ${value} × ${factor} đúng?`, type: "choice", answer: `${tens} × ${factor} + ${ones} × ${factor}`, options: [`${tens} × ${factor} + ${ones} × ${factor}`, `${value} + ${factor}`, `${value} × ${factor - 1}`, `${tens + factor} × ${ones}`], hint1: "Tách một thừa số thành chục và đơn vị.", hint2: "Cả hai phần đều phải được nhân.", hint3: `Dùng (${tens} + ${ones}) × ${factor}.`, explanation: "Tính chất phân phối cho phép nhân từng phần rồi cộng.", tag: "So sánh cách" },
      { prompt: `Bạn Gấu tính ${value} × ${factor} bằng ${tens * factor} + ${ones}. Bạn ấy quên điều gì?`, type: "choice", answer: `Quên nhân ${ones} với ${factor}`, options: [`Quên nhân ${ones} với ${factor}`, "Quên cộng hàng chục", "Quên viết đơn vị", "Không quên gì"], hint1: "Mỗi phần của số bị tách đều chịu phép nhân.", hint2: `${ones} cũng phải được nhân ${factor}.`, hint3: `Đúng phải là ${tens * factor} + ${ones * factor}.`, explanation: `Bạn ấy quên nhân phần đơn vị ${ones} với ${factor}.`, tag: "Phân tích lỗi" },
      { prompt: `Tính theo hai cách: ${25 + 5 * mod(v, 4)} × 4. Kết quả là bao nhiêu?`, type: "number", answer: (25 + 5 * mod(v, 4)) * 4, hint1: "Có thể tách thành phần tròn chục và phần còn lại.", hint2: "Hoặc gấp đôi hai lần.", hint3: `Kết quả là ${(25 + 5 * mod(v, 4)) * 4}.`, explanation: "Hai chiến lược khác nhau phải gặp nhau ở cùng đáp án.", tag: "Chuyển giao nhiều cách" },
    ];
  }
  if (sequence === 3) {
    const x = 5 + mod(v, 8); const mult = 3 + mod(v, 5); const add = 2 + mod(v, 9); const out = x * mult + add;
    return [
      { prompt: `Tìm số: □ × ${mult} + ${add} = ${out}.`, type: "number", answer: x, hint1: "Tháo thao tác cuối cùng trước.", hint2: `Lấy ${out} − ${add}.`, hint3: `${out - add} : ${mult} = ?`, explanation: `${out} − ${add} = ${out - add}; ${out - add} : ${mult} = ${x}.`, tag: "Đi ngược" },
      { prompt: `Một máy cộng ${add} rồi nhân ${mult}. Đầu ra là ${(x + add) * mult}. Đầu vào là bao nhiêu?`, type: "number", answer: x, hint1: "Đi ngược thứ tự thao tác.", hint2: `Chia ${mult} trước, rồi trừ ${add}.`, hint3: `${(x + add) * mult} : ${mult} − ${add} = ?`, explanation: `Đi ngược được ${x + add}, rồi ${x}.`, tag: "Thứ tự thao tác" },
      { prompt: `Tìm số chia: ${x * mult} : □ = ${mult}.`, type: "number", answer: x, hint1: "Số chia × thương = số bị chia.", hint2: `□ × ${mult} = ${x * mult}.`, hint3: `${x * mult} : ${mult} = ?`, explanation: `Số chia là ${x}.`, tag: "Quan hệ ngược" },
      { prompt: `Muốn kiểm tra đáp án ${x} cho □ × ${mult} + ${add} = ${out}, con nên làm gì?`, type: "choice", answer: `Tính ${x} × ${mult} + ${add}`, options: [`Tính ${x} × ${mult} + ${add}`, `Tính ${x} + ${mult} + ${add}`, `Lấy ${out} + ${add}`, `Chỉ nhìn xem ${x} có chẵn không`], hint1: "Thay số tìm được vào máy ban đầu.", hint2: "Đi xuôi theo đúng hai thao tác.", hint3: `Kết quả cần bằng ${out}.`, explanation: "Thay lại và đi xuôi là cách kiểm tra trực tiếp.", tag: "Kiểm chứng" },
      { prompt: `Máy lấy số vào, nhân ${mult + 1}, trừ ${add}. Đầu ra là ${x * (mult + 1) - add}. Số vào là bao nhiêu?`, type: "number", answer: x, hint1: "Tháo phép trừ trước.", hint2: `Cộng lại ${add}, rồi chia ${mult + 1}.`, hint3: `${x * (mult + 1) - add} + ${add} = ${x * (mult + 1)}.`, explanation: `Đi ngược cho số vào ${x}.`, tag: "Chuyển giao máy mới" },
    ];
  }
  if (sequence === 4) {
    const a = 245 + 7 * v; const b = 48 + mod(v, 11); const shift = 1 + mod(v, 5);
    return [
      { prompt: `Điền số: ${a} + ${b} = ${a - shift} + □.`, type: "number", answer: b + shift, hint1: "Vế phải mất bao nhiêu ở số thứ nhất?", hint2: `Cần bù lại ${shift} vào số thứ hai.`, hint3: `${b} + ${shift} = ?`, explanation: `Giữ tổng không đổi nên ô trống là ${b + shift}.`, tag: "Giữ tổng" },
      { prompt: `Biểu thức nào bằng ${a} − ${b}?`, type: "choice", answer: `${a + shift} − ${b + shift}`, options: [`${a + shift} − ${b + shift}`, `${a + shift} − ${b}`, `${a} − ${b + shift}`, `${a - shift} − ${b + shift}`], hint1: "Với hiệu, cùng thay đổi hai số một lượng như nhau.", hint2: `Cùng cộng ${shift}.`, hint3: `Chọn ${a + shift} − ${b + shift}.`, explanation: "Cùng tăng số bị trừ và số trừ giữ hiệu không đổi.", tag: "Giữ hiệu" },
      { prompt: `Đúng hay sai: ${a} + ${b} = ${a + 10} + ${b - 10}.`, type: "choice", answer: "Đúng", options: ["Đúng", "Sai", "Chỉ đúng khi tổng chẵn"], hint1: "Một số tăng, số kia giảm cùng lượng.", hint2: "Tổng phần thay đổi là +10 − 10.", hint3: "Phần thay đổi bằng 0.", explanation: "Chuyển 10 từ số hạng này sang số hạng kia không đổi tổng.", tag: "Lập luận cân bằng" },
      { prompt: `Bạn Mèo đổi ${a} − ${b} thành ${a + shift} − ${b - shift}. Hiệu có giữ nguyên không?`, type: "choice", answer: "Không", options: ["Có", "Không", "Chỉ khi số chẵn"], hint1: "Hai số đã thay đổi cùng chiều hay ngược chiều?", hint2: "Một số tăng còn số kia giảm, nên khoảng cách lớn thêm.", hint3: `Hiệu tăng ${2 * shift}.`, explanation: `Cách đổi làm hiệu tăng ${2 * shift}, nên không giữ nguyên.`, tag: "Phát hiện biến đổi sai" },
      { prompt: `Điền số để hai vế bằng nhau: ${a + 20} − ${b + 20} = ${a} − □.`, type: "number", answer: b, hint1: "Vế trái đã cùng tăng hai số.", hint2: "Hiệu vì thế không đổi.", hint3: `Ô trống vẫn là ${b}.`, explanation: `Hai vế cùng bằng ${a - b}.`, tag: "Chuyển giao" },
    ];
  }
  if (sequence === 5) {
    // Mỗi số hạng lệch khỏi số tròn trăm dưới 25 đơn vị và tổng hai độ lệch dưới 10,
    // nên làm tròn từng số hay tính chính xác đều dẫn về cùng một mốc trăm.
    const near = mod(v, 6);
    const a = 300 + 100 * mod(v, 3) + [12, -9, 18, -14, 7, -21][near]; const b = 200 + 100 * Math.floor(v / 6) + 100 * mod(v + 1, 2) + [-8, 15, -11, 9, -16, 13][near]; const exact = a + b;
    const rounded = Math.round(a / 100) * 100 + Math.round(b / 100) * 100;
    const nearFifty = [48, 49, 52, 51][mod(v, 4)]; const times = 5 + mod(v, 4); const product = 50 * times;
    return [
      { prompt: `${a} + ${b} gần số nào nhất?`, type: "choice", answer: rounded, options: [rounded - 200, rounded - 100, rounded, rounded + 100], hint1: "Làm tròn từng số đến hàng trăm.", hint2: `${a} gần ${Math.round(a / 100) * 100}; ${b} gần ${Math.round(b / 100) * 100}.`, hint3: "Cộng hai số đã làm tròn.", explanation: `Ước lượng được ${rounded}; kết quả chính xác là ${exact}.`, tag: "Ước lượng tổng" },
      { prompt: `${nearFifty} × ${times} gần số nào nhất?`, type: "choice", answer: product, options: [product - 100, product - 50, product, product + 50], hint1: `Thay ${nearFifty} bằng 50.`, hint2: `Tính 50 × ${times}.`, hint3: "Dùng tích gần đúng để chọn.", explanation: `50 × ${times} = ${product}; tích chính xác là ${nearFifty * times}, gần ${product} nhất.`, tag: "Ước lượng tích" },
      { prompt: `Một bạn tính ${a} + ${b} = ${exact - 100}. Kết quả này có hợp lý không?`, type: "choice", answer: "Không", options: ["Có", "Không", "Không thể kiểm tra"], hint1: "So với ước lượng hàng trăm.", hint2: `Tổng phải gần ${rounded}.`, hint3: `${exact - 100} cách kết quả đúng 100.`, explanation: `Ước lượng cho thấy ${exact - 100} quá thấp; tổng đúng là ${exact}.`, tag: "Bắt lỗi" },
      { prompt: `Khoảng nào chắc chắn chứa tổng ${a} + ${b}?`, type: "choice", answer: `${Math.floor(exact / 100) * 100} đến ${Math.floor(exact / 100) * 100 + 100}`, options: [`${Math.floor(exact / 100) * 100 - 100} đến ${Math.floor(exact / 100) * 100}`, `${Math.floor(exact / 100) * 100} đến ${Math.floor(exact / 100) * 100 + 100}`, `${Math.floor(exact / 100) * 100 + 100} đến ${Math.floor(exact / 100) * 100 + 200}`], hint1: "Không cần tính từng chữ số; tìm hai trăm liên tiếp bao quanh tổng.", hint2: `Tổng chính xác là gần ${rounded}.`, hint3: `Kiểm tra ${exact} nằm giữa hai mốc nào.`, explanation: `${exact} nằm trong khoảng đã chọn.`, tag: "Khoảng hợp lý" },
      { prompt: `Ước lượng rồi tính: ${a - 100} + ${b + 50}. Kết quả chính xác là bao nhiêu?`, type: "number", answer: exact - 50, hint1: "So với tổng ban đầu, một số giảm 100 và số kia tăng 50.", hint2: "Tổng mới giảm 50.", hint3: `${exact} − 50 = ?`, explanation: `Tổng mới là ${exact - 50}, phù hợp với ước lượng.`, tag: "Chuyển giao" },
    ];
  }
  const target = 60 + 10 * mod(v, 7); const factor = 4 + mod(v, 6); const x = Math.floor((target - 2) / factor); const adjustedTarget = x * factor + 2;
  return [
    { prompt: `Biểu thức nào bằng ${target}?`, type: "choice", answer: `${target / 10} × 10`, options: [`${target / 10} × 10`, `${target - 10} + 5`, `${target + 20} − 10`, `${target / 10} + 10`], hint1: "Tính từng biểu thức.", hint2: `Tìm biểu thức tạo đúng ${target}.`, hint3: `${target / 10} × 10 = ${target}.`, explanation: `Phương án ${target / 10} × 10 đạt đúng đích.`, tag: "Phép tính đích" },
    { prompt: `Điền số: ${factor} × □ + 2 = ${adjustedTarget}.`, type: "number", answer: x, hint1: "Đi ngược từ đích.", hint2: `Lấy ${adjustedTarget} − 2 rồi chia ${factor}.`, hint3: `${adjustedTarget - 2} : ${factor} = ?`, explanation: `Ô trống bằng ${x}.`, tag: "Tạo biểu thức" },
    { prompt: `Có bao nhiêu biểu thức đúng: ${target - 20}+20; ${target + 25}−25; ${target / 10}×10; ${target * 3}:3?`, type: "number", answer: 4, hint1: "Kiểm tra từng biểu thức với cùng một đích.", hint2: "Cả bốn phép biến đổi đều bù lại phần đã thay đổi.", hint3: "Đếm các biểu thức bằng đích.", explanation: `Cả bốn đều bằng ${target}.`, tag: "Nhiều cách" },
    { prompt: `Đổi đúng một dấu để ${target / 2} + 2 = ${target} trở thành một phép tính đúng.`, type: "choice", answer: "Đổi + thành ×", options: ["Đổi + thành ×", "Đổi = thành +", "Đổi 2 thành 3", "Không thể"], hint1: `Số ${target / 2} cần làm gì với 2 để thành ${target}?`, hint2: "Gấp đôi.", hint3: "Thay phép cộng bằng phép nhân.", explanation: `${target / 2} × 2 = ${target}.`, tag: "Biến đổi dấu" },
    { prompt: `Tạo đích ${target + 20}: điền □ vào (${target / 10} + □) × 10 = ${target + 20}.`, type: "number", answer: 2, hint1: "Chia đích cho 10 trước.", hint2: `${target + 20} : 10 = ${target / 10 + 2}.`, hint3: `${target / 10} + □ = ${target / 10 + 2}.`, explanation: `Ô trống bằng 2.`, tag: "Chuyển giao sáng tạo" },
  ];
}

function measurementQuestions(sequence: number, v: number, band: DifficultyBand): QuestionInput[] {
  const extra = band === "stretch" ? 2 : 0;
  if (sequence === 1) {
    // Tránh 150 cm (cách đều 1 m và 2 m) và để số đo thật luôn khác số dự đoán.
    const length = [80, 90, 100, 110, 120, 130, 170, 180, 190, 200, 210, 220][v]; const estimate = Math.round(length / 100) * 100; const measured = length - 3 - mod(v, 4);
    return [
      { prompt: `Một chiếc bàn dài khoảng ${length} cm. Ước lượng hợp lý nhất theo mét là bao nhiêu?`, type: "choice", answer: length < 150 ? "Khoảng 1 m" : "Khoảng 2 m", options: ["Khoảng 1 m", "Khoảng 2 m", "Khoảng 10 m"], hint1: "Nhớ 1 m = 100 cm.", hint2: `So ${length} cm với 100 cm và 200 cm.`, hint3: `Chọn mốc gần ${length} nhất.`, explanation: `${length} cm gần ${length < 150 ? 100 : 200} cm.`, tag: "Ước lượng đơn vị" },
      { prompt: `Đổi ${3 + mod(v, 5)} m ${20 + 5 * mod(v, 8)} cm thành xăng-ti-mét.`, type: "number", answer: (3 + mod(v, 5)) * 100 + 20 + 5 * mod(v, 8), hint1: "Đổi mét sang xăng-ti-mét trước.", hint2: `Nhân ${3 + mod(v, 5)} với 100.`, hint3: "Cộng phần xăng-ti-mét còn lại.", explanation: `Kết quả là ${(3 + mod(v, 5)) * 100 + 20 + 5 * mod(v, 8)} cm.`, tag: "Đổi đơn vị" },
      { prompt: `Một sợi dây dự đoán dài ${estimate} cm, đo thật được ${measured} cm. Sai lệch bao nhiêu xăng-ti-mét?`, type: "number", answer: Math.abs(estimate - measured), hint1: "Lấy số lớn trừ số nhỏ.", hint2: `So ${estimate} và ${measured}: số nào lớn hơn?`, hint3: `Tính ${Math.max(estimate, measured)} − ${Math.min(estimate, measured)}.`, explanation: `${Math.max(estimate, measured)} − ${Math.min(estimate, measured)} = ${Math.abs(estimate - measured)} cm.`, tag: "Kiểm chứng ước lượng" },
      { prompt: `Đơn vị nào phù hợp nhất để đo chiều dài ${METRE_PLACES[v]}?`, type: "choice", answer: "Mét", options: ["Mi-li-mét", "Xăng-ti-mét", "Mét", "Ki-lô-mét"], hint1: "Hình dung độ dài của cả một khu vực.", hint2: "Nó lớn hơn đồ vật nhỏ nhưng chưa phải khoảng cách giữa hai thành phố.", hint3: "Chọn mét.", explanation: "Mét phù hợp với kích thước một khu vực trong trường hoặc sinh hoạt.", tag: "Chọn đơn vị" },
      { prompt: `Một đoạn đường dài ${1 + mod(v, 3)} km và ${250 + 50 * mod(v, 6)} m. Tổng cộng bao nhiêu mét?`, type: "number", answer: (1 + mod(v, 3)) * 1000 + 250 + 50 * mod(v, 6), hint1: "Đưa tất cả về mét.", hint2: "1 km = 1 000 m.", hint3: "Cộng hai phần sau khi đổi.", explanation: `Tổng là ${(1 + mod(v, 3)) * 1000 + 250 + 50 * mod(v, 6)} m.`, tag: "Chuyển giao" },
    ];
  }
  if (sequence === 2) {
    const perimeter = 28 + 4 * mod(v + extra, 7); const length = perimeter / 2 - (3 + mod(v, 4)); const width = perimeter / 2 - length; // chiều dài luôn lớn hơn chiều rộng
    const startHour = 8 + mod(v, 3); const startMinute = 10 + 5 * mod(v, 7); const duration = 35 + 5 * mod(v, 5); const totalMinutes = startHour * 60 + startMinute + duration;
    return [
      { prompt: `Có ${perimeter} cm dây làm khung chữ nhật dài ${length} cm. Chiều rộng là bao nhiêu?`, type: "number", answer: width, hint1: "Dây quanh khung là chu vi.", hint2: `Nửa chu vi là ${perimeter / 2}.`, hint3: `${perimeter / 2} − ${length} = ?`, explanation: `Chiều rộng ${width} cm; kiểm tra (${length} + ${width}) × 2 = ${perimeter}.`, tag: "Giới hạn vật liệu" },
      { prompt: `Bắt đầu lúc ${startHour}:${String(startMinute).padStart(2, "0")}, hoạt động ${duration} phút. Kết thúc lúc nào?`, type: "choice", answer: `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, "0")}`, options: [`${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, "0")}`, `${Math.floor((totalMinutes - 10) / 60)}:${String((totalMinutes - 10) % 60).padStart(2, "0")}`, `${Math.floor((totalMinutes + 10) / 60)}:${String((totalMinutes + 10) % 60).padStart(2, "0")}`], hint1: "Cộng theo chục phút rồi phần còn lại.", hint2: "Nếu phút vượt 60, đổi thành một giờ.", hint3: `Đổi mốc bắt đầu và thời lượng ra phút.`, explanation: `Kết thúc lúc ${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, "0")}.`, tag: "Giới hạn thời gian" },
      { prompt: `Có ${100 + 20 * mod(v, 5)} nghìn đồng, mua ${3 + mod(v, 3)} món giá ${18 + 2 * mod(v, 4)} nghìn đồng. Còn bao nhiêu nghìn đồng?`, type: "number", answer: 100 + 20 * mod(v, 5) - (3 + mod(v, 3)) * (18 + 2 * mod(v, 4)), hint1: "Tính tổng tiền mua trước.", hint2: "Số món × giá một món.", hint3: "Lấy ngân sách trừ chi phí.", explanation: `Còn ${100 + 20 * mod(v, 5) - (3 + mod(v, 3)) * (18 + 2 * mod(v, 4))} nghìn đồng.`, tag: "Giới hạn ngân sách" },
      { prompt: `Ba đoạn dây, mỗi đoạn ${70 + 5 * v} cm, nối thành một sợi. Mỗi trong 2 mối nối chồng ${4 + mod(v, 4)} cm. Dây mới dài bao nhiêu?`, type: "number", answer: 3 * (70 + 5 * v) - 2 * (4 + mod(v, 4)), hint1: "Ba đoạn chỉ tạo hai mối nối.", hint2: "Tính tổng ban đầu rồi trừ hai phần chồng.", hint3: `Tính 3 × ${70 + 5 * v} − 2 × ${4 + mod(v, 4)}.`, explanation: `Dây mới dài ${3 * (70 + 5 * v) - 2 * (4 + mod(v, 4))} cm.`, tag: "Điều kiện ẩn" },
      { prompt: `Có ${perimeter + 8} cm dây làm khung vuông. Mỗi cạnh dài bao nhiêu?`, type: "number", answer: (perimeter + 8) / 4, hint1: "Hình vuông có bốn cạnh bằng nhau.", hint2: "Chia tổng dây cho 4.", hint3: `${perimeter + 8} : 4 = ?`, explanation: `Mỗi cạnh dài ${(perimeter + 8) / 4} cm.`, tag: "Chuyển giao" },
    ];
  }
  if (sequence === 3) {
    const half = 10 + mod(v + extra, 6); const pairs = Array.from({ length: Math.floor(half / 2) }, (_, i) => [i + 1, half - i - 1]); const bestA = Math.floor(half / 2); const bestB = Math.ceil(half / 2);
    return [
      { prompt: `Có ${half * 2} m hàng rào làm hình chữ nhật cạnh nguyên. Hình nào có diện tích lớn nhất?`, type: "choice", answer: `${bestA}×${bestB}`, options: [`1×${half - 1}`, `${Math.max(2, bestA - 2)}×${half - Math.max(2, bestA - 2)}`, `${bestA}×${bestB}`], hint1: `Nửa chu vi là ${half}.`, hint2: "Liệt kê các cặp có tổng bằng nửa chu vi.", hint3: "Hai cạnh càng gần nhau thì diện tích càng lớn.", explanation: `${bestA}×${bestB} có diện tích ${bestA * bestB}, lớn nhất trong các cặp.`, tag: "Tối ưu diện tích" },
      { prompt: `Với chu vi ${half * 2} m, hình ${pairs[0][0]}×${pairs[0][1]} có diện tích bao nhiêu?`, type: "number", answer: pairs[0][0] * pairs[0][1], hint1: "Diện tích = dài × rộng.", hint2: `Tính ${pairs[0][0]} × ${pairs[0][1]}.`, hint3: "Không dùng chu vi thay cho diện tích.", explanation: `Diện tích là ${pairs[0][0] * pairs[0][1]} m².`, tag: "Phân biệt đại lượng" },
      { prompt: `Hai hình cùng chu vi ${half * 2}: ${pairs[1][0]}×${pairs[1][1]} và ${bestA}×${bestB}. Hình nào rộng hơn?`, type: "choice", answer: `${bestA}×${bestB}`, options: [`${pairs[1][0]}×${pairs[1][1]}`, `${bestA}×${bestB}`, "Bằng nhau"], hint1: "Tính hai diện tích.", hint2: `${pairs[1][0]}×${pairs[1][1]} = ${pairs[1][0] * pairs[1][1]}.`, hint3: `${bestA}×${bestB} = ${bestA * bestB}.`, explanation: `${bestA * bestB} lớn hơn ${pairs[1][0] * pairs[1][1]}.`, tag: "So sánh phương án" },
      { prompt: `Muốn chắc phương án tốt nhất với nửa chu vi ${half}, con cần làm gì?`, type: "choice", answer: "Liệt kê mọi cặp cạnh rồi so diện tích", options: ["Đoán hình trông vuông nhất", "Liệt kê mọi cặp cạnh rồi so diện tích", "Chỉ thử một hình", "Cộng hai cạnh"], hint1: "Tối ưu cần bằng chứng không bỏ sót.", hint2: "Các cặp cạnh nguyên có tổng cố định.", hint3: "Liệt kê rồi so sánh.", explanation: "Thử có hệ thống giúp chứng minh không có phương án tốt hơn.", tag: "Chứng minh tối ưu" },
      { prompt: `Có ${half * 2 + 4} m hàng rào. Nửa chu vi là bao nhiêu mét?`, type: "number", answer: half + 2, hint1: "Chu vi bằng hai lần tổng hai cạnh.", hint2: "Chia chu vi cho 2.", hint3: `${half * 2 + 4} : 2 = ?`, explanation: `Nửa chu vi là ${half + 2} m.`, tag: "Chuyển giao" },
    ];
  }
  if (sequence === 4) {
    const scale = 5 * (1 + mod(v, 5)); const units = 4 + mod(v, 8);
    return [
      { prompt: `Trên sơ đồ, mỗi ô biểu diễn ${scale} m. Đường đi dài ${units} ô thì ngoài thực tế dài bao nhiêu mét?`, type: "number", answer: scale * units, hint1: "Mỗi ô là một đoạn cùng độ dài.", hint2: `Nhân ${units} với ${scale}.`, hint3: `${units} × ${scale} = ?`, explanation: `Quãng đường thật dài ${scale * units} m.`, tag: "Tỉ lệ trực quan" },
      { prompt: `Hai điểm cách nhau ${units + 2} đoạn, mỗi đoạn ${scale} m. Khoảng cách thật là bao nhiêu?`, type: "number", answer: (units + 2) * scale, hint1: "Đếm đoạn, không đếm điểm.", hint2: `Có ${units + 2} đoạn.`, hint3: `Tính ${units + 2} × ${scale}.`, explanation: `Khoảng cách là ${(units + 2) * scale} m.`, tag: "Đếm đoạn" },
      { prompt: `Sơ đồ dùng 1 cm thay cho ${scale} m. Đo được ${units} cm thì thật dài bao nhiêu mét?`, type: "number", answer: scale * units, hint1: "Mỗi xăng-ti-mét đại diện cùng một độ dài thật.", hint2: "Nhân độ dài trên sơ đồ với tỉ lệ.", hint3: `${units} × ${scale} = ?`, explanation: `Độ dài thật ${scale * units} m.`, tag: "Đổi mô hình" },
      { prompt: `Đường thật dài ${scale * (units + 1)} m, mỗi ô là ${scale} m. Cần vẽ dài bao nhiêu ô?`, type: "number", answer: units + 1, hint1: "Đây là bài đi ngược.", hint2: "Lấy độ dài thật chia giá trị mỗi ô.", hint3: `${scale * (units + 1)} : ${scale} = ?`, explanation: `Cần ${units + 1} ô.`, tag: "Đi ngược tỉ lệ" },
      { prompt: `Hai tuyến dài ${units} ô và ${units + 3} ô, mỗi ô ${scale} m. Tuyến dài hơn chênh bao nhiêu mét?`, type: "number", answer: 3 * scale, hint1: "Hai tuyến chênh 3 ô.", hint2: "Đổi 3 ô ra mét.", hint3: `3 × ${scale} = ?`, explanation: `Chênh lệch ${3 * scale} m.`, tag: "Chuyển giao so sánh" },
    ];
  }
  if (sequence === 5) {
    const startH = 8 + mod(v, 4); const startM = 5 * mod(v + 2, 9); const first = 25 + 5 * mod(v, 5); const rest = 10 + 5 * mod(v, 3); const second = 20 + 5 * mod(v + 1, 5); const total = first + rest + second; const end = startH * 60 + startM + total; const firstEnd = startH * 60 + startM + first;
    return [
      { prompt: `Bắt đầu ${startH}:${String(startM).padStart(2, "0")}, học ${first} phút. Kết thúc lúc nào?`, type: "choice", answer: clock(firstEnd), options: distinctOptions(clock(firstEnd), [`${startH}:${String(firstEnd % 60).padStart(2, "0")}`, clock(firstEnd + 10), clock(firstEnd - 10)]), hint1: "Cộng thời lượng vào mốc bắt đầu.", hint2: "Đổi 60 phút thành một giờ khi cần.", hint3: "Có thể đổi cả hai về phút.", explanation: `Thêm ${first} phút vào ${clock(startH * 60 + startM)} được ${clock(firstEnd)}.`, tag: "Mốc thời gian" },
      { prompt: `Một buổi gồm ${first} phút đọc, nghỉ ${rest} phút, rồi ${second} phút vẽ. Tổng bao nhiêu phút?`, type: "number", answer: total, hint1: "Tính cả thời gian nghỉ.", hint2: `Cộng ${first} + ${rest} + ${second}.`, hint3: `Tổng là ${total}.`, explanation: `Buổi hoạt động dài ${total} phút.`, tag: "Lịch nhiều phần" },
      { prompt: `Buổi trên bắt đầu ${startH}:${String(startM).padStart(2, "0")}. Kết thúc lúc nào?`, type: "choice", answer: `${Math.floor(end / 60)}:${String(end % 60).padStart(2, "0")}`, options: [`${Math.floor(end / 60)}:${String(end % 60).padStart(2, "0")}`, `${Math.floor((end - rest) / 60)}:${String((end - rest) % 60).padStart(2, "0")}`, `${Math.floor((end + 10) / 60)}:${String((end + 10) % 60).padStart(2, "0")}`], hint1: "Dùng tổng thời gian vừa tính.", hint2: `Cộng ${total} phút vào mốc đầu.`, hint3: "Theo dõi giờ khi số phút qua 60.", explanation: `Kết thúc lúc ${Math.floor(end / 60)}:${String(end % 60).padStart(2, "0")}.`, tag: "Lập lịch" },
      { prompt: `Có ${total + 25} phút cho cả buổi. Sau ba phần trên còn bao nhiêu phút?`, type: "number", answer: 25, hint1: "Lấy quỹ thời gian trừ thời gian đã dùng.", hint2: `${total + 25} − ${total}.`, hint3: "Phần còn lại là 25 phút.", explanation: "Còn 25 phút dự phòng.", tag: "Khoảng trống" },
      { prompt: `Hai hoạt động dài ${first} và ${second} phút, giữa chúng cần ${rest + 5} phút di chuyển. Tổng thời gian cần là bao nhiêu?`, type: "number", answer: first + second + rest + 5, hint1: "Không bỏ quên thời gian chuyển tiếp.", hint2: "Cộng đủ ba phần.", hint3: `${first} + ${second} + ${rest + 5} = ?`, explanation: `Cần ${first + second + rest + 5} phút.`, tag: "Chuyển giao" },
    ];
  }
  const budget = 100 + 20 * mod(v, 6); const price = 15 + 5 * mod(v, 5); const reserve = 20 + 10 * mod(v, 3); const usable = budget - reserve; const quantity = Math.floor(usable / price);
  return [
    { prompt: `Có ${budget} nghìn đồng, mua 3 món giá ${price} nghìn đồng. Còn bao nhiêu nghìn đồng?`, type: "number", answer: budget - 3 * price, hint1: "Tính chi phí trước.", hint2: `3 × ${price} = ${3 * price}.`, hint3: `${budget} − ${3 * price} = ?`, explanation: `Còn ${budget - 3 * price} nghìn đồng.`, tag: "Ngân sách" },
    { prompt: `Có ${budget} nghìn đồng và phải để lại ${reserve} nghìn. Mua tối đa bao nhiêu món giá ${price} nghìn?`, type: "number", answer: quantity, hint1: "Trừ khoản phải để lại trước.", hint2: `Chỉ được dùng ${usable} nghìn.`, hint3: `${usable} : ${price} được ${quantity} phần trọn vẹn.`, explanation: `Mua tối đa ${quantity} món và không đụng vào khoản dự phòng.`, tag: "Tối đa trong giới hạn" },
    { prompt: `Cần ít nhất ${20 + mod(v, 8)} chiếc bút, mỗi hộp có ${6 + mod(v, 3)} chiếc. Phải mua ít nhất bao nhiêu hộp?`, type: "number", answer: Math.ceil((20 + mod(v, 8)) / (6 + mod(v, 3))), hint1: "Thử số hộp gần đủ rồi kiểm tra.", hint2: "Không được mua một phần hộp.", hint3: "Chia rồi làm tròn lên.", explanation: `Cần ${Math.ceil((20 + mod(v, 8)) / (6 + mod(v, 3)))} hộp để đủ số bút.`, tag: "Làm tròn lên" },
    { prompt: `Phương án giá ${budget - 10} nghìn và ${budget + 10} nghìn. Ngân sách ${budget} nghìn. Chọn được phương án nào?`, type: "choice", answer: `${budget - 10} nghìn`, options: [`${budget - 10} nghìn`, `${budget + 10} nghìn`, "Cả hai", "Không phương án nào"], hint1: "So từng giá với giới hạn.", hint2: "Không được vượt ngân sách.", hint3: `${budget - 10} nhỏ hơn ${budget}.`, explanation: `Chỉ phương án ${budget - 10} nghìn nằm trong ngân sách.`, tag: "Ra quyết định" },
    { prompt: `Sau khi mua ${quantity} món giá ${price} nghìn từ ngân sách ${budget} nghìn, còn lại bao nhiêu nghìn?`, type: "number", answer: budget - quantity * price, hint1: "Tính tổng tiền mua.", hint2: `${quantity} × ${price} = ${quantity * price}.`, hint3: `${budget} − ${quantity * price} = ?`, explanation: `Còn ${budget - quantity * price} nghìn đồng.`, tag: "Chuyển giao" },
  ];
}

function geometryQuestions(sequence: number, v: number, band: DifficultyBand): QuestionInput[] {
  const add = band === "stretch" ? 2 : 0;
  if (sequence === 1) {
    const area = [12, 18, 20, 24, 30, 36][mod(v + add, 6)];
    const factors = Array.from({ length: Math.floor(Math.sqrt(area)) }, (_, i) => i + 1).filter((x) => area % x === 0).map((x) => [x, area / x]);
    const first = factors[0]; const last = factors.at(-1)!;
    return [
      { prompt: `Dùng ${area} ô vuông đơn vị, hình chữ nhật ${first[0]}×${first[1]} có chu vi bao nhiêu?`, type: "number", answer: 2 * (first[0] + first[1]), hint1: "Chu vi là độ dài quanh hình.", hint2: "Cộng chiều dài và chiều rộng rồi nhân 2.", hint3: `(${first[0]} + ${first[1]}) × 2 = ?`, explanation: `Chu vi là ${2 * (first[0] + first[1])}.`, tag: "Chu vi" },
      { prompt: `Hình ${last[0]}×${last[1]} và hình ${first[0]}×${first[1]} cùng có diện tích bao nhiêu?`, type: "number", answer: area, hint1: "Diện tích = số hàng × số cột.", hint2: `Tính ${last[0]} × ${last[1]}.`, hint3: `Cả hai tích đều bằng ${area}.`, explanation: `Cùng dùng ${area} ô nên cùng diện tích ${area}.`, tag: "Diện tích không đổi" },
      { prompt: `Trong các hình có diện tích ${area}, hình nào có chu vi nhỏ hơn?`, type: "choice", answer: `${last[0]}×${last[1]}`, options: [`${first[0]}×${first[1]}`, `${last[0]}×${last[1]}`, "Bằng nhau"], hint1: "Tính chu vi từng hình.", hint2: "Hai cạnh gần nhau thường tạo chu vi nhỏ hơn.", hint3: `So ${2 * (first[0] + first[1])} với ${2 * (last[0] + last[1])}.`, explanation: `${last[0]}×${last[1]} có chu vi nhỏ hơn.`, tag: "So sánh" },
      { prompt: `Đổi hình ${first[0]}×${first[1]} thành ${last[0]}×${last[1]} bằng cách chuyển các ô, diện tích có đổi không?`, type: "choice", answer: "Không", options: ["Có", "Không", "Chỉ đổi khi hình vuông"], hint1: "Không thêm, bớt hay chồng ô.", hint2: "Số ô vẫn là như cũ.", hint3: "Diện tích bằng số ô phủ kín.", explanation: "Sắp xếp lại không làm đổi tổng số ô, nên diện tích giữ nguyên.", tag: "Bảo toàn" },
      { prompt: `Một hình chữ nhật diện tích ${area} có một cạnh ${last[0]}. Cạnh kia dài bao nhiêu?`, type: "number", answer: last[1], hint1: "Diện tích = cạnh × cạnh.", hint2: `Lấy ${area} chia ${last[0]}.`, hint3: `${area} : ${last[0]} = ?`, explanation: `Cạnh kia dài ${last[1]}.`, tag: "Chuyển giao" },
    ];
  }
  if (sequence === 2) {
    const total = 16 + 2 * v; const part = 5 + mod(v, total - 8);
    return [
      { prompt: `Một hình diện tích ${total} ô được cắt thành hai mảnh. Một mảnh ${part} ô. Mảnh kia có bao nhiêu ô?`, type: "number", answer: total - part, hint1: "Tổng diện tích được bảo toàn.", hint2: "Lấy toàn bộ trừ phần đã biết.", hint3: `${total} − ${part} = ?`, explanation: `Mảnh còn lại có ${total - part} ô.`, tag: "Bảo toàn diện tích" },
      { prompt: `Hai mảnh ${part} ô và ${total - part} ô ghép không chồng lên nhau. Hình mới có diện tích bao nhiêu?`, type: "number", answer: total, hint1: "Cộng diện tích hai mảnh.", hint2: `Tính ${part} + ${total - part}.`, hint3: "Không có phần chồng hay bị bỏ.", explanation: `Hình mới vẫn có ${total} ô.`, tag: "Cắt ghép" },
      { prompt: "Khi cắt một hình rồi ghép lại không chồng, đại lượng nào chắc chắn giữ nguyên?", type: "choice", answer: "Diện tích", options: ["Diện tích", "Chu vi", "Số cạnh", "Chiều dài"], hint1: "Theo dõi phần bên trong hình.", hint2: "Chu vi có thể thay đổi do cạnh tiếp xúc.", hint3: "Không mất hay thêm phần phủ kín.", explanation: "Diện tích được bảo toàn; chu vi và hình dáng có thể đổi.", tag: "Điều không đổi" },
      { prompt: `Ghép hai hình chữ nhật ${2 + mod(v, 3)}×${4 + mod(v, 4)} không chồng nhau. Tổng diện tích là bao nhiêu?`, type: "number", answer: 2 * (2 + mod(v, 3)) * (4 + mod(v, 4)), hint1: "Tính diện tích một hình trước.", hint2: "Hai hình bằng nhau.", hint3: `Tính 2 × ${2 + mod(v, 3)} × ${4 + mod(v, 4)}.`, explanation: `Tổng diện tích ${2 * (2 + mod(v, 3)) * (4 + mod(v, 4))}.`, tag: "Ghép phần" },
      { prompt: `Một hình ${4 + 2 * mod(v, 3)}×${5 + mod(v, 4)} cắt đôi thành hai phần bằng nhau. Mỗi phần có diện tích bao nhiêu?`, type: "number", answer: ((4 + 2 * mod(v, 3)) * (5 + mod(v, 4))) / 2, hint1: "Tính diện tích toàn hình.", hint2: "Hai phần bằng nhau nên chia 2.", hint3: `Tính (${4 + 2 * mod(v, 3)} × ${5 + mod(v, 4)}) : 2.`, explanation: `Mỗi phần có diện tích ${((4 + 2 * mod(v, 3)) * (5 + mod(v, 4))) / 2}.`, tag: "Chuyển giao" },
    ];
  }
  if (sequence === 3) {
    const rows = 2 + mod(v, 3); const cols = 3 + mod(v + 1, 4);
    const rectangles = (rows * (rows + 1) * cols * (cols + 1)) / 4;
    const squares = Array.from({ length: Math.min(rows, cols) }, (_, i) => (rows - i) * (cols - i)).reduce((a, b) => a + b, 0);
    return [
      { prompt: `Lưới 1×${cols} có bao nhiêu hình chữ nhật tất cả?`, type: "number", answer: cols * (cols + 1) / 2, hint1: "Đếm theo độ dài 1 ô, 2 ô, …", hint2: `Cộng ${cols} + ${cols - 1} + … + 1.`, hint3: `Tổng là ${cols * (cols + 1) / 2}.`, explanation: `Có ${cols * (cols + 1) / 2} đoạn liên tiếp nên có từng ấy hình chữ nhật.`, tag: "Đếm theo kích thước" },
      { prompt: `Lưới ${rows}×${cols} có bao nhiêu ô vuông 1×1?`, type: "number", answer: rows * cols, hint1: "Số hàng × số cột.", hint2: `${rows} × ${cols}.`, hint3: "Chỉ đếm ô nhỏ.", explanation: `Có ${rows * cols} ô vuông nhỏ.`, tag: "Theo vị trí" },
      { prompt: `Lưới ${rows}×${cols} có tất cả bao nhiêu hình vuông mọi cỡ?`, type: "number", answer: squares, hint1: "Đếm riêng hình 1×1, 2×2, …", hint2: `Cỡ lớn nhất là ${Math.min(rows, cols)}×${Math.min(rows, cols)}.`, hint3: "Cộng số vị trí của từng cỡ.", explanation: `Cộng theo cỡ được ${squares} hình vuông.`, tag: "Nhiều cỡ" },
      { prompt: `Cách nào giúp đếm hình trong lưới ${rows}×${cols} không bị trùng?`, type: "choice", answer: "Chia theo kích thước rồi theo vị trí", options: ["Nhìn và đếm thật nhanh", "Chia theo kích thước rồi theo vị trí", "Chỉ đếm hình nhỏ", "Đếm lại nhiều lần ngẫu nhiên"], hint1: "Cần một tiêu chí phân nhóm.", hint2: "Kích thước là tiêu chí không chồng lặp.", hint3: "Sau đó quét vị trí theo hàng và cột.", explanation: "Chia theo cỡ và vị trí tạo danh sách đầy đủ, không lặp.", tag: "Chiến lược hệ thống" },
      { prompt: `Thử thách: lưới ${rows}×${cols} có tất cả bao nhiêu hình chữ nhật?`, type: "number", answer: rectangles, hint1: "Một hình chữ nhật được chọn bởi 2 đường ngang và 2 đường dọc.", hint2: `Có ${rows + 1} đường ngang và ${cols + 1} đường dọc.`, hint3: "Liệt kê theo kích thước nếu chưa dùng tổ hợp.", explanation: `Đếm mọi kích thước được ${rectangles} hình chữ nhật.`, tag: "Chuyển giao mở rộng" },
    ];
  }
  if (sequence === 4) {
    return [
      { prompt: "Hình vuông có bao nhiêu trục đối xứng?", type: "number", answer: 4, hint1: "Xét ngang, dọc và hai đường chéo.", hint2: "Mỗi nếp gấp phải làm hai nửa trùng nhau.", hint3: "Có bốn nếp gấp như vậy.", explanation: "Hình vuông có 4 trục đối xứng.", tag: "Đối xứng" },
      { prompt: `Xoay hình vuông ${90 * (1 + mod(v, 3))}° quanh tâm, hình có trùng vị trí cũ không?`, type: "choice", answer: "Có", options: ["Có", "Không", "Chỉ khi xoay 360°"], hint1: "Hình vuông có bốn cạnh và bốn góc giống nhau.", hint2: "Mỗi 90° là một phần tư vòng.", hint3: "Các đỉnh đổi chỗ nhưng đường bao trùng lại.", explanation: "Hình vuông trùng lại sau các góc quay là bội của 90°.", tag: "Phép xoay" },
      { prompt: "Hình chữ nhật không phải hình vuông có bao nhiêu trục đối xứng?", type: "number", answer: 2, hint1: "Xét nếp gấp ngang và dọc.", hint2: "Hai đường chéo không làm hai nửa trùng nhau.", hint3: "Có 2 trục.", explanation: "Hình chữ nhật có trục ngang và dọc.", tag: "Phân loại" },
      { prompt: `Gấp đôi tờ giấy rồi đục ${1 + mod(v, 3)} lỗ xuyên qua hai lớp. Mở ra thường thấy bao nhiêu lỗ?`, type: "number", answer: 2 * (1 + mod(v, 3)), hint1: "Mỗi lỗ xuyên qua hai lớp.", hint2: "Khi mở, mỗi vị trí có một ảnh đối xứng.", hint3: `Tính ${1 + mod(v, 3)} × 2.`, explanation: `Thấy ${2 * (1 + mod(v, 3))} lỗ đối xứng qua nếp gấp.`, tag: "Gấp giấy" },
      { prompt: "Một hình có đúng một trục đối xứng. Sau khi phản chiếu qua trục đó, hình thế nào?", type: "choice", answer: "Trùng với hình ban đầu", options: ["Trùng với hình ban đầu", "Luôn xoay 90°", "Nhỏ đi một nửa", "Mất một cạnh"], hint1: "Đó là định nghĩa của trục đối xứng.", hint2: "Hai nửa là ảnh gương của nhau.", hint3: "Phản chiếu làm chúng đổi chỗ và trùng lại.", explanation: "Phản chiếu qua trục đối xứng đưa hình về chính nó.", tag: "Chuyển giao" },
    ];
  }
  if (sequence === 5) {
    const r = 4 + 2 * mod(v, 4); const c = 6 + 2 * mod(v + 1, 4); const tile = 2 + mod(v, 2);
    return [
      { prompt: `Một bảng ${r}×${c} ô cần bao nhiêu gạch 1×1 để lát kín?`, type: "number", answer: r * c, hint1: "Không để hở hay chồng.", hint2: "Số gạch bằng diện tích bảng.", hint3: `${r} × ${c} = ?`, explanation: `Cần ${r * c} viên gạch.`, tag: "Lát kín" },
      { prompt: `Gạch ${tile}×${tile} có lát kín bảng ${r}×${c} không?`, type: "choice", answer: r % tile === 0 && c % tile === 0 ? "Có" : "Không", options: ["Có", "Không", "Không thể biết"], hint1: "Mỗi kích thước của bảng có chia hết cho cạnh viên gạch không?", hint2: `Kiểm tra ${r} và ${c} với ${tile}.`, hint3: "Cả hai chiều phải ghép vừa.", explanation: `${r} và ${c} ${r % tile === 0 && c % tile === 0 ? "đều" : "không cùng"} chia hết cho ${tile}.`, tag: "Điều kiện lát" },
      { prompt: `Bảng ${r}×${c} lát bằng gạch 2×2 cần bao nhiêu viên?`, type: "number", answer: r * c / 4, hint1: "Một viên phủ 4 ô.", hint2: "Lấy diện tích bảng chia 4.", hint3: `${r * c} : 4 = ?`, explanation: `Cần ${r * c / 4} viên.`, tag: "Phủ theo khối" },
      { prompt: "Vì sao các hình tròn bằng nhau không lát kín mặt phẳng nếu không chồng lên nhau?", type: "choice", answer: "Giữa các hình còn khe hở", options: ["Giữa các hình còn khe hở", "Hình tròn không có diện tích", "Hình tròn quá nhỏ", "Vì có quá nhiều màu"], hint1: "Thử đặt bốn hình tròn sát nhau.", hint2: "Quan sát khoảng trống ở giữa.", hint3: "Cạnh cong không khép kín như cạnh thẳng phù hợp.", explanation: "Các đường tròn tiếp xúc vẫn để lại khe giữa chúng.", tag: "Giải thích hình học" },
      { prompt: `Gạch 1×${tile} có lát kín một hàng dài ${c + tile} ô không?`, type: "choice", answer: (c + tile) % tile === 0 ? "Có" : "Không", options: ["Có", "Không", "Chỉ khi xếp chéo"], hint1: "Chiều dài hàng có chia hết cho chiều dài viên gạch?", hint2: `Tính ${c + tile} : ${tile}.`, hint3: "Không được cắt gạch.", explanation: `${c + tile} ${ (c + tile) % tile === 0 ? "chia hết" : "không chia hết"} cho ${tile}.`, tag: "Chuyển giao" },
    ];
  }
  const area = [24, 30, 36, 40, 48, 60][mod(v + add, 6)]; const factors = Array.from({ length: Math.floor(Math.sqrt(area)) }, (_, i) => i + 1).filter((x) => area % x === 0).map((x) => [x, area / x]); const best = factors.at(-1)!; const worst = factors[0];
  return [
    { prompt: `Với ${area} ô, hình nào có chu vi nhỏ nhất?`, type: "choice", answer: `${best[0]}×${best[1]}`, options: [`${worst[0]}×${worst[1]}`, `${best[0]}×${best[1]}`, "Mọi hình bằng nhau"], hint1: "Liệt kê các cặp thừa số.", hint2: "Tính chu vi từng cặp.", hint3: "Cặp cạnh gần nhau nhất thường tốt nhất.", explanation: `${best[0]}×${best[1]} có chu vi ${2 * (best[0] + best[1])}, nhỏ nhất.`, tag: "Tối ưu chu vi" },
    { prompt: `Hình ${worst[0]}×${worst[1]} có chu vi bao nhiêu?`, type: "number", answer: 2 * (worst[0] + worst[1]), hint1: "Cộng hai cạnh rồi nhân 2.", hint2: `(${worst[0]} + ${worst[1]}) × 2.`, hint3: "Không nhầm với diện tích.", explanation: `Chu vi ${2 * (worst[0] + worst[1])}.`, tag: "Tính chuẩn" },
    { prompt: `Hai hình ${worst[0]}×${worst[1]} và ${best[0]}×${best[1]} cùng diện tích ${area}. Hình nào gọn hơn theo chu vi?`, type: "choice", answer: `${best[0]}×${best[1]}`, options: [`${worst[0]}×${worst[1]}`, `${best[0]}×${best[1]}`, "Bằng nhau"], hint1: "“Gọn hơn” ở đây nghĩa là chu vi nhỏ hơn.", hint2: "So hai chu vi.", hint3: `${2 * (best[0] + best[1])} nhỏ hơn ${2 * (worst[0] + worst[1])}.`, explanation: `${best[0]}×${best[1]} dùng ít đường viền hơn.`, tag: "Tiêu chí tối ưu" },
    { prompt: "Muốn chứng minh một hình là tối ưu trong các hình cạnh nguyên, ta cần làm gì?", type: "choice", answer: "Xét mọi cặp thừa số có thể", options: ["Chỉ nhìn bằng mắt", "Xét mọi cặp thừa số có thể", "Thử một hình vuông", "Đoán cạnh dài nhất"], hint1: "Cần chứng minh không còn phương án tốt hơn.", hint2: "Mỗi hình chữ nhật tương ứng một cặp thừa số.", hint3: "Liệt kê đủ rồi so sánh.", explanation: "Xét mọi cặp thừa số giúp kết luận không bỏ sót.", tag: "Chứng minh tối ưu" },
    { prompt: `Một hình chữ nhật diện tích ${area} có cạnh ${best[0]}. Cạnh kia và chu vi lần lượt là gì?`, type: "choice", answer: `${best[1]} và ${2 * (best[0] + best[1])}`, options: distinctOptions(`${best[1]} và ${2 * (best[0] + best[1])}`, [`${best[1]} và ${area}`, `${area} và ${best[1]}`, `${best[1]} và ${best[0] + best[1]}`, `${best[0]} và ${area}`], 4), hint1: "Tìm cạnh kia bằng phép chia.", hint2: `Cạnh kia = ${area} : ${best[0]}.`, hint3: "Sau đó cộng hai cạnh và nhân 2.", explanation: `Cạnh kia ${best[1]}, chu vi ${2 * (best[0] + best[1])}.`, tag: "Chuyển giao" },
  ];
}

function dataQuestions(sequence: number, v: number): QuestionInput[] {
  const values = [4 + mod(v, 4), 7 + mod(v + 1, 5), 5 + mod(v + 2, 6), 9 + mod(v + 3, 5)]; const total = values.reduce((a, b) => a + b, 0); const max = Math.max(...values); const min = Math.min(...values);
  if (sequence === 1) return [
    { prompt: `Bảng ghi số sách đọc trong 4 tuần: ${values.join(", ")}. Tổng số sách là bao nhiêu?`, type: "number", answer: total, hint1: "Cộng đủ bốn tuần.", hint2: "Đánh dấu mỗi số sau khi cộng.", hint3: `Tính ${values.join(" + ")}.`, explanation: `Tổng là ${total} cuốn.`, tag: "Đọc dữ liệu" },
    { prompt: `Từ dữ liệu ${values.join(", ")}, chênh lệch giữa tuần cao nhất và thấp nhất là bao nhiêu?`, type: "number", answer: max - min, hint1: "Tìm số lớn nhất và nhỏ nhất.", hint2: `${max} − ${min}.`, hint3: "Dùng phép trừ để tìm chênh lệch.", explanation: `Chênh lệch là ${max - min}.`, tag: "So sánh dữ liệu" },
    { prompt: `Bảng chỉ ghi số sách đã đọc. Có thể kết luận tuần nhiều sách nhất cũng là tuần đọc lâu nhất không?`, type: "choice", answer: "Không", options: ["Có", "Không", "Luôn luôn đúng"], hint1: "Số sách và thời gian có phải cùng một dữ liệu?", hint2: "Sách có thể dài ngắn khác nhau.", hint3: "Bảng không ghi thời gian.", explanation: "Dữ liệu chưa đủ để kết luận về thời gian đọc.", tag: "Giới hạn kết luận" },
    { prompt: "Kết luận nào chỉ dựa đúng vào bảng số liệu?", type: "choice", answer: `Giá trị lớn nhất là ${max}`, options: [`Giá trị lớn nhất là ${max}`, "Tuần đó vui nhất", "Mọi cuốn sách dài bằng nhau", "Người đọc thích tuần cuối"], hint1: "Chọn điều có thể kiểm tra trực tiếp bằng số.", hint2: "Loại các nhận xét về cảm xúc hoặc thông tin không ghi.", hint3: `So sánh bốn giá trị với ${max}.`, explanation: `Chỉ kết luận “giá trị lớn nhất là ${max}” được dữ liệu chứng minh.`, tag: "Bằng chứng" },
    { prompt: `Thêm tuần thứ năm có ${6 + mod(v, 5)} cuốn. Tổng mới là bao nhiêu?`, type: "number", answer: total + 6 + mod(v, 5), hint1: "Dùng tổng cũ.", hint2: `Cộng thêm ${6 + mod(v, 5)}.`, hint3: `${total} + ${6 + mod(v, 5)} = ?`, explanation: `Tổng mới ${total + 6 + mod(v, 5)} cuốn.`, tag: "Chuyển giao" },
  ];
  if (sequence === 2) {
    const tops = 2 + mod(v, 3); const bottoms = 3 + mod(v + 1, 4); const combos = tops * bottoms;
    return [
      { prompt: `Có ${tops} áo và ${bottoms} quần khác nhau. Có bao nhiêu bộ gồm 1 áo và 1 quần?`, type: "number", answer: combos, hint1: "Cố định một áo rồi ghép với mọi quần.", hint2: `Mỗi áo có ${bottoms} cách chọn quần.`, hint3: `${tops} × ${bottoms} = ?`, explanation: `Có ${combos} bộ khác nhau.`, tag: "Cây khả năng" },
      { prompt: `Có ${tops} đường đi đến trạm A và ${bottoms} đường từ A đến B. Có bao nhiêu lộ trình?`, type: "number", answer: combos, hint1: "Mỗi lựa chọn đoạn đầu ghép với mọi lựa chọn đoạn sau.", hint2: "Dùng bảng hoặc cây hai tầng.", hint3: `${tops} × ${bottoms}.`, explanation: `Có ${combos} lộ trình.`, tag: "Quy tắc nhân" },
      { prompt: `Nếu thêm 1 chiếc áo vào tủ ${tops} áo và ${bottoms} quần, số bộ tăng thêm bao nhiêu?`, type: "number", answer: bottoms, hint1: "Áo mới ghép được với mấy quần?", hint2: `Nó ghép với cả ${bottoms} quần.`, hint3: "Mỗi cách ghép là một bộ mới.", explanation: `Tăng thêm ${bottoms} bộ.`, tag: "Thay đổi dữ liệu" },
      { prompt: "Cách nào giúp liệt kê không trùng, không sót?", type: "choice", answer: "Cố định lựa chọn thứ nhất rồi quét hết lựa chọn thứ hai", options: ["Liệt kê theo trí nhớ", "Cố định lựa chọn thứ nhất rồi quét hết lựa chọn thứ hai", "Chọn ngẫu nhiên", "Chỉ đếm kết quả đẹp"], hint1: "Cần một trật tự lặp lại.", hint2: "Cố định một yếu tố.", hint3: "Sau đó thay lần lượt yếu tố còn lại.", explanation: "Quét có hệ thống tránh bỏ sót và tránh lặp.", tag: "Chiến lược liệt kê" },
      { prompt: `Có ${tops} món chính, ${bottoms} món phụ và 2 đồ uống. Có bao nhiêu suất chọn mỗi loại một món?`, type: "number", answer: combos * 2, hint1: "Cây khả năng có ba tầng.", hint2: `Ghép ${combos} cặp đầu với 2 đồ uống.`, hint3: `${tops} × ${bottoms} × 2 = ?`, explanation: `Có ${combos * 2} suất.`, tag: "Chuyển giao ba tầng" },
    ];
  }
  if (sequence === 3) return [
    { prompt: "Túi A có 4 thẻ đỏ, 1 thẻ xanh. Túi B có 2 đỏ, 2 xanh. Muốn dễ rút xanh hơn nên chọn túi nào?", type: "choice", answer: "Túi B", options: ["Túi A", "Túi B", "Hai túi như nhau"], hint1: "So phần thẻ xanh trong mỗi túi.", hint2: "Túi A: 1 trong 5; túi B: 2 trong 4.", hint3: "Một nửa lớn hơn một phần năm.", explanation: "Túi B có tỉ lệ thẻ xanh lớn hơn.", tag: "So khả năng" },
    { prompt: "Một vòng quay có 4 phần bằng nhau: 2 đỏ, 1 xanh, 1 vàng. Màu nào dễ trúng nhất?", type: "choice", answer: "Đỏ", options: ["Đỏ", "Xanh", "Vàng", "Như nhau"], hint1: "Các phần bằng nhau nên đếm số phần mỗi màu.", hint2: "Đỏ chiếm 2 phần.", hint3: "Các màu khác chỉ chiếm 1 phần.", explanation: "Đỏ có 2 trên 4 phần nên dễ trúng nhất.", tag: "Mô hình công bằng" },
    { prompt: "Tung đồng xu 6 lần được 6 lần ngửa. Lần thứ 7 có chắc chắn là sấp không?", type: "choice", answer: "Không", options: ["Có", "Không", "Chắc chắn ngửa"], hint1: "Mỗi lần tung là một thử nghiệm mới.", hint2: "Kết quả trước không buộc kết quả sau.", hint3: "Sấp và ngửa vẫn đều có thể.", explanation: "Chuỗi trước không làm lần sau trở thành chắc chắn.", tag: "Ngộ nhận ngẫu nhiên" },
    { prompt: "Trò chơi nào công bằng hơn cho hai bạn?", type: "choice", answer: "Tung đồng xu: một bạn chọn sấp, một bạn chọn ngửa", options: ["Tung đồng xu: một bạn chọn sấp, một bạn chọn ngửa", "Túi có 3 đỏ, 1 xanh: mỗi bạn chọn một màu", "Vòng quay có 3 phần của bạn A, 1 phần của bạn B"], hint1: "Công bằng nghĩa là hai bên có cơ hội như nhau.", hint2: "Đồng xu cân bằng có hai kết quả đối xứng.", hint3: "Mỗi bạn nhận một mặt.", explanation: "Hai mặt của đồng xu có cơ hội như nhau trong mô hình lý tưởng.", tag: "Công bằng" },
    { prompt: `Trong hộp có ${3 + mod(v, 4)} bi đỏ và ${3 + mod(v, 4)} bi xanh. Rút màu đỏ hay xanh dễ hơn?`, type: "choice", answer: "Như nhau", options: ["Đỏ", "Xanh", "Như nhau"], hint1: "So số lượng hai màu.", hint2: "Hai màu có số bi bằng nhau.", hint3: "Cơ hội bằng nhau nếu các viên được trộn đều.", explanation: "Hai màu có cùng số lượng nên khả năng như nhau.", tag: "Chuyển giao" },
  ];
  if (sequence === 4) return [
    { prompt: `Hai cột biểu đồ có giá trị ${48 + v} và ${50 + v}. Chênh lệch thật là bao nhiêu?`, type: "number", answer: 2, hint1: "Đọc số, không chỉ nhìn chiều cao.", hint2: "Lấy giá trị lớn trừ nhỏ.", hint3: `${50 + v} − ${48 + v}.`, explanation: "Hai cột chỉ chênh 2 đơn vị.", tag: "Đọc chính xác" },
    { prompt: "Trục dọc bắt đầu từ 40 thay vì 0 có thể làm khác biệt trông thế nào?", type: "choice", answer: "Lớn hơn thực tế", options: ["Lớn hơn thực tế", "Nhỏ hơn thực tế", "Không bao giờ đổi"], hint1: "Phần từ 0 đến 40 đã bị cắt.", hint2: "Phần chênh lệch chiếm nhiều hơn trong đoạn còn thấy.", hint3: "Ấn tượng bằng mắt bị phóng đại.", explanation: "Cắt gốc trục có thể làm chênh lệch nhỏ trông rất lớn.", tag: "Trục biểu đồ" },
    { prompt: "Biểu đồ không ghi đơn vị còn thiếu thông tin quan trọng nào?", type: "choice", answer: "Các con số đo điều gì", options: ["Các con số đo điều gì", "Màu nào đẹp", "Ai vẽ", "Giấy khổ nào"], hint1: "Một giá trị 5 có thể là 5 bạn, 5 kg hoặc 5 phút.", hint2: "Cần tên đại lượng.", hint3: "Đó là đơn vị đo.", explanation: "Không có đơn vị, ta chưa hiểu đầy đủ ý nghĩa dữ liệu.", tag: "Thông tin thiếu" },
    { prompt: `Dữ liệu ${values.join(", ")} có giá trị lớn nhất là bao nhiêu?`, type: "number", answer: max, hint1: "So từng số.", hint2: "Đánh dấu số lớn nhất tạm thời.", hint3: `Số lớn nhất là ${max}.`, explanation: `${max} là giá trị lớn nhất.`, tag: "Đọc dữ liệu" },
    { prompt: "Trước khi tin một biểu đồ trên Internet, nên kiểm tra gì đầu tiên?", type: "choice", answer: "Nguồn, nhãn, đơn vị và trục", options: ["Nguồn, nhãn, đơn vị và trục", "Màu sắc", "Có nhiều hình hay không", "Tiêu đề thật to"], hint1: "Cần biết ai tạo và con số được biểu diễn thế nào.", hint2: "Đọc cả phần chữ nhỏ quanh biểu đồ.", hint3: "Chọn nguồn, nhãn, đơn vị và trục.", explanation: "Bốn yếu tố này giúp phát hiện biểu đồ thiếu hoặc gây hiểu lầm.", tag: "Chuyển giao phản biện" },
  ];
  if (sequence === 5) return [
    { prompt: "Tung một đồng xu có bao nhiêu kết quả có thể?", type: "number", answer: 2, hint1: "Liệt kê các mặt có thể xuất hiện.", hint2: "Có sấp và ngửa.", hint3: "Đếm hai kết quả.", explanation: "Có 2 kết quả có thể.", tag: "Không gian mẫu" },
    { prompt: "Túi chỉ có thẻ đỏ. Rút được thẻ đỏ là sự kiện gì?", type: "choice", answer: "Chắc chắn", options: ["Chắc chắn", "Có thể", "Không thể"], hint1: "Không có màu nào khác.", hint2: "Mọi kết quả đều đỏ.", hint3: "Chọn chắc chắn.", explanation: "Rút đỏ là chắc chắn.", tag: "Phân loại sự kiện" },
    { prompt: `Tung đồng xu ${8 + v} lần được ${5 + mod(v, 4)} lần ngửa. Có thể kết luận đồng xu chắc chắn thiên lệch không?`, type: "choice", answer: "Chưa thể", options: ["Có", "Chưa thể", "Chắc chắn công bằng"], hint1: "Số lần thử còn ít.", hint2: "Ngẫu nhiên có thể tạo chênh lệch ngắn hạn.", hint3: "Cần nhiều lần thử và kiểm tra dụng cụ.", explanation: "Một mẫu nhỏ chưa đủ chứng minh đồng xu thiên lệch hay công bằng.", tag: "Bằng chứng thử nghiệm" },
    { prompt: "Muốn so hai vòng quay, cách thử nào đáng tin hơn?", type: "choice", answer: "Quay mỗi vòng nhiều lần như nhau và ghi kết quả", options: ["Quay mỗi vòng một lần", "Quay mỗi vòng nhiều lần như nhau và ghi kết quả", "Chọn vòng đẹp hơn", "Hỏi một người đoán"], hint1: "Cần dữ liệu so sánh công bằng.", hint2: "Giữ số lần thử bằng nhau.", hint3: "Ghi lại thay vì nhớ bằng cảm giác.", explanation: "Nhiều lần thử có ghi chép giúp so sánh đáng tin hơn.", tag: "Thiết kế thí nghiệm" },
    { prompt: "Trong túi có 3 đỏ, 2 xanh, 1 vàng. Màu nào ít khả năng được rút nhất?", type: "choice", answer: "Vàng", options: ["Đỏ", "Xanh", "Vàng", "Như nhau"], hint1: "Đếm số thẻ từng màu.", hint2: "Màu ít thẻ nhất ít khả năng nhất.", hint3: "Vàng chỉ có 1 thẻ.", explanation: "Vàng có ít thẻ nhất nên ít khả năng nhất.", tag: "Chuyển giao" },
  ];
  const sample = 12 + 6 * mod(v, 5);
  return [
    { prompt: "Muốn biết món ăn yêu thích của cả lớp, câu hỏi nào ít dẫn dắt nhất?", type: "choice", answer: "Bạn thích món nào nhất?", options: ["Bạn thích món nào nhất?", "Bạn cũng thích pizza nhất đúng không?", "Pizza ngon hơn phở phải không?"], hint1: "Câu hỏi không nên gợi sẵn một đáp án.", hint2: "Tránh từ “đúng không”.", hint3: "Chọn câu hỏi trung lập.", explanation: "Câu hỏi mở, trung lập làm giảm thiên lệch.", tag: "Câu hỏi khảo sát" },
    { prompt: `Khảo sát ${sample} bạn: ${sample / 2} chọn đọc sách, ${sample / 3} chọn vẽ, còn lại chọn thể thao. Có bao nhiêu bạn chọn thể thao?`, type: "number", answer: sample - sample / 2 - sample / 3, hint1: "Tìm số đã chọn hai hoạt động đầu.", hint2: `Cộng ${sample / 2} + ${sample / 3}.`, hint3: `Lấy ${sample} trừ tổng đó.`, explanation: `Có ${sample - sample / 2 - sample / 3} bạn chọn thể thao.`, tag: "Tổng hợp khảo sát" },
    { prompt: "Chỉ hỏi các bạn trong câu lạc bộ bóng đá để biết môn thể thao yêu thích của toàn trường có hợp lý không?", type: "choice", answer: "Không", options: ["Có", "Không", "Luôn chính xác"], hint1: "Nhóm được hỏi có đại diện toàn trường không?", hint2: "Các bạn trong một câu lạc bộ có sở thích đặc biệt.", hint3: "Mẫu bị lệch về bóng đá.", explanation: "Mẫu khảo sát thiên lệch nên không đại diện toàn trường.", tag: "Chọn mẫu" },
    { prompt: "Thông tin nào cần ghi cùng kết quả khảo sát?", type: "choice", answer: "Câu hỏi, số người và cách chọn người", options: ["Câu hỏi, số người và cách chọn người", "Màu bút", "Tên người vẽ biểu đồ", "Kích thước giấy"], hint1: "Cần biết dữ liệu được tạo ra thế nào.", hint2: "Ba yếu tố ảnh hưởng khả năng tin kết quả.", hint3: "Chọn câu hỏi, số người và cách chọn.", explanation: "Những thông tin này cho phép đánh giá độ tin cậy.", tag: "Minh bạch dữ liệu" },
    { prompt: "Muốn so sở thích giữa hai lớp, điều kiện nào quan trọng?", type: "choice", answer: "Hỏi cùng câu hỏi theo cùng cách", options: ["Hỏi cùng câu hỏi theo cùng cách", "Dùng hai màu biểu đồ khác nhau", "Chỉ hỏi lớp đông hơn", "Hỏi vào hai năm khác nhau"], hint1: "So sánh cần điều kiện tương đương.", hint2: "Cách hỏi khác có thể làm đổi câu trả lời.", hint3: "Giữ câu hỏi và cách thực hiện giống nhau.", explanation: "Cùng phương pháp giúp so sánh có ý nghĩa.", tag: "Chuyển giao" },
  ];
}

function wordQuestions(sequence: number, v: number): QuestionInput[] {
  const x = 6 + mod(v, 10); const mult = 3 + mod(v, 5); const add = 4 + mod(v, 9); const out = x * mult + add;
  if (sequence === 1) return [
    { prompt: `Một số được nhân ${mult} rồi cộng ${add}, kết quả ${out}. Số ban đầu là bao nhiêu?`, type: "number", answer: x, hint1: "Đi ngược từ thao tác cuối.", hint2: `Lấy ${out} − ${add}.`, hint3: `${out - add} : ${mult} = ?`, explanation: `Số ban đầu là ${x}.`, tag: "Suy luận ngược" },
    { prompt: `An có một số bi. An cho ${add} viên rồi số còn lại chia đều vào ${mult} hộp, mỗi hộp ${x} viên. Ban đầu An có bao nhiêu?`, type: "number", answer: x * mult + add, hint1: "Đi ngược từ số bi trong các hộp.", hint2: `Các hộp có ${x * mult} viên.`, hint3: `Cộng lại ${add} viên đã cho.`, explanation: `Ban đầu có ${x * mult + add} viên.`, tag: "Khôi phục trạng thái" },
    { prompt: "Khi giải ngược một chuỗi thao tác, cần làm theo thứ tự nào?", type: "choice", answer: "Tháo thao tác cuối trước", options: ["Tháo thao tác cuối trước", "Tháo thao tác đầu trước", "Làm bất kỳ", "Chỉ đoán"], hint1: "Hình dung tháo nhiều lớp hộp.", hint2: "Lớp đóng sau nằm ngoài cùng.", hint3: "Tháo ngược thứ tự tạo ra.", explanation: "Phải tháo thao tác cuối trước và dùng phép tính ngược.", tag: "Chiến lược" },
    { prompt: `Kiểm tra đáp án ${x} cho bài trên bằng phép tính nào?`, type: "choice", answer: `${x} × ${mult} + ${add}`, options: [`${x} × ${mult} + ${add}`, `${x} + ${mult} + ${add}`, `${out} + ${add}`, `${x} × ${add}`], hint1: "Đi xuôi lại câu chuyện.", hint2: "Lặp đúng hai thao tác ban đầu.", hint3: `Kết quả cần bằng ${out}.`, explanation: "Đi xuôi từ đáp án là phép kiểm tra trực tiếp.", tag: "Kiểm chứng" },
    { prompt: `Một số cộng ${add + 2}, rồi gấp ${mult + 1} lần được ${(x + add + 2) * (mult + 1)}. Số đó là bao nhiêu?`, type: "number", answer: x, hint1: "Chia trước rồi trừ.", hint2: `Lấy đầu ra chia ${mult + 1}.`, hint3: `Sau đó trừ ${add + 2}.`, explanation: `Đi ngược tìm được ${x}.`, tag: "Chuyển giao" },
  ];
  if (sequence === 2) {
    const heads = 10 + mod(v, 8); const fourLegged = 3 + mod(v, heads - 4); const legs = 2 * heads + 2 * fourLegged;
    return [
      { prompt: `Có ${heads} con gồm gà 2 chân và chó 4 chân, tổng ${legs} chân. Có bao nhiêu con chó?`, type: "number", answer: fourLegged, hint1: "Giả sử tất cả đều là gà.", hint2: `Khi đó có ${2 * heads} chân, thiếu ${legs - 2 * heads}.`, hint3: "Mỗi con đổi từ gà sang chó tăng 2 chân.", explanation: `Thiếu ${2 * fourLegged} chân; chia 2 được ${fourLegged} con chó.`, tag: "Giả sử rồi điều chỉnh" },
      { prompt: `Với ${heads} con và ${legs} chân, có bao nhiêu con gà?`, type: "number", answer: heads - fourLegged, hint1: "Dùng số chó vừa tìm.", hint2: `Tổng con trừ ${fourLegged}.`, hint3: `${heads} − ${fourLegged} = ?`, explanation: `Có ${heads - fourLegged} con gà.`, tag: "Hoàn thiện nghiệm" },
      { prompt: "Vì sao mỗi lần đổi một con gà thành một con chó, tổng chân tăng 2?", type: "choice", answer: "Vì 4 − 2 = 2", options: ["Vì 4 − 2 = 2", "Vì có thêm một con", "Vì 4 + 2 = 6", "Vì chó nặng hơn"], hint1: "So chân của hai loại.", hint2: "Số con không đổi.", hint3: "Chênh lệch là 4 − 2.", explanation: "Mỗi lần thay loại làm tăng đúng 2 chân.", tag: "Giải thích điều chỉnh" },
      { prompt: `Kiểm tra nghiệm ${fourLegged} chó và ${heads - fourLegged} gà cho bao nhiêu chân?`, type: "number", answer: legs, hint1: "Tính chân từng nhóm.", hint2: `${fourLegged} × 4 + ${heads - fourLegged} × 2.`, hint3: "Cộng hai kết quả.", explanation: `Tổng đúng ${legs} chân.`, tag: "Kiểm tra hai điều kiện" },
      { prompt: `Có ${heads + 2} xe gồm xe đạp 2 bánh và ô tô 4 bánh, tổng ${legs + 6} bánh. Có bao nhiêu ô tô?`, type: "number", answer: fourLegged + 1, hint1: "Giả sử tất cả là xe đạp.", hint2: `Thiếu ${(legs + 6) - 2 * (heads + 2)} bánh.`, hint3: "Mỗi ô tô làm tăng 2 bánh.", explanation: `Có ${fourLegged + 1} ô tô.`, tag: "Chuyển giao" },
    ];
  }
  if (sequence === 3) {
    const target = 12 + mod(v, 9);
    return [
      { prompt: `Tìm tất cả cặp số tự nhiên dương có tổng ${target}. Nếu không phân biệt thứ tự, có bao nhiêu cặp?`, type: "number", answer: Math.floor(target / 2), hint1: "Bắt đầu từ 1 và tăng dần số đầu.", hint2: "Dừng khi số đầu không vượt số sau.", hint3: `Các cặp bắt đầu 1+${target - 1}, 2+${target - 2}, …`, explanation: `Có ${Math.floor(target / 2)} cặp không phân biệt thứ tự.`, tag: "Nhiều nghiệm" },
      { prompt: `Có bao nhiêu cách mua tổng ${target} món nếu số bánh và số sữa đều ít nhất 1?`, type: "number", answer: target - 1, hint1: "Số bánh có thể từ 1 đến bao nhiêu?", hint2: `Chọn bánh từ 1 đến ${target - 1}; số sữa được xác định.`, hint3: `Đếm ${target - 1} lựa chọn.`, explanation: `Có ${target - 1} cặp có thứ tự theo loại hàng.`, tag: "Đếm nghiệm" },
      { prompt: `Trong các cặp số dương có tổng ${target}, tích lớn nhất đạt khi hai số thế nào?`, type: "choice", answer: "Gần nhau nhất", options: ["Gần nhau nhất", "Một số bằng 1", "Cách xa nhau nhất", "Luôn bằng nhau"], hint1: "Thử các cặp từ ngoài vào giữa.", hint2: "So tích 1×(tổng−1), 2×(tổng−2), …", hint3: "Tích tăng khi hai số tiến gần nhau.", explanation: "Với tổng cố định, hai số gần nhau nhất cho tích lớn nhất trong các cặp nguyên.", tag: "Tối ưu trong nhiều nghiệm" },
      { prompt: `Cặp ${Math.floor(target / 2)} và ${Math.ceil(target / 2)} có tổng và tích lần lượt là gì?`, type: "choice", answer: `${target} và ${Math.floor(target / 2) * Math.ceil(target / 2)}`, options: [`${target} và ${Math.floor(target / 2) * Math.ceil(target / 2)}`, `${target + 1} và ${target}`, `${Math.floor(target / 2)} và ${Math.ceil(target / 2)}`], hint1: "Tính riêng tổng rồi tích.", hint2: `${Math.floor(target / 2)} + ${Math.ceil(target / 2)} = ${target}.`, hint3: `Nhân hai số được ${Math.floor(target / 2) * Math.ceil(target / 2)}.`, explanation: "Kết quả thỏa cả hai phép tính.", tag: "Đa điều kiện" },
      { prompt: `Tìm số cặp tự nhiên không âm x, y thỏa x + y = ${target + 2}. Có bao nhiêu cặp có thứ tự?`, type: "number", answer: target + 3, hint1: "Cho x chạy từ 0 đến tổng.", hint2: "Mỗi x xác định đúng một y.", hint3: `Có các giá trị x: 0, 1, …, ${target + 2}.`, explanation: `Có ${target + 3} cặp có thứ tự.`, tag: "Chuyển giao" },
    ];
  }
  // Khoảng mở (low, low + 4) với low chẵn chứa đúng ba số, trong đó chỉ số ở giữa là số chẵn.
  const low = 20 + 2 * v;
  if (sequence === 4) return [
    { prompt: `Cần tìm một số. Manh mối 1: lớn hơn ${low}. Manh mối 2: nhỏ hơn ${low + 4}. Có xác định duy nhất không?`, type: "choice", answer: "Không", options: ["Có", "Không", "Chỉ khi số chẵn"], hint1: "Liệt kê các số nguyên ở giữa.", hint2: `Có ${low + 1}, ${low + 2}, ${low + 3}.`, hint3: "Nhiều hơn một số thỏa.", explanation: "Hai manh mối chưa đủ để xác định duy nhất.", tag: "Manh mối thiếu" },
    { prompt: `Một số lớn hơn ${low} và nhỏ hơn ${low + 4}. Thêm manh mối “số đó là số chẵn”. Số cần tìm là bao nhiêu?`, type: "number", answer: low + 2, hint1: "Lọc các số trong khoảng theo tính chẵn.", hint2: `Xét ${low + 1}, ${low + 2}, ${low + 3}: nhìn chữ số tận cùng.`, hint3: "Chỉ giữ số chẵn.", explanation: `Trong ${low + 1}, ${low + 2}, ${low + 3} chỉ có ${low + 2} là số chẵn.`, tag: "Lọc điều kiện" },
    { prompt: "Một bộ manh mối tốt để tìm duy nhất một số cần điều gì?", type: "choice", answer: "Chỉ còn đúng một số thỏa tất cả", options: ["Chỉ còn đúng một số thỏa tất cả", "Có thật nhiều câu chữ", "Luôn nhắc màu sắc", "Có ít nhất một phép cộng"], hint1: "Mục tiêu là loại mọi phương án khác.", hint2: "Kiểm tra giao của các điều kiện.", hint3: "Cần đúng một ứng viên.", explanation: "Tính đủ của manh mối được xác nhận khi chỉ còn một nghiệm.", tag: "Đủ dữ kiện" },
    { prompt: `Số cần tìm nằm giữa ${30 + v} và ${36 + v}, chia hết cho 3. Có bao nhiêu khả năng?`, type: "number", answer: Array.from({ length: 5 }, (_, i) => 31 + v + i).filter((n) => n % 3 === 0).length, hint1: "Liệt kê các số nằm giữa, không lấy hai đầu.", hint2: "Kiểm tra tổng chữ số hoặc phép chia cho 3.", hint3: "Đếm những số thỏa cả hai điều kiện.", explanation: `Có ${Array.from({ length: 5 }, (_, i) => 31 + v + i).filter((n) => n % 3 === 0).length} khả năng.`, tag: "Giao điều kiện" },
    { prompt: `Tìm số lớn hơn ${40 + v}, nhỏ hơn ${47 + v}, vừa chẵn vừa chia hết cho 3.`, type: "number", answer: Array.from({ length: 6 }, (_, i) => 41 + v + i).find((n) => n % 6 === 0)!, hint1: "Số vừa chẵn vừa chia hết cho 3 thì chia hết cho 6.", hint2: "Liệt kê các số trong khoảng.", hint3: "Chọn bội của 6.", explanation: `Số phù hợp là ${Array.from({ length: 6 }, (_, i) => 41 + v + i).find((n) => n % 6 === 0)}.`, tag: "Chuyển giao" },
  ];
  if (sequence === 5) {
    // Thẻ A luôn nhiều điểm hơn thẻ B, nên đổi một thẻ B lấy một thẻ A làm tổng TĂNG (không có số âm).
    const priceB = 2 + mod(v, 3); const priceA = priceB + 2 + mod(v, 4); const countA = 2 + mod(v, 5); const countB = 3 + mod(v + 1, 4); const target = countA * priceA + countB * priceB;
    return [
      { prompt: `Cần đạt tổng ${target} điểm. Mỗi thẻ A được ${priceA} điểm, thẻ B được ${priceB} điểm. Một phương án phù hợp là gì?`, type: "choice", answer: `${countA} thẻ A và ${countB} thẻ B`, options: [`${countA} thẻ A và ${countB} thẻ B`, `${countA + 1} thẻ A và ${countB} thẻ B`, `${countA} thẻ A và ${countB + 1} thẻ B`], hint1: "Thử số thẻ A theo một trật tự.", hint2: "Sau mỗi lần thử, tính phần điểm còn thiếu.", hint3: `Kiểm tra ${countA}×${priceA} + ${countB}×${priceB}.`, explanation: `Phương án cho đúng ${target} điểm.`, tag: "Thử và sửa" },
      { prompt: `Kiểm tra ${countA} thẻ A và ${countB} thẻ B được tổng bao nhiêu điểm?`, type: "number", answer: target, hint1: "Tính điểm từng loại.", hint2: `${countA} × ${priceA} và ${countB} × ${priceB}.`, hint3: "Cộng hai phần.", explanation: `Tổng đúng ${target}.`, tag: "Kiểm tra phương án" },
      { prompt: "Thử và sửa có chiến lược khác đoán mò ở điểm nào?", type: "choice", answer: "Ghi lại kết quả và thay đổi một yếu tố có chủ đích", options: ["Ghi lại kết quả và thay đổi một yếu tố có chủ đích", "Thử thật nhanh", "Không cần kiểm tra", "Luôn bắt đầu bằng số lớn nhất"], hint1: "Chiến lược cần học từ lần thử trước.", hint2: "Chỉ thay một yếu tố để thấy tác động.", hint3: "Ghi chép giúp tránh lặp.", explanation: "Mỗi lần thử tạo bằng chứng cho lần điều chỉnh tiếp theo.", tag: "Chiến lược thử" },
      { prompt: `Thẻ A được ${priceA} điểm, thẻ B được ${priceB} điểm. Nếu thêm 1 thẻ A và bớt 1 thẻ B, tổng điểm tăng thêm bao nhiêu?`, type: "number", answer: priceA - priceB, hint1: "Một phần tăng, một phần giảm.", hint2: `Thêm ${priceA} điểm rồi bớt ${priceB} điểm.`, hint3: `Tính ${priceA} − ${priceB}.`, explanation: `Thẻ A nhiều điểm hơn thẻ B nên tổng tăng ${priceA} − ${priceB} = ${priceA - priceB} điểm.`, tag: "Điều chỉnh có kiểm soát" },
      { prompt: `Mục tiêu mới ${target + priceA} điểm. Từ phương án cũ, cách sửa nhanh nhất là gì?`, type: "choice", answer: "Thêm 1 thẻ A", options: ["Thêm 1 thẻ A", "Bớt 1 thẻ A", "Thêm 1 thẻ B", "Giữ nguyên"], hint1: "Mục tiêu tăng đúng bằng giá trị một thẻ A.", hint2: `Cần thêm ${priceA} điểm.`, hint3: "Thêm một thẻ A.", explanation: "Thêm 1 thẻ A đạt đúng mục tiêu mới.", tag: "Chuyển giao" },
    ];
  }
  const total = 10 + mod(v, 8);
  return [
    { prompt: `Tìm mọi cặp số tự nhiên dương có tổng ${total}. Không phân biệt thứ tự, có bao nhiêu cặp?`, type: "number", answer: Math.floor(total / 2), hint1: "Liệt kê từ cặp bắt đầu bằng 1.", hint2: "Tăng số đầu, giảm số sau.", hint3: "Dừng khi số đầu vượt số sau.", explanation: `Có ${Math.floor(total / 2)} cặp.`, tag: "Liệt kê đầy đủ" },
    { prompt: "Làm sao chứng minh danh sách nghiệm không bị thiếu?", type: "choice", answer: "Cho một đại lượng chạy qua mọi giá trị có thể theo thứ tự", options: ["Cho một đại lượng chạy qua mọi giá trị có thể theo thứ tự", "Nhìn danh sách thấy đủ", "Hỏi một người bạn", "Chỉ kiểm tra nghiệm đầu"], hint1: "Cần bao quát toàn bộ phạm vi.", hint2: "Mỗi giá trị của số đầu xác định số sau.", hint3: "Quét lần lượt không bỏ bước.", explanation: "Một quy tắc liệt kê toàn bộ phạm vi là bằng chứng không bỏ sót.", tag: "Chứng minh đầy đủ" },
    { prompt: `Có bao nhiêu số chẵn dương nhỏ hơn ${2 * total}?`, type: "number", answer: total - 1, hint1: "Liệt kê 2, 4, 6, …", hint2: `Số cuối là ${2 * total - 2}.`, hint3: "Mỗi số tương ứng 1, 2, …, tổng−1 khi chia 2.", explanation: `Có ${total - 1} số chẵn dương.`, tag: "Đếm theo quy tắc" },
    { prompt: `Một mật mã gồm hai chữ số khác nhau chọn từ 1, 2, …, ${3 + mod(v, 4)}. Có bao nhiêu mật mã?`, type: "number", answer: (3 + mod(v, 4)) * (2 + mod(v, 4)), hint1: "Chọn chữ số đầu rồi chữ số sau.", hint2: "Sau khi chọn chữ số đầu, còn ít hơn 1 lựa chọn.", hint3: `Tính ${3 + mod(v, 4)} × ${2 + mod(v, 4)}.`, explanation: `Có ${(3 + mod(v, 4)) * (2 + mod(v, 4))} mật mã có thứ tự.`, tag: "Đếm không sót" },
    { prompt: `Tìm số cặp (x, y) tự nhiên không âm thỏa x + y = ${total + 3}.`, type: "number", answer: total + 4, hint1: "Cho x chạy từ 0 đến tổng.", hint2: "Mỗi x có đúng một y.", hint3: `Đếm cả hai đầu 0 và ${total + 3}.`, explanation: `Có ${total + 4} cặp có thứ tự.`, tag: "Chuyển giao chứng minh" },
  ];
}

function generateQuestions(domain: DomainId, sequence: number, variant: number, band: DifficultyBand) {
  if (domain === "number") return numberQuestions(sequence, variant, band);
  if (domain === "calculation") return calculationQuestions(sequence, variant, band);
  if (domain === "measurement") return measurementQuestions(sequence, variant, band);
  if (domain === "geometry") return geometryQuestions(sequence, variant, band);
  if (domain === "data") return dataQuestions(sequence, variant);
  return wordQuestions(sequence, variant);
}

/**
 * `mastery`: mức thành thạo 0–100 của miền (xem mastery.ts). Dải khó theo mức này ngay từ buổi đầu tiên,
 * nên kết quả đánh giá đầu vào có tác dụng và dải có thể hạ xuống khi con gặp khó.
 */
export function createMissionEdition(base: DeepMission, completedCount = 0, mastery = MASTERY_DEFAULT): MissionEdition {
  const variant = mod(completedCount, VARIANTS_PER_MISSION);
  const band = bandForMastery(mastery);
  const generated = generateQuestions(base.domain, base.sequence, variant, band).map((input, index) => makeQuestion(`${base.id}-v${variant + 1}-q${index + 1}`, index === 0 ? { ...input, prompt: `Tại ${CONTEXTS[variant]}, ${input.prompt.charAt(0).toLocaleLowerCase("vi")}${input.prompt.slice(1)}` } : input));
  const mission: DeepMission = {
    ...base,
    deepPractice: generated.slice(0, PRACTICE_PER_EDITION),
    transfer: generated[PRACTICE_PER_EDITION],
  };
  return {
    id: `${base.id}-v${variant + 1}-${band}`,
    number: variant + 1,
    total: VARIANTS_PER_MISSION,
    label: `Phiên bản ${variant + 1}/${VARIANTS_PER_MISSION}`,
    difficulty: band,
    difficultyLabel: difficultyLabel(band),
    thinkingLens: THINKING_LENSES[base.domain][base.sequence - 1],
    mission,
  };
}

export function validateMissionVariants(missions: DeepMission[]) {
  const errors: string[] = [];
  for (const mission of missions) {
    const openingPrompts = new Set<string>();
    for (let completed = 0; completed < VARIANTS_PER_MISSION; completed += 1) {
      const edition = createMissionEdition(mission, completed, 70);
      const questions = [...edition.mission.deepPractice, edition.mission.transfer];
      if (questions.length !== 5) errors.push(`${edition.id}: cần 5 câu.`);
      openingPrompts.add(questions[0].prompt);
      questions.forEach((question) => {
        if (!question.prompt.trim() || !question.answer.trim()) errors.push(`${question.id}: thiếu đề hoặc đáp án.`);
        if (question.hints.length !== 3) errors.push(`${question.id}: cần 3 tầng gợi ý.`);
        if (question.type === "number" && (!/^\d+$/.test(question.answer) || Number(question.answer) > 100_000)) errors.push(`${question.id}: đáp án số phải là số tự nhiên trong phạm vi 100 000.`);
        if (question.type === "choice" && (!question.options?.includes(question.answer) || new Set(question.options).size !== question.options.length)) errors.push(`${question.id}: lựa chọn trùng nhau hoặc thiếu đáp án.`);
      });
    }
    if (openingPrompts.size !== VARIANTS_PER_MISSION) errors.push(`${mission.id}: câu mở đầu chưa tạo đủ ${VARIANTS_PER_MISSION} biến thể khác nhau.`);
  }
  return errors;
}
