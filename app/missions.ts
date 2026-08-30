import { LESSONS, type DomainId, type Lesson, type PracticeQuestion } from "./content";

export type MissionLevel = 1 | 2 | 3;
export type Mission = Lesson & {
  id: string;
  level: MissionLevel;
  levelName: "Nhà khám phá" | "Nhà chiến lược" | "Nhà nghiên cứu nhỏ";
};

export type DailyPuzzle = {
  id: string;
  prompt: string;
  note: string;
  options: string[];
  answer: string;
  hint: string;
  explanation: string;
};

const p = (
  prompt: string,
  type: PracticeQuestion["type"],
  answer: string,
  hint: string,
  explanation: string,
  options?: string[],
  challengeTag?: string,
): PracticeQuestion => ({ prompt, type, answer, hint, explanation, options, challengeTag });

const asMission = (lesson: Lesson, id: string, level: MissionLevel, levelName: Mission["levelName"]): Mission =>
  ({ ...lesson, id, level, levelName });

const advanced: Record<DomainId, [Mission, Mission]> = {
  number: [
    {
      id: "number-2", level: 2, levelName: "Nhà chiến lược", domain: "number", code: "MR-07", unit: "Xưởng chế tạo số", title: "Mỗi chữ số, nhiều mật mã", goal: "Đếm và tạo số theo điều kiện bằng cách làm có hệ thống.", prerequisite: "Hiểu hàng trăm, hàng chục, hàng đơn vị và so sánh số.",
      hook: "Chỉ ba thẻ số nhưng đổi vị trí một chút, ta có thể tạo ra cả một kho mật mã.", wonder: "Dùng 2, 5, 8 đúng một lần, có bao nhiêu số lớn hơn 500? Làm sao chắc rằng con không bỏ sót?",
      ideaTitle: "Cố định một vị trí rồi đếm", idea: "Thay vì thử ngẫu nhiên, hãy cố định hàng trăm trước. Với mỗi lựa chọn hàng trăm, liệt kê hoặc đếm cách xếp các chữ số còn lại.",
      representations: [{ label: "Hàng trăm", value: "2", note: "2 cách sau" }, { label: "Hàng trăm", value: "5", note: "2 cách sau" }, { label: "Hàng trăm", value: "8", note: "2 cách sau" }, { label: "Tổng", value: "6", note: "mật mã" }],
      model: { prompt: "Dùng 2, 5, 8 lập số lớn hơn 500", steps: ["Số lớn hơn 500 phải có hàng trăm là 5 hoặc 8.", "Nếu hàng trăm là 5, hai số còn lại đổi chỗ được 2 cách: 528, 582.", "Nếu hàng trăm là 8, có 825, 852.", "Kiểm tra: mỗi số dùng đủ ba chữ số và không lặp."], answer: "Có 4 số lớn hơn 500." },
      practice: [
        p("Dùng 1, 4, 7 đúng một lần. Lập được bao nhiêu số có ba chữ số?", "number", "6", "Có 3 cách chọn hàng trăm, rồi 2 cách xếp phần còn lại.", "3 × 2 = 6 số.", undefined, "Đếm có hệ thống"),
        p("Dùng 1, 4, 7 đúng một lần. Có bao nhiêu số lớn hơn 400?", "number", "4", "Hàng trăm chỉ có thể là 4 hoặc 7.", "Mỗi lựa chọn hàng trăm có 2 cách xếp phần còn lại nên có 4 số.", undefined, "Lọc điều kiện"),
        p("Dùng 2, 5, 8 đúng một lần. Số chẵn nhỏ nhất lập được là số nào?", "number", "258", "Số chẵn phải tận cùng bằng 2 hoặc 8.", "Trong các số chẵn có thể lập, 258 là nhỏ nhất.", undefined, "Tối ưu"),
        p("Dùng 0, 3, 6 đúng một lần. Số có ba chữ số lớn nhất là số nào?", "number", "630", "Đặt chữ số lớn nhất ở hàng cao nhất; 0 không thể đứng đầu.", "Xếp giảm dần 6, 3, 0 được 630.", undefined, "Ràng buộc"),
      ], reflection: "Cố định một vị trí giúp con tránh lặp hoặc bỏ sót như thế nào?",
    },
    {
      id: "number-3", level: 3, levelName: "Nhà nghiên cứu nhỏ", domain: "number", code: "MR-13", unit: "Phòng nghiên cứu chẵn–lẻ", title: "Điều không đổi của chẵn và lẻ", goal: "Dự đoán tính chẵn–lẻ mà không cần tính toàn bộ.", prerequisite: "Nhận biết số chẵn, số lẻ và cộng trừ thành thạo.",
      hook: "Có những điều ta biết chắc về kết quả dù chưa hề tính ra con số cuối cùng.", wonder: "Hai số lẻ cộng lại luôn chẵn, đôi khi chẵn hay không thể biết? Con hãy thử vài ví dụ trước.",
      ideaTitle: "Ghép cặp để nhìn ra bất biến", idea: "Số chẵn chia được thành các cặp. Hai số lẻ mỗi số còn dư một; ghép hai phần dư lại thành một cặp nên tổng trở thành chẵn.",
      representations: [{ label: "Chẵn + chẵn", value: "C", note: "vẫn chẵn" }, { label: "Lẻ + lẻ", value: "C", note: "hai phần dư ghép cặp" }, { label: "Chẵn + lẻ", value: "L", note: "còn một phần dư" }],
      model: { prompt: "Không tính: 137 + 245 là chẵn hay lẻ?", steps: ["137 là số lẻ vì tận cùng bằng 7.", "245 là số lẻ vì tận cùng bằng 5.", "Lẻ cộng lẻ luôn cho kết quả chẵn.", "Tính kiểm tra: 137 + 245 = 382, đúng là chẵn."], answer: "Kết quả là số chẵn." },
      practice: [
        p("Không tính đầy đủ: 428 + 317 là số chẵn hay lẻ?", "choice", "Lẻ", "428 chẵn, 317 lẻ.", "Chẵn cộng lẻ cho kết quả lẻ.", ["Chẵn", "Lẻ", "Không biết"], "Dự đoán"),
        p("Tổng của ba số lẻ là số chẵn hay lẻ?", "choice", "Lẻ", "Hai số lẻ đầu tạo số chẵn; cộng thêm một số lẻ.", "Lẻ + lẻ + lẻ = chẵn + lẻ = lẻ.", ["Chẵn", "Lẻ", "Luôn bằng 0"], "Khái quát"),
        p("Năm số liên tiếp có số giữa là 12. Tổng năm số đó bằng bao nhiêu?", "number", "60", "Hai cặp ở hai phía đều có tổng bằng 24.", "10 + 11 + 12 + 13 + 14 = 60; cũng có thể lấy 12 × 5.", undefined, "Cấu trúc đối xứng"),
        p("Một số lẻ cộng với 1 rồi nhân 3. Kết quả chắc chắn là gì?", "choice", "Số chẵn", "Số lẻ cộng 1 trở thành số chẵn.", "Chẵn nhân 3 vẫn là chẵn.", ["Số chẵn", "Số lẻ", "Không xác định"], "Hai bước"),
      ], reflection: "Con có thể dự đoán kết quả chẵn–lẻ trước khi tính trong tình huống nào ngoài bài học?",
    },
  ],
  calculation: [
    {
      id: "calculation-2", level: 2, levelName: "Nhà chiến lược", domain: "calculation", code: "MR-08", unit: "Phòng nhiều lối đi", title: "Một phép tính, ba con đường", goal: "So sánh nhiều cách tính và chọn chiến lược ngắn, rõ, ít sai.", prerequisite: "Biết tách số và dùng bù trừ trong tính nhẩm.",
      hook: "Cùng đến một đáp án nhưng có con đường dài, con đường ngắn và con đường giúp ta nhìn ra điều mới.", wonder: "36 × 7 có thể tính bằng 30 × 7 + 6 × 7. Con còn thấy cách tách nào khác?",
      ideaTitle: "Tách theo điều thuận lợi", idea: "Không có một cách tính tốt nhất cho mọi bài. Hãy nhìn số tròn chục, số có thể ghép thành 100 và các tích quen thuộc trước khi chọn cách.",
      representations: [{ label: "Tách", value: "36", note: "30 + 6" }, { label: "Nhân", value: "210", note: "30 × 7" }, { label: "Nhân", value: "42", note: "6 × 7" }, { label: "Ghép", value: "252", note: "kết quả" }],
      model: { prompt: "So sánh hai cách tính 36 × 7", steps: ["Cách 1: đặt tính theo hàng.", "Cách 2: tách 36 thành 30 + 6.", "Tính 30 × 7 = 210 và 6 × 7 = 42.", "Ghép 210 + 42 = 252; cách 2 giúp thấy rõ ý nghĩa của từng phần."], answer: "36 × 7 = 252." },
      practice: [
        p("Tính bằng cách tách: 42 × 6 = ?", "number", "252", "Tách 42 thành 40 + 2.", "40 × 6 + 2 × 6 = 240 + 12 = 252.", undefined, "Tách số"),
        p("Tính nhanh: 99 × 8 = ?", "number", "792", "Nghĩ 100 × 8 rồi bớt 1 × 8.", "800 − 8 = 792.", undefined, "Bù trừ"),
        p("Tính nhanh: 125 + 299 = ?", "number", "424", "Đổi 299 thành 300 − 1.", "125 + 300 − 1 = 424.", undefined, "Số gần tròn"),
        p("Cách nào thuận tiện nhất để tính 24 × 5?", "choice", "12 × 10", "Ghép một thừa số với 5 để tạo 10.", "24 × 5 = 12 × 2 × 5 = 12 × 10.", ["20 × 5 + 4", "12 × 10", "24 + 5", "25 × 5 − 1"], "Chọn đường"),
      ], reflection: "Con chọn chiến lược dựa vào đặc điểm nào của các con số?",
    },
    {
      id: "calculation-3", level: 3, levelName: "Nhà nghiên cứu nhỏ", domain: "calculation", code: "MR-14", unit: "Máy biến đổi", title: "Mật mã của phép toán", goal: "Tìm số chưa biết và kiểm tra bằng cách đi xuôi–đi ngược.", prerequisite: "Hiểu phép tính ngược và thứ tự thực hiện trong chuỗi đơn giản.",
      hook: "Mỗi chiếc máy toán học để lại dấu vết. Biết đầu ra, ta có thể tháo máy để tìm đầu vào.", wonder: "□ × 6 + 5 = 47. Con nên tháo +5 hay ×6 trước?",
      ideaTitle: "Tháo thao tác cuối cùng trước", idea: "Khi các thao tác xảy ra theo thứ tự, ta đi ngược và dùng phép tính ngược. Mỗi bước chỉ tháo một lớp để tránh đoán mò.",
      representations: [{ label: "Đầu vào", value: "?", note: "×6" }, { label: "Giữa", value: "42", note: "+5" }, { label: "Đầu ra", value: "47", note: "đi ngược" }, { label: "Tìm được", value: "7", note: "kiểm tra" }],
      model: { prompt: "Tìm □ trong □ × 6 + 5 = 47", steps: ["Thao tác cuối là +5, tháo bằng 47 − 5 = 42.", "Thao tác trước là ×6, tháo bằng 42 : 6 = 7.", "Đi xuôi để kiểm tra: 7 × 6 + 5.", "Kết quả bằng 47 nên số tìm được đúng."], answer: "Ô vuông bằng 7." },
      practice: [
        p("Tìm số: □ × 4 + 3 = 35", "number", "8", "Lấy 35 − 3 rồi chia 4.", "35 − 3 = 32; 32 : 4 = 8.", undefined, "Tháo máy"),
        p("Tìm số: 72 : □ = 8", "number", "9", "Số chia nhân với thương bằng số bị chia.", "72 : 9 = 8.", undefined, "Quan hệ ngược"),
        p("Một máy lấy số vào, cộng 7 rồi nhân 2. Đầu ra là 30. Đầu vào là bao nhiêu?", "number", "8", "Đi ngược: chia 2 trước, rồi trừ 7.", "30 : 2 = 15; 15 − 7 = 8.", undefined, "Đúng thứ tự"),
        p("Biểu thức nào bằng 84?", "choice", "(10 + 4) × 6", "Tính trong ngoặc trước.", "14 × 6 = 84.", ["10 + 4 × 6", "(10 + 4) × 6", "10 × 4 + 6", "10 × (4 + 6)"], "Đọc cấu trúc"),
      ], reflection: "Vì sao đi ngược sai thứ tự có thể cho một đáp án khác?",
    },
  ],
  measurement: [
    {
      id: "measurement-2", level: 2, levelName: "Nhà chiến lược", domain: "measurement", code: "MR-09", unit: "Xưởng thiết kế", title: "Thiết kế trong giới hạn", goal: "Kết hợp độ dài, thời gian và tiền để lập kế hoạch thỏa điều kiện.", prerequisite: "Đổi đơn vị và giải bài toán hai bước.",
      hook: "Một thiết kế hay không chỉ đúng số đo; nó còn phải vừa thời gian, vừa vật liệu và vừa ngân sách.", wonder: "Có 30 cm dây làm khung chữ nhật dài 9 cm. Khung rộng nhất được bao nhiêu?",
      ideaTitle: "Biến giới hạn thành phương trình bằng lời", idea: "Hãy xác định tổng có thể dùng, phần đã dùng và phần còn lại. Luôn đổi về cùng một đơn vị trước khi tính.",
      representations: [{ label: "Tổng dây", value: "30", note: "cm" }, { label: "Nửa khung", value: "15", note: "cm" }, { label: "Chiều dài", value: "9", note: "cm" }, { label: "Chiều rộng", value: "6", note: "cm" }],
      model: { prompt: "Dùng 30 cm dây làm khung dài 9 cm", steps: ["Dây quanh khung chính là chu vi 30 cm.", "Nửa chu vi: 30 : 2 = 15 cm.", "Chiều rộng: 15 − 9 = 6 cm.", "Kiểm tra: (9 + 6) × 2 = 30 cm."], answer: "Khung rộng 6 cm." },
      practice: [
        p("Có 40 cm dây làm khung vuông. Mỗi cạnh dài bao nhiêu?", "number", "10", "Bốn cạnh bằng nhau.", "40 : 4 = 10 cm.", undefined, "Chia vật liệu"),
        p("Một chuyến đi bắt đầu 8:20, đi 45 phút và nghỉ 15 phút. Kết thúc lúc nào?", "choice", "9:20", "Cộng tổng 60 phút.", "45 + 15 = 60 phút; 8:20 + 60 phút = 9:20.", ["8:50", "9:05", "9:20", "9:35"], "Lập lịch"),
        p("Có 100 000 đồng, mua 3 quyển vở giá 18 000 đồng/quyển. Còn lại bao nhiêu đồng?", "number", "46000", "Tính tổng tiền mua trước.", "3 × 18 000 = 54 000; còn 100 000 − 54 000 = 46 000 đồng.", undefined, "Ngân sách"),
        p("Ba đoạn dây 85 cm nối liền nhau, mỗi mối nối chồng 5 cm. Sợi dây mới dài bao nhiêu?", "number", "245", "Ba đoạn tạo hai mối nối.", "Tổng 255 cm, hai mối chồng mất 10 cm nên còn 245 cm.", undefined, "Điều kiện ẩn"),
      ], reflection: "Trong một bài có nhiều đơn vị hoặc giới hạn, bước kiểm tra nào giúp con tránh sai nhất?",
    },
    {
      id: "measurement-3", level: 3, levelName: "Nhà nghiên cứu nhỏ", domain: "measurement", code: "MR-15", unit: "Phòng tối ưu", title: "Cùng hàng rào, khu nào rộng nhất?", goal: "Thử nhiều phương án và chọn phương án tốt nhất trong một giới hạn.", prerequisite: "Tính chu vi, diện tích và liệt kê cặp số.",
      hook: "Cùng một lượng hàng rào, cách sắp xếp khác nhau có thể tạo ra khoảng sân rộng rất khác nhau.", wonder: "Có 20 m hàng rào. Hình 1×9, 2×8, 3×7, 4×6 hay 5×5 cho diện tích lớn nhất?",
      ideaTitle: "Thử có hệ thống rồi so sánh", idea: "Khi tổng chiều dài và chiều rộng cố định, hãy liệt kê từng cặp. Tính diện tích của mỗi cặp để tìm phương án tối ưu thay vì đoán bằng mắt.",
      representations: [{ label: "1×9", value: "9", note: "m²" }, { label: "2×8", value: "16", note: "m²" }, { label: "3×7", value: "21", note: "m²" }, { label: "4×6", value: "24", note: "m²" }, { label: "5×5", value: "25", note: "m²" }],
      model: { prompt: "Tối ưu khu đất với 20 m hàng rào", steps: ["Nửa chu vi là 10 nên dài + rộng = 10.", "Liệt kê 1+9, 2+8, 3+7, 4+6, 5+5.", "Tính diện tích: 9, 16, 21, 24, 25.", "Chọn diện tích lớn nhất và kiểm tra lại chu vi."], answer: "Hình 5×5 rộng nhất: 25 m²." },
      practice: [
        p("Có 24 m hàng rào làm hình chữ nhật. Hình nào có diện tích lớn nhất?", "choice", "6×6", "Nửa chu vi là 12; hai cạnh càng gần nhau càng tốt.", "6×6 có diện tích 36 m², lớn nhất.", ["1×11", "2×10", "4×8", "6×6"], "Tối ưu"),
        p("Hai hình 3×7 và 4×6 cùng chu vi 20. Diện tích hình nào lớn hơn?", "choice", "4×6", "So sánh 3×7 và 4×6.", "21 < 24 nên hình 4×6 lớn hơn.", ["3×7", "4×6", "Bằng nhau"], "So sánh phương án"),
        p("Một hộp chứa 1 lít. Rót đều vào 4 cốc. Mỗi cốc có bao nhiêu mi-li-lít?", "number", "250", "1 lít = 1 000 ml.", "1 000 : 4 = 250 ml.", undefined, "Phân chia"),
        p("Một đường dài 2 km. An đã đi 750 m. An còn đi bao nhiêu mét?", "number", "1250", "Đổi 2 km thành mét.", "2 000 − 750 = 1 250 m.", undefined, "Mô hình quãng đường"),
      ], reflection: "Từ các thử nghiệm, con rút ra nhận xét gì về hai cạnh của hình có diện tích lớn nhất?",
    },
  ],
  geometry: [
    {
      id: "geometry-2", level: 2, levelName: "Nhà chiến lược", domain: "geometry", code: "MR-10", unit: "Xưởng cắt ghép", title: "Cắt, ghép và điều không đổi", goal: "Theo dõi diện tích, chu vi và đối xứng khi hình được biến đổi.", prerequisite: "Hiểu ô vuông đơn vị, chu vi và diện tích.",
      hook: "Cắt một hình rồi ghép lại có thể làm hình dáng đổi hẳn, nhưng không phải mọi đại lượng đều thay đổi.", wonder: "Cắt một hình chữ nhật thành hai phần rồi ghép không chồng lên nhau: tổng diện tích có đổi không?",
      ideaTitle: "Phần bên trong được bảo toàn", idea: "Nếu không bỏ, không thêm và không chồng mảnh, tổng diện tích giữ nguyên. Chu vi có thể đổi vì các cạnh tiếp xúc thay đổi.",
      representations: [{ label: "Trước", value: "12", note: "ô vuông" }, { label: "Cắt", value: "5+7", note: "ô vuông" }, { label: "Ghép", value: "12", note: "không đổi" }],
      model: { prompt: "Hai mảnh diện tích 5 và 7 ô ghép lại", steps: ["Đếm diện tích từng mảnh: 5 và 7.", "Ghép không chồng, không bỏ mảnh.", "Cộng diện tích 5 + 7.", "Hình dáng mới có thể khác nhưng phần phủ kín vẫn là 12 ô."], answer: "Diện tích hình ghép là 12 ô vuông." },
      practice: [
        p("Lưới 2×2 có bao nhiêu hình vuông tất cả?", "number", "5", "Đếm 4 hình nhỏ và hình lớn bao quanh.", "Có 4 hình 1×1 và 1 hình 2×2: tổng 5.", undefined, "Đếm không sót"),
        p("Một hình diện tích 18 ô được cắt thành hai mảnh. Một mảnh 7 ô. Mảnh kia có bao nhiêu ô?", "number", "11", "Tổng diện tích không đổi.", "18 − 7 = 11 ô.", undefined, "Bảo toàn"),
        p("Hình nào chắc chắn có ít nhất một trục đối xứng?", "choice", "Hình vuông", "Tưởng tượng gấp hình thành hai nửa trùng nhau.", "Hình vuông có bốn trục đối xứng.", ["Một tam giác bất kỳ", "Hình vuông", "Một tứ giác bất kỳ", "Hình chữ L"], "Đối xứng"),
        p("Có 6 ô vuông. Lập được bao nhiêu hình chữ nhật khác kích thước?", "number", "2", "Tìm các cặp số có tích 6.", "Các cặp 1×6 và 2×3 nên có 2 hình.", undefined, "Cấu hình"),
      ], reflection: "Sau khi cắt ghép, đại lượng nào chắc chắn giữ nguyên và đại lượng nào có thể đổi?",
    },
    {
      id: "geometry-3", level: 3, levelName: "Nhà nghiên cứu nhỏ", domain: "geometry", code: "MR-16", unit: "Phòng đếm hình", title: "Đếm hình không bỏ sót", goal: "Dùng kích thước và vị trí để đếm hình theo một trật tự.", prerequisite: "Nhận biết hình vuông, hình chữ nhật trên lưới.",
      hook: "Những hình lớn thường được tạo từ nhiều hình nhỏ và rất dễ trốn khỏi mắt khi ta đếm vội.", wonder: "Lưới 2×3 có 6 ô nhỏ, nhưng có tất cả bao nhiêu hình chữ nhật?",
      ideaTitle: "Đếm theo kích thước", idea: "Liệt kê hình 1×1 trước, sau đó 1×2, 1×3, 2×1, 2×2 và 2×3. Mỗi nhóm được đếm theo vị trí để không lặp.",
      representations: [{ label: "1×1", value: "6", note: "hình" }, { label: "1×2", value: "4", note: "hình" }, { label: "1×3", value: "2", note: "hình" }, { label: "2×1", value: "3", note: "hình" }, { label: "2×2 & 2×3", value: "3", note: "hình" }],
      model: { prompt: "Đếm hình chữ nhật trong lưới 2×3", steps: ["Đếm theo kích thước, không theo cảm giác.", "Có 6 hình 1×1; 4 hình 1×2; 2 hình 1×3.", "Có 3 hình 2×1; 2 hình 2×2; 1 hình 2×3.", "Cộng 6 + 4 + 2 + 3 + 2 + 1."], answer: "Có tất cả 18 hình chữ nhật." },
      practice: [
        p("Lưới 1×4 có bao nhiêu hình chữ nhật tất cả?", "number", "10", "Đếm độ dài 1, 2, 3 và 4 ô.", "Có 4 + 3 + 2 + 1 = 10 hình.", undefined, "Theo kích thước"),
        p("Lưới 3×3 có bao nhiêu hình vuông tất cả?", "number", "14", "Đếm hình 1×1, 2×2 và 3×3.", "9 + 4 + 1 = 14 hình vuông.", undefined, "Nhiều cỡ"),
        p("Một hình vuông có hai đường chéo. Có bao nhiêu tam giác nhỏ nhất quanh tâm?", "number", "4", "Hai đường chéo cắt nhau tại tâm.", "Bốn cạnh và tâm tạo bốn tam giác nhỏ nhất.", undefined, "Tưởng tượng"),
        p("Ghép 5 hình vuông thành một hàng. Chu vi hình ghép là bao nhiêu đơn vị?", "number", "12", "Hình ghép là hình chữ nhật 1×5.", "Chu vi (1 + 5) × 2 = 12.", undefined, "Đổi góc nhìn"),
      ], reflection: "Quy tắc đếm theo kích thước giúp con phát hiện những hình lớn ẩn ở đâu?",
    },
  ],
  data: [
    {
      id: "data-2", level: 2, levelName: "Nhà chiến lược", domain: "data", code: "MR-11", unit: "Cây khả năng", title: "Không trùng, không sót", goal: "Dùng bảng hoặc cây khả năng để liệt kê mọi kết quả.", prerequisite: "Biết nhân trong các tình huống chọn độc lập.",
      hook: "Đếm khả năng bằng trí nhớ rất dễ trùng. Một cái cây nhỏ có thể giữ hộ ta mọi nhánh.", wonder: "Có 2 con đường đến công viên và 3 con đường từ công viên đến thư viện. Có bao nhiêu hành trình?",
      ideaTitle: "Mỗi lựa chọn mở ra các nhánh mới", idea: "Vẽ hoặc tưởng tượng từng lựa chọn ở bước đầu. Từ mỗi nhánh, nối với tất cả lựa chọn của bước sau rồi đếm lá cuối cùng.",
      representations: [{ label: "Bước 1", value: "2", note: "đường" }, { label: "Bước 2", value: "3", note: "đường" }, { label: "Tổng", value: "6", note: "hành trình" }],
      model: { prompt: "2 đường rồi 3 đường", steps: ["Chọn đường A ở bước đầu: có 3 cách tiếp.", "Chọn đường B: cũng có 3 cách tiếp.", "Liệt kê A1, A2, A3, B1, B2, B3.", "Có thể tính gọn 2 × 3."], answer: "Có 6 hành trình." },
      practice: [
        p("Có 3 món chính và 2 món tráng miệng. Chọn mỗi loại một món có bao nhiêu cách?", "number", "6", "Mỗi món chính đi với cả 2 món tráng miệng.", "3 × 2 = 6 cách.", undefined, "Hai bước chọn"),
        p("Tung hai đồng xu. Có bao nhiêu kết quả theo thứ tự?", "number", "4", "Liệt kê: sấp-sấp, sấp-ngửa, ngửa-sấp, ngửa-ngửa.", "Có 2 × 2 = 4 kết quả.", undefined, "Cây khả năng"),
        p("Dùng 1, 2, 3 lập số có hai chữ số khác nhau. Có bao nhiêu số?", "number", "6", "Có 3 cách chọn hàng chục, rồi 2 cách chọn hàng đơn vị.", "3 × 2 = 6 số.", undefined, "Không lặp"),
        p("Có 2 mũ, 3 áo và 2 quần. Chọn mỗi loại một món có bao nhiêu bộ?", "number", "12", "Nhân số lựa chọn ở cả ba bước.", "2 × 3 × 2 = 12 bộ.", undefined, "Ba tầng"),
      ], reflection: "Khi nào phép nhân giúp đếm nhanh, và khi nào con vẫn nên liệt kê để kiểm tra?",
    },
    {
      id: "data-3", level: 3, levelName: "Nhà nghiên cứu nhỏ", domain: "data", code: "MR-17", unit: "Phòng thí nghiệm công bằng", title: "Có thể, chắc chắn hay chỉ may mắn?", goal: "So sánh khả năng và hiểu kết quả ít lần chưa chứng minh một quy luật.", prerequisite: "Đọc bảng dữ liệu và liệt kê kết quả có thể.",
      hook: "Một đồng xu ra ngửa ba lần liền không có nghĩa lần sau chắc chắn phải ra sấp.", wonder: "Túi có 3 bi đỏ và 1 bi xanh. Nhắm mắt lấy một viên, màu nào dễ xuất hiện hơn?",
      ideaTitle: "Nhiều kết quả thuận lợi hơn nghĩa là dễ xảy ra hơn", idea: "Hãy đếm các kết quả có thể. Thử nghiệm ít lần có thể lệch do may mắn; làm nhiều lần thường cho bức tranh ổn định hơn.",
      representations: [{ label: "Bi đỏ", value: "3", note: "phần" }, { label: "Bi xanh", value: "1", note: "phần" }, { label: "Dễ hơn", value: "Đỏ", note: "3 so với 1" }],
      model: { prompt: "Chọn ngẫu nhiên từ 3 đỏ, 1 xanh", steps: ["Có 4 viên có khả năng được lấy.", "Ba kết quả cho màu đỏ, một kết quả cho màu xanh.", "Đỏ có nhiều kết quả thuận lợi hơn.", "Tuy vậy một lần lấy vẫn có thể ra xanh."], answer: "Màu đỏ dễ xuất hiện hơn." },
      practice: [
        p("Túi có 2 bi vàng và 5 bi tím. Màu nào dễ lấy được hơn?", "choice", "Tím", "So sánh số viên của mỗi màu.", "Có 5 bi tím nhưng chỉ 2 bi vàng.", ["Vàng", "Tím", "Bằng nhau", "Không màu nào"], "So sánh khả năng"),
        p("Một vòng quay có 4 phần bằng nhau: 2 đỏ, 1 xanh, 1 vàng. Màu đỏ có khả năng thế nào so với màu xanh?", "choice", "Gấp đôi", "Đỏ chiếm 2 phần, xanh chiếm 1 phần.", "2 phần so với 1 phần nên đỏ gấp đôi xanh.", ["Bằng nhau", "Gấp đôi", "Bằng một nửa", "Không thể biết"], "Tỉ lệ trực quan"),
        p("Tung đồng xu 20 lần có chắc chắn đúng 10 lần ngửa không?", "choice", "Không", "Công bằng không có nghĩa mỗi nhóm nhỏ luôn chia đều.", "Có thể gần 10 nhưng không chắc chắn đúng 10.", ["Có", "Không"], "Không kết luận vội"),
        p("Muốn biết đồng xu có công bằng không, cách nào tốt hơn?", "choice", "Tung nhiều lần và ghi kết quả", "Cần dữ liệu từ nhiều lần thử.", "Nhiều lần thử cho bằng chứng đáng tin cậy hơn một vài lần.", ["Nhìn màu đồng xu", "Tung một lần", "Tung nhiều lần và ghi kết quả", "Hỏi một người đoán"], "Thiết kế thử nghiệm"),
      ], reflection: "Vì sao một kết quả bất ngờ trong vài lần thử chưa đủ để kết luận trò chơi không công bằng?",
    },
  ],
  word: [
    {
      id: "word-2", level: 2, levelName: "Nhà chiến lược", domain: "word", code: "MR-12", unit: "Phòng giả sử", title: "Giả sử rồi điều chỉnh", goal: "Dùng một giả sử đơn giản để giải bài toán có hai loại đối tượng.", prerequisite: "Nhân, trừ và hiểu chênh lệch giữa hai loại.",
      hook: "Đôi khi một giả sử sai có chủ đích lại là con đường nhanh nhất đến đáp án đúng.", wonder: "Có 5 con gồm gà và thỏ, 14 chân. Nếu giả sử tất cả là gà, ta thiếu bao nhiêu chân?",
      ideaTitle: "Bắt đầu từ trường hợp dễ nhất", idea: "Giả sử tất cả đều là loại đơn giản hơn. So sánh với dữ kiện thật rồi đổi từng đối tượng; mỗi lần đổi làm tổng thay đổi một lượng cố định.",
      representations: [{ label: "5 con gà", value: "10", note: "chân" }, { label: "Thực tế", value: "14", note: "chân" }, { label: "Thiếu", value: "4", note: "chân" }, { label: "Mỗi lần đổi", value: "+2", note: "chân" }, { label: "Thỏ", value: "2", note: "con" }],
      model: { prompt: "5 con gà và thỏ có 14 chân", steps: ["Giả sử cả 5 đều là gà: có 5 × 2 = 10 chân.", "Thực tế nhiều hơn 14 − 10 = 4 chân.", "Đổi một gà thành một thỏ tăng 2 chân.", "Cần 4 : 2 = 2 lần đổi."], answer: "Có 2 con thỏ và 3 con gà." },
      practice: [
        p("Có 6 con gà và thỏ, tổng 18 chân. Có bao nhiêu thỏ?", "number", "3", "Giả sử cả 6 đều là gà được 12 chân.", "Thiếu 6 chân; mỗi thỏ tăng 2 chân nên có 3 thỏ.", undefined, "Giả sử"),
        p("Có 7 đồng tiền loại 5 nghìn và 10 nghìn, tổng 50 nghìn. Có bao nhiêu đồng 10 nghìn?", "number", "3", "Giả sử cả 7 đồng đều là 5 nghìn.", "Giả sử được 35 nghìn, thiếu 15 nghìn; mỗi lần đổi tăng 5 nghìn nên có 3 đồng 10 nghìn.", undefined, "Điều chỉnh"),
        p("Có 8 xe đạp hai bánh và xe ba bánh, tổng 20 bánh. Có bao nhiêu xe ba bánh?", "number", "4", "Giả sử tất cả đều là xe hai bánh.", "Tám xe hai bánh có 16 bánh, thiếu 4; mỗi xe ba bánh tăng 1 nên có 4 xe.", undefined, "Chênh lệch 1"),
        p("Có 5 túi, loại nhỏ 3 viên và loại lớn 5 viên, tổng 19 viên. Có bao nhiêu túi lớn?", "number", "2", "Giả sử cả 5 túi đều nhỏ.", "Năm túi nhỏ có 15 viên, thiếu 4; mỗi túi lớn tăng 2 nên có 2 túi lớn.", undefined, "Mô hình mới"),
      ], reflection: "Một giả sử sai có ích khi nó giúp ta biết chính xác cần điều chỉnh bao nhiêu như thế nào?",
    },
    {
      id: "word-3", level: 3, levelName: "Nhà nghiên cứu nhỏ", domain: "word", code: "MR-18", unit: "Bài toán mở", title: "Một đề bài, nhiều lời giải", goal: "Tìm đủ nghiệm thỏa điều kiện và chứng minh không bỏ sót.", prerequisite: "Liệt kê có hệ thống và kiểm tra nhiều điều kiện cùng lúc.",
      hook: "Có bài toán không hỏi một đáp án duy nhất. Thử thách thật sự là tìm đủ mọi khả năng.", wonder: "Dùng đồng 2 nghìn và 5 nghìn để có đúng 12 nghìn. Có bao nhiêu cách?",
      ideaTitle: "Thay đổi một đại lượng theo thứ tự", idea: "Bắt đầu từ một loại, tăng dần số lượng của loại kia và kiểm tra tổng. Dừng khi vượt giới hạn; như vậy ta biết mình đã xét hết.",
      representations: [{ label: "6×2", value: "12", note: "nghìn" }, { label: "1×2 + 2×5", value: "12", note: "nghìn" }, { label: "Tổng", value: "2", note: "cách" }],
      model: { prompt: "Tạo 12 nghìn từ đồng 2 và 5 nghìn", steps: ["Không dùng đồng 5: cần 6 đồng 2, được một cách.", "Dùng một đồng 5 để lại 7, không tạo được chỉ bằng đồng 2.", "Dùng hai đồng 5 để lại 2, dùng thêm một đồng 2.", "Ba đồng 5 đã vượt 12 nên dừng."], answer: "Có 2 cách." },
      practice: [
        p("Dùng đồng 2 nghìn và 5 nghìn tạo đúng 10 nghìn. Có bao nhiêu cách?", "number", "2", "Xét dùng 0, 1 rồi 2 đồng 5 nghìn.", "Năm đồng 2 hoặc hai đồng 5: có 2 cách.", undefined, "Tìm đủ nghiệm"),
        p("Có bao nhiêu cặp số tự nhiên dương có tổng bằng 8? Không tính đổi chỗ.", "number", "4", "Liệt kê từ số nhỏ nhất: 1+7, 2+6…", "Các cặp là 1+7, 2+6, 3+5, 4+4: có 4.", undefined, "Không tính trùng"),
        p("Hình chữ nhật có chu vi 16 đơn vị. Có bao nhiêu cặp cạnh nguyên dương? Không tính đổi chỗ.", "number", "4", "Nửa chu vi là 8; tìm cặp tổng 8.", "Các cặp 1×7, 2×6, 3×5, 4×4: có 4.", undefined, "Chuyển mô hình"),
        p("Số có hai chữ số, tổng hai chữ số bằng 7. Có bao nhiêu số như vậy?", "number", "7", "Hàng chục không thể là 0.", "Các số 16, 25, 34, 43, 52, 61, 70: có 7.", undefined, "Ràng buộc chữ số"),
      ], reflection: "Con làm thế nào để chứng minh mình đã tìm đủ lời giải, không chỉ tìm được vài lời giải?",
    },
  ],
};

