import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Authentication key is required" },
        { status: 400 }
      );
    }

    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;

    // Check if key exists in member_keys or recruiter_keys (recruiter keys work for members too)
    let memberRecord = null;
    let keyType = null;

    try {
      // First try member_keys
      const memberKeyResponse = await fetch(
        `${pocketbaseUrl}/api/collections/member_keys/records?filter=(key="${key}")`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (memberKeyResponse.ok) {
        const memberKeyData = await memberKeyResponse.json();
        if (memberKeyData.items && memberKeyData.items.length > 0) {
          const memberKey = memberKeyData.items[0];

          // Get the associated club member
          const memberResponse = await fetch(
            `${pocketbaseUrl}/api/collections/club_members/records/${memberKey.member_id}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (memberResponse.ok) {
            memberRecord = await memberResponse.json();
            keyType = "member";
          }
        }
      }
    } catch {
      // Continue to try recruiter keys
    }

    // If not found in member_keys, try recruiter_keys
    if (!memberRecord) {
      try {
        const recruiterKeyResponse = await fetch(
          `${pocketbaseUrl}/api/collections/recruiters/records?filter=(auth_key="${key}")`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (recruiterKeyResponse.ok) {
          const recruiterKeyData = await recruiterKeyResponse.json();
          if (recruiterKeyData.items && recruiterKeyData.items.length > 0) {
            const recruiterKey = recruiterKeyData.items[0];

            // Get the associated club member (recruiters are also club members)
            const memberResponse = await fetch(
              `${pocketbaseUrl}/api/collections/club_members/records/${recruiterKey.assignee}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            );

            if (memberResponse.ok) {
              memberRecord = await memberResponse.json();
              keyType = "recruiter";
            }
          }
        }
      } catch {
        // Key not found in either collection
      }
    }

    if (!memberRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication key" },
        { status: 401 }
      );
    }

    // Check if member is active
    if (memberRecord.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Member account is not active" },
        { status: 403 }
      );
    }

    // Log the login activity
    try {
      await fetch(
        `${pocketbaseUrl}/api/collections/member_activity_log/records`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            member_id: memberRecord.id,
            action: "Login",
            resource_type: "authentication",
            resource_id: null,
            details: `Member logged in using ${keyType} key`,
            ip_address:
              request.headers.get("x-forwarded-for") ||
              request.headers.get("x-real-ip") ||
              "unknown",
            user_agent: request.headers.get("user-agent") || "unknown",
            timestamp: new Date().toISOString(),
          }),
        }
      );
    } catch (logError) {
      console.error("Failed to log member activity:", logError);
    }

    // Create session data for response
    const sessionData = {
      authenticated: true,
      member: {
        id: memberRecord.id,
        name: memberRecord.name,
        email: memberRecord.email,
        member_type: memberRecord.member_type,
        position: memberRecord.position,
        teams: memberRecord.teams || [],
      },
      keyType,
      loginTime: new Date().toISOString(),
    };

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      member: {
        id: memberRecord.id,
        name: memberRecord.name,
        email: memberRecord.email,
        member_type: memberRecord.member_type,
        position: memberRecord.position,
      },
    });

    // Set authentication cookie
    response.cookies.set("member-session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Member authentication error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
