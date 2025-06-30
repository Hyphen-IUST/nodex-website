"use client";

import { useEffect, useCallback } from "react";
import { logActivityFromClient } from "@/lib/activity-logger";

interface UseActivityLoggerOptions {
  trackPageViews?: boolean;
  trackClicks?: boolean;
  trackFormSubmissions?: boolean;
}

export function useActivityLogger(options: UseActivityLoggerOptions = {}) {
  const {
    trackPageViews = true,
    trackClicks = false,
    trackFormSubmissions = false,
  } = options;

  // Generate browser fingerprint
  const generateFingerprint = useCallback(() => {
    if (typeof window === "undefined") return {};

    return {
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookie_enabled: navigator.cookieEnabled,
      do_not_track:
        navigator.doNotTrack === null ? undefined : navigator.doNotTrack,
      connection_type:
        (navigator as unknown as { connection?: { effectiveType?: string } })
          .connection?.effectiveType || "unknown",
    };
  }, []);

  // Log activity function
  const logActivity = useCallback(
    async (action: string, additionalData?: Record<string, unknown>) => {
      if (typeof window === "undefined") return;

      const fingerprint = generateFingerprint();

      await logActivityFromClient({
        action,
        page_url: window.location.href,
        fingerprint,
        additional_data: additionalData,
      });
    },
    [generateFingerprint]
  );

  // Track page views
  useEffect(() => {
    if (!trackPageViews) return;

    logActivity("page_view");
  }, [logActivity, trackPageViews]);

  // Track clicks
  useEffect(() => {
    if (!trackClicks) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className;
      const textContent = target.textContent?.substring(0, 100) || "";

      logActivity("click", {
        element_tag: tagName,
        element_class: className,
        element_text: textContent,
        x_coordinate: event.clientX,
        y_coordinate: event.clientY,
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [logActivity, trackClicks]);

  // Track form submissions
  useEffect(() => {
    if (!trackFormSubmissions) return;

    const handleFormSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.className || "unknown";

      logActivity("form_submit", {
        form_id: formId,
        form_action: form.action,
        form_method: form.method,
      });
    };

    document.addEventListener("submit", handleFormSubmit);
    return () => document.removeEventListener("submit", handleFormSubmit);
  }, [logActivity, trackFormSubmissions]);

  // Return the logActivity function for manual logging
  return { logActivity };
}
