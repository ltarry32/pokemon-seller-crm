'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn, formatCurrency, formatPercent, conditionBadgeClass, statusBadgeClass, statusLabel, profitClass } from '@/lib/utils';
import type { InventoryItemRow } from '@/lib/supabase/database.types';

interface InventoryCardProps {
  item: InventoryItemRow;
  compact?: boolean;
}

export function InventoryCard({ item, compact = false }: InventoryCardProps) {
  const unrealizedProfit = (item.current_market_price - item.cost_basis) * item.quantity;
  const roi = item.cost_basis > 0 ? ((item.current_market_price - item.cost_basis) / item.cost_basis) * 100 : 0;
  const isProfit = unrealizedProfit > 0;
  const isLoss   = unrealizedProfit < 0;

  const TrendIcon = isProfit ? TrendingUp : isLoss ? TrendingDown : Minus;

  return (
    <Link href={`/inventory/${item.id}`}>
      <div className={cn(
        'bg-surface-1 border border-zinc-800 rounded-2xl transition-all duration-200',
        'hover:border-zinc-700 hover:shadow-card-hover active:scale-[0.99]',
        'flex gap-3',
        compact ? 'p-3' : 'p-4'
      )}>
        {/* Card image */}
        <div className="relative flex-shrink-0">
          {item.image_url ? (
            <div className={cn('relative rounded-xl overflow-hidden bg-zinc-800', compact ? 'w-10 h-14' : 'w-14 h-20')}>
              <Image
                src={item.image_url}
                alt={item.card_name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          ) : (
            <div className={cn(
              'rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center',
              compact ? 'w-10 h-14' : 'w-14 h-20'
            )}>
              <Package className="w-5 h-5 text-zinc-600" />
            </div>
          )}
          {item.is_graded && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center border-2 border-surface-1">
              <Star className="w-2.5 h-2.5 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={cn('font-semibold text-zinc-100 truncate leading-tight', compact ? 'text-sm' : 'text-base')}>
                {item.card_name}
              </p>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                {item.set_name} · #{item.card_number}
              </p>
            </div>

            {/* Profit indicator */}
            <div className="flex-shrink-0 text-right">
              <p className={cn('font-bold leading-tight', compact ? 'text-sm' : 'text-base', profitClass(unrealizedProfit))}>
                {formatCurrency(item.current_market_price)}
              </p>
              <div className={cn('flex items-center justify-end gap-0.5 text-xs', profitClass(unrealizedProfit))}>
                <TrendIcon className="w-3 h-3" />
                <span>{formatPercent(roi)}</span>
              </div>
            </div>
          </div>

          {/* Badges row */}
          {!compact && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border', conditionBadgeClass(item.condition))}>
                {item.condition}
              </span>
              <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border', statusBadgeClass(item.status))}>
                {statusLabel(item.status)}
              </span>
              {item.is_graded && (
                <Badge variant="graded">
                  {item.grading_company} {item.grade}
                </Badge>
              )}
              {item.quantity > 1 && (
                <Badge variant="default">×{item.quantity}</Badge>
              )}
            </div>
          )}

          {/* Cost vs value row */}
          {!compact && (
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-zinc-800/60">
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Cost</p>
                <p className="text-xs font-medium text-zinc-400">{formatCurrency(item.cost_basis)}</p>
              </div>
              <div className="w-px h-6 bg-zinc-800" />
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wide">P&amp;L</p>
                <p className={cn('text-xs font-bold', profitClass(unrealizedProfit))}>
                  {unrealizedProfit >= 0 ? '+' : ''}{formatCurrency(unrealizedProfit)}
                </p>
              </div>
              {item.list_price != null && (
                <>
                  <div className="w-px h-6 bg-zinc-800" />
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Listed</p>
                    <p className="text-xs font-medium text-zinc-400">{formatCurrency(item.list_price)}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
