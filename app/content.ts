import { shuffleById } from "./option-order";

export type DomainId = "number" | "calculation" | "measurement" | "geometry" | "data" | "word";
export type AnswerType = "choice" | "number";

export type PracticeQuestion = {
  prompt: string;
  type: AnswerType;
  options?: string[];
  answer: string;
  hint: string;
  explanation: string;
  challengeTag?: string;
};

export type DiagnosticQuestion = PracticeQuestion & {
  id: string;
  domain: DomainId;
  skill: string;
  difficulty: 1 | 2 | 3;
  context?: { label: string; values: { name: string; value: number }[] };
  /** Hình minh hoạ cụ thể hoá câu hỏi trừu tượng (theo góp ý hội đồng cho d3 và w3). */
  visual?: DiagnosticVisual;
};

export type DiagnosticVisual =
  | { kind: "sample-dots"; total: number; asked: number; liked: number }
  | { kind: "height-order"; people: string[]; clues: string[] };

export type Lesson = {
  domain: DomainId;
  code: string;
  unit: string;
  title: string;
  goal: string;
  prerequisite: string;
  hook: string;
  wonder: string;
  ideaTitle: string;
  idea: string;
  representations: { label: string; value: string; note: string }[];
  model: { prompt: string; steps: string[]; answer: string };
  practice: PracticeQuestion[];
  reflection: string;
};

export const DOMAINS: {
  id: DomainId;
  name: string;
  short: string;
  description: string;
  color: string;
  soft: string;
}[] = [
  { id: "number", name: "Quy luật và cảm giác số", short: "Quy luật", description: "Nhìn ra cấu trúc ẩn, dự đoán và giải thích quy luật", color: "#e6842a", soft: "#fff0d9" },
  { id: "calculation", name: "Chiến lược tính thông minh", short: "Chiến lược", description: "Biến đổi phép tính để nhanh hơn mà vẫn hiểu vì sao", color: "#e4515f", soft: "#ffe5e8" },
  { id: "measurement", name: "Ước lượng và mô hình", short: "Mô hình", description: "Ước lượng, đổi đơn vị và dùng đại lượng giải quyết vấn đề", color: "#347fc4", soft: "#e3f1ff" },
  { id: "geometry", name: "Hình học khám phá", short: "Hình học", description: "Xếp, cắt, xoay hình và phát hiện điều không thay đổi", color: "#7759bf", soft: "#eee8ff" },
  { id: "data", name: "Dữ liệu và khả năng", short: "Dữ liệu", description: "Đọc dữ liệu, đếm khả năng và không kết luận vội", color: "#1b9a83", soft: "#ddf7f1" },
  { id: "word", name: "Logic và giải quyết vấn đề", short: "Logic", description: "Lập kế hoạch, suy luận ngược và trình bày nhiều cách", color: "#b34e8a", soft: "#f9e3f1" },
];

