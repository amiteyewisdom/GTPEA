"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AppBar, Toolbar, IconButton, Typography, InputBase,
  Box, Tooltip, Avatar, Menu, MenuItem, ListItemIcon, Divider,
} from "@mui/material";
import {
  MenuRounded, SearchRounded, NotificationsRounded,
  PersonRounded, SettingsRounded, LogoutRounded,
  KeyboardArrowDownRounded,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { createClient } from "@/lib/supabase/client";
import { SIDEBAR_WIDTH } from "./Sidebar";

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

interface TopBarProps {
  title: string;
  breadcrumb?: string;
  onMobileMenuToggle?: () => void;
  pendingApprovals?: number;
  user?: { full_name?: string; role?: string; avatar_url?: string | null } | null;
}

export function TopBar({ title, breadcrumb, onMobileMenuToggle, pendingApprovals = 0, user }: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleSignOut = async () => {
    setAnchorEl(null);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: { md: SIDEBAR_WIDTH },
        width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        bgcolor: "#FFFFFF",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 2, sm: 3 }, gap: 2 }}>
        <IconButton
          edge="start"
          onClick={onMobileMenuToggle}
          size="small"
          sx={{ display: { md: "none" }, color: "#6B7280", mr: 0.5 }}
        >
          <MenuRounded />
        </IconButton>

        <Box>
          {breadcrumb && (
            <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: 500, lineHeight: 1, mb: 0.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {breadcrumb}
            </Typography>
          )}
          <Typography sx={{
            fontSize: { xs: "1rem", sm: "1.25rem" },
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1.2,
          }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: { xs: "none", md: "block" } }} />

        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 1,
            bgcolor: searchFocused ? "rgba(37, 99, 235, 0.08)" : "rgba(243, 244, 246, 0.9)",
            border: searchFocused ? "1px solid rgba(37, 99, 235, 0.2)" : "1px solid rgba(209, 213, 219, 0.9)",
            borderRadius: "12px",
            px: 1.5,
            py: 0.6,
            width: 240,
            transition: "all 0.2s ease",
          }}
        >
          <SearchRounded sx={{ fontSize: 16, color: "#6B7280" }} />
          <InputBase
            placeholder="Search transactions"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            sx={{
              fontSize: "0.875rem",
              color: "#475569",
              width: "100%",
              "& input::placeholder": { color: "#9CA3AF", opacity: 1 },
            }}
          />
        </Box>

        <Tooltip title={pendingApprovals > 0 ? `${pendingApprovals} pending approval${pendingApprovals > 1 ? "s" : ""}` : "No pending approvals"}>
          <IconButton
            size="small"
            sx={{
              ml: 1,
              width: 42,
              height: 42,
              borderRadius: "12px",
              bgcolor: "rgba(243, 244, 246, 0.95)",
              border: "1px solid rgba(209, 213, 219, 0.9)",
              color: "#475569",
              transition: "all 0.2s ease",
              "&:hover": { bgcolor: "rgba(37, 99, 235, 0.1)", color: "#1D4ED8" },
            }}
          >
            <NotificationsRounded sx={{ fontSize: 18 }} />
            {pendingApprovals > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#EF4444",
                  boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.18)",
                }}
              />
            )}
          </IconButton>
        </Tooltip>

        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            ml: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.25,
            py: 0.6,
            borderRadius: "12px",
            border: "1px solid rgba(209, 213, 219, 0.9)",
            bgcolor: "rgba(243, 244, 246, 0.9)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            '&:hover': { bgcolor: "rgba(243, 244, 246, 1)" },
          }}
        >
          <Avatar
            src={user?.avatar_url ?? undefined}
            sx={{
              width: 34,
              height: 34,
              bgcolor: "#2563EB",
              color: "#FFFFFF",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
          </Avatar>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>
              {user?.full_name?.split(" ")[0] ?? "User"}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>
              {ROLE_LABEL[user?.role ?? "employee"] ?? "Member"}
            </Typography>
          </Box>
          <KeyboardArrowDownRounded sx={{ fontSize: 18, color: "#6B7280" }} />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              minWidth: 220,
              mt: 1,
              bgcolor: "#FFFFFF",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              borderRadius: "14px",
              boxShadow: "0 12px 36px rgba(15, 23, 42, 0.12)",
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>
              {user?.full_name ?? "User"}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mt: 0.25 }}>
              {ROLE_LABEL[user?.role ?? "employee"] ?? "Member"}
            </Typography>
          </Box>
          <Divider sx={{ borderColor: "rgba(0, 0, 0, 0.08)", my: 0.5 }} />
          <MenuItem component={Link} href="/profile" onClick={() => setAnchorEl(null)}>
            <ListItemIcon sx={{ color: "#2563EB" }}>
              <PersonRounded fontSize="small" />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem", color: "#111827" }}>Profile</Typography>
          </MenuItem>
          <MenuItem component={Link} href="/settings" onClick={() => setAnchorEl(null)}>
            <ListItemIcon sx={{ color: "#2563EB" }}>
              <SettingsRounded fontSize="small" />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem", color: "#111827" }}>Settings</Typography>
          </MenuItem>
          <Divider sx={{ borderColor: "rgba(0, 0, 0, 0.08)", my: 0.5 }} />
          <MenuItem onClick={handleSignOut}>
            <ListItemIcon sx={{ color: "#DC2626" }}>
              <LogoutRounded fontSize="small" />
            </ListItemIcon>
            <Typography sx={{ fontSize: "0.9rem", color: "#DC2626" }}>Sign Out</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
