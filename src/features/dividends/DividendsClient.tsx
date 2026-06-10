"use client";

import { Box, Typography, Paper, Button, Chip } from "@mui/material";
import { AddRounded, TrendingUpRounded } from "@mui/icons-material";
import { formatCurrency } from "@/utils/formatters";

interface DividendConfig {
  id: string;
  fiscal_year: number;
  rate_percent: number;
  basis: string;
  total_pool: number | null;
  status: string;
  created_at: string;
}

interface Dividend {
  id: string;
  dividend_config_id: string;
  employee_id: string;
  fiscal_year: number;
  average_balance: number;
  rate_percent: number;
  dividend_amount: number;
  credited_at: string | null;
  reference: string;
  employees?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface DividendsClientProps {
  configs: DividendConfig[];
  recentDividends: Dividend[];
}

const STATUS_COLOR: Record<string, string> = {
  draft: "#475569",
  approved: "#3B82F6",
  distributed: "#22C55E",
};

export function DividendsClient({ configs, recentDividends }: DividendsClientProps) {
  // Calculate summary stats from real data
  const latestConfig = configs.find((c) => c.status === "distributed") || configs[0];
  const totalDistributed = latestConfig?.total_pool || 0;
  const membersCredited = recentDividends.filter((d) => d.credited_at).length;
  const avgDividend = membersCredited > 0 
    ? recentDividends.reduce((sum, d) => sum + d.dividend_amount, 0) / membersCredited 
    : 0;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
        <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: "#E2E8F0" }}>
          Dividend Management
        </Typography>
        <Button
          startIcon={<AddRounded sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: "none", fontWeight: 600, color: "#0A0A0A",
            bgcolor: "#818CF8", borderRadius: "10px", px: 2, py: 0.75,
            "&:hover": { bgcolor: "#A5B4FC" },
          }}
        >
          New Dividend Year
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
        {[
          { label: `Total Distributed (${latestConfig?.fiscal_year || "N/A"})`, value: formatCurrency(totalDistributed), icon: TrendingUpRounded, color: "#22C55E" },
          { label: "Members Credited", value: membersCredited.toString(), icon: TrendingUpRounded, color: "#818CF8" },
          { label: "Avg. Dividend", value: formatCurrency(avgDividend), icon: TrendingUpRounded, color: "#06B6D4" },
        ].map((k) => (
          <Paper key={k.label} sx={{
            p: 2.5, borderRadius: "14px", bgcolor: "#0F1420",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <k.icon sx={{ fontSize: 18, color: k.color }} />
              <Typography sx={{ fontSize: "0.8125rem", color: "#475569", fontWeight: 500 }}>{k.label}</Typography>
            </Box>
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#E2E8F0" }}>{k.value}</Typography>
          </Paper>
        ))}
      </Box>

      <Paper sx={{
        bgcolor: "#0F1420", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px", overflow: "hidden",
      }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
            minWidth: 520,
            px: 2.5, py: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            {["Fiscal Year", "Rate %", "Basis", "Total Pool", "Status"].map((h) => (
              <Typography key={h} sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#334155", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                {h}
              </Typography>
            ))}
          </Box>
          {configs.map((c) => (
            <Box key={c.id} sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
              minWidth: 520,
              px: 2.5, py: 1.25,
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>{c.fiscal_year}</Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8" }}>{c.rate_percent}%</Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8" }}>{c.basis.replace("_", " ")}</Typography>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>{formatCurrency(c.total_pool || 0)}</Typography>
            <Box>
              <Chip
                label={c.status}
                size="small"
                sx={{
                  fontSize: "0.6875rem", fontWeight: 700,
                  bgcolor: `${STATUS_COLOR[c.status]}15`,
                  color: STATUS_COLOR[c.status],
                  borderRadius: "6px", height: 22,
                }}
              />
            </Box>
          </Box>
        ))}
        {configs.length === 0 && (
          <Box sx={{ px: 2.5, py: 8, textAlign: "center" }}>
            <Typography sx={{ color: "#64748B" }}>No dividend configurations found</Typography>
          </Box>
        )}
        </Box>
      </Paper>
    </Box>
  );
}
