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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Search,
  RefreshCw,
  Calendar,
  User,
  FileText,
  Filter,
} from "lucide-react";

interface ActivityLog {
  created: string;
  id: string;
  action: string;
  user_id?: string;
  user_name?: string;
  resource_type?: string;
  resource_id?: string;
  details?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export default function ActivityLogPage() {
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchActivityLog = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/exec-activity");

      if (!response.ok) {
        throw new Error("Failed to fetch activity log");
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Error fetching activity log:", error);
      toast({
        title: "Error",
        description: "Failed to load activity log",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter activities based on search
  const filteredActivities = activities.filter((activity) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      searchTerm === "" ||
      activity.action.toLowerCase().includes(searchLower) ||
      activity.details?.toLowerCase().includes(searchLower) ||
      activity.user_name?.toLowerCase().includes(searchLower)
    );
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("create") || action.includes("add")) return "default";
    if (action.includes("update") || action.includes("edit"))
      return "secondary";
    if (action.includes("delete") || action.includes("remove"))
      return "destructive";
    return "outline";
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const recentActivities = activities.slice(0, 10);
  const todaysActivities = activities.filter(
    (a) => new Date(a.timestamp).toDateString() === new Date().toDateString()
  );

  return (
    <DashboardLayout>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Activity Log
            </h1>
            <p className="text-muted-foreground">
              Monitor all system activities and user actions
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchActivityLog}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Activity className="h-4 w-4 mr-2" />
              View All Activities
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Activities
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activities.length}</div>
              <p className="text-xs text-muted-foreground">
                All time activities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today&apos;s Activities
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todaysActivities.length}
              </div>
              <p className="text-xs text-muted-foreground">Activities today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Users
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(activities.map((a) => a.user_id).filter(Boolean)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Active contributors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Resource Types
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  new Set(
                    activities.map((a) => a.resource_type).filter(Boolean)
                  ).size
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Different resources
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest 10 system activities and user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-lg">Loading activities...</div>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Activities Found
                </h3>
                <p className="text-muted-foreground">
                  No activities have been logged yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant={getActionBadgeVariant(activity.action)}>
                        {activity.action}
                      </Badge>
                      <div>
                        <p className="font-medium">
                          {activity.user_name || activity.user_id || "System"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.details || "No details available"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatTimestamp(activity.created)}
                      </p>
                      {activity.resource_type && (
                        <Badge variant="outline" className="text-xs">
                          {activity.resource_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Full Activity Log Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                All Activities
              </DialogTitle>
              <DialogDescription>
                Complete system activity log with search and filtering
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  disabled={!searchTerm}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>

              {/* Activities Table */}
              <div className="border rounded-lg max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Activity className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            {searchTerm
                              ? "No activities match your search"
                              : "No activities found"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredActivities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-mono text-sm">
                            {formatTimestamp(activity.created)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getActionBadgeVariant(activity.action)}
                            >
                              {activity.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {activity.user_name || activity.user_id || "System"}
                          </TableCell>
                          <TableCell>
                            {activity.resource_type && (
                              <Badge variant="outline">
                                {activity.resource_type}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {activity.details || "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </DashboardLayout>
  );
}
