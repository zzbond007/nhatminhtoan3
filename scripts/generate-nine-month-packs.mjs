import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public", "content-packs");

const sources = {
  number: { title: "NRICH · Number for Primary Students", url: "https://nrich.maths.org/number-primary-students" },
  calculation: { title: "NRICH · Addition and Subtraction: Age 7–11", url: "https://nrich.maths.org/curriculum/addition-and-subtraction-age-7-11" },
  measurement: { title: "NRICH · Measurement for Primary Students", url: "https://nrich.maths.org/measurement-primary-students" },
  geometry: { title: "NRICH · Properties of Shapes: Age 7–11", url: "https://nrich.maths.org/curriculum/properties-of-shapes-age-7-11" },
  data: { title: "YouCubed · Data Big Ideas", url: "https://www.youcubed.org/data-big-ideas/" },
  word: { title: "NRICH · What Is a Mathematically Rich Task?", url: "https://nrich.maths.org/articles/what-mathematically-rich-task" },
};

const monthThemes = [
  "Nhìn ra cấu trúc", "Lập kế hoạch có hệ thống", "Nhiều con đường",
  "Bất biến và bằng chứng", "Tối ưu và công bằng", "Mô hình hoá đời sống",
  "Kiểm chứng và phản biện", "Thiết kế giải pháp", "Nhà toán học độc lập",
];

