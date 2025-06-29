import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

const rollbackSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  reason: z.string().min(1, "Reason is required"),
});

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

    const recruiter = recruiterData.items[0];
    const body = await request.json();
    const { applicationId, reason } = rollbackSchema.parse(body);

    // First, get the marked app data to know what status it was
    const markedAppResponse = await fetch(
      `${pocketbaseUrl}/api/collections/marked_apps/records?filter=(application="${applicationId}")&expand=application`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!markedAppResponse.ok) {
      return NextResponse.json(
        { message: "Could not find marked application" },
        { status: 404 }
      );
    }

    const markedAppData = await markedAppResponse.json();
    if (!markedAppData.items || markedAppData.items.length === 0) {
      return NextResponse.json(
        { message: "Application is not marked" },
        { status: 400 }
      );
    }

    const markedApp = markedAppData.items[0];
    const previousStatus = markedApp.status;

    // Delete the marked app entry
    const deleteResponse = await fetch(
      `${pocketbaseUrl}/api/collections/marked_apps/records/${markedApp.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!deleteResponse.ok) {
      return NextResponse.json(
        { message: "Failed to remove marked application" },
        { status: 500 }
      );
    }

    // Get the current application to preserve existing modRemarks
    const appResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_apps/records/${applicationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let existingModRemarks = "";
    if (appResponse.ok) {
      const appData = await appResponse.json();
      existingModRemarks = appData.modRemarks || "";
    }

    // Create modification remark with rich text formatting
    const timestamp = new Date().toLocaleString();
    const newModRemark = `**Rollback Action**
• Status: Rolled back from **${previousStatus}**
• Recruiter: ${recruiter.assignee}
• Date: ${timestamp}
• Reason: ${reason}
• Action: Application moved back to pending status

---`;

    const updatedModRemarks = existingModRemarks
      ? `${existingModRemarks}\n\n${newModRemark}`
      : newModRemark;

    // Update the application to unmark it and add modification remarks
    const updateResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_apps/records/${applicationId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marked: false,
          modRemarks: updatedModRemarks,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.text();
      console.error("Failed to update application:", errorData);
      return NextResponse.json(
        { message: "Failed to rollback application" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `Application successfully rolled back from ${previousStatus}`,
        modRemarks: updatedModRemarks,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error rolling back application:", error);
    return NextResponse.json(
      {
        message: "An error occurred while rolling back the application",
      },
      { status: 500 }
    );
  }
}
