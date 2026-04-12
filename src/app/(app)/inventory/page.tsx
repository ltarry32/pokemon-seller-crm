'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { InventoryCard } from '@/components/inventory/InventoryCard';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import type { InventoryItem, SortOption } from '@/types';

function applyFilters(items: InventoryItem[], filters: ReturnType<typeof useAppStore.getState>['inventoryFilters']): InventoryItem[] {
  let result = [...items];

  // Search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(i =>
      i.card_name.toLowerCase().includes(q) ||
      i.set_name.toLowerCase().includes(q) ||
      i.card_number.toLowerCase().includes(q) ||
      i.notes?.toLowerCase().includes(q) ||
      i.storage_location?.toLowerCase().includes(q)
    );
  }

  // Status
  if (filters.status !== 'all') {
    result = result.filter(i => i.status === filters.status);
  }

  // Graded
  if (filters.is_graded !== null) {
    result = result.filter(i => i.is_graded === filters.is_graded);
  }

  // Condition
  if (filters.condition !== 'all') {
    result = result.filter(i => i.condition === filters.condition);
  }

  // Rarity
  if (filters.rarity !== 'all') {
    result = result.filter(i => i.rarity === filters.rarity);
  }

  // Sort
  const sortMap: Record<SortOption, (a: InventoryItem, b: InventoryItem) => number> = {
    newest:         (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    oldest:         (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    highest_value:  (a, b) => b.current_market_price - a.current_market_price,
    highest_profit: (a, b) => (b.current_market_price - b.cost_basis) - (a.current_market_price - a.cost_basis),
    lowest_cost:    (a, b) => a.cost_basis - b.cost_basis,
    alphabetical:   (a, b) => a.card_name.localeCompare(b.card_name),
  };
  result.sort(sortMap[filters.sort] ?? sortMap.newest);

  return result;
}

export default function InventoryPage() {
  const { inventory, inventoryFilters } = useAppStore();

  const filtered = useMemo(() => applyFilters(inventory, inventoryFilters), [inventory, inventoryFilters]);

  const totalValue = filtered.filter(i => i.status !== 'sold').reduce((s, i) => s + i.current_market_price * i.quantity, 0);
  const totalCost  = filtered.filter(i => i.status !== 'sold').reduce((s, i) => s + i.cost_basis * i.quantity, 0);

  return (
    <div className="page-container space-y-4 animate-fade-in">
      <PageHeader
        title="Inventory"
        subtitle={`${filtered.length} card${filtered.length !== 1 ? 's' : ''}`}
        actions={
          <Link href="/inventory/add">
            <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Card
            </Button>
          </Link>
        }
      />

      {/* Value summary strip */}
      {filtered.length > 0 && (
        <div className="flex gap-4 bg-surface-1 border border-zinc-800 rounded-2xl px-4 py-3 overflow-x-auto no-scrollbar">
          <div className="shrink-0">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Total Value</p>
            <p className="text-sm font-bold text-brand-400">{formatCurrency(totalValue)}</p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div className="shrink-0">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Cost Basis</p>
            <p className="text-sm font-bold text-zinc-300">{formatCurrency(totalCost)}</p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div className="shrink-0">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Unrealized P&L</p>
            <p className={`text-sm font-bold ${totalValue - totalCost >= 0 ? 'text-profit' : 'text-loss'}`}>
              {totalValue - totalCost >= 0 ? '+' : ''}{formatCurrency(totalValue - totalCost)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <InventoryFilters />

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🃏"
          title="No cards found"
          description="Try adjusting your filters or add your first card to get started."
          action={{ label: 'Add Card', onClick: () => window.location.href = '/inventory/add' }}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <InventoryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
