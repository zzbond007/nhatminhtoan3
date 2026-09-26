# Math Raccoon – Toán nâng cao lớp 3

Math Raccoon là ứng dụng web tĩnh dành cho việc luyện toán nâng cao lớp 3. Ứng dụng không gọi ChatGPT hoặc OpenAI API khi trẻ học, không yêu cầu đăng nhập và lưu tiến trình ngay trên thiết bị.

Phiên bản nội dung v11 gồm:

- lộ trình 9 tháng gồm 36 tuần × 5 buổi, tổng cộng 180 buổi lõi;
- 36 chủ đề cốt lõi thuộc 6 miền năng lực;
- 12 phiên bản cho mỗi chủ đề, tương đương 432 phiên bản nhiệm vụ và hơn 2.160 câu luyện;
- ba dải thích ứng **Gỡ nút – Vừa sức – Bứt phá** dựa trên mức tự lực, gợi ý và chuyển giao;
- 60 câu đố nhanh;
- 36 bài toán mở chia thành 9 gói tháng, có đề, vật liệu, gợi ý, hướng dẫn đáp án, nguồn và xác nhận của phụ huynh.
- **Phòng luyện xoắn ốc** với 48 câu thuộc 8 mảng bổ sung: giá trị hàng, phân số, thứ tự phép tính, lý thuyết số, logic quan hệ/toán tuổi, tổ hợp, IQ hình và Toán tiếng Anh;
- vòng luyện 10 câu ưu tiên nội dung chưa học hoặc chưa vững, kèm kho ôn câu sai, ba tầng gợi ý và phản hồi theo sai lầm thường gặp;
- **Đảo Khủng Long**: 36 loài khủng long ứng với 36 nhiệm vụ; mỗi phiên bản nhiệm vụ hoàn thành cho mảnh trứng theo dải thích ứng, độ sâu gợi ý và việc giải hai cách; đủ 4 mảnh thì trứng nở, ôn lại nhiệm vụ ở vòng sau thì khủng long lớn lên; bài toán mở nở trứng Huyền thoại, mốc 7/30/60 ngày học nở trứng Đặc biệt;
- 48 loài khủng long vẽ bằng SVG theo 6 dáng cơ thể (36 loài theo nhiệm vụ và 12 loài Hiếm/Huyền thoại), lớn lên thấy rõ qua 3 giai đoạn; **Tổ ấm** chăm sóc bạn đồng hành, **Bộ sưu tập** hiện đủ ô cho loài chưa gặp, **Trứng Bí Ẩn** xuất hiện sau một số buổi học không báo trước;
- **Hành trình 36 trạm** thay bản đồ tĩnh, mỗi 6 tuần có một trạm ẩn chỉ mở khi con Bứt phá ở tuần đó;
- câu chuyện, câu dự đoán và câu thử nghiệm của 36 nhiệm vụ đặt trong bối cảnh khủng long (số liệu giữ nguyên), kèm 36 **Nhiệm vụ đời thực** cho Buổi 4;
- chuỗi ngày học có 2 ngày nghỉ có phép mỗi tháng;
- **Đánh giá Tháng** 9 câu sau mỗi 4 tuần, không lặp câu cũ, so với lần trước bằng thanh tiến trình và **Bản đồ Năng lực 6 Chiều** (cũng có ngay sau bài đánh giá đầu vào);
- Phòng luyện ưu tiên **Mảng nổi bật của tuần**; câu chỉ vào hàng ôn khi đã mở đủ 3 tầng gợi ý mà vẫn chưa ra;
- **Trứng Dũng cảm** khuyến khích thử trước khi xin gợi ý, mỗi phiên bản nhiệm vụ chỉ trao mảnh trứng một lần, hoạt ảnh nở trứng có âm thanh tuỳ chọn;
- Thẻ gợi mở cho phụ huynh và nhãn thời lượng ở bài toán mở; chữ lớn khi đọc to đề;
- đồng bộ tuỳ chọn qua Google Sheets của gia đình (xem [docs/cloud-sync/HUONG_DAN.md](docs/cloud-sync/HUONG_DAN.md)).

### Nâng cấp trải nghiệm học (v12)

