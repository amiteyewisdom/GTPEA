"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, Tooltip, CircularProgress,
} from "@mui/material";
import {
  DashboardRounded, PeopleRounded, SavingsRounded,
  AccountBalanceRounded, Inventory2Rounded, CheckCircleRounded,
  AssessmentRounded, PersonRounded, SettingsRounded, LogoutRounded,
  MoneyOffRounded, VolunteerActivismRounded, AccountTreeRounded,
  RequestPageRounded, ReceiptLongRounded,
} from "@mui/icons-material";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { alpha } from "@mui/material/styles";

export const SIDEBAR_WIDTH = 240;

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  administrator: "Administrator",
  admin: "Administrator",
  fund_manager: "Fund Manager",
  union_rep: "Union Rep",
  chairperson: "Chairperson",
  chairman: "Chairperson",
  employee: "Member",
};

const ROLE_COLOR: Record<string, string> = {
  super_admin: "#2563EB",
  administrator: "#2563EB",
  admin: "#2563EB",
  fund_manager: "#3B82F6",
  union_rep: "#06B6D4",
  chairperson: "#D4AF37",
  chairman: "#D4AF37",
  employee: "#6B7280",
};

type NavGroup = {
  label: string;
  items: { label: string; href: string; icon: React.ElementType; badge?: number }[];
};

interface SidebarProps {
  user?: { full_name?: string; email?: string; role?: string; avatar_url?: string | null } | null;
  pendingApprovals?: number;
  onNavigate?: () => void;
}

export function Sidebar({ user, pendingApprovals = 0, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const navGroups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: DashboardRounded },
      ],
    },
    {
      label: "Members",
      items: [
        { label: "Employees", href: "/employees", icon: PeopleRounded },
        { label: "Savings", href: "/savings", icon: SavingsRounded },
        { label: "Withdrawals", href: "/withdrawals", icon: MoneyOffRounded },
      ],
    },
    {
      label: "Credit",
      items: [
        { label: "Loans", href: "/loans", icon: AccountBalanceRounded },
        { label: "Loan Products", href: "/loan-products", icon: Inventory2Rounded },
        { label: "Approvals", href: "/approvals", icon: CheckCircleRounded, badge: pendingApprovals },
      ],
    },
    {
      label: "Finance",
      items: [
        { label: "Dividends", href: "/dividends", icon: VolunteerActivismRounded },
        { label: "Ledger", href: "/ledger", icon: AccountTreeRounded },
        { label: "Statements", href: "/statements", icon: RequestPageRounded },
      ],
    },
    {
      label: "Reports",
      items: [
        { label: "Reports", href: "/reports", icon: AssessmentRounded },
      ],
    },
  ];

  const bottomItems = [
    { label: "Profile", href: "/profile", icon: PersonRounded },
    { label: "Settings", href: "/settings", icon: SettingsRounded },
  ];

  const roleKey = user?.role ?? "employee";
  const roleColor = ROLE_COLOR[roleKey] ?? "#94A3B8";

  const NavItem = ({ label, href, icon: Icon, badge }: { label: string; href: string; icon: React.ElementType; badge?: number }) => {
    const active = isActive(href);
    return (
      <Link href={href} prefetch onClick={onNavigate} style={{ textDecoration: "none" }}>
        <ListItemButton
          selected={active}
          sx={{
            borderRadius: "8px",
            py: 1, px: 1.5, minHeight: 40,
            bgcolor: active ? "rgba(37, 99, 235, 0.08)" : "transparent",
            border: active ? "1px solid rgba(37, 99, 235, 0.2)" : "1px solid transparent",
            "&:hover": { 
              bgcolor: active ? "rgba(37, 99, 235, 0.12)" : "rgba(0, 0, 0, 0.03)",
              borderColor: active ? "rgba(37, 99, 235, 0.25)" : "rgba(0, 0, 0, 0.04)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Icon sx={{ 
              fontSize: 18, 
              color: active ? "#2563EB" : "#9CA3AF", 
              transition: "color 0.2s ease" 
            }} />
          </ListItemIcon>
          <ListItemText
            primary={label}
            primaryTypographyProps={{
              fontSize: "0.8125rem", 
              fontWeight: active ? 600 : 500,
              color: active ? "#1F2937" : "#6B7280", 
              lineHeight: 1.5,
            }}
          />
          {(badge ?? 0) > 0 && (
            <Box sx={{
              minWidth: 20, height: 20, borderRadius: "4px", px: 0.5,
              bgcolor: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Typography sx={{ fontSize: "0.625rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>
                {badge}
              </Typography>
            </Box>
          )}
        </ListItemButton>
      </Link>
    );
  };

  return (
    <Box
      component="aside"
      sx={{
        width: SIDEBAR_WIDTH, flexShrink: 0,
        height: "100vh", position: "fixed", top: 0, left: 0,
        bgcolor: "#FAFAF8",
        borderRight: "1px solid rgba(0, 0, 0, 0.06)",
        display: "flex", flexDirection: "column", zIndex: 1200,
        overflowY: "auto", overflowX: "hidden",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": { background: "rgba(37, 99, 235, 0.2)", borderRadius: 2 },
        "&::-webkit-scrollbar-thumb:hover": { background: "rgba(37, 99, 235, 0.4)" },
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: "8px",
            background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
          }}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF" }}>₵</Typography>
          </Box>
          <Box>
            <Typography sx={{
              fontSize: "0.8125rem", fontWeight: 700, color: "#111827",
              lineHeight: 1.2, letterSpacing: "-0.01em",
            }}>
              GTPEA
            </Typography>
            <Typography sx={{ fontSize: "0.625rem", color: "#9CA3AF", fontWeight: 500 }}>
              Finance
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mx: 2, height: "1px", bgcolor: "rgba(0, 0, 0, 0.06)", my: 1.5 }} />

      {/* Navigation groups */}
      <Box sx={{ px: 2, flex: 1, py: 1 }}>
        {navGroups.map((group) => (
          <Box key={group.label} sx={{ mb: 2.5 }}>
            <Typography sx={{
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "#9CA3AF",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              px: 1.5,
              mb: 1,
            }}>
              {group.label}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {group.items.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ mx: 2, height: "1px", bgcolor: "rgba(0, 0, 0, 0.06)", mb: 1.5 }} />

      {/* User section */}
      <Box sx={{ p: 2 }}>
        <Box sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          borderRadius: "10px",
          p: 1.5,
          mb: 1.5,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: roleColor,
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              {(user?.full_name ?? "U").charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#111827",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {user?.full_name ?? "User"}
              </Typography>
              <Typography sx={{
                fontSize: "0.6875rem",
                color: "#9CA3AF",
                fontWeight: 500,
              }}>
                {ROLE_LABEL[roleKey] ?? "Member"}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {bottomItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </Box>
        </Box>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(220, 38, 38, 0.2)",
            backgroundColor: "rgba(220, 38, 38, 0.05)",
            color: "#DC2626",
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.05)";
          }}
        >
          <LogoutRounded sx={{ fontSize: 16 }} />
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </Box>
    </Box>
  );
}
