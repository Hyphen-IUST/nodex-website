import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    // Get limit from query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";

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

    // Fetch recent exec activities with expanded recruiter info
    const activitiesResponse = await fetch(
      `${pocketbaseUrl}/api/collections/exec_activity/records?sort=-created&perPage=${limit}&expand=recruiter_id`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!activitiesResponse.ok) {
      throw new Error("Failed to fetch activities");
    }

    const activitiesData = await activitiesResponse.json();

    // Transform the data to include recruiter information
    const transformedActivities =
      activitiesData.items?.map(
        (activity: {
          id: string;
          action: string;
          resource_type: string;
          resource_id?: string;
          details: string;
          created: string;
          performed_by?: string;
          expand?: {
            recruiter_id?: {
              assignee: string;
            };
          };
        }) => ({
          ...activity,
          recruiter: activity.expand?.recruiter_id
            ? {
                assignee: activity.expand.recruiter_id.assignee,
              }
            : { assignee: activity.performed_by || "Unknown" },
        })
      ) || [];

    return NextResponse.json({ activities: transformedActivities });
  } catch (error) {
    console.error("Error fetching exec activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch exec activities" },
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

    const recruiter = recruiterData.items[0];
    const body = await request.json();
    const { action, resource_type, resource_id, details } = body;

    // Validate required fields
    if (!action || !resource_type) {
      return NextResponse.json(
        { message: "Missing required fields: action and resource_type" },
        { status: 400 }
      );
    }

    // Log activity
    const activityResponse = await fetch(
      `${pocketbaseUrl}/api/collections/exec_activity/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          resource_type,
          resource_id: resource_id || "",
          details: details || "",
          performed_by: recruiter.assignee,
          performer_id: recruiter.id,
          ip_address:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "",
          user_agent: request.headers.get("user-agent") || "",
        }),
      }
    );

    if (!activityResponse.ok) {
      const errorData = await activityResponse.json();
      throw new Error(errorData.message || "Failed to log activity");
    }

    const newActivity = await activityResponse.json();
    return NextResponse.json({ activity: newActivity }, { status: 201 });
  } catch (error) {
    console.error("Error logging activity:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
