// Bước "Thử trước khi được dạy": mỗi nhiệm vụ có hai nhận định TOÁN HỌC cụ thể để con chọn
// (một nhận định đúng và một ngộ nhận hay gặp), cùng lựa chọn "Con chưa chắc".
// Trước đây 35/36 nhiệm vụ dùng chung ba câu "Con đã có một dự đoán / có hơn một cách / chưa chắc",
// nên bước Dự đoán không có nội dung toán để kiểm chứng.
// Câu hỏi dự đoán là `wonder` của nhiệm vụ (bối cảnh khủng long); các nhận định dưới đây chỉ nói về
// con số và ý tưởng, nên khớp với cả câu chữ gốc lẫn câu chữ khủng long.

export const PREDICTION_UNSURE = "Con chưa chắc";

export type PredictionSpec = {
  /** Thứ tự hiển thị: hai nhận định rồi tới "Con chưa chắc". */
  options: [string, string];
  answer: string;
  /** Lời dẫn sang bước thử nghiệm, KHÔNG nêu đáp án đúng. */
  reveal: string;
};

const p = (right: string, misconception: string, reveal: string, rightFirst: boolean): PredictionSpec => ({
  options: rightFirst ? [right, misconception] : [misconception, right],
  answer: right,
  reveal,
});

