"use client";

import { Box, Typography, Paper, Button, Chip } from "@mui/material";
import { AddRounded, DownloadRounded } from "@mui/icons-material";

const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B",
  processing: "#3B82F6",
  ready: "#22C55E",
  downloaded: "#06B6D4",
};

export default function StatementsPage() {
  const rows = [
    { id: "ST-2026-001", member: "Kwame Asante", type: "full_account", from: "2026-01-01", to: "2026-03-31", status: "ready" },
    { id: "ST-2026-002", member: "Ama Mensah", type: "savings", from: "2026-01-01", to: "2026-03-31", status: "pending" },
    { id: "ST-2026-003", member: "Yaw Boateng", type: "loan", from: "2025-06-01", to: "2026-05-31", status: "downloaded" },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
        <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: "#E2E8F0" }}>
          Statement Requests
        </Typography>
        <Button
          startIcon={<AddRounded sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: "none", fontWeight: 600, color: "#0A0A0A",
            bgcolor: "#818CF8", borderRadius: "10px", px: 2, py: 0.75,
            "&:hover": { bgcolor: "#A5B4FC" },
          }}
        >
          Request Statement
        </Button>
      </Box>

      <Paper sx={{
        bgcolor: "#0F1420", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px", overflow: "hidden",
      }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 0.8fr",
            minWidth: 560,
            px: 2.5, py: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            {["ID", "Member", "Type", "From", "To", "Status"].map((h) => (
              <Typography key={h} sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#334155", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                {h}
              </Typography>
            ))}
          </Box>
          {rows.map((r) => (
            <Box key={r.id} sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 0.8fr",
              minWidth: 560,
              px: 2.5, py: 1.25,
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>{r.id}</Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8" }}>{r.member}</Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8", textTransform: "capitalize" }}>
              {r.type.replace("_", " ")}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#475569" }}>{r.from}</Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#475569" }}>{r.to}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={r.status}
                size="small"
                sx={{
                  fontSize: "0.6875rem", fontWeight: 700,
                  bgcolor: `${STATUS_COLOR[r.status]}15`,
                  color: STATUS_COLOR[r.status],
                  borderRadius: "6px", height: 22,
                }}
              />
              {r.status === "ready" && (
                <DownloadRounded sx={{ fontSize: 16, color: "#818CF8", cursor: "pointer" }} />
              )}
            </Box>
          </Box>
        ))}
        </Box>
      </Paper>
    </Box>
  );
}