const q = (
  id: string, domain: DomainId, difficulty: 1 | 2 | 3, skill: string,
  prompt: string, type: AnswerType, answer: string, hint: string,
  explanation: string, options?: string[], context?: DiagnosticQuestion["context"],
): DiagnosticQuestion => ({ id, domain, difficulty, skill, prompt, type, answer, hint, explanation, options: options ? shuffleById(options, id) : undefined, context });

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  q("n1", "number", 1, "Nhìn ra quy luật", "Dãy số 4, 7, 10, 13, … có số tiếp theo là bao nhiêu?", "number", "16", "Quan sát khoảng cách giữa hai số liên tiếp.", "Mỗi lần dãy tăng 3 nên số tiếp theo là 16."),
  q("n2", "number", 2, "Cấu tạo số", "Số 6□2 bằng 600 + 70 + 2. Chữ số cần điền vào ô vuông là gì?", "number", "7", "70 là giá trị của hàng chục.", "Chữ số 7 ở hàng chục có giá trị 70."),
  q("n3", "number", 3, "Đếm có hệ thống", "Dùng ba chữ số 1, 2, 3, mỗi chữ số đúng một lần. Lập được bao nhiêu số có ba chữ số khác nhau?", "number", "6", "Cố định chữ số hàng trăm rồi đếm cách xếp hai chữ số còn lại.", "Có 3 cách chọn hàng trăm, rồi 2 cách xếp phần còn lại: 3 × 2 = 6 số."),
  q("c1", "calculation", 1, "Bù trừ", "Không đặt tính, em hãy tính: 198 + 37 = ?", "number", "235", "Bù 2 cho 198 thành 200 rồi bớt lại 2.", "200 + 37 − 2 = 235."),
  q("c2", "calculation", 2, "Tách và ghép", "Tính nhanh: 25 × 8 = ?", "number", "200", "Nghĩ 25 × 4 trước.", "25 × 4 = 100 nên 25 × 8 = 200."),
  q("c3", "calculation", 3, "Biến đổi tương đương", "Cách tính nào cho cùng kết quả với 48 × 5?", "choice", "50 × 5 − 10", "Thay 48 bởi một số tròn chục gần nó.", "48 × 5 = (50 − 2) × 5 = 50 × 5 − 10.", ["50 × 5 − 2", "50 × 5 − 5", "50 × 5 − 10", "40 × 5 + 8"]),
  q("m1", "measurement", 1, "Mô hình chu vi", "Một hình chữ nhật có chu vi 24 cm, chiều dài 8 cm. Chiều rộng là bao nhiêu xăng-ti-mét?", "number", "4", "Nửa chu vi bằng chiều dài cộng chiều rộng.", "24 : 2 = 12; 12 − 8 = 4 cm."),
  q("m2", "measurement", 2, "Đổi và tổng hợp đơn vị", "Ba sợi dây dài bằng nhau, mỗi sợi dài 1 m 2 dm. Cả ba sợi dài bao nhiêu xăng-ti-mét?", "number", "360", "Đổi độ dài một sợi sang xăng-ti-mét trước.", "1 m 2 dm = 120 cm; 120 × 3 = 360 cm."),
  q("m3", "measurement", 3, "Thời gian nhiều bước", "Một bộ phim bắt đầu lúc 8 giờ 45 phút và kéo dài 95 phút. Phim kết thúc lúc nào?", "choice", "10 giờ 20 phút", "Tách 95 phút thành 60 phút và 35 phút.", "8:45 + 60 phút = 9:45; thêm 35 phút được 10:20.", ["9 giờ 20 phút", "9 giờ 40 phút", "10 giờ 10 phút", "10 giờ 20 phút"]),
  q("g1", "geometry", 1, "Cắt và ghép hình", "Cắt một hình vuông theo một đường chéo. Ta được hai hình gì?", "choice", "Hai hình tam giác bằng nhau", "Hãy tưởng tượng đường nối hai đỉnh đối diện.", "Đường chéo chia hình vuông thành hai tam giác vuông bằng nhau.", ["Hai hình vuông", "Hai hình chữ nhật", "Hai hình tam giác bằng nhau", "Một tam giác và một hình vuông"]),
  q("g2", "geometry", 2, "Chu vi hình ghép", "Ghép 3 hình vuông cạnh 1 cm thành hình chữ L. Chu vi hình chữ L là bao nhiêu xăng-ti-mét?", "number", "8", "Ba hình rời có 12 cạnh; mỗi cạnh ghép chung làm mất 2 cạnh ngoài.", "Hình chữ L có 2 cạnh ghép chung nên chu vi là 12 − 4 = 8 cm."),
  q("g3", "geometry", 3, "Đếm cấu hình", "Một hình chữ nhật có diện tích 24 ô vuông. Có bao nhiêu cặp chiều dài–chiều rộng là số tự nhiên? (Không tính đổi chỗ)", "number", "4", "Tìm các cặp số có tích bằng 24.", "Các cặp là 1×24, 2×12, 3×8 và 4×6: có 4 cặp."),
  q("d1", "data", 1, "Đọc và so sánh dữ liệu", "Biểu đồ cho biết số trang sách bốn ngày. Ngày đọc nhiều nhất hơn ngày đọc ít nhất bao nhiêu trang?", "number", "6", "Tìm cột cao nhất và thấp nhất rồi lấy hiệu.", "Ngày cao nhất 9 trang, thấp nhất 3 trang; chênh lệch 6 trang.", undefined, { label: "Số trang", values: [{ name: "T2", value: 5 }, { name: "T3", value: 9 }, { name: "T4", value: 3 }, { name: "T5", value: 7 }] }),
  q("d2", "data", 2, "Đếm khả năng", "Có 3 chiếc áo và 2 chiếc quần khác nhau. Chọn 1 áo và 1 quần thì có bao nhiêu cách phối?", "number", "6", "Mỗi chiếc áo có thể đi với mấy chiếc quần?", "Mỗi trong 3 áo đi với 2 quần: 3 × 2 = 6 cách."),
  { ...q("d3", "data", 3, "Suy luận từ dữ liệu", "Lớp có 30 bạn. Ta chỉ hỏi 10 bạn đứng gần cửa thì thấy 6 bạn thích cờ vua. Có thể kết luận chắc chắn cả lớp thích cờ vua không?", "choice", "Không, mẫu khảo sát chưa đủ", "Nhìn hình: còn bao nhiêu bạn chưa được hỏi?", "Kết quả chỉ mô tả 10 bạn được hỏi; 20 bạn còn lại chưa được hỏi nên chưa đủ để kết luận chắc chắn cho cả lớp.", ["Có, vì 6 lớn hơn 5", "Có, vì đã hỏi 10 bạn", "Không, mẫu khảo sát chưa đủ", "Không, vì cờ vua khó"]), visual: { kind: "sample-dots", total: 30, asked: 10, liked: 6 } },
  q("w1", "word", 1, "Suy luận điều kiện", "Có 4 con vật gồm gà và thỏ, tổng cộng 12 chân. Có bao nhiêu con thỏ?", "number", "2", "Nếu cả 4 đều là gà thì có 8 chân; mỗi lần đổi một gà thành một thỏ tăng 2 chân.", "Cần tăng từ 8 lên 12 chân, tức tăng 4 chân; vậy đổi 2 con thành thỏ."),
  q("w2", "word", 2, "Suy luận ngược", "Một số được nhân 3, sau đó cộng 7 thì bằng 34. Số ban đầu là bao nhiêu?", "number", "9", "Đi ngược từ 34: làm phép trừ trước rồi mới chia.", "34 − 7 = 27; 27 : 3 = 9."),
  { ...q("w3", "word", 3, "Logic thứ tự", "An cao hơn Bình. Chi thấp hơn Bình. Ai cao nhất?", "choice", "An", "Xếp ba bạn theo thứ tự từ thấp đến cao.", "Chi thấp hơn Bình, còn Bình thấp hơn An; vì vậy An cao nhất.", ["An", "Bình", "Chi", "Không xác định được"]), visual: { kind: "height-order", people: ["Bình", "Chi", "An"], clues: ["An cao hơn Bình.", "Chi thấp hơn Bình."] } },
];

