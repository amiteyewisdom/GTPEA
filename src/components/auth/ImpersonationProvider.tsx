"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ImpersonationData {
  user: {
    id: string;
    email: string;
    role: string;
    employee_id: string;
  };
  employee: any;
  expires_at: string;
}

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const [impersonationData, setImpersonationData] = useState<ImpersonationData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkImpersonation = async () => {
      const token = sessionStorage.getItem("impersonationToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/impersonate-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ impersonationToken: token }),
        });

        if (response.ok) {
          const data = await response.json();
          setImpersonationData(data);
        } else {
          // Token invalid, clear it
          sessionStorage.removeItem("impersonationToken");
          sessionStorage.removeItem("impersonating");
          sessionStorage.removeItem("impersonatedName");
        }
      } catch (error) {
        console.error("Failed to validate impersonation:", error);
        sessionStorage.removeItem("impersonationToken");
        sessionStorage.removeItem("impersonating");
        sessionStorage.removeItem("impersonatedName");
      } finally {
        setLoading(false);
      }
    };

    checkImpersonation();
  }, []);

  const stopImpersonating = () => {
    sessionStorage.removeItem("impersonationToken");
    sessionStorage.removeItem("impersonating");
    sessionStorage.removeItem("impersonatedName");
    router.push("/dashboard");
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (impersonationData) {
    return (
      <div className="relative">
        {/* Impersonation Banner */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Impersonating:</span>
            <span>{sessionStorage.getItem("impersonatedName")}</span>
          </div>
          <button
            onClick={stopImpersonating}
            className="px-3 py-1 bg-white text-amber-600 rounded text-sm font-semibold hover:bg-amber-50"
          >
            Stop Impersonating
          </button>
        </div>
        <div className="pt-10">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
