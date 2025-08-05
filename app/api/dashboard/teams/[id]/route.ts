import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get team details
    const teamResponse = await fetch(
      `${pocketbaseUrl}/api/collections/teams/records/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!teamResponse.ok) {
      if (teamResponse.status === 404) {
        return NextResponse.json(
          { message: "Team not found" },
          { status: 404 }
        );
      }
      throw new Error("Failed to fetch team");
    }

    const team = await teamResponse.json();

    // Get team members from club_members collection
    const membersResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records?filter=(teams~"${id}")&sort=name`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const membersData = membersResponse.ok
      ? await membersResponse.json()
      : { items: [] };

    return NextResponse.json({
      team,
      members: membersData.items,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { message: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json();
    const {
      name,
      description,
      category,
      team_lead,
      repository_url,
      jira_url,
      status,
      image_url,
      skills_required,
      max_members,
    } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { message: "Missing required fields: name, category" },
        { status: 400 }
      );
    }

    // Update team in PocketBase
    const teamData = {
      name: name.trim(),
      description: description || "",
      category,
      team_lead: team_lead || "",
      repository_url: repository_url || "",
      jira_url: jira_url || "",
      status: status || "active",
      image_url: image_url || "",
      skills_required: skills_required || [],
      max_members: max_members || null,
    };

    const updateResponse = await fetch(
      `${pocketbaseUrl}/api/collections/teams/records/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamData),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(errorData.message || "Failed to update team");
    }

    const updatedTeam = await updateResponse.json();

    return NextResponse.json({
      message: "Team updated successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update team",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // First, remove this team from all club members
    const membersResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records?filter=(teams~"${id}")`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (membersResponse.ok) {
      const membersData = await membersResponse.json();

      // Update each member to remove this team
      for (const member of membersData.items) {
        const updatedTeams = member.teams
          ? member.teams.filter((teamId: string) => teamId !== id)
          : [];

        await fetch(
          `${pocketbaseUrl}/api/collections/club_members/records/${member.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ teams: updatedTeams }),
          }
        );
      }
    }

    // Delete team from PocketBase
    const deleteResponse = await fetch(
      `${pocketbaseUrl}/api/collections/teams/records/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!deleteResponse.ok) {
      if (deleteResponse.status === 404) {
        return NextResponse.json(
          { message: "Team not found" },
          { status: 404 }
        );
      }
      throw new Error("Failed to delete team");
    }

    return NextResponse.json({
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { message: "Failed to delete team" },
      { status: 500 }
    );
  }
}
