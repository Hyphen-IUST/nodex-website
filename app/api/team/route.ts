import { NextResponse } from "next/server";

interface TeamMember {
  id: string;
  name: string;
  photo?: string;
  category: "exec" | "direc" | "faculty" | "lead";
  title: string;
  qualification?: string;
  description?: string;
  skills?: string;
  email?: string;
  phone?: string;
  github?: string;
  linkedin?: string;
}

export async function GET() {
  try {
    const pocketbaseUrl = process.env.POCKETBASE_URL;

    if (!pocketbaseUrl) {
      return NextResponse.json(
        { message: "PocketBase URL not configured" },
        { status: 500 }
      );
    }

    // Fetch team members from PocketBase
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_team/records?sort=category,pos`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("PocketBase team fetch error:", response.status);
      return NextResponse.json(
        { message: "Failed to fetch team data" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Transform the data to group by category
    const teamMembers: TeamMember[] = data.items || [];

    const groupedTeam = {
      direc: teamMembers.filter(
        (member: TeamMember) => member.category === "direc"
      ),
      faculty: teamMembers.filter(
        (member: TeamMember) => member.category === "faculty"
      ),
      exec: teamMembers.filter(
        (member: TeamMember) => member.category === "exec"
      ),
      leads: teamMembers.filter(
        (member: TeamMember) => member.category === "lead"
      ),
    };

    return NextResponse.json(
      {
        success: true,
        team: groupedTeam,
        totalMembers: teamMembers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching team data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
