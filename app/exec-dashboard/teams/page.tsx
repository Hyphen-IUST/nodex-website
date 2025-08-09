"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/page-loading";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useExecActivityLogger";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  GitBranch,
  CheckCircle,
  Eye,
  Loader2,
  BarChart3,
  Calendar,
  UserCheck,
  Link as LinkIcon,
  Clock,
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
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
}

interface Recruiter {
  id: string;
  assignee: string;
  team_mgmt?: boolean;
}

export default function TeamsManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    team: Team | null;
  }>({ open: false, team: null });
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    team_lead: "",
    repository_url: "",
    jira_link: "",
    status: "active",
    image_url: "",
    max_members: "",
  });

  const teamCategories = [
    "Development",
    "Design",
    "Research",
    "Marketing",
    "Content",
    "Events",
    "Finance",
    "Operations",
    "Other",
  ];

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/auth-check");
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        setRecruiter(data.recruiter);

        if (!data.recruiter?.team_mgmt) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You don't have team management permissions.",
          });
          router.push("/exec-dashboard");
          return;
        }
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

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/dashboard/teams");
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      } else if (response.status === 403) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have team management permissions.",
        });
        router.push("/exec-dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch teams",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated && recruiter?.team_mgmt) {
      fetchTeams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, recruiter]);

  const handleCreateTeam = () => {
    setEditingTeam(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      team_lead: "",
      repository_url: "",
      jira_link: "",
      status: "active",
      image_url: "",
      max_members: "",
    });
    setDialogOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description,
      category: team.category,
      team_lead: team.team_lead || "",
      repository_url: team.repository_url || "",
      jira_link: team.jira_link || "",
      status: team.status,
      image_url: team.image_url || "",
      max_members: team.max_members?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingTeam
        ? `/api/dashboard/teams/${editingTeam.id}`
        : "/api/dashboard/teams";
      const method = editingTeam ? "PUT" : "POST";

      // Prepare data with proper types
      const submitData = {
        ...formData,
        max_members: formData.max_members
          ? parseInt(formData.max_members)
          : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const action = editingTeam ? "updated" : "created";

        await logActivity({
          action: editingTeam ? "Update Team" : "Create Team",
          resource_type: "team",
          resource_id: editingTeam?.id,
          details: `Team "${formData.name}" ${action}`,
        });

        toast({
          title: editingTeam ? "Team Updated" : "Team Created",
          description: `Team "${formData.name}" has been ${action} successfully.`,
        });
        setDialogOpen(false);
        fetchTeams();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save team");
      }
    } catch (error) {
      console.error("Error saving team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save team",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!deleteDialog.team) return;

    try {
      const response = await fetch(
        `/api/dashboard/teams/${deleteDialog.team.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await logActivity({
          action: "Delete Team",
          resource_type: "team",
          resource_id: deleteDialog.team.id,
          details: `Team "${deleteDialog.team.name}" deleted`,
        });

        toast({
          title: "Team Deleted",
          description: `Team "${deleteDialog.team.name}" has been deleted.`,
        });
        setDeleteDialog({ open: false, team: null });
        fetchTeams();
      } else {
        throw new Error("Failed to delete team");
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete team",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "planning":
        return <Badge variant="outline">Planning</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
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

  if (!isAuthenticated || !recruiter?.team_mgmt) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Team Management
            </h1>
            <p className="text-muted-foreground">
              Manage teams, members, and their projects
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/exec-dashboard/teams/analytics")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button onClick={() => router.push("/exec-dashboard/teams/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first team to get started with team management.
              </p>
              <Button onClick={handleCreateTeam}>
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow">
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
                        {getStatusBadge(team.status)}
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {team.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Category and Team Lead */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{team.category}</Badge>
                      {team.team_lead && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <UserCheck className="w-3 h-3" />
                          <span className="truncate max-w-20">
                            {team.team_lead}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
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
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        <span>{team.taskCount} tasks</span>
                      </div>
                    </div>

                    {/* Progress */}
                    {team.taskCount > 0 && (
                      <div className="space-y-2">
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
                    <div className="space-y-2 text-xs text-muted-foreground">
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
                      {team.updated && team.updated !== team.created && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>
                            Updated{" "}
                            {new Date(team.updated).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* External Links */}
                    <div className="flex flex-col gap-2">
                      {team.repository_url && (
                        <a
                          href={team.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span>JIRA Project</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/exec-dashboard/teams/${team.id}`)
                        }
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTeam(team)}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, team })}
                      >
                        <Trash2 className="w-4 h-4 mr-1 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Team Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTeam ? "Edit Team" : "Create New Team"}
              </DialogTitle>
              <DialogDescription>
                {editingTeam
                  ? "Update team information and settings."
                  : "Create a new team and set up its basic information."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter team name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the team's purpose and goals"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="repository_url">
                  Repository URL (Optional)
                </Label>
                <Input
                  id="repository_url"
                  type="url"
                  value={formData.repository_url}
                  onChange={(e) =>
                    setFormData({ ...formData, repository_url: e.target.value })
                  }
                  placeholder="https://github.com/org/repo"
                />
              </div>

              <div>
                <Label htmlFor="jira_link">JIRA Project Link (Optional)</Label>
                <Input
                  id="jira_link"
                  type="url"
                  value={formData.jira_link}
                  onChange={(e) =>
                    setFormData({ ...formData, jira_link: e.target.value })
                  }
                  placeholder="https://your-org.atlassian.net/projects/..."
                />
              </div>

              <div>
                <Label htmlFor="team_lead">Team Lead (Optional)</Label>
                <Input
                  id="team_lead"
                  value={formData.team_lead}
                  onChange={(e) =>
                    setFormData({ ...formData, team_lead: e.target.value })
                  }
                  placeholder="Team lead name"
                />
              </div>

              <div>
                <Label htmlFor="max_members">Maximum Members (Optional)</Label>
                <Input
                  id="max_members"
                  type="number"
                  min="1"
                  value={formData.max_members}
                  onChange={(e) =>
                    setFormData({ ...formData, max_members: e.target.value })
                  }
                  placeholder="e.g. 10"
                />
              </div>

              <div>
                <Label htmlFor="image_url">Team Image URL (Optional)</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://example.com/team-logo.png"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingTeam ? "Updating..." : "Creating..."}
                    </>
                  ) : editingTeam ? (
                    "Update Team"
                  ) : (
                    "Create Team"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, team: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Team</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &ldquo;{deleteDialog.team?.name}
                &rdquo;? This action cannot be undone and will also delete all
                team members and tasks.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTeam}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Team
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
