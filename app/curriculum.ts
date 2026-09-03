import { DOMAINS, type DomainId, type PracticeQuestion } from "./content";
import { MISSION_LIBRARY, type DailyPuzzle, type Mission, type MissionLevel } from "./missions";

export const CURRICULUM_VERSION = 7;

export type HintLadder = [string, string, string];
export type DeepQuestion = PracticeQuestion & {
  id: string;
  hints: HintLadder;
  misconception: string;
};

export type DeepMission = Mission & {
  sequence: 1 | 2 | 3 | 4 | 5 | 6;
  durationMinutes: number;
  materials: string[];
  successCriteria: [string, string, string];
  realWorldConnection: string;
  prediction: {
    prompt: string;
    options: string[];
    answer?: string;
    reveal: string;
  };
  lab: {
    type: "choice" | "tile-rectangles";
    prompt: string;
    options: { value: string; label: string; note: string }[];
    answer: string;
    explanation: string;
  };
  strategies: [
    { name: string; when: string; steps: string[] },
    { name: string; when: string; steps: string[] },
  ];
  deepPractice: DeepQuestion[];
  transfer: DeepQuestion;
  reflectionStems: [string, string, string];
};

type ExtensionSpec = {
  title: string;
  goal: string;
  wonder: string;
  idea: string;
  practice: PracticeQuestion[];
};

const q = (
  prompt: string,
  type: PracticeQuestion["type"],
  answer: string,
  hint: string,
  explanation: string,
  options?: string[],
  challengeTag?: string,
): PracticeQuestion => ({ prompt, type, answer, hint, explanation, options, challengeTag });

