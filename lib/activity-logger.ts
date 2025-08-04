import { NextRequest } from "next/server";

export interface ActivityLogData {
  ip_address: string;
  user_agent: string;
  action: string;
  page_url: string;
  referrer?: string;
  timestamp: string;
  fingerprint?: {
    screen_resolution?: string;
    timezone?: string;
    language?: string;
    platform?: string;
    cookie_enabled?: boolean;
    do_not_track?: string;
    connection_type?: string;
  };
  additional_data?: Record<string, unknown>;
}

export function extractClientInfo(
  request: NextRequest
): Partial<ActivityLogData> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = request.headers.get("user-agent") || "unknown";
  const referrer = request.headers.get("referer") || undefined;

  return {
    ip_address: ip,
    user_agent: userAgent,
    referrer,
    timestamp: new Date().toISOString(),
  };
}

export async function logActivity(
  data: Partial<ActivityLogData>,
  request?: NextRequest
): Promise<boolean> {
  try {
    const baseData = request ? extractClientInfo(request) : {};

    const logData: ActivityLogData = {
      ip_address: data.ip_address || baseData.ip_address || "unknown",
      user_agent: data.user_agent || baseData.user_agent || "unknown",
      action: data.action || "page_view",
      page_url: data.page_url || "unknown",
      referrer: data.referrer || baseData.referrer,
      timestamp:
        data.timestamp || baseData.timestamp || new Date().toISOString(),
      fingerprint: data.fingerprint,
      additional_data: data.additional_data,
    };

    const response = await fetch(
      `${process.env.POCKETBASE_BACKEND_URL}/api/collections/activity_log/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Failed to log activity:", error);
    return false;
  }
}

export async function logActivityFromClient(
  data: Partial<ActivityLogData>
): Promise<boolean> {
  try {
    const response = await fetch("/api/activity-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to log activity from client:", error);
    return false;
  }
}
