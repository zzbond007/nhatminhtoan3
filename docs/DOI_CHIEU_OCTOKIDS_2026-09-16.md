# Đối chiếu OctoKids và quyết định bổ sung Math Raccoon

Ngày rà soát: 16/09/2026  
Đối tượng: nội dung công khai dành cho Khối 3 trên `https://octokidsmath.com/`

## 1. Phạm vi đã kiểm tra

- Toán tư duy Khối 3: số và cấu tạo số, biểu thức, phân số, toán lời văn, tính ngược, đo lường, logic tổng–hiệu/toán tuổi, quy luật và tính tổng nhanh.
- Toán Olympic TIMO Khối 3: tư duy logic, số học/đại số, lý thuyết số, hình học, tổ hợp và đề thử thách.
- Toán IQ: đố vui, hoàn thành hình, Neuro Trainer, Sudoku, suy luận logic, hình ảnh thực tế, loại suy và quy luật dãy.
- Cơ chế học: Daily Quiz, câu ngẫu nhiên, ôn câu sai, đọc Việt–Anh, trợ giúp, xem đáp án, tiến độ và phần thưởng.

Các trang công khai dùng để đối chiếu:

- [Trang chủ OctoKids](https://octokidsmath.com/)
- [Toán tư duy Khối 3](https://octokidsmath.com/Exam?competitionId=12&gradeId=3)
- [TIMO Olympic Khối 3](https://octokidsmath.com/Exam?competitionId=1&gradeId=3)
- [Toán IQ](https://octokidsmath.com/Exam?competitionId=13&gradeId=1)

## 2. Ma trận đối chiếu

| Nội dung/cơ chế | OctoKids | Math Raccoon trước bổ sung | Quyết định |
| --- | --- | --- | --- |
| Giá trị hàng, đọc/viết/tách số | Có kho luyện riêng | Có rải rác, chưa thành mạch ôn nền | Bổ sung 6 câu nền có hệ thống |
| Phân số trực quan | Có chuyên đề riêng | Thiếu chuyên đề trực tiếp | Bổ sung 6 câu từ phần–toàn thể đến phân số bằng nhau |
| Thứ tự phép tính và ngoặc | Có chuyên đề riêng | Có biểu thức nhưng chưa luyện tập trung | Bổ sung 6 câu và phân tích lỗi thường gặp |
| Lý thuyết số | Có nhánh Olympic | Chỉ xuất hiện rải rác | Bổ sung bội, ước, chia hết, số dư, số liên tiếp, phép toán mới |
| Logic quan hệ, tổng–hiệu, toán tuổi | Có | Có logic tổng quát nhưng thiếu vòng ôn ngắn | Bổ sung 6 câu gọi lại nhanh |
| Tổ hợp và nguyên lý bảo đảm | Có nhánh Olympic | Có cây khả năng/liệt kê, chưa có câu “chắc chắn” | Bổ sung 6 câu, gồm trường hợp xấu nhất |
| IQ hình, quay, đối xứng, Sudoku | Kho bài lớn | Có hình học sâu nhưng ít câu IQ ngắn | Bổ sung 6 câu chữ/hình ký hiệu thân thiện ngoại tuyến |
| Toán Việt–Anh | Đề song ngữ và đọc hai ngôn ngữ | Chỉ đọc tiếng Việt | Bổ sung 6 câu từ vựng toán và nút nghe tiếng Anh |
| Luyện xoắn ốc | Daily Quiz, 10/20 câu ngẫu nhiên | Có lịch ôn theo nhiệm vụ | Bổ sung vòng 10 câu xen kẽ tám mảng |
| Ôn câu sai | Có “Try hard” | Ghi nhu cầu ôn theo nhiệm vụ, chưa có kho câu sai riêng | Bổ sung cờ `needsReview` và phiên ôn riêng |
| Ba tầng gợi ý | Một nút trợ giúp thường cho lời giải gần hoàn chỉnh | Đã có ba tầng gợi ý | Giữ chuẩn Math Raccoon cho toàn bộ câu mới |
| Chuyển giao và phản tư | Không thấy trong mẫu bài luyện | Là cấu trúc cốt lõi | Không thay đổi; tiếp tục giữ ưu thế này |
| Thi đếm giờ/BOSS/phần thưởng dày | Có | Cố ý không chạy đua thời gian | Không sao chép; chỉ giữ động lực nhẹ và bằng chứng học tập |

## 3. Những gì không đưa vào

1. Không sao chép nguyên văn câu hỏi, hình ảnh, ngân hàng đề hoặc cấu trúc phần thưởng của OctoKids.
2. Không đưa đồng hồ đếm ngược vào vòng luyện hằng ngày vì mục tiêu của Math Raccoon là suy nghĩ chậm, giải thích và tự sửa.
3. Không gắn nhãn trẻ theo thứ hạng hoặc dùng phần thưởng để thay thế động lực khám phá.
4. Không đưa bài Olympic quá xa mức lớp 3 vào lộ trình bắt buộc; nội dung bổ sung chỉ là phòng luyện tự chọn.
5. Không làm loãng lộ trình 36 tuần × 5 buổi. Phòng luyện mới đứng ngoài tiến độ lõi và có thể bỏ qua.

## 4. Thiết kế đã triển khai

- 8 mảng × 6 câu = 48 câu gốc.
- Một vòng mặc định 10 câu, mỗi mảng xuất hiện ít nhất một lần trước khi hệ thống thêm câu thứ hai.
- Ưu tiên theo thứ tự: câu cần ôn → câu chưa gặp → câu đã làm nhưng chưa vững → câu đã vững.
- Mỗi câu có đáp án, 3 tầng gợi ý, lời giải và phản hồi nêu đúng sai lầm thường gặp.
- Câu sai được đánh dấu `needsReview`; cần hai lần đúng liên tiếp để được coi là đã vững.
- Hồ sơ v8 giữ lịch sử tối đa 30 vòng luyện và vẫn di chuyển bằng tệp sao lưu JSON.
- Toán tiếng Anh dùng giọng `en-US` của thiết bị; toàn bộ câu khác tiếp tục dùng giọng `vi-VN`.

## 5. Tiêu chí chấp nhận

- Đủ 48 mã câu duy nhất, đúng 6 câu cho mỗi mảng.
- Câu trắc nghiệm chứa đáp án và không có phương án trùng.
- Câu nhập số chỉ có đáp án số nguyên.
- Mỗi câu đủ 3 gợi ý, lời giải và phản hồi sai lầm.
- Phiên xoắn ốc không lặp câu và phủ đủ 8 mảng khi có ít nhất 8 câu.
- Phiên ôn ưu tiên đúng các câu mang cờ cần ôn.
- Hồ sơ v7 được chuyển sang v8 mà không mất đánh giá, nhiệm vụ, phản tư hoặc bài toán mở đã hoàn thành.