const extensions: Record<DomainId, ExtensionSpec[]> = {
  number: [
    {
      title: "Săn quy luật bị nhiễu",
      goal: "Phân biệt quy luật thật với một mẫu chỉ tình cờ đúng ở vài bước.",
      wonder: "Nếu hai quy luật đều khớp ba số đầu, ta cần thêm bằng chứng nào để chọn?",
      idea: "Một quy luật tốt phải giải thích mọi bước đã cho và dự đoán được bước mới. Hãy kiểm tra bằng sai khác hoặc bằng thao tác lặp.",
      practice: [
        q("Dãy 3, 7, 11, 15, … có số tiếp theo là bao nhiêu?", "number", "19", "Tính các khoảng cách liên tiếp.", "Mỗi bước tăng 4 nên số tiếp theo là 19.", undefined, "Kiểm chứng"),
        q("Số nào làm hỏng quy luật 5, 10, 15, 21, 25?", "number", "21", "Bốn số còn lại đều là bội của 5.", "21 không chia hết cho 5.", undefined, "Phát hiện nhiễu"),
        q("Dãy 2, 6, 18, 54, … có số tiếp theo là bao nhiêu?", "number", "162", "Mỗi số được tạo từ số trước như thế nào?", "Mỗi bước nhân 3; 54 × 3 = 162.", undefined, "Quy luật nhân"),
        q("Một dãy tăng lần lượt 2, 4, 6, 8. Bắt đầu từ 1, số thứ năm là bao nhiêu?", "number", "21", "Cộng lần lượt, không nhảy bước.", "1 → 3 → 7 → 13 → 21.", undefined, "Chuyển giao"),
      ],
    },
    {
      title: "Số học của lịch và đồng hồ",
      goal: "Dùng chu kỳ và số dư để dự đoán ngày, giờ mà không liệt kê dài.",
      wonder: "Hôm nay là thứ Ba, sau 16 ngày là thứ mấy?",
      idea: "Một tuần lặp lại sau 7 ngày. Tách số ngày thành các tuần trọn vẹn và phần dư.",
      practice: [
        q("Hôm nay là thứ Hai. Sau 10 ngày là thứ mấy?", "choice", "Thứ Năm", "Bảy ngày không làm đổi thứ.", "10 ngày = 7 + 3; tiến ba ngày từ thứ Hai là thứ Năm.", ["Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu"], "Chu kỳ"),
        q("Đồng hồ chỉ 9 giờ. Sau 15 giờ là mấy giờ?", "choice", "12 giờ", "Sau 12 giờ kim giờ trở lại vị trí cũ.", "15 = 12 + 3 nên đồng hồ chỉ 12 giờ.", ["10 giờ", "11 giờ", "12 giờ", "3 giờ"], "Chu kỳ 12"),
        q("Một hoạt động lặp lại mỗi 4 ngày. Ngày đầu là ngày 2. Lần thứ tư là ngày nào?", "number", "14", "Giữa bốn lần có ba khoảng.", "2 + 3 × 4 = 14.", undefined, "Khoảng và mốc"),
        q("Ngày 1 là thứ Bảy. Ngày 22 là thứ mấy?", "choice", "Thứ Bảy", "Từ ngày 1 đến ngày 22 có 21 ngày.", "21 chia hết cho 7 nên vẫn là thứ Bảy.", ["Thứ Sáu", "Thứ Bảy", "Chủ nhật", "Thứ Hai"], "Chuyển giao"),
      ],
    },
    {
      title: "Tự thiết kế một quy luật",
      goal: "Tạo dãy thỏa điều kiện và giải thích để người khác có thể tiếp tục.",
      wonder: "Có thể tạo hai dãy khác nhau cùng bắt đầu 2, 5, 8 không?",
      idea: "Một mô tả quy luật phải đủ rõ để bất kỳ ai cũng tạo cùng số tiếp theo. Có thể dùng một thao tác lặp hoặc một dãy khoảng cách.",
      practice: [
        q("Dãy bắt đầu 4, mỗi bước gấp đôi rồi cộng 1. Số thứ ba là bao nhiêu?", "number", "19", "Làm đúng hai lần thao tác.", "4 → 9 → 19.", undefined, "Tạo theo luật"),
        q("Quy luật nào tạo dãy 3, 8, 13, 18?", "choice", "Mỗi bước cộng 5", "So sánh hai số liên tiếp.", "Các khoảng cách đều bằng 5.", ["Mỗi bước cộng 3", "Mỗi bước cộng 5", "Mỗi bước nhân 2", "Cộng lần lượt 2, 3, 4"], "Mô tả rõ"),
        q("Dãy bắt đầu 20 và bớt lần lượt 1, 2, 3, 4. Số thứ năm là bao nhiêu?", "number", "10", "Có bốn lần bớt để đến số thứ năm.", "20 → 19 → 17 → 14 → 10.", undefined, "Luật thay đổi"),
        q("Dãy nào tăng lần lượt 3, 5, 7, 9?", "choice", "6, 9, 14, 21, 30", "Tính khoảng cách giữa từng cặp số.", "Dãy 6, 9, 14, 21, 30 có các khoảng cách 3, 5, 7, 9.", ["6, 9, 14, 21, 30", "6, 10, 15, 21, 28", "6, 8, 12, 18, 26"], "Chuyển giao"),
      ],
    },
  ],
  calculation: [
    {
      title: "Cân bằng hai vế",
      goal: "Giữ tổng hoặc hiệu không đổi khi chuyển lượng giữa các số.",
      wonder: "Vì sao 398 + 57 bằng 400 + 55?",
      idea: "Với tổng, chuyển cùng một lượng từ số hạng này sang số hạng kia. Với hiệu, cùng tăng hoặc cùng giảm hai số.",
      practice: [
        q("Tính nhanh 398 + 46.", "number", "444", "Chuyển 2 từ 46 sang 398.", "400 + 44 = 444.", undefined, "Giữ tổng"),
        q("Tính nhanh 503 − 197.", "number", "306", "Cùng cộng 3 vào cả hai số.", "506 − 200 = 306.", undefined, "Giữ hiệu"),
        q("Điền số: 275 + 49 = 274 + □", "number", "50", "Số thứ nhất giảm 1 thì số thứ hai phải tăng 1.", "Để tổng giữ nguyên, ô trống là 50.", undefined, "Cân bằng"),
        q("Biểu thức nào bằng 699 − 298?", "choice", "701 − 300", "Cùng tăng hai số thêm 2.", "701 − 300 = 401, bằng hiệu ban đầu.", ["700 − 300", "701 − 300", "699 − 300", "701 − 298"], "Chuyển giao"),
      ],
    },
    {
      title: "Ước lượng để kiểm chứng",
      goal: "Ước lượng trước khi tính và dùng khoảng hợp lý để bắt lỗi.",
      wonder: "487 + 316 gần 700, 800 hay 900 nhất?",
      idea: "Làm tròn theo mục đích. Ước lượng không thay thế đáp án chính xác; nó là hàng rào phát hiện kết quả vô lý.",
      practice: [
        q("487 + 316 gần số nào nhất?", "choice", "800", "Làm tròn 487 thành 500 và 316 thành 300.", "500 + 300 = 800.", ["600", "700", "800", "900"], "Ước lượng"),
        q("49 × 6 gần số nào nhất?", "choice", "300", "Thay 49 bằng 50.", "50 × 6 = 300; đáp án thật là 294.", ["200", "250", "300", "350"], "Nhân gần đúng"),
        q("Kết quả nào chắc chắn sai với 398 + 205?", "choice", "503", "Tổng phải lớn hơn 398 + 200.", "398 + 205 = 603 nên 503 vô lý.", ["603", "600", "Khoảng 600", "503"], "Bắt lỗi"),
        q("Một bạn tính 72 × 4 = 248. Cách kiểm tra nhanh nào phát hiện sai?", "choice", "70 × 4 gần 280", "Ước lượng bằng số tròn chục.", "72 × 4 phải gần 280, nên 248 đáng nghi; kết quả đúng là 288.", ["70 × 4 gần 280", "72 gần 70", "4 là số chẵn", "248 là số chẵn"], "Chuyển giao"),
      ],
    },
    {
      title: "Sáng tạo phép tính đích",
      goal: "Tạo và so sánh nhiều biểu thức cùng cho một kết quả.",
      wonder: "Con tạo được bao nhiêu biểu thức khác nhau có kết quả 100?",
      idea: "Bắt đầu từ đích rồi tách thành tổng, hiệu hoặc tích. Sau đó kiểm tra thứ tự thực hiện.",
      practice: [
        q("Biểu thức nào bằng 100?", "choice", "25 × 4", "Kiểm tra từng phép tính.", "25 × 4 = 100.", ["25 × 4", "20 × 4", "90 + 20", "120 − 10"], "Tạo đích"),
        q("Điền số: 7 × □ + 2 = 51", "number", "7", "Tháo +2 trước.", "51 − 2 = 49; 49 : 7 = 7.", undefined, "Đi ngược"),
        q("Có bao nhiêu biểu thức đúng: 40+60, 125−25, 20×5, 300:3?", "number", "4", "Tính và so với đích 100.", "Cả bốn biểu thức đều bằng 100.", undefined, "Nhiều cách"),
        q("Đổi đúng một dấu để 8 + 4 = 32 trở thành đúng.", "choice", "Đổi + thành ×", "Giữ nguyên các số.", "8 × 4 = 32.", ["Đổi + thành ×", "Đổi = thành +", "Đổi 4 thành 3", "Không thể"], "Chuyển giao"),
      ],
    },
  ],
  measurement: [
    {
      title: "Bản đồ theo tỉ lệ trực quan",
      goal: "Chuyển độ dài trên sơ đồ thành độ dài thật bằng một quy ước đơn giản.",
      wonder: "Mỗi ô trên bản đồ là 5 m; đi 7 ô thì ngoài đời bao xa?",
      idea: "Tỉ lệ cho biết một đơn vị trên sơ đồ đại diện bao nhiêu đơn vị thật. Nhân số đoạn, không đếm số điểm.",
      practice: [
        q("Mỗi ô biểu diễn 5 m. Đường đi dài 7 ô là bao nhiêu mét?", "number", "35", "Nhân số ô với 5.", "7 × 5 = 35 m.", undefined, "Tỉ lệ"),
        q("Hai điểm cách nhau 6 đoạn trên lưới, mỗi đoạn 20 m. Khoảng cách thật là bao nhiêu?", "number", "120", "Đếm đoạn, không đếm điểm.", "6 × 20 = 120 m.", undefined, "Đếm đoạn"),
        q("Một sơ đồ dùng 1 cm thay cho 10 m. Đo được 8 cm thì thật dài bao nhiêu mét?", "number", "80", "Mỗi xăng-ti-mét đại diện 10 mét.", "8 × 10 = 80 m.", undefined, "Đổi mô hình"),
        q("Đường thật dài 45 m, mỗi ô là 5 m. Cần vẽ dài bao nhiêu ô?", "number", "9", "Đi ngược bằng phép chia.", "45 : 5 = 9 ô.", undefined, "Chuyển giao"),
      ],
    },
    {
      title: "Lập lịch không chồng chéo",
      goal: "Tính mốc bắt đầu, kết thúc và khoảng trống trong một lịch nhiều hoạt động.",
      wonder: "Hai hoạt động có thật sự vừa trong 90 phút nếu còn 10 phút di chuyển?",
      idea: "Vẽ trục thời gian, đánh dấu mốc và tính cả thời gian chuyển tiếp. Khoảng thời gian khác với giờ trên đồng hồ.",
      practice: [
        q("Bắt đầu 8:20, học 35 phút. Kết thúc lúc nào?", "choice", "8:55", "Cộng 30 phút rồi 5 phút.", "8:20 + 35 phút = 8:55.", ["8:45", "8:50", "8:55", "9:05"], "Mốc thời gian"),
        q("Từ 9:15 đến 10:00 có bao nhiêu phút?", "number", "45", "Đi đến 9:30 rồi 10:00.", "15 + 30 = 45 phút.", undefined, "Khoảng thời gian"),
        q("Một buổi có 40 phút đọc, nghỉ 10 phút, rồi 25 phút vẽ. Tổng bao nhiêu phút?", "number", "75", "Tính cả thời gian nghỉ.", "40 + 10 + 25 = 75 phút.", undefined, "Lịch nhiều phần"),
        q("Có 90 phút. Hai hoạt động dài 35 và 40 phút, di chuyển 10 phút. Còn bao nhiêu phút?", "number", "5", "Cộng tất cả phần đã dùng.", "90 − (35 + 40 + 10) = 5 phút.", undefined, "Chuyển giao"),
      ],
    },
    {
      title: "Thiết kế trong ngân sách",
      goal: "Phối hợp tiền, số lượng và giới hạn để chọn phương án hợp lý.",
      wonder: "Có 100 nghìn đồng, làm sao mua đủ mà vẫn còn khoản dự phòng?",
      idea: "Tính chi phí bắt buộc trước, sau đó so sánh phần còn lại với giới hạn. Một phương án đúng phải thỏa mọi điều kiện.",
      practice: [
        q("Có 80 000 đồng, mua 3 món giá 18 000 đồng. Còn lại bao nhiêu?", "number", "26000", "Tính tổng tiền mua trước.", "3 × 18 000 = 54 000; còn 26 000 đồng.", undefined, "Ngân sách"),
        q("Mỗi hộp có 6 bút, cần ít nhất 20 bút. Phải mua ít nhất bao nhiêu hộp?", "number", "4", "Ba hộp mới có 18 bút.", "Cần 4 hộp để có 24 bút.", undefined, "Làm tròn lên"),
        q("Hai phương án giá 45 000 và 52 000 đồng. Có 50 000 đồng. Chọn được phương án nào?", "choice", "45 000 đồng", "So từng giá với ngân sách.", "Chỉ 45 000 không vượt 50 000.", ["45 000 đồng", "52 000 đồng", "Cả hai", "Không phương án nào"], "So giới hạn"),
        q("Có 120 000 đồng, phải để lại 20 000. Mua tối đa bao nhiêu vé giá 25 000 đồng?", "number", "4", "Chỉ được dùng 100 000 đồng.", "(120 000 − 20 000) : 25 000 = 4 vé.", undefined, "Chuyển giao"),
      ],
    },
  ],
  geometry: [
    {
      title: "Gấp, xoay và đối xứng",
      goal: "Dự đoán hình sau khi gấp, xoay và nhận ra các trục đối xứng.",
      wonder: "Xoay một hình vuông một phần tư vòng, hình có đổi không?",
      idea: "Theo dõi điểm đặc biệt hoặc cạnh được đánh dấu. Hình đối xứng có thể trùng lại sau một số phép xoay.",
      practice: [
        q("Hình vuông có bao nhiêu trục đối xứng?", "number", "4", "Có trục ngang, dọc và hai đường chéo.", "Hình vuông có 4 trục đối xứng.", undefined, "Đối xứng"),
        q("Xoay hình vuông 90° quanh tâm, hình có trùng vị trí cũ không?", "choice", "Có", "Bốn cạnh và góc của hình vuông giống nhau.", "Sau một phần tư vòng, hình vuông trùng lại.", ["Có", "Không", "Chỉ khi xoay 180°"], "Phép xoay"),
        q("Hình chữ nhật không phải hình vuông có bao nhiêu trục đối xứng?", "number", "2", "Xét trục qua trung điểm các cạnh.", "Có một trục ngang và một trục dọc.", undefined, "Phân loại"),
        q("Gấp đôi tờ giấy rồi đục 1 lỗ, mở ra thường thấy bao nhiêu lỗ đối xứng?", "number", "2", "Một lỗ xuyên qua hai lớp giấy.", "Mở ra được hai lỗ đối xứng qua nếp gấp.", undefined, "Chuyển giao"),
      ],
    },
    {
      title: "Lát kín không khe hở",
      goal: "Thử và giải thích hình nào có thể lặp lại để phủ kín một mặt phẳng.",
      wonder: "Vì sao hình vuông lát kín sàn còn hình tròn để lại khe?",
      idea: "Một kiểu lát kín không được chồng lên nhau hay để hở. Các cạnh quanh một điểm phải khép kín vừa đủ.",
      practice: [
        q("Hình nào chắc chắn lát kín sàn bằng các bản sao cùng kích thước?", "choice", "Hình vuông", "Thử ghép các cạnh bằng nhau.", "Các hình vuông ghép theo hàng và cột không để khe.", ["Hình tròn", "Hình vuông", "Hình bầu dục"], "Lát kín"),
        q("Dùng 12 ô vuông đơn vị lát hình chữ nhật 3×4 có thừa ô nào không?", "choice", "Không", "Diện tích hình là 3 × 4.", "3 × 4 = 12 nên dùng vừa đủ.", ["Có 1 ô", "Có 2 ô", "Không"], "Diện tích"),
        q("Một vùng 5×6 ô cần bao nhiêu viên gạch 1×1?", "number", "30", "Đếm theo hàng và cột.", "5 × 6 = 30 viên.", undefined, "Phủ kín"),
        q("Gạch 2×2 có lát kín bảng 6×8 không?", "choice", "Có", "Cả hai kích thước có chia hết cho 2 không?", "6 và 8 đều chia hết cho 2 nên lát kín được.", ["Có", "Không", "Chỉ khi cắt gạch"], "Chuyển giao"),
      ],
    },
    {
      title: "Thiết kế hình tối ưu",
      goal: "So sánh nhiều hình thỏa cùng điều kiện và giải thích phương án tốt nhất.",
      wonder: "Cùng 24 ô, hình chữ nhật nào cần ít đường viền nhất?",
      idea: "Liệt kê các cặp thừa số rồi so chu vi. Với cùng diện tích, hai cạnh gần nhau thường tạo hình gọn hơn.",
      practice: [
        q("Với 24 ô, hình nào có chu vi nhỏ nhất?", "choice", "4×6", "So các cặp 1×24, 2×12, 3×8, 4×6.", "4×6 có chu vi 20, nhỏ nhất.", ["1×24", "2×12", "3×8", "4×6"], "Tối ưu"),
        q("Hình 3×8 có chu vi bao nhiêu?", "number", "22", "Cộng hai cạnh rồi nhân 2.", "(3 + 8) × 2 = 22.", undefined, "Tính chuẩn"),
        q("Hai hình cùng chu vi 20: 1×9 và 4×6. Hình nào có diện tích lớn hơn?", "choice", "4×6", "Tính 1×9 và 4×6.", "9 < 24 nên 4×6 lớn hơn.", ["1×9", "4×6", "Bằng nhau"], "So sánh"),
        q("Một hình chữ nhật diện tích 36 có cạnh nguyên. Hình vuông 6×6 có chu vi bao nhiêu?", "number", "24", "Bốn cạnh đều dài 6.", "6 × 4 = 24.", undefined, "Chuyển giao"),
      ],
    },
  ],
  data: [
    {
      title: "Biểu đồ có thể đánh lừa?",
      goal: "Đọc trục và phạm vi dữ liệu trước khi tin vào ấn tượng bằng mắt.",
      wonder: "Hai cột trông chênh rất xa có thể chỉ khác nhau 1 đơn vị không?",
      idea: "Luôn đọc nhãn, đơn vị và mốc bắt đầu của trục. So sánh bằng số thay vì chỉ bằng chiều cao nhìn thấy.",
      practice: [
        q("Hai cột có giá trị 48 và 50. Chênh lệch là bao nhiêu?", "number", "2", "Lấy số lớn trừ số nhỏ.", "50 − 48 = 2.", undefined, "Đọc số"),
        q("Trục dọc bắt đầu từ 40 thay vì 0 có thể làm chênh lệch trông thế nào?", "choice", "Lớn hơn thực tế", "Phần từ 0 đến 40 đã bị cắt đi.", "Cắt gốc trục thường phóng đại khác biệt bằng mắt.", ["Lớn hơn thực tế", "Nhỏ hơn thực tế", "Không bao giờ đổi"], "Trục biểu đồ"),
        q("Dữ liệu 7, 9, 8, 10 có giá trị lớn nhất là bao nhiêu?", "number", "10", "So bốn số.", "10 là giá trị lớn nhất.", undefined, "Đọc chính xác"),
        q("Biểu đồ không ghi đơn vị còn thiếu thông tin gì?", "choice", "Mỗi con số đo điều gì", "Một cột 5 có thể là 5 bạn, 5 kg hoặc 5 phút.", "Không có đơn vị, ta chưa biết ý nghĩa đầy đủ của số liệu.", ["Mỗi con số đo điều gì", "Màu đẹp hay không", "Ai vẽ nhanh hơn"], "Chuyển giao"),
      ],
    },
    {
      title: "Thí nghiệm ngẫu nhiên",
      goal: "Phân biệt điều có thể, chắc chắn và không thể trong thử nghiệm đơn giản.",
      wonder: "Tung đồng xu 10 lần có chắc chắn được 5 lần ngửa không?",
      idea: "Ngẫu nhiên nghĩa là ta biết các kết quả có thể nhưng không biết chắc lần kế tiếp. Nhiều lần thử giúp thấy xu hướng, không bảo đảm chia đều tuyệt đối.",
      practice: [
        q("Tung một đồng xu có bao nhiêu kết quả có thể?", "number", "2", "Đồng xu có hai mặt.", "Có sấp và ngửa.", undefined, "Không gian mẫu"),
        q("Rút một thẻ từ túi chỉ có thẻ đỏ. Rút được đỏ là gì?", "choice", "Chắc chắn", "Không có màu khác trong túi.", "Rút đỏ là sự kiện chắc chắn.", ["Chắc chắn", "Có thể", "Không thể"], "Chắc chắn"),
        q("Xúc xắc 6 mặt có thể ra số 8 không?", "choice", "Không thể", "Các mặt được đánh số từ 1 đến 6.", "8 không nằm trong các kết quả có thể.", ["Chắc chắn", "Có thể", "Không thể"], "Không thể"),
        q("Tung đồng xu 4 lần đều ngửa. Lần thứ năm chắc chắn sấp không?", "choice", "Không", "Mỗi lần tung mới vẫn có hai khả năng.", "Kết quả trước không làm lần sau chắc chắn sấp.", ["Có", "Không"], "Chuyển giao"),
      ],
    },
    {
      title: "Thiết kế cuộc khảo sát",
      goal: "Đặt câu hỏi công bằng, chọn mẫu hợp lý và giới hạn kết luận.",
      wonder: "Hỏi riêng đội bóng về môn yêu thích có đại diện cho cả trường không?",
      idea: "Mẫu tốt cần đa dạng và câu hỏi không dẫn dắt. Kết luận chỉ nên bao quát nhóm mà dữ liệu đại diện được.",
      practice: [
        q("Muốn biết món ăn yêu thích của lớp, nên hỏi ai?", "choice", "Nhiều bạn ở các tổ", "Mẫu cần trải đều trong lớp.", "Hỏi nhiều bạn ở các tổ đại diện tốt hơn.", ["Chỉ bạn thân", "Nhiều bạn ở các tổ", "Chỉ giáo viên"], "Chọn mẫu"),
        q("Câu nào ít dẫn dắt hơn?", "choice", "Bạn thích trò nào nhất?", "Tránh gọi sẵn một trò là tuyệt vời.", "Câu hỏi mở trung tính hơn.", ["Bạn có thích trò cờ vua tuyệt vời không?", "Bạn thích trò nào nhất?"], "Câu hỏi công bằng"),
        q("Khảo sát 12 bạn, 8 bạn chọn A. Có bao nhiêu bạn không chọn A?", "number", "4", "Lấy tổng trừ số chọn A.", "12 − 8 = 4 bạn.", undefined, "Đọc kết quả"),
        q("Hỏi 6 bạn cùng câu lạc bộ bơi. Kết luận nào chắc chắn?", "choice", "Kết quả mô tả 6 bạn đã hỏi", "Không mở rộng ra cả trường.", "Ta chỉ chắc về nhóm được hỏi.", ["Cả trường thích bơi", "Kết quả mô tả 6 bạn đã hỏi", "Không ai thích chạy"], "Chuyển giao"),
      ],
    },
  ],
  word: [
    {
      title: "Manh mối đủ hay thiếu",
      goal: "Nhận ra khi nào dữ kiện xác định một đáp án và khi nào còn nhiều khả năng.",
      wonder: "Biết tổng hai số là 10 đã đủ tìm chính xác hai số chưa?",
      idea: "Một đáp án phải thỏa tất cả manh mối. Nếu còn hai phương án cùng đúng, ta cần thêm dữ kiện thay vì đoán.",
      practice: [
        q("Tổng hai số là 10. Có xác định duy nhất hai số không?", "choice", "Không", "Có nhiều cặp cùng tổng 10.", "1+9, 2+8, 3+7… đều thỏa.", ["Có", "Không"], "Đủ dữ kiện"),
        q("Tổng hai số là 10, hiệu là 2. Cặp số là gì?", "choice", "6 và 4", "Thử cặp gần nhau quanh 5.", "6 + 4 = 10 và 6 − 4 = 2.", ["7 và 3", "6 và 4", "8 và 2"], "Hai điều kiện"),
        q("An lớn tuổi hơn Bình. Bình lớn tuổi hơn Chi. Ai nhỏ tuổi nhất?", "choice", "Chi", "Xếp theo thứ tự.", "An > Bình > Chi.", ["An", "Bình", "Chi", "Chưa biết"], "Chuỗi logic"),
        q("Một số chẵn lớn hơn 6 và nhỏ hơn 10. Số đó là bao nhiêu?", "number", "8", "Liệt kê các số giữa 6 và 10.", "Chỉ có 8 vừa chẵn vừa thỏa khoảng.", undefined, "Chuyển giao"),
      ],
    },
    {
      title: "Chiến lược thử và sửa",
      goal: "Thử có hệ thống, đọc độ lệch và điều chỉnh thay vì đoán ngẫu nhiên.",
      wonder: "Nếu thử quá lớn, ta nên đổi đại lượng nào và đổi bao nhiêu?",
      idea: "Ghi lại mỗi lần thử, kết quả và độ lệch. Một lần thử sai vẫn tạo thông tin cho lần tiếp theo.",
      practice: [
        q("Tìm số: số đó × 5 + 2 = 37.", "number", "7", "Thử 6 cho 32, còn thiếu 5 nên tăng đầu vào 1.", "7 × 5 + 2 = 37.", undefined, "Thử-sửa"),
        q("Có 5 túi nhỏ 3 viên hoặc lớn 5 viên, tổng 21 viên. Có mấy túi lớn?", "number", "3", "Giả sử cả 5 đều nhỏ được 15 viên.", "Thiếu 6; mỗi túi lớn tăng 2 nên cần 3 túi lớn.", undefined, "Độ lệch"),
        q("Một hình chữ nhật chu vi 18, một cạnh 5. Cạnh kia bằng bao nhiêu?", "number", "4", "Nửa chu vi là 9.", "9 − 5 = 4.", undefined, "Điều chỉnh"),
        q("Số nào nhân 4 rồi bớt 3 được 29?", "number", "8", "Nếu thử 7 được 25, còn thiếu 4.", "Tăng đầu vào 1 làm đầu ra tăng 4; số cần tìm là 8.", undefined, "Chuyển giao"),
      ],
    },
    {
      title: "Chứng minh không còn cách khác",
      goal: "Tìm đủ nghiệm bằng một trật tự và nêu lý do dừng.",
      wonder: "Tìm vài cách khác với chứng minh đã tìm đủ như thế nào?",
      idea: "Chọn một đại lượng để tăng dần, kiểm tra từng trường hợp và dừng khi vượt giới hạn. Bảng trường hợp là bằng chứng không bỏ sót.",
      practice: [
        q("Có bao nhiêu cặp số tự nhiên dương có tổng 9, không tính đổi chỗ?", "number", "4", "Liệt kê từ 1+8 đến khi hai số đổi vai.", "1+8, 2+7, 3+6, 4+5: có 4 cặp.", undefined, "Tìm đủ"),
        q("Có bao nhiêu cặp cạnh nguyên của hình chữ nhật diện tích 18?", "number", "3", "Tìm các cặp thừa số của 18.", "1×18, 2×9, 3×6: có 3.", undefined, "Cặp thừa số"),
        q("Dùng đồng 2 nghìn và 3 nghìn tạo đúng 6 nghìn có bao nhiêu cách?", "number", "2", "Xét số đồng 3 nghìn từ 0 đến 2.", "Ba đồng 2 hoặc hai đồng 3: có 2 cách.", undefined, "Xét trường hợp"),
        q("Số có hai chữ số, tổng chữ số bằng 5. Có bao nhiêu số?", "number", "5", "Hàng chục bắt đầu từ 1 đến 5.", "14, 23, 32, 41, 50: có 5 số.", undefined, "Chuyển giao"),
      ],
    },
  ],
};

