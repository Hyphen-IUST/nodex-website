import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface NodexTeamMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  category: string;
  title?: string;
  qualification?: string;
  description?: string;
  skills?: string;
  github?: string;
  linkedin?: string;
  photo?: string;
  created: string;
  updated: string;
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const memberType = searchParams.get("type") || "";
    const teamId = searchParams.get("team") || "";
    const status = searchParams.get("status") || "";

    // Build filter string
    let filter = "";
    const filters = [];

    if (search) {
      filters.push(
        `(name~"${search}" || email~"${search}" || student_id~"${search}")`
      );
    }

    if (memberType) {
      filters.push(`member_type="${memberType}"`);
    }

    if (teamId) {
      filters.push(`teams~"${teamId}"`);
    }

    if (status) {
      filters.push(`status="${status}"`);
    }

    if (filters.length > 0) {
      filter = filters.join(" && ");
    }

    // Get club members with team relations
    const membersResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records?` +
        `page=${page}&perPage=${limit}&sort=-created&expand=teams` +
        (filter ? `&filter=(${filter})` : ""),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!membersResponse.ok) {
      throw new Error("Failed to fetch club members");
    }

    const membersData = await membersResponse.json();

    // Get nodex_team members (founding, core, direc)
    const nodexTeamResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_team/records?sort=pos`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const nodexTeamData = nodexTeamResponse.ok
      ? await nodexTeamResponse.json()
      : { items: [] };

    // Transform nodex_team members to match club_members structure
    const transformedNodexMembers = nodexTeamData.items.map(
      (member: NodexTeamMember) => ({
        id: `nodex_${member.id}`, // Add prefix to avoid ID conflicts
        name: member.name,
        email: member.email || "",
        student_id: "",
        phone: member.phone || "",
        member_type: member.category === "direc" ? "bos" : member.category, // Map 'direc' to 'bos'
        position: member.title || "",
        department: "",
        year: null,
        teams: [],
        skills: member.skills
          ? member.skills.split(",").map((s: string) => s.trim())
          : [],
        bio: member.description || "",
        linkedin_url: member.linkedin || "",
        github_url: member.github || "",
        portfolio_url: "",
        status: "active",
        created: member.created,
        updated: member.updated,
        source: "nodex_team", // Flag to identify source
        readonly: true, // Flag to indicate read-only
        photo: member.photo || "",
        qualification: member.qualification || "",
      })
    );

    // Apply filters to nodex_team members as well
    const filteredNodexMembers = transformedNodexMembers.filter(
      (member: (typeof transformedNodexMembers)[0]) => {
        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          const matchesSearch =
            member.name.toLowerCase().includes(searchLower) ||
            member.email.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }

        // Apply member type filter
        if (memberType && memberType !== member.member_type) {
          return false;
        }

        // Apply status filter (nodex_team members are always active)
        if (status && status !== "active") {
          return false;
        }

        // Team filter doesn't apply to nodex_team members since they don't have team assignments
        if (teamId) {
          return false;
        }

        return true;
      }
    );

    // Combine club_members and filtered nodex_team members
    const allMembers = [...membersData.items, ...filteredNodexMembers];

    // Sort combined results by created date (newest first)
    allMembers.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    ); // Get teams for dropdowns
    const teamsResponse = await fetch(
      `${pocketbaseUrl}/api/collections/teams/records?sort=name`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const teamsData = teamsResponse.ok
      ? await teamsResponse.json()
      : { items: [] };

    return NextResponse.json({
      members: allMembers,
      totalItems: allMembers.length,
      totalPages: Math.ceil(allMembers.length / limit),
      page: 1, // Since we're combining results, pagination is simplified
      teams: teamsData.items,
    });
  } catch (error) {
    console.error("Error fetching club members:", error);
    return NextResponse.json(
      { message: "Failed to fetch club members" },
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

    // Create club member in PocketBase
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

    const createResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.message || "Failed to create club member");
    }

    const newMember = await createResponse.json();

    return NextResponse.json({
      message: "Club member created successfully",
      member: newMember,
    });
  } catch (error) {
    console.error("Error creating club member:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create club member",
      },
      { status: 500 }
    );
  }
}
