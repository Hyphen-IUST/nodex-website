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

    // Fetch BOS members from nodex_team collection where category = 'bos'
    const bosResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_team/records?filter=(category="direc")&sort=-created`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!bosResponse.ok) {
      throw new Error("Failed to fetch BOS members");
    }

    const bosData = await bosResponse.json();

    // Transform data to map qualification to profile for frontend
    const transformedMembers = (bosData.items || []).map(
      (member: Record<string, unknown>) => ({
        ...member,
        profile: member.qualification || "",
      })
    );

    return NextResponse.json({ members: transformedMembers });
  } catch (error) {
    console.error("Error fetching BOS members:", error);
    return NextResponse.json(
      { error: "Failed to fetch BOS members" },
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
      category,
      priority,
    } = body;

    // Validate required fields
    if (!name || !title || !profile) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    // Create BOS member in nodex_team collection with category = 'bos'
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
          category: category || "bos",
          priority: priority || 0,
          photo: photo || "",
          github: github || "",
          linkedin: linkedin || "",
        }),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.message || "Failed to create BOS member");
    }

    const newMember = await createResponse.json();
    return NextResponse.json({ member: newMember }, { status: 201 });
  } catch (error) {
    console.error("Error creating BOS member:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create BOS member",
      },
      { status: 500 }
    );
  }
}
