"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MemberDashboardLayout } from "@/components/member-dashboard/member-dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/page-loading";
import {
  Users,
  ArrowLeft,
  Mail,
  Linkedin,
  Github,
  ExternalLink,
  Briefcase,
  GraduationCap,
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  created: string;
  updated: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  position?: string;
  member_type: string;
  department?: string;
  skills: string[];
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  isNodexMember: boolean;
}

interface TeamData {
  team: Team;
  members: TeamMember[];
}

export default function MemberTeamDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params?.id as string;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/member-auth-check");
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push("/member-dashboard/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      router.push("/member-dashboard/login");
    }
  };

  const fetchTeamDetails = async () => {
    try {
      const response = await fetch(`/api/member-dashboard/teams/${teamId}`);
      if (response.ok) {
        const data = await response.json();
        setTeamData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch team details");
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
      setError("Failed to fetch team details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated && teamId) {
      fetchTeamDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, teamId]);

  if (loading || isAuthenticated === null) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <MemberDashboardLayout>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {error}
              </p>
              <Button onClick={() => router.push("/member-dashboard/teams")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Teams
              </Button>
            </CardContent>
          </Card>
        </main>
      </MemberDashboardLayout>
    );
  }

  if (!teamData) {
    return <PageLoading />;
  }

  const { team, members } = teamData;

  return (
    <MemberDashboardLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/member-dashboard/teams")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {team.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{team.category}</Badge>
                <Badge variant="outline">
                  <Users className="w-3 h-3 mr-1" />
                  {members.length} members
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {team.description || "No description available"}
              </p>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Team Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <div className="space-y-1">
                          {member.position && (
                            <Badge variant="secondary" className="text-xs">
                              <Briefcase className="w-3 h-3 mr-1" />
                              {member.position}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {member.member_type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.department && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          <span>{member.department}</span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {member.bio && (
                      <div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {member.bio}
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    {member.skills && member.skills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {member.linkedin_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() =>
                            window.open(member.linkedin_url, "_blank")
                          }
                        >
                          <Linkedin className="w-4 h-4" />
                        </Button>
                      )}
                      {member.github_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() =>
                            window.open(member.github_url, "_blank")
                          }
                        >
                          <Github className="w-4 h-4" />
                        </Button>
                      )}
                      {member.portfolio_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() =>
                            window.open(member.portfolio_url, "_blank")
                          }
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Team Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{members.length}</div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {[...new Set(members.map((m) => m.member_type))].length}
                  </div>
                  <p className="text-sm text-muted-foreground">Member Types</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {[...new Set(members.flatMap((m) => m.skills))].length}
                  </div>
                  <p className="text-sm text-muted-foreground">Unique Skills</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {members.filter((m) => m.isNodexMember).length}
                  </div>
                  <p className="text-sm text-muted-foreground">NodeX Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </MemberDashboardLayout>
  );
}
