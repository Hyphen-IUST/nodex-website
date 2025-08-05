"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Users,
  TrendingUp,
  Activity,
  Target,
  Calendar,
  Award,
  PieChart,
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  memberCount: number;
  created: string;
}

interface TeamAnalytics {
  totalTeams: number;
  activeTeams: number;
  totalMembers: number;
  averageMembersPerTeam: number;
  categoryDistribution: { [key: string]: number };
  teamGrowth: { month: string; count: number }[];
  topPerformingTeams: {
    id: string;
    name: string;
    memberCount: number;
    category: string;
    status: string;
  }[];
}

export default function TeamAnalytics() {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch teams data
      const teamsResponse = await fetch("/api/dashboard/teams");
      if (!teamsResponse.ok) {
        throw new Error("Failed to fetch teams");
      }
      const teamsData = await teamsResponse.json();
      const teamsList = teamsData.teams || [];
      setTeams(teamsList);

      // Calculate analytics
      const totalTeams = teamsList.length;
      const activeTeams = teamsList.filter(
        (team: Team) => team.status === "active"
      ).length;
      const totalMembers = teamsList.reduce(
        (sum: number, team: Team) => sum + team.memberCount,
        0
      );
      const averageMembersPerTeam =
        totalTeams > 0 ? Math.round((totalMembers / totalTeams) * 10) / 10 : 0;

      // Category distribution
      const categoryDistribution: { [key: string]: number } = {};
      teamsList.forEach((team: Team) => {
        categoryDistribution[team.category] =
          (categoryDistribution[team.category] || 0) + 1;
      });

      // Team growth (mock data for demonstration)
      const teamGrowth = [
        { month: "Jan", count: Math.max(0, totalTeams - 5) },
        { month: "Feb", count: Math.max(0, totalTeams - 4) },
        { month: "Mar", count: Math.max(0, totalTeams - 3) },
        { month: "Apr", count: Math.max(0, totalTeams - 2) },
        { month: "May", count: Math.max(0, totalTeams - 1) },
        { month: "Jun", count: totalTeams },
      ];

      // Top performing teams (by member count)
      const topPerformingTeams = teamsList
        .sort((a: Team, b: Team) => b.memberCount - a.memberCount)
        .slice(0, 10)
        .map((team: Team) => ({
          id: team.id,
          name: team.name,
          memberCount: team.memberCount,
          category: team.category,
          status: team.status,
        }));

      setAnalytics({
        totalTeams,
        activeTeams,
        totalMembers,
        averageMembersPerTeam,
        categoryDistribution,
        teamGrowth,
        topPerformingTeams,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load team analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Failed to load analytics</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Team Analytics
            </h1>
            <p className="text-muted-foreground">
              Insights and performance metrics for all teams
            </p>
          </div>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="1month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTeams}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.activeTeams} active teams
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalMembers}</div>
              <p className="text-xs text-muted-foreground">Across all teams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Team Size
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.averageMembersPerTeam}
              </div>
              <p className="text-xs text-muted-foreground">Members per team</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.totalTeams > 0
                  ? Math.round(
                      (analytics.activeTeams / analytics.totalTeams) * 100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                Teams currently active
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Team Categories
              </CardTitle>
              <CardDescription>
                Distribution of teams by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.categoryDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{category}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{count}</div>
                        <div className="w-20 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(count / analytics.totalTeams) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Team Growth
              </CardTitle>
              <CardDescription>Team creation over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.teamGrowth.map((item) => (
                  <div
                    key={item.month}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.month}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{item.count}</div>
                      <div className="w-16 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${
                              (item.count /
                                Math.max(
                                  ...analytics.teamGrowth.map((g) => g.count)
                                )) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Teams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Teams by Member Count
            </CardTitle>
            <CardDescription>
              Teams with the most active members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topPerformingTeams.map((team, index) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <Award
                            className={`h-4 w-4 ${
                              index === 0
                                ? "text-yellow-500"
                                : index === 1
                                ? "text-gray-400"
                                : "text-amber-600"
                            }`}
                          />
                        )}
                        #{index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{team.category}</Badge>
                    </TableCell>
                    <TableCell>{team.memberCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          team.status === "active" ? "default" : "secondary"
                        }
                      >
                        {team.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* All Teams Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Teams Overview</CardTitle>
            <CardDescription>
              Complete list of teams with basic metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{team.category}</Badge>
                    </TableCell>
                    <TableCell>{team.memberCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          team.status === "active" ? "default" : "secondary"
                        }
                      >
                        {team.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(team.created).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
