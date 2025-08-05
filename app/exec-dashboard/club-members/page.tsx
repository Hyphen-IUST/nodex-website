"use client";

import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Mail,
  GraduationCap,
  BarChart3,
} from "lucide-react";

interface ClubMember {
  id: string;
  name: string;
  email: string;
  student_id?: string;
  phone?: string;
  member_type: string;
  position?: string;
  department?: string;
  year?: number;
  teams?: string[];
  expand?: {
    teams?: Array<{
      id: string;
      name: string;
      category: string;
    }>;
  };
  skills?: string[];
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  status: string;
  created: string;
  updated: string;
  source?: "club_members" | "nodex_team"; // Track data source
  readonly?: boolean; // Indicate if member is read-only
  photo?: string; // For nodex_team members
  qualification?: string; // For nodex_team members
}

interface Team {
  id: string;
  name: string;
  category: string;
}

export default function ClubMembersPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<ClubMember | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (memberTypeFilter && memberTypeFilter !== "all")
        params.append("type", memberTypeFilter);
      if (teamFilter && teamFilter !== "all") params.append("team", teamFilter);
      if (statusFilter && statusFilter !== "all")
        params.append("status", statusFilter);

      const response = await fetch(`/api/dashboard/club-members?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch club members");
      }

      const data = await response.json();
      setMembers(data.members || []);
      setTeams(data.teams || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching club members:", error);
      toast({
        title: "Error",
        description: "Failed to load club members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, memberTypeFilter, teamFilter, statusFilter]);

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    // Prevent deletion of readonly members
    if (memberToDelete.readonly) {
      toast({
        title: "Cannot Delete",
        description:
          "Official team members cannot be deleted from this interface",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      return;
    }

    try {
      const response = await fetch(
        `/api/dashboard/club-members/${memberToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete member");
      }

      toast({
        title: "Success",
        description: "Member deleted successfully",
      });

      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const getMemberTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case "bos":
        return "BoS";
      case "core":
        return "CORE";
      case "founding":
        return "FOUNDING";
      case "regular":
        return "REGULAR";
      default:
        return type.toUpperCase();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Club Members</h1>
            <p className="text-muted-foreground text-sm">
              Manage BoS, core, founding, and regular members
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/exec-dashboard/club-members/analytics"
              className="flex-1 sm:flex-initial"
            >
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link
              href="/exec-dashboard/club-members/create"
              className="flex-1 sm:flex-initial"
            >
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Select
                  value={memberTypeFilter}
                  onValueChange={setMemberTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="bos">BoS</SelectItem>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="founding">Founding</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setMemberTypeFilter("all");
                    setTeamFilter("all");
                    setStatusFilter("all");
                  }}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">All Members</CardTitle>
              <CardDescription>
                {loading ? "Loading..." : `${members.length} members`}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading members...</div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Members Found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchTerm ||
                  memberTypeFilter !== "all" ||
                  teamFilter !== "all" ||
                  statusFilter !== "all"
                    ? "No members match your current filters."
                    : "No members have been added yet."}
                </p>
                <Link href="/exec-dashboard/club-members/create">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Member
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Member</TableHead>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead className="w-[120px]">Position</TableHead>
                        <TableHead className="w-[130px]">Department</TableHead>
                        <TableHead className="w-[150px]">Teams</TableHead>
                        <TableHead className="w-[80px]">Status</TableHead>
                        <TableHead className="w-[100px]">Joined</TableHead>
                        <TableHead className="w-[100px] text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="w-[250px]">
                            <div className="space-y-1">
                              <div className="font-medium text-sm">
                                {member.name}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{member.email}</span>
                              </div>
                              {member.student_id && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <GraduationCap className="h-3 w-3" />
                                  {member.student_id}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            <Badge variant="secondary" className="text-xs">
                              {getMemberTypeLabel(member.member_type)}
                              {member.readonly && (
                                <span className="ml-1">*</span>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[120px]">
                            <span className="text-sm truncate">
                              {member.position || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="w-[130px]">
                            <span className="text-sm truncate">
                              {member.department || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="w-[150px]">
                            {member.expand?.teams &&
                            member.expand.teams.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {member.expand.teams.slice(0, 2).map((team) => (
                                  <Badge
                                    key={team.id}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {team.name}
                                  </Badge>
                                ))}
                                {member.expand.teams.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{member.expand.teams.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                None
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="w-[80px]">
                            <Badge
                              variant={
                                member.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(member.created)}
                            </span>
                          </TableCell>
                          <TableCell className="w-[100px] text-right">
                            {!member.readonly ? (
                              <div className="flex items-center justify-end gap-1">
                                <Link
                                  href={`/exec-dashboard/club-members/${member.id}`}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setMemberToDelete(member);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Official
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-3 p-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {member.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          {member.student_id && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <GraduationCap className="h-3 w-3 shrink-0" />
                              <span>{member.student_id}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          {!member.readonly ? (
                            <>
                              <Link
                                href={`/exec-dashboard/club-members/${member.id}`}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setMemberToDelete(member);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground px-2">
                              Official
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <div className="mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {getMemberTypeLabel(member.member_type)}
                              {member.readonly && (
                                <span className="ml-1">*</span>
                              )}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="mt-1">
                            <Badge
                              variant={
                                member.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {member.status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Position:
                          </span>
                          <div className="mt-1 truncate">
                            {member.position || "—"}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Department:
                          </span>
                          <div className="mt-1 truncate">
                            {member.department || "—"}
                          </div>
                        </div>
                      </div>

                      {member.expand?.teams &&
                        member.expand.teams.length > 0 && (
                          <div>
                            <span className="text-muted-foreground text-xs">
                              Teams:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.expand.teams.slice(0, 3).map((team) => (
                                <Badge
                                  key={team.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {team.name}
                                </Badge>
                              ))}
                              {member.expand.teams.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{member.expand.teams.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Joined: {formatDate(member.created)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t flex-col sm:flex-row gap-2">
                    <div className="text-sm text-muted-foreground order-2 sm:order-1">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2 order-1 sm:order-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{memberToDelete?.name}</strong>? This action cannot be
                undone and will remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMember}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
