"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface ImpersonationState {
  isImpersonating: boolean;
  targetUserId: string | null;
  targetEmployeeId: string | null;
  adminUserId: string | null;
}

export function useImpersonation() {
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
    targetUserId: null,
    targetEmployeeId: null,
    adminUserId: null,
  });

  useEffect(() => {
    const checkImpersonation = async () => {
      const token = sessionStorage.getItem("impersonationToken");
      if (!token) {
        setState({
          isImpersonating: false,
          targetUserId: null,
          targetEmployeeId: null,
          adminUserId: null,
        });
        return;
      }

      try {
        const adminClient = createAdminClient();
        const { data: session } = await adminClient
          .from("impersonation_sessions")
          .select("*")
          .eq("session_token", token)
          .gt("expires_at", new Date().toISOString())
          .single();

        if (session) {
          setState({
            isImpersonating: true,
            targetUserId: session.target_user_id,
            targetEmployeeId: session.target_employee_id,
            adminUserId: session.admin_user_id,
          });
        } else {
          // Token expired, clear it
          sessionStorage.removeItem("impersonationToken");
          sessionStorage.removeItem("impersonating");
          sessionStorage.removeItem("impersonatedName");
          sessionStorage.removeItem("impersonatedEmail");
          setState({
            isImpersonating: false,
            targetUserId: null,
            targetEmployeeId: null,
            adminUserId: null,
          });
        }
      } catch (error) {
        console.error("Failed to check impersonation:", error);
        sessionStorage.removeItem("impersonationToken");
        sessionStorage.removeItem("impersonating");
        sessionStorage.removeItem("impersonatedName");
        sessionStorage.removeItem("impersonatedEmail");
      }
    };

    checkImpersonation();
  }, []);

  const stopImpersonating = () => {
    sessionStorage.removeItem("impersonationToken");
    sessionStorage.removeItem("impersonating");
    sessionStorage.removeItem("impersonatedName");
    sessionStorage.removeItem("impersonatedEmail");
    window.location.href = "/dashboard";
  };

  return { state, stopImpersonating };
}