export const PREDICTIONS: Record<string, PredictionSpec> = {
  "number-1": p("Khoảng cách lớn dần: 3, 5, 7, …", "Mỗi bước cộng thêm 3", "Hãy viết khoảng cách giữa từng cặp số cạnh nhau rồi xem dự đoán của con có khớp mọi bước không.", false),
  "number-2": p("4 mật mã, vì hàng trăm phải là 5 hoặc 8", "6 mật mã, vì ba thẻ xếp được 6 cách", "Hãy liệt kê theo từng chữ số hàng trăm và kiểm tra điều kiện “lớn hơn 500”.", true),
  "number-3": p("Luôn chẵn", "Đôi khi chẵn, tùy hai số", "Hãy thử vài cặp số lẻ, rồi tìm lý do đúng cho MỌI cặp chứ không chỉ các cặp đã thử.", false),
  "number-4": p("Xem thêm số thứ tư, thứ năm rồi thử từng quy luật", "Quy luật nào nghĩ ra trước thì chọn quy luật đó", "Một quy luật đáng tin phải khớp với mọi số đã cho. Ta sẽ kiểm tra bằng khoảng cách.", true),
  "number-5": p("Thứ Năm, vì 16 ngày là 2 tuần và 2 ngày", "Thứ Tư, vì đếm từ hôm nay", "Hãy tách số ngày thành các tuần trọn vẹn và phần còn dư.", false),
  "number-6": p("Có: ví dụ cộng 3 mãi, hoặc cộng 3, 3 rồi 4, 4, …", "Không: ba số đầu đã quyết định cả dãy", "Hãy thử viết tiếp dãy theo hai cách khác nhau rồi so số thứ tư.", true),
  "calculation-1": p("Biến 199 thành 200, rồi bớt 1 ở 48", "Phải đặt tính thì mới chắc đúng", "Ta sẽ kiểm tra xem chuyển 1 đơn vị giữa hai số có làm đổi tổng không.", true),
  "calculation-2": p("Có: ví dụ 40 × 7 − 4 × 7", "Không, chỉ có một cách tách", "Hãy thử tách theo số tròn chục gần nhất rồi so kết quả của hai cách.", false),
  "calculation-3": p("Tháo + 5 trước, vì nó được làm sau cùng", "Tháo × 6 trước, vì nó đứng trước", "Hãy thử cả hai thứ tự với một số nhỏ và xem thứ tự nào đưa về đúng số ban đầu.", true),
  "calculation-4": p("Vì chuyển 2 từ 57 sang 398 thì tổng không đổi", "Vì cả hai số đều được cộng thêm 2", "Hãy xem mỗi số hạng đã tăng hay giảm bao nhiêu.", false),
  "calculation-5": p("Gần 800", "Gần 700", "Hãy làm tròn từng số đến hàng trăm rồi cộng, sau đó so với dự đoán.", true),
  "calculation-6": p("Rất nhiều: 100 tách được thành tổng, hiệu, tích theo nhiều cách", "Chỉ vài biểu thức như 50 + 50", "Hãy thử tạo một biểu thức cho mỗi phép tính: cộng, trừ, nhân, chia.", false),
  "measurement-1": p("2 m, vì cửa cao hơn người lớn một chút", "20 m, vì cửa rất cao", "Hãy so với những thứ con đã biết: chiều cao của con, của người lớn, của một ngôi nhà.", true),
  "measurement-2": p("6 cm, vì nửa chu vi là 15 cm", "21 cm, vì 30 − 9 = 21", "Hãy nhớ dây phải đi hết một vòng quanh khung.", false),
  "measurement-3": p("5×5, vì hai cạnh bằng nhau", "1×9, vì có cạnh dài nhất", "Hãy tính diện tích của từng hình rồi so sánh.", true),
  "measurement-4": p("35 m, vì 7 ô, mỗi ô 5 m", "12 m, vì 7 + 5", "Hãy nghĩ xem mỗi ô trên bản đồ ứng với bao nhiêu mét thật.", false),
  "measurement-5": p("Chưa biết: còn tùy mỗi việc dài bao lâu, và phải tính cả 10 phút bay", "Chắc chắn vừa, vì 10 phút rất ngắn", "Hãy vẽ một trục thời gian và đặt từng việc lên đó, kể cả lúc di chuyển.", true),
  "measurement-6": p("Để riêng khoản dự phòng trước, rồi mới tính tiền mua", "Cứ mua cho hết, còn thừa bao nhiêu thì để dành", "Hãy xác định số tiền thật sự được tiêu trước khi chọn món.", false),
  "geometry-1": p("Không, hình gọn hơn có chu vi nhỏ hơn", "Có, vì cùng 12 ô", "Cùng diện tích chưa chắc cùng chu vi. Dự đoán này sẽ được kiểm tra bằng cách xếp đúng 12 ô theo ba cấu hình.", false),
  "geometry-2": p("Không đổi, vì không thêm, không bớt, không chồng", "Có đổi, vì hình mới trông khác", "Hãy đếm số ô trước và sau khi ghép.", true),
  "geometry-3": p("Nhiều hơn 6, vì còn các hình ghép từ nhiều ô", "Đúng 6, vì lưới có 6 ô", "Hãy thử tìm một hình chữ nhật gồm hai ô liền nhau.", false),
  "geometry-4": p("Không đổi: hình vuông trùng khít vị trí cũ", "Có đổi, vì các đỉnh đã đổi chỗ", "Hãy đánh dấu một góc rồi xoay tờ giấy hình vuông để kiểm tra đường bao.", true),
  "geometry-5": p("Vì cạnh thẳng ghép khít nhau, còn cạnh cong thì để hở", "Vì hình tròn nhỏ hơn hình vuông", "Hãy thử xếp bốn đồng xu sát nhau và nhìn vào chỗ ở giữa.", false),
  "geometry-6": p("4×6, vì hai cạnh gần nhau nhất", "1×24, vì chỉ có một hàng", "Hãy liệt kê mọi cặp cạnh có tích 24 rồi tính chu vi từng hình.", true),
  "data-1": p("Không chắc, vì mới hỏi 10 bạn", "Chắc, vì 6 nhiều hơn một nửa", "Hãy nghĩ xem 10 bạn được hỏi có đại diện cho tất cả không.", false),
  "data-2": p("6 hành trình, vì mỗi lối đầu đi tiếp được 3 lối", "5 hành trình, vì 2 + 3", "Hãy vẽ cây khả năng: từ mỗi lối đầu, nối với mọi lối sau.", true),
  "data-3": p("Đỏ, vì có 3 vỏ đỏ so với 1 vỏ xanh", "Như nhau, vì chỉ có hai màu", "Hãy đếm số vỏ của mỗi màu rồi so sánh.", false),
  "data-4": p("Có thể, nếu trục không bắt đầu từ 0", "Không thể: cột cao gấp đôi thì số cũng gấp đôi", "Hãy đọc con số trên trục trước khi tin vào chiều cao nhìn thấy.", true),
  "data-5": p("Không chắc: mỗi lần tung đều có thể sấp hoặc ngửa", "Chắc chắn, vì một nửa của 10 là 5", "Hãy thử tung thật 10 lần, ghi lại, rồi so với dự đoán.", false),
  "data-6": p("Không, vì cả đội có thể cùng thích một kiểu trò chơi", "Có, hỏi một đội là đủ", "Hãy nghĩ xem đội chạy có giống mọi bạn khác trên đảo không.", true),
  "word-1": p("Trừ 6 trước, rồi chia 4", "Chia 4 trước, rồi trừ 6", "Hãy thử cả hai thứ tự rồi kiểm tra bằng cách đi xuôi.", false),
  "word-2": p("Thiếu 4 chân, vì 5 con hai chân chỉ có 10 chân", "Thiếu 9 chân, vì 14 − 5 = 9", "Hãy tính số chân khi cả 5 con đều đi hai chân.", true),
  "word-3": p("2 cách: sáu đồng 2 nghìn, hoặc một đồng 2 nghìn và hai đồng 5 nghìn", "1 cách: chỉ dùng sáu đồng 2 nghìn", "Hãy cho số đồng 5 nghìn tăng dần từ 0 và kiểm tra phần còn lại.", false),
  "word-4": p("Chưa đủ, vì nhiều cặp số có tổng 10", "Đủ rồi: mỗi túi 5 viên", "Hãy thử viết ra vài cặp số có tổng 10.", true),
  "word-5": p("Giảm số đã thử, và dựa vào độ lệch để biết giảm bao nhiêu", "Thử lại một số bất kỳ khác", "Một lần thử sai vẫn cho thông tin: kết quả lệch bao nhiêu?", false),
  "word-6": p("Cần một thứ tự liệt kê và lý do để dừng", "Tìm được càng nhiều cách thì coi như đã đủ", "Hãy nghĩ xem điều gì bảo đảm không còn cách nào bị bỏ sót.", true),
};
