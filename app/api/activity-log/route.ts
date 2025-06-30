import { NextRequest, NextResponse } from "next/server";
import { logActivity, extractClientInfo } from "@/lib/activity-logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const clientInfo = extractClientInfo(request);

    // Merge client info with the provided data
    const logData = {
      ...clientInfo,
      ...body,
      page_url: body.page_url || request.headers.get("referer") || "unknown",
    };

    const success = await logActivity(logData);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to log activity" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Activity log API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
