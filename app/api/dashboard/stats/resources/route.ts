import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authKey = cookieStore.get("auth-key")?.value;

    if (!authKey) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify recruiter authentication
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    const recruiterResponse = await fetch(
      `${pocketbaseUrl}/api/collections/recruiters/records?filter=(auth_key="${authKey}")`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!recruiterResponse.ok) {
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 401 }
      );
    }

    const recruiterData = await recruiterResponse.json();
    if (!recruiterData.items || recruiterData.items.length === 0) {
      return NextResponse.json(
        { message: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Fetch resources count
    const resourcesResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_resources/records`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let activeResources = 0;
    if (resourcesResponse.ok) {
      const resourcesData = await resourcesResponse.json();
      activeResources = resourcesData.items?.length || 0;
    }

    return NextResponse.json({ active: activeResources });
  } catch (error) {
    console.error("Error fetching resources stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources stats" },
      { status: 500 }
    );
  }
}
