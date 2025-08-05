"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageLoading } from "@/components/ui/page-loading";
import {
  Users,
  Calendar,
  FolderOpen,
  UserCog,
  Settings,
  BarChart3,
  Clock,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";

interface Recruiter {
  id: string;
  assignee: string;
}

interface DashboardStats {
  pendingApplications: number;
  totalEvents: number;
  activeResources: number;
  teamMembers: number;
}

interface ExecActivity {
  id: string;
  recruiter_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: string;
  created: string;
  recruiter?: {
    assignee: string;
  };
}

export default function ExecDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<ExecActivity[]>([]);
  const [allActivities, setAllActivities] = useState<ExecActivity[]>([]);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    pendingApplications: 0,
    totalEvents: 0,
    activeResources: 0,
    teamMembers: 0,
  });

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/auth-check");
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        setRecruiter(data.recruiter);
      } else {
        setIsAuthenticated(false);
        router.push("/exec-dashboard/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      router.push("/exec-dashboard/login");
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const [applicationsRes, eventsRes, resourcesRes, teamRes] =
        await Promise.all([
          fetch("/api/dashboard/stats/applications"),
          fetch("/api/dashboard/stats/event-metrics"),
          fetch("/api/dashboard/stats/resources"),
          fetch("/api/dashboard/stats/team"),
        ]);

      if (applicationsRes.ok) {
        const data = await applicationsRes.json();
        setStats((prev) => ({
          ...prev,
          pendingApplications: data.pending || 0,
        }));
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setStats((prev) => ({ ...prev, totalEvents: data.total || 0 }));
      }

      if (resourcesRes.ok) {
        const data = await resourcesRes.json();
        setStats((prev) => ({ ...prev, activeResources: data.active || 0 }));
      }

      if (teamRes.ok) {
        const data = await teamRes.json();
        setStats((prev) => ({ ...prev, teamMembers: data.total || 0 }));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch("/api/dashboard/exec-activity?limit=5");
      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to fetch recent activities:", error);
    }
  };

  const fetchAllActivities = async () => {
    try {
      const response = await fetch("/api/dashboard/exec-activity");
      if (response.ok) {
        const data = await response.json();
        setAllActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to fetch all activities:", error);
    }
  };

  const getActivityIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes("create") || actionLower.includes("add")) {
      return <Plus className="h-4 w-4 text-green-500" />;
    }
    if (actionLower.includes("update") || actionLower.includes("edit")) {
      return <Edit3 className="h-4 w-4 text-blue-500" />;
    }
    if (actionLower.includes("delete") || actionLower.includes("remove")) {
      return <Trash2 className="h-4 w-4 text-red-500" />;
    }
    if (actionLower.includes("approve")) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (actionLower.includes("reject")) {
      return <Clock className="h-4 w-4 text-red-500" />;
    }
    if (actionLower.includes("rollback")) {
      return <ArrowRight className="h-4 w-4 text-orange-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - activityDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return activityDate.toLocaleDateString();
  };

  const handleViewAllActivities = async () => {
    setActivityDialogOpen(true);
    await fetchAllActivities();
  };

  useEffect(() => {
    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
      fetchRecentActivities();
    }
  }, [isAuthenticated]);

  if (loading || isAuthenticated === null) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const dashboardCards = [
    {
      title: "Recruitment Management",
      description: "Manage job applications and recruitment process",
      href: "/exec-dashboard/recruitment",
      icon: Users,
      stats: `${stats.pendingApplications} pending`,
      color: "text-blue-500",
    },
    {
      title: "Event Management",
      description: "Create and manage NodeX events",
      href: "/exec-dashboard/events",
      icon: Calendar,
      stats: `${stats.totalEvents} events`,
      color: "text-green-500",
    },
    {
      title: "Resource Management",
      description: "Manage learning resources and materials",
      href: "/exec-dashboard/resources",
      icon: FolderOpen,
      stats: `${stats.activeResources} resources`,
      color: "text-orange-500",
    },
    {
      title: "Board of Students",
      description: "Manage BOS onboarding and members",
      href: "/exec-dashboard/bos",
      icon: UserCog,
      stats: "BOS management",
      color: "text-purple-500",
    },
    {
      title: "Team Management",
      description: "Manage team members and roles",
      href: "/exec-dashboard/team",
      icon: Users,
      stats: `${stats.teamMembers} members`,
      color: "text-pink-500",
    },
    {
      title: "Site Settings",
      description: "Configure site-wide settings and preferences",
      href: "/exec-dashboard/settings",
      icon: Settings,
      stats: "System settings",
      color: "text-gray-500",
    },
  ];

  return (
    <DashboardLayout>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back, {recruiter?.assignee}
          </h1>
          <p className="text-muted-foreground">
            Manage NodeX operations from your dashboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Applications
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingApplications}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">Events managed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Resources
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeResources}</div>
              <p className="text-xs text-muted-foreground">
                Available resources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.teamMembers}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className={`h-8 w-8 ${card.color}`} />
                      <Badge variant="secondary">{card.stats}</Badge>
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest changes and updates across the platform
                </CardDescription>
              </div>
              <Dialog
                open={activityDialogOpen}
                onOpenChange={setActivityDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewAllActivities}
                  >
                    View All
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>All Activity History</DialogTitle>
                    <DialogDescription>
                      Complete history of all executive activities
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {allActivities.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No activities found
                        </p>
                      </div>
                    ) : (
                      allActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-lg border"
                        >
                          {getActivityIcon(activity.action)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {activity.action}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {activity.details}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground">
                                by {activity.recruiter?.assignee || "Unknown"}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {activity.resource_type}
                              </Badge>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimeAgo(activity.created)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Dashboard initialized</p>
                    <p className="text-xs text-muted-foreground">
                      Welcome to the NodeX Executive Dashboard
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Just now
                  </span>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    {getActivityIcon(activity.action)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {activity.details}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          by {activity.recruiter?.assignee || "Unknown"}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {activity.resource_type}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.created)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