const checkerByDomain: Record<DomainId, { name: string; when: string; steps: string[] }> = {
  number: { name: "Bảng bằng chứng", when: "Khi sợ bỏ sót một trường hợp hoặc chọn nhầm quy luật.", steps: ["Ghi từng bước hoặc từng trường hợp theo thứ tự.", "Kiểm tra quy luật với mọi dữ kiện.", "Thử dự đoán thêm một bước mới."] },
  calculation: { name: "Ước lượng rồi tính ngược", when: "Khi cần bắt lỗi phép tính hoặc kiểm tra biến đổi.", steps: ["Ước lượng một khoảng hợp lý.", "Dùng phép tính ngược để kiểm tra.", "So đáp án với khoảng ban đầu."] },
  measurement: { name: "Sơ đồ đơn vị", when: "Khi đề có nhiều đại lượng, mốc hoặc giới hạn.", steps: ["Ghi đại lượng kèm đơn vị.", "Đổi về cùng đơn vị trước khi tính.", "Thay kết quả vào điều kiện để kiểm tra."] },
  geometry: { name: "Xếp hình rồi đếm", when: "Khi cần nhìn thấy phần trong, đường biên hoặc cấu hình.", steps: ["Vẽ hoặc xếp một trường hợp nhỏ.", "Đánh dấu cạnh trong và cạnh ngoài.", "So sánh với cách tính bằng công thức."] },
  data: { name: "Đọc – hỏi – kết luận", when: "Khi biểu đồ hoặc khảo sát dễ khiến ta đoán quá xa.", steps: ["Đọc nhãn, đơn vị và số liệu.", "Hỏi dữ liệu đến từ ai và bao nhiêu mẫu.", "Chỉ kết luận trong phạm vi bằng chứng."] },
  word: { name: "Bảng thử có hệ thống", when: "Khi bài có nhiều điều kiện hoặc nhiều nghiệm.", steps: ["Chọn một đại lượng để thay đổi theo thứ tự.", "Loại phương án vi phạm điều kiện.", "Nêu lý do đã xét hết và dừng."] },
};

