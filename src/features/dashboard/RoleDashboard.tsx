"use client";
import { Box, Grid, Typography, Paper, Button } from "@mui/material";
import { formatCurrency } from "@/utils/formatters";

export function RoleDashboard({ user, metrics }: any) {
  const role = user.role;

  return (
    <Box sx={{ color: 'white' }}>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: '#D4AF37', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.2em', mb: 1 }}>
          GTPEA SECURE PORTAL
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, color: 'white' }}>
          Hello, {user.full_name}
        </Typography>
      </Box>

      {/* KPI Section - Solid White Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: '20px', borderBottom: '4px solid #D4AF37' }}>
            <Typography sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 800 }}>FUND BALANCE</Typography>
            <Typography sx={{ color: '#041633', fontSize: '1.5rem', fontWeight: 900 }}>{formatCurrency(metrics.fundBalance)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: '20px', borderBottom: '4px solid #2D7A4D' }}>
            <Typography sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 800 }}>ACTIVE LOANS</Typography>
            <Typography sx={{ color: '#041633', fontSize: '1.5rem', fontWeight: 900 }}>{formatCurrency(metrics.totalOutstanding)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: '20px', borderBottom: '4px solid #D4AF37' }}>
            <Typography sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 800 }}>TOTAL MEMBERS</Typography>
            <Typography sx={{ color: '#041633', fontSize: '1.5rem', fontWeight: 900 }}>{metrics.totalMembers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: '20px', borderBottom: '4px solid #1E5A36' }}>
            <Typography sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 800 }}>PENDING ACTIONS</Typography>
            <Typography sx={{ color: '#041633', fontSize: '1.5rem', fontWeight: 900 }}>{metrics.pendingApprovals}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ROLE SPECIFIC TOOLS */}
      <Grid container spacing={4}>
        {/* EMPLOYEE LOAN APP */}
        {role === 'employee' && (
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 4, borderRadius: '24px' }}>
              <Typography sx={{ color: '#1E5A36', fontWeight: 900, mb: 3, fontSize: '1.2rem' }}>Apply for a Loan</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <input placeholder="Principal Amount (₵)" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <input placeholder="Duration (Months)" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>PREVIEW</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#2D7A4D' }}>Repayment: ₵1,420.00 / mo</Typography>
                </Box>
                <Button sx={{ bgcolor: '#2D7A4D', color: 'white', py: 2, fontWeight: 900, borderRadius: '12px', "&:hover": { bgcolor: '#1E5A36' } }}>Submit Application</Button>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* FUND MANAGER / ADMIN EXCEL TOOLS */}
        {(role === 'fund_manager' || role === 'super_admin' || role === 'admin' || role === 'administrator') && (
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 4, borderRadius: '24px' }}>
              <Typography sx={{ color: '#041633', fontWeight: 900, mb: 1 }}>Excel Management Suite</Typography>
              <Typography sx={{ color: '#64748b', mb: 4, fontSize: '0.8rem' }}>Upload monthly data or export treasury tabs.</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button fullWidth sx={{ border: '2px solid #041633', color: '#041633', fontWeight: 900 }}>Export Savings Tab</Button>
                </Grid>
                <Grid item xs={6}>
                  <Button fullWidth sx={{ border: '2px solid #041633', color: '#041633', fontWeight: 900 }}>Export Loans Tab</Button>
                </Grid>
                <Grid item xs={12}>
                  <Button fullWidth sx={{ bgcolor: '#2D7A4D', color: 'white', py: 2, fontWeight: 900 }}>Upload Monthly Data Sheet</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* CHAIRMAN READ-ONLY TABLE */}
        {role === 'chairperson' && (
          <Grid item xs={12}>
            <Paper sx={{ borderRadius: '24px', overflow: 'hidden' }}>
              <Box sx={{ p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontWeight: 900, color: '#041633' }}>Executive Oversight Ledger</Typography>
              </Box>
              <table style={{ width: '100%', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead style={{ background: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '16px' }}>MEMBER</th>
                    <th style={{ padding: '16px' }}>SAVINGS</th>
                    <th style={{ padding: '16px' }}>LOANS</th>
                    <th style={{ padding: '16px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontWeight: 700 }}>Malik Abid</td>
                    <td style={{ padding: '16px', color: '#2D7A4D', fontWeight: 800 }}>₵14,200</td>
                    <td style={{ padding: '16px' }}>₵5,000</td>
                    <td style={{ padding: '16px' }}><span style={{ padding: '4px 12px', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontWeight: 800, fontSize: '0.7rem' }}>FAITHFUL</span></td>
                  </tr>
                </tbody>
              </table>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}