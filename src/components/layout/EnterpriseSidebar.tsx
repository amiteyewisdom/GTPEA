"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, User, X } from "lucide-react";
import { getMenuItemsForRole, UserRole } from "@/lib/role-menus";
import { formatRoleLabel, isNavItemActive } from "@/lib/navigation";
import LogoutButton from "./LogoutButton";

const BADGE_PATHS = ['/approvals', '/loan-reviews', '/final-approvals'];

type EnterpriseSidebarProps = {
  currentRole: UserRole;
  userName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  pendingCount?: number;
};

export default function EnterpriseSidebar({
  currentRole,
  userName = "User",
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  pendingCount = 0,
}: EnterpriseSidebarProps) {
  const pathname = usePathname();
  const menuItems = getMenuItemsForRole(currentRole);
  const menuPaths = menuItems.map((item) => item.path);
  const sidebarWidth = isCollapsed ? "5rem" : "17.5rem";
  const userInitial = userName.charAt(0).toUpperCase() || "U";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={`fixed left-0 top-0 z-50 flex h-dvh flex-col border-r border-brand-card-border bg-white transition-[transform,width] duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ width: sidebarWidth }}
      >
        <div className="flex h-16 items-center justify-between border-b border-brand-card-border px-4">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3" onClick={onClose}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-accent text-lg font-bold text-brand-accent">
              G
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-brand-text">
                  GTPEA <span className="text-brand-accent">Finance</span>
                </p>
                <p className="truncate text-xs text-brand-text-secondary">
                  {formatRoleLabel(currentRole)}
                </p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-brand-text-secondary hover:bg-brand-hover md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(pathname, item.path, menuPaths);

              return (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex items-center gap-3 rounded-brand px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-brand-green/10 text-brand-green"
                        : "text-brand-text-secondary hover:bg-brand-hover hover:text-brand-text"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-brand-green" />
                    )}
                    <span className="relative">
                      <Icon className="h-5 w-5 shrink-0" />
                      {isCollapsed && pendingCount > 0 && BADGE_PATHS.includes(item.path) && (
                        <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white" />
                      )}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {!isCollapsed && pendingCount > 0 && BADGE_PATHS.includes(item.path) && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    )}
                    {!isCollapsed && isActive && !BADGE_PATHS.includes(item.path) && (
                      <ChevronRight className="ml-auto h-4 w-4 text-brand-green" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-brand-card-border p-4">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/10 text-sm font-bold text-brand-green">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-text">{userName}</p>
                  <p className="truncate text-xs text-brand-text-secondary">
                    {formatRoleLabel(currentRole)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex flex-1 items-center justify-center gap-2 rounded-brand border border-brand-card-border bg-brand-hover px-3 py-2 text-xs font-medium text-brand-text-secondary hover:text-brand-text"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <LogoutButton onBeforeLogout={onClose} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/10 text-sm font-bold text-brand-green">
                {userInitial}
              </div>
              <Link
                href="/profile"
                onClick={onClose}
                title="Profile"
                className="rounded-brand p-2 text-brand-text-secondary hover:bg-brand-hover"
              >
                <User className="h-5 w-5" />
              </Link>
              <LogoutButton compact onBeforeLogout={onClose} />
            </div>
          )}
        </div>
      </aside>

      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="fixed bottom-6 z-50 hidden h-8 w-8 items-center justify-center rounded-r-lg bg-brand-green text-white shadow-lg hover:bg-brand-green-dark md:flex"
          style={{ left: sidebarWidth }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}
    </>
  );
}
