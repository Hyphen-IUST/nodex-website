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

    // Get club member with team relations
    const memberResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records/${id}?expand=teams`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!memberResponse.ok) {
      if (memberResponse.status === 404) {
        return NextResponse.json(
          { message: "Club member not found" },
          { status: 404 }
        );
      }
      throw new Error("Failed to fetch club member");
    }

    const member = await memberResponse.json();

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Error fetching club member:", error);
    return NextResponse.json(
      { message: "Failed to fetch club member" },
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
      email,
      student_id,
      phone,
      member_type,
      position,
      department,
      year,
      teams,
      skills,
      bio,
      linkedin_url,
      github_url,
      portfolio_url,
      status,
    } = body;

    // Validate required fields
    if (!name || !email || !member_type) {
      return NextResponse.json(
        { message: "Missing required fields: name, email, member_type" },
        { status: 400 }
      );
    }

    // Update club member in PocketBase
    const memberData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      student_id: student_id || "",
      phone: phone || "",
      member_type,
      position: position || "",
      department: department || "",
      year: year || null,
      teams: teams || [],
      skills: skills || [],
      bio: bio || "",
      linkedin_url: linkedin_url || "",
      github_url: github_url || "",
      portfolio_url: portfolio_url || "",
      status: status || "active",
    };

    const updateResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(errorData.message || "Failed to update club member");
    }

    const updatedMember = await updateResponse.json();

    return NextResponse.json({
      message: "Club member updated successfully",
      member: updatedMember,
    });
  } catch (error) {
    console.error("Error updating club member:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update club member",
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

    // Delete club member from PocketBase
    const deleteResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records/${id}`,
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
          { message: "Club member not found" },
          { status: 404 }
        );
      }
      throw new Error("Failed to delete club member");
    }

    return NextResponse.json({
      message: "Club member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting club member:", error);
    return NextResponse.json(
      { message: "Failed to delete club member" },
      { status: 500 }
    );
  }
}
