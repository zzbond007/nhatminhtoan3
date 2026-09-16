import type { AnswerType } from "./content";

export type SkillLabStrandId =
  | "place-value"
  | "fractions"
  | "operations"
  | "number-theory"
  | "logic"
  | "combinatorics"
  | "visual-spatial"
  | "math-english";

export type SkillLabStrand = {
  id: SkillLabStrandId;
  name: string;
  short: string;
  emoji: string;
  description: string;
  color: string;
  soft: string;
};

export type SkillLabQuestion = {
  id: string;
  strand: SkillLabStrandId;
  prompt: string;
  englishPrompt?: string;
  diagram?: string;
  type: AnswerType;
  answer: string;
  options?: string[];
  hints: [string, string, string];
  explanation: string;
  misconception: string;
};

export type SkillLabRecordLike = {
  attempts: number;
  correct: number;
  streak: number;
  needsReview: boolean;
  lastAttemptAt: string;
};

export type SkillLabMode = "spiral" | "review";

export const SKILL_LAB_STRANDS: SkillLabStrand[] = [
  { id: "place-value", name: "Số và giá trị hàng", short: "Giá trị hàng", emoji: "🔢", description: "Đọc, viết, tách và so sánh số có nhiều chữ số.", color: "#b85f13", soft: "#fff0dd" },
  { id: "fractions", name: "Phân số trực quan", short: "Phân số", emoji: "🍰", description: "Nhìn phần–toàn thể, so sánh và tìm một phần của số.", color: "#b43f73", soft: "#fde8f2" },
  { id: "operations", name: "Biểu thức và thứ tự tính", short: "Biểu thức", emoji: "🧮", description: "Tính đúng thứ tự, dùng ngoặc và phát hiện bước sai.", color: "#4f46b8", soft: "#eeecff" },
  { id: "number-theory", name: "Lý thuyết số nhập môn", short: "Lý thuyết số", emoji: "🧩", description: "Bội, ước, chia hết, số liên tiếp và số dư.", color: "#167c68", soft: "#e4f7f1" },
  { id: "logic", name: "Logic quan hệ và toán tuổi", short: "Logic", emoji: "🕵️", description: "Xâu chuỗi manh mối, tổng–hiệu và quan hệ trước–sau.", color: "#ad4b36", soft: "#fff0eb" },
  { id: "combinatorics", name: "Tổ hợp và bảo đảm", short: "Tổ hợp", emoji: "🌳", description: "Liệt kê không trùng, không sót và hiểu “chắc chắn”.", color: "#3372b4", soft: "#e7f2ff" },
  { id: "visual-spatial", name: "IQ hình và không gian", short: "IQ hình", emoji: "🧊", description: "Quy luật hình, xoay hướng, đối xứng, đếm hình và Sudoku mini.", color: "#6f4bb5", soft: "#f0eaff" },
  { id: "math-english", name: "Toán bằng tiếng Anh", short: "Math English", emoji: "🌍", description: "Làm quen từ khóa sum, difference, product, quotient và fraction.", color: "#217a8c", soft: "#e2f6fa" },
];

const q = (question: SkillLabQuestion) => question;

