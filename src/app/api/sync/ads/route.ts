import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

export const dynamic = "force-dynamic";

// Khởi tạo kết nối Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const clientId = process.env.AMAZON_ADS_CLIENT_ID!;
    const clientSecret = process.env.AMAZON_ADS_CLIENT_SECRET!;
    const refreshToken = process.env.AMAZON_ADS_REFRESH_TOKEN!;
    const profileId = process.env.AMAZON_ADS_PROFILE_ID!;

    console.log("Getting Amazon Ads Access Token...");
    // 1. Lấy Access Token từ Amazon OAuth2
    const tokenResponse = await axios.post("https://api.amazon.com/auth/o2/token", {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });
    const accessToken = tokenResponse.data.access_token;

    console.log("Fetching Sponsored Products Campaigns v3...");
    // 2. Gọi Ads API lấy danh sách các chiến dịch (Campaigns)
    const adsResponse = await axios.post(
      "https://advertising-api.amazon.com/sp/campaigns/list",
      {}, // request body
      {
        headers: {
          "Amazon-Advertising-API-ClientId": clientId,
          "Amazon-Advertising-API-Scope": profileId,
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/vnd.spCampaign.v3+json",
          "Content-Type": "application/vnd.spCampaign.v3+json"
        }
      }
    );

    const campaigns = adsResponse.data?.campaigns || [];
    let insertedCount = 0;

    for (const campaign of campaigns) {
      // Lưu hoặc cập nhật vào bảng amazon_ad_campaigns
      const { error } = await supabase.from("amazon_ad_campaigns").upsert(
        {
          campaign_id: campaign.campaignId.toString(),
          name: campaign.name,
          raw_data: campaign,
        },
        { onConflict: "campaign_id" }
      );
      if (!error) {
        insertedCount++;
      } else {
        console.error("Supabase Error:", error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      fetched_campaigns: campaigns.length, 
      upserted_to_supabase: insertedCount 
    });
    
  } catch (error: any) {
    const errorDetails = error?.response?.data || error.message;
    console.error("Amazon Ads API Error:", errorDetails);
    return NextResponse.json(
      { success: false, error: errorDetails }, 
      { status: 500 }
    );
  }
}
