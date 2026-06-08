import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const SellingPartnerAPI = require("amazon-sp-api");

export const dynamic = "force-dynamic";

// Khởi tạo kết nối Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Khởi tạo Client Amazon SP-API
    const sellingPartner = new SellingPartnerAPI({
      region: "na", // Mặc định thị trường Bắc Mỹ (US)
      refresh_token: process.env.AMAZON_SP_API_REFRESH_TOKEN!,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID: process.env.AMAZON_SP_API_CLIENT_ID!,
        SELLING_PARTNER_APP_CLIENT_SECRET: process.env.AMAZON_SP_API_CLIENT_SECRET!,
      },
    });

    // Lấy đơn hàng trong 2 ngày gần nhất
    const createdAfter = new Date();
    createdAfter.setDate(createdAfter.getDate() - 2);

    console.log("Fetching orders from Amazon...");
    const res = await sellingPartner.callAPI({
      operation: "getOrders",
      endpoint: "orders",
      query: {
        MarketplaceIds: [process.env.AMAZON_MARKETPLACE_ID!],
        CreatedAfter: createdAfter.toISOString(),
      },
    });

    const orders = res.Orders || [];
    let insertedCount = 0;
    
    for (const order of orders) {
      // Lưu hoặc cập nhật (Upsert) vào Supabase
      const { error } = await supabase.from("amazon_orders").upsert(
        {
          amazon_order_id: order.AmazonOrderId,
          purchase_date: order.PurchaseDate,
          order_status: order.OrderStatus,
          raw_data: order,
        },
        { onConflict: "amazon_order_id" }
      );
      
      if (!error) {
        insertedCount++;
      } else {
        console.error("Supabase Error:", error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      fetched_from_amazon: orders.length, 
      upserted_to_supabase: insertedCount 
    });
    
  } catch (error: any) {
    console.error("Amazon SP-API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi đồng bộ Amazon SP-API" }, 
      { status: 500 }
    );
  }
}
