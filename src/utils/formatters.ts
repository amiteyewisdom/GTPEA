import { format, formatDistanceToNow, parseISO, addMonths } from 'date-fns';

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(
  amount: number,
  currency = 'GHS',
  locale = 'en-GH'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-GH').format(value);
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `₵${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `₵${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₵${(value / 1_000).toFixed(1)}K`;
  return formatCurrency(value);
}

// ─── Amortization Schedule ─────────────────────────────────────────────────────

export interface AmortizationPayment {
  month: string;
  principal: number;
  interest: number;
  total: number;
  balance: number;
}

export function generateAmortizationSchedule(
  principal: number,
  durationMonths: number,
  annualRate: number,
  startDate?: Date
): AmortizationPayment[] {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / (Math.pow(1 + monthlyRate, durationMonths) - 1);
  const schedule: AmortizationPayment[] = [];
  let balance = principal;
  
  const start = startDate || new Date();
  
  for (let i = 1; i <= durationMonths; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    
    const paymentDate = addMonths(start, i);
    
    schedule.push({
      month: paymentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      principal: principalPayment,
      interest: interestPayment,
      total: monthlyPayment,
      balance: Math.max(0, balance)
    });
  }
  
  return schedule;
}

// ─── Date & Time ──────────────────────────────────────────────────────────────

export function formatDate(dateStr: string, pattern = 'dd MMM yyyy'): string {
  try {
    return format(parseISO(dateStr), pattern);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy, HH:mm');
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

// ─── Percent & Rate ───────────────────────────────────────────────────────────

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatInterestRate(rate: number): string {
  return `${rate.toFixed(2)}% p.a.`;
}

// ─── Loan Calculations ────────────────────────────────────────────────────────

export function calculateMonthlyRepayment(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (annualRate === 0) return principal / tenureMonths;
  const monthlyRate = annualRate / 100 / 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );
}

export function calculateTotalRepayable(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  return calculateMonthlyRepayment(principal, annualRate, tenureMonths) * tenureMonths;
}

// ─── String Helpers ───────────────────────────────────────────────────────────

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  return str.split('_').map(capitalize).join(' ');
}

export function generateReference(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

export function maskAccountNumber(account: string): string {
  if (account.length <= 4) return account;
  return `****${account.slice(-4)}`;
}
