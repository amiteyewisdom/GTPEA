"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Shown while a super admin is logged in as another account (see
// /api/admin/impersonate). Signing out returns them to the login page where
// they sign back in as themselves.
export default function ImpersonationBanner() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(sessionStorage.getItem("gtpea_impersonated_name"));
  }, []);

  if (!name) return null;

  const exit = async () => {
    sessionStorage.removeItem("gtpea_impersonated_name");
    sessionStorage.removeItem("gtpea_impersonated_email");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white flex items-center justify-between px-4 py-1.5 text-sm shadow-md">
      <div className="flex items-center gap-2 min-w-0">
        <UserCheck className="h-4 w-4 shrink-0" />
        <span className="truncate">
          Viewing as <strong>{name}</strong>
        </span>
      </div>
      <button
        onClick={exit}
        className="inline-flex items-center gap-1.5 rounded bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 shrink-0"
      >
        <LogOut className="h-3.5 w-3.5" />
        Exit — return to my account
      </button>
    </div>
  );
}
