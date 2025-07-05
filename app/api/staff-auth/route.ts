import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authKey } = body;

    if (!authKey) {
      return NextResponse.json(
        { message: "Authentication key is required" },
        { status: 400 }
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
        { message: "Authentication failed" },
        { status: 401 }
      );
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      // Auth key found, set cookie and authenticate
      const nextResponse = NextResponse.json(
        { message: "Authentication successful", authenticated: true },
        { status: 200 }
      );

      // Set auth cookie
      nextResponse.cookies.set("auth-key", authKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return nextResponse;
    } else {
      // Auth key not found
      return NextResponse.json(
        { message: "Invalid authentication key" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Staff auth error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
