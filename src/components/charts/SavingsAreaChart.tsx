"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  month: string;
  savings: number;
  contributions: number;
}

interface SavingsAreaChartProps {
  data: DataPoint[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-brand-card-border bg-white px-3.5 py-2.5 shadow-md">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-text-secondary">
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: ₵{entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

function formatAxis(value: number) {
  if (value >= 1_000_000) return `₵${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₵${(value / 1_000).toFixed(0)}K`;
  return `₵${value}`;
}

export function SavingsAreaChart({ data }: SavingsAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2D7A4D" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#2D7A4D" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="contribGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#b59a6d" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#b59a6d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748B", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatAxis}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="savings"
          name="Total Savings"
          stroke="#2D7A4D"
          strokeWidth={2}
          fill="url(#savingsGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#2D7A4D", strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="contributions"
          name="Contributions"
          stroke="#b59a6d"
          strokeWidth={2}
          fill="url(#contribGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#b59a6d", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
