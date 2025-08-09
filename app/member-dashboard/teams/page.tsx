"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MemberDashboardLayout } from "@/components/member-dashboard/member-dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/page-loading";
import {
  Users,
  ChevronRight,
  ArrowLeft,
  GitBranch,
  ExternalLink,
  Link as LinkIcon,
  Calendar,
  UserCheck,
  CheckCircle,
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  team_lead?: string;
  repository_url?: string;
  jira_link?: string;
  status: string;
  image_url?: string;
  created_by: string;
  max_members?: number;
  created: string;
  updated: string;
  memberCount?: number;
  taskCount?: number;
  completedTaskCount?: number;
}

export default function MemberTeamsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/member-dashboard/teams");
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      } else {
        console.error("Failed to fetch teams");
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams();
    }
  }, [isAuthenticated]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "planning":
        return <Badge variant="outline">Planning</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (loading || isAuthenticated === null) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MemberDashboardLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/member-dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            My Teams
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Teams you&apos;re currently a member of
          </p>
        </div>

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                You&apos;re not assigned to any teams yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Contact your administrator to join teams.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {teams.map((team) => (
              <Card
                key={team.id}
                className="group cursor-pointer transition-all hover:shadow-md"
                onClick={() =>
                  router.push(`/member-dashboard/teams/${team.id}`)
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {/* Team Image */}
                    {team.image_url ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border bg-muted flex-shrink-0 relative">
                        <Image
                          src={team.image_url}
                          alt={`${team.name} logo`}
                          fill
                          className="object-cover"
                          onError={() => {
                            // Handle error by showing fallback
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg truncate">
                          {team.name}
                        </CardTitle>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {team.category}
                        </Badge>
                        {team.status && getStatusBadge(team.status)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 mb-4">
                    {team.description || "No description available"}
                  </CardDescription>

                  {/* Team Stats */}
                  {(team.memberCount !== undefined ||
                    team.taskCount !== undefined) && (
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      {team.memberCount !== undefined && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {team.memberCount}
                            {team.max_members && (
                              <span className="text-muted-foreground">
                                /{team.max_members}
                              </span>
                            )}{" "}
                            members
                          </span>
                        </div>
                      )}
                      {team.taskCount !== undefined && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-muted-foreground" />
                          <span>{team.taskCount} tasks</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress Bar */}
                  {team.taskCount !== undefined &&
                    team.taskCount > 0 &&
                    team.completedTaskCount !== undefined && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {getProgressPercentage(
                              team.completedTaskCount,
                              team.taskCount
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${getProgressPercentage(
                                team.completedTaskCount,
                                team.taskCount
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                  {/* Team Info */}
                  <div className="space-y-2 text-xs text-muted-foreground mb-4">
                    {team.team_lead && (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3 h-3" />
                        <span>Lead: {team.team_lead}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Created {new Date(team.created).toLocaleDateString()}
                      </span>
                    </div>
                    {team.created_by && (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3 h-3" />
                        <span>by {team.created_by}</span>
                      </div>
                    )}
                  </div>

                  {/* External Links */}
                  {(team.repository_url || team.jira_link) && (
                    <div className="flex flex-col gap-2 mb-4">
                      {team.repository_url && (
                        <a
                          href={team.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GitBranch className="w-4 h-4" />
                          <span>Repository</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {team.jira_link && (
                        <a
                          href={team.jira_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span>JIRA Project</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="w-3 h-3 mr-1" />
                      Team Member
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {teams.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Team Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{teams.length}</div>
                  <p className="text-sm text-muted-foreground">Total Teams</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {[...new Set(teams.map((t) => t.category))].length}
                  </div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">Active</div>
                  <p className="text-sm text-muted-foreground">
                    Membership Status
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </MemberDashboardLayout>
  );
}
