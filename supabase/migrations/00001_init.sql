-- Bảng lưu trữ dữ liệu Đơn hàng từ Amazon SP-API
CREATE TABLE IF NOT EXISTS public.amazon_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amazon_order_id TEXT UNIQUE NOT NULL,
    purchase_date TIMESTAMPTZ NOT NULL,
    order_status TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng lưu trữ thông tin các Chiến dịch Quảng cáo từ Ads API
CREATE TABLE IF NOT EXISTS public.amazon_ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng lưu trữ chỉ số hiệu suất Quảng cáo theo ngày
CREATE TABLE IF NOT EXISTS public.amazon_ad_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id TEXT REFERENCES public.amazon_ad_campaigns(campaign_id),
    report_date DATE NOT NULL,
    spend DECIMAL(10, 2) DEFAULT 0,
    sales DECIMAL(10, 2) DEFAULT 0,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, report_date)
);

-- Thiết lập bảo mật cơ bản: Bật Row Level Security (RLS) để an toàn
ALTER TABLE public.amazon_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amazon_ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amazon_ad_metrics ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép mọi người đọc dữ liệu (vì đây là dashboard nội bộ, ta tạm thời mở read access)
CREATE POLICY "Allow read access for all" ON public.amazon_orders FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.amazon_ad_campaigns FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.amazon_ad_metrics FOR SELECT USING (true);
