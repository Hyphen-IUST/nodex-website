import { NextResponse } from "next/server";

interface TeamMember {
  id: string;
  name: string;
  photo?: string;
  category: "founding" | "core" | "direc";
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
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;

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
      founding: teamMembers.filter(
        (member: TeamMember) => member.category === "founding"
      ),
      core: teamMembers.filter(
        (member: TeamMember) => member.category === "core"
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
