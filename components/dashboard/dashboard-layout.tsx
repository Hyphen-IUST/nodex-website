"use client";

import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { PageLoading } from "@/components/ui/page-loading";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface Recruiter {
  id: string;
  assignee: string;
  team_mgmt?: boolean;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth-check");
        const data = await response.json();

        if (data.authenticated) {
          setRecruiter(data.recruiter);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar
        recruiterName={recruiter?.assignee}
        hasTeamMgmtPermissions={recruiter?.team_mgmt || false}
      />

      {/* Main Content */}
      <div className="flex-1 lg:pl-72">
        <main className="h-full overflow-y-auto pt-16 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}
