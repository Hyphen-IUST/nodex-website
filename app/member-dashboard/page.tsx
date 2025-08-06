"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MemberDashboardLayout } from "@/components/member-dashboard/member-dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/page-loading";
import { Users, FolderOpen, User, Shield, ChevronRight } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  member_type: string;
  position?: string;
}

interface Team {
  id: string;
  name: string;
  category: string;
}

interface DashboardStats {
  totalTeams: number;
  totalResources: number;
  recentActivity: number;
}

export default function MemberDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    totalResources: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/member-auth-check");
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        setMember(data.member);
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

  const fetchDashboardData = async () => {
    try {
      // Fetch teams
      const teamsResponse = await fetch("/api/member-dashboard/teams");
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData.teams || []);
      }

      // Fetch resources count
      const resourcesResponse = await fetch("/api/member-dashboard/resources");
      if (resourcesResponse.ok) {
        const resourcesData = await resourcesResponse.json();
        setStats((prev) => ({
          ...prev,
          totalTeams: teams.length,
          totalResources: resourcesData.resources?.length || 0,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
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
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (loading || isAuthenticated === null) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MemberDashboardLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Welcome back, {member?.name}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Access your teams, resources, and manage your membership
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
              <p className="text-xs text-muted-foreground">
                Active team memberships
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Resources Available
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResources}</div>
              <p className="text-xs text-muted-foreground">
                Learning materials
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Member Status
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant="secondary" className="text-sm">
                  {member?.member_type || "Member"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Current membership level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card
            className="group cursor-pointer transition-all hover:shadow-md"
            onClick={() => router.push("/member-dashboard/teams")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base">My Teams</CardTitle>
                <CardDescription className="text-sm">
                  View and explore your teams
                </CardDescription>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {teams.length} teams
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer transition-all hover:shadow-md"
            onClick={() => router.push("/member-dashboard/resources")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base">Resources</CardTitle>
                <CardDescription className="text-sm">
                  Access learning materials
                </CardDescription>
              </div>
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {stats.totalResources} resources
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer transition-all hover:shadow-md sm:col-span-2 lg:col-span-1"
            onClick={() => router.push("/member-dashboard/profile")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base">My Profile</CardTitle>
                <CardDescription className="text-sm">
                  View and update your information
                </CardDescription>
              </div>
              <User className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Profile settings
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Teams Preview */}
        {teams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5" />
                Recent Teams
              </CardTitle>
              <CardDescription className="text-sm">
                Your most recent team activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teams.slice(0, 3).map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() =>
                      router.push(`/member-dashboard/teams/${team.id}`)
                    }
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          {team.name}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {team.category}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
                {teams.length > 3 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/member-dashboard/teams")}
                  >
                    View All Teams ({teams.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </MemberDashboardLayout>
  );
}
