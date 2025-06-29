import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json(
      { message: "Logged out successfully", success: true },
      { status: 200 }
    );

    // Clear the auth-key cookie
    response.cookies.set("auth-key", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Error during logout", success: false },
      { status: 500 }
    );
  }
}
