'use client';

import { RefreshCw, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency, formatRelativeDate } from '@/lib/utils';
import type { AggregatedPricing } from '@/types';
import type { TrendingCard } from '@/data/mockPricing';

// ─── Aggregated pricing card ──────────────────────────────────

interface PricingCardProps {
  pricing: AggregatedPricing;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  'eBay Sold':    'bg-blue-500/20  text-blue-300  border-blue-500/30',
  'eBay Active':  'bg-sky-500/20   text-sky-300   border-sky-500/30',
  'TCGPlayer':    'bg-green-500/20 text-green-300 border-green-500/30',
  'PriceCharting':'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

export function PricingCard({ pricing, onRefresh, isRefreshing }: PricingCardProps) {
  return (
    <div className="bg-surface-1 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-zinc-800">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-100 truncate">{pricing.card_name}</p>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">{pricing.set_name} · #{pricing.card_number}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <div className="text-right">
            <p className="text-xl font-bold text-brand-400">{formatCurrency(pricing.best_price)}</p>
            <p className="text-[10px] text-zinc-600">Est. Market Value</p>
          </div>
          {onRefresh && (
            <Button variant="ghost" size="icon" onClick={onRefresh} loading={isRefreshing}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Source breakdown */}
      <div className="divide-y divide-zinc-800/50">
        {pricing.snapshots.filter(s => s.avg_price > 0).map(snapshot => (
          <div key={snapshot.id} className="flex items-center gap-3 px-4 py-3">
            {/* Source badge */}
            <span className={cn(
              'shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border w-28 justify-center',
              SOURCE_COLORS[snapshot.source] ?? 'bg-zinc-700/60 text-zinc-300 border-zinc-600/40'
            )}>
              {snapshot.source}
            </span>

            {/* Price range */}
            <div className="flex-1 flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-zinc-600">{formatCurrency(snapshot.low_price)}</span>
              <div className="flex-1 h-px bg-zinc-800 relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-brand-500/40 rounded-full"
                  style={{
                    left:  `${((snapshot.avg_price - snapshot.low_price) / Math.max(snapshot.high_price - snapshot.low_price, 1)) * 30}%`,
                    width: '40%',
                  }}
                />
              </div>
              <span className="text-zinc-600">{formatCurrency(snapshot.high_price)}</span>
            </div>

            {/* Avg */}
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-zinc-200">{formatCurrency(snapshot.avg_price)}</p>
              {snapshot.sales_count > 0 && (
                <p className="text-[10px] text-zinc-600">{snapshot.sales_count} sales</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-zinc-800/20 flex items-center justify-between">
        <p className="text-[10px] text-zinc-600">
          Updated {formatRelativeDate(pricing.last_refreshed)}
        </p>
        <p className="text-xs text-zinc-400">
          List at: <span className="font-semibold text-brand-400">{formatCurrency(pricing.recommended_list_price)}</span>
        </p>
      </div>
    </div>
  );
}

// ─── Trending card chip ───────────────────────────────────────

interface TrendingCardChipProps {
  card: TrendingCard;
}

export function TrendingCardChip({ card }: TrendingCardChipProps) {
  const TrendIcon = card.trend === 'up' ? TrendingUp : card.trend === 'down' ? TrendingDown : Minus;
  const color = card.trend === 'up' ? 'text-profit' : card.trend === 'down' ? 'text-loss' : 'text-zinc-400';

  return (
    <div className="bg-surface-1 border border-zinc-800 rounded-2xl p-3 flex items-center gap-3 hover:border-zinc-700 transition-colors cursor-pointer">
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', card.trend === 'up' ? 'bg-green-500/10' : card.trend === 'down' ? 'bg-red-500/10' : 'bg-zinc-800')}>
        <TrendIcon className={cn('w-4 h-4', color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-100 truncate">{card.card_name}</p>
        <p className="text-xs text-zinc-500 truncate">{card.set_name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-zinc-200">{formatCurrency(card.current_price)}</p>
        <p className={cn('text-xs font-medium', color)}>
          {card.price_change_pct >= 0 ? '+' : ''}{card.price_change_pct.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
