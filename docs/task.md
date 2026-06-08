# Tích hợp Amazon Ads Reporting API

- `[x]` Xây dựng luồng Ads Reporting API v3
  - `[x]` Thêm cấu hình gửi yêu cầu Report (`POST /reporting/reports`).
  - `[x]` Tạo vòng lặp Polling kiểm tra trạng thái báo cáo (`GET /reporting/reports/{reportId}`).
  - `[x]` Tải file GZIP, giải nén và Upsert vào bảng `amazon_ad_metrics` trên Supabase.
- `[x]` Cập nhật `dashboard.service.ts`
  - `[x]` Lấy chi phí quảng cáo (Spend) thật từ bảng `amazon_ad_metrics`.
  - `[x]` Cập nhật công thức tính Profit.
- `[x]` Chạy thử nghiệm và Đẩy code lên GitHub.

## Trạng thái Lưu (Save Point) cho Phiên làm việc tiếp theo:
- **Codebase:** Đã cập nhật hoàn chỉnh, xử lý triệt để lỗi TypeScript và đẩy toàn bộ lên nhánh `main` trên GitHub.
- **Amazon Ads API:** Đã lập trình xong luồng tự động yêu cầu tạo báo cáo (Performance Report V3), vòng lặp chờ tối đa 10 phút, tự động tải file GZIP, giải nén trong RAM, và chắt lọc các chỉ số (`spend`, `sales14d`, `impressions`, `clicks`) để ghi đè (upsert) thẳng vào bảng `amazon_ad_metrics` trên Supabase.
- **Dashboard:** Bảng điều khiển Web (`dashboard.service.ts`) đã được lập trình để tự động lấy số tiền `spend` thật từ cơ sở dữ liệu trừ đi để ra Net Profit chính xác.
- **Trạng thái trên VPS của User:** Mã nguồn đã được Pull, Install, Build và chạy thành công trên VPS. Lệnh `curl` đang được chạy trên VPS và đang trong thời gian chờ Amazon trả file báo cáo về. Sau khi lệnh này chạy xong, dữ liệu giả (Mock) sẽ bị xóa bỏ và thay bằng dữ liệu thật, giao diện Web sẽ tự động chuẩn xác!
