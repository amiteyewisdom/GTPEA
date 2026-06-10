"use client";

import { useState } from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";
import { formatCurrency, formatDate } from "@/utils/formatters";

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

interface LedgerEntry {
  id: string;
  account_type: string;
  debit: number;
  credit: number;
  running_balance: number;
  narration: string;
  reference: string;
  period_year: number;
  period_month: number;
  posted_at: string;
  employees?: {
    first_name: string;
    last_name: string;
    employee_no: string;
  } | null;
}

interface LedgerClientProps {
  ledgerEntries: LedgerEntry[];
  total: number;
}

export function LedgerClient({ ledgerEntries, total }: LedgerClientProps) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const filteredEntries = selectedAccount
    ? ledgerEntries.filter((e) => e.account_type === selectedAccount)
    : ledgerEntries;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
        <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: "#E2E8F0" }}>
          Ledger / Transactions Center
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        <Chip
          label="All"
          size="small"
          onClick={() => setSelectedAccount(null)}
          sx={{
            fontSize: "0.75rem", fontWeight: 600,
            bgcolor: selectedAccount === null ? "#818CF8" : "rgba(129, 140, 248, 0.12)",
            color: selectedAccount === null ? "#0A0A0A" : "#818CF8",
            border: `1px solid ${selectedAccount === null ? "#818CF8" : "rgba(129, 140, 248, 0.25)"}`,
            borderRadius: "6px", height: 26,
            cursor: "pointer",
            "&:hover": { bgcolor: selectedAccount === null ? "#818CF8" : "rgba(129, 140, 248, 0.2)" },
          }}
        />
        {Object.keys(ACCOUNT_COLOR).map((k) => (
          <Chip
            key={k}
            label={k.replace("_", " ")}
            size="small"
            onClick={() => setSelectedAccount(k)}
            sx={{
              fontSize: "0.75rem", fontWeight: 600,
              bgcolor: selectedAccount === k ? ACCOUNT_COLOR[k] : `${ACCOUNT_COLOR[k]}12`,
              color: selectedAccount === k ? "#0A0A0A" : ACCOUNT_COLOR[k],
              border: `1px solid ${selectedAccount === k ? ACCOUNT_COLOR[k] : `${ACCOUNT_COLOR[k]}25`}`,
              borderRadius: "6px", height: 26,
              cursor: "pointer",
              "&:hover": { bgcolor: selectedAccount === k ? ACCOUNT_COLOR[k] : `${ACCOUNT_COLOR[k]}20` },
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
          {filteredEntries.map((r) => (
            <Box key={r.id} sx={{
              display: "grid",
              gridTemplateColumns: "0.9fr 1fr 2.2fr 1fr 1fr 1fr 0.8fr",
              minWidth: 640,
              px: 2.5, py: 1.25,
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>{r.reference}</Typography>
            <Typography sx={{
              fontSize: "0.8125rem", fontWeight: 600,
              color: ACCOUNT_COLOR[r.account_type] || "#94A3B8",
            }}>
              {r.account_type.replace("_", " ")}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8" }}>{r.narration}</Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#EF4444", fontWeight: 500 }}>
              {r.debit > 0 ? formatCurrency(r.debit) : "—"}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#22C55E", fontWeight: 500 }}>
              {r.credit > 0 ? formatCurrency(r.credit) : "—"}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "#E2E8F0" }}>
              {formatCurrency(r.running_balance)}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "#475569" }}>
              {r.period_year}-{String(r.period_month).padStart(2, '0')}
            </Typography>
          </Box>
        ))}
        {filteredEntries.length === 0 && (
          <Box sx={{ px: 2.5, py: 8, textAlign: "center" }}>
            <Typography sx={{ color: "#64748B" }}>No ledger entries found</Typography>
          </Box>
        )}
        </Box>
      </Paper>
    </Box>
  );
}
