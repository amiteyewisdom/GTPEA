"use client";

import { Box, Typography, Skeleton } from "@mui/material";
import { TrendingUp, TrendingDown, TrendingFlat } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import type { SvgIconComponent } from "@mui/icons-material";

type Trend = "up" | "down" | "flat";
type Accent = "primary" | "success" | "warning" | "danger" | "accent";

const ACCENT_MAP: Record<Accent, { color: string; bg: string; border: string; glow: string }> = {
  primary: {
    color: "#818CF8",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
    glow: "rgba(99,102,241,0.15)",
  },
  success: {
    color: "#34D399",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    glow: "rgba(16,185,129,0.15)",
  },
  warning: {
    color: "#FCD34D",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    glow: "rgba(245,158,11,0.15)",
  },
  danger: {
    color: "#F87171",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    glow: "rgba(239,68,68,0.15)",
  },
  accent: {
    color: "#22D3EE",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.2)",
    glow: "rgba(6,182,212,0.15)",
  },
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: Trend;
  trendValue?: string;
  icon: SvgIconComponent;
  accent?: Accent;
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  accent = "primary",
  loading = false,
}: KPICardProps) {
  const colors = ACCENT_MAP[accent];

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : TrendingFlat;

  const trendColor =
    trend === "up" ? "#34D399" : trend === "down" ? "#F87171" : "#94A3B8";

  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        border: `1px solid ${colors.border}`,
        borderRadius: 2,
        p: 2.5,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          boxShadow: `0 0 0 1px ${colors.border}, 0 8px 32px ${colors.glow}`,
        },
      }}
    >
      {/* Subtle glow */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: colors.glow,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2, position: "relative" }}>
        {loading ? (
          <Skeleton variant="text" width={120} height={16} />
        ) : (
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#6B7280",
            }}
          >
            {title}
          </Typography>
        )}

        {/* Icon */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: colors.bg,
            border: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 18, color: colors.color }} />
        </Box>
      </Box>

      {/* Value */}
      {loading ? (
        <Skeleton variant="text" width={140} height={36} sx={{ mb: 0.5 }} />
      ) : (
        <Typography
          sx={{
            fontSize: "1.875rem",
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1,
            mb: 0.5,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </Typography>
      )}

      {/* Trend + subtitle */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        {trend && trendValue && !loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <TrendIcon sx={{ fontSize: 14, color: trendColor }} />
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: trendColor }}>
              {trendValue}
            </Typography>
          </Box>
        )}
        {subtitle && !loading && (
          <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>
            {subtitle}
          </Typography>
        )}
        {loading && <Skeleton variant="text" width={100} height={14} />}
      </Box>
    </Box>
  );
}
