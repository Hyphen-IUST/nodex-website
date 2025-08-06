import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("member-session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({
        authenticated: false,
        member: null,
      });
    }

    const sessionData = JSON.parse(sessionCookie.value);

    // Validate session structure
    if (!sessionData.authenticated || !sessionData.member) {
      return NextResponse.json({
        authenticated: false,
        member: null,
      });
    }

    // Check if session is expired (24 hours)
    const loginTime = new Date(sessionData.loginTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return NextResponse.json({
        authenticated: false,
        member: null,
        expired: true,
      });
    }

    return NextResponse.json({
      authenticated: true,
      member: sessionData.member,
      keyType: sessionData.keyType,
    });
  } catch (error) {
    console.error("Member auth check error:", error);
    return NextResponse.json({
      authenticated: false,
      member: null,
    });
  }
}
