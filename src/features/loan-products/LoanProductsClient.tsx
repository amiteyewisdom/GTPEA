"use client";

import {
  Box, Grid, Paper, Typography, Button, Chip, Divider, IconButton, Tooltip,
} from "@mui/material";
import { AddRounded, EditRounded, CheckCircleRounded, CancelRounded } from "@mui/icons-material";
import { formatCurrency } from "@/utils/formatters";

interface Product {
  id: string;
  name: string;
  description: string | null;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  min_term_months: number;
  max_term_months: number;
  processing_fee_percent: number;
  requires_guarantor: boolean;
  max_loan_to_salary_ratio: number;
  is_active: boolean;
}

interface LoanProductsClientProps {
  products: Product[];
}

export function LoanProductsClient({ products }: LoanProductsClientProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" size="small" startIcon={<AddRounded />}>
          New Loan Product
        </Button>
      </Box>

      {products.length === 0 ? (
        <Paper sx={{ py: 8, textAlign: "center" }}>
          <Typography color="text.secondary">
            No loan products configured yet. Create your first product to start accepting applications.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} lg={4} key={product.id}>
              <Paper
                sx={{
                  p: 2.5,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  border: product.is_active
                    ? "1px solid rgba(99,102,241,0.25)"
                    : "1px solid rgba(255,255,255,0.06)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    borderColor: "rgba(99,102,241,0.4)",
                    boxShadow: "0 8px 32px rgba(99,102,241,0.12)",
                  },
                }}
              >
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
                      {product.name}
                    </Typography>
                    {product.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                        {product.description}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {product.is_active ? (
                      <Chip
                        icon={<CheckCircleRounded sx={{ fontSize: "14px !important" }} />}
                        label="Active"
                        size="small"
                        sx={{
                          height: 22, fontSize: "0.6875rem", fontWeight: 600,
                          color: "#34D399", bgcolor: "rgba(16,185,129,0.1)",
                          border: "1px solid rgba(16,185,129,0.25)",
                          "& .MuiChip-label": { px: 0.75 },
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<CancelRounded sx={{ fontSize: "14px !important" }} />}
                        label="Inactive"
                        size="small"
                        sx={{
                          height: 22, fontSize: "0.6875rem", fontWeight: 600,
                          color: "#94A3B8", bgcolor: "rgba(148,163,184,0.08)",
                          border: "1px solid rgba(148,163,184,0.2)",
                          "& .MuiChip-label": { px: 0.75 },
                        }}
                      />
                    )}
                    <Tooltip title="Edit product">
                      <IconButton size="small">
                        <EditRounded sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />

                {/* Stats grid */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  {[
                    { label: "Interest Rate", value: `${product.interest_rate}% p.a.`, color: "#818CF8" },
                    { label: "Processing Fee", value: `${product.processing_fee_percent}%`, color: "#94A3B8" },
                    { label: "Min Amount", value: formatCurrency(product.min_amount), color: "#34D399" },
                    { label: "Max Amount", value: formatCurrency(product.max_amount), color: "#34D399" },
                    { label: "Term Range", value: `${product.min_term_months}–${product.max_term_months} mo.`, color: "#22D3EE" },
                    { label: "Max Loan/Salary", value: `${product.max_loan_to_salary_ratio}x`, color: "#FCD34D" },
                  ].map(({ label, value, color }) => (
                    <Box key={label} sx={{ bgcolor: "rgba(255,255,255,0.02)", borderRadius: 1.5, p: 1.25, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary", fontWeight: 500, mb: 0.25 }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {product.requires_guarantor && (
                  <Chip
                    label="Requires Guarantor"
                    size="small"
                    sx={{
                      alignSelf: "flex-start",
                      height: 22, fontSize: "0.6875rem", fontWeight: 600,
                      color: "#FCD34D", bgcolor: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      borderRadius: 1,
                      "& .MuiChip-label": { px: 0.75 },
                    }}
                  />
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
