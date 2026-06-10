"use client";

import { Box, Typography, Paper, Button, Chip } from "@mui/material";
import { AddRounded, DownloadRounded } from "@mui/icons-material";
import { formatDate } from "@/utils/formatters";

const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B",
  processing: "#3B82F6",
  ready: "#22C55E",
  downloaded: "#06B6D4",
};

interface StatementRow {
  id: string;
  employee_id: string;
  type: string;
  date_from: string;
  date_to: string;
  status: string;
  requested_at: string;
  processed_at: string | null;
  file_url: string | null;
  employees?: {
    first_name: string;
    last_name: string;
    employee_no: string;
  } | null;
}

interface StatementsClientProps {
  statements: StatementRow[];
  total: number;
}

export function StatementsClient({ statements, total }: StatementsClientProps) {
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
          {statements.map((r) => {
            const memberName = r.employees 
              ? `${r.employees.first_name} ${r.employees.last_name}`
              : "Unknown";
            return (
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
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>{r.id.slice(0, 8)}...</Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8" }}>{memberName}</Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8", textTransform: "capitalize" }}>
                {r.type.replace("_", " ")}
              </Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: "#475569" }}>{formatDate(r.date_from)}</Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: "#475569" }}>{formatDate(r.date_to)}</Typography>
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
                {r.status === "ready" && r.file_url && (
                  <DownloadRounded sx={{ fontSize: 16, color: "#818CF8", cursor: "pointer" }} />
                )}
              </Box>
            </Box>
          );
        })}
        {statements.length === 0 && (
          <Box sx={{ px: 2.5, py: 8, textAlign: "center" }}>
            <Typography sx={{ color: "#64748B" }}>No statement requests found</Typography>
          </Box>
        )}
        </Box>
      </Paper>
    </Box>
  );
}
