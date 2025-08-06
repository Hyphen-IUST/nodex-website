import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const { status, admin_notes } = await request.json();

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    // Update the resource request
    const updateData: Record<string, unknown> = {
      status,
      updated: new Date().toISOString(),
    };

    if (admin_notes !== undefined) {
      updateData.admin_notes = admin_notes;
    }

    const updateResponse = await fetch(
      `${pocketbaseUrl}/api/collections/resource_requests/records/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!updateResponse.ok) {
      console.error("PocketBase update error:", updateResponse.status);
      return NextResponse.json(
        { success: false, error: "Failed to update resource request" },
        { status: 500 }
      );
    }

    const updatedRequest = await updateResponse.json();

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating resource request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update resource request" },
      { status: 500 }
    );
  }
}
