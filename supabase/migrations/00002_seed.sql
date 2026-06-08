-- 1. Xóa dữ liệu cũ nếu có (để có thể chạy lại file này nhiều lần mà không bị lỗi trùng lặp)
TRUNCATE TABLE public.amazon_orders CASCADE;
TRUNCATE TABLE public.amazon_ad_metrics CASCADE;
TRUNCATE TABLE public.amazon_ad_campaigns CASCADE;

-- 2. Tạo 2 chiến dịch quảng cáo mẫu
INSERT INTO public.amazon_ad_campaigns (campaign_id, name, raw_data) VALUES
('CAMP_001', 'Sponsored Products - Auto', '{"type": "SP", "status": "enabled"}'),
('CAMP_002', 'Sponsored Brands - Main', '{"type": "SB", "status": "enabled"}');

-- 3. Tạo dữ liệu quảng cáo (Chi phí và Doanh thu) cho 30 ngày qua bằng hàm sinh tự động (generate_series)
-- Chiến dịch 1
INSERT INTO public.amazon_ad_metrics (campaign_id, report_date, spend, sales, raw_data)
SELECT 
    'CAMP_001', 
    (CURRENT_DATE - i)::date,
    round((random() * 50 + 10)::numeric, 2), -- Chi phí (Spend) ngẫu nhiên từ 10 - 60
    round((random() * 300 + 50)::numeric, 2), -- Doanh thu (Sales) ngẫu nhiên từ 50 - 350
    '{"impressions": 1500, "clicks": 45}'::jsonb
FROM generate_series(0, 30) i;

-- Chiến dịch 2
INSERT INTO public.amazon_ad_metrics (campaign_id, report_date, spend, sales, raw_data)
SELECT 
    'CAMP_002', 
    (CURRENT_DATE - i)::date,
    round((random() * 100 + 20)::numeric, 2), -- Chi phí (Spend) ngẫu nhiên từ 20 - 120
    round((random() * 600 + 100)::numeric, 2), -- Doanh thu (Sales) ngẫu nhiên từ 100 - 700
    '{"impressions": 3000, "clicks": 90}'::jsonb
FROM generate_series(0, 30) i;

-- 4. Tạo 500 Đơn hàng mẫu ngẫu nhiên trải đều trong 30 ngày qua
INSERT INTO public.amazon_orders (amazon_order_id, purchase_date, order_status, raw_data)
SELECT 
    'ORDER_' || substr(md5(random()::text), 1, 10),
    NOW() - (random() * 30 || ' days')::interval,
    CASE WHEN random() > 0.1 THEN 'Shipped' ELSE 'Pending' END,
    jsonb_build_object(
        'orderTotal', jsonb_build_object('amount', round((random() * 100 + 20)::numeric, 2)),
        'fees', jsonb_build_object('amount', round((random() * 15 + 5)::numeric, 2)),
        'refunds', CASE WHEN random() > 0.9 THEN round((random() * 30 + 10)::numeric, 2) ELSE 0 END
    )
FROM generate_series(1, 500);
