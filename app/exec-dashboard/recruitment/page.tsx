"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useExecActivityLogger";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import { PageLoading } from "@/components/ui/page-loading";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Hash,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  batch: string;
  rollNumber: string;
  registrationNumber: string;
  department: string;
  interestedTracks: string;
  whyJoin: string;
  experience?: string;
  projects?: string;
  otherRemarks?: string;
  modRemarks?: string;
  created: string;
  markedData?: {
    status: string;
    remarks: string;
    created: string;
  };
}

interface Recruiter {
  id: string;
  assignee: string;
}

export default function RecruitmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [pendingApps, setPendingApps] = useState<Application[]>([]);
  const [approvedApps, setApprovedApps] = useState<Application[]>([]);
  const [rejectedApps, setRejectedApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rollbackingId, setRollbackingId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [remarks, setRemarks] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(
    null
  );

  // Alert dialog state
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Rollback dialog state
  const [rollbackDialog, setRollbackDialog] = useState({
    open: false,
    app: null as Application | null,
    reason: "",
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
        router.push("/exec-dashboard/recruitment/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      router.push("/exec-dashboard/recruitment/login");
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
      fetchApplications();
    }
  }, [isAuthenticated]);

  const fetchApplications = async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        fetch("/api/applications?type=pending"),
        fetch("/api/applications?type=approved"),
        fetch("/api/applications?type=rejected"),
      ]);

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingApps(pendingData.applications);
      }

      if (approvedRes.ok) {
        const approvedData = await approvedRes.json();
        setApprovedApps(approvedData.applications);
      }

      if (rejectedRes.ok) {
        const rejectedData = await rejectedRes.json();
        setRejectedApps(rejectedData.applications);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    }
  };

  const handleMarkApplication = async (
    app: Application,
    status: "approved" | "rejected"
  ) => {
    setSelectedApp(app);
    setActionType(status);
    setDialogOpen(true);
  };

  const confirmMarkApplication = async () => {
    if (!selectedApp || !actionType) return;

    // Check if remarks are provided (mandatory)
    if (!remarks.trim()) {
      toast({
        variant: "destructive",
        title: "Remarks Required",
        description:
          "Remarks are required when approving or rejecting applications.",
      });
      return;
    }

    setProcessingId(selectedApp.id);
    try {
      const response = await fetch("/api/mark-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          status: actionType,
          remarks: remarks.trim(),
        }),
      });

      if (response.ok) {
        // Log the activity
        await logActivity({
          action: `Mark Application ${
            actionType === "approved" ? "Approved" : "Rejected"
          }`,
          resource_type: "application",
          resource_id: selectedApp.id,
          details: `Application from ${selectedApp.name} marked as ${actionType}`,
        });

        // Remove from pending and add to appropriate list
        setPendingApps((prev) =>
          prev.filter((app) => app.id !== selectedApp.id)
        );

        const updatedApp = {
          ...selectedApp,
          markedData: {
            status: actionType,
            remarks: remarks.trim(),
            created: new Date().toISOString(),
          },
        };

        if (actionType === "approved") {
          setApprovedApps((prev) => [updatedApp, ...prev]);
        } else {
          setRejectedApps((prev) => [updatedApp, ...prev]);
        }

        setDialogOpen(false);
        setRemarks("");
        setSelectedApp(null);
        setActionType(null);
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to process application",
        });
      }
    } catch (error) {
      console.error("Error marking application:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while processing the application",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRollback = async (app: Application) => {
    if (!app.markedData || !recruiter) return;

    setRollbackDialog({
      open: true,
      app: app,
      reason: "",
    });
  };

  const performRollback = async (app: Application, reason: string) => {
    setRollbackDialog({ open: false, app: null, reason: "" });

    setRollbackingId(app.id);
    try {
      const response = await fetch("/api/rollback-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: app.id,
          reason: reason.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Log the activity
        await logActivity({
          action: "Rollback Application",
          resource_type: "application",
          resource_id: app.id,
          details: `Application from ${app.name} rolled back to pending`,
        });

        // Remove from approved/rejected and add back to pending
        if (app.markedData?.status === "approved") {
          setApprovedApps((prev) => prev.filter((a) => a.id !== app.id));
        } else {
          setRejectedApps((prev) => prev.filter((a) => a.id !== app.id));
        }

        // Add back to pending with mod remarks
        const rolledBackApp = {
          ...app,
          modRemarks: data.modRemarks,
          markedData: undefined,
        };
        setPendingApps((prev) => [rolledBackApp, ...prev]);

        toast({
          variant: "success",
          title: "Success",
          description: "Application successfully rolled back to pending.",
        });
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to rollback application",
        });
      }
    } catch (error) {
      console.error("Error rolling back application:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while rolling back the application",
      });
    } finally {
      setRollbackingId(null);
    }
  };

  const ApplicationCard = ({
    app,
    showActions = true,
  }: {
    app: Application;
    showActions?: boolean;
  }) => (
    <Card className="border-border hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {app.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {app.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {app.phone}
              </span>
            </CardDescription>
          </div>
          {app.markedData && (
            <Badge
              variant={
                app.markedData.status === "approved" ? "default" : "destructive"
              }
              className="ml-2"
            >
              {app.markedData.status === "approved" ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              {app.markedData.status.charAt(0).toUpperCase() +
                app.markedData.status.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Batch: {app.batch}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Roll: {app.rollNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Reg: {app.registrationNumber}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{app.department}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {new Date(app.created).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-1">Interested Tracks:</h4>
            <p className="text-sm text-muted-foreground">
              {app.interestedTracks}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-1">Why Join NodeX:</h4>
            <RichTextRenderer
              content={app.whyJoin}
              className="text-sm text-muted-foreground"
            />
          </div>

          {app.experience && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Experience:</h4>
              <RichTextRenderer
                content={app.experience}
                className="text-sm text-muted-foreground"
              />
            </div>
          )}

          {app.projects && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Projects:</h4>
              <RichTextRenderer
                content={app.projects}
                className="text-sm text-muted-foreground"
              />
            </div>
          )}

          {app.otherRemarks && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Other Remarks:</h4>
              <RichTextRenderer
                content={app.otherRemarks}
                className="text-sm text-muted-foreground"
              />
            </div>
          )}

          {app.markedData?.remarks && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Recruiter Remarks:</h4>
              <RichTextRenderer
                content={app.markedData.remarks}
                className="text-sm text-muted-foreground"
              />
            </div>
          )}

          <div>
            <h4 className="font-semibold text-sm mb-1">
              Modification History:
            </h4>
            <RichTextRenderer
              content={app.modRemarks || "None"}
              className="text-sm text-muted-foreground"
            />
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              onClick={() => handleMarkApplication(app, "approved")}
              disabled={processingId === app.id}
              className="bg-green-600 hover:bg-green-700"
            >
              {processingId === app.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleMarkApplication(app, "rejected")}
              disabled={processingId === app.id}
            >
              {processingId === app.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <XCircle className="w-4 h-4 mr-1" />
              )}
              Reject
            </Button>
          </div>
        )}

        {!showActions && app.markedData && (
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRollback(app)}
              disabled={rollbackingId === app.id}
            >
              {rollbackingId === app.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                "↺"
              )}
              Rollback to Pending
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <PageLoading message="Loading recruitment dashboard..." />;
  }

  if (isAuthenticated === false) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader recruiterName={recruiter?.assignee} />

      <div className="pt-8 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Recruitment Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {recruiter?.assignee}! Manage NodeX membership
                applications.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Pending Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingApps.length}</div>
                <p className="text-sm text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Approved Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedApps.length}</div>
                <p className="text-sm text-muted-foreground">
                  Successfully approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Rejected Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rejectedApps.length}</div>
                <p className="text-sm text-muted-foreground">Not suitable</p>
              </CardContent>
            </Card>
          </div>

          {/* Applications Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending ({pendingApps.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Approved ({approvedApps.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Rejected ({rejectedApps.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-6">
              {pendingApps.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Pending Applications
                    </h3>
                    <p className="text-muted-foreground">
                      All applications have been reviewed.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {pendingApps.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      app={app}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-6">
              {approvedApps.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Approved Applications
                    </h3>
                    <p className="text-muted-foreground">
                      No applications have been approved yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {approvedApps.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      app={app}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-6">
              {rejectedApps.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <XCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Rejected Applications
                    </h3>
                    <p className="text-muted-foreground">
                      No applications have been rejected yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {rejectedApps.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      app={app}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approved" ? "Approve" : "Reject"} Application
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {actionType === "approved" ? "approve" : "reject"} the application
              from {selectedApp?.name}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Remarks (Required) *
              </label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={`Add remarks for this ${actionType} decision...`}
                className="mt-1"
                required
              />
              {!remarks.trim() && (
                <p className="text-xs text-destructive mt-1">
                  Remarks are required for all decisions
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmMarkApplication}
              variant={actionType === "approved" ? "default" : "destructive"}
              disabled={processingId === selectedApp?.id || !remarks.trim()}
            >
              {processingId === selectedApp?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : actionType === "approved" ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Confirm {actionType === "approved" ? "Approval" : "Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rollback Dialog with Reason */}
      <Dialog
        open={rollbackDialog.open}
        onOpenChange={(open) => setRollbackDialog({ ...rollbackDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rollback Application</DialogTitle>
            <DialogDescription>
              {rollbackDialog.app &&
                `Rolling back ${rollbackDialog.app.markedData?.status} decision for ${rollbackDialog.app.name}. This will move the application back to pending status.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rollback-reason">
                Reason for Rollback <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rollback-reason"
                placeholder="Please provide a reason for rolling back this application..."
                value={rollbackDialog.reason}
                onChange={(e) =>
                  setRollbackDialog({
                    ...rollbackDialog,
                    reason: e.target.value,
                  })
                }
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRollbackDialog({ open: false, app: null, reason: "" })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                rollbackDialog.app &&
                performRollback(rollbackDialog.app, rollbackDialog.reason)
              }
              disabled={!rollbackDialog.reason.trim()}
            >
              Confirm Rollback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation AlertDialog for other actions */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={alertDialog.onConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
