import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import PocketBase from "pocketbase";

const loginSchema = z.object({
  authKey: z.string().min(1, "Auth key is required"),
});

// Activity logging function
async function logActivity(recruiterId: string, details: string) {
  try {
    const pb = new PocketBase(process.env.POCKETBASE_URL);
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL!,
      process.env.POCKETBASE_ADMIN_PASSWORD!
    );

    await pb.collection("exec_activity").create({
      recruiter: recruiterId,
      action: "Login",
      resource_type: "authentication",
      resource_id: recruiterId,
      details: details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw error to avoid breaking the login flow
  }
}

// Function to log failed login attempts
async function logFailedLogin(authKey: string) {
  try {
    const pb = new PocketBase(process.env.POCKETBASE_URL);
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL!,
      process.env.POCKETBASE_ADMIN_PASSWORD!
    );

    await pb.collection("exec_activity").create({
      recruiter: null, // No recruiter ID for failed attempts
      action: "Failed Login",
      resource_type: "authentication",
      resource_id: null,
      details: `Failed login attempt with auth key: ${authKey.substring(
        0,
        8
      )}...`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log failed login activity:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authKey } = loginSchema.parse(body);

    // Check if auth key exists in PocketBase recruiters collection
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/recruiters/records?filter=auth_key="${authKey}"`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("PocketBase login check error:", response.status);
      return NextResponse.json(
        { message: "Authentication service error", success: false },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      // Auth key found, user is authenticated
      const recruiter = data.items[0];

      // Log successful login activity
      await logActivity(
        recruiter.id,
        `Recruiter "${recruiter.assignee}" logged into executive dashboard`
      );

      // Create response with success
      const successResponse = NextResponse.json(
        {
          message: "Login successful",
          success: true,
          recruiter: {
            id: recruiter.id,
            assignee: recruiter.assignee,
          },
        },
        { status: 200 }
      );

      // Set the auth-key cookie
      successResponse.cookies.set("auth-key", authKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return successResponse;
    } else {
      // Auth key not found - log failed attempt
      await logFailedLogin(authKey);

      return NextResponse.json(
        { message: "Invalid auth key", success: false },
        { status: 401 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Invalid input",
          success: false,
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
