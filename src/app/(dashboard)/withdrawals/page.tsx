"use client";

import { Box, Typography, Paper, Button, Chip, IconButton, Tooltip } from "@mui/material";
import { AddRounded, FilterListRounded } from "@mui/icons-material";

const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B",
  under_review: "#3B82F6",
  approved: "#22C55E",
  rejected: "#EF4444",
  disbursed: "#06B6D4",
  on_hold: "#F97316",
};

export default function WithdrawalsPage() {
  const rows = [
    { ref: "WD-2026-0001", member: "Kwame Asante", amount: 2500, status: "pending", date: "2026-05-20" },
    { ref: "WD-2026-0002", member: "Ama Mensah", amount: 5000, status: "approved", date: "2026-05-18" },
    { ref: "WD-2026-0003", member: "Yaw Boateng", amount: 1200, status: "disbursed", date: "2026-05-15" },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
        <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: "#E2E8F0" }}>
          Withdrawal Requests
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            startIcon={<FilterListRounded sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none", fontWeight: 600, color: "#94A3B8",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px",
              px: 2, py: 0.75,
              "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
            }}
          >
            Filter
          </Button>
          <Button
            startIcon={<AddRounded sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none", fontWeight: 600, color: "#0A0A0A",
              bgcolor: "#818CF8", borderRadius: "10px", px: 2, py: 0.75,
              "&:hover": { bgcolor: "#A5B4FC" },
            }}
          >
            New Request
          </Button>
        </Box>
      </Box>

      <Paper sx={{
        bgcolor: "#0F1420", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px", overflow: "hidden",
      }}>
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1.5fr 1fr 0.9fr 1fr",
            minWidth: 560,
            px: 2.5, py: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            {["Reference", "Member", "Amount", "Status", "Date"].map((h) => (
              <Typography key={h} sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#334155", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                {h}
              </Typography>
            ))}
          </Box>
          {rows.map((r) => (
            <Box key={r.ref} sx={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1.5fr 1fr 0.9fr 1fr",
              minWidth: 560,
              px: 2.5, py: 1.25,
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
              transition: "background 0.15s ease",
              cursor: "pointer",
            }}>
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>{r.ref}</Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8" }}>{r.member}</Typography>
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>₵{r.amount.toLocaleString()}</Typography>
              <Box>
                <Chip
                  label={r.status.replace("_", " ")}
                  size="small"
                  sx={{
                    fontSize: "0.6875rem", fontWeight: 700,
                    bgcolor: `${STATUS_COLOR[r.status]}15`,
                    color: STATUS_COLOR[r.status],
                    textTransform: "capitalize",
                    borderRadius: "6px", height: 22,
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: "0.8125rem", color: "#475569" }}>{r.date}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
