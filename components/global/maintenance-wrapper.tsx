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
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    checkMaintenanceAndAuth();
  }, []);

  const checkMaintenanceAndAuth = async () => {
    try {
      // Check maintenance status and staff authentication in parallel
      const [maintenanceResponse, authResponse] = await Promise.all([
        fetch("/api/web-metadata"),
        fetch("/api/auth-check"),
      ]);

      // Check maintenance status
      if (maintenanceResponse.ok) {
        const maintenanceData = await maintenanceResponse.json();
        setIsMaintenanceMode(maintenanceData.maintenance || false);
      }

      // Check staff authentication
      if (authResponse.ok) {
        const authData = await authResponse.json();
        setIsStaffAuthenticated(authData.authenticated || false);
      }
    } catch (error) {
      console.error("Error checking maintenance status and auth:", error);
      // Default to not in maintenance mode and not authenticated if there's an error
      setIsMaintenanceMode(false);
      setIsStaffAuthenticated(false);
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
  // Staff members can bypass maintenance mode if authenticated
  // Only show maintenance if maintenance is on AND it's not BOS onboarding AND not recruitment AND user is not staff
  const shouldShowMaintenance =
    isMaintenanceMode &&
    pathname !== "/maintenance" &&
    !isBOSOnboarding &&
    !isRecruitment &&
    !isStaffAuthenticated;

  // Show maintenance page if general maintenance is on (excluding BOS onboarding, recruitment, and staff)
  if (shouldShowMaintenance) {
    return <MaintenancePage />;
  }

  // Normal app rendering
  return <>{children}</>;
}