const specs = [
  ["w01-dieu-tra-quy-luat", "number", "Điều tra viên quy luật", "Dãy 4, 8, 12, 16, 21, 24 có đúng một số bị viết sai. Hãy tìm số đó, sửa dãy và nêu ít nhất hai bằng chứng cho quy luật của con.", ["So khoảng cách giữa từng cặp số liên tiếp.", "Thử thay 21 bằng một số để mọi khoảng cách bằng nhau.", "Sau khi sửa, dự đoán thêm hai số và kiểm tra ngược."], "Số sai là 21; thay bằng 20 để dãy tăng đều 4. Hai số tiếp theo là 28 và 32.", "Tạo một dãy khác có đúng một số nhiễu để người lớn phát hiện.", "Giấy nháp hoặc các thẻ số"],
  ["w02-ghep-tron-chuc", "calculation", "Đội cứu hộ số tròn", "Tìm ít nhất ba cách tính 198 + 67 mà không đặt tính theo cột. Khoanh cách con cho là dễ kiểm tra nhất và giải thích lựa chọn.", ["Đưa 198 về 200.", "Có thể tách 67 thành 2 và 65.", "So lại bằng cách lấy kết quả trừ 198."], "Các cách hợp lệ đều cho 265, chẳng hạn 200 + 65; 198 + 60 + 7; hoặc 197 + 68.", "Nếu thay 198 bằng 998, chiến lược nào vẫn thuận lợi?", "Giấy và bút màu"],
  ["w03-uoc-luong-do-dai", "measurement", "Phòng thí nghiệm ước lượng", "Chọn năm đồ vật trong nhà. Trước khi đo, hãy ước lượng chiều dài từng vật bằng xăng-ti-mét, sau đó đo thật và xếp hạng các dự đoán từ gần nhất đến xa nhất.", ["Dùng gang tay hoặc một đồ vật dài khoảng 10 cm làm mốc.", "Ghi dự đoán trước khi cầm thước.", "Tính độ lệch bằng số lớn trừ số nhỏ."], "Không có một bộ số duy nhất. Bài đạt khi có đủ năm dự đoán, số đo thật, độ lệch và nhận xét về mốc ước lượng.", "Tìm một vật mới mà con tin có thể ước lượng sai không quá 2 cm.", "Thước 30 cm, năm đồ vật an toàn"],
  ["w04-san-12-o", "geometry", "Sân chơi 12 ô", "Dùng đúng 12 ô vuông đơn vị để tạo mọi hình chữ nhật khác kích thước. Tính chu vi từng hình và giải thích vì sao con đã tìm đủ.", ["Tìm các cặp số có tích bằng 12.", "Không tính riêng hình xoay lại.", "So chu vi bằng công thức (dài + rộng) × 2."], "Có ba hình: 1×12, 2×6, 3×4; chu vi lần lượt 26, 16, 14 đơn vị.", "Với 18 ô, hình nào có chu vi nhỏ nhất?", "12 ô giấy vuông hoặc giấy kẻ ô"],
  ["w05-du-lieu-lop-hoc", "data", "Dữ liệu chỉ nói điều đã thấy", "Tám bạn chọn số cuốn sách đã đọc: 2, 1, 3, 2, 4, 2, 1, 5. Hãy vẽ một biểu đồ, viết ba nhận xét chắc chắn đúng và một nhận xét chưa đủ bằng chứng.", ["Lập bảng tần số trước khi vẽ.", "Mỗi nhận xét chắc chắn phải chỉ vào một con số trong dữ liệu.", "Không suy rộng từ tám bạn ra cả lớp hoặc cả trường."], "Các nhận xét đúng có thể gồm: 2 xuất hiện ba lần; lớn nhất là 5; nhỏ nhất là 1. Kết luận về toàn trường là vượt quá bằng chứng.", "Đổi cách biểu diễn dữ liệu nhưng giữ nguyên các kết luận.", "Giấy ô vuông và bút màu"],
  ["w06-keo-nguoc-cau-chuyen", "word", "Chiếc hộp đi ngược", "Một hộp có một số viên bi. Thêm 8 viên, sau đó chia đều vào 4 túi, mỗi túi 7 viên. Ban đầu hộp có bao nhiêu viên? Hãy giải bằng phép tính ngược và bằng sơ đồ.", ["Từ bốn túi, tìm tổng cuối cùng.", "Thao tác cuối trong câu chuyện phải được tháo trước.", "Dùng kết quả ban đầu đi xuôi để kiểm tra."], "Cuối có 4 × 7 = 28 viên; ban đầu có 28 − 8 = 20 viên.", "Thay 7 bằng 9 và tự giải lại mà không đổi cấu trúc câu chuyện.", "Giấy và bút"],
  ["w07-mat-ma-ba-chu-so", "number", "Kho mật mã 0–3–6–9", "Dùng các chữ số 0, 3, 6, 9, mỗi chữ số không quá một lần, lập mọi số có ba chữ số lớn hơn 600 và là số chẵn. Có bao nhiêu số?", ["Hàng trăm chỉ có thể là 6 hoặc 9.", "Số chẵn phải tận cùng bằng 0 hoặc 6.", "Cố định hàng trăm, rồi hàng đơn vị, sau đó mới chọn hàng chục."], "Có 6 số: 630, 690, 906, 930, 936 và 960. Liệt kê theo hàng trăm rồi hàng đơn vị giúp chứng minh không trùng, không sót.", "Đổi điều kiện thành nhỏ hơn 600 và so số lượng.", "Bốn thẻ số 0, 3, 6, 9"],
  ["w08-ba-duong-den-dich", "calculation", "Ba con đường đến 288", "Tính 48 × 6 theo ba cách: tách theo hàng, bù từ 50 và dùng gấp đôi–gấp ba. Cách nào con thấy dễ giải thích nhất?", ["Tách 48 thành 40 + 8.", "Hoặc tính 50 × 6 rồi bớt 2 × 6.", "Với gấp đôi–gấp ba, nhớ rằng ×6 = ×2 rồi ×3."], "Ba đường đều cho 288: 240+48; 300−12; hoặc 48×2=96 rồi 96×3=288.", "Tìm ba cách tương tự cho 49 × 8.", "Giấy nháp"],
  ["w09-khung-trong-gioi-han", "measurement", "Khu vườn có cổng", "Có 36 m hàng rào để làm khu vườn hình chữ nhật, nhưng chừa một cổng rộng 2 m không cần rào. Hãy tìm mọi cặp cạnh nguyên có thể và khu vườn rộng nhất.", ["Nếu lắp cả cổng, chu vi đầy đủ sẽ là bao nhiêu?", "Nửa chu vi cho biết tổng chiều dài và chiều rộng.", "Liệt kê cặp cạnh theo thứ tự rồi tính diện tích."], "Chu vi đầy đủ là 38 m, nên dài + rộng = 19. Cặp gần nhau nhất 9×10 cho diện tích lớn nhất 90 m².", "Nếu cổng rộng 4 m, kết quả thay đổi thế nào?", "Que tính hoặc giấy kẻ ô"],
  ["w10-cat-ghep-bao-toan", "geometry", "Xưởng cắt ghép 20 ô", "Vẽ hình chữ nhật 4×5. Cắt theo đường ô vuông thành hai mảnh rồi ghép thành một hình khác không chồng lấn. So sánh diện tích và chu vi trước–sau.", ["Diện tích từng mảnh cộng lại là bao nhiêu?", "Đánh dấu các cạnh mới tiếp xúc khi ghép.", "Diện tích giữ nguyên không có nghĩa chu vi giữ nguyên."], "Diện tích luôn là 20 ô nếu không bỏ, thêm hay chồng mảnh; chu vi có thể tăng, giảm hoặc giữ tùy cách ghép.", "Tìm hai hình cùng diện tích 20 nhưng có chu vi khác nhau nhiều nhất.", "Giấy kẻ ô, kéo an toàn và băng dính"],
  ["w11-cay-kha-nang", "data", "Chuyến đi không lặp", "Có 3 đường từ nhà đến công viên và 2 đường từ công viên đến thư viện. Khi về, không được đi lại đúng đường đã dùng ở từng chặng. Có bao nhiêu hành trình đi–về?", ["Trước hết đếm số cách đi.", "Với mỗi đường đi ở chặng đầu, đường về chặng đó còn mấy lựa chọn?", "Dùng cây bốn tầng hoặc phép nhân rồi kiểm tra bằng vài nhánh."], "Cách đi: 3×2=6. Cách về với mỗi lượt đi: 1×2=2. Tổng 6×2=12 hành trình.", "Nếu chặng thứ hai có 3 đường, số hành trình thay đổi ra sao?", "Giấy và bút màu"],
  ["w12-ga-tho-dieu-chinh", "word", "Nông trại 22 chân", "Trong sân có 8 con gồm gà và thỏ, tổng cộng 22 chân. Tìm số mỗi loại bằng giả sử–điều chỉnh và bằng bảng thử.", ["Giả sử cả 8 con đều là gà.", "So 16 chân với 22 chân.", "Mỗi lần đổi một gà thành một thỏ làm tăng mấy chân?"], "Giả sử tám gà có 16 chân, thiếu 6; mỗi thỏ thay gà tăng 2 chân, nên có 3 thỏ và 5 gà.", "Tạo một bài tương tự có đúng 4 con thỏ.", "Tám nút áo và bút"],
  ["w13-thanh-pho-chan-le", "number", "Thành phố chẵn–lẻ", "Chọn ba số lẻ và hai số chẵn bất kỳ. Không tính toàn bộ, dự đoán tổng là chẵn hay lẻ; sau đó thay một số và tìm mọi cách làm tính chẵn–lẻ của tổng đổi.", ["Ghép hai số lẻ thành một tổng chẵn.", "Ba số lẻ để lại một phần lẻ.", "Đổi một số lẻ thành chẵn hoặc ngược lại làm điều gì xảy ra?"], "Ba lẻ cộng hai chẵn cho tổng lẻ. Đổi tính chẵn–lẻ của đúng một số sẽ làm tổng đổi từ lẻ sang chẵn.", "Điều gì xảy ra nếu đổi cùng lúc hai số?", "Năm thẻ số tự chọn"],
  ["w14-may-toan-bi-mat", "calculation", "Máy toán hai chiều", "Một máy lấy số vào, nhân 5, bớt 7 rồi chia 3 và cho kết quả 11. Tìm số vào, vẽ sơ đồ máy và kiểm tra đi xuôi.", ["Đi ngược từ 11 bằng phép nhân 3.", "Sau đó cộng lại 7.", "Cuối cùng chia cho 5."], "11×3=33; 33+7=40; 40:5=8. Kiểm tra: 8×5−7=33; 33:3=11.", "Thiết kế một máy ba bước có đầu vào 6 và đầu ra 10.", "Giấy và bút"],
  ["w15-hang-rao-rong-nhat", "measurement", "28 mét hàng rào", "Có 28 m hàng rào làm hình chữ nhật cạnh nguyên. Liệt kê mọi phương án, tìm diện tích lớn nhất và mô tả quy luật con nhận ra.", ["Nửa chu vi là 14.", "Liệt kê 1+13, 2+12 rồi tiếp tục.", "So tích của từng cặp và chú ý hai cạnh càng gần nhau."], "Các cặp từ 1×13 đến 7×7; diện tích lớn nhất 49 m² ở hình 7×7.", "Với chu vi 30 m, hình tối ưu có còn là hình vuông không?", "Que tính hoặc giấy kẻ ô"],
  ["w16-truy-tim-hinh-an", "geometry", "Lưới 3×4 có bao nhiêu hình?", "Trên lưới gồm 3 hàng và 4 cột ô vuông, hãy đếm tất cả hình chữ nhật. Lập bảng theo kích thước để chứng minh không bỏ sót.", ["Đếm hình cao 1 ô trước, theo từng độ rộng.", "Tiếp tục với chiều cao 2 rồi 3 ô.", "Một hình a×b có thể bắt đầu ở bao nhiêu vị trí?"], "Tổng số hình chữ nhật là (1+2+3)×(1+2+3+4)=6×10=60; bảng kích thước là bằng chứng phù hợp lớp 3.", "Trong 60 hình đó có bao nhiêu hình vuông?", "Giấy kẻ ô và bút màu"],
  ["w17-tro-choi-cong-bang", "data", "Cuộc đua tổng 6 và tổng 8", "Tung hai xúc xắc. Bạn A thắng nếu tổng bằng 6, bạn B thắng nếu tổng bằng 8. Hãy dự đoán, lập bảng 36 khả năng rồi kết luận trò chơi có công bằng không.", ["Viết các cặp có thứ tự tạo tổng 6.", "Làm tương tự với tổng 8.", "So số ô thuận lợi, không chỉ so số tổng."], "Tổng 6 có 5 cặp; tổng 8 cũng có 5 cặp, nên hai bạn có cơ hội bằng nhau theo mô hình.", "Thêm điều kiện hòa thế nào để mọi kết quả đều được dùng?", "Hai xúc xắc hoặc bảng 6×6"],
  ["w18-tim-het-loi-giai", "word", "Đúng 24 nghìn đồng", "Chỉ dùng đồng 2 nghìn và 5 nghìn để có đúng 24 nghìn. Tìm mọi cách, không tính thứ tự các đồng và chứng minh đã tìm đủ.", ["Xét lần lượt 0, 1, 2, 3, 4 đồng 5 nghìn.", "Phần tiền còn lại phải chia hết cho 2 nghìn.", "Dừng khi số đồng 5 nghìn làm tổng vượt 24 nghìn."], "Có 3 cách: 12 đồng 2; 7 đồng 2 và 2 đồng 5; 2 đồng 2 và 4 đồng 5.", "Nếu yêu cầu dùng đúng 6 đồng tiền thì có cách nào?", "Các thẻ ghi 2 và 5"],
  ["w19-quy-luat-bi-nhieu", "number", "Dãy số gửi tín hiệu sai", "Dãy 3, 6, 10, 15, 22, 28 được tạo bằng cách cộng lần lượt 3, 4, 5, 6, 7. Một số đã sai. Hãy tìm, sửa và giải thích bằng bảng sai khác.", ["Viết khoảng cách mong đợi dưới từng mũi tên.", "Tính từ trái sang đến khi phát hiện lệch.", "Sửa số sai rồi kiểm tra cả bước sau nó."], "Dãy đúng là 3, 6, 10, 15, 21, 28; số 22 phải là 21.", "Tạo một dãy tăng theo các số lẻ liên tiếp.", "Giấy và bút"],
  ["w20-can-bang-hai-ve", "calculation", "Chiếc cân tổng và hiệu", "Không tính theo cột: biến đổi 397 + 186 thành một tổng dễ hơn và 503 − 198 thành một hiệu dễ hơn. Giải thích chính xác vì sao giá trị không đổi.", ["Với tổng, chuyển 3 từ số hạng này sang số hạng kia.", "Với hiệu, cùng tăng cả hai số thêm 2.", "Tính lại bằng phép tính ngược để kiểm tra."], "397+186 = 400+183 = 583. 503−198 = 505−200 = 305. Tổng giữ khi chuyển lượng; hiệu giữ khi cùng tăng hai số.", "Tạo một cặp phép tính khác dùng được hai nguyên tắc này.", "Hai đĩa giấy tượng trưng chiếc cân"],
  ["w21-ban-do-ti-le", "measurement", "Bản đồ công viên", "Trên bản đồ ô vuông, mỗi cạnh ô đại diện 25 m. Một đường đi gồm 7 đoạn ngang và 5 đoạn dọc. Tính quãng đường; sau đó thiết kế một đường khác cùng điểm đầu–cuối nhưng dài hơn.", ["Đếm đoạn chứ không đếm điểm.", "Quãng đường ban đầu có 7+5 đoạn.", "Đường vòng phải vẫn kết thúc đúng điểm đích."], "Đường ban đầu dài 12×25 = 300 m. Có nhiều đường vòng đúng; phải ghi rõ số đoạn và nhân 25 m.", "Tìm đường vòng dài hơn đúng 100 m.", "Giấy ô vuông và bút màu"],
  ["w22-guong-doi-xung", "geometry", "Thông điệp qua gương", "Vẽ một hình bất đối xứng trên nửa tờ giấy kẻ ô, chọn một đường làm trục rồi hoàn thành ảnh đối xứng. Giải thích cách xác định vị trí từng điểm.", ["Đếm khoảng cách vuông góc từ điểm đến trục.", "Ảnh nằm phía kia và cách trục bằng đúng khoảng cách đó.", "Kiểm tra bằng cách gấp giấy theo trục."], "Bài đạt khi các cặp điểm cách trục bằng nhau, nối đúng thứ tự và hai nửa trùng khi gấp.", "Dùng hai trục vuông góc và dự đoán số bản sao của hình.", "Giấy kẻ ô và bút màu"],
  ["w23-bieu-do-danh-lua", "data", "Hai biểu đồ, một dữ liệu", "Hai đội ghi 48 và 52 điểm. Vẽ một biểu đồ có trục từ 0 và một biểu đồ có trục từ 47. So cảm giác bằng mắt và viết lời cảnh báo cho người xem.", ["Giữ cùng dữ liệu ở cả hai biểu đồ.", "Quan sát tỉ lệ phần chiều cao bị cắt bỏ.", "So chênh lệch thật bằng phép trừ."], "Chênh lệch thật chỉ là 4 điểm. Trục bắt đầu ở 47 phóng đại khác biệt bằng mắt; lời cảnh báo phải nhắc người xem đọc gốc trục.", "Tìm một cách trình bày trung thực hơn mà vẫn dễ đọc.", "Giấy ô vuông và thước"],
  ["w24-di-nguoc-du-kien", "word", "Chuyến tàu đi ngược thời gian", "Một chuyến đi kết thúc lúc 10:25, gồm 35 phút di chuyển, nghỉ 10 phút và 20 phút tham quan. Chuyến đi bắt đầu lúc nào? Hãy giải bằng trục thời gian đi ngược.", ["Tính tổng thời lượng hoặc lùi từng chặng.", "Lùi 20 phút trước vì đó là hoạt động cuối.", "Kiểm tra bằng cách đi xuôi từ giờ bắt đầu."], "Tổng thời lượng 65 phút; 10:25 lùi 65 phút là 9:20.", "Thêm một chặng 15 phút nhưng giữ giờ kết thúc; giờ bắt đầu đổi thế nào?", "Giấy và bút"],
  ["w25-lich-va-chu-ky", "number", "Hai đội gặp lại", "Đội Đỏ tập 4 ngày một lần, đội Xanh tập 6 ngày một lần. Hôm nay hai đội cùng tập. Sau ít nhất bao nhiêu ngày họ lại cùng tập? Hãy chứng minh bằng hai cách.", ["Liệt kê các bội của 4 và của 6.", "Tìm số dương nhỏ nhất xuất hiện ở cả hai danh sách.", "Cách thứ hai có thể dùng lịch hoặc bước nhảy trên trục số."], "Họ gặp lại sau 12 ngày; 12 là bội chung dương nhỏ nhất của 4 và 6.", "Thêm đội Vàng tập 3 ngày một lần; ngày gặp chung có đổi không?", "Lịch giấy hoặc trục số"],
  ["w26-uoc-luong-bat-loi", "calculation", "Thanh tra hóa đơn", "Một hóa đơn có 4 món giá 48 nghìn, 73 nghìn, 96 nghìn và 31 nghìn. Bạn ghi tổng 348 nghìn. Hãy ước lượng để phát hiện điều đáng ngờ rồi tính chính xác bằng cách nhóm thuận lợi.", ["Làm tròn các giá về chục nghìn gần nhất.", "Ghép 48 với 31 hoặc tìm cặp gần tròn trăm.", "So kết quả chính xác với 348."], "Ước lượng khoảng 250 nghìn. Tổng chính xác 48+73+96+31 = 248 nghìn, nên 348 nghìn sai 100 nghìn.", "Thay một giá để tổng đúng bằng 300 nghìn.", "Bốn thẻ giá"],
  ["w27-lich-khong-chong-cheo", "measurement", "Lịch câu lạc bộ 120 phút", "Trong 120 phút, hãy xếp bốn hoạt động dài 35, 30, 25 và 20 phút; giữa các hoạt động cần nghỉ 5 phút. Có thể làm đủ bốn hoạt động không? Nếu không, chọn lịch hợp lý nhất và bảo vệ lựa chọn.", ["Bốn hoạt động có ba khoảng nghỉ.", "Tính tổng thời gian nếu làm đủ.", "Nếu phải bỏ một hoạt động, nêu tiêu chí chứ không chọn ngẫu nhiên."], "Bốn hoạt động cần 110 + 15 = 125 phút nên không vừa. Bỏ hoạt động 20 phút thì lịch dùng 90+10 = 100 phút; các lựa chọn khác cũng được nếu giải thích mục tiêu.", "Thiết kế lịch vừa đúng 120 phút bằng cách điều chỉnh một hoạt động.", "Các thẻ hoạt động và đồng hồ"],
  ["w28-lat-kin-san", "geometry", "Gạch 2×3 lát sân 6×8", "Có thể dùng gạch hình chữ nhật 2×3 để lát kín sân 6×8 mà không cắt gạch không? Hãy dựng ít nhất hai cách lát hoặc giải thích vì sao không thể.", ["So diện tích sân với diện tích một viên gạch.", "48 chia 6 cho biết cần bao nhiêu viên.", "Thử đặt cạnh 3 theo chiều 6; cách khác là chia sân thành khối 6×6 và 6×2."], "Cần 8 viên. Cách 1: đặt viên 3×2 thành 2 hàng và 4 cột. Cách 2: chia sân thành khối 6×6 lát bằng sáu viên 2×3 và dải 6×2 lát bằng hai viên 3×2.", "Sân 5×8 có thể lát bằng loại gạch này không?", "Giấy kẻ ô và tám miếng 2×3"],
  ["w29-thi-nghiem-ngau-nhien", "data", "Đồng xu có nhớ không?", "Tung đồng xu 40 lần, ghi theo nhóm 10 lần. Trước khi tung hãy dự đoán; sau đó so số lần ngửa giữa các nhóm và giải thích vì sao chúng không cần bằng nhau.", ["Lập bảng bốn hàng, mỗi hàng 10 lần.", "Ghi kết quả ngay, không sửa để đẹp hơn.", "So tổng 40 lần với dự đoán, nhưng không đòi đúng 20."], "Không có kết quả duy nhất. Bài đạt khi có 40 lần ghi trung thực, tổng hợp đúng và phân biệt xu hướng gần cân bằng với sự chắc chắn.", "Gộp dữ liệu của hai người để xem bức tranh có ổn định hơn không.", "Một đồng xu và bảng ghi"],
  ["w30-manh-moi-vua-du", "word", "Bộ manh mối tối thiểu", "Bí mật là một số từ 1 đến 50. Hãy viết ít manh mối nhất để chỉ còn đúng một số, trong đó phải dùng ít nhất hai ý khác nhau: chẵn–lẻ, so sánh, chia hết hoặc chữ số.", ["Sau mỗi manh mối, gạch các số không còn phù hợp.", "Ưu tiên manh mối loại được nhiều khả năng.", "Bỏ thử từng manh mối để xem đáp án còn duy nhất không."], "Không có bộ duy nhất. Bài đạt khi các manh mối không mâu thuẫn, giao của chúng có đúng một số và không có manh mối thừa.", "Đổi bộ manh mối cho người lớn giải rồi yêu cầu phản biện.", "Bảng số 1–50"],
  ["w31-tu-thiet-ke-quy-luat", "number", "Hai dãy cùng mở đầu", "Tạo hai quy luật khác nhau đều bắt đầu bằng 2, 5, 8 nhưng cho số thứ tư khác nhau. Viết quy tắc đủ rõ để người khác tiếp tục mỗi dãy thêm ba số.", ["Một dãy có thể luôn cộng 3.", "Dãy kia có thể dùng các khoảng cách thay đổi sau ba số đầu.", "Kiểm tra quy tắc có giải thích được cả ba bước đã viết hay không."], "Ví dụ: dãy A cộng 3 cho 11,14,17; dãy B cộng 3,3, rồi 4,5,6 cho 12,17,23. Nhiều đáp án hợp lệ nếu quy tắc rõ.", "Giải thích vì sao chỉ ba số đầu thường chưa xác định duy nhất quy luật.", "Giấy và bút màu"],
  ["w32-xuong-che-tao-dich", "calculation", "Xưởng chế tạo số 60", "Dùng 2, 3, 5, 10, mỗi số không quá một lần, cùng các phép +, −, × và dấu ngoặc để tạo càng nhiều biểu thức bằng 60 càng tốt. Phân nhóm theo ý tưởng.", ["Bắt đầu từ 60 và nghĩ đến 10×6 hoặc 30×2.", "Thử tạo 6 từ các số còn lại.", "Hai biểu thức chỉ đổi thứ tự nhân có thể thuộc cùng một ý tưởng."], "Ví dụ: 10×3×2=60 và 10×(5+3−2)=60. Chấp nhận mọi biểu thức đúng; các biểu thức chỉ đổi thứ tự được xếp cùng một nhóm ý tưởng.", "Tìm một biểu thức dùng đủ cả bốn số và có phép trừ.", "Bốn thẻ số và giấy"],
  ["w33-ngan-sach-thong-minh", "measurement", "Chuyến dã ngoại 200 nghìn", "Có 200 nghìn đồng. Cần mua ít nhất 6 chai nước giá 12 nghìn/chai, ít nhất 4 phần trái cây giá 18 nghìn/phần và để lại 20 nghìn dự phòng. Hãy lập các phương án hợp lệ và chọn phương án tốt nhất theo tiêu chí của con.", ["Trừ khoản dự phòng trước.", "Tính chi phí tối thiểu bắt buộc.", "Nêu tiêu chí: nhiều phần hơn, tiền dư nhiều hơn hay cân bằng."], "Mức tối thiểu dùng 72+72=144 nghìn, còn 36 nghìn ngoài dự phòng. Có thể thêm 3 chai hoặc 2 phần trái cây; nhiều phương án hợp lệ tùy tiêu chí.", "Nếu có thêm 30 nghìn, lựa chọn tối ưu của con thay đổi không?", "Thẻ giá và tiền giấy giả"],
  ["w34-thiet-ke-hinh-toi-uu", "geometry", "Nhà kho 24 ô", "Dùng 24 ô vuông tạo mọi hình chữ nhật cạnh nguyên. Nếu đường viền tốn 2 thẻ cho mỗi đơn vị chu vi, thiết kế nào ít thẻ nhất? Chứng minh.", ["Liệt kê các cặp thừa số của 24.", "Tính chu vi từng hình trước khi đổi sang số thẻ.", "Hình tối ưu phải được so với mọi phương án còn lại."], "Các hình 1×24, 2×12, 3×8, 4×6; hình 4×6 có chu vi 20 và cần 40 thẻ, ít nhất.", "Nếu phải chừa một cạnh dài 2 làm cửa, cách tính vật liệu đổi ra sao?", "24 ô giấy vuông"],
  ["w35-khao-sat-khong-dan-duong", "data", "Câu hỏi làm lệch dữ liệu", "Muốn biết hoạt động sau giờ học được yêu thích, hãy viết một câu hỏi trung lập và một câu cố tình dẫn dắt. Dự đoán kết quả khác nhau, rồi thiết kế cách chọn 12 người trả lời công bằng hơn.", ["Tìm từ khen, chê hoặc cụm “đúng không” trong câu dẫn dắt.", "Cho lựa chọn cân bằng và có mục khác.", "Không chỉ hỏi nhóm bạn thân hoặc một câu lạc bộ."], "Bài đạt khi chỉ rõ yếu tố dẫn dắt, có câu trung lập, cách chọn mẫu đa dạng và không khẳng định kết quả trước khi thu thập.", "Thu thử dữ liệu với người trong gia đình rồi so hai cách hỏi.", "Phiếu khảo sát giấy"],
  ["w36-chung-minh-khong-bo-sot", "word", "Hội đồng chứng minh", "Một số có hai chữ số, tổng hai chữ số bằng 9 và số đó lớn hơn 40. Tìm tất cả số phù hợp rồi viết lời chứng minh rằng không còn số nào khác.", ["Xét hàng chục lần lượt từ 4 đến 9.", "Với mỗi hàng chục, hàng đơn vị được xác định bởi tổng 9.", "Loại trường hợp không lớn hơn 40 và dừng khi hàng đơn vị âm."], "Các số là 45, 54, 63, 72, 81, 90. Xét hàng chục 4–9 theo thứ tự chứng minh không bỏ sót.", "Thay tổng 9 bằng 12; cấu trúc lời chứng minh có đổi không?", "Bảng hàng chục–hàng đơn vị"],
];

