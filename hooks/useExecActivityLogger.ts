import { useCallback } from "react";

interface ActivityLogParams {
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
}

export const useActivityLogger = () => {
  const logActivity = useCallback(async (params: ActivityLogParams) => {
    try {
      await fetch("/api/dashboard/exec-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  }, []);

  return { logActivity };
};