const missionGuideByDomain: Record<DomainId, { materials: string[]; connection: string }> = {
  number: { materials: ["Giấy nháp", "Bút chì"], connection: "Tìm quy luật trong lịch, số nhà, trò chơi và các mẫu lặp quanh con." },
  calculation: { materials: ["Giấy nháp", "Thẻ số tự làm"], connection: "Chọn cách tính nhanh khi mua đồ, chia phần hoặc kiểm tra một kết quả ngoài đời." },
  measurement: { materials: ["Thước", "Đồng hồ hoặc đồ vật để đo"], connection: "Lập kế hoạch thời gian, đo không gian và thiết kế trong một giới hạn thật." },
  geometry: { materials: ["Giấy ô vuông", "12 miếng giấy nhỏ"], connection: "Xếp, gấp và thiết kế hình như một kiến trúc sư nhỏ." },
  data: { materials: ["Giấy kẻ bảng", "Bút màu"], connection: "Thu thập dữ liệu từ gia đình rồi kể một câu chuyện đúng bằng số liệu." },
  word: { materials: ["Giấy nháp", "Bút chì"], connection: "Dùng manh mối, thử–sửa và suy luận như một thám tử toán học." },
};

function makeExtension(base: Mission, spec: ExtensionSpec, sequence: 4 | 5 | 6): Mission {
  const level = (sequence - 3) as MissionLevel;
  return {
    ...base,
    id: `${base.domain}-${sequence}`,
    code: `MR-${String(18 + (DOMAINS.findIndex((d) => d.id === base.domain) * 3) + level).padStart(2, "0")}`,
    title: spec.title,
    goal: spec.goal,
    hook: `Phòng nghiên cứu mở: ${spec.title} biến một bài quen thành một câu hỏi cần thử, sửa và giải thích.`,
    wonder: spec.wonder,
    ideaTitle: "Tạo bằng chứng, không đoán mò",
    idea: spec.idea,
    model: {
      prompt: spec.practice[0].prompt,
      steps: [spec.practice[0].hint, spec.practice[0].explanation, "Đổi một dữ kiện nhỏ và kiểm tra xem chiến lược còn dùng được không."],
      answer: spec.practice[0].answer,
    },
    practice: spec.practice,
    reflection: `Con đã dùng bằng chứng nào trong nhiệm vụ “${spec.title}”? Nếu đổi một dữ kiện, cách nghĩ của con đổi ra sao?`,
  };
}

