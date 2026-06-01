"use client";

import { Box, Typography, Paper, Chip } from "@mui/material";

const ACCOUNT_COLOR: Record<string, string> = {
  savings: "#818CF8",
  loan: "#F59E0B",
  loan_repayment: "#22C55E",
  withdrawal: "#EF4444",
  interest: "#06B6D4",
  dividend: "#34D399",
  penalty: "#F97316",
  fee: "#64748B",
};

export default function LedgerPage() {
  const rows = [
    { ref: "TXN-001", account: "savings", narration: "Monthly contribution — Kwame Asante", debit: 0, credit: 500, balance: 12500, period: "2026-05" },
    { ref: "TXN-002", account: "loan", narration: "Loan disbursement — Ama Mensah", debit: 10000, credit: 0, balance: 98000, period: "2026-05" },
    { ref: "TXN-003", account: "loan_repayment", narration: "Loan repayment — Yaw Boateng", debit: 0, credit: 450, balance: 12550, period: "2026-05" },
    { ref: "TXN-004", account: "dividend", narration: "Dividend credit FY2025 — Kwame Asante", debit: 0, credit: 437, balance: 4500, period: "2026-04" },
    { ref: "TXN-005", account: "withdrawal", narration: "Withdrawal disbursement — Ama Mensah", debit: 5000, credit: 0, balance: 93000, period: "2026-04" },
    { ref: "TXN-006", account: "interest", narration: "Interest credit — savings pool", debit: 0, credit: 210, balance: 12760, period: "2026-04" },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
        <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: "#E2E8F0" }}>
          Ledger / Transactions Center
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {Object.keys(ACCOUNT_COLOR).map((k) => (
          <Chip
            key={k}
            label={k.replace("_", " ")}
            size="small"
            sx={{
              fontSize: "0.75rem", fontWeight: 600,
              bgcolor: `${ACCOUNT_COLOR[k]}12`,
              color: ACCOUNT_COLOR[k],
              border: `1px solid ${ACCOUNT_COLOR[k]}25`,
              borderRadius: "6px", height: 26,
              cursor: "pointer",
              "&:hover": { bgcolor: `${ACCOUNT_COLOR[k]}20` },
            }}
          />
        ))}
      </Box>

      <Paper sx={{
        bgcolor: "#0F1420", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px", overflow: "hidden",
      }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "0.9fr 1fr 2.2fr 1fr 1fr 1fr 0.8fr",
            minWidth: 640,
            px: 2.5, py: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            {["Reference", "Account", "Narration", "Debit", "Credit", "Balance", "Period"].map((h) => (
              <Typography key={h} sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#334155", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                {h}
              </Typography>
            ))}
          </Box>
          {rows.map((r) => (
            <Box key={r.ref} sx={{
              display: "grid",
              gridTemplateColumns: "0.9fr 1fr 2.2fr 1fr 1fr 1fr 0.8fr",
              minWidth: 640,
              px: 2.5, py: 1.25,
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>{r.ref}</Typography>
            <Typography sx={{
              fontSize: "0.8125rem", fontWeight: 600,
              color: ACCOUNT_COLOR[r.account],
            }}>
              {r.account.replace("_", " ")}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8" }}>{r.narration}</Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#EF4444", fontWeight: 500 }}>
              {r.debit > 0 ? `₵${r.debit.toLocaleString()}` : "—"}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#22C55E", fontWeight: 500 }}>
              {r.credit > 0 ? `₵${r.credit.toLocaleString()}` : "—"}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>
              ₵{r.balance.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#475569" }}>{r.period}</Typography>
          </Box>
        ))}
        </Box>
      </Paper>
    </Box>
  );
}
