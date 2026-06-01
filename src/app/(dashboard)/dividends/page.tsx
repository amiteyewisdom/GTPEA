"use client";

import { Box, Typography, Paper, Button, Chip } from "@mui/material";
import { AddRounded, TrendingUpRounded } from "@mui/icons-material";

export default function DividendsPage() {
  const configs = [
    { year: 2026, rate: 7.5, basis: "average_savings", status: "draft", pool: 45000 },
    { year: 2025, rate: 6.0, basis: "average_savings", status: "distributed", pool: 38000 },
    { year: 2024, rate: 5.5, basis: "year_end_balance", status: "distributed", pool: 32000 },
  ];

  const STATUS_COLOR: Record<string, string> = {
    draft: "#475569",
    approved: "#3B82F6",
    distributed: "#22C55E",
  };

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
          { label: "Total Distributed (2025)", value: "₵38,000", icon: TrendingUpRounded, color: "#22C55E" },
          { label: "Members Credited", value: "87", icon: TrendingUpRounded, color: "#818CF8" },
          { label: "Avg. Dividend", value: "₵437", icon: TrendingUpRounded, color: "#06B6D4" },
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
            <Box key={c.year} sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
              minWidth: 520,
              px: 2.5, py: 1.25,
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>{c.year}</Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8" }}>{c.rate}%</Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8" }}>{c.basis.replace("_", " ")}</Typography>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>₵{c.pool.toLocaleString()}</Typography>
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
        </Box>
      </Paper>
    </Box>
  );
}
