import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    // Fetch team members
    const teamResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_team/records?sort=pos`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!teamResponse.ok) {
      throw new Error("Failed to fetch team members");
    }

    const teamData = await teamResponse.json();

    // Transform data to map qualification to profile for frontend
    const transformedMembers = (teamData.items || []).map(
      (member: Record<string, unknown>) => ({
        ...member,
        profile: member.qualification || "",
      })
    );

    return NextResponse.json({ members: transformedMembers });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
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
      title,
      profile,
      photo,
      linkedin,
      github,
      email,
      phone,
      skills,
      pos,
      category,
    } = body;

    // Validate required fields
    if (!name || !title || !profile || !category) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate category
    if (!["founding", "core", "direc"].includes(category)) {
      return NextResponse.json(
        { message: "Invalid category. Must be founding, core, or direc" },
        { status: 400 }
      );
    }

    // Create team member in PocketBase
    const createResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_team/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          title,
          qualification: profile,
          photo: photo || "",
          linkedin: linkedin || "",
          github: github || "",
          email: email || "",
          phone: phone || "",
          skills: skills || "",
          pos: pos || 1,
          category,
        }),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.message || "Failed to create team member");
    }

    const newMember = await createResponse.json();
    return NextResponse.json({ member: newMember }, { status: 201 });
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create team member",
      },
      { status: 500 }
    );
  }
}
