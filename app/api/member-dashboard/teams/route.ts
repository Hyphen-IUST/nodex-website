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

    // Get fresh member data with teams
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

    if (memberTeamIds.length === 0) {
      await logMemberActivity(
        member.id,
        "View Teams",
        "teams",
        null,
        "Viewed empty teams list"
      );
      return NextResponse.json({
        success: true,
        teams: [],
        message: "You are not assigned to any teams yet.",
      });
    }

    // Fetch teams that the member belongs to with comprehensive data
    const teams = [];
    for (const teamId of memberTeamIds) {
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

          // Get member count for this team - check both collections
          let memberCount = 0;

          // First try team_members collection
          const membersResponse = await fetch(
            `${pocketbaseUrl}/api/collections/team_members/records?filter=(team="${teamId}")`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (membersResponse.ok) {
            const membersData = await membersResponse.json();
            memberCount = membersData.items.length;
          }

          // If no members found in team_members, check club_members collection
          if (memberCount === 0) {
            const clubMembersResponse = await fetch(
              `${pocketbaseUrl}/api/collections/club_members/records?filter=(teams~"${teamId}")`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            );

            if (clubMembersResponse.ok) {
              const clubMembersData = await clubMembersResponse.json();
              memberCount = clubMembersData.items.length;
            }
          }

          // Get task count for this team
          const tasksResponse = await fetch(
            `${pocketbaseUrl}/api/collections/team_tasks/records?filter=(team="${teamId}")`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );
          const tasksData = tasksResponse.ok
            ? await tasksResponse.json()
            : { items: [] };
          const completedTasks = tasksData.items.filter(
            (task: { status: string }) => task.status === "completed"
          ).length;

          teams.push({
            ...team,
            memberCount: memberCount,
            taskCount: tasksData.items.length,
            completedTaskCount: completedTasks,
          });
        }
      } catch (error) {
        console.error(`Failed to fetch team ${teamId}:`, error);
      }
    }

    await logMemberActivity(
      member.id,
      "View Teams",
      "teams",
      null,
      `Viewed ${teams.length} teams`
    );

    return NextResponse.json({
      success: true,
      teams,
    });
  } catch (error) {
    console.error("Error fetching member teams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
