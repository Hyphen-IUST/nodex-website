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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await getAuthenticatedMember();

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;

    // Get fresh member data to check teams
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
    const memberTeamIds = memberRecord.teams || [];

    // Check if member belongs to this team
    if (!memberTeamIds.includes(id)) {
      await logMemberActivity(
        member.id,
        "Unauthorized Team Access",
        "team",
        id,
        `Attempted to access team ${id} without permission`
      );
      return NextResponse.json(
        { success: false, error: "You don't have access to this team" },
        { status: 403 }
      );
    }

    // Fetch team details
    const teamResponse = await fetch(
      `${pocketbaseUrl}/api/collections/teams/records/${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!teamResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    const team = await teamResponse.json();

    // Get all members in this team
    const allMembersResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!allMembersResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch team members" },
        { status: 500 }
      );
    }

    const allMembersData = await allMembersResponse.json();
    const teamMembers = allMembersData.items.filter(
      (clubMember: { teams?: string[] }) =>
        clubMember.teams && clubMember.teams.includes(id)
    );

    // Get NodeX team members for additional data
    const nodexTeamResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_team/records`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    let nodexTeamMembers: Record<string, unknown>[] = [];
    if (nodexTeamResponse.ok) {
      const nodexTeamData = await nodexTeamResponse.json();
      nodexTeamMembers = nodexTeamData.items;
    }

    // Combine and format member data
    const formattedMembers = teamMembers.map(
      (clubMember: Record<string, unknown>) => {
        // Check if this is a NodeX team member
        const isNodexMember = String(clubMember.id).startsWith("nodex_");
        let nodexData = null;

        if (isNodexMember) {
          const nodexId = String(clubMember.id).replace("nodex_", "");
          nodexData = nodexTeamMembers.find(
            (nm: Record<string, unknown>) => nm.id === nodexId
          );
        }

        return {
          id: clubMember.id,
          name: clubMember.name,
          email: clubMember.email,
          position: clubMember.position || nodexData?.position || null,
          member_type: clubMember.member_type,
          department: clubMember.department || nodexData?.department || null,
          skills: clubMember.skills || [],
          bio: clubMember.bio || nodexData?.bio || null,
          linkedin_url:
            clubMember.linkedin_url || nodexData?.linkedin_url || null,
          github_url: clubMember.github_url || nodexData?.github_url || null,
          portfolio_url:
            clubMember.portfolio_url || nodexData?.portfolio_url || null,
          isNodexMember,
        };
      }
    );

    await logMemberActivity(
      member.id,
      "View Team Details",
      "team",
      id,
      `Viewed details for team: ${team.name}`
    );

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        category: team.category,
        created: team.created,
        updated: team.updated,
      },
      members: formattedMembers,
    });
  } catch (error) {
    console.error("Error fetching team details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team details" },
      { status: 500 }
    );
  }
}
