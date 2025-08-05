import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface NodexTeamMember {
  id: string;
  name: string;
  category: string;
  created: string;
  skills?: string;
}

interface Team {
  id: string;
  name: string;
}

interface ClubMember {
  id: string;
  name: string;
  member_type: string;
  status: string;
  created: string;
  teams?: string[];
  skills?: string[];
  department?: string;
  year?: number;
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

    // Get all club members for analytics
    const membersResponse = await fetch(
      `${pocketbaseUrl}/api/collections/club_members/records?perPage=1000&expand=teams`,
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

    // Get nodex_team members
    const nodexTeamResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_team/records?perPage=1000`,
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

    // Transform nodex_team members to match analytics structure
    const transformedNodexMembers = nodexTeamData.items.map(
      (member: NodexTeamMember) => ({
        id: member.id,
        name: member.name,
        member_type: member.category === "direc" ? "bos" : member.category,
        status: "active",
        created: member.created,
        teams: [], // nodex_team members don't have team assignments
        skills: member.skills
          ? member.skills.split(",").map((s: string) => s.trim())
          : [],
        department: "",
        year: null,
      })
    );

    // Combine both member lists
    const members = [...membersData.items, ...transformedNodexMembers];

    // Get all teams
    const teamsResponse = await fetch(
      `${pocketbaseUrl}/api/collections/teams/records?perPage=1000`,
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
    const teams = teamsData.items;

    // Calculate analytics
    const totalMembers = members.length;
    const activeMembers = members.filter(
      (m: ClubMember) => m.status === "active"
    ).length;

    // Members by type
    const membersByType = members.reduce(
      (acc: Record<string, number>, member: ClubMember) => {
        acc[member.member_type] = (acc[member.member_type] || 0) + 1;
        return acc;
      },
      {}
    );

    // Members by department
    const membersByDepartment = members.reduce(
      (acc: Record<string, number>, member: ClubMember) => {
        if (member.department) {
          acc[member.department] = (acc[member.department] || 0) + 1;
        }
        return acc;
      },
      {}
    );

    // Members by year
    const membersByYear = members.reduce(
      (acc: Record<string, number>, member: ClubMember) => {
        if (member.year) {
          acc[member.year] = (acc[member.year] || 0) + 1;
        }
        return acc;
      },
      {}
    );

    // Team membership stats
    const teamMembershipStats = teams.map((team: Team) => {
      const teamMembers = members.filter(
        (member: ClubMember) => member.teams && member.teams.includes(team.id)
      );
      return {
        teamName: team.name,
        memberCount: teamMembers.length,
        activeMembers: teamMembers.filter(
          (m: ClubMember) => m.status === "active"
        ).length,
      };
    });

    // Recent members (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentMembers = members.filter(
      (member: ClubMember) => new Date(member.created) > thirtyDaysAgo
    ).length;

    // Members without teams
    const membersWithoutTeams = members.filter(
      (member: ClubMember) => !member.teams || member.teams.length === 0
    ).length;

    // Skills distribution (top 10)
    const skillsCount: Record<string, number> = {};
    members.forEach((member: ClubMember) => {
      if (member.skills && Array.isArray(member.skills)) {
        member.skills.forEach((skill: string) => {
          skillsCount[skill] = (skillsCount[skill] || 0) + 1;
        });
      }
    });
    const topSkills = Object.entries(skillsCount)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    return NextResponse.json({
      overview: {
        totalMembers,
        activeMembers,
        inactiveMembers: totalMembers - activeMembers,
        recentMembers,
        membersWithoutTeams,
      },
      membersByType,
      membersByDepartment,
      membersByYear,
      teamMembershipStats,
      topSkills,
      recentMembersList: members
        .filter(
          (member: ClubMember) => new Date(member.created) > thirtyDaysAgo
        )
        .sort(
          (a: ClubMember, b: ClubMember) =>
            new Date(b.created).getTime() - new Date(a.created).getTime()
        )
        .slice(0, 10)
        .map((member: ClubMember) => ({
          id: member.id,
          name: member.name,
          member_type: member.member_type,
          created: member.created,
        })),
    });
  } catch (error) {
    console.error("Error fetching club members analytics:", error);
    return NextResponse.json(
      { message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
