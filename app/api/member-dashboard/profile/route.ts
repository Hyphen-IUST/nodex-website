import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Helper function to get authenticated member
async function getAuthenticatedMember() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("member-session");

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);
    if (!sessionData.authenticated || !sessionData.member) {
      return null;
    }

    // Check if session is expired
    const loginTime = new Date(sessionData.loginTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return null;
    }

    return sessionData.member;
  } catch {
    return null;
  }
}

// Helper function to log member activity
async function logMemberActivity(
  memberId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  details: string
) {
  try {
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    await fetch(
      `${pocketbaseUrl}/api/collections/member_activity_log/records`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          timestamp: new Date().toISOString(),
        }),
      }
    );
  } catch (error) {
    console.error("Failed to log member activity:", error);
  }
}

export async function GET() {
  try {
    const member = await getAuthenticatedMember();
    if (!member) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;

    // Get fresh member data
    const memberResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records/${member.id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!memberResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch member data" },
        { status: 500 }
      );
    }

    const memberRecord = await memberResponse.json();

    // Get team information
    const teams = [];
    if (memberRecord.teams && memberRecord.teams.length > 0) {
      for (const teamId of memberRecord.teams) {
        try {
          const teamResponse = await fetch(
            `${pocketbaseUrl}/api/collections/teams/records/${teamId}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (teamResponse.ok) {
            const team = await teamResponse.json();
            teams.push({
              id: team.id,
              name: team.name,
              category: team.category,
            });
          }
        } catch (teamError) {
          console.error(`Failed to fetch team ${teamId}:`, teamError);
        }
      }
    }

    await logMemberActivity(
      member.id,
      "View Profile",
      "profile",
      member.id,
      "Viewed own profile"
    );

    return NextResponse.json({
      success: true,
      profile: {
        id: memberRecord.id,
        name: memberRecord.name,
        email: memberRecord.email,
        student_id: memberRecord.student_id,
        phone: memberRecord.phone,
        member_type: memberRecord.member_type,
        position: memberRecord.position,
        department: memberRecord.department,
        year: memberRecord.year,
        skills: memberRecord.skills || [],
        bio: memberRecord.bio,
        linkedin_url: memberRecord.linkedin_url,
        github_url: memberRecord.github_url,
        portfolio_url: memberRecord.portfolio_url,
        status: memberRecord.status,
        created: memberRecord.created,
        updated: memberRecord.updated,
      },
      teams,
    });
  } catch (error) {
    console.error("Error fetching member profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
