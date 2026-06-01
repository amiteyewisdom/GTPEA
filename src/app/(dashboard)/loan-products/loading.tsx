import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loading() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 2 }}>
      <CircularProgress size={32} thickness={4} sx={{ color: "#6366F1" }} />
      <Typography sx={{ fontSize: "0.875rem", color: "#64748B" }}>Loading loan products…</Typography>
    </Box>
  );
}
