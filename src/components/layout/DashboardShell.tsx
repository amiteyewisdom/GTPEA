"use client";

import { useState } from "react";
import { Box, Drawer, useMediaQuery, useTheme } from "@mui/material";
import { Sidebar, SIDEBAR_WIDTH } from "./Sidebar";
import { TopBar } from "./TopBar";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, { title: string; breadcrumb?: string }> = {
  "/dashboard": { title: "Dashboard", breadcrumb: "Overview" },
  "/employees": { title: "Employees", breadcrumb: "Members" },
  "/savings": { title: "Savings", breadcrumb: "Members" },
  "/withdrawals": { title: "Withdrawals", breadcrumb: "Members" },
  "/loans": { title: "Loans", breadcrumb: "Credit" },
  "/loan-products": { title: "Loan Products", breadcrumb: "Credit" },
  "/approvals": { title: "Approvals", breadcrumb: "Credit" },
  "/dividends": { title: "Dividends", breadcrumb: "Finance" },
  "/ledger": { title: "Ledger", breadcrumb: "Finance" },
  "/statements": { title: "Statements", breadcrumb: "Finance" },
  "/reports": { title: "Reports & Analytics", breadcrumb: "Reports" },
  "/profile": { title: "My Profile", breadcrumb: "Account" },
  "/settings": { title: "Settings", breadcrumb: "Account" },
};

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    full_name: string;
    role: string;
    avatar_url: string | null;
    email: string;
  };
  pendingApprovals?: number;
}

export function DashboardShell({ children, user, pendingApprovals }: DashboardShellProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const matchedKey = Object.keys(PAGE_TITLES).find(
    (k) => k === pathname || (k !== "/dashboard" && pathname.startsWith(k))
  );
  const pageInfo = matchedKey ? PAGE_TITLES[matchedKey] : { title: "GTPEA Finance" };

  const handleSidebarNavigate = () => setMobileOpen(false);

  const sidebarContent = (
    <Sidebar user={user} pendingApprovals={pendingApprovals} onNavigate={handleSidebarNavigate} />
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#071620" }}>
      {/* Desktop Sidebar */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>{sidebarContent}</Box>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            bgcolor: "#FAFAF8",
            border: "1px solid rgba(0, 0, 0, 0.06)",
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: { md: `${SIDEBAR_WIDTH}px` },
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: { xs: "100%", md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        }}
      >
        <TopBar
          title={pageInfo.title}
          breadcrumb={pageInfo.breadcrumb}
          onMobileMenuToggle={() => setMobileOpen(true)}
          user={user}
          pendingApprovals={pendingApprovals}
        />

        {/* Page content offset for fixed AppBar */}
        <Box
          sx={{
            flex: 1,
            mt: { xs: "60px", sm: "64px" },
            p: { xs: 2, sm: 3 },
            maxWidth: "100%",
            background: "radial-gradient(circle at top left, rgba(56,189,248,0.08), transparent 30%), radial-gradient(circle at bottom right, rgba(59,130,246,0.08), transparent 28%)",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
