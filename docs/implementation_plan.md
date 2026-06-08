# Kế hoạch Tích hợp Amazon Ads Reporting API (Nguồn thứ 3)

## Giải đáp câu hỏi của bạn
1. **Về thông tin API:** **KHÔNG CẦN XIN THÊM GÌ CẢ!** Các token (Ads API Client ID, Secret, Refresh Token, Profile ID) mà bạn đã cung cấp cho mình hoàn toàn đủ quyền và khả năng để gọi luồng Reporting API này.
2. **Về việc chờ đợi:** Việc phải chờ **không phải do code của chúng ta yếu**, mà đây là **luật bắt buộc của máy chủ Amazon**. Amazon quy định: Bất kỳ ai muốn xuất báo cáo đều phải "xếp hàng". Amazon sẽ gom dữ liệu của bạn thành một cục file `.json.gz`, khi nào họ nén file xong thì họ mới báo cho code của chúng ta đường link để tải về.

## Kế hoạch triển khai kỹ thuật (Thực hiện hoàn toàn tự động)

Mình sẽ viết thêm code vào tiến trình đồng bộ dữ liệu hiện tại để giải quyết quy trình "nói chuyện" phức tạp với Amazon:

### Bước 1: Gửi lệnh yêu cầu Báo cáo (Request Report)
- **[MODIFY]** `src/app/api/sync/ads/route.ts`
- Code sẽ gọi lên endpoint `POST /reporting/reports` của Amazon Ads API v3.
- Cấu hình báo cáo yêu cầu Amazon xuất theo **từng ngày (DAILY)** với các cột: `campaignId`, `cost` (Spend), `impressions`, `clicks`, `sales14d` (Doanh thu từ Ads).
- Amazon sẽ trả về một cái Mã số chờ (`reportId`).

### Bước 2: Vòng lặp chờ đợi (Polling)
- Code sẽ tự động hỏi Amazon liên tục (cách nhau khoảng 5-10 giây): *"Báo cáo `reportId` này đã xong chưa?"*
- Khi trạng thái đổi từ `PENDING` sang `SUCCESS`, Amazon sẽ trả về một đường link tải file (`url`).

### Bước 3: Tải, Giải nén và Lưu vào Supabase
- Tải file nén dạng GZIP từ đường link trên.
- Sử dụng thư viện giải nén `zlib` (có sẵn của Node.js) để bung file GZIP thành dữ liệu JSON.
- Đọc từng dòng dữ liệu và thực hiện **Upsert (Lưu mới/Cập nhật)** vào bảng `amazon_ad_metrics` trong Supabase.

### 4. Hiển thị lên Dashboard
- **[MODIFY]** `src/services/dashboard.service.ts`
- Sửa lại hàm tính toán Profit để thay thế công thức "trừ 40% giả định" bằng số `cost` (Spend) thật vừa lấy được từ bảng `amazon_ad_metrics`.

## Open Questions
> [!IMPORTANT]  
> Quy trình 3 bước tải báo cáo này thường sẽ mất khoảng 10-30 giây cho mỗi lần chạy đồng bộ. Vì bạn đã cài đặt cronjob chạy ngầm (6 tiếng 1 lần) trên máy chủ, nên việc chờ đợi này sẽ diễn ra hoàn toàn trong bóng tối, bạn sẽ không bao giờ cảm nhận được sự chậm trễ khi xem giao diện web.
> 
> Bạn có đồng ý với quy trình tự động tải báo cáo này không để mình bắt tay vào viết code?