- **Bàn phím số ảo** (`components/virtual-numpad.tsx`): ô đáp án chỉ đọc nên iPad không bật bàn phím hệ thống; phím ≥ 54px, rung nhẹ khi hỗ trợ. **Chế độ tập trung** ẩn điều hướng và dải thông tin khi con đang giải bài.
- **Bảng vẽ nháp** (`components/scratchpad.tsx`): lớp canvas trong suốt, bút 3 màu, tẩy, xóa hết, vẽ đa điểm bằng ngón tay/Apple Pencil.
- **Đọc đề karaoke** (`app/speech-service.ts`): tô sáng từng từ theo `onboundary`; tự chuyển sang ước lượng thời gian nếu giọng Việt trên iPad không phát sự kiện này.
- **Gợi ý 3 tầng có khoá 15 giây** và thưởng Tia sáng 10/5/2/1 theo độ sâu gợi ý (`app/hint-scaffold.ts`).
- **Phòng Luyện Xoắn Ốc — biến thể** (`app/spiral-engine.ts`): dạng bài sai quay lại sau 24 giờ với số liệu mới cùng cấu trúc; sai 2 lần liên tiếp thì hạ bậc (số nhỏ, sơ đồ đoạn thẳng mở sẵn).
- **Bảo tàng Hóa thạch** (`app/fossil-streak.ts`): nhịp 5 buổi/tuần, không reset về 0, 2 Khiên hóa thạch mỗi tháng.
- **Cổng Phụ Huynh** ở Buổi 5 và **Báo cáo Radar Canvas** kèm khuyến nghị sau bài khảo sát 18 câu.
- `migrateStorageData()` (`app/storage-migration.ts`) giữ nguyên tiến trình cũ, cất một bản sao `math-raccoon-backup-before-v12` trước lần nâng cấp đầu tiên.

## Cài miễn phí bằng GitHub Pages

1. Tạo một repository **Public** trên GitHub, gợi ý tên `math-raccoon`.
2. Đưa toàn bộ mã nguồn trong thư mục này lên nhánh `main`.
3. Mở **Settings → Pages** của repository.
4. Trong **Build and deployment → Source**, chọn **GitHub Actions**.
5. Mở tab **Actions** và chờ quy trình **Deploy Math Raccoon to GitHub Pages** hoàn tất.
6. Website sẽ có địa chỉ dạng `https://TEN-GITHUB.github.io/math-raccoon/`.

Mỗi lần nhánh `main` nhận thay đổi đã được duyệt, GitHub Actions tự kiểm tra nội dung, dựng bản web tĩnh và cập nhật website.

Các đường dẫn nội dung được xuất sẵn thành trang tĩnh để GitHub Pages mở trực tiếp:

- `/week/1/` đến `/week/36/`;
- `/topic/1/` đến `/topic/36/`;
- `/lesson/1/` đến `/lesson/180/`.

`404.html` giữ vai trò chuyển tiếp dự phòng cho URL cũ chưa có dấu gạch chéo cuối. Bộ kiểm tra sau khi dựng sẽ dừng triển khai nếu thiếu bất kỳ nhóm đường dẫn nào.

## Cài trên iPad

1. Mở địa chỉ GitHub Pages bằng Safari khi đang có mạng.
2. Chờ mục **Góc đồng hành** báo **Đã sẵn sàng học ngoại tuyến**.
3. Nhấn **Chia sẻ → Thêm vào Màn hình chính → Thêm**.
4. Mở Math Raccoon từ icon mới trên màn hình iPad.
5. Thử tắt Wi-Fi và mở lại ứng dụng để xác nhận chế độ ngoại tuyến.

Nếu iPad vẫn hiện icon cũ, hãy xóa biểu tượng cũ khỏi Màn hình chính rồi thêm lại từ Safari. Việc này không xóa tiến trình trong Safari, nhưng vẫn nên dùng nút **Sao lưu** trước khi thay đổi lớn.

## Cập nhật nội dung có kiểm duyệt

Ứng dụng không đưa bài lấy trực tiếp hoặc ngẫu nhiên từ Internet cho trẻ. Nguồn ngoài chỉ dùng để biên soạn gói bài mới; gói phải đi qua cổng kiểm duyệt và phụ huynh xác nhận. Một bản cập nhật chỉ được phát hành khi `public/content-release.json` có đủ các kiểm tra:

- phù hợp mục tiêu chương trình;
- đáp án và lời giải đã được xác minh;
- ngôn ngữ phù hợp với trẻ;
- không có liên kết hoặc thu thập dữ liệu ngoài dự kiến.

Quy trình cập nhật:

