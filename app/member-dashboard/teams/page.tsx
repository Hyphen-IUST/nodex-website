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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/page-loading";
import { Users, ChevronRight, ArrowLeft } from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  created: string;
  updated: string;
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
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {team.category}
                      </Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-3">
                    {team.description || "No description available"}
                  </CardDescription>
                  <div className="mt-4 pt-4 border-t">
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
