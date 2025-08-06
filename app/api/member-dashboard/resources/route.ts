import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Helper function to get authenticated member
async function getAuthenticatedMember() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("member-session");

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);
    if (!sessionData.authenticated || !sessionData.member) {
      return null;
    }

    // Check if session is expired
    const loginTime = new Date(sessionData.loginTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return null;
    }

    return sessionData.member;
  } catch {
    return null;
  }
}

// Helper function to log member activity
async function logMemberActivity(
  memberId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  details: string
) {
  try {
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    await fetch(
      `${pocketbaseUrl}/api/collections/member_activity_log/records`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          timestamp: new Date().toISOString(),
        }),
      }
    );
  } catch (error) {
    console.error("Failed to log member activity:", error);
  }
}

export async function GET(request: Request) {
  try {
    const member = await getAuthenticatedMember();
    if (!member) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    const url = new URL(request.url);
    const category = url.searchParams.get("category");

    // Fetch resources with optional category filter
    let resourcesUrl = `${pocketbaseUrl}/api/collections/nodex_resources/records?sort=-created`;
    if (category && category !== "all") {
      resourcesUrl += `&filter=(category="${category}")`;
    }

    const resourcesResponse = await fetch(resourcesUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!resourcesResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch resources" },
        { status: 500 }
      );
    }

    const resourcesData = await resourcesResponse.json();

    // Fetch categories for filtering
    const categoriesResponse = await fetch(
      `${pocketbaseUrl}/api/collections/resource_categories/records?sort=name`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    let categories = [];
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      categories = categoriesData.items;
    }

    await logMemberActivity(
      member.id,
      "View Resources",
      "resources",
      null,
      `Viewed resources${category ? ` in category: ${category}` : ""}`
    );

    return NextResponse.json({
      success: true,
      resources: resourcesData.items,
      categories,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const member = await getAuthenticatedMember();
    if (!member) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, description, category, type, link, priority } =
      await request.json();

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create resource request
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    const resourceRequestResponse = await fetch(
      `${pocketbaseUrl}/api/collections/resource_requests/records`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: member.id,
          title,
          description,
          category,
          type: type || "other",
          link: link || null,
          priority: priority || "medium",
          status: "pending",
          created: new Date().toISOString(),
        }),
      }
    );

    if (!resourceRequestResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to submit resource request" },
        { status: 500 }
      );
    }

    const resourceRequest = await resourceRequestResponse.json();

    await logMemberActivity(
      member.id,
      "Request Resource",
      "resource_request",
      resourceRequest.id,
      `Requested resource: ${title}`
    );

    return NextResponse.json({
      success: true,
      message: "Resource request submitted successfully",
      request: resourceRequest,
    });
  } catch (error) {
    console.error("Error creating resource request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit resource request" },
      { status: 500 }
    );
  }
}
