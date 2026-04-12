'use client';

import { Package, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn, formatCurrency, formatDate, profitClass } from '@/lib/utils';
import type { SoldTransaction } from '@/types';

interface SoldCardProps {
  transaction: SoldTransaction;
  onEdit?:   () => void;
  onDelete?: () => void;
}

const PLATFORM_ICONS: Record<string, string> = {
  eBay:                  '🔵',
  TCGPlayer:             '🟢',
  'Facebook Marketplace':'📘',
  'Card Show':           '🎪',
  Local:                 '🤝',
  Whatnot:               '🎥',
  Instagram:             '📷',
  Mercari:               '🟠',
  Other:                 '🏷️',
};

export function SoldCard({ transaction, onEdit, onDelete }: SoldCardProps) {
  const isProfit = transaction.net_profit > 0;
  const roi = transaction.cost_basis > 0
    ? ((transaction.net_profit / transaction.cost_basis) * 100)
    : 0;

  return (
    <div className="bg-surface-1 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all duration-200">
      <div className="flex gap-3">
        {/* Card placeholder image */}
        <div className="w-10 h-14 flex-shrink-0 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <Package className="w-4 h-4 text-zinc-600" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-zinc-100 text-sm truncate">{transaction.card_name}</p>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                {transaction.set_name} · #{transaction.card_number}
              </p>
            </div>

            {/* Net profit */}
            <div className="flex-shrink-0 text-right">
              <p className={cn('font-bold text-base', profitClass(transaction.net_profit))}>
                {transaction.net_profit >= 0 ? '+' : ''}{formatCurrency(transaction.net_profit)}
              </p>
              <p className={cn('text-xs', profitClass(roi))}>
                {roi >= 0 ? '+' : ''}{roi.toFixed(1)}% ROI
              </p>
            </div>
          </div>

          {/* Details row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <span className="text-xs text-zinc-400">
              {PLATFORM_ICONS[transaction.platform] ?? '🏷️'} {transaction.platform}
            </span>
            <span className="text-xs text-zinc-600">·</span>
            <span className="text-xs text-zinc-400">{formatDate(transaction.date_sold)}</span>
            <span className="text-xs text-zinc-600">·</span>
            <span className="text-xs font-medium text-zinc-300">{formatCurrency(transaction.sold_price)}</span>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800/60">
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Sold For</p>
              <p className="text-xs font-semibold text-zinc-300">{formatCurrency(transaction.sold_price)}</p>
            </div>
            <div className="w-px h-6 bg-zinc-800" />
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Fees</p>
              <p className="text-xs font-semibold text-loss">{formatCurrency(transaction.fees)}</p>
            </div>
            <div className="w-px h-6 bg-zinc-800" />
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Ship</p>
              <p className="text-xs font-semibold text-zinc-400">{formatCurrency(transaction.shipping_cost)}</p>
            </div>
            <div className="w-px h-6 bg-zinc-800" />
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Cost</p>
              <p className="text-xs font-semibold text-zinc-400">{formatCurrency(transaction.cost_basis)}</p>
            </div>

            {/* Actions */}
            {(onEdit || onDelete) && (
              <div className="ml-auto flex gap-1">
                {onEdit && (
                  <button onClick={onEdit} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-xs">
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button onClick={onDelete} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors text-xs">
                    Del
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tracking */}
          {transaction.tracking_number && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-600">
              <Truck className="w-3 h-3" />
              <span className="font-mono">{transaction.tracking_number}</span>
            </div>
          )}

          {/* Graded badge */}
          {transaction.is_graded && (
            <div className="mt-1">
              <Badge variant="graded">
                {transaction.grade ? `Grade ${transaction.grade}` : 'Graded'}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