function hintLadder(question: PracticeQuestion): HintLadder {
  return [
    `Tầng 1 · Nhìn cấu trúc: ${question.challengeTag ? `Đây là thử thách “${question.challengeTag}”. ` : ""}Hãy gạch chân dữ kiện quyết định.`,
    `Tầng 2 · Chọn bước: ${question.hint}`,
    `Tầng 3 · Gần lời giải: ${question.explanation}`,
  ];
}

function deepQuestion(question: PracticeQuestion, id: string): DeepQuestion {
  return {
    ...question,
    id,
    hints: hintLadder(question),
    misconception: question.type === "number"
      ? "Có thể con đã chọn đúng phép tính nhưng nhầm một bước hoặc bỏ quên điều kiện."
      : "Có thể con đang chọn theo cảm giác; hãy kiểm tra từng lựa chọn bằng dữ kiện.",
  };
}

function standardize(mission: Mission, sequence: DeepMission["sequence"]): DeepMission {
  const practices = mission.practice.slice(0, 3).map((question, index) => deepQuestion(question, `${mission.id}-p${index + 1}`));
  const transferSource = mission.practice[3] ?? mission.practice[mission.practice.length - 1];
  const first = mission.practice[0];
  const generic: DeepMission = {
    ...mission,
    sequence,
    durationMinutes: 15,
    materials: missionGuideByDomain[mission.domain].materials,
    successCriteria: [
      "Con dám đưa ra dự đoán trước khi xem cách làm.",
      "Con chọn được một chiến lược và giải thích vì sao.",
      "Con mang ý tưởng sang câu chuyển giao rồi nói lại điều đã hiểu.",
    ],
    realWorldConnection: missionGuideByDomain[mission.domain].connection,
    prediction: {
      prompt: mission.wonder,
      options: ["Con đã có một dự đoán", "Con nghĩ có hơn một cách", "Con chưa chắc và muốn thử"],
      reveal: `Dự đoán không bị chấm điểm. Điều quan trọng là giữ lại ý tưởng ban đầu để so với bằng chứng sau thí nghiệm. ${mission.idea}`,
    },
    lab: {
      type: "choice",
      prompt: first.prompt,
      options: (first.options ?? [first.answer, "Cần thử thêm", "Chưa đủ dữ kiện"]).map((value) => ({ value, label: value, note: value === first.answer ? "Phương án cần kiểm chứng" : "Thử và đối chiếu" })),
      answer: first.answer,
      explanation: first.explanation,
    },
    strategies: [
      { name: "Theo dấu mẫu", when: "Khi con muốn thấy từng bước tạo ra đáp án.", steps: mission.model.steps },
      checkerByDomain[mission.domain],
    ],
    deepPractice: practices,
    transfer: deepQuestion(transferSource, `${mission.id}-transfer`),
    reflectionStems: [mission.reflection, "Lúc đầu con dự đoán gì, sau đó bằng chứng nào làm con đổi hoặc giữ ý kiến?", "Nếu dạy lại cho một bạn, con sẽ bắt đầu bằng câu hỏi nào?"],
  };

  if (mission.id !== "geometry-1") return generic;
  return {
    ...generic,
    prediction: {
      prompt: "Ba hình 1×12, 2×6 và 3×4 đều dùng 12 ô. Chu vi của chúng có bằng nhau không?",
      options: ["Có, vì cùng 12 ô", "Không, hình gọn hơn có chu vi nhỏ hơn", "Con chưa chắc"],
      answer: "Không, hình gọn hơn có chu vi nhỏ hơn",
      reveal: "Cùng diện tích chưa chắc cùng chu vi. Dự đoán này sẽ được kiểm tra bằng cách xếp đúng 12 ô theo ba cấu hình.",
    },
    lab: {
      type: "tile-rectangles",
      prompt: "Chọn từng cách xếp 12 viên gạch. Quan sát diện tích và chu vi thay đổi ra sao.",
      options: [
        { value: "1x12", label: "1 × 12", note: "A = 12 · P = 26" },
        { value: "2x6", label: "2 × 6", note: "A = 12 · P = 16" },
        { value: "3x4", label: "3 × 4", note: "A = 12 · P = 14" },
      ],
      answer: "3x4",
      explanation: "Cả ba cùng diện tích 12. Hình 3×4 có hai cạnh gần nhau nhất nên chu vi 14 là nhỏ nhất.",
    },
    strategies: [
      { name: "Cặp thừa số", when: "Khi cần tìm đủ mọi hình chữ nhật.", steps: ["Tìm các cặp số có tích 12.", "Tính chu vi của từng cặp.", "So sánh và nêu kết luận."] },
      { name: "Đếm cạnh ngoài", when: "Khi muốn hiểu bằng hình thay vì công thức.", steps: ["Xếp đủ 12 ô, không chồng lên nhau.", "Gạch bỏ cạnh nằm giữa hai ô.", "Đếm các cạnh còn lộ ra bên ngoài."] },
    ],
  };
}

