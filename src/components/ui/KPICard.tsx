"use client";

import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";

type Trend = "up" | "down" | "flat";
type Accent = "primary" | "success" | "warning" | "danger" | "accent";

const ACCENT_CLASSES: Record<Accent, { icon: string; iconBg: string; border: string }> = {
  primary:  { icon: "text-indigo-500",  iconBg: "bg-indigo-50 border-indigo-100",   border: "border-indigo-100" },
  success:  { icon: "text-green-500",   iconBg: "bg-green-50 border-green-100",     border: "border-green-100"  },
  warning:  { icon: "text-amber-500",   iconBg: "bg-amber-50 border-amber-100",     border: "border-amber-100"  },
  danger:   { icon: "text-red-500",     iconBg: "bg-red-50 border-red-100",         border: "border-red-100"    },
  accent:   { icon: "text-cyan-500",    iconBg: "bg-cyan-50 border-cyan-100",       border: "border-cyan-100"   },
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: Trend;
  trendValue?: string;
  icon: LucideIcon;
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
  const cls = ACCENT_CLASSES[accent];
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendCls = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-brand-text-secondary";

  if (loading) {
    return (
      <div className={`rounded-brand border bg-white p-5 shadow-sm ${cls.border}`}>
        <div className="mb-4 flex items-start justify-between">
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div className="mb-1 h-8 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-brand border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${cls.border}`}>
      <div className="mb-3 flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-text-secondary">{title}</p>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${cls.iconBg}`}>
          <Icon className={`h-4.5 w-4.5 ${cls.icon}`} size={18} />
        </div>
      </div>

      <p className="mb-1 text-3xl font-bold tracking-tight text-brand-text">{value}</p>

      <div className="flex flex-wrap items-center gap-2">
        {trend && trendValue && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendCls}`}>
            <TrendIcon size={12} />
            {trendValue}
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-brand-text-secondary">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
