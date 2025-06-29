import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  authKey: z.string().min(1, "Auth key is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authKey } = loginSchema.parse(body);

    // Check if auth key exists in PocketBase recruiters collection
    const pocketbaseUrl = process.env.POCKETBASE_URL;
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
      // Auth key not found
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