const p = (prompt: string, type: AnswerType, answer: string, hint: string, explanation: string, options?: string[], challengeTag?: string): PracticeQuestion =>
  ({ prompt, type, answer, hint, explanation, options, challengeTag });

export const LESSONS: Record<DomainId, Lesson> = {
  number: {
    domain: "number", code: "MR-01", unit: "Phòng thí nghiệm số", title: "Mật mã của dãy số", goal: "Tìm, kiểm tra và giải thích một quy luật thay vì chỉ đoán số tiếp theo.", prerequisite: "Cộng, trừ và nhân các số trong phạm vi đã học.",
    hook: "Một dãy số giống như dấu chân của gấu mèo: nếu nhìn đủ kỹ, con sẽ biết bước tiếp theo đi đâu.", wonder: "Dãy 2, 5, 10, 17, … đang lớn lên theo cách nào? Hãy dự đoán trước khi xem mẫu.",
    ideaTitle: "Nhìn khoảng cách, không chỉ nhìn con số", idea: "Khi dãy không tăng đều, hãy viết khoảng cách giữa các số. Nếu khoảng cách cũng có quy luật, ta đã tìm được chiếc chìa khóa thứ hai.",
    representations: [{ label: "Số", value: "2", note: "+3" }, { label: "Số", value: "5", note: "+5" }, { label: "Số", value: "10", note: "+7" }, { label: "Số", value: "17", note: "+9" }, { label: "Tiếp", value: "26", note: "đã kiểm tra" }],
    model: { prompt: "Tìm số tiếp theo: 2, 5, 10, 17, …", steps: ["Tính khoảng cách: 5−2=3; 10−5=5; 17−10=7.", "Các khoảng cách là 3, 5, 7—những số lẻ liên tiếp.", "Khoảng cách tiếp theo là 9, nên lấy 17+9.", "Kiểm tra lại xem quy luật có đúng với mọi bước đã cho hay không."], answer: "Số tiếp theo là 26 vì 17 + 9 = 26." },
    practice: [
      p("Dãy 6, 10, 14, 18, … có số tiếp theo là bao nhiêu?", "number", "22", "Khoảng cách giữa hai số liên tiếp có đổi không?", "Mỗi bước tăng 4 nên số tiếp theo là 22.", undefined, "Khởi động"),
      p("Dãy 1, 3, 6, 10, … có số tiếp theo là bao nhiêu?", "number", "15", "Các khoảng cách lần lượt là 2, 3, 4.", "Khoảng cách tiếp theo là 5; 10 + 5 = 15.", undefined, "Quy luật kép"),
      p("Số nào không thuộc quy luật: 4, 8, 12, 15, 20?", "number", "15", "Bốn số còn lại đều chia hết cho 4.", "15 là số duy nhất không phải bội của 4.", undefined, "Kẻ lạ"),
      p("Một dãy bắt đầu từ 3 và mỗi lần nhân đôi rồi bớt 1. Số thứ tư là bao nhiêu?", "number", "17", "Tính lần lượt, không nhảy bước.", "3 → 5 → 9 → 17, nên số thứ tư là 17.", undefined, "Thử thách"),
    ], reflection: "Con đã dùng bằng chứng nào để biết quy luật của mình đúng, chứ không chỉ là một sự trùng hợp?",
  },
  calculation: {
    domain: "calculation", code: "MR-02", unit: "Xưởng chiến lược", title: "Tính ít hơn, nghĩ nhiều hơn", goal: "Chọn cách biến đổi phù hợp và giải thích vì sao kết quả không đổi.", prerequisite: "Nắm ý nghĩa của cộng, trừ, nhân và tính chất phân phối ở mức trực quan.",
    hook: "Nhà toán học không phải người tính nhiều nhất—mà là người nhìn thấy con đường ngắn nhất.", wonder: "199 + 48 có nhất thiết phải đặt tính không? Con có thể biến 199 thành số nào dễ tính hơn?",
    ideaTitle: "Làm tròn rồi trả lại", idea: "Ta có thể chuyển một lượng từ số này sang số kia, hoặc thêm rồi bớt cùng một lượng. Phép tính dễ hơn nhưng tổng vẫn giữ nguyên.",
    representations: [{ label: "Ban đầu", value: "199", note: "+48" }, { label: "Chuyển", value: "+1", note: "từ 48" }, { label: "Số tròn", value: "200", note: "+47" }, { label: "Kết quả", value: "247", note: "nhanh" }],
    model: { prompt: "Tính nhanh 199 + 48", steps: ["199 chỉ thiếu 1 để thành 200.", "Chuyển 1 đơn vị từ 48 sang 199.", "Tổng mới là 200 + 47; tổng không đổi vì chỉ chuyển chỗ 1 đơn vị.", "Tính 200 + 47."], answer: "199 + 48 = 247." },
    practice: [
      p("Tính nhanh: 298 + 46 = ?", "number", "344", "Thêm 2 vào 298 và bớt 2 ở 46.", "300 + 44 = 344.", undefined, "Bù trừ"),
      p("Tính nhanh: 503 − 198 = ?", "number", "305", "Cùng cộng 2 vào số bị trừ và số trừ.", "505 − 200 = 305.", undefined, "Giữ hiệu"),
      p("Tính nhanh: 25 × 16 = ?", "number", "400", "Tách 16 thành 4 × 4 rồi ghép 25 × 4.", "25 × 4 = 100; 100 × 4 = 400.", undefined, "Nhóm lại"),
      p("Cách nào tính 49 × 6 thuận tiện nhất?", "choice", "50 × 6 − 6", "49 ít hơn 50 đúng 1 đơn vị.", "49 × 6 = (50 − 1) × 6 = 50 × 6 − 6.", ["50 × 6 − 1", "50 × 6 − 6", "40 × 6 + 9", "49 × 3 + 3"], "Chọn chiến lược"),
    ], reflection: "Trong bốn thử thách, lúc nào con dùng bù trừ và lúc nào con dùng tách–ghép?",
  },
  measurement: {
    domain: "measurement", code: "MR-03", unit: "Trạm đo bí mật", title: "Ước lượng trước, đo sau", goal: "Dùng ước lượng để kiểm tra tính hợp lý và lập mô hình từ dữ kiện đo lường.", prerequisite: "Biết các đơn vị độ dài, thời gian và chu vi hình chữ nhật.",
    hook: "Một đáp án đúng phép tính nhưng vô lý ngoài đời vẫn là một đáp án cần xem lại.", wonder: "Một cánh cửa cao 20 cm, 2 m hay 20 m? Không cần thước, con vẫn có thể loại hai đáp án.",
    ideaTitle: "Ước lượng là chiếc máy dò lỗi", idea: "Trước khi tính chính xác, hãy đoán một khoảng hợp lý. Sau khi tính, so sánh kết quả với khoảng đó để phát hiện nhầm đơn vị hoặc sai phép tính.",
    representations: [{ label: "Bút chì", value: "15", note: "cm" }, { label: "Bàn học", value: "1", note: "m" }, { label: "Cửa", value: "2", note: "m" }, { label: "Sân trường", value: "50", note: "m" }],
    model: { prompt: "Hình chữ nhật chu vi 30 cm, dài 9 cm. Tìm chiều rộng.", steps: ["Ước lượng: chiều rộng phải nhỏ hơn nửa chu vi 15 cm.", "Nửa chu vi là 30 : 2 = 15 cm.", "Chiều rộng là 15 − 9 = 6 cm.", "Kiểm tra: (9 + 6) × 2 = 30 cm, hợp lý."], answer: "Chiều rộng là 6 cm." },
    practice: [
      p("Đơn vị hợp lý để đo chiều dài lớp học là gì?", "choice", "m", "Lớp học dài hơn nhiều so với một chiếc thước học sinh.", "Mét là đơn vị phù hợp.", ["mm", "cm", "m", "km"], "Ước lượng"),
      p("2 m 5 dm bằng bao nhiêu xăng-ti-mét?", "number", "250", "1 m = 100 cm và 1 dm = 10 cm.", "200 cm + 50 cm = 250 cm.", undefined, "Đổi đơn vị"),
      p("Hình chữ nhật có chu vi 36 cm, chiều dài 11 cm. Chiều rộng là bao nhiêu?", "number", "7", "Tìm nửa chu vi trước.", "36 : 2 = 18; 18 − 11 = 7 cm.", undefined, "Lập mô hình"),
      p("Đồng hồ chỉ 9:35. Sau 50 phút là mấy giờ?", "choice", "10:25", "Đi đến 10 giờ trước rồi cộng phần còn lại.", "Từ 9:35 đến 10:00 là 25 phút; thêm 25 phút nữa được 10:25.", ["9:85", "10:15", "10:25", "10:35"], "Kiểm tra hợp lý"),
    ], reflection: "Ước lượng đã giúp con loại một đáp án vô lý hoặc phát hiện lỗi ở bước nào?",
  },
  geometry: {
    domain: "geometry", code: "MR-04", unit: "Xưởng kiến trúc", title: "Cùng diện tích, khác chu vi", goal: "Xây nhiều hình từ cùng số ô vuông và phát hiện đại lượng nào thay đổi.", prerequisite: "Biết tính chu vi, diện tích hình vuông và hình chữ nhật.",
    hook: "Cùng 12 viên gạch, con có thể xây nhiều căn phòng—nhưng hàng rào quanh mỗi phòng có dài bằng nhau không?", wonder: "Ba hình chữ nhật 1×12, 2×6 và 3×4 đều có diện tích 12. Hình nào cần ít hàng rào nhất?",
    ideaTitle: "Hình càng gọn, chu vi càng nhỏ", idea: "Diện tích đếm số ô bên trong; chu vi đếm cạnh bao quanh. Khi ghép các ô sát nhau hơn, nhiều cạnh nằm bên trong nên chu vi ngoài giảm.",
    representations: [{ label: "Kích thước", value: "1×12", note: "P = 26" }, { label: "Kích thước", value: "2×6", note: "P = 16" }, { label: "Kích thước", value: "3×4", note: "P = 14" }],
    model: { prompt: "Từ 12 ô vuông, hình chữ nhật nào có chu vi nhỏ nhất?", steps: ["Liệt kê các cặp cạnh có tích 12: 1×12, 2×6, 3×4.", "Tính chu vi từng hình: 26, 16 và 14.", "So sánh ba kết quả.", "Nhận xét: cặp cạnh gần bằng nhau nhất tạo hình gọn nhất."], answer: "Hình 3×4 có chu vi nhỏ nhất: 14 đơn vị." },
    practice: [
      p("Hình chữ nhật 2×5 có diện tích bao nhiêu ô vuông?", "number", "10", "Diện tích bằng chiều dài nhân chiều rộng.", "2 × 5 = 10 ô vuông.", undefined, "Khởi động"),
      p("Hình chữ nhật 2×5 có chu vi bao nhiêu đơn vị?", "number", "14", "Cộng chiều dài và chiều rộng rồi nhân 2.", "(2 + 5) × 2 = 14.", undefined, "Phân biệt"),
      p("Với 16 ô vuông, hình nào có chu vi nhỏ nhất?", "choice", "4×4", "Liệt kê 1×16, 2×8 và 4×4.", "Hình 4×4 gọn nhất nên có chu vi nhỏ nhất.", ["1×16", "2×8", "4×4", "Cả ba bằng nhau"], "Bất biến"),
      p("Ghép 4 ô vuông cạnh 1 thành một hình vuông lớn. Chu vi hình lớn là bao nhiêu?", "number", "8", "Hình lớn có cạnh dài 2 đơn vị.", "Mỗi cạnh dài 2 nên chu vi là 2 × 4 = 8.", undefined, "Không gian"),
    ], reflection: "Điều gì không đổi khi con biến hình 1×12 thành 3×4, và điều gì đã thay đổi?",
  },
  data: {
    domain: "data", code: "MR-05", unit: "Phòng điều tra dữ liệu", title: "Dữ liệu biết gì—và chưa biết gì?", goal: "Đọc dữ liệu chính xác, đếm khả năng có hệ thống và tránh kết luận vượt quá bằng chứng.", prerequisite: "Đọc được bảng, biểu đồ cột đơn giản và thực hiện phép nhân.",
    hook: "Một biểu đồ có thể kể chuyện, nhưng cũng có thể khiến ta đoán quá xa nếu quên hỏi dữ liệu đến từ đâu.", wonder: "Nếu 6 trong 10 bạn được hỏi thích cờ vua, có chắc cả trường thích cờ vua không? Vì sao?",
    ideaTitle: "Tách điều dữ liệu cho biết khỏi điều ta suy đoán", idea: "Hãy đọc đúng số liệu trước, sau đó hỏi: ai được khảo sát, có bao nhiêu người và dữ liệu có đủ đại diện không. Với bài đếm khả năng, dùng bảng hoặc sơ đồ để không bỏ sót.",
    representations: [{ label: "Áo", value: "3", note: "lựa chọn" }, { label: "Quần", value: "2", note: "lựa chọn" }, { label: "Phối đồ", value: "6", note: "khả năng" }],
    model: { prompt: "3 áo và 2 quần tạo được bao nhiêu bộ?", steps: ["Cố định áo thứ nhất: có 2 cách chọn quần.", "Áo thứ hai và thứ ba cũng có 2 cách mỗi áo.", "Cộng 2 + 2 + 2 hoặc nhân 3 × 2.", "Kiểm tra bằng cách liệt kê để chắc không trùng, không sót."], answer: "Có 6 bộ quần áo khác nhau." },
    practice: [
      p("Có 2 loại bánh và 3 loại nước. Chọn 1 bánh, 1 nước có bao nhiêu cách?", "number", "6", "Mỗi loại bánh đi cùng được với cả 3 loại nước.", "2 × 3 = 6 cách.", undefined, "Đếm khả năng"),
      p("Tung một đồng xu một lần có bao nhiêu kết quả có thể xảy ra?", "number", "2", "Đồng xu có hai mặt.", "Hai kết quả có thể là sấp hoặc ngửa.", undefined, "Khả năng"),
      p("Biểu đồ có các giá trị 4, 9, 6, 5. Hiệu giữa lớn nhất và nhỏ nhất là bao nhiêu?", "number", "5", "Lấy 9 trừ 4.", "9 − 4 = 5.", undefined, "Đọc dữ liệu"),
      p("Hỏi 5 bạn và cả 5 đều thích bóng đá. Kết luận nào hợp lý nhất?", "choice", "Năm bạn được hỏi đều thích bóng đá", "Chỉ nói đúng phạm vi dữ liệu đã có.", "Ta chỉ biết chắc về 5 bạn đã được hỏi.", ["Cả trường thích bóng đá", "Năm bạn được hỏi đều thích bóng đá", "Không ai thích môn khác", "Bóng đá là môn hay nhất"], "Bằng chứng"),
    ], reflection: "Một kết luận cần thêm dữ liệu khi nào? Con hãy nêu một ví dụ ngoài đời.",
  },
  word: {
    domain: "word", code: "MR-06", unit: "Văn phòng thám tử", title: "Đi ngược để tìm bí mật", goal: "Nhận ra bài toán có thể giải ngược, trình bày chuỗi suy luận rõ ràng và kiểm tra lại.", prerequisite: "Thực hiện chắc cộng, trừ, nhân, chia và hiểu phép tính ngược.",
    hook: "Khi cánh cửa phía trước bị khóa, nhà thám tử giỏi sẽ lần dấu vết từ kết quả quay về điểm bắt đầu.", wonder: "Một số qua máy ×4 rồi +6 trở thành 38. Con sẽ tháo chiếc máy theo thứ tự nào?",
    ideaTitle: "Tháo các bước theo thứ tự ngược", idea: "Nếu bài toán làm lần lượt nhiều thao tác, hãy bắt đầu từ kết quả, dùng phép tính ngược và tháo thao tác cuối cùng trước.",
    representations: [{ label: "Bí mật", value: "?", note: "×4" }, { label: "Sau bước 1", value: "?", note: "+6" }, { label: "Kết quả", value: "38", note: "đi ngược" }, { label: "Tìm được", value: "8", note: "đã kiểm tra" }],
    model: { prompt: "Một số ×4 rồi +6 bằng 38. Tìm số đó.", steps: ["Bắt đầu từ kết quả 38.", "Tháo thao tác +6 bằng phép trừ: 38 − 6 = 32.", "Tháo thao tác ×4 bằng phép chia: 32 : 4 = 8.", "Kiểm tra xuôi: 8 × 4 + 6 = 38."], answer: "Số bí mật là 8." },
    practice: [
      p("Một số cộng 15 rồi bằng 43. Số đó là bao nhiêu?", "number", "28", "Dùng phép tính ngược của cộng 15.", "43 − 15 = 28.", undefined, "Một bước"),
      p("Một số nhân 5 rồi trừ 8 thì bằng 27. Số đó là bao nhiêu?", "number", "7", "Đi ngược: cộng 8 trước, rồi chia 5.", "27 + 8 = 35; 35 : 5 = 7.", undefined, "Hai bước"),
      p("Có 5 con gồm gà và thỏ, tổng cộng 14 chân. Có bao nhiêu con thỏ?", "number", "2", "Giả sử cả 5 con đều là gà rồi xem còn thiếu bao nhiêu chân.", "Năm gà có 10 chân; thiếu 4 chân. Mỗi thỏ thay gà tăng 2 chân nên có 2 thỏ.", undefined, "Đổi giả thiết"),
      p("Mai đứng trước Lan, Lan đứng trước Nam. Ai đứng giữa?", "choice", "Lan", "Viết thứ tự ba bạn thành một hàng.", "Thứ tự là Mai – Lan – Nam nên Lan đứng giữa.", ["Mai", "Lan", "Nam", "Không xác định"], "Logic thứ tự"),
    ], reflection: "Vì sao khi giải ngược ta phải tháo thao tác cuối cùng trước? Hãy giải thích bằng lời của con.",
  },
};
