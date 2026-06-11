"use client";

import { Box, Typography, Paper, Button, Avatar } from "@mui/material";
import { AddRounded } from "@mui/icons-material";

const RELATION_COLOR: Record<string, string> = {
  spouse: "#818CF8",
  child: "#34D399",
  parent: "#F59E0B",
  sibling: "#06B6D4",
  other: "#64748B",
};

export default function BeneficiariesPage() {
  const rows: any[] = [];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
        <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: "#E2E8F0" }}>
          Beneficiaries
        </Typography>
        <Button
          startIcon={<AddRounded sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: "none", fontWeight: 600, color: "#0A0A0A",
            bgcolor: "#818CF8", borderRadius: "10px", px: 2, py: 0.75,
            "&:hover": { bgcolor: "#A5B4FC" },
          }}
        >
          Add Beneficiary
        </Button>
      </Box>

      <Paper sx={{
        bgcolor: "#0F1420", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px", overflow: "hidden",
      }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "1.8fr 1.5fr 0.9fr 1.2fr 0.8fr 0.6fr",
            minWidth: 560,
            px: 2.5, py: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            {["Name", "Member", "Relation", "Phone", "Allocation", "Primary"].map((h) => (
              <Typography key={h} sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#334155", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                {h}
              </Typography>
            ))}
          </Box>
          {rows.map((r, i) => (
            <Box key={i} sx={{
              display: "grid",
              gridTemplateColumns: "1.8fr 1.5fr 0.9fr 1.2fr 0.8fr 0.6fr",
              minWidth: 560,
              px: 2.5, py: 1.25,
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>{r.name}</Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8" }}>{r.employee}</Typography>
            <Typography sx={{
              fontSize: "0.8125rem", fontWeight: 600,
              color: RELATION_COLOR[r.relation],
              textTransform: "capitalize",
            }}>
              {r.relation}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#475569" }}>{r.phone}</Typography>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>{r.allocation}%</Typography>
            <Box>
              {r.primary && (
                <Avatar sx={{
                  width: 18, height: 18, fontSize: "0.625rem", fontWeight: 700,
                  bgcolor: "#22C55E15", color: "#22C55E",
                  border: "1px solid #22C55E30",
                }}>
                  P
                </Avatar>
              )}
            </Box>
          </Box>
        ))}
        </Box>
      </Paper>
    </Box>
  );
}
