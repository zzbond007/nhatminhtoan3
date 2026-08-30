import type { DomainId } from "./content";

export const PROGRAM_MONTHS = 9;
export const PROGRAM_WEEKS = 36;
export const SESSIONS_PER_WEEK = 5;
export const PROGRAM_SESSIONS = PROGRAM_WEEKS * SESSIONS_PER_WEEK;

export type YearWeek = {
  week: number;
  month: number;
  missionId: string;
  taskId: string;
  domain: DomainId;
  title: string;
  bigQuestion: string;
  parentLookFor: string;
};

export const MONTH_THEMES = [
  "Nhìn ra cấu trúc",
  "Lập kế hoạch có hệ thống",
  "Nhiều con đường",
  "Bất biến và bằng chứng",
  "Tối ưu và công bằng",
  "Mô hình hoá đời sống",
  "Kiểm chứng và phản biện",
  "Thiết kế giải pháp",
  "Nhà toán học độc lập",
] as const;

const weeks: Array<Omit<YearWeek, "week" | "month">> = [
  { missionId: "number-1", taskId: "w01-dieu-tra-quy-luat", domain: "number", title: "Thám tử quy luật", bigQuestion: "Một quy luật đáng tin cần bao nhiêu bằng chứng?", parentLookFor: "Con kiểm tra mọi bước, không chỉ đoán số tiếp theo." },
  { missionId: "calculation-1", taskId: "w02-ghep-tron-chuc", domain: "calculation", title: "Ghép số tròn chục", bigQuestion: "Ta có thể đổi cách nhóm mà vẫn giữ nguyên tổng không?", parentLookFor: "Con giải thích vì sao cách nhóm giúp tính nhanh." },
  { missionId: "measurement-1", taskId: "w03-uoc-luong-do-dai", domain: "measurement", title: "Ước lượng có căn cứ", bigQuestion: "Làm sao ước lượng gần đúng trước khi đo?", parentLookFor: "Con nêu mốc so sánh và chấp nhận sai số hợp lý." },
  { missionId: "geometry-1", taskId: "w04-san-12-o", domain: "geometry", title: "Sân chơi 12 ô", bigQuestion: "Cùng diện tích, vì sao đường bao có thể khác?", parentLookFor: "Con phân biệt rõ phần phủ kín và đường bao." },
  { missionId: "data-1", taskId: "w05-du-lieu-lop-hoc", domain: "data", title: "Dữ liệu biết kể chuyện", bigQuestion: "Dữ liệu cho phép ta kết luận đến đâu?", parentLookFor: "Con không kết luận vượt quá nhóm đã quan sát." },
  { missionId: "word-1", taskId: "w06-keo-nguoc-cau-chuyen", domain: "word", title: "Kéo ngược câu chuyện", bigQuestion: "Biết kết quả cuối, ta lần về điểm bắt đầu thế nào?", parentLookFor: "Con dùng phép tính ngược và kiểm tra đi xuôi." },
  { missionId: "number-2", taskId: "w07-mat-ma-ba-chu-so", domain: "number", title: "Mật mã ba chữ số", bigQuestion: "Làm sao liệt kê đủ mà không trùng?", parentLookFor: "Con cố định một vị trí rồi xét có hệ thống." },
  { missionId: "calculation-2", taskId: "w08-ba-duong-den-dich", domain: "calculation", title: "Ba đường đến một đích", bigQuestion: "Cách tính nào ngắn, rõ và ít sai nhất?", parentLookFor: "Con biết chọn chiến lược theo đặc điểm con số." },
  { missionId: "measurement-2", taskId: "w09-khung-trong-gioi-han", domain: "measurement", title: "Thiết kế trong giới hạn", bigQuestion: "Một phương án phải thỏa đồng thời những điều kiện nào?", parentLookFor: "Con kiểm tra đơn vị, giới hạn và phần còn lại." },
  { missionId: "geometry-2", taskId: "w10-cat-ghep-bao-toan", domain: "geometry", title: "Cắt ghép và bảo toàn", bigQuestion: "Cắt ghép làm đại lượng nào đổi, đại lượng nào giữ nguyên?", parentLookFor: "Con dùng lý do thay vì chỉ đếm lại hình." },
  { missionId: "data-2", taskId: "w11-cay-kha-nang", domain: "data", title: "Cây khả năng", bigQuestion: "Làm sao biết ta đã xét hết mọi khả năng?", parentLookFor: "Con tổ chức lựa chọn theo nhánh, không nhớ mò." },
  { missionId: "word-2", taskId: "w12-ga-tho-dieu-chinh", domain: "word", title: "Giả sử rồi điều chỉnh", bigQuestion: "Một giả sử sai có chủ đích giúp gì cho lời giải?", parentLookFor: "Con xác định đúng lượng thay đổi của mỗi lần điều chỉnh." },
  { missionId: "number-3", taskId: "w13-thanh-pho-chan-le", domain: "number", title: "Thành phố chẵn–lẻ", bigQuestion: "Ta biết gì về kết quả trước khi tính?", parentLookFor: "Con khái quát từ ví dụ và tìm phản ví dụ." },
  { missionId: "calculation-3", taskId: "w14-may-toan-bi-mat", domain: "calculation", title: "Máy toán bí mật", bigQuestion: "Vì sao phải tháo thao tác cuối cùng trước?", parentLookFor: "Con đi ngược đúng thứ tự rồi kiểm tra đi xuôi." },
  { missionId: "measurement-3", taskId: "w15-hang-rao-rong-nhat", domain: "measurement", title: "Hàng rào rộng nhất", bigQuestion: "Cùng chu vi, hình nào cho diện tích lớn nhất?", parentLookFor: "Con thử đủ cặp cạnh rồi mới kết luận." },
  { missionId: "geometry-3", taskId: "w16-truy-tim-hinh-an", domain: "geometry", title: "Truy tìm hình ẩn", bigQuestion: "Đếm theo cách nào để không bỏ hình lớn?", parentLookFor: "Con phân nhóm theo kích thước và vị trí." },
  { missionId: "data-3", taskId: "w17-tro-choi-cong-bang", domain: "data", title: "Trò chơi có công bằng?", bigQuestion: "Một trò chơi công bằng cần những bằng chứng nào?", parentLookFor: "Con phân biệt mô hình khả năng với kết quả vài lần thử." },
  { missionId: "word-3", taskId: "w18-tim-het-loi-giai", domain: "word", title: "Tìm hết lời giải", bigQuestion: "Tìm được vài cách khác với chứng minh đã tìm đủ ra sao?", parentLookFor: "Con có thứ tự liệt kê và điểm dừng rõ ràng." },
  { missionId: "number-4", taskId: "w19-quy-luat-bi-nhieu", domain: "number", title: "Quy luật bị nhiễu", bigQuestion: "Một số sai có thể che giấu quy luật thật thế nào?", parentLookFor: "Con dùng sai khác hoặc thao tác lặp để kiểm chứng." },
  { missionId: "calculation-4", taskId: "w20-can-bang-hai-ve", domain: "calculation", title: "Cân bằng hai vế", bigQuestion: "Thay đổi hai số thế nào để tổng hoặc hiệu không đổi?", parentLookFor: "Con nói rõ lượng chuyển và đại lượng được giữ." },
  { missionId: "measurement-4", taskId: "w21-ban-do-ti-le", domain: "measurement", title: "Bản đồ tí hon", bigQuestion: "Một đoạn trên sơ đồ đại diện bao xa ngoài đời?", parentLookFor: "Con đếm đoạn, dùng đúng tỉ lệ và đơn vị." },
  { missionId: "geometry-4", taskId: "w22-guong-doi-xung", domain: "geometry", title: "Gương đối xứng", bigQuestion: "Điểm nào sẽ đi đâu sau khi gấp hoặc xoay?", parentLookFor: "Con theo dõi điểm đặc biệt, không chỉ nhìn toàn hình." },
  { missionId: "data-4", taskId: "w23-bieu-do-danh-lua", domain: "data", title: "Biểu đồ có thể đánh lừa", bigQuestion: "Hình ảnh trực quan có thể làm chênh lệch trông sai ra sao?", parentLookFor: "Con đọc nhãn, đơn vị và gốc trục trước khi kết luận." },
  { missionId: "word-4", taskId: "w24-di-nguoc-du-kien", domain: "word", title: "Đi ngược dữ kiện", bigQuestion: "Manh mối nào nên được tháo trước?", parentLookFor: "Con biểu diễn dữ kiện bằng sơ đồ hoặc phép tính ngược." },
  { missionId: "number-5", taskId: "w25-lich-va-chu-ky", domain: "number", title: "Lịch và chu kỳ", bigQuestion: "Phần dư giúp dự đoán sự lặp lại thế nào?", parentLookFor: "Con tách chu kỳ trọn vẹn và phần còn lại." },
  { missionId: "calculation-5", taskId: "w26-uoc-luong-bat-loi", domain: "calculation", title: "Ước lượng bắt lỗi", bigQuestion: "Không tính chính xác, ta vẫn phát hiện đáp án vô lý thế nào?", parentLookFor: "Con chọn mốc làm tròn phù hợp và nêu khoảng hợp lý." },
  { missionId: "measurement-5", taskId: "w27-lich-khong-chong-cheo", domain: "measurement", title: "Lịch không chồng chéo", bigQuestion: "Mốc giờ và khoảng thời gian khác nhau ở đâu?", parentLookFor: "Con tính cả thời gian chuyển tiếp và khoảng nghỉ." },
  { missionId: "geometry-5", taskId: "w28-lat-kin-san", domain: "geometry", title: "Lát kín sân", bigQuestion: "Hình nào lặp lại mà không để khe hoặc chồng lấn?", parentLookFor: "Con kiểm tra cạnh ghép và giải thích bằng cấu trúc." },
  { missionId: "data-5", taskId: "w29-thi-nghiem-ngau-nhien", domain: "data", title: "Thí nghiệm ngẫu nhiên", bigQuestion: "Vì sao nhiều lần thử vẫn không bảo đảm chia đều tuyệt đối?", parentLookFor: "Con ghi dữ liệu trung thực và so với dự đoán ban đầu." },
  { missionId: "word-5", taskId: "w30-manh-moi-vua-du", domain: "word", title: "Manh mối vừa đủ", bigQuestion: "Khi nào một bộ manh mối xác định duy nhất đáp án?", parentLookFor: "Con thử bỏ từng manh mối để phát hiện điều thừa hoặc thiếu." },
  { missionId: "number-6", taskId: "w31-tu-thiet-ke-quy-luat", domain: "number", title: "Tự thiết kế quy luật", bigQuestion: "Mô tả thế nào để người khác tạo đúng cùng một dãy?", parentLookFor: "Con viết quy tắc rõ và thử trên số mới." },
  { missionId: "calculation-6", taskId: "w32-xuong-che-tao-dich", domain: "calculation", title: "Xưởng chế tạo số đích", bigQuestion: "Có bao nhiêu cấu trúc khác nhau cùng tạo một kết quả?", parentLookFor: "Con phân nhóm lời giải theo ý tưởng, không chỉ hình thức." },
  { missionId: "measurement-6", taskId: "w33-ngan-sach-thong-minh", domain: "measurement", title: "Ngân sách thông minh", bigQuestion: "Phương án tốt nhất có nhất thiết là phương án rẻ nhất?", parentLookFor: "Con so đồng thời giá, số lượng, nhu cầu và dự phòng." },
  { missionId: "geometry-6", taskId: "w34-thiet-ke-hinh-toi-uu", domain: "geometry", title: "Thiết kế hình tối ưu", bigQuestion: "Ta chứng minh một thiết kế là tốt nhất bằng cách nào?", parentLookFor: "Con liệt kê phương án, chọn tiêu chí và so sánh công bằng." },
  { missionId: "data-6", taskId: "w35-khao-sat-khong-dan-duong", domain: "data", title: "Khảo sát không dẫn đường", bigQuestion: "Cách đặt câu hỏi làm dữ liệu lệch đi thế nào?", parentLookFor: "Con nhận ra từ ngữ dẫn dắt và cách chọn mẫu." },
  { missionId: "word-6", taskId: "w36-chung-minh-khong-bo-sot", domain: "word", title: "Chứng minh không bỏ sót", bigQuestion: "Điều gì biến một lời giải thành lập luận thuyết phục?", parentLookFor: "Con nêu hệ thống liệt kê, kiểm tra và lý do dừng." },
];

