import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authKey = cookieStore.get("auth-key")?.value;

    if (!authKey) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify auth key
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    const authResponse = await fetch(
      `${pocketbaseUrl}/api/collections/recruiters/records?filter=(auth_key="${authKey}")`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!authResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();
    if (!authData.items || authData.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Fetch resource requests with expanded relations
    const requestsResponse = await fetch(
      `${pocketbaseUrl}/api/collections/resource_requests/records?sort=-created&expand=member_id,category`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!requestsResponse.ok) {
      console.error(
        "PocketBase requests fetch error:",
        requestsResponse.status
      );
      return NextResponse.json(
        { success: false, error: "Failed to fetch resource requests" },
        { status: 500 }
      );
    }

    const requestsData = await requestsResponse.json();

    return NextResponse.json({
      success: true,
      requests: requestsData.items || [],
    });
  } catch (error) {
    console.error("Error fetching resource requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch resource requests" },
      { status: 500 }
    );
  }
}
