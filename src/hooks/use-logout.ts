"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function useLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setIsLoggingOut(false);
        window.alert("Could not log out. Please try again.");
        return;
      }

      await fetch("/auth/logout", { method: "POST" });

      router.replace("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
      window.alert("Could not log out. Please try again.");
    }
  }

  return { logout, isLoggingOut };
}