1. Chỉnh nội dung lõi trong `app/content.ts`, `app/curriculum.ts`, `app/missions.ts` hoặc bộ sinh biến thể `app/mission-variants.ts`.
2. Kiểm tra lại toàn bộ đáp án, gợi ý và câu chuyển giao.
3. Tăng `version` trong `public/content-release.json` theo dạng `YYYY.MM.DD.N`.
4. Viết ghi chú ngắn trong `notes` để phụ huynh biết phần nào thay đổi.
5. Chỉ đặt `approval.status` thành `approved-for-release` sau khi các mục kiểm tra đều đạt.
6. Chạy `npm run content:validate` và `npm run build:github`.
7. Đưa thay đổi lên nhánh `main`. GitHub Pages sẽ triển khai bản mới.
8. Trên iPad, phụ huynh mở **Góc đồng hành → Kiểm tra nội dung mới**, đọc ghi chú rồi chọn **Phụ huynh đồng ý cập nhật**.

### Thêm gói bài toán mở từ Internet

1. Viết lại bài theo ngôn ngữ và mục tiêu của Math Raccoon; không sao chép nguyên văn nguồn.
2. Thêm gói JSON vào `public/content-packs/` và khai báo trong `public/content-catalog.json`.
3. Mỗi bài phải có 3 câu khởi động, 3 tầng gợi ý, câu hỏi gia đình, đường dẫn nguồn HTTPS và ghi chú cách chuyển thể.
4. Chỉ dùng nguồn trong danh sách đã duyệt; hiện gồm Bộ GDĐT, NRICH và YouCubed.
5. Hoàn tất năm mục kiểm tra của gói: chương trình, đáp án/ràng buộc, ngôn ngữ trẻ em, bản quyền/nguồn và riêng tư/liên kết.
6. Chạy `npm run content:validate`. Gói thiếu nguồn, trùng mã hoặc chưa đủ kiểm tra sẽ bị chặn.
7. Sau khi GitHub Pages cập nhật, phụ huynh mở **Phòng kiểm duyệt 9 tháng**, xem từng bài rồi chọn **Tôi đã xem · Duyệt và cài tháng này**.

Kho năm học được tạo lại bằng `node scripts/generate-nine-month-packs.mjs`. Tệp nguồn này chứa 36 đề nguyên bản và xuất ra 9 gói JSON; sau khi thay đổi phải chạy lại bộ sinh rồi mới kiểm tra nội dung.

Gói đã cài được service worker lưu lại để học ngoại tuyến. Liên kết nguồn chỉ xuất hiện trong phần dành cho phụ huynh.

Nếu bản phát hành thiếu trạng thái kiểm duyệt, quy trình dựng website sẽ dừng và ứng dụng trên iPad từ chối cài bản đó.

## Sao lưu tiến trình

Tiến trình học nằm trong bộ nhớ Safari của từng thiết bị, không nằm trong GitHub và không gắn với tài khoản ChatGPT.

- Chọn **Xuất mã tiến trình** để có một đoạn mã (bắt đầu bằng `MR1`) chứa toàn bộ tiến độ; dán mã vào Ghi chú hoặc gửi cho chính mình.
- Trên máy khác, dán mã vào ô **Nhập mã tiến trình** để học tiếp. Mã có phần kiểm tra nên nếu chép thiếu ký tự, ứng dụng sẽ báo và giữ nguyên dữ liệu hiện tại.
- Muốn đồng bộ nhiều máy tự động, cài **Đồng bộ Google Sheets** theo [hướng dẫn](docs/cloud-sync/HUONG_DAN.md).
- Chọn **Sao lưu** để tải tệp JSON.
- Chọn **Khôi phục** để chuyển hồ sơ sang iPad khác.
- Nên sao lưu mỗi tháng hoặc trước khi xóa dữ liệu Safari.

## Lệnh dành cho người phát triển

Yêu cầu Node.js 22 trở lên.

```bash
npm ci
npm run content:validate
NEXT_PUBLIC_BASE_PATH=/math-raccoon npm run build:github
```

Bản GitHub Pages được xuất vào thư mục `out/`. Service worker được tạo sau khi dựng và lưu toàn bộ HTML, JavaScript, CSS, biểu tượng và nội dung cần thiết để học ngoại tuyến.

## Giới hạn dữ liệu

- Đồng bộ đám mây là tuỳ chọn và cần phụ huynh tự cài Apps Script trong Google Sheets của gia đình.
- Xóa dữ liệu Safari có thể xóa tiến trình nếu chưa sao lưu.
- Giọng đọc tiếng Việt phụ thuộc vào giọng hệ thống có sẵn trên iPad.