function makeTask(spec, index) {
  const [id, domain, title, prompt, hints, answerGuide, extension, materials] = spec;
  const week = index + 1;
  const level = week <= 12 ? 2 : 3;
  const source = sources[domain];
  return {
    id, week, month: Math.floor(index / 4) + 1, domain, level, title,
    minutes: week <= 12 ? 16 : 20,
    prompt,
    launchQuestions: [
      "Con dự đoán điều gì trước khi bắt đầu?",
      `Con sẽ dùng ${materials.toLocaleLowerCase("vi")} để tổ chức các thử nghiệm thế nào?`,
      "Bằng chứng nào sẽ làm con tin rằng lời giải đã đủ và đúng?",
    ],
    hints,
    familyPrompt: `Để con trình bày trước. Sau đó hỏi: “Nếu đổi một điều kiện, kết luận nào còn đúng?”`,
    materials,
    answerGuide,
    reviewNotes: "Phụ huynh không cần chấm cách trình bày. Kiểm tra tính đúng của dữ kiện, bằng chứng và việc con có tự sửa sau phản biện hay không.",
    extension,
    source: {
      ...source,
      adaptationNote: "Bài nguyên bản của Math Raccoon; nguồn chỉ định hướng cấu trúc bài toán mở, nhiều cách tiếp cận và mức thử thách dành cho lứa tuổi 7–11.",
    },
  };
}

