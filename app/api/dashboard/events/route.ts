import { NextRequest, NextResponse } from "next/server";
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

    // Fetch events
    const eventsResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_events/records?sort=-created`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!eventsResponse.ok) {
      throw new Error("Failed to fetch events");
    }

    const eventsData = await eventsResponse.json();
    return NextResponse.json({ events: eventsData.items || [] });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      description,
      from,
      to,
      location,
      category,
      remSpots,
      regLink,
    } = body;

    // Validate required fields
    if (!title || !description || !from || !to || !location) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format dates for PocketBase (convert datetime-local to proper format)
    const formatDateForPocketBase = (dateString: string) => {
      if (!dateString) return "";
      try {
        // Parse the datetime-local format and convert to PocketBase format
        const date = new Date(dateString);
        // PocketBase expects format: "2025-08-04 17:30:00.000Z"
        return date.toISOString().slice(0, 19).replace("T", " ") + ".000Z";
      } catch (error) {
        console.error("Date formatting error:", error);
        return "";
      }
    };

    // Create event in PocketBase
    const createResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_events/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          from: formatDateForPocketBase(from),
          to: formatDateForPocketBase(to),
          location,
          category: category || "",
          remSpots: remSpots || 0,
          regLink: regLink || "",
          active: true,
          archived: false,
        }),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.message || "Failed to create event");
    }

    const newEvent = await createResponse.json();
    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create event",
      },
      { status: 500 }
    );
  }
}
