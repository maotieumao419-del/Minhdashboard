import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import zlib from "zlib";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

// Khởi tạo kết nối Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Hàm chờ (sleep)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const headers = {
      "Amazon-Advertising-API-ClientId": clientId,
      "Amazon-Advertising-API-Scope": profileId,
      "Authorization": `Bearer ${accessToken}`,
    };

    // 2. KÉO DANH SÁCH CHIẾN DỊCH (CAMPAIGNS)
    console.log("Fetching Sponsored Products Campaigns...");
    const adsResponse = await axios.post(
      "https://advertising-api.amazon.com/sp/campaigns/list",
      {}, 
      {
        headers: {
          ...headers,
          "Accept": "application/vnd.spCampaign.v3+json",
          "Content-Type": "application/vnd.spCampaign.v3+json"
        }
      }
    );

    const campaigns = adsResponse.data?.campaigns || [];
    for (const campaign of campaigns) {
      await supabase.from("amazon_ad_campaigns").upsert(
        {
          campaign_id: campaign.campaignId.toString(),
          name: campaign.name,
          raw_data: campaign,
        },
        { onConflict: "campaign_id" }
      );
    }

    // 3. YÊU CẦU BÁO CÁO (REPORTING API V3)
    console.log("Requesting SP Campaigns Report...");
    // Lấy báo cáo trong 14 ngày qua
    const endDateStr = format(new Date(), "yyyy-MM-dd");
    const startDateStr = format(subDays(new Date(), 14), "yyyy-MM-dd");

    const reportReqPayload = {
      name: "SP campaigns report " + endDateStr,
      startDate: startDateStr,
      endDate: endDateStr,
      configuration: {
        adProduct: "SPONSORED_PRODUCTS",
        groupBy: ["campaign"],
        columns: ["campaignId", "cost", "impressions", "clicks", "purchases14d", "sales14d"],
        reportTypeId: "spCampaigns",
        timeUnit: "DAILY",
        format: "GZIP_JSON"
      }
    };

    const reportResponse = await axios.post(
      "https://advertising-api.amazon.com/reporting/reports",
      reportReqPayload,
      {
        headers: {
          ...headers,
          "Content-Type": "application/vnd.createasyncreportrequest.v3+json",
        }
      }
    );

    const reportId = reportResponse.data.reportId;
    console.log("Report ID:", reportId);

    // 4. CHỜ BÁO CÁO HOÀN THÀNH (POLLING)
    let reportStatus = "PENDING";
    let downloadUrl = "";
    let attempts = 0;

    while (reportStatus !== "SUCCESS" && attempts < 20) {
      console.log(`Checking report status (Attempt ${attempts + 1})...`);
      await sleep(5000); // Đợi 5 giây

      const statusRes = await axios.get(
        `https://advertising-api.amazon.com/reporting/reports/${reportId}`,
        {
          headers: {
            ...headers,
            "Accept": "application/vnd.createasyncreportrequest.v3+json",
          }
        }
      );

      reportStatus = statusRes.data.status;
      if (reportStatus === "SUCCESS") {
        downloadUrl = statusRes.data.url;
      } else if (reportStatus === "FAILURE") {
        throw new Error("Report generation failed: " + JSON.stringify(statusRes.data));
      }
      attempts++;
    }

    if (!downloadUrl) {
      throw new Error("Timeout waiting for report to finish.");
    }

    // 5. TẢI FILE GZIP VÀ GIẢI NÉN
    console.log("Downloading and extracting report...");
    const fileResponse = await axios.get(downloadUrl, { responseType: "arraybuffer" });
    const unzippedData = zlib.gunzipSync(fileResponse.data).toString("utf-8");
    const reportData = JSON.parse(unzippedData);

    // 6. UPSERT VÀO SUPABASE
    let metricsInserted = 0;
    for (const row of reportData) {
      const dateStr = row.date; // Định dạng YYYY-MM-DD
      const campaignId = row.campaignId.toString();
      const spend = Number(row.cost || 0);
      const sales = Number(row.sales14d || 0);

      // Unique identifier (Campaign + Date) để không trùng lặp
      const id = `${campaignId}_${dateStr}`;

      const { error } = await supabase.from("amazon_ad_metrics").upsert(
        {
          id: id,
          campaign_id: campaignId,
          report_date: dateStr,
          spend: spend,
          sales: sales,
          raw_data: row
        },
        { onConflict: "id" }
      );
      if (!error) metricsInserted++;
    }

    console.log(`Finished processing ${metricsInserted} metrics rows.`);

    return NextResponse.json({ 
      success: true, 
      fetched_campaigns: campaigns.length, 
      upserted_metrics: metricsInserted 
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
