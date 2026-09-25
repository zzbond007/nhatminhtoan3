# Đồng bộ tiến trình Math Raccoon qua Google Sheets

Tính năng này **không bắt buộc**. Khi chưa cài, ứng dụng vẫn lưu trên trình duyệt và có Mã tiến trình để sao lưu.
Khi cài, tiến trình được lưu vào **Google Sheets của chính gia đình** — không qua máy chủ nào khác.

## Cài một lần (khoảng 5 phút)

1. Mở Google Sheets bằng tài khoản Google của phụ huynh, tạo một bảng tính trống, đặt tên ví dụ “Math Raccoon – Tiến trình”.
2. Chọn **Tiện ích mở rộng → Apps Script**.
3. Xoá toàn bộ mã mẫu, dán nội dung tệp [`MathRaccoonSync.gs`](MathRaccoonSync.gs), bấm **Lưu**.
4. Chọn **Triển khai → Tùy chọn triển khai mới**:
   - Loại: **Ứng dụng web**
   - Thực thi với tư cách: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
   - Bấm **Triển khai**, cho phép quyền truy cập bảng tính khi Google hỏi.
5. Sao chép **URL ứng dụng web** (kết thúc bằng `/exec`).

## Kết nối trong ứng dụng

1. Mở Math Raccoon → **Góc đồng hành → Đồng bộ Google Sheets**.
2. Dán URL, đặt **mã gia đình** (ví dụ `nha-minh`) và **mã PIN** 4–8 số.
3. Trên máy đang có tiến trình, bấm **Lưu lên đám mây**.
4. Trên máy khác, nhập đúng URL, mã gia đình, mã PIN rồi bấm **Tải từ đám mây**.
5. Có thể bật **Tự động lưu**: ứng dụng tự lưu khoảng 12 giây sau mỗi thay đổi.

## An toàn dữ liệu

- Mã PIN chỉ được gửi dưới dạng băm SHA-256; bảng tính không chứa PIN gốc.
- Tự động lưu chỉ bật được sau khi máy đó đã **Lưu** hoặc **Tải** thủ công một lần, nên một máy mới còn trống không thể ghi đè dữ liệu trên đám mây.
- Nếu một máy khác vừa lưu, tự động lưu tạm dừng và ứng dụng hỏi phụ huynh muốn giữ bản nào.
- Ai có URL, mã gia đình **và** mã PIN mới đọc được dữ liệu. Không chia sẻ ba thông tin này cùng lúc.
- Muốn ngừng đồng bộ: trong Apps Script chọn **Triển khai → Quản lý các lần triển khai → Lưu trữ**; dữ liệu vẫn nằm trong bảng tính của gia đình.
