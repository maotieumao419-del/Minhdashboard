# Kiến Trúc Database: Amazon SP-API & Ads API

Tài liệu này lưu trữ phương án thiết kế cơ sở dữ liệu đã thống nhất để sử dụng cho giai đoạn phát triển Backend tích hợp với hệ sinh thái Amazon.

## 1. Công nghệ lựa chọn
*   **Nền tảng:** Supabase (Cloud Database).
*   **Core Engine:** PostgreSQL.
*   **Lý do:** Tận dụng sức mạnh của cơ sở dữ liệu quan hệ (Relational) để JOIN dữ liệu tài chính/quảng cáo, đồng thời sử dụng tính năng `JSONB` của PostgreSQL để lưu trữ payload nguyên bản (raw data) phức tạp từ Amazon mà không cần bóc tách ngay lập tức.

## 2. Hướng dẫn cấu trúc bảng (Schema Guidelines)

Dữ liệu trả về từ Amazon chia làm nhiều luồng, chúng ta sẽ thiết kế theo mô hình Hybrid: Cột định tuyến (Structured) + Cột JSONB (Unstructured).

### 2.1. Dữ liệu Đơn hàng (SP-API: Orders)
Tạo bảng `amazon_orders`
*   `id` (UUID, Primary Key)
*   `amazon_order_id` (String, Unique) - Mã đơn hàng gốc
*   `purchase_date` (Timestamp) - Ngày mua để lọc báo cáo
*   `order_status` (String) - Trạng thái đơn (Shipped, Pending...)
*   `raw_data` (JSONB) - Lưu nguyên cục JSON `Order` trả về từ API (chứa địa chỉ, chi tiết thanh toán...).

### 2.2. Dữ liệu Quảng cáo (Ads API: Campaigns & Metrics)
Tạo bảng `amazon_ad_campaigns`
*   `id` (UUID, Primary Key)
*   `campaign_id` (String, Unique) - Mã chiến dịch Amazon
*   `name` (String) - Tên chiến dịch
*   `raw_data` (JSONB) - Dữ liệu chi tiết chiến dịch.

Tạo bảng `amazon_ad_metrics` (Bảng này dùng để lưu báo cáo chỉ số mỗi ngày)
*   `id` (UUID, Primary Key)
*   `campaign_id` (String, Foreign Key) - Liên kết tới bảng Campaign
*   `report_date` (Date) - Ngày của số liệu
*   `spend` (Decimal) - Số tiền đã chi tiêu
*   `sales` (Decimal) - Doanh thu mang lại từ quảng cáo
*   `raw_data` (JSONB) - Các chỉ số khác (Impressions, Clicks...).

## 3. Quản lý Tokens và Bảo mật (SP-API & Ads API)

Amazon API yêu cầu quy trình xác thực (OAuth 2.0 / IAM) rất khắt khe. Chúng ta KHÔNG lưu Hardcode Token trong code.

*   **Supabase Vault / Secret Manager:** Sử dụng tính năng Vault của Supabase để mã hóa và lưu trữ các khóa nhạy cảm:
    *   `LWA_CLIENT_ID` & `LWA_CLIENT_SECRET` (Login with Amazon).
    *   `SP_API_REFRESH_TOKEN` (Token làm mới để cấp Access Token liên tục).
    *   `AWS_IAM_USER_ACCESS_KEY` & `SECRET_KEY` (Dùng để ký Signature v4 cho request).
*   **Lưu ý khi code Backend:** Access Token của Amazon thường chỉ sống được 1 tiếng (3600s). Backend cần viết một hàm tự động gọi Refresh Token để lấy Access Token mới trước khi gọi API, không cần lưu Access Token vào Database cố định (chỉ lưu trong RAM hoặc Redis Cache tạm thời).