export const MISSION_LIBRARY: Record<DomainId, Mission[]> = {
  number: [asMission(LESSONS.number, "number-1", 1, "Nhà khám phá"), ...advanced.number],
  calculation: [asMission(LESSONS.calculation, "calculation-1", 1, "Nhà khám phá"), ...advanced.calculation],
  measurement: [asMission(LESSONS.measurement, "measurement-1", 1, "Nhà khám phá"), ...advanced.measurement],
  geometry: [asMission(LESSONS.geometry, "geometry-1", 1, "Nhà khám phá"), ...advanced.geometry],
  data: [asMission(LESSONS.data, "data-1", 1, "Nhà khám phá"), ...advanced.data],
  word: [asMission(LESSONS.word, "word-1", 1, "Nhà khám phá"), ...advanced.word],
};

export const ALL_MISSIONS = Object.values(MISSION_LIBRARY).flat();

export const DAILY_PUZZLES: DailyPuzzle[] = [
  { id: "tiles-12", prompt: "12 viên gạch xếp được bao nhiêu hình chữ nhật khác kích thước?", note: "Không tính hình xoay lại", options: ["2", "3", "4", "6"], answer: "3", hint: "Tìm các cặp số có tích 12.", explanation: "Các hình là 1×12, 2×6 và 3×4: có 3 hình." },
  { id: "odd-sum", prompt: "Ba số lẻ cộng lại cho kết quả chắc chắn là gì?", note: "Không cần tính số cụ thể", options: ["Chẵn", "Lẻ", "Có thể cả hai"], answer: "Lẻ", hint: "Hai số lẻ đầu tiên cộng lại thành số chẵn.", explanation: "Lẻ + lẻ = chẵn; chẵn + lẻ = lẻ." },
  { id: "outfit", prompt: "2 mũ và 3 áo tạo được bao nhiêu cách chọn một mũ, một áo?", note: "Hãy tưởng tượng cây khả năng", options: ["5", "6", "8", "9"], answer: "6", hint: "Mỗi chiếc mũ đi với cả 3 chiếc áo.", explanation: "2 × 3 = 6 cách." },
  { id: "perimeter", prompt: "Hai hình 2×6 và 3×4 cùng diện tích 12. Hình nào có chu vi nhỏ hơn?", note: "Tính rồi so sánh", options: ["2×6", "3×4", "Bằng nhau"], answer: "3×4", hint: "Tính (dài + rộng) × 2.", explanation: "2×6 có chu vi 16; 3×4 có chu vi 14." },
  { id: "machine", prompt: "Một số nhân 4 rồi cộng 3 được 31. Số đó là bao nhiêu?", note: "Tháo máy từ cuối", options: ["6", "7", "8", "9"], answer: "7", hint: "Lấy 31 trừ 3 rồi chia 4.", explanation: "31 − 3 = 28; 28 : 4 = 7." },
  { id: "quick", prompt: "Cách nào tính 98 + 47 nhanh nhất?", note: "Tìm số tròn trăm", options: ["100 + 45", "90 + 47", "98 + 40", "100 + 47"], answer: "100 + 45", hint: "Chuyển 2 đơn vị từ 47 sang 98.", explanation: "98 + 47 = 100 + 45 = 145." },
  { id: "survey", prompt: "Hỏi 5 bạn và cả 5 thích cờ vua. Điều gì chắc chắn đúng?", note: "Chỉ dùng bằng chứng đã có", options: ["Cả lớp thích", "5 bạn được hỏi thích", "Cả trường thích"], answer: "5 bạn được hỏi thích", hint: "Không kết luận vượt quá nhóm đã khảo sát.", explanation: "Dữ liệu chỉ cho biết chắc về 5 bạn được hỏi." },
];
