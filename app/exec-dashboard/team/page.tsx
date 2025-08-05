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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/page-loading";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useExecActivityLogger";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  Linkedin,
  Github,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  title: string;
  profile: string;
  category: "founding" | "core" | "direc";
  photo?: string;
  linkedin?: string;
  github?: string;
  email?: string;
  phone?: string;
  skills?: string;
  pos: number;
  created: string;
  updated: string;
}

interface Recruiter {
  id: string;
  assignee: string;
  exec?: boolean;
}

export default function TeamManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [hasExecPermissions, setHasExecPermissions] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    member: TeamMember | null;
  }>({ open: false, member: null });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "create" | "update" | null;
    member: TeamMember | null;
  }>({ open: false, action: null, member: null });
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    profile: "",
    category: "core" as "founding" | "core" | "direc",
    photo: "",
    linkedin: "",
    github: "",
    email: "",
    phone: "",
    skills: "",
    pos: 0,
  });

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/auth-check");
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        setRecruiter(data.recruiter);
        console.log(recruiter?.assignee);
        setHasExecPermissions(data.recruiter?.exec === true);
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

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/dashboard/team");
      if (response.ok) {
        const data = await response.json();
        // Filter out BOS members (category === "bos")
        const filteredMembers = (data.members || []).filter(
          (member: TeamMember) => member.category !== "direc"
        );
        setTeamMembers(filteredMembers);
      }
    } catch (error) {
      console.error("Failed to fetch team members:", error);
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
      fetchTeamMembers();
    }
  }, [isAuthenticated]);

  const handleCreateMember = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      title: "",
      profile: "",
      category: "core" as "founding" | "core" | "direc",
      photo: "",
      linkedin: "",
      github: "",
      email: "",
      phone: "",
      skills: "",
      pos: teamMembers.length + 1,
    });
    setDialogOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      title: member.title,
      profile: member.profile,
      category: member.category,
      photo: member.photo || "",
      linkedin: member.linkedin || "",
      github: member.github || "",
      email: member.email || "",
      phone: member.phone || "",
      skills: member.skills || "",
      pos: member.pos,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for exec permissions for destructive actions
    if (!hasExecPermissions && editingMember) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "You do not have permissions to update team members.",
      });
      return;
    }

    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      action: editingMember ? "update" : "create",
      member: editingMember,
    });
  };

  const confirmSubmit = async () => {
    setSubmitting(true);

    try {
      const url = editingMember
        ? `/api/dashboard/team/${editingMember.id}`
        : "/api/dashboard/team";
      const method = editingMember ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedMember = await response.json();

        // Log activity
        await logActivity({
          action: editingMember ? "update" : "create",
          resource_type: "team_member",
          resource_id: editingMember?.id || savedMember.member?.id,
          details: `${editingMember ? "Updated" : "Created"} team member: ${
            formData.name
          }`,
        });

        toast({
          title: editingMember ? "Member Updated" : "Member Added",
          description: `Team member "${formData.name}" has been ${
            editingMember ? "updated" : "added"
          } successfully.`,
        });
        setDialogOpen(false);
        setConfirmDialog({ open: false, action: null, member: null });
        fetchTeamMembers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save member");
      }
    } catch (error) {
      console.error("Error saving member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save member",
      });
    } finally {
      setSubmitting(false);
      setConfirmDialog({ open: false, action: null, member: null });
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteDialog.member) return;

    // Check for exec permissions
    if (!hasExecPermissions) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "You do not have permissions to delete team members.",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/dashboard/team/${deleteDialog.member.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Log activity
        await logActivity({
          action: "delete",
          resource_type: "team_member",
          resource_id: deleteDialog.member.id,
          details: `Deleted team member: ${deleteDialog.member.name}`,
        });

        toast({
          title: "Member Removed",
          description: `Team member "${deleteDialog.member.name}" has been removed.`,
        });
        setDeleteDialog({ open: false, member: null });
        fetchTeamMembers();
      } else {
        throw new Error("Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove member",
      });
    }
  };

  const getPositionBadgeColor = (position: string) => {
    const lowerPos = position.toLowerCase();
    if (lowerPos.includes("president"))
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (lowerPos.includes("lead"))
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (lowerPos.includes("secretary") || lowerPos.includes("treasurer"))
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  if (loading || isAuthenticated === null) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Club Team Management
            </h1>
            <p className="text-muted-foreground">
              Manage NodeX club team members (excluding Board of Students)
            </p>
          </div>
          <Button onClick={handleCreateMember}>
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members ({teamMembers.length})
            </CardTitle>
            <CardDescription>
              Manage team member profiles and information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No team members found</p>
                <Button onClick={handleCreateMember} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add your first team member
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name & Bio</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Social Links</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers
                    .sort((a, b) => a.pos - b.pos)
                    .map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            {member.photo && (
                              <Image
                                src={member.photo}
                                alt={member.name}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            )}
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                <RichTextRenderer
                                  content={
                                    member.profile.length > 120
                                      ? member.profile.substring(0, 120) + "..."
                                      : member.profile
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPositionBadgeColor(member.title)}
                          >
                            {member.title}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {member.linkedin && (
                              <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                title="LinkedIn Profile"
                              >
                                <Linkedin className="w-4 h-4" />
                              </a>
                            )}
                            {member.github && (
                              <a
                                href={member.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-800"
                                title="GitHub Profile"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                            {!member.linkedin && !member.github && (
                              <span className="text-muted-foreground text-sm">
                                No links
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">#{member.pos}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(member.created).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMember(member)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({ open: true, member })
                              }
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Member Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit Team Member" : "Add New Team Member"}
              </DialogTitle>
              <DialogDescription>
                {editingMember
                  ? "Update member details"
                  : "Fill in the member information"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title">Title/Position</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter position/title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: "founding" | "core" | "direc") =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="founding">Founding</SelectItem>
                      <SelectItem value="core">Core</SelectItem>
                      <SelectItem value="direc">Board of Directors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="profile">Profile</Label>
                  <Textarea
                    id="profile"
                    value={formData.profile}
                    onChange={(e) =>
                      setFormData({ ...formData, profile: e.target.value })
                    }
                    placeholder="Brief profile about the member"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <Label htmlFor="skills">Skills (Optional)</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) =>
                      setFormData({ ...formData, skills: e.target.value })
                    }
                    placeholder="JavaScript, React, Node.js..."
                  />
                </div>

                <div>
                  <Label htmlFor="photo">Profile Image URL (Optional)</Label>
                  <Input
                    id="photo"
                    type="url"
                    value={formData.photo}
                    onChange={(e) =>
                      setFormData({ ...formData, photo: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn URL (Optional)</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <Label htmlFor="github">GitHub URL (Optional)</Label>
                  <Input
                    id="github"
                    type="url"
                    value={formData.github}
                    onChange={(e) =>
                      setFormData({ ...formData, github: e.target.value })
                    }
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <Label htmlFor="pos">Position Order</Label>
                  <Input
                    id="pos"
                    type="number"
                    min="1"
                    value={formData.pos}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pos: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="1"
                    required
                  />
                </div>
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
                      {editingMember ? "Updating..." : "Adding..."}
                    </>
                  ) : editingMember ? (
                    "Update Member"
                  ) : (
                    "Add Member"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Action Confirmation Dialog */}
        <AlertDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog({ open, action: null, member: null })
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog.action === "create"
                  ? "Add Team Member"
                  : "Update Team Member"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to{" "}
                {confirmDialog.action === "create" ? "add" : "update"} this team
                member?
                {confirmDialog.action === "update" &&
                  " This will modify the existing member data."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {confirmDialog.action === "create"
                      ? "Adding..."
                      : "Updating..."}
                  </>
                ) : confirmDialog.action === "create" ? (
                  "Add Member"
                ) : (
                  "Update Member"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, member: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove &ldquo;
                {deleteDialog.member?.name}
                &rdquo; from the team? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMember}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
