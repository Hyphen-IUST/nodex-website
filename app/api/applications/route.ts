import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface MarkedAppItem {
  status: string;
  remarks: string;
  created: string;
  expand?: {
    application?: Record<string, unknown>;
  };
}

export async function GET(request: NextRequest) {
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
    const pocketbaseUrl = process.env.POCKETBASE_URL;
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "pending";

    let applications = [];

    if (type === "pending") {
      // Fetch unmarked applications
      const pendingResponse = await fetch(
        `${pocketbaseUrl}/api/collections/nodex_apps/records?filter=(marked=false)&sort=-created`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        applications = pendingData.items || [];
      }
    } else {
      // Fetch marked applications (approved or rejected)
      const markedResponse = await fetch(
        `${pocketbaseUrl}/api/collections/marked_apps/records?filter=(status="${type}")&expand=application&sort=-created`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (markedResponse.ok) {
        const markedData = await markedResponse.json();
        applications =
          markedData.items?.map((item: MarkedAppItem) => ({
            ...item.expand?.application,
            markedData: {
              status: item.status,
              remarks: item.remarks,
              created: item.created,
            },
          })) || [];
      }
    }

    return NextResponse.json(
      {
        applications,
        type,
        count: applications.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      {
        message: "An error occurred while fetching applications",
      },
      { status: 500 }
    );
  }
}
