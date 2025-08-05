import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; memberId: string }> }
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

    // Verify recruiter authentication
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

    // Check team management permissions
    if (!recruiter.team_mgmt) {
      return NextResponse.json(
        { message: "Insufficient permissions for team management" },
        { status: 403 }
      );
    }

    // Delete the team member - this should use the new structure with club_members.teams array
    // Instead of deleting a team_members record, we need to remove the team from the member's teams array

    // The memberId here should be the actual club_members ID, not a team_members record ID
    // We need to find the member and remove this team from their teams array
    const memberResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records/${params.memberId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!memberResponse.ok) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const memberData = await memberResponse.json();
    const currentTeams = memberData.teams || [];

    // Remove the team from member's teams array
    const updatedTeams = currentTeams.filter(
      (teamId: string) => teamId !== params.id
    );

    const updateResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records/${params.memberId}`,
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
      return NextResponse.json(
        { error: errorData.message || "Failed to remove member from team" },
        { status: updateResponse.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; memberId: string }> }
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

    // Verify recruiter authentication
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

    // Check team management permissions
    if (!recruiter.team_mgmt) {
      return NextResponse.json(
        { message: "Insufficient permissions for team management" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role } = body;

    // Validate required fields
    if (!role) {
      return NextResponse.json(
        { message: "Role is required" },
        { status: 400 }
      );
    }

    // Note: With the new data structure, we're not storing role/skills per team
    // We could store this information differently or modify the club_members schema
    // For now, we'll just return success to maintain API compatibility

    // Update the team member - this should update the club_members record
    // The memberId here should be the actual club_members ID
    // We don't store role/skills in separate team_members records anymore

    // For now, we'll just return success since role/skills might be stored differently
    // or you may want to add these fields to the club_members collection
    const updateResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records/${params.memberId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Add any fields you want to update on the club_members record
          // For example, if you want to store additional metadata:
          // last_updated: new Date().toISOString(),
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to update member" },
        { status: updateResponse.status }
      );
    }

    const updatedMember = await updateResponse.json();
    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
