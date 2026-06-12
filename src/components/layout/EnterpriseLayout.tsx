"use client";

import EnterpriseSidebar from "./EnterpriseSidebar";
import EnterpriseTopbar from "./EnterpriseTopbar";
import MobileBottomNav from "./MobileBottomNav";
import { UserRole } from "@/lib/role-menus";
import { useSidebarState } from "@/hooks/use-sidebar-state";

type EnterpriseLayoutProps = {
  children: React.ReactNode;
  currentRole: UserRole;
  userName?: string;
  pendingCount?: number;
};

export default function EnterpriseLayout({
  children,
  currentRole,
  userName = "User",
  pendingCount = 0,
}: EnterpriseLayoutProps) {
  const { isOpen, isCollapsed, open, close, toggleCollapse } = useSidebarState();
  const sidebarWidth = isCollapsed ? "5rem" : "17.5rem";

  return (
    <div className="min-h-dvh bg-brand-background">
      <EnterpriseSidebar
        currentRole={currentRole}
        userName={userName}
        isOpen={isOpen}
        onClose={close}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        pendingCount={pendingCount}
      />

      <div
        className="flex h-dvh min-w-0 flex-col transition-[margin] duration-300 md:ml-[var(--sidebar-width)]"
        style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
      >
        <EnterpriseTopbar
          userName={userName}
          userRole={currentRole}
          onMenuClick={open}
          sidebarWidth={sidebarWidth}
        />

        <main className="flex-1 overflow-y-auto pb-20 pt-16 md:pb-0">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>

        <MobileBottomNav currentRole={currentRole} onOpenMenu={open} pendingCount={pendingCount} />
      </div>
    </div>
  );
}
