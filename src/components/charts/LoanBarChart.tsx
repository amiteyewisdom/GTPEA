"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  month: string;
  disbursed: number;
  repaid: number;
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

interface LoanBarChartProps {
  data: DataPoint[];
}

export function LoanBarChart({ data }: LoanBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(45, 122, 77, 0.06)" }} />
        <Bar dataKey="disbursed" name="Disbursed" fill="#2D7A4D" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="repaid" name="Repaid" fill="#b59a6d" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
