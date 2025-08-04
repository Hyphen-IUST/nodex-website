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
      action: "Logout",
      resource_type: "authentication",
      resource_id: recruiterId,
      details: details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw error to avoid breaking the logout flow
  }
}

// Function to get recruiter from auth key
async function getRecruiterFromAuthKey(authKey: string) {
  try {
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/recruiters/records?filter=auth_key="${authKey}"`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return data.items[0];
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching recruiter:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth key from cookie before clearing it
    const authKey = request.cookies.get("auth-key")?.value;

    // Get recruiter information for logging
    let recruiter = null;
    if (authKey) {
      recruiter = await getRecruiterFromAuthKey(authKey);
    }

    // Log logout activity if we have recruiter info
    if (recruiter) {
      await logActivity(
        recruiter.id,
        `Recruiter "${recruiter.assignee}" logged out of executive dashboard`
      );
    }

    // Create response
    const response = NextResponse.json(
      { message: "Logged out successfully", success: true },
      { status: 200 }
    );

    // Clear the auth-key cookie
    response.cookies.set("auth-key", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Error during logout", success: false },
      { status: 500 }
    );
  }
}