export const SKILL_LAB_QUESTIONS: SkillLabQuestion[] = [
  q({ id: "pv-01", strand: "place-value", prompt: "Số “năm nghìn hai trăm ba mươi tư” được viết bằng chữ số như thế nào?", type: "choice", answer: "5234", options: ["5234", "5243", "2534", "5324"], hints: ["Tách số thành nghìn, trăm, chục và đơn vị.", "Có 5 nghìn, 2 trăm, 3 chục và 4 đơn vị.", "Ghép lần lượt 5 – 2 – 3 – 4."], explanation: "5 nghìn + 2 trăm + 3 chục + 4 đơn vị tạo số 5234.", misconception: "Con có thể đã đổi chỗ hàng chục và hàng đơn vị. Hãy đọc từng hàng từ trái sang phải." }),
  q({ id: "pv-02", strand: "place-value", prompt: "Cách đọc nào đúng với số 3705?", type: "choice", answer: "Ba nghìn bảy trăm linh năm", options: ["Ba nghìn bảy trăm linh năm", "Ba nghìn bảy trăm năm mươi", "Bảy nghìn ba trăm linh năm", "Ba nghìn không trăm bảy mươi lăm"], hints: ["Nhìn lần lượt hàng nghìn, trăm, chục, đơn vị.", "Hàng chục bằng 0 nên cần đọc “linh”.", "3705 có 3 nghìn, 7 trăm, 0 chục, 5 đơn vị."], explanation: "3705 đọc là “ba nghìn bảy trăm linh năm”.", misconception: "Chữ số 0 ở hàng chục không được biến thành 5 chục; nó được thể hiện bằng từ “linh”." }),
  q({ id: "pv-03", strand: "place-value", prompt: "Điền số còn thiếu: 4658 = 4000 + 600 + □ + 8.", type: "number", answer: "50", hints: ["Xác định chữ số ở hàng chục.", "Chữ số hàng chục là 5.", "5 chục có giá trị là 50."], explanation: "4658 gồm 4 nghìn, 6 trăm, 5 chục và 8 đơn vị; ô trống là 50.", misconception: "Con có thể đã viết chữ số 5 thay vì giá trị hàng là 50." }),
  q({ id: "pv-04", strand: "place-value", prompt: "Điền dấu đúng: 8090 □ 8009.", type: "choice", answer: ">", options: [">", "<", "=", "Không xác định"], hints: ["So từ hàng lớn nhất sang hàng nhỏ nhất.", "Hàng nghìn và hàng trăm bằng nhau; hãy so hàng chục.", "8090 có 9 chục còn 8009 có 0 chục."], explanation: "Ở hàng chục, 9 lớn hơn 0 nên 8090 > 8009.", misconception: "Đừng chỉ nhìn chữ số 9 ở cuối; vị trí của chữ số quyết định giá trị." }),
  q({ id: "pv-05", strand: "place-value", prompt: "Trong số 47 326, chữ số 7 có giá trị bao nhiêu?", type: "number", answer: "7000", hints: ["Đếm vị trí từ phải sang trái.", "7 nằm ở hàng nghìn.", "7 nghìn = 7000."], explanation: "Chữ số 7 ở hàng nghìn nên có giá trị 7000.", misconception: "Câu hỏi cần giá trị của chữ số, không phải chỉ trả lời chữ số 7." }),
  q({ id: "pv-06", strand: "place-value", prompt: "Dùng các chữ số 0, 4, 7, 9 đúng một lần. Số lớn nhất có bốn chữ số là số nào?", type: "number", answer: "9740", hints: ["Đặt chữ số lớn nhất vào hàng lớn nhất.", "Sắp các chữ số theo thứ tự giảm dần.", "Thứ tự là 9, 7, 4, 0."], explanation: "Sắp giảm dần được 9740; chữ số 0 ở cuối nên số vẫn có bốn chữ số.", misconception: "Muốn số lớn nhất, cần ưu tiên hàng nghìn trước rồi mới đến các hàng sau." }),

  q({ id: "fr-01", strand: "fractions", prompt: "Hình được chia thành 5 phần bằng nhau và tô 3 phần. Phân số chỉ phần tô màu là gì?", diagram: "■ ■ ■ □ □", type: "choice", answer: "3/5", options: ["3/5", "2/5", "3/2", "5/3"], hints: ["Mẫu số là tổng số phần bằng nhau.", "Tử số là số phần được tô.", "Có 3 phần tô trên tổng 5 phần."], explanation: "Phần tô màu chiếm 3 trong 5 phần bằng nhau nên là 3/5.", misconception: "Con có thể đã đổi vị trí tử số và mẫu số. Tử số đếm phần được chọn; mẫu số đếm toàn bộ phần bằng nhau." }),
  q({ id: "fr-02", strand: "fractions", prompt: "Phân số nào bé hơn: 2/7 hay 5/7?", type: "choice", answer: "2/7", options: ["2/7", "5/7", "Bằng nhau", "Không so sánh được"], hints: ["Hai phân số có cùng mẫu số.", "Khi các phần bằng nhau, số phần ít hơn tạo phân số bé hơn.", "So hai tử số 2 và 5."], explanation: "Cùng mẫu 7 nên 2/7 < 5/7.", misconception: "Khi mẫu số bằng nhau, chỉ cần so tử số; không cộng hoặc trừ hai số trong phân số." }),
  q({ id: "fr-03", strand: "fractions", prompt: "Một phần ba của 18 là bao nhiêu?", type: "number", answer: "6", hints: ["“Một phần ba” nghĩa là chia thành 3 phần bằng nhau.", "Tính 18 : 3.", "18 : 3 = 6."], explanation: "Chia 18 thành 3 phần bằng nhau, mỗi phần có 6.", misconception: "Tìm một phần ba dùng phép chia cho 3, không phải trừ 3." }),
  q({ id: "fr-04", strand: "fractions", prompt: "Nếu 1/4 của một số bằng 5 thì số đó là bao nhiêu?", type: "number", answer: "20", hints: ["Toàn bộ có 4 phần bằng nhau.", "Mỗi phần bằng 5.", "Tính 5 × 4."], explanation: "Bốn phần, mỗi phần 5, tạo toàn bộ là 20.", misconception: "Đây là tìm toàn bộ từ một phần, nên cần nhân 4 thay vì chia 4." }),
  q({ id: "fr-05", strand: "fractions", prompt: "Phân số nào bằng 1/2?", type: "choice", answer: "3/6", options: ["2/3", "3/6", "4/6", "2/5"], hints: ["Tìm phân số có tử số bằng một nửa mẫu số.", "Một nửa của 6 là 3.", "3 phần trong 6 phần bằng nhau bằng một nửa."], explanation: "3/6 rút gọn bằng 1/2.", misconception: "Hai phân số bằng nhau khi biểu diễn cùng một phần của toàn thể, không cần có cùng tử và mẫu." }),
  q({ id: "fr-06", strand: "fractions", prompt: "Trong ba phân số 1/2, 1/4 và 1/8, phân số nào lớn nhất?", type: "choice", answer: "1/2", options: ["1/2", "1/4", "1/8", "Ba phân số bằng nhau"], hints: ["Các phân số đều có tử số 1.", "Chia một chiếc bánh thành càng nhiều phần thì mỗi phần càng nhỏ.", "Một nửa lớn hơn một phần tư và một phần tám."], explanation: "Với phân số đơn vị, mẫu số nhỏ hơn tạo phần lớn hơn; 1/2 là lớn nhất.", misconception: "Mẫu số 8 lớn hơn nhưng mỗi phần khi chia 8 lại nhỏ hơn mỗi phần khi chia 2." }),

  q({ id: "op-01", strand: "operations", prompt: "Tính 36 : 6 × 2.", type: "number", answer: "12", hints: ["Phép nhân và chia có cùng mức ưu tiên.", "Khi cùng mức, thực hiện từ trái sang phải.", "36 : 6 = 6; 6 × 2 = 12."], explanation: "Chia rồi nhân từ trái sang phải: 36 : 6 × 2 = 12.", misconception: "Không được tự ý nhân 6 × 2 trước vì phép chia xuất hiện trước ở cùng mức ưu tiên." }),
  q({ id: "op-02", strand: "operations", prompt: "Tính 8 + 3 × 4.", type: "number", answer: "20", hints: ["Phép nhân được làm trước phép cộng.", "Tính 3 × 4 trước.", "8 + 12 = 20."], explanation: "Nhân trước: 3 × 4 = 12; sau đó 8 + 12 = 20.", misconception: "Nếu cộng 8 + 3 trước, con đã bỏ qua thứ tự thực hiện phép tính." }),
  q({ id: "op-03", strand: "operations", prompt: "Tính (8 + 3) × 4.", type: "number", answer: "44", hints: ["Biểu thức trong ngoặc được làm trước.", "8 + 3 = 11.", "11 × 4 = 44."], explanation: "Ngoặc thay đổi thứ tự: (8 + 3) × 4 = 11 × 4 = 44.", misconception: "Cặp ngoặc yêu cầu thực hiện phép cộng trước phép nhân." }),
  q({ id: "op-04", strand: "operations", prompt: "Điền số: 7 × □ + 2 = 51.", type: "number", answer: "7", hints: ["Đi ngược từ 51 bằng cách tháo +2 trước.", "51 − 2 = 49.", "49 : 7 = 7."], explanation: "Ô trống bằng 7 vì 7 × 7 + 2 = 51.", misconception: "Khi đi ngược, phải tháo thao tác cuối trước: trừ 2 rồi mới chia 7." }),
  q({ id: "op-05", strand: "operations", prompt: "Có 4 hộp, mỗi hộp 6 chiếc bút, rồi tặng thêm 3 chiếc. Biểu thức nào mô tả đúng?", type: "choice", answer: "4 × 6 + 3", options: ["4 × 6 + 3", "4 × (6 + 3)", "4 + 6 × 3", "4 + 6 + 3"], hints: ["Tính số bút trong 4 hộp trước.", "Mỗi hộp có 6 nên phần hộp là 4 × 6.", "Ba chiếc tặng thêm chỉ được cộng một lần."], explanation: "Số bút là 4 × 6 + 3 = 27.", misconception: "Nếu đặt 6 + 3 trong ngoặc rồi nhân 4, con đã tặng thêm 3 chiếc cho từng hộp." }),
  q({ id: "op-06", strand: "operations", prompt: "Bạn Nam tính 24 − 8 : 2 = 8. Bước nào đúng để sửa?", type: "choice", answer: "Tính 8 : 2 trước", options: ["Tính 8 : 2 trước", "Tính 24 − 8 trước", "Đổi : thành ×", "Thêm ngoặc tùy ý"], hints: ["So mức ưu tiên của phép trừ và phép chia.", "Phép chia được thực hiện trước.", "24 − (8 : 2) = 24 − 4."], explanation: "Cần tính 8 : 2 trước; kết quả đúng là 20.", misconception: "Kết quả 8 xuất hiện khi làm phép trừ trước, trái với thứ tự phép tính." }),

  q({ id: "nt-01", strand: "number-theory", prompt: "Số nào là bội của 6?", type: "choice", answer: "42", options: ["32", "35", "42", "45"], hints: ["Bội của 6 có thể viết thành 6 nhân một số tự nhiên.", "Nhẩm bảng nhân 6.", "6 × 7 = 42."], explanation: "42 là bội của 6 vì 42 = 6 × 7.", misconception: "Số chẵn chưa chắc là bội của 6; nó còn phải chia hết cho 3." }),
  q({ id: "nt-02", strand: "number-theory", prompt: "Số nào là ước của 24?", type: "choice", answer: "8", options: ["5", "7", "8", "10"], hints: ["Ước là số chia 24 không dư.", "Thử ghép các cặp thừa số của 24.", "3 × 8 = 24."], explanation: "8 là ước của 24 vì 24 : 8 = 3.", misconception: "Đừng nhầm ước với số nhỏ hơn; số nhỏ hơn 24 vẫn có thể không chia hết 24." }),
  q({ id: "nt-03", strand: "number-theory", prompt: "Số nào chia hết cho cả 2 và 5?", type: "choice", answer: "130", options: ["125", "128", "130", "135"], hints: ["Số chia hết cho 2 phải chẵn.", "Số chia hết cho 5 tận cùng bằng 0 hoặc 5.", "Muốn thỏa cả hai, chữ số tận cùng phải là 0."], explanation: "130 tận cùng bằng 0 nên chia hết cho cả 2 và 5.", misconception: "Tận cùng bằng 5 chỉ bảo đảm chia hết cho 5, nhưng số đó không chẵn." }),
  q({ id: "nt-04", strand: "number-theory", prompt: "Ba số chẵn liên tiếp có tổng bằng 42. Số ở giữa là bao nhiêu?", type: "number", answer: "14", hints: ["Ba số liên tiếp đối xứng quanh số giữa.", "Tổng của ba số bằng 3 lần số giữa.", "42 : 3 = 14."], explanation: "Ba số là 12, 14, 16; số giữa là 14.", misconception: "“Chẵn liên tiếp” nghĩa là mỗi số cách nhau 2, không phải cách nhau 1." }),
  q({ id: "nt-05", strand: "number-theory", prompt: "Chia 38 viên bi đều vào các túi, mỗi túi 6 viên. Còn dư mấy viên?", type: "number", answer: "2", hints: ["Tìm bội lớn nhất của 6 không vượt 38.", "6 × 6 = 36.", "38 − 36 = 2."], explanation: "Được 6 túi đầy và còn dư 2 viên.", misconception: "Câu hỏi hỏi số dư, không hỏi số túi đầy." }),
  q({ id: "nt-06", strand: "number-theory", prompt: "Quy ước a ⊙ b = 2 × a + b. Tính 5 ⊙ 3.", type: "number", answer: "13", hints: ["Thay a bằng 5 và b bằng 3.", "Tính 2 × 5 trước.", "10 + 3 = 13."], explanation: "Theo quy ước mới, 5 ⊙ 3 = 2 × 5 + 3 = 13.", misconception: "Ký hiệu ⊙ có quy tắc riêng trong đề; không được coi nó là phép nhân thông thường." }),

  q({ id: "lg-01", strand: "logic", prompt: "An cao hơn Bình. Bình cao hơn Cường. Ai cao nhất?", type: "choice", answer: "An", options: ["An", "Bình", "Cường", "Chưa xác định"], hints: ["Viết quan hệ theo một hàng từ cao đến thấp.", "An > Bình và Bình > Cường.", "Suy ra An > Bình > Cường."], explanation: "An cao nhất vì An cao hơn Bình, còn Bình lại cao hơn Cường.", misconception: "Cần nối hai manh mối thành một chuỗi thay vì đọc riêng từng câu." }),
  q({ id: "lg-02", strand: "logic", prompt: "Lan, Hoa, Mai nuôi ba con vật khác nhau: chó, mèo, chim. Hoa không nuôi chó và không nuôi chim. Hoa nuôi con gì?", type: "choice", answer: "Mèo", options: ["Chó", "Mèo", "Chim", "Chưa xác định"], hints: ["Gạch bỏ những khả năng bị loại.", "Hoa không nuôi chó và cũng không nuôi chim.", "Chỉ còn mèo."], explanation: "Sau khi loại chó và chim, Hoa phải nuôi mèo.", misconception: "Khi một người chỉ còn đúng một khả năng, ta có thể kết luận mà chưa cần biết hai người còn lại." }),
  q({ id: "lg-03", strand: "logic", prompt: "Hai số có tổng 20 và hiệu 6. Số lớn là bao nhiêu?", type: "number", answer: "13", hints: ["Nếu chia đôi tổng, hai số tạm bằng nhau.", "Một nửa tổng là 10; một nửa hiệu là 3.", "Số lớn = 10 + 3."], explanation: "Số lớn là (20 + 6) : 2 = 13; số bé là 7.", misconception: "Hiệu 6 được chia đều thành hai phần lệch 3 quanh trung điểm 10." }),
  q({ id: "lg-04", strand: "logic", prompt: "Ba năm nữa Minh 12 tuổi. Hiện nay Minh bao nhiêu tuổi?", type: "number", answer: "9", hints: ["Đi ngược từ tuổi trong tương lai.", "“Ba năm nữa” nghĩa là tuổi hiện tại được cộng 3.", "12 − 3 = 9."], explanation: "Hiện Minh 9 tuổi vì 9 + 3 = 12.", misconception: "Tìm tuổi hiện tại từ tương lai cần trừ số năm, không cộng thêm." }),
  q({ id: "lg-05", strand: "logic", prompt: "Có ba hộp A, B, C. Chỉ một hộp có quà. Biết quà không ở A và cũng không ở C. Quà ở đâu?", type: "choice", answer: "Hộp B", options: ["Hộp A", "Hộp B", "Hộp C", "Không thể biết"], hints: ["Liệt kê ba khả năng.", "Loại A theo manh mối thứ nhất và C theo manh mối thứ hai.", "Chỉ còn B."], explanation: "Quà ở hộp B vì hai vị trí còn lại đều bị loại.", misconception: "Hai manh mối phủ định có thể đủ để xác định phương án duy nhất còn lại." }),
  q({ id: "lg-06", strand: "logic", prompt: "Cần tìm một số lớn hơn 20 và nhỏ hơn 24. Hai manh mối này đã xác định duy nhất số đó chưa?", type: "choice", answer: "Chưa", options: ["Đã xác định", "Chưa", "Chỉ khi số đó lẻ"], hints: ["Liệt kê các số tự nhiên nằm giữa 20 và 24.", "Có 21, 22 và 23.", "Nhiều hơn một số cùng thỏa."], explanation: "Hai manh mối chưa đủ vì có ba số 21, 22, 23 cùng phù hợp.", misconception: "Một bộ manh mối chỉ đủ khi còn đúng một phương án." }),

  q({ id: "cb-01", strand: "combinatorics", prompt: "Có 3 áo và 2 quần. Chọn 1 áo và 1 quần có bao nhiêu cách?", type: "number", answer: "6", hints: ["Cố định một chiếc áo.", "Mỗi áo ghép được với cả 2 quần.", "3 × 2 = 6."], explanation: "Có 3 lựa chọn áo, mỗi lựa chọn đi với 2 quần nên có 6 cách.", misconception: "Khi chọn một món từ mỗi nhóm, thường dùng phép nhân số lựa chọn chứ không cộng." }),
  q({ id: "cb-02", strand: "combinatorics", prompt: "Dùng 2, 5, 8 đúng một lần để lập số có ba chữ số. Có bao nhiêu số khác nhau?", type: "number", answer: "6", hints: ["Cố định chữ số hàng trăm trước.", "Mỗi lựa chọn hàng trăm có 2 cách xếp hai chữ số còn lại.", "3 × 2 = 6."], explanation: "Ba chữ số khác nhau tạo 3 × 2 × 1 = 6 số.", misconception: "Liệt kê theo một vị trí cố định giúp tránh đếm trùng hoặc bỏ sót." }),
  q({ id: "cb-03", strand: "combinatorics", prompt: "Một bữa ăn chọn 1 trong 2 món chính, 1 trong 3 món phụ và 1 trong 2 đồ uống. Có bao nhiêu suất khác nhau?", type: "number", answer: "12", hints: ["Tưởng tượng cây lựa chọn có ba tầng.", "Mỗi món chính ghép với 3 món phụ và 2 đồ uống.", "2 × 3 × 2 = 12."], explanation: "Quy tắc nhân cho 12 suất khác nhau.", misconception: "Ba nhóm lựa chọn độc lập phải được nhân với nhau, không cộng 2 + 3 + 2." }),
  q({ id: "cb-04", strand: "combinatorics", prompt: "Từ điểm A đến B cần đi 2 bước sang phải và 1 bước lên. Có bao nhiêu thứ tự đi khác nhau?", diagram: "→  →  ↑", type: "number", answer: "3", hints: ["Chỉ cần chọn vị trí của bước đi lên.", "Bước lên có thể đứng đầu, giữa hoặc cuối.", "Các thứ tự là ↑→→, →↑→, →→↑."], explanation: "Có 3 thứ tự đi khác nhau.", misconception: "Hai bước sang phải giống nhau nên đổi chỗ cho nhau không tạo đường mới." }),
  q({ id: "cb-05", strand: "combinatorics", prompt: "Một túi có tất màu đỏ, xanh và vàng. Phải lấy ít nhất bao nhiêu chiếc để chắc chắn có hai chiếc cùng màu?", type: "number", answer: "4", hints: ["Xét trường hợp xấu nhất: mỗi lần lấy một màu khác nhau.", "Ba lần đầu có thể được đủ ba màu.", "Chiếc thứ tư buộc phải trùng một trong ba màu."], explanation: "Lấy 4 chiếc thì chắc chắn có hai chiếc cùng màu.", misconception: "“Chắc chắn” yêu cầu xét trường hợp xấu nhất, không dựa vào điều thường xảy ra." }),
  q({ id: "cb-06", strand: "combinatorics", prompt: "Có 4 bạn bắt tay nhau, mỗi cặp chỉ bắt tay một lần. Có tất cả bao nhiêu cái bắt tay?", type: "number", answer: "6", hints: ["Cho bạn thứ nhất bắt tay với ba bạn còn lại.", "Bạn thứ hai chỉ còn hai cái bắt tay mới; bạn thứ ba còn một.", "3 + 2 + 1 = 6."], explanation: "Có 6 cặp bạn khác nhau nên có 6 cái bắt tay.", misconception: "Nếu tính 4 × 3, mỗi cái bắt tay sẽ bị đếm hai lần theo hai người." }),

  q({ id: "vs-01", strand: "visual-spatial", prompt: "Hình nào tiếp theo trong dãy?", diagram: "▲  ●  ▲  ●  ▲  ?", type: "choice", answer: "●", options: ["▲", "●", "■", "◆"], hints: ["Nhìn xem có bao nhiêu hình lặp lại.", "Dãy luân phiên tam giác rồi hình tròn.", "Sau tam giác là hình tròn."], explanation: "Mẫu ▲ ● lặp lại nên hình tiếp theo là ●.", misconception: "Hãy tìm đơn vị lặp nhỏ nhất thay vì chỉ nhìn hai hình cuối." }),
  q({ id: "vs-02", strand: "visual-spatial", prompt: "Mỗi mũi tên quay một phần tư vòng theo chiều kim đồng hồ. Mũi tên tiếp theo là gì?", diagram: "↑  →  ↓  ?", type: "choice", answer: "←", options: ["↑", "→", "↓", "←"], hints: ["Theo dõi hướng sau mỗi lần quay.", "Từ ↑ sang → rồi sang ↓.", "Quay thêm một phần tư vòng từ ↓ được ←."], explanation: "Chuỗi quay 90° theo chiều kim đồng hồ nên đáp án là ←.", misconception: "Đây là quy luật xoay, không phải luân phiên hai hướng." }),
  q({ id: "vs-03", strand: "visual-spatial", prompt: "Một lưới 2 × 2 có tất cả bao nhiêu hình vuông?", diagram: "┌─┬─┐\n├─┼─┤\n└─┴─┘", type: "number", answer: "5", hints: ["Đếm theo kích thước để không bỏ sót.", "Có 4 hình vuông 1 × 1.", "Còn 1 hình vuông lớn 2 × 2."], explanation: "Có 4 hình vuông nhỏ và 1 hình vuông lớn, tổng cộng 5.", misconception: "Đừng chỉ đếm các ô nhỏ; hình lớn cũng được tạo từ nhiều ô." }),
  q({ id: "vs-04", strand: "visual-spatial", prompt: "Nếu soi hình ◀ qua gương thẳng đứng, hình ảnh nhận được là gì?", diagram: "◀  │ gương │  ?", type: "choice", answer: "▶", options: ["◀", "▶", "▲", "▼"], hints: ["Gương trái–phải đổi chỗ.", "Mũi nhọn đang hướng sang trái.", "Sau phản chiếu, mũi nhọn hướng sang phải."], explanation: "Đối xứng qua trục dọc biến ◀ thành ▶.", misconception: "Gương thẳng đứng đổi trái–phải nhưng không đổi trên–dưới." }),
  q({ id: "vs-05", strand: "visual-spatial", prompt: "Bình quay mặt về hướng Bắc, quay phải hai lần rồi quay trái một lần. Cuối cùng Bình nhìn hướng nào?", type: "choice", answer: "Đông", options: ["Bắc", "Nam", "Đông", "Tây"], hints: ["Thực hiện từng lần quay theo thứ tự.", "Bắc → phải là Đông → phải là Nam.", "Từ Nam quay trái là Đông."], explanation: "Sau chuỗi quay, Bình nhìn về hướng Đông.", misconception: "Không cộng trừ các lần quay một cách vội vàng; hãy cập nhật hướng sau từng bước." }),
  q({ id: "vs-06", strand: "visual-spatial", prompt: "Điền số còn thiếu trong Sudoku mini. Mỗi hàng và mỗi cột dùng đủ 1, 2, 3, 4 không lặp.", diagram: "1  2 │ 3  4\n3  4 │ 1  2\n─────┼─────\n2  1 │ 4  3\n4  3 │ 2  ?", type: "number", answer: "1", hints: ["Nhìn hàng cuối trước.", "Hàng cuối đã có 4, 3 và 2.", "Số còn thiếu trong bộ 1, 2, 3, 4 là 1."], explanation: "Ô trống là 1; hàng cuối và cột cuối đều đủ 1–4 không lặp.", misconception: "Sau khi tìm theo hàng, hãy kiểm tra lại theo cột để chắc chắn." }),

  q({ id: "en-01", strand: "math-english", prompt: "Đọc câu tiếng Anh rồi trả lời.", englishPrompt: "What is the sum of 28 and 17?", type: "number", answer: "45", hints: ["“Sum” nghĩa là tổng.", "Cần thực hiện phép cộng 28 + 17.", "28 + 10 + 7 = 45."], explanation: "The sum is 45. “Sum” là kết quả của phép cộng.", misconception: "Từ khóa “sum” yêu cầu cộng, không phải trừ." }),
  q({ id: "en-02", strand: "math-english", prompt: "Chọn biểu thức có hiệu bằng 24.", englishPrompt: "Which expression has a difference of 24?", type: "choice", answer: "53 − 29", options: ["53 − 29", "46 − 20", "18 + 6", "6 × 4"], hints: ["“Difference” là hiệu của phép trừ.", "Tính riêng các phép trừ trước.", "53 − 29 = 24."], explanation: "53 − 29 has a difference of 24. “Difference” nghĩa là hiệu.", misconception: "Dù 18 + 6 và 6 × 4 cũng bằng 24, câu hỏi dùng từ “difference” nên cần một phép trừ." }),
  q({ id: "en-03", strand: "math-english", prompt: "Đọc câu tiếng Anh rồi trả lời.", englishPrompt: "What is the product of 6 and 7?", type: "number", answer: "42", hints: ["“Product” nghĩa là tích.", "Cần tính 6 × 7.", "6 × 7 = 42."], explanation: "The product is 42. “Product” là kết quả của phép nhân.", misconception: "Từ “product” chỉ phép nhân, không phải phép cộng 6 + 7." }),
  q({ id: "en-04", strand: "math-english", prompt: "Đọc câu tiếng Anh rồi trả lời.", englishPrompt: "What is the quotient when 56 is divided by 8?", type: "number", answer: "7", hints: ["“Quotient” nghĩa là thương.", "“56 is divided by 8” nghĩa là 56 : 8.", "56 : 8 = 7."], explanation: "The quotient is 7. “Quotient” là kết quả của phép chia.", misconception: "Hãy xác định đúng số bị chia và số chia: 56 được chia cho 8." }),
  q({ id: "en-05", strand: "math-english", prompt: "Giải bài toán tiếng Anh.", englishPrompt: "Linh has 3 bags. Each bag has 5 marbles. How many marbles are there altogether?", type: "number", answer: "15", hints: ["“Each” nghĩa là mỗi; “altogether” nghĩa là tất cả.", "Có 3 nhóm, mỗi nhóm 5 viên bi.", "3 × 5 = 15."], explanation: "There are 15 marbles altogether. Bài toán dùng phép nhân 3 × 5.", misconception: "Ba túi là ba nhóm bằng nhau, nên cần nhân thay vì cộng 3 + 5." }),
  q({ id: "en-06", strand: "math-english", prompt: "Chọn phân số được đọc là “one half”.", englishPrompt: "Which fraction is one half?", type: "choice", answer: "1/2", options: ["1/2", "1/3", "2/1", "2/3"], hints: ["“One” là một và “half” là một phần hai.", "Tử số là 1, mẫu số là 2.", "Chọn 1/2."], explanation: "One half is 1/2. “Half” nghĩa là một nửa.", misconception: "Cụm “one half” không phải 2/1; tiếng Anh gọi tử số trước rồi đến tên mẫu số." }),
];