export const DEEP_MISSION_LIBRARY = Object.fromEntries(DOMAINS.map((domain) => {
  const originals = MISSION_LIBRARY[domain.id];
  const added = extensions[domain.id].map((spec, index) => makeExtension(originals[index], spec, (index + 4) as 4 | 5 | 6));
  const six = [...originals, ...added].map((mission, index) => standardize(mission, (index + 1) as DeepMission["sequence"]));
  return [domain.id, six];
})) as Record<DomainId, DeepMission[]>;

export const ALL_DEEP_MISSIONS = Object.values(DEEP_MISSION_LIBRARY).flat();

function makeDailyPuzzles(): DailyPuzzle[] {
  const puzzles: DailyPuzzle[] = [];
  for (let i = 0; i < 10; i += 1) {
    const start = i + 2;
    puzzles.push({ id: `pattern-${i}`, prompt: `Dãy bắt đầu ${start}, mỗi bước cộng ${i + 3}. Số thứ tư là?`, note: "Theo đúng ba bước", options: [`${start + 2 * (i + 3)}`, `${start + 3 * (i + 3)}`, `${start + 4 * (i + 3)}`], answer: `${start + 3 * (i + 3)}`, hint: "Từ số thứ nhất đến số thứ tư có ba bước.", explanation: `${start} + 3 × ${i + 3} = ${start + 3 * (i + 3)}.` });
    const a = 91 + i;
    const b = 24 + i;
    puzzles.push({ id: `balance-${i}`, prompt: `${a} + ${b} bằng bao nhiêu?`, note: "Làm tròn đến 100 rồi trả lại", options: [`${a + b - 1}`, `${a + b}`, `${a + b + 1}`, `${a + b + 10}`], answer: `${a + b}`, hint: `Chuyển ${100 - a} từ số thứ hai sang ${a}.`, explanation: `${a} + ${b} = 100 + ${b - (100 - a)} = ${a + b}.` });
    const x = i + 2;
    const output = x * 4 + 3;
    puzzles.push({ id: `machine-${i}`, prompt: `Một số ×4 rồi +3 được ${output}. Số đó là?`, note: "Tháo máy từ cuối", options: [`${x - 1}`, `${x}`, `${x + 1}`, `${x + 2}`], answer: `${x}`, hint: `Lấy ${output} trừ 3 rồi chia 4.`, explanation: `(${output} − 3) : 4 = ${x}.` });
    const shirts = (i % 4) + 2;
    const hats = (i % 3) + 2;
    const combinations = shirts * hats;
    puzzles.push({ id: `combo-${i}`, prompt: `${shirts} áo và ${hats} mũ tạo bao nhiêu cách chọn một áo, một mũ?`, note: "Đếm có hệ thống", options: [`${combinations - 1}`, `${combinations}`, `${combinations + 1}`, `${combinations + 2}`], answer: `${combinations}`, hint: "Mỗi áo đi với tất cả các mũ.", explanation: `${shirts} × ${hats} = ${combinations} cách.` });
    const length = i + 4;
    const width = (i % 3) + 2;
    puzzles.push({ id: `perimeter-${i}`, prompt: `Hình ${length}×${width} có chu vi bao nhiêu?`, note: "Phân biệt chu vi và diện tích", options: [`${length * width}`, `${2 * (length + width)}`, `${length + width}`, `${2 * length + width}`], answer: `${2 * (length + width)}`, hint: "Cộng chiều dài và chiều rộng rồi nhân 2.", explanation: `(${length} + ${width}) × 2 = ${2 * (length + width)}.` });
    const sample = 10 + i;
    const yes = 6 + (i % 4);
    puzzles.push({ id: `evidence-${i}`, prompt: `Hỏi ${sample} bạn, có ${yes} bạn chọn A. Điều gì chắc chắn?`, note: "Không kết luận vượt dữ liệu", options: [`${yes} bạn được hỏi chọn A`, "Cả lớp chọn A", "Cả trường chọn A"], answer: `${yes} bạn được hỏi chọn A`, hint: "Chỉ nói về nhóm đã được hỏi.", explanation: `Dữ liệu chỉ bảo đảm ${yes} trong ${sample} bạn được hỏi chọn A.` });
  }
  return puzzles;
}

