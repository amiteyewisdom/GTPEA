"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, MessageSquare, User, ChevronDown, Shield, Menu, CheckCheck, Landmark, HandCoins, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatRoleLabel } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "./LogoutButton";

type EnterpriseTopbarProps = {
  userName?: string;
  avatarUrl?: string | null;
  userRole?: string;
  onMenuClick?: () => void;
  sidebarWidth?: string;
};

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
};

const APPROVER_ROLES = ["union_rep", "fund_manager", "chairperson", "administrator", "super_admin"];

function notificationHref(n: NotificationRow, role: string): string | null {
  if (n.type === "approval_required") {
    if (/guarantor/i.test(n.title + " " + n.message)) return "/guarantor-requests";
    if (/disburse/i.test(n.title + " " + n.message)) return "/disbursements";
    return APPROVER_ROLES.includes(role) ? "/approvals" : "/dashboard";
  }
  if (n.entity_type === "loan") {
    return APPROVER_ROLES.includes(role) && n.type === "system" ? "/approvals" : "/my-loans";
  }
  if (n.entity_type === "withdrawal") {
    return APPROVER_ROLES.includes(role) ? "/approvals" : "/withdrawal-history";
  }
  if (n.entity_type === "statement") return "/statements";
  if (n.entity_type === "savings") return "/savings-history";
  return null;
}

function NotificationIcon({ type }: { type: string }) {
  if (type === "approval_required") return <HandCoins className="h-4 w-4 text-amber-500" />;
  if (type === "loan_disbursed" || type === "withdrawal_disbursed") return <Landmark className="h-4 w-4 text-brand-green" />;
  return <Info className="h-4 w-4 text-brand-text-secondary" />;
}

export default function EnterpriseTopbar({
  userName = "",
  avatarUrl,
  userRole = "",
  onMenuClick,
  sidebarWidth = "17.5rem",
}: EnterpriseTopbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const roleLabel = formatRoleLabel(userRole);
  const userInitial = userName.charAt(0).toUpperCase() || "U";

  const loadNotifications = async () => {
    const { data } = await (supabase as any)
      .from("notifications")
      .select("id, type, title, message, entity_type, entity_id, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(15);
    const rows = (data ?? []) as NotificationRow[];
    setNotifications(rows);
    setUnreadCount(rows.filter((n) => !n.is_read).length);
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unread.length === 0) return;
    await (supabase as any)
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in("id", unread);
    loadNotifications();
  };

  const openNotification = async (n: NotificationRow) => {
    if (!n.is_read) {
      await (supabase as any)
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", n.id);
    }
    const href = notificationHref(n, userRole);
    setShowNotifications(false);
    if (href) router.push(href);
    else loadNotifications();
  };

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
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications((open) => !open);
                if (!showNotifications) loadNotifications();
              }}
              className="relative rounded-lg border border-brand-card-border p-2.5 text-brand-text-secondary hover:bg-brand-hover"
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-brand-lg border border-brand-card-border bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-brand-card-border px-4 py-3">
                  <p className="text-sm font-semibold text-brand-text">Notifications</p>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="inline-flex items-center gap-1 text-xs text-brand-text-secondary hover:text-brand-green"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-brand-text-secondary">
                      No notifications — you&apos;re all caught up.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => openNotification(n)}
                        className={`flex w-full items-start gap-3 border-b border-brand-card-border/50 px-4 py-3 text-left hover:bg-brand-hover ${
                          n.is_read ? "opacity-60" : ""
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <NotificationIcon type={n.type} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm ${n.is_read ? "text-brand-text-secondary" : "font-medium text-brand-text"}`}>
                            {n.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-brand-text-secondary">{n.message}</p>
                          <p className="mt-1 text-[10px] text-brand-text-secondary">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-green" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green/10 font-bold text-brand-green">
                  {userInitial}
                </div>
              )}
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
