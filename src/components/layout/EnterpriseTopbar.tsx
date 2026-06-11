"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Bell, MessageSquare, User, ChevronDown, Shield, Menu } from "lucide-react";
import { formatRoleLabel } from "@/lib/navigation";
import LogoutButton from "./LogoutButton";

type EnterpriseTopbarProps = {
  userName?: string;
  userRole?: string;
  onMenuClick?: () => void;
  sidebarWidth?: string;
};

export default function EnterpriseTopbar({
  userName = "",
  userRole = "",
  onMenuClick,
  sidebarWidth = "17.5rem",
}: EnterpriseTopbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const roleLabel = formatRoleLabel(userRole);
  const userInitial = userName.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="fixed left-0 top-0 right-0 z-30 h-16 border-b border-brand-card-border bg-white/90 backdrop-blur md:left-[var(--sidebar-width)]"
      style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
    >
      <div ref={containerRef} className="flex h-full items-center gap-4 px-4 md:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-brand-card-border p-2 text-brand-text hover:bg-brand-hover md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative min-w-0 flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-text-secondary" />
          <input
            type="search"
            placeholder="Search employees, loans, savings..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-brand border border-brand-card-border py-2.5 pl-12 pr-4 text-sm text-brand-text placeholder-brand-text-secondary focus:border-brand-green/50 focus:outline-none focus:ring-1 focus:ring-brand-green/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-brand-card-border p-2.5 text-brand-text-secondary hover:bg-brand-hover"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="hidden rounded-lg border border-brand-card-border p-2.5 text-brand-text-secondary hover:bg-brand-hover sm:block"
            aria-label="Messages"
          >
            <MessageSquare className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu((open) => !open)}
              className="flex items-center gap-3 rounded-lg border border-brand-card-border px-2 py-1.5 hover:bg-brand-hover md:px-3 md:py-2"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green/10 font-bold text-brand-green">
                {userInitial}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-brand-text">{userName}</p>
                <p className="text-xs text-brand-text-secondary">{roleLabel}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-brand-text-secondary md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-brand-lg border border-brand-card-border bg-white shadow-xl">
                <div className="border-b border-brand-card-border p-4">
                  <p className="text-sm font-medium text-brand-text">{userName}</p>
                  <p className="text-xs text-brand-text-secondary">{roleLabel}</p>
                </div>

                <div className="space-y-1 p-2">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-text-secondary hover:bg-brand-hover hover:text-brand-text"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-text-secondary hover:bg-brand-hover hover:text-brand-text"
                  >
                    <Shield className="h-4 w-4" />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-brand-card-border p-2">
                  <LogoutButton menu onBeforeLogout={() => setShowUserMenu(false)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
