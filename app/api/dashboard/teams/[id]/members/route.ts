import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const cookieStore = await cookies();
    const authKey = cookieStore.get("auth-key")?.value;

    if (!authKey) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify recruiter authentication and team management permissions
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    const recruiterResponse = await fetch(
      `${pocketbaseUrl}/api/collections/recruiters/records?filter=(auth_key="${authKey}")`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!recruiterResponse.ok) {
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 401 }
      );
    }

    const recruiterData = await recruiterResponse.json();
    if (!recruiterData.items || recruiterData.items.length === 0) {
      return NextResponse.json(
        { message: "Invalid authentication" },
        { status: 401 }
      );
    }

    const recruiter = recruiterData.items[0];

    if (!recruiter.team_mgmt) {
      return NextResponse.json(
        { message: "Insufficient permissions for team management" },
        { status: 403 }
      );
    }

    // Get team members from both club_members and nodex_team collections
    const [clubMembersResponse, nodexTeamResponse] = await Promise.all([
      fetch(
        `${pocketbaseUrl}/api/collections/club_members/records?filter=(teams~"${params.id}")&sort=name`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ),
      fetch(
        `${pocketbaseUrl}/api/collections/nodex_team/records?filter=(teams~"${params.id}")&sort=name`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ),
    ]);

    if (!clubMembersResponse.ok || !nodexTeamResponse.ok) {
      throw new Error("Failed to fetch team members");
    }

    const [clubMembersData, nodexTeamData] = await Promise.all([
      clubMembersResponse.json(),
      nodexTeamResponse.json(),
    ]);

    // Combine members from both collections, adding source info
    const allMembers = [
      ...(clubMembersData.items || []).map(
        (member: Record<string, unknown>) => ({
          ...member,
          source: "club_members",
        })
      ),
      ...(nodexTeamData.items || []).map((member: Record<string, unknown>) => ({
        ...member,
        id: `nodex_${member.id}`, // Add prefix for frontend identification
        source: "nodex_team",
      })),
    ];

    return NextResponse.json({ members: allMembers });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { message: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const cookieStore = await cookies();
    const authKey = cookieStore.get("auth-key")?.value;

    if (!authKey) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify recruiter authentication and permissions
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    const recruiterResponse = await fetch(
      `${pocketbaseUrl}/api/collections/recruiters/records?filter=(auth_key="${authKey}")`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!recruiterResponse.ok) {
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 401 }
      );
    }

    const recruiterData = await recruiterResponse.json();
    if (!recruiterData.items || recruiterData.items.length === 0) {
      return NextResponse.json(
        { message: "Invalid authentication" },
        { status: 401 }
      );
    }

    const recruiter = recruiterData.items[0];

    if (!recruiter.team_mgmt) {
      return NextResponse.json(
        { message: "Insufficient permissions for team management" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { member_id } = body;

    // Validate required fields
    if (!member_id) {
      return NextResponse.json(
        { message: "Missing required field: member_id" },
        { status: 400 }
      );
    }

    let memberData = null;
    let actualMemberId = member_id;
    let clubMemberRecord = null;

    // Handle prefixed IDs from nodex_team
    if (member_id.startsWith("nodex_")) {
      actualMemberId = member_id.replace("nodex_", "");

      // Check if member exists in nodex_team
      const nodexMemberResponse = await fetch(
        `${pocketbaseUrl}/api/collections/nodex_team/records/${actualMemberId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!nodexMemberResponse.ok) {
        console.log(await nodexMemberResponse.json());
        return NextResponse.json(
          { message: "NodeX team member not found" },
          { status: 404 }
        );
      }

      memberData = await nodexMemberResponse.json();

      // Check if this nodex_team member already exists in club_members
      let clubMemberExists = false;
      try {
        const existingClubMemberResponse = await fetch(
          `${pocketbaseUrl}/api/collections/club_members/records?filter=(name="${memberData.name}"&&email="${memberData.email}")`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (existingClubMemberResponse.ok) {
          const existingData = await existingClubMemberResponse.json();
          if (existingData.items && existingData.items.length > 0) {
            // Member already exists in club_members, use that record
            clubMemberRecord = existingData.items[0];
            clubMemberExists = true;
          }
        }
      } catch (error) {
        // Error fetching - could be network issue or no records found
        console.log("Error checking existing club member:", error);
      }

      // If member doesn't exist in club_members, create new record
      if (!clubMemberExists) {
        const createClubMemberResponse = await fetch(
          `${pocketbaseUrl}/api/collections/club_members/records`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: memberData.name,
              email: memberData.email || "",
              phone: memberData.phone || "",
              member_type:
                memberData.category === "direc" ? "bos" : memberData.category,
              position: memberData.title || "",
              bio: memberData.description || "",
              linkedin_url: memberData.linkedin || "",
              github_url: memberData.github || "",
              photo: memberData.photo || "",
              qualification: memberData.qualification || "",
              skills: memberData.skills
                ? memberData.skills.split(",").map((s: string) => s.trim())
                : [],
              status: "active",
              teams: [], // Will be updated below
              student_id: "",
              department: "",
              year: null,
              portfolio_url: "",
            }),
          }
        );

        if (!createClubMemberResponse.ok) {
          const errorData = await createClubMemberResponse.json();
          return NextResponse.json(
            {
              message: `Failed to create club member record: ${errorData.message}`,
            },
            { status: 500 }
          );
        }

        clubMemberRecord = await createClubMemberResponse.json();
      }

      // Now use club_members collection for team relationship
      actualMemberId = clubMemberRecord.id;
    } else {
      // Check if member exists in club_members
      const memberResponse = await fetch(
        `${pocketbaseUrl}/api/collections/club_members/records/${actualMemberId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!memberResponse.ok) {
        console.log(await memberResponse.json());
        return NextResponse.json(
          { message: "Club member not found" },
          { status: 404 }
        );
      }

      clubMemberRecord = await memberResponse.json();
    }

    // Check if member is already in this team
    const currentTeams = clubMemberRecord.teams || [];
    if (currentTeams.includes(params.id)) {
      return NextResponse.json(
        { message: "Member is already part of this team" },
        { status: 409 }
      );
    }

    // Add team to member's teams array
    const updatedTeams = [...currentTeams, params.id];

    const updateResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records/${actualMemberId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teams: updatedTeams,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(errorData.message || "Failed to add member to team");
    }

    const updatedMember = await updateResponse.json();
    return NextResponse.json(
      {
        message: "Member added to team successfully",
        member: updatedMember,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to add team member",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const cookieStore = await cookies();
    const authKey = cookieStore.get("auth-key")?.value;

    if (!authKey) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify recruiter authentication and permissions
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    const recruiterResponse = await fetch(
      `${pocketbaseUrl}/api/collections/recruiters/records?filter=(auth_key="${authKey}")`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!recruiterResponse.ok) {
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 401 }
      );
    }

    const recruiterData = await recruiterResponse.json();
    if (!recruiterData.items || recruiterData.items.length === 0) {
      return NextResponse.json(
        { message: "Invalid authentication" },
        { status: 401 }
      );
    }

    const recruiter = recruiterData.items[0];

    if (!recruiter.team_mgmt) {
      return NextResponse.json(
        { message: "Insufficient permissions for team management" },
        { status: 403 }
      );
    }

    // Get member ID from query params
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("member_id");

    if (!memberId) {
      return NextResponse.json(
        { message: "Member ID is required" },
        { status: 400 }
      );
    }

    let actualMemberId = memberId;
    let clubMemberRecord = null;

    // Handle prefixed IDs from nodex_team
    if (memberId.startsWith("nodex_")) {
      // For nodex_team members, we need to find their corresponding club_members record
      const nodexMemberId = memberId.replace("nodex_", "");

      // Get the nodex_team member data
      const nodexMemberResponse = await fetch(
        `${pocketbaseUrl}/api/collections/nodex_team/records/${nodexMemberId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!nodexMemberResponse.ok) {
        return NextResponse.json(
          { message: "NodeX team member not found" },
          { status: 404 }
        );
      }

      const nodexMemberData = await nodexMemberResponse.json();

      // Find corresponding club_members record
      const clubMemberResponse = await fetch(
        `${pocketbaseUrl}/api/collections/club_members/records?filter=(name="${nodexMemberData.name}"&&email="${nodexMemberData.email}")`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!clubMemberResponse.ok) {
        return NextResponse.json(
          { message: "Failed to find club member record" },
          { status: 500 }
        );
      }

      const clubMemberData = await clubMemberResponse.json();
      if (!clubMemberData.items || clubMemberData.items.length === 0) {
        return NextResponse.json(
          {
            message: "Club member record not found for this NodeX team member",
          },
          { status: 404 }
        );
      }

      clubMemberRecord = clubMemberData.items[0];
      actualMemberId = clubMemberRecord.id;
    } else {
      // Regular club member
      const memberResponse = await fetch(
        `${pocketbaseUrl}/api/collections/club_members/records/${actualMemberId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!memberResponse.ok) {
        return NextResponse.json(
          { message: "Member not found" },
          { status: 404 }
        );
      }

      clubMemberRecord = await memberResponse.json();
    }

    const currentTeams = clubMemberRecord.teams || [];

    // Check if member is actually in this team
    if (!currentTeams.includes(params.id)) {
      return NextResponse.json(
        { message: "Member is not part of this team" },
        { status: 404 }
      );
    }

    // Remove team from member's teams array
    const updatedTeams = currentTeams.filter(
      (teamId: string) => teamId !== params.id
    );

    const updateResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records/${actualMemberId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teams: updatedTeams,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(errorData.message || "Failed to remove member from team");
    }

    return NextResponse.json(
      {
        message: "Member removed from team successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove team member",
      },
      { status: 500 }
    );
  }
}
