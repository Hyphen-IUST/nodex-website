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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/page-loading";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useExecActivityLogger";
import {
  Globe,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

interface WebMetadata {
  maintenance: boolean;
  accepting: boolean;
  updated: string | null;
}

interface Recruiter {
  id: string;
  assignee: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<WebMetadata>({
    maintenance: false,
    accepting: true,
    updated: null,
  });
  const [updating, setUpdating] = useState<string | null>(null);

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

  const fetchWebMetadata = async () => {
    try {
      const response = await fetch("/api/web-metadata");
      if (response.ok) {
        const data = await response.json();
        setMetadata({
          maintenance: data.maintenance ?? false,
          accepting: data.accepting ?? true,
          updated: data.updated,
        });
      }
    } catch (error) {
      console.error("Failed to fetch web metadata:", error);
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
      fetchWebMetadata();
    }
  }, [isAuthenticated]);

  const handleToggleSetting = async (
    setting: "maintenance" | "accepting",
    newValue: boolean
  ) => {
    setUpdating(setting);

    try {
      const response = await fetch("/api/web-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [setting]: newValue,
          [setting === "maintenance" ? "accepting" : "maintenance"]:
            setting === "maintenance"
              ? metadata.accepting
              : metadata.maintenance,
        }),
      });

      if (response.ok) {
        setMetadata((prev) => ({
          ...prev,
          [setting]: newValue,
          updated: new Date().toISOString(),
        }));

        const settingLabel =
          setting === "maintenance" ? "maintenance mode" : "BOS applications";

        // Log the activity
        await logActivity({
          action: `Update ${
            setting === "maintenance" ? "Maintenance Mode" : "BOS Applications"
          }`,
          resource_type: "site_settings",
          resource_id: "web_metadata",
          details: `${settingLabel} ${newValue ? "enabled" : "disabled"}`,
        });

        toast({
          title: "Settings Updated",
          description: `${settingLabel} ${
            newValue ? "enabled" : "disabled"
          } successfully.`,
        });
      } else {
        throw new Error(`Failed to update ${setting} setting`);
      }
    } catch (error) {
      console.error(`Error updating ${setting}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to update ${setting} setting`,
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading || isAuthenticated === null) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader recruiterName={recruiter?.assignee} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Site Settings
          </h1>
          <p className="text-muted-foreground">
            Configure site-wide settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Site Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Site Maintenance Mode
              </CardTitle>
              <CardDescription>
                When enabled, visitors will see a maintenance page instead of
                the normal website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Maintenance Mode</div>
                  <div className="text-sm text-muted-foreground">
                    Toggle to {metadata.maintenance ? "disable" : "enable"} site
                    maintenance mode
                  </div>
                </div>
                <Switch
                  checked={metadata.maintenance}
                  onCheckedChange={(checked) =>
                    handleToggleSetting("maintenance", checked)
                  }
                  disabled={updating === "maintenance"}
                />
              </div>

              <div className="mt-4 p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                  {metadata.maintenance ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <span className="font-medium text-orange-700 dark:text-orange-300">
                        MAINTENANCE MODE ACTIVE
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-green-700 dark:text-green-300">
                        SITE IS LIVE
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {metadata.maintenance
                    ? "Visitors will see a maintenance page. Only administrators can access the dashboard."
                    : "The website is fully accessible to all visitors."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* BOS Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Board of Students Applications
              </CardTitle>
              <CardDescription>
                Control whether new BOS applications are being accepted through
                the website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">
                    Accept BOS Applications
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Toggle to {metadata.accepting ? "stop" : "start"} accepting
                    new BOS applications
                  </div>
                </div>
                <Switch
                  checked={metadata.accepting}
                  onCheckedChange={(checked) =>
                    handleToggleSetting("accepting", checked)
                  }
                  disabled={updating === "accepting"}
                />
              </div>

              <div className="mt-4 p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                  {metadata.accepting ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-green-700 dark:text-green-300">
                        APPLICATIONS OPEN
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-red-700 dark:text-red-300">
                        APPLICATIONS CLOSED
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {metadata.accepting
                    ? "Students can submit new BOS applications through the website."
                    : "New BOS applications are not being accepted at this time."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Settings Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Settings Information
              </CardTitle>
              <CardDescription>
                Information about current settings and last updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">Site Status</span>
                  <Badge
                    variant={metadata.maintenance ? "destructive" : "default"}
                  >
                    {metadata.maintenance ? "Under Maintenance" : "Live"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">BOS Applications</span>
                  <Badge variant={metadata.accepting ? "default" : "secondary"}>
                    {metadata.accepting ? "Open" : "Closed"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Last Updated</span>
                  <span className="text-sm text-muted-foreground">
                    {metadata.updated
                      ? new Date(metadata.updated).toLocaleString()
                      : "Never"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning Notice */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-orange-700 dark:text-orange-300">
                    Important Notice
                  </h3>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Changes to these settings affect the entire website
                    immediately. Maintenance mode will prevent all visitors from
                    accessing the site, so use it carefully during updates or
                    maintenance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
