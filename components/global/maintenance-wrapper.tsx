"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import MaintenancePage from "@/app/maintenance/page";
import { PageLoading } from "@/components/ui/page-loading";

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

export function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    checkMaintenanceStatus();
  }, []);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch("/api/web-metadata");
      if (response.ok) {
        const data = await response.json();
        setIsMaintenanceMode(data.maintenance || false);
      }
    } catch (error) {
      console.error("Error checking maintenance status:", error);
      // Default to not in maintenance mode if there's an error
      setIsMaintenanceMode(false);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking maintenance status
  if (loading) {
    return (
      <PageLoading message="Loading..." showHeader={false} showFooter={false} />
    );
  }

  // Check if we should show maintenance page
  const isBOSOnboarding = pathname === "/bos/onboarding";
  const isRecruitment = pathname.startsWith("/recruitment");

  // For BOS onboarding and recruitment, exclude them from general maintenance mode
  // Only show maintenance if maintenance is on AND it's not BOS onboarding AND not recruitment
  const shouldShowMaintenance =
    isMaintenanceMode &&
    pathname !== "/maintenance" &&
    !isBOSOnboarding &&
    !isRecruitment;

  // Show maintenance page if general maintenance is on (excluding BOS onboarding and recruitment)
  if (shouldShowMaintenance) {
    return <MaintenancePage />;
  }

  // Normal app rendering
  return <>{children}</>;
}
