import { supabase } from '@/lib/supabase';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface DashboardMetrics {
  sales: number;
  orders: number;
  refunds: number;
  grossProfit: number;
  netProfit: number;
  estPayout: number;
}

// Hàm hỗ trợ format tiền tệ
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export async function getMetricsForDateRange(startDate: string, endDate: string): Promise<DashboardMetrics> {
  // Lấy đơn hàng
  const { data: orders } = await supabase
    .from('amazon_orders')
    .select('raw_data')
    .gte('purchase_date', startDate)
    .lte('purchase_date', endDate + 'T23:59:59'); // Lấy hết ngày

  // Lấy chi phí quảng cáo
  const { data: adMetrics } = await supabase
    .from('amazon_ad_metrics')
    .select('spend')
    .gte('report_date', startDate)
    .lte('report_date', endDate);

  let totalSales = 0;
  let totalOrders = orders?.length || 0;
  let totalRefunds = 0;
  let totalAmazonFees = 0;

  orders?.forEach(order => {
    const raw = order.raw_data as any;
    // Hỗ trợ cả dữ liệu mẫu (orderTotal) và dữ liệu thật (OrderTotal)
    const salesAmount = raw?.OrderTotal?.Amount || raw?.orderTotal?.amount || 0;
    const refundsAmount = raw?.refunds || 0;
    const feesAmount = raw?.fees?.amount || 0;

    totalSales += Number(salesAmount);
    totalRefunds += Number(refundsAmount);
    totalAmazonFees += Number(feesAmount);
  });

  let totalAdSpend = 0;
  adMetrics?.forEach(metric => {
    totalAdSpend += Number(metric.spend || 0);
  });

  const grossProfit = totalSales * 0.4; // Giả định biên lợi nhuận sản phẩm (Margin) là 40%
  const netProfit = grossProfit - totalAdSpend - totalRefunds - totalAmazonFees;
  const estPayout = totalSales - totalAmazonFees - totalRefunds;

  return {
    sales: totalSales,
    orders: totalOrders,
    refunds: totalRefunds,
    grossProfit,
    netProfit,
    estPayout
  };
}

export async function getDashboardTilesData() {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const startOfThisMonth = startOfMonth(today);
  const startOfLastMonth = startOfMonth(subMonths(today, 1));
  const endOfLastMonth = endOfMonth(subMonths(today, 1));

  const formatFn = (d: Date) => format(d, 'yyyy-MM-dd');

  // Chạy các queries song song để tối ưu tốc độ
  const [todayMetrics, yesterdayMetrics, mtdMetrics, lastMonthMetrics] = await Promise.all([
    getMetricsForDateRange(formatFn(today), formatFn(today)),
    getMetricsForDateRange(formatFn(yesterday), formatFn(yesterday)),
    getMetricsForDateRange(formatFn(startOfThisMonth), formatFn(today)),
    getMetricsForDateRange(formatFn(startOfLastMonth), formatFn(endOfLastMonth))
  ]);

  return {
    today: todayMetrics,
    yesterday: yesterdayMetrics,
    monthToDate: mtdMetrics,
    forecast: { ...mtdMetrics, sales: mtdMetrics.sales * 1.5, netProfit: mtdMetrics.netProfit * 1.5 }, // Giả lập forecast
    lastMonth: lastMonthMetrics
  };
}

export async function getChartData() {
  const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: orders } = await supabase
    .from('amazon_orders')
    .select('purchase_date, raw_data')
    .gte('purchase_date', startDate)
    .lte('purchase_date', endDate + 'T23:59:59');

  const { data: adMetrics } = await supabase
    .from('amazon_ad_metrics')
    .select('report_date, spend')
    .gte('report_date', startDate)
    .lte('report_date', endDate);

  // Gom nhóm dữ liệu theo ngày
  const chartMap: Record<string, { date: string, sales: number, profit: number, adCost: number }> = {};

  // Khởi tạo các ngày trống trước (nếu cần mượt thì dùng vòng lặp tạo đủ 30 ngày)
  
  orders?.forEach(order => {
    const dateStr = (order.purchase_date as string).split('T')[0];
    if (!chartMap[dateStr]) {
      chartMap[dateStr] = { date: dateStr, sales: 0, profit: 0, adCost: 0 };
    }
    const raw = order.raw_data as any;
    const salesAmount = raw?.OrderTotal?.Amount || raw?.orderTotal?.amount || 0;
    const sales = Number(salesAmount);
    const fees = Number(raw?.fees?.amount || 0);
    const refunds = Number(raw?.refunds || 0);
    
    chartMap[dateStr].sales += sales;
    // Lợi nhuận gộp tạm thời trừ đi phí và hoàn tiền
    chartMap[dateStr].profit += (sales * 0.4) - fees - refunds; 
  });

  // Cộng thêm chi phí quảng cáo và trừ vào profit
  adMetrics?.forEach(metric => {
    const dateStr = metric.report_date;
    if (!chartMap[dateStr]) {
      chartMap[dateStr] = { date: dateStr, sales: 0, profit: 0, adCost: 0 };
    }
    const spend = Number(metric.spend || 0);
    chartMap[dateStr].adCost += spend;
    chartMap[dateStr].profit -= spend;
  });

  // Chuyển object thành mảng và sắp xếp theo ngày
  return Object.values(chartMap).sort((a, b) => a.date.localeCompare(b.date));
}
