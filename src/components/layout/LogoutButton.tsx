"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useLogout } from "@/hooks/use-logout";

type LogoutButtonProps = {
  compact?: boolean;
  menu?: boolean;
  onBeforeLogout?: () => void;
};

export default function LogoutButton({ compact = false, menu = false, onBeforeLogout }: LogoutButtonProps) {
  const { logout, isLoggingOut } = useLogout();

  async function handleClick() {
    onBeforeLogout?.();
    await logout();
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoggingOut}
        title={isLoggingOut ? "Logging out" : "Logout"}
        className="rounded-brand bg-brand-danger/10 p-2 text-brand-danger hover:bg-brand-danger/20 disabled:opacity-60"
      >
        {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
      </button>
    );
  }

  if (menu) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoggingOut}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-danger hover:bg-brand-danger/10 disabled:opacity-60"
      >
        {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoggingOut}
      className="flex flex-1 items-center justify-center gap-2 rounded-brand border border-brand-danger/30 bg-brand-danger/10 px-3 py-2 text-xs font-medium text-brand-danger hover:bg-brand-danger/20 disabled:opacity-60"
    >
      {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      {isLoggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
