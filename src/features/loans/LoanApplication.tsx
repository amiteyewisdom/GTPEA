"use client";

import { useMemo, useState } from "react";
import { addMonths, format } from "date-fns";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";
import { formatCurrency, formatInterestRate, calculateMonthlyRepayment, calculateTotalRepayable } from "@/utils/formatters";
import { useRouter } from "next/navigation";

interface LoanProduct {
  id: string;
  name: string;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  max_tenure_months: number;
}

interface LoanApplicationProps {
  loanProducts: LoanProduct[];
}

export function LoanApplication({ loanProducts }: LoanApplicationProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(loanProducts[0]?.id ?? "");
  const [principal, setPrincipal] = useState(5000);
  const [duration, setDuration] = useState(12);
  const [purpose, setPurpose] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => loanProducts.find((product) => product.id === productId) ?? loanProducts[0],
    [loanProducts, productId]
  );

  const monthlyRepayment = useMemo(() => {
    if (!selectedProduct || duration <= 0) return 0;
    return calculateMonthlyRepayment(principal, selectedProduct.interest_rate, duration);
  }, [principal, selectedProduct, duration]);

  const totalRepayable = useMemo(
    () => calculateTotalRepayable(principal, selectedProduct?.interest_rate ?? 0, duration),
    [principal, selectedProduct, duration]
  );

  const interestAmount = useMemo(() => totalRepayable - principal, [totalRepayable, principal]);

  const firstRepaymentDate = useMemo(() => format(addMonths(new Date(), 1), "dd MMM yyyy"), []);
  const expectedCompletionDate = useMemo(() => format(addMonths(new Date(), duration), "dd MMM yyyy"), [duration]);

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/loans/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loan_product_id: productId,
          principal,
          duration_months: duration,
          purpose: purpose.trim(),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to submit loan request.");
      }

      setSuccessMessage("Loan application submitted successfully. It will now enter the approval workflow.");
      setConfirmOpen(false);
      setLoading(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Submission failed.");
      setLoading(false);
    }
  };

  if (loanProducts.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Loan application unavailable
        </Typography>
        <Typography color="text.secondary">
          There are no active loan products configured. Please contact your administrator.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper id="loan-application" sx={{ p: 3, mb: 4, bgcolor: "rgba(255,255,255,0.92)" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            Apply for a Loan
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "0.95rem" }}>
            Submit a new loan request and track progress through Union Rep, Fund Manager, and Chairman review.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            select
            label="Loan product"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            sx={{ minWidth: 220 }}
          >
            {loanProducts.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Principal Amount"
            type="number"
            value={principal}
            onChange={(event) => setPrincipal(Number(event.target.value))}
            InputProps={{ inputProps: { min: selectedProduct.min_amount, max: selectedProduct.max_amount } }}
            fullWidth
          />

          <TextField
            label="Duration (months)"
            type="number"
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
            InputProps={{ inputProps: { min: 1, max: selectedProduct.max_tenure_months } }}
            sx={{ width: 180 }}
          />
        </Stack>

        <TextField
          label="Purpose"
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
          multiline
          rows={2}
          fullWidth
          placeholder="Brief description of the loan purpose"
        />

        <Paper sx={{ p: 3, bgcolor: "rgba(4, 22, 51, 0.08)", border: "1px solid rgba(255,255,255,0.16)" }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Loan Preview
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {[
              { label: "Requested Amount", value: formatCurrency(principal) },
              { label: "Interest Rate", value: formatInterestRate(selectedProduct.interest_rate) },
              { label: "Interest Amount", value: formatCurrency(interestAmount) },
              { label: "Total Repayment", value: formatCurrency(totalRepayable) },
              { label: "Monthly Repayment", value: formatCurrency(monthlyRepayment) },
              { label: "First Repayment", value: firstRepaymentDate },
              { label: "Completion Date", value: expectedCompletionDate },
            ].map((item) => (
              <Box key={item.label} sx={{ minWidth: 160, flex: 1 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button
            variant="contained"
            onClick={() => setConfirmOpen(true)}
            disabled={principal <= 0 || duration <= 0 || !selectedProduct}
          >
            Review & Submit
          </Button>
        </Box>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Loan Application</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to apply for this loan? Once confirmed, the request will enter the approval workflow and be reviewed by the Union Representative first.
          </Typography>
          <Box sx={{ display: "grid", gap: 1.25 }}>
            <Typography><strong>Product:</strong> {selectedProduct.name}</Typography>
            <Typography><strong>Amount:</strong> {formatCurrency(principal)}</Typography>
            <Typography><strong>Duration:</strong> {duration} months</Typography>
            <Typography><strong>Monthly Repayment:</strong> {formatCurrency(monthlyRepayment)}</Typography>
            <Typography><strong>Total Repayment:</strong> {formatCurrency(totalRepayable)}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? "Submitting..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
    </Paper>
  );
}
