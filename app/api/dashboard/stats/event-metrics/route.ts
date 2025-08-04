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

    // Fetch events count
    const eventsResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_events/records`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let totalEvents = 0;
    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      totalEvents = eventsData.items?.length || 0;
    }

    return NextResponse.json({ total: totalEvents });
  } catch (error) {
    console.error("Error fetching events stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch events stats" },
      { status: 500 }
    );
  }
}
