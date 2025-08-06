import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("member-session");

    // Log logout activity if we have a valid session
    if (sessionCookie && sessionCookie.value) {
      try {
        const sessionData = JSON.parse(sessionCookie.value);
        if (sessionData.authenticated && sessionData.member) {
          const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
          await fetch(
            `${pocketbaseUrl}/api/collections/member_activity_log/records`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                member_id: sessionData.member.id,
                action: "Logout",
                resource_type: "authentication",
                resource_id: null,
                details: "Member logged out",
                timestamp: new Date().toISOString(),
              }),
            }
          );
        }
      } catch (logError) {
        console.error("Failed to log member logout activity:", logError);
      }
    }

    // Create response and clear the cookie
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set("member-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Immediately expire
    });

    return response;
  } catch (error) {
    console.error("Member logout error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