await mkdir(output, { recursive: true });
const catalog = {
  schemaVersion: 1,
  version: "2026.09.03.2",
  status: "approved-for-release",
  parentApprovalRequired: true,
  program: { months: 9, weeks: 36, sessionsPerWeek: 5, sessions: 180 },
  packs: [],
};

for (let month = 1; month <= 9; month += 1) {
  const start = (month - 1) * 4;
  const tasks = specs.slice(start, start + 4).map((spec, offset) => makeTask(spec, start + offset));
  const id = `year-month-${String(month).padStart(2, "0")}`;
  const pack = {
    schemaVersion: 1,
    id,
    version: "1.0.0",
    month,
    weekRange: [start + 1, start + 4],
    title: `Tháng ${month} · ${monthThemes[month - 1]}`,
    description: `Bốn bài toán mở cho tuần ${start + 1}–${start + 4}, nối trực tiếp với lộ trình 9 tháng của Math Raccoon.`,
    status: "approved-for-release",
    reviewedAt: "2026-08-30",
    reviewedBy: "Ban nội dung Math Raccoon",
    curriculumReference: "Chương trình GDPT môn Toán 2018; nội dung nâng cao bổ trợ bộ Chân trời sáng tạo.",
    reviewChecks: {
      curriculumAlignment: true,
      answerAndConstraintCheck: true,
      childLanguage: true,
      copyrightAndSource: true,
      privacyAndExternalLinks: true,
    },
    tasks,
  };
  const filename = `${id}.json`;
  await writeFile(path.join(output, filename), `${JSON.stringify(pack, null, 2)}\n`);
  catalog.packs.push({
    id,
    version: pack.version,
    title: pack.title,
    description: pack.description,
    month,
    weekRange: pack.weekRange,
    taskCount: tasks.length,
    url: `content-packs/${filename}`,
    reviewedAt: pack.reviewedAt,
    reviewedBy: pack.reviewedBy,
  });
}

await writeFile(path.join(root, "public", "content-catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Generated ${catalog.packs.length} reviewed monthly packs with ${specs.length} open tasks.`);
