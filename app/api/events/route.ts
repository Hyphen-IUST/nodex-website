import { NextResponse } from "next/server";

interface Event {
  id: string;
  title: string;
  description: string;
  remSpots: number;
  from: string;
  to: string;
  active: boolean;
  archived: boolean;
  category: string;
  created: string;
  updated: string;
}

export async function GET() {
  try {
    const pocketbaseUrl = process.env.POCKETBASE_URL;

    if (!pocketbaseUrl) {
      return NextResponse.json(
        { message: "PocketBase URL not configured" },
        { status: 500 }
      );
    }

    // Fetch events from PocketBase
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_events/records?sort=-created`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("PocketBase events fetch error:", response.status);
      return NextResponse.json(
        { message: "Failed to fetch events data" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Transform the data to group by status
    const events: Event[] = data.items || [];

    const groupedEvents = {
      active: events.filter((event: Event) => event.active && !event.archived),
      archived: events.filter((event: Event) => event.archived),
    };

    return NextResponse.json(
      {
        success: true,
        events: groupedEvents,
        totalEvents: events.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching events data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
