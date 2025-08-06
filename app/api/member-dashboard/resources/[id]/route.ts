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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await getAuthenticatedMember();

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;

    // Fetch the resource
    const resourceResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_resources/records/${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!resourceResponse.ok) {
      if (resourceResponse.status === 404) {
        return NextResponse.json(
          { success: false, error: "Resource not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Failed to fetch resource" },
        { status: 500 }
      );
    }

    const resource = await resourceResponse.json();

    // Log the download/access
    await logMemberActivity(
      member.id,
      "Access Resource",
      "resource",
      id,
      `Accessed resource: ${resource.title}`
    );

    // Track resource download
    try {
      await fetch(
        `${pocketbaseUrl}/api/collections/resource_downloads/records`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resource_id: id,
            member_id: member.id,
            downloaded_at: new Date().toISOString(),
          }),
        }
      );
    } catch (downloadError) {
      console.error("Failed to track resource download:", downloadError);
    }

    // Return the resource with access URL
    return NextResponse.json({
      success: true,
      resource: {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        link: resource.link,
        category: resource.category,
      },
      accessUrl: resource.link,
    });
  } catch (error) {
    console.error("Error accessing resource:", error);
    return NextResponse.json(
      { success: false, error: "Failed to access resource" },
      { status: 500 }
    );
  }
}
