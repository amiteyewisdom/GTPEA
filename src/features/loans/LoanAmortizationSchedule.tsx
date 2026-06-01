"use client";

import { Box, Typography, Paper } from "@mui/material";

export interface AmortizationRow {
  installment_no: number;
  due_date: string;
  opening_balance: number;
  principal_amount: number;
  interest_amount: number;
  total_payment: number;
  closing_balance: number;
  is_paid: boolean;
  paid_date?: string | null;
}

interface Props {
  rows: AmortizationRow[];
  currency?: string;
}

export function LoanAmortizationSchedule({ rows, currency = "₵" }: Props) {
  return (
    <Paper sx={{
      bgcolor: "#0F1420", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px", overflow: "hidden",
    }}>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "0.5fr 1fr 1.1fr 1.1fr 1.1fr 1.1fr 0.7fr",
        px: 2.5, py: 1.5,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {["#", "Due Date", "Opening", "Principal", "Interest", "Total", "Status"].map((h) => (
          <Typography key={h} sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#334155", letterSpacing: "0.05em" }}>
            {h}
          </Typography>
        ))}
      </Box>
      {rows.map((r) => (
        <Box key={r.installment_no} sx={{
          display: "grid",
          gridTemplateColumns: "0.5fr 1fr 1.1fr 1.1fr 1.1fr 1.1fr 0.7fr",
          px: 2.5, py: 1.1,
          borderBottom: "1px solid rgba(255,255,255,0.03)",
          bgcolor: r.is_paid ? "rgba(34,197,94,0.04)" : "transparent",
          "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
          transition: "background 0.15s ease",
        }}>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>
            {r.installment_no}
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8" }}>{r.due_date}</Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: "#64748B" }}>
            {currency}{r.opening_balance.toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: "#E2E8F0" }}>
            {currency}{r.principal_amount.toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: "#E2E8F0" }}>
            {currency}{r.interest_amount.toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>
            {currency}{r.total_payment.toLocaleString()}
          </Typography>
          <Box>
            {r.is_paid ? (
              <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#22C55E" }}>
                PAID
              </Typography>
            ) : (
              <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#F59E0B" }}>
                PENDING
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Paper>
  );
}
