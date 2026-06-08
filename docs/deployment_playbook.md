# 🚀 Cẩm Nang Xây Dựng & Triển Khai Amazon Dashboard

Tài liệu này lưu lại toàn bộ quá trình lịch sử chúng ta đã xây dựng dự án **Amazon Dashboard** từ con số 0 cho đến khi hoàn thiện đưa lên môi trường Internet thực tế (VPS). Bạn có thể dùng tài liệu này làm cẩm nang cho các dự án sau này.

---

## Giai đoạn 1: Khởi tạo dự án & Xây dựng Giao diện (Local)
1. **Khởi tạo hệ thống:** Sử dụng `Next.js 14` (App Router) kết hợp `TailwindCSS` và `shadcn/ui` để tạo khung dự án hiện đại và tốc độ cao.
2. **Thiết kế UI/UX:** Xây dựng giao diện Luxury tông màu Cam-Đen lấy cảm hứng từ Sellerboard, tối ưu hóa hiển thị thẻ thống kê (Sales, ACoS, RoAS, Lợi nhuận) và biểu đồ (Recharts) mượt mà.
3. **Quản lý mã nguồn:** Đẩy toàn bộ source code lên kho chứa (Repository) trên GitHub (Private) thông qua tài khoản `maotieumao419-del`.

---

## Giai đoạn 2: Cơ sở dữ liệu Supabase
1. **Tạo Database:** Cài đặt dự án trên nền tảng Supabase để quản lý Database PostgreSQL.
2. **Thiết kế bảng dữ liệu:**
   - `amazon_orders`: Lưu trữ thông tin đơn hàng từ SP-API.
   - `amazon_ad_campaigns`: Lưu trữ chiến dịch quảng cáo từ Ads API.
   - `amazon_ad_metrics`: Lưu các chỉ số hiệu suất quảng cáo (Clicks, Spend, Sales).
3. **Bảo mật (RLS):** Thiết lập `Row Level Security` cho phép `SELECT`, `INSERT`, `UPDATE` để API chạy ngầm có thể đẩy dữ liệu từ Amazon vào mà không bị lỗi block.

---

## Giai đoạn 3: Tích hợp Amazon API (Đồng bộ dữ liệu ngầm)
Chúng ta đã viết 2 luồng API chính bên trong thư mục `src/app/api/sync/...`:
1. **Amazon SP-API (`/api/sync/orders`):**
   - Nhiệm vụ: Kéo danh sách đơn hàng thực tế của Amazon Seller.
   - Cơ chế: Lấy LWA Access Token bằng `client_id`, `client_secret`, `refresh_token` -> Dùng `amazon-sp-api` để gọi endpoint lấy dữ liệu.
2. **Amazon Ads API v3 (`/api/sync/ads`):**
   - Nhiệm vụ: Kéo danh sách các chiến dịch Sponsored Products.
   - Cơ chế: Gọi endpoint `https://advertising-api.amazon.com/sp/campaigns/list` với header phiên bản v3.
3. **Xử lý Cache Next.js:** Đã gắn cờ `export const dynamic = "force-dynamic";` để đảm bảo API luôn chạy lệnh gọi dữ liệu mới nhất mỗi khi được kích hoạt, tránh bị kẹt dữ liệu cũ.

---

## Giai đoạn 4: Triển khai lên Máy chủ ảo (VPS Ubuntu)

### 1. Chuẩn bị môi trường máy chủ
- Cài đặt `Node.js` v20.x và trình quản lý gói `npm`.
- Cài đặt `Git` để kéo code.
- Cài đặt `PM2` để giữ trang web luôn chạy ngầm 24/7.
- Cài đặt `Nginx` làm Reverse Proxy điều phối tên miền.

### 2. Tải Code và Cài đặt
```bash
# Clone code từ GitHub (yêu cầu dùng Personal Access Token - PAT)
git clone https://github.com/maotieumao419-del/Minhdashboard.git
cd Minhdashboard

# Cài đặt thư viện & Build dự án
npm install
npm run build
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` bảo mật trên VPS chứa toàn bộ thông tin Amazon và Supabase:
```bash
nano .env.local
```
*(Bao gồm: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `AMAZON_SP_API_...`, `AMAZON_ADS_...`)*

### 4. Khởi chạy Ứng dụng với PM2
```bash
pm2 start npm --name "amazon-dashboard" -- start
pm2 save
pm2 startup
```

### 5. Cấu hình tên miền với Nginx
- Xóa trang mặc định của Nginx: `rm /etc/nginx/sites-enabled/default`
- Tạo file cấu hình Nginx mới: `nano /etc/nginx/sites-available/dashbroad.tap2soul.com`
- Thiết lập Nginx Proxy Pass trỏ cổng `80` của tên miền về cổng `3000` (nơi Next.js đang chạy).
- Kích hoạt cấu hình: `ln -s /etc/nginx/sites-available/... /etc/nginx/sites-enabled/`
- Khởi động lại Nginx: `systemctl restart nginx`

---

## Giai đoạn 5: Tự động hóa Dữ liệu (Cron Job)
Sử dụng công cụ `crontab` của Linux để tự động kích hoạt tiến trình đồng bộ dữ liệu vào các khung giờ cố định mà không cần ai tác động.

- Lệnh cài đặt: `crontab -e`
- Lệnh chạy ngầm (ví dụ: cứ 6 tiếng chạy 1 lần vào các giờ 0h, 6h, 12h, 18h):
```bash
0 */6 * * * curl -s http://localhost:3000/api/sync/orders >/dev/null 2>&1 && curl -s http://localhost:3000/api/sync/ads >/dev/null 2>&1
```

> [!TIP]
> **Tại sao dùng `localhost:3000`?**
> Vì lệnh này chạy ngầm ngay bên trong máy chủ VPS, nó gọi trực tiếp ứng dụng tại cổng nội bộ 3000 giúp tối đa hóa tốc độ, độ ổn định và không bị phụ thuộc vào phân giải DNS hay Nginx.

---
**🎉 HOÀN TẤT DỰ ÁN!** Mọi hệ thống giao diện, máy chủ, đồng bộ hóa và bảo mật đều đã được tự động hóa hoàn toàn. Tên miền `dashbroad.tap2soul.com` chính thức lên sóng phục vụ bạn.