export const SKILL_LAB_QUESTION_COUNT = SKILL_LAB_QUESTIONS.length;

function rotated<T>(items: T[], offset: number) {
  if (!items.length) return items;
  const start = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

function priority(question: SkillLabQuestion, records: Record<string, SkillLabRecordLike>) {
  const record = records[question.id];
  if (record?.needsReview) return 0;
  if (!record) return 1;
  return 2 + Math.min(3, record.streak);
}

export function buildSkillLabSession(
  records: Record<string, SkillLabRecordLike>,
  dayIndex: number,
  mode: SkillLabMode = "spiral",
  count = 10,
) {
  const dayOrder = rotated(SKILL_LAB_QUESTIONS, dayIndex * 7);
  const ranked = [...dayOrder].sort((left, right) => {
    const difference = priority(left, records) - priority(right, records);
    if (difference) return difference;
    return dayOrder.indexOf(left) - dayOrder.indexOf(right);
  });

  if (mode === "review") {
    const review = ranked.filter((question) => records[question.id]?.needsReview);
    if (review.length) return review.slice(0, Math.max(1, count));
  }

  const chosen: SkillLabQuestion[] = [];
  const strandOrder = rotated(SKILL_LAB_STRANDS, dayIndex);
  strandOrder.forEach((strand) => {
    const candidate = ranked.find((question) => question.strand === strand.id && !chosen.includes(question));
    if (candidate && chosen.length < count) chosen.push(candidate);
  });
  ranked.forEach((question) => {
    if (chosen.length < count && !chosen.includes(question)) chosen.push(question);
  });
  return chosen;
}

export function validateSkillLabQuestions() {
  const errors: string[] = [];
  const ids = new Set<string>();
  const strandIds = new Set(SKILL_LAB_STRANDS.map((strand) => strand.id));
  SKILL_LAB_QUESTIONS.forEach((question) => {
    if (ids.has(question.id)) errors.push(`${question.id}: mã câu hỏi bị trùng.`);
    ids.add(question.id);
    if (!strandIds.has(question.strand)) errors.push(`${question.id}: nhóm kỹ năng không hợp lệ.`);
    if (!question.prompt.trim() || !question.answer.trim()) errors.push(`${question.id}: thiếu đề hoặc đáp án.`);
    if (question.hints.length !== 3 || question.hints.some((hint) => !hint.trim())) errors.push(`${question.id}: cần đủ 3 tầng gợi ý.`);
    if (!question.explanation.trim() || !question.misconception.trim()) errors.push(`${question.id}: thiếu lời giải hoặc phản hồi sai lầm.`);
    if (question.type === "number" && !/^-?\d+$/.test(question.answer)) errors.push(`${question.id}: đáp án số phải là số nguyên.`);
    if (question.type === "choice" && (!question.options?.includes(question.answer) || new Set(question.options).size < 2)) errors.push(`${question.id}: lựa chọn hoặc đáp án không hợp lệ.`);
  });
  SKILL_LAB_STRANDS.forEach((strand) => {
    const count = SKILL_LAB_QUESTIONS.filter((question) => question.strand === strand.id).length;
    if (count < 6) errors.push(`${strand.id}: cần ít nhất 6 câu.`);
  });
  return errors;
}
