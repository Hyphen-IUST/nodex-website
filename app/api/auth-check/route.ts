import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authKey = cookieStore.get("auth-key")?.value;

    if (!authKey) {
      return NextResponse.json(
        { message: "No auth key found", authenticated: false },
        { status: 401 }
      );
    }

    // Check if auth key exists in PocketBase recruiters collection
    const pocketbaseUrl = process.env.POCKETBASE_URL;
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/recruiters/records?filter=(auth_key="${authKey}")`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("PocketBase auth check error:", response.status);
      return NextResponse.json(
        { message: "Authentication failed", authenticated: false },
        { status: 401 }
      );
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      // Auth key found, user is authenticated
      const recruiter = data.items[0];
      return NextResponse.json(
        {
          message: "Authenticated",
          authenticated: true,
          recruiter: {
            id: recruiter.id,
            assignee: recruiter.assignee,
          },
        },
        { status: 200 }
      );
    } else {
      // Auth key not found - clear the invalid cookie
      const response = NextResponse.json(
        { message: "Invalid auth key", authenticated: false },
        { status: 401 }
      );
      response.cookies.set("auth-key", "", {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return response;
    }
  } catch (error) {
    console.error("Auth check error:", error);
    // Clear cookie on error as well
    const response = NextResponse.json(
      { message: "Internal server error", authenticated: false },
      { status: 500 }
    );
    response.cookies.set("auth-key", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return response;
  }
}
