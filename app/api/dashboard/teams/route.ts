import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  team_lead?: string;
  repository_url?: string;
  status: string;
  image_url?: string;
  created_by: string;
  created: string;
  updated: string;
}

interface Task {
  id: string;
  team: string;
  status: string;
  title: string;
}

export async function GET() {
  try {
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

    // Fetch teams with members and tasks count
    const teamsResponse = await fetch(
      `${pocketbaseUrl}/api/collections/teams/records?sort=-created&expand=team_lead`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!teamsResponse.ok) {
      throw new Error("Failed to fetch teams");
    }

    const teamsData = await teamsResponse.json();
    const teams = teamsData.items || [];

    // Fetch member counts for each team
    const teamsWithCounts = await Promise.all(
      teams.map(async (team: Team) => {
        try {
          // Get member count - check both team_members collection and club_members with teams field
          let memberCount = 0;

          // First try team_members collection
          const membersResponse = await fetch(
            `${pocketbaseUrl}/api/collections/team_members/records?filter=(team="${team.id}")`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (membersResponse.ok) {
            const membersData = await membersResponse.json();
            memberCount = membersData.items.length;
          }

          // If no members found in team_members, check club_members collection
          if (memberCount === 0) {
            const clubMembersResponse = await fetch(
              `${pocketbaseUrl}/api/collections/club_members/records?filter=(teams~"${team.id}")`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (clubMembersResponse.ok) {
              const clubMembersData = await clubMembersResponse.json();
              memberCount = clubMembersData.items.length;
            }
          }

          // Get task count
          const tasksResponse = await fetch(
            `${pocketbaseUrl}/api/collections/team_tasks/records?filter=(team="${team.id}")`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const tasksData = tasksResponse.ok
            ? await tasksResponse.json()
            : { items: [] };
          const completedTasks = tasksData.items.filter(
            (task: Task) => task.status === "completed"
          ).length;

          return {
            ...team,
            memberCount: memberCount,
            taskCount: tasksData.items.length,
            completedTaskCount: completedTasks,
          };
        } catch (error) {
          console.error(`Error fetching counts for team ${team.id}:`, error);
          return {
            ...team,
            memberCount: 0,
            taskCount: 0,
            completedTaskCount: 0,
          };
        }
      })
    );

    return NextResponse.json({ teams: teamsWithCounts });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { message: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Check team management permissions
    if (!recruiter.team_mgmt) {
      return NextResponse.json(
        { message: "Insufficient permissions for team management" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      team_lead,
      repository_url,
      status,
      image_url,
    } = body;

    // Validate required fields
    if (!name || !description || !category) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create team in PocketBase
    const createResponse = await fetch(
      `${pocketbaseUrl}/api/collections/teams/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category: category.trim(),
          team_lead: team_lead || "",
          repository_url: repository_url || "",
          status: status || "active",
          image_url: image_url || "",
          created_by: recruiter.id,
        }),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.message || "Failed to create team");
    }

    const newTeam = await createResponse.json();
    return NextResponse.json({ team: newTeam }, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create team",
      },
      { status: 500 }
    );
  }
}
