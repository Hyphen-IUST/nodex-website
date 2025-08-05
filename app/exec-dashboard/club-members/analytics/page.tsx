"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Award,
  Calendar,
  Building,
  GraduationCap,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";

interface Analytics {
  overview: {
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    recentMembers: number;
    membersWithoutTeams: number;
  };
  membersByType: Record<string, number>;
  membersByDepartment: Record<string, number>;
  membersByYear: Record<string, number>;
  teamMembershipStats: Array<{
    teamName: string;
    memberCount: number;
    activeMembers: number;
  }>;
  topSkills: Array<{
    skill: string;
    count: number;
  }>;
  recentMembersList: Array<{
    id: string;
    name: string;
    member_type: string;
    created: string;
  }>;
}

export default function ClubMembersAnalyticsPage() {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/club-members/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to fetch club member analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getMemberTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "bos":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "core":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "founding":
        return "bg-gold-100 text-gold-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "regular":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading analytics...</div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Analytics Unavailable</h1>
            <Link href="/exec-dashboard/club-members">
              <Button>Back to Members</Button>
            </Link>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/exec-dashboard/club-members">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Members
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Members Analytics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights into club membership data
            </p>
          </div>
          <Button onClick={fetchAnalytics} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.overview.totalMembers}
              </div>
              <p className="text-xs text-muted-foreground">All time members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Members
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.overview.activeMembers}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.totalMembers > 0
                  ? `${Math.round(
                      (analytics.overview.activeMembers /
                        analytics.overview.totalMembers) *
                        100
                    )}% of total`
                  : "0% of total"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {analytics.overview.inactiveMembers}
              </div>
              <p className="text-xs text-muted-foreground">Inactive & alumni</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New (30 days)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.overview.recentMembers}
              </div>
              <p className="text-xs text-muted-foreground">Recent additions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No Teams</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {analytics.overview.membersWithoutTeams}
              </div>
              <p className="text-xs text-muted-foreground">
                Unassigned members
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Members by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Members by Type
              </CardTitle>
              <CardDescription>
                Distribution of member types in the club
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.membersByType).map(
                  ([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getMemberTypeColor(type)}>
                          {type.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{count} members</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {analytics.overview.totalMembers > 0
                          ? `${Math.round(
                              (count / analytics.overview.totalMembers) * 100
                            )}%`
                          : "0%"}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Members by Department */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Members by Department
              </CardTitle>
              <CardDescription>
                Academic department distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.membersByDepartment)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([department, count]) => (
                    <div
                      key={department}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{department}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                {Object.keys(analytics.membersByDepartment).length > 6 && (
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    +{Object.keys(analytics.membersByDepartment).length - 6}{" "}
                    more departments
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Members by Year */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Members by Academic Year
              </CardTitle>
              <CardDescription>Distribution by graduation year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.membersByYear)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([year, count]) => (
                    <div
                      key={year}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Class of {year}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Skills
              </CardTitle>
              <CardDescription>
                Most common skills across members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topSkills.slice(0, 8).map(({ skill, count }) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{skill}</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/20 rounded-full h-2 w-16 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              (count / analytics.topSkills[0]?.count) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Membership Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Membership Overview
            </CardTitle>
            <CardDescription>Member distribution across teams</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.teamMembershipStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No teams available for analysis
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Total Members</TableHead>
                      <TableHead>Active Members</TableHead>
                      <TableHead>Activity Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.teamMembershipStats
                      .sort((a, b) => b.memberCount - a.memberCount)
                      .map((team) => (
                        <TableRow key={team.teamName}>
                          <TableCell className="font-medium">
                            {team.teamName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{team.memberCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {team.activeMembers}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="bg-green-100 dark:bg-green-900 rounded-full h-2 w-16 overflow-hidden">
                                <div
                                  className="bg-green-600 h-full rounded-full"
                                  style={{
                                    width: `${
                                      team.memberCount > 0
                                        ? (team.activeMembers /
                                            team.memberCount) *
                                          100
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {team.memberCount > 0
                                  ? `${Math.round(
                                      (team.activeMembers / team.memberCount) *
                                        100
                                    )}%`
                                  : "0%"}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Members
            </CardTitle>
            <CardDescription>
              Members who joined in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.recentMembersList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No new members in the last 30 days
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.recentMembersList.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Joined {formatDate(member.created)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getMemberTypeColor(member.member_type)}>
                        {member.member_type.toUpperCase()}
                      </Badge>
                      <Link href={`/exec-dashboard/club-members/${member.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