export const DAILY_PUZZLES_60 = makeDailyPuzzles();

export function validateCurriculum() {
  const errors: string[] = [];
  if (ALL_DEEP_MISSIONS.length !== 36) errors.push(`Cần đúng 36 nhiệm vụ, hiện có ${ALL_DEEP_MISSIONS.length}.`);
  if (new Set(ALL_DEEP_MISSIONS.map((mission) => mission.id)).size !== 36) errors.push("Mã nhiệm vụ bị trùng.");
  ALL_DEEP_MISSIONS.forEach((mission) => {
    if (mission.deepPractice.length < 3) errors.push(`${mission.id}: cần ít nhất 3 bài luyện.`);
    if (mission.strategies.length !== 2) errors.push(`${mission.id}: cần đúng 2 chiến lược.`);
    if (mission.reflectionStems.length !== 3) errors.push(`${mission.id}: cần 3 câu phản tư.`);
    if (mission.materials.length < 2) errors.push(`${mission.id}: cần hướng dẫn học liệu.`);
    if (mission.successCriteria.length !== 3) errors.push(`${mission.id}: cần 3 tiêu chí hoàn thành.`);
    [...mission.deepPractice, mission.transfer].forEach((question) => {
      if (question.hints.length !== 3) errors.push(`${question.id}: cần 3 tầng gợi ý.`);
      if (question.type === "choice" && !question.options?.includes(question.answer)) errors.push(`${question.id}: đáp án không có trong lựa chọn.`);
    });
  });
  if (DAILY_PUZZLES_60.length !== 60) errors.push(`Cần 60 câu đố ngày, hiện có ${DAILY_PUZZLES_60.length}.`);
  if (errors.length) throw new Error(`Dữ liệu chương trình không hợp lệ:\n${errors.join("\n")}`);
  return true;
}

validateCurriculum();
