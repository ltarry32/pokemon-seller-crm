'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { PageHeader } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { calculateFees, formatCurrency, formatPercent, cn } from '@/lib/utils';
import type { FeeCalculatorInput, SalePlatform } from '@/types';
import { Calculator, Check } from 'lucide-react';

// ─── Platform presets ─────────────────────────────────────────

const PLATFORM_PRESETS: Record<string, { platform_fee_percent: number; processing_fee_percent: number; fixed_fee: number; label: string }> = {
  ebay: {
    label:                   'eBay Standard',
    platform_fee_percent:    13.25,
    processing_fee_percent:  0,
    fixed_fee:               0,
  },
  ebay_managed: {
    label:                   'eBay Managed Payments',
    platform_fee_percent:    12.9,
    processing_fee_percent:  0.3,
    fixed_fee:               0.30,
  },
  tcgplayer: {
    label:                   'TCGPlayer',
    platform_fee_percent:    10.25,
    processing_fee_percent:  0,
    fixed_fee:               0,
  },
  paypal: {
    label:                   'PayPal G&S',
    platform_fee_percent:    0,
    processing_fee_percent:  3.49,
    fixed_fee:               0.49,
  },
  whatnot: {
    label:                   'Whatnot',
    platform_fee_percent:    10.0,
    processing_fee_percent:  0,
    fixed_fee:               0,
  },
  mercari: {
    label:                   'Mercari',
    platform_fee_percent:    10.0,
    processing_fee_percent:  0,
    fixed_fee:               0,
  },
  card_show: {
    label:                   'Card Show (No fees)',
    platform_fee_percent:    0,
    processing_fee_percent:  0,
    fixed_fee:               0,
  },
  custom: {
    label:                   'Custom',
    platform_fee_percent:    0,
    processing_fee_percent:  0,
    fixed_fee:               0,
  },
};

const DEFAULT_INPUT: FeeCalculatorInput = {
  sale_price:             50.00,
  shipping_charged:       4.50,
  sales_tax:              0,
  platform_fee_percent:   13.25,
  processing_fee_percent: 0,
  fixed_fee:              0,
  shipping_cost_seller:   4.00,
  packaging_cost:         0.50,
  cost_basis:             30.00,
};

