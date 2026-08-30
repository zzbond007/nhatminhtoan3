# Math Raccoon – Toán nâng cao lớp 3

Math Raccoon là ứng dụng web tĩnh dành cho việc luyện toán nâng cao lớp 3. Ứng dụng không gọi ChatGPT hoặc OpenAI API khi trẻ học, không yêu cầu đăng nhập và lưu tiến trình ngay trên thiết bị.

## Cài miễn phí bằng GitHub Pages

1. Tạo một repository **Public** trên GitHub, gợi ý tên `math-raccoon`.
2. Đưa toàn bộ mã nguồn trong thư mục này lên nhánh `main`.
3. Mở **Settings → Pages** của repository.
4. Trong **Build and deployment → Source**, chọn **GitHub Actions**.
5. Mở tab **Actions** và chờ quy trình **Deploy Math Raccoon to GitHub Pages** hoàn tất.
6. Website sẽ có địa chỉ dạng `https://TEN-GITHUB.github.io/math-raccoon/`.

Mỗi lần nhánh `main` nhận thay đổi đã được duyệt, GitHub Actions tự kiểm tra nội dung, dựng bản web tĩnh và cập nhật website.

## Cài trên iPad

1. Mở địa chỉ GitHub Pages bằng Safari khi đang có mạng.
2. Chờ mục **Góc đồng hành** báo **Đã sẵn sàng học ngoại tuyến**.
3. Nhấn **Chia sẻ → Thêm vào Màn hình chính → Thêm**.
4. Mở Math Raccoon từ icon mới trên màn hình iPad.
5. Thử tắt Wi-Fi và mở lại ứng dụng để xác nhận chế độ ngoại tuyến.

Nếu iPad vẫn hiện icon cũ, hãy xóa biểu tượng cũ khỏi Màn hình chính rồi thêm lại từ Safari. Việc này không xóa tiến trình trong Safari, nhưng vẫn nên dùng nút **Sao lưu** trước khi thay đổi lớn.

## Cập nhật nội dung có kiểm duyệt

Ứng dụng không lấy bài ngẫu nhiên từ Internet. Một bản cập nhật chỉ được phát hành khi `public/content-release.json` có đủ bốn kiểm tra:

- phù hợp mục tiêu chương trình;
- đáp án và lời giải đã được xác minh;
- ngôn ngữ phù hợp với trẻ;
- không có liên kết hoặc thu thập dữ liệu ngoài dự kiến.

Quy trình cập nhật:

1. Chỉnh nội dung trong `app/content.ts`, `app/curriculum.ts` hoặc `app/missions.ts`.
2. Kiểm tra lại toàn bộ đáp án, gợi ý và câu chuyển giao.
3. Tăng `version` trong `public/content-release.json` theo dạng `YYYY.MM.DD.N`.
4. Viết ghi chú ngắn trong `notes` để phụ huynh biết phần nào thay đổi.
5. Chỉ đặt `approval.status` thành `approved-for-release` sau khi các mục kiểm tra đều đạt.
6. Chạy `npm run content:validate` và `npm run build:github`.
7. Đưa thay đổi lên nhánh `main`. GitHub Pages sẽ triển khai bản mới.
8. Trên iPad, phụ huynh mở **Góc đồng hành → Kiểm tra nội dung mới**, đọc ghi chú rồi chọn **Phụ huynh đồng ý cập nhật**.

Nếu bản phát hành thiếu trạng thái kiểm duyệt, quy trình dựng website sẽ dừng và ứng dụng trên iPad từ chối cài bản đó.

## Sao lưu tiến trình

Tiến trình học nằm trong bộ nhớ Safari của từng thiết bị, không nằm trong GitHub và không gắn với tài khoản ChatGPT.

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

- Không có đồng bộ đám mây giữa nhiều thiết bị.
- Xóa dữ liệu Safari có thể xóa tiến trình nếu chưa sao lưu.
- Giọng đọc tiếng Việt phụ thuộc vào giọng hệ thống có sẵn trên iPad.
