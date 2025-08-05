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
import { Switch } from "@/components/ui/switch";
import { PageLoading } from "@/components/ui/page-loading";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useExecActivityLogger";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import {
  UserCog,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Settings,
} from "lucide-react";

interface BOSMember {
  id: string;
  name: string;
  title: string;
  profile: string;
  photo: string;
  linkedin: string;
  github: string;
  category: string;
  priority: number;
  created: string;
  updated: string;
}

export default function BOSManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasExecPermissions, setHasExecPermissions] = useState(false);
  const [bosMembers, setBosMembers] = useState<BOSMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BOSMember | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    member: BOSMember | null;
  }>({ open: false, member: null });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "create" | "update" | null;
    member: BOSMember | null;
  }>({ open: false, action: null, member: null });
  const [submitting, setSubmitting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    profile: "",
    photo: "",
    linkedin: "",
    github: "",
    category: "bos",
    priority: 0,
  });

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/auth-check");
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
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

  const fetchBOSMembers = async () => {
    try {
      const response = await fetch("/api/dashboard/bos");
      if (response.ok) {
        const data = await response.json();
        setBosMembers(data.members || []);
      }
    } catch (error) {
      console.error("Failed to fetch BOS members:", error);
    }
  };

  const fetchAcceptingStatus = async () => {
    try {
      const response = await fetch("/api/web-metadata");
      if (response.ok) {
        const data = await response.json();
        setIsAccepting(data.accepting ?? true);
      }
    } catch (error) {
      console.error("Failed to fetch accepting status:", error);
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
      fetchBOSMembers();
      fetchAcceptingStatus();
    }
  }, [isAuthenticated]);

  const handleCreateMember = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      title: "",
      profile: "",
      photo: "",
      linkedin: "",
      github: "",
      category: "bos",
      priority: 0,
    });
    setDialogOpen(true);
  };

  const handleEditMember = (member: BOSMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      title: member.title,
      profile: member.profile,
      photo: member.photo,
      linkedin: member.linkedin,
      github: member.github,
      category: member.category,
      priority: member.priority,
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
        description: "You do not have permissions to update BOS members.",
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
        ? `/api/dashboard/bos/${editingMember.id}`
        : "/api/dashboard/bos";
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
          resource_type: "bos_member",
          resource_id: editingMember?.id || savedMember.member?.id,
          details: `${editingMember ? "Updated" : "Created"} BOS member: ${
            formData.name
          }`,
        });

        toast({
          title: editingMember ? "Member Updated" : "Member Added",
          description: `BOS member "${formData.name}" has been ${
            editingMember ? "updated" : "added"
          } successfully.`,
        });
        setDialogOpen(false);
        setConfirmDialog({ open: false, action: null, member: null });
        fetchBOSMembers();
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
        description: "You do not have permissions to delete BOS members.",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/dashboard/bos/${deleteDialog.member.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Log activity
        await logActivity({
          action: "delete",
          resource_type: "bos_member",
          resource_id: deleteDialog.member.id,
          details: `Deleted BOS member: ${deleteDialog.member.name}`,
        });

        toast({
          title: "Member Removed",
          description: `BOS member "${deleteDialog.member.name}" has been removed.`,
        });
        setDeleteDialog({ open: false, member: null });
        fetchBOSMembers();
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

  const handleToggleAccepting = async (newAcceptingStatus: boolean) => {
    try {
      const response = await fetch("/api/web-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accepting: newAcceptingStatus }),
      });

      if (response.ok) {
        setIsAccepting(newAcceptingStatus);
        toast({
          title: "Settings Updated",
          description: `BOS applications are now ${
            newAcceptingStatus ? "open" : "closed"
          }.`,
        });
      } else {
        throw new Error("Failed to update accepting status");
      }
    } catch (error) {
      console.error("Error updating accepting status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settings",
      });
    }
  };

  if (loading || isAuthenticated === null) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Board of Students Management
            </h1>
            <p className="text-muted-foreground">
              Manage BOS members and application settings
            </p>
          </div>
          <Button onClick={handleCreateMember}>
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* BOS Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              BOS Application Settings
            </CardTitle>
            <CardDescription>
              Control whether BOS applications are currently being accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-base font-medium">
                  Accept BOS Applications
                </div>
                <div className="text-sm text-muted-foreground">
                  Toggle to {isAccepting ? "stop" : "start"} accepting new BOS
                  applications
                </div>
              </div>
              <Switch
                checked={isAccepting}
                onCheckedChange={handleToggleAccepting}
              />
            </div>
            <div className="mt-4 p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                {isAccepting ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  Applications are currently {isAccepting ? "OPEN" : "CLOSED"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isAccepting
                  ? "Students can submit new BOS applications through the website."
                  : "New BOS applications are not being accepted at this time."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* BOS Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              BOS Members ({bosMembers.length})
            </CardTitle>
            <CardDescription>
              Manage Board of Students members and their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bosMembers.length === 0 ? (
              <div className="text-center py-8">
                <UserCog className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No BOS members found</p>
                <Button onClick={handleCreateMember} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add your first BOS member
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name & Title</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead>Photo</TableHead>
                    <TableHead>Social Links</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bosMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <RichTextRenderer
                            content={member.profile}
                            className="text-sm line-clamp-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.photo ? (
                          <Image
                            src={member.photo}
                            alt={member.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <UserCog className="w-4 h-4" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {member.linkedin && (
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              LinkedIn
                            </a>
                          )}
                          {member.github && (
                            <a
                              href={member.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-700 hover:text-gray-900"
                            >
                              GitHub
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.priority}</Badge>
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
      </main>

      {/* Create/Edit Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit BOS Member" : "Add New BOS Member"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Update member details"
                : "Fill in the member information"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                  placeholder="e.g., President, Vice President, Secretary"
                  required
                />
              </div>

              <div>
                <Label htmlFor="profile">Profile</Label>
                <Textarea
                  id="profile"
                  value={formData.profile}
                  onChange={(e) =>
                    setFormData({ ...formData, profile: e.target.value })
                  }
                  placeholder="Brief profile or bio (supports rich text)"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="photo">Photo URL</Label>
                <Input
                  id="photo"
                  type="url"
                  value={formData.photo}
                  onChange={(e) =>
                    setFormData({ ...formData, photo: e.target.value })
                  }
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
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
                  <Label htmlFor="github">GitHub URL</Label>
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
              </div>

              <div>
                <Label htmlFor="priority">Display Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  min="0"
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
                ? "Add BOS Member"
                : "Update BOS Member"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {confirmDialog.action === "create" ? "add" : "update"} this BOS
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
            <AlertDialogTitle>Remove BOS Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{deleteDialog.member?.name}
              &rdquo; from the Board of Students? This action cannot be undone.
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
    </DashboardLayout>
  );
}
