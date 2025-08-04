import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

// Activity logging function
async function logActivity(recruiterId: string, details: string) {
  try {
    const pb = new PocketBase(process.env.POCKETBASE_URL);
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL!,
      process.env.POCKETBASE_ADMIN_PASSWORD!
    );

    await pb.collection("exec_activity").create({
      recruiter: recruiterId,
      action: "Staff Authentication",
      resource_type: "authentication",
      resource_id: recruiterId,
      details: details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw error to avoid breaking the auth flow
  }
}

// Function to log failed staff authentication attempts
async function logFailedStaffAuth(authKey: string) {
  try {
    const pb = new PocketBase(process.env.POCKETBASE_URL);
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL!,
      process.env.POCKETBASE_ADMIN_PASSWORD!
    );

    await pb.collection("exec_activity").create({
      recruiter: null, // No recruiter ID for failed attempts
      action: "Failed Staff Authentication",
      resource_type: "authentication",
      resource_id: null,
      details: `Failed staff authentication attempt with auth key: ${authKey.substring(
        0,
        8
      )}...`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log failed staff auth activity:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authKey } = body;

    if (!authKey) {
      return NextResponse.json(
        { message: "Authentication key is required" },
        { status: 400 }
      );
    }

    // Check if auth key exists in PocketBase recruiters collection
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/recruiters/records?filter=(auth_key="${authKey}")`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("PocketBase auth check error:", response.status);
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 401 }
      );
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      // Auth key found, set cookie and authenticate
      const recruiter = data.items[0];

      // Log staff authentication activity
      await logActivity(
        recruiter.id,
        `Recruiter "${recruiter.assignee}" authenticated for staff access`
      );

      const nextResponse = NextResponse.json(
        { message: "Authentication successful", authenticated: true },
        { status: 200 }
      );

      // Set auth cookie
      nextResponse.cookies.set("auth-key", authKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return nextResponse;
    } else {
      // Auth key not found - log failed attempt
      await logFailedStaffAuth(authKey);

      return NextResponse.json(
        { message: "Invalid authentication key" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Staff auth error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