export const YEAR_WEEKS: YearWeek[] = weeks.map((week, index) => ({
  ...week,
  week: index + 1,
  month: Math.floor(index / 4) + 1,
}));

export const WEEKLY_RHYTHM = [
  { session: 1, label: "Khơi tò mò", description: "Dự đoán, thử trường hợp nhỏ và ghi điều con đang thắc mắc." },
  { session: 2, label: "Xưởng chiến lược", description: "Giải một phiên bản mới bằng hai cách rồi so sánh." },
  { session: 3, label: "Phòng thử thách", description: "Làm phiên bản thích ứng và dùng gợi ý khi thật sự cần." },
  { session: 4, label: "Chuyển giao đời sống", description: "Mang ý tưởng sang bối cảnh mới, giải thích và kiểm chứng." },
  { session: 5, label: "Bài toán mở", description: "Điều tra bài nhiều cách giải, trao đổi cùng gia đình và phản tư." },
] as const;

export function weekProgress(
  week: YearWeek,
  missionCounts: Record<string, number>,
  enrichmentCompleted: string[],
) {
  const guided = Math.min(4, missionCounts[week.missionId] ?? 0);
  const openTask = enrichmentCompleted.includes(week.taskId) ? 1 : 0;
  return { guided, openTask, total: guided + openTask, complete: guided === 4 && openTask === 1 };
}
