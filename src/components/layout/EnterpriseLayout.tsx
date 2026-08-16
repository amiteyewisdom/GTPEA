"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
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

class LayoutErrorBoundary extends Component<{ children: ReactNode; componentName: string }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode; componentName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.componentName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200">
          <h3 className="font-bold text-red-800">Error in {this.props.componentName}</h3>
          <p className="text-sm text-red-600">{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      <LayoutErrorBoundary componentName="EnterpriseSidebar">
        <EnterpriseSidebar
          currentRole={currentRole}
          userName={userName}
          isOpen={isOpen}
          onClose={close}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          pendingCount={pendingCount}
        />
      </LayoutErrorBoundary>

      <div
        className="flex h-dvh min-w-0 flex-col transition-[margin] duration-300 md:ml-[var(--sidebar-width)]"
        style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
      >
        <LayoutErrorBoundary componentName="EnterpriseTopbar">
          <EnterpriseTopbar
            userName={userName}
            userRole={currentRole}
            onMenuClick={open}
            sidebarWidth={sidebarWidth}
          />
        </LayoutErrorBoundary>

        <main className="flex-1 overflow-y-auto pb-20 pt-16 md:pb-0">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>

        <LayoutErrorBoundary componentName="MobileBottomNav">
          <MobileBottomNav currentRole={currentRole} onOpenMenu={open} pendingCount={pendingCount} />
        </LayoutErrorBoundary>
      </div>
    </div>
  );
}
