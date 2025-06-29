import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

const markApplicationSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  status: z.enum(["approved", "rejected"], {
    required_error: "Status must be either 'approved' or 'rejected'",
  }),
  remarks: z.string().optional(),
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
    const validatedData = markApplicationSchema.parse(body);

    // Get the current application to preserve existing modRemarks
    const appResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_apps/records/${validatedData.applicationId}`,
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
    const statusIcon = validatedData.status === "approved" ? "✅" : "❌";
    const newModRemark = `**${
      validatedData.status.charAt(0).toUpperCase() +
      validatedData.status.slice(1)
    } Action** ${statusIcon}
• Status: **${validatedData.status.toUpperCase()}**
• Recruiter: ${recruiter.assignee}
• Date: ${timestamp}
• Remarks: *${validatedData.remarks}*

---`;

    const updatedModRemarks = existingModRemarks
      ? `${existingModRemarks}\n\n${newModRemark}`
      : newModRemark;

    // Update the application to mark as processed and add modification remarks
    const updateResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_apps/records/${validatedData.applicationId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marked: true,
          modRemarks: updatedModRemarks,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.text();
      console.error("Failed to update application:", errorData);
      throw new Error("Failed to update application");
    }

    // Create entry in marked_apps collection
    const markedAppResponse = await fetch(
      `${pocketbaseUrl}/api/collections/marked_apps/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application: validatedData.applicationId,
          status: validatedData.status,
          remarks: validatedData.remarks || "",
          recruiter: recruiter.id,
        }),
      }
    );

    if (!markedAppResponse.ok) {
      const errorData = await markedAppResponse.text();
      console.error("Failed to create marked app entry:", errorData);
      throw new Error("Failed to create marked app entry");
    }

    const markedAppData = await markedAppResponse.json();

    return NextResponse.json(
      {
        message: `Application ${validatedData.status} successfully`,
        markedApp: markedAppData,
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

    console.error("Error marking application:", error);
    return NextResponse.json(
      {
        message: "An error occurred while processing the application",
      },
      { status: 500 }
    );
  }
}
