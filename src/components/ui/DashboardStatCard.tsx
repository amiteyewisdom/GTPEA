import GlassCard from "./GlassCard";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

type DashboardStatCardProps = {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  color?: string;
  large?: boolean;
};

export default function DashboardStatCard({
  title,
  value,
  change,
  trend = "up",
  icon: Icon,
  color = "text-brand-accent",
  large = false,
}: DashboardStatCardProps) {
  return (
    <GlassCard className="min-w-0 overflow-hidden p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className={`shrink-0 rounded-lg bg-brand-card-bg p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {change && (
          <div
            className={`flex shrink-0 items-center gap-1 text-xs font-medium ${
              trend === "up" ? "text-brand-success" : "text-brand-danger"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span className="whitespace-nowrap">{change}</span>
          </div>
        )}
      </div>

      <p className="mb-1 truncate text-sm text-brand-text-secondary">{title}</p>

      <div className="overflow-x-auto">
        <p
          className={`whitespace-nowrap font-bold tabular-nums text-brand-text ${
            large ? "text-xl sm:text-2xl" : "text-base sm:text-lg lg:text-xl"
          }`}
        >
          {value}
        </p>
      </div>
    </GlassCard>
  );
}
