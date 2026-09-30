// Bài mẫu riêng cho 18 nhiệm vụ mở rộng (chặng 4–6 của mỗi miền).
// Trước đây bài mẫu, bài Tương tác và câu luyện số 1 của các nhiệm vụ này là CÙNG một câu,
// nên con đã thấy lời giải trước khi "tự mình thử". Mỗi bài mẫu dưới đây dùng số liệu khác
// với mọi câu luyện và bài Tương tác của nhiệm vụ (bộ kiểm định chặn việc trùng lặp).

export type ModelSpec = { prompt: string; steps: string[]; answer: string };

export const EXTENSION_MODELS: Record<string, ModelSpec> = {
  "number-4": {
    prompt: "Dãy 4, 9, 14, 20, 24 có một số bị chép sai. Tìm và sửa số đó.",
    steps: ["Tính các khoảng cách: 9 − 4 = 5; 14 − 9 = 5; 20 − 14 = 6; 24 − 20 = 4.", "Hai khoảng cách lạ (6 và 4) cùng dính tới số 20.", "Thử thay 20 bằng 19: các khoảng cách thành 5, 5, 5, 5.", "Kiểm tra lại cả dãy 4, 9, 14, 19, 24."],
    answer: "Số bị chép sai là 20; số đúng là 19.",
  },
  "number-5": {
    prompt: "Hôm nay là thứ Tư. Sau 17 ngày là thứ mấy?",
    steps: ["Một tuần có 7 ngày: sau 7 ngày, thứ lặp lại.", "17 ngày = 14 ngày + 3 ngày; 14 ngày là hai tuần trọn vẹn.", "Từ thứ Tư tiến 3 ngày: thứ Năm, thứ Sáu, thứ Bảy.", "Kiểm tra: 17 chia 7 được 2 dư 3."],
    answer: "Sau 17 ngày là thứ Bảy.",
  },
  "number-6": {
    prompt: "Dãy bắt đầu 3, mỗi bước nhân 2 rồi trừ 1. Viết bốn số đầu.",
    steps: ["Bước 1: 3 × 2 − 1 = 5.", "Bước 2: 5 × 2 − 1 = 9.", "Bước 3: 9 × 2 − 1 = 17.", "Đưa luật cho một bạn khác: bạn ấy phải viết ra đúng dãy này."],
    answer: "Bốn số đầu là 3, 5, 9, 17.",
  },
  "calculation-4": {
    prompt: "Tính nhanh 297 + 58.",
    steps: ["297 còn thiếu 3 để thành 300.", "Chuyển 3 từ 58 sang 297: 297 + 3 = 300 và 58 − 3 = 55.", "Tổng không đổi vì chỉ chuyển 3 đơn vị từ số này sang số kia.", "Tính 300 + 55."],
    answer: "297 + 58 = 300 + 55 = 355.",
  },
  "calculation-5": {
    prompt: "612 + 279 gần 800, 900 hay 1 000 nhất?",
    steps: ["612 gần 600 (chữ số hàng chục là 1).", "279 gần 300 (chữ số hàng chục là 7).", "600 + 300 = 900.", "Kiểm tra: tổng chính xác là 891, đúng là gần 900."],
    answer: "612 + 279 gần 900 nhất.",
  },
  "calculation-6": {
    prompt: "Tạo ba biểu thức khác nhau có kết quả 60.",
    steps: ["Bắt đầu từ đích 60 rồi nghĩ ngược lại.", "Dùng phép nhân: 6 × 10 = 60.", "Dùng phép trừ: 100 − 40 = 60.", "Dùng phép cộng: 35 + 25 = 60. Tính lại từng biểu thức để kiểm tra."],
    answer: "Ví dụ: 6 × 10, 100 − 40 và 35 + 25.",
  },
  "measurement-4": {
    prompt: "Mỗi ô trên sơ đồ biểu diễn 4 m. Con đường dài 9 ô thì ngoài thực tế dài bao nhiêu mét?",
    steps: ["Mỗi ô ứng với 4 m thật.", "9 ô là 9 lần 4 m.", "9 × 4 = 36.", "Kiểm tra: 10 ô là 40 m, bớt một ô còn 36 m."],
    answer: "Con đường dài 36 m.",
  },
  "measurement-5": {
    prompt: "Bắt đầu lúc 9:40, tập 45 phút. Kết thúc lúc nào?",
    steps: ["Từ 9:40 đến 10:00 là 20 phút.", "45 phút = 20 phút + 25 phút.", "10:00 thêm 25 phút là 10:25.", "Kiểm tra: từ 9:40 đến 10:25 là 20 + 25 = 45 phút."],
    answer: "Kết thúc lúc 10:25.",
  },
  "measurement-6": {
    prompt: "Có 60 000 đồng, mua 4 quyển vở giá 12 000 đồng. Còn lại bao nhiêu?",
    steps: ["Tính tiền mua trước: 4 × 12 000 = 48 000 đồng.", "So với số tiền có: 48 000 nhỏ hơn 60 000, nên đủ tiền.", "60 000 − 48 000 = 12 000.", "Kiểm tra: 48 000 + 12 000 = 60 000."],
    answer: "Còn lại 12 000 đồng.",
  },
  "geometry-4": {
    prompt: "Chữ H in hoa có mấy trục đối xứng?",
    steps: ["Gấp dọc ở giữa: nửa trái trùng khít nửa phải.", "Gấp ngang ở giữa: nửa trên trùng khít nửa dưới.", "Gấp chéo: hai nửa lệch nhau, nên không tính.", "Đếm các nếp gấp làm hai nửa trùng khít."],
    answer: "Chữ H có 2 trục đối xứng.",
  },
  "geometry-5": {
    prompt: "Các hình tam giác đều bằng nhau có lát kín mặt bàn được không?",
    steps: ["Xếp một hình xuôi, một hình ngược cạnh nhau: hai cạnh áp khít vào nhau.", "Cứ xen kẽ xuôi – ngược, ta được một dải thẳng không có khe.", "Xếp các dải sát nhau: cạnh thẳng ghép khít với cạnh thẳng.", "Kiểm tra: không chỗ nào hở, không chỗ nào chồng."],
    answer: "Được: tam giác đều lát kín mặt phẳng.",
  },
  "geometry-6": {
    prompt: "Với 30 ô vuông, hình chữ nhật nào có chu vi nhỏ nhất?",
    steps: ["Liệt kê các cặp cạnh có tích 30: 1×30, 2×15, 3×10, 5×6.", "Tính chu vi: 62, 34, 26 và 22.", "So sánh bốn kết quả.", "Nhận xét: hai cạnh càng gần nhau, chu vi càng nhỏ."],
    answer: "Hình 5×6 có chu vi nhỏ nhất: 22.",
  },
  "data-4": {
    prompt: "Hai cột có giá trị 97 và 100, nhưng trục dọc bắt đầu từ 95. Trên hình, hai cột trông thế nào?",
    steps: ["Trên hình, cột thứ nhất chỉ cao 97 − 95 = 2 ô.", "Cột thứ hai cao 100 − 95 = 5 ô.", "Nhìn bằng mắt, cột thứ hai cao hơn gấp đôi cột thứ nhất.", "Đọc số thì thấy chênh lệch thật chỉ là 100 − 97 = 3."],
    answer: "Hai cột trông chênh rất xa, nhưng giá trị thật chỉ chênh 3.",
  },
  "data-5": {
    prompt: "Túi có 3 bi đỏ và 2 bi xanh. Xếp loại ba sự kiện: rút được bi đỏ; rút được bi vàng; rút được bi có màu đỏ hoặc xanh.",
    steps: ["Liệt kê các kết quả có thể: đỏ hoặc xanh.", "Rút được bi đỏ: có lúc xảy ra, có lúc không — “có thể”.", "Rút được bi vàng: trong túi không có bi vàng — “không thể”.", "Rút được bi đỏ hoặc xanh: lần nào cũng xảy ra — “chắc chắn”."],
    answer: "Đỏ: có thể. Vàng: không thể. Đỏ hoặc xanh: chắc chắn.",
  },
  "data-6": {
    prompt: "Bạn An muốn biết trò chơi yêu thích của cả khối 3 nên định hỏi 5 bạn trong đội bóng. Nên sửa kế hoạch thế nào?",
    steps: ["Năm bạn cùng đội bóng có sở thích giống nhau: mẫu bị lệch.", "Hỏi nhiều bạn hơn, ở nhiều lớp, cả bạn nam và bạn nữ.", "Dùng câu hỏi trung lập: “Bạn thích trò chơi nào nhất?”", "Khi báo cáo, ghi rõ đã hỏi bao nhiêu bạn và chọn các bạn thế nào."],
    answer: "Hỏi nhiều bạn ở các lớp khác nhau bằng một câu hỏi trung lập.",
  },
  "word-4": {
    prompt: "Hiệu của hai số là 3. Đã đủ để tìm hai số chưa? Nếu thêm manh mối “tổng là 11” thì sao?",
    steps: ["Chỉ biết hiệu là 3: có 4 và 1, 5 và 2, 6 và 3, … nên chưa đủ.", "Thêm tổng là 11: thử các cặp có hiệu 3.", "5 và 2 có tổng 7; 6 và 3 có tổng 9; 7 và 4 có tổng 11.", "Kiểm tra: 7 − 4 = 3 và 7 + 4 = 11. Chỉ còn một cặp."],
    answer: "Thêm manh mối thứ hai thì xác định được: 7 và 4.",
  },
  "word-5": {
    prompt: "Tìm số: số đó × 4 + 3 = 31.",
    steps: ["Thử 5: 5 × 4 + 3 = 23, còn thiếu 8.", "Mỗi lần tăng số thử thêm 1 thì kết quả tăng thêm 4.", "Thiếu 8 tức là cần tăng số thử thêm 2: thử 7.", "Kiểm tra: 7 × 4 + 3 = 31."],
    answer: "Số cần tìm là 7.",
  },
  "word-6": {
    prompt: "Có bao nhiêu cặp số tự nhiên lớn hơn 0 có tổng 7, không tính đổi chỗ?",
    steps: ["Cho số thứ nhất tăng dần từ 1: 1 + 6.", "Tiếp tục: 2 + 5, rồi 3 + 4.", "Nếu lấy 4 thì được 4 + 3, trùng với cặp 3 + 4: dừng lại.", "Vì số thứ nhất đã chạy qua 1, 2, 3 theo thứ tự nên không sót cặp nào."],
    answer: "Có 3 cặp: 1 + 6, 2 + 5 và 3 + 4.",
  },
};
