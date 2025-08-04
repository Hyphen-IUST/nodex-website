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

    // Fetch pending applications count
    const pendingResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_apps/records?filter=(id!="")`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let pendingCount = 0;
    if (pendingResponse.ok) {
      const pendingData = await pendingResponse.json();

      // Fetch marked applications to determine which are still pending
      const markedResponse = await fetch(
        `${pocketbaseUrl}/api/collections/marked_apps/records`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let markedApplicationIds = new Set();
      if (markedResponse.ok) {
        const markedData = await markedResponse.json();
        markedApplicationIds = new Set(
          markedData.items?.map(
            (item: { application: string }) => item.application
          ) || []
        );
      }

      // Count applications that haven't been marked yet
      pendingCount =
        pendingData.items?.filter(
          (app: { id: string }) => !markedApplicationIds.has(app.id)
        ).length || 0;
    }

    return NextResponse.json({ pending: pendingCount });
  } catch (error) {
    console.error("Error fetching application stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch application stats" },
      { status: 500 }
    );
  }
}
