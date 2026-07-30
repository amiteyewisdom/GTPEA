import { format, formatDistanceToNow, parseISO, addMonths, addDays, isWeekend } from 'date-fns';

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
  installment_no: number;
  opening_balance: number;
  principal: number;
  interest: number;
  total: number;
  closing_balance: number;
}

/**
 * Generate full amortization schedule.
 * method 'reducing_balance': interest recalculated each period on remaining principal.
 * method 'flat_rate': total interest = principal × (rate/100) × months, divided equally.
 */
export function generateAmortizationSchedule(
  principal: number,
  durationMonths: number,
  annualRate: number,
  startDate?: Date,
  method: 'reducing_balance' | 'flat_rate' = 'reducing_balance'
): AmortizationPayment[] {
  const schedule: AmortizationPayment[] = [];
  const start = startDate || new Date();

  if (method === 'flat_rate') {
    const monthlyRate = annualRate / 100;
    const totalInterest = principal * monthlyRate * durationMonths;
    const interestPerPeriod = totalInterest / durationMonths;
    const principalPerPeriod = principal / durationMonths;
    const totalPayment = principalPerPeriod + interestPerPeriod;
    let balance = principal;

    for (let i = 1; i <= durationMonths; i++) {
      const openingBalance = balance;
      balance = Math.max(0, balance - principalPerPeriod);
      const paymentDate = addMonths(start, i);
      schedule.push({
        month: paymentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        installment_no: i,
        opening_balance: openingBalance,
        principal: principalPerPeriod,
        interest: interestPerPeriod,
        total: totalPayment,
        closing_balance: balance,
      });
    }
  } else {
    const monthlyRate = annualRate / 100;
    const monthlyPayment =
      monthlyRate === 0
        ? principal / durationMonths
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
          (Math.pow(1 + monthlyRate, durationMonths) - 1);
    let balance = principal;

    for (let i = 1; i <= durationMonths; i++) {
      const openingBalance = balance;
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance = Math.max(0, balance - principalPayment);
      const paymentDate = addMonths(start, i);
      schedule.push({
        month: paymentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        installment_no: i,
        opening_balance: openingBalance,
        principal: principalPayment,
        interest: interestPayment,
        total: monthlyPayment,
        closing_balance: balance,
      });
    }
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

/**
 * Monthly repayment for reducing balance (standard annuity PMT formula).
 * annualRate is stored as a decimal in DB (e.g. 0.02 = 2%), passed here as-is.
 */
export function calculateMonthlyRepayment(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  method: 'reducing_balance' | 'flat_rate' = 'reducing_balance'
): number {
  if (method === 'flat_rate') {
    const totalInterest = principal * annualRate * tenureMonths;
    return (principal + totalInterest) / tenureMonths;
  }
  if (annualRate === 0) return principal / tenureMonths;
  const monthlyRate = annualRate;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );
}

export function calculateTotalRepayable(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  method: 'reducing_balance' | 'flat_rate' = 'reducing_balance'
): number {
  return calculateMonthlyRepayment(principal, annualRate, tenureMonths, method) * tenureMonths;
}

export function calculateTotalInterest(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  method: 'reducing_balance' | 'flat_rate' = 'reducing_balance'
): number {
  return calculateTotalRepayable(principal, annualRate, tenureMonths, method) - principal;
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

// ─── Working Days ─────────────────────────────────────────────────────────────

export function addWorkingDays(startDate: Date, days: number): Date {
  let current = new Date(startDate);
  let added = 0;
  while (added < days) {
    current = addDays(current, 1);
    if (!isWeekend(current)) {
      added++;
    }
  }
  return current;
}

export function feedbackDeadline(dateStr: string, days = 14): string {
  try {
    const deadline = addWorkingDays(parseISO(dateStr), days);
    return format(deadline, 'dd MMM yyyy');
  } catch {
    return '—';
  }
}

export function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const groups = ["", "Thousand", "Million", "Billion"];

  function chunkToWords(n: number): string {
    let result = "";
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    if (h > 0) result += `${ones[h]} Hundred `;
    if (t === 1) result += `${teens[o]} `;
    else {
      if (t > 0) result += `${tens[t]} `;
      if (o > 0) result += `${ones[o]} `;
    }
    return result.trim();
  }

  let remaining = Math.floor(num);
  let groupIndex = 0;
  const parts: string[] = [];
  while (remaining > 0) {
    const chunk = remaining % 1000;
    if (chunk > 0) {
      const chunkWords = chunkToWords(chunk);
      parts.unshift(`${chunkWords}${groups[groupIndex] ? ` ${groups[groupIndex]}` : ""}`);
    }
    remaining = Math.floor(remaining / 1000);
    groupIndex++;
  }

  const decimal = Math.round((num % 1) * 100);
  let words = parts.join(", ").trim();
  if (decimal > 0) words += ` and ${decimal}/100`;
  return words;
}
