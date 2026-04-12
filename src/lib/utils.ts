// =============================================================
// UTILITY FUNCTIONS — shared helpers
// =============================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

// ─── Tailwind class merging ───────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency formatting ──────────────────────────────────────

export function formatCurrency(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return formatCurrency(value);
}

// ─── Percent formatting ───────────────────────────────────────

export function formatPercent(value: number, decimals = 1): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

// ─── Date formatting ──────────────────────────────────────────

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MM/dd/yy');
  } catch {
    return dateStr;
  }
}

export function formatRelativeDate(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

// ─── Profit & ROI calculations ───────────────────────────────

export function calcProfit(costBasis: number, salePrice: number, fees: number, shipping: number, packaging: number): number {
  return salePrice - costBasis - fees - shipping - packaging;
}

export function calcROI(costBasis: number, profit: number): number {
  if (costBasis <= 0) return 0;
  return (profit / costBasis) * 100;
}

export function calcMargin(revenue: number, profit: number): number {
  if (revenue <= 0) return 0;
  return (profit / revenue) * 100;
}

// ─── Fee calculations ─────────────────────────────────────────

export interface FeeCalcResult {
  gross_revenue: number;
  platform_fee_amount: number;
  processing_fee_amount: number;
  fixed_fee_amount: number;
  total_fees: number;
  total_expenses: number;
  net_payout: number;
  net_profit: number;
  profit_margin_percent: number;
  roi_percent: number;
}

export function calculateFees(input: {
  sale_price: number;
  shipping_charged: number;
  sales_tax: number;
  platform_fee_percent: number;
  processing_fee_percent: number;
  fixed_fee: number;
  shipping_cost_seller: number;
  packaging_cost: number;
  cost_basis: number;
}): FeeCalcResult {
  const gross_revenue = input.sale_price + input.shipping_charged;
  const taxable_base  = gross_revenue;

  const platform_fee_amount    = (taxable_base * input.platform_fee_percent) / 100;
  const processing_fee_amount  = (taxable_base * input.processing_fee_percent) / 100;
  const fixed_fee_amount       = input.fixed_fee;

  const total_fees    = platform_fee_amount + processing_fee_amount + fixed_fee_amount;
  const total_expenses = total_fees + input.shipping_cost_seller + input.packaging_cost + input.cost_basis;

  const net_payout     = gross_revenue - total_fees;
  const net_profit     = gross_revenue - total_expenses;
  const profit_margin  = gross_revenue > 0 ? (net_profit / gross_revenue) * 100 : 0;
  const roi            = input.cost_basis > 0 ? (net_profit / input.cost_basis) * 100 : 0;

  return {
    gross_revenue,
    platform_fee_amount,
    processing_fee_amount,
    fixed_fee_amount,
    total_fees,
    total_expenses,
    net_payout,
    net_profit,
    profit_margin_percent: profit_margin,
    roi_percent: roi,
  };
}

// ─── Condition color helpers ──────────────────────────────────

export function conditionColor(condition: string): string {
  const map: Record<string, string> = {
    'Mint':              'text-emerald-400',
    'Near Mint':         'text-green-400',
    'Lightly Played':    'text-yellow-400',
    'Moderately Played': 'text-orange-400',
    'Heavily Played':    'text-red-400',
    'Damaged':           'text-red-600',
  };
  return map[condition] ?? 'text-zinc-400';
}

export function conditionBadgeClass(condition: string): string {
  const map: Record<string, string> = {
    'Mint':              'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Near Mint':         'bg-green-500/20 text-green-300 border-green-500/30',
    'Lightly Played':    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'Moderately Played': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'Heavily Played':    'bg-red-500/20 text-red-300 border-red-500/30',
    'Damaged':           'bg-red-900/20 text-red-400 border-red-600/30',
  };
  return map[condition] ?? 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
}

export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    in_inventory: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    listed:       'bg-brand-500/20 text-brand-300 border-brand-500/30',
    sold:         'bg-green-500/20 text-green-300 border-green-500/30',
    pending:      'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    damaged:      'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return map[status] ?? 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    in_inventory: 'In Stock',
    listed: 'Listed',
    sold: 'Sold',
    pending: 'Pending',
    damaged: 'Damaged',
  };
  return map[status] ?? status;
}

// ─── Profit direction helpers ─────────────────────────────────

export function profitClass(value: number): string {
  if (value > 0) return 'text-profit';
  if (value < 0) return 'text-loss';
  return 'text-zinc-400';
}

export function profitSign(value: number): string {
  return value >= 0 ? '+' : '';
}

// ─── Sort helper ──────────────────────────────────────────────

export function sortByKey<T>(arr: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av < bv) return direction === 'asc' ? -1 : 1;
    if (av > bv) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// ─── Generate placeholder ID (client-side) ────────────────────

export function tempId(): string {
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