export default function CalculatorPage() {
  const { feeProfiles } = useAppStore();
  const [selectedPreset, setSelectedPreset] = useState('ebay');
  const [input, setInput] = useState<FeeCalculatorInput>(DEFAULT_INPUT);

  const set = (key: keyof FeeCalculatorInput, value: number) =>
    setInput(prev => ({ ...prev, [key]: value }));

  const applyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    const preset = PLATFORM_PRESETS[presetKey];
    if (preset) {
      setInput(prev => ({
        ...prev,
        platform_fee_percent:   preset.platform_fee_percent,
        processing_fee_percent: preset.processing_fee_percent,
        fixed_fee:              preset.fixed_fee,
      }));
    }
  };

  const result = calculateFees(input);

  const numInput = (key: keyof FeeCalculatorInput, label: string, hint?: string, suffix?: string) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</label>}
      <div className="relative">
        {!suffix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>}
        <input
          type="number"
          step="0.01"
          min="0"
          value={input[key] || ''}
          onChange={e => set(key, parseFloat(e.target.value) || 0)}
          className={cn(
            'w-full h-10 rounded-xl border bg-surface-2 text-zinc-100 text-sm',
            'focus:outline-none focus:border-brand-500 border-zinc-700 transition-colors',
            suffix ? 'pr-6 pl-3' : 'pl-7 pr-3'
          )}
          placeholder="0.00"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{suffix}</span>}
      </div>
      {hint && <p className="text-[10px] text-zinc-600">{hint}</p>}
    </div>
  );

  return (
    <div className="page-container space-y-5 animate-fade-in">
      <PageHeader
        title="Fee Calculator"
        subtitle="Calculate true net profit after all fees"
      />

      {/* Platform presets */}
      <div>
        <p className="section-title">Platform Preset</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PLATFORM_PRESETS).map(([key, p]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                selectedPreset === key
                  ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                  : 'bg-surface-2 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
              )}
            >
              {selectedPreset === key && <Check className="w-3 h-3 inline mr-1" />}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input form */}
      <Card>
        <p className="section-title mb-4">Sale Details</p>
        <div className="grid grid-cols-2 gap-3">
          {numInput('sale_price',         'Sale Price')}
          {numInput('shipping_charged',   'Shipping Charged')}
          {numInput('cost_basis',         'Your Cost')}
          {numInput('shipping_cost_seller','Shipping Paid')}
          {numInput('packaging_cost',     'Packaging')}
          {numInput('sales_tax',          'Sales Tax')}
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800">
          <p className="section-title mb-3">Fee Structure</p>
          <div className="grid grid-cols-3 gap-3">
            {numInput('platform_fee_percent',   'Platform Fee', undefined, '%')}
            {numInput('processing_fee_percent', 'Processing',   undefined, '%')}
            {numInput('fixed_fee',              'Fixed Fee')}
          </div>
        </div>
      </Card>

      {/* Results */}
      <Card variant="highlighted">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-brand-400" />
          </div>
          <h3 className="font-semibold text-zinc-100">Results</h3>
        </div>

        <div className="space-y-2.5">
          {/* Revenue section */}
          <div className="space-y-1.5">
            <ResultRow label="Sale Price"        value={input.sale_price} />
            <ResultRow label="+ Shipping Charged" value={input.shipping_charged} indent />
            <ResultRow label="= Gross Revenue"   value={result.gross_revenue} bold />
          </div>

          <div className="border-t border-zinc-700/50 pt-2.5 space-y-1.5">
            <ResultRow label="Platform Fee"      value={-result.platform_fee_amount}   negative />
            <ResultRow label="Processing Fee"    value={-result.processing_fee_amount}  negative />
            {result.fixed_fee_amount > 0 && <ResultRow label="Fixed Fee"   value={-result.fixed_fee_amount} negative />}
            <ResultRow label="Total Fees"        value={-result.total_fees}             bold negative />
          </div>

          <div className="border-t border-zinc-700/50 pt-2.5 space-y-1.5">
            <ResultRow label="Net Payout"         value={result.net_payout} />
            <ResultRow label="- Your Cost"        value={-input.cost_basis}        negative indent />
            <ResultRow label="- Shipping Paid"    value={-input.shipping_cost_seller} negative indent />
            <ResultRow label="- Packaging"        value={-input.packaging_cost}    negative indent />
          </div>

          {/* Big profit number */}
          <div className={cn(
            'mt-3 p-4 rounded-2xl border',
            result.net_profit >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
          )}>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-zinc-500">Net Profit</p>
                <p className={cn('text-3xl font-black mt-0.5', result.net_profit >= 0 ? 'text-profit' : 'text-loss')}>
                  {result.net_profit >= 0 ? '+' : ''}{formatCurrency(result.net_profit)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Margin</p>
                <p className={cn('text-xl font-bold', result.net_profit >= 0 ? 'text-profit' : 'text-loss')}>
                  {formatPercent(result.profit_margin_percent)}
                </p>
                <p className="text-xs text-zinc-600">ROI: {formatPercent(result.roi_percent)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Result row helper ────────────────────────────────────────

function ResultRow({ label, value, bold, negative, indent }: {
  label:    string;
  value:    number;
  bold?:    boolean;
  negative?: boolean;
  indent?:  boolean;
}) {
  const color = negative
    ? value < 0 ? 'text-loss' : 'text-zinc-400'
    : value > 0 ? 'text-zinc-200' : 'text-zinc-400';

  return (
    <div className={cn('flex items-center justify-between', indent && 'pl-3')}>
      <span className={cn('text-sm', bold ? 'font-semibold text-zinc-300' : 'text-zinc-500', indent && 'text-xs')}>
        {label}
      </span>
      <span className={cn('text-sm font-mono', bold ? 'font-bold' : '', color)}>
        {value !== 0 ? formatCurrency(Math.abs(value)) : '—'}
      </span>
    </div>
  );
}
