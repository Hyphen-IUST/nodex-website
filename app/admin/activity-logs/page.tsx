"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/global/header";
import { Footer } from "@/components/global/footer";
import { PageLoading } from "@/components/ui/page-loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, RefreshCw, Search, Filter } from "lucide-react";

interface ActivityLog {
  id: string;
  ip_address: string;
  user_agent: string;
  action: string;
  page_url: string;
  referrer?: string;
  timestamp: string;
  fingerprint?: {
    screen_resolution?: string;
    timezone?: string;
    language?: string;
    platform?: string;
    cookie_enabled?: boolean;
    do_not_track?: string;
    connection_type?: string;
  };
  additional_data?: Record<string, unknown>;
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/activity-logs");
      if (!response.ok) {
        throw new Error("Failed to fetch activity logs");
      }
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.page_url.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = actionFilter === "all" || log.action === actionFilter;

    return matchesSearch && matchesFilter;
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("error") || action.includes("blocked"))
      return "destructive";
    if (action.includes("success") || action.includes("submission"))
      return "default";
    if (action.includes("view") || action.includes("visit")) return "secondary";
    return "outline";
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

  if (loading) {
    return <PageLoading message="Loading activity logs..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="pt-24 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">
              Error Loading Activity Logs
            </h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchLogs}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Activity Logs</h1>
              <p className="text-muted-foreground">
                Monitor user activities and system interactions
              </p>
            </div>
            <Button onClick={fetchLogs} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by IP, action, or URL..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {uniqueActions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action.replace(/_/g, " ").toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Activity Logs ({filteredLogs.length} entries)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Page/URL</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell className="font-mono">
                          {log.ip_address}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.page_url}
                        </TableCell>
                        <TableCell>
                          {log.fingerprint?.platform || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredLogs.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No activity logs found
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Log Detail Modal */}
          {selectedLog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Activity Log Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Timestamp</label>
                      <p className="text-sm text-muted-foreground font-mono">
                        {formatTimestamp(selectedLog.timestamp)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">IP Address</label>
                      <p className="text-sm text-muted-foreground font-mono">
                        {selectedLog.ip_address}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Action</label>
                    <p className="text-sm text-muted-foreground">
                      <Badge
                        variant={getActionBadgeVariant(selectedLog.action)}
                      >
                        {selectedLog.action.replace(/_/g, " ")}
                      </Badge>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Page URL</label>
                    <p className="text-sm text-muted-foreground break-all">
                      {selectedLog.page_url}
                    </p>
                  </div>

                  {selectedLog.referrer && (
                    <div>
                      <label className="text-sm font-medium">Referrer</label>
                      <p className="text-sm text-muted-foreground break-all">
                        {selectedLog.referrer}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">User Agent</label>
                    <p className="text-sm text-muted-foreground break-all">
                      {selectedLog.user_agent}
                    </p>
                  </div>

                  {selectedLog.fingerprint && (
                    <div>
                      <label className="text-sm font-medium">
                        Browser Fingerprint
                      </label>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {selectedLog.fingerprint.screen_resolution && (
                          <p>
                            Screen: {selectedLog.fingerprint.screen_resolution}
                          </p>
                        )}
                        {selectedLog.fingerprint.timezone && (
                          <p>Timezone: {selectedLog.fingerprint.timezone}</p>
                        )}
                        {selectedLog.fingerprint.language && (
                          <p>Language: {selectedLog.fingerprint.language}</p>
                        )}
                        {selectedLog.fingerprint.platform && (
                          <p>Platform: {selectedLog.fingerprint.platform}</p>
                        )}
                        {selectedLog.fingerprint.connection_type && (
                          <p>
                            Connection:{" "}
                            {selectedLog.fingerprint.connection_type}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedLog.additional_data &&
                    Object.keys(selectedLog.additional_data).length > 0 && (
                      <div>
                        <label className="text-sm font-medium">
                          Additional Data
                        </label>
                        <pre className="text-sm text-muted-foreground bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(selectedLog.additional_data, null, 2)}
                        </pre>
                      </div>
                    )}

                  <div className="flex justify-end">
                    <Button onClick={() => setSelectedLog(null)}>Close</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
