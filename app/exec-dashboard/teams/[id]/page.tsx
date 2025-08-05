"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useActivityLogger";
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
import { Label } from "@/components/ui/label";
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
import {
  Users,
  Plus,
  Trash2,
  ArrowLeft,
  ExternalLink,
  Target,
  TrendingUp,
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "active" | "inactive" | "planning";
  repository?: string;
  jira_link?: string;
  created: string;
  updated: string;
}

interface TeamMember {
  id: string;
  name: string; // Direct from club_members
  email: string; // Direct from club_members
  member_type: string;
  position?: string;
  status: string;
  teams: string[]; // Array of team IDs
  skills: string[];
  phone?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  photo?: string;
  created: string;
  updated: string;
  source?: "club_members" | "nodex_team"; // Added by API
}

interface ClubMember {
  id: string;
  name: string;
  email: string;
  member_type: string;
  position?: string;
  status: string;
  source?: "club_members" | "nodex_team";
  readonly?: boolean;
}

interface NewMemberForm {
  member_id: string; // ID of the club member to add to team
}

export default function TeamDetail() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  const teamId = params.id as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Delete confirmation states
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: TeamMember | null;
  }>({ open: false, item: null });

  // Form states
  const [newMember, setNewMember] = useState<NewMemberForm>({
    member_id: "",
  });

  const fetchTeamData = React.useCallback(async () => {
    try {
      setLoading(true);

      // Fetch team details
      const teamResponse = await fetch(`/api/dashboard/teams/${teamId}`);
      if (!teamResponse.ok) {
        throw new Error("Failed to fetch team");
      }
      const teamData = await teamResponse.json();
      setTeam(teamData.team);
      setMembers(teamData.members);

      // Fetch available club members for selection
      const clubMembersResponse = await fetch(
        `/api/dashboard/club-members?limit=1000`
      );
      if (clubMembersResponse.ok) {
        const clubMembersData = await clubMembersResponse.json();
        setClubMembers(clubMembersData.members || []);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [teamId, toast]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleAddMember = async () => {
    try {
      // Find the selected club member
      const selectedMember = clubMembers.find(
        (m) => m.id === newMember.member_id
      );
      if (!selectedMember) {
        toast({
          title: "Error",
          description: "Please select a member",
          variant: "destructive",
        });
        return;
      }

      const memberData = {
        member_id: newMember.member_id,
      };

      // For the new structure, we don't have separate editing
      // We just add/remove members from teams
      if (editingMember) {
        toast({
          title: "Info",
          description:
            "Member editing is not available with the new structure. You can remove and re-add the member if needed.",
        });
        setMemberDialogOpen(false);
        setEditingMember(null);
        return;
      }

      const response = await fetch(`/api/dashboard/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add member");
      }

      await logActivity("team_member_added", {
        team_id: teamId,
        team_name: team?.name,
        member_name: selectedMember.name,
        member_type: selectedMember.member_type,
      });

      toast({
        title: "Success",
        description: "Team member added successfully",
      });

      setNewMember({
        member_id: "",
      });
      setMemberDialogOpen(false);
      setEditingMember(null);
      await fetchTeamData();
    } catch (error) {
      console.error("Error adding member:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add team member",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (member: TeamMember) => {
    try {
      // Use the new API that removes team from member's teams array
      const memberId = member.id; // This could be prefixed with nodex_ for NodeX team members
      const response = await fetch(
        `/api/dashboard/teams/${teamId}/members?member_id=${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove member from team");
      }

      await logActivity("team_member_removed", {
        team_id: teamId,
        team_name: team?.name,
        member_name: member.name,
        position: member.position || member.member_type,
      });

      toast({
        title: "Success",
        description: "Team member removed successfully",
      });

      setDeleteDialog({ open: false, item: null });
      await fetchTeamData();
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    }
  };

  const resetMemberForm = () => {
    setNewMember({
      member_id: "",
    });
    setEditingMember(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading team data...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!team) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Team not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/exec-dashboard/teams")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>

          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {team.name}
            </h1>
            <p className="text-muted-foreground">{team.description}</p>
          </div>

          {team.repository && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(team.repository, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Repository
            </Button>
          )}

          {team.jira_link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(team.jira_link, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Jira Board
            </Button>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">
                Active contributors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Category</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{team.category}</div>
              <p className="text-xs text-muted-foreground">Team focus area</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge
                variant={team.status === "active" ? "default" : "secondary"}
              >
                {team.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Current team status
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage team members and their roles
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  resetMemberForm();
                  setMemberDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Position/Type</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{member.name}</span>
                        {member.source && (
                          <span className="text-xs text-muted-foreground">
                            {member.source === "nodex_team"
                              ? "NodeX Team"
                              : "Club Member"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {member.position || member.member_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {member.skills.slice(0, 3).map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {member.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{member.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(member.created).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === "active" ? "default" : "secondary"
                        }
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              item: member,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Member Dialog */}
        <Dialog
          open={memberDialogOpen}
          onOpenChange={(open) => {
            setMemberDialogOpen(open);
            if (!open) resetMemberForm();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit" : "Add"} Team Member
              </DialogTitle>
              <DialogDescription>
                {editingMember
                  ? "Member editing is limited with the new structure. Consider removing and re-adding if needed."
                  : "Select a club member to add to this team."}{" "}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="member_id">Select Member</Label>
                <Select
                  value={newMember.member_id}
                  onValueChange={(value) =>
                    setNewMember({ ...newMember, member_id: value })
                  }
                  disabled={!!editingMember} // Disable member selection when editing
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a member from the club" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubMembers.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No club members available
                      </div>
                    ) : (
                      clubMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex flex-col">
                            <span>{member.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {member.email} •{" "}
                              {member.member_type === "bos"
                                ? "BoS"
                                : member.member_type}
                              {member.readonly && " (Official)"}
                              {member.source &&
                                ` • ${
                                  member.source === "nodex_team"
                                    ? "NodeX Team"
                                    : "Club Member"
                                }`}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {editingMember && !newMember.member_id && (
                  <p className="text-xs text-muted-foreground mt-1">
                    This member is not linked to a club member record.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setMemberDialogOpen(false);
                  resetMemberForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddMember} disabled={!newMember.member_id}>
                {editingMember ? "Update" : "Add"} Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this member? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteDialog.item) {
                    handleDeleteMember(deleteDialog.item);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </DashboardLayout>
  );
}
