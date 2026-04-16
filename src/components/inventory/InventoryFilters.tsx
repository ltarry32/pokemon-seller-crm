'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

export function InventoryFilters() {
  const { inventoryFilters, setInventoryFilters, resetInventoryFilters } = useAppStore();

  // 'active' is the default — it is not considered an active filter
  const hasActiveFilters =
    inventoryFilters.search !== '' ||
    (inventoryFilters.status !== 'active' && inventoryFilters.status !== 'all') ||
    inventoryFilters.is_graded !== null ||
    inventoryFilters.condition !== 'all' ||
    inventoryFilters.sort !== 'newest';

  return (
    <div className="space-y-3">
      {/* Search */}
      <Input
        placeholder="Search cards, sets, notes..."
        value={inventoryFilters.search}
        onChange={e => setInventoryFilters({ search: e.target.value })}
        leftIcon={<Search className="w-4 h-4" />}
        rightIcon={
          inventoryFilters.search ? (
            <button onClick={() => setInventoryFilters({ search: '' })} className="pointer-events-auto">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : undefined
        }
      />

      {/* Filter row */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {/* Status */}
        <select
          value={inventoryFilters.status}
          onChange={e => setInventoryFilters({ status: e.target.value as InventoryFilters['status'] })}
          className="flex-shrink-0 h-9 px-3 rounded-xl bg-surface-2 border border-zinc-700 text-sm text-zinc-300 focus:outline-none focus:border-brand-500"
        >
          <option value="active">Active</option>
          <option value="all">All (incl. Sold)</option>
          <option value="in_inventory">In Stock</option>
          <option value="listed">Listed</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </select>

        {/* Graded filter */}
        <select
          value={inventoryFilters.is_graded === null ? 'all' : String(inventoryFilters.is_graded)}
          onChange={e => {
            const v = e.target.value;
            setInventoryFilters({ is_graded: v === 'all' ? null : v === 'true' });
          }}
          className="flex-shrink-0 h-9 px-3 rounded-xl bg-surface-2 border border-zinc-700 text-sm text-zinc-300 focus:outline-none focus:border-brand-500"
        >
          <option value="all">Raw &amp; Graded</option>
          <option value="false">Raw Only</option>
          <option value="true">Graded Only</option>
        </select>

        {/* Condition */}
        <select
          value={inventoryFilters.condition}
          onChange={e => setInventoryFilters({ condition: e.target.value as InventoryFilters['condition'] })}
          className="flex-shrink-0 h-9 px-3 rounded-xl bg-surface-2 border border-zinc-700 text-sm text-zinc-300 focus:outline-none focus:border-brand-500"
        >
          <option value="all">Any Condition</option>
          <option value="Mint">Mint</option>
          <option value="Near Mint">Near Mint</option>
          <option value="Lightly Played">Lightly Played</option>
          <option value="Moderately Played">Moderately Played</option>
          <option value="Heavily Played">Heavily Played</option>
        </select>

        {/* Sort */}
        <select
          value={inventoryFilters.sort}
          onChange={e => setInventoryFilters({ sort: e.target.value as InventoryFilters['sort'] })}
          className="flex-shrink-0 h-9 px-3 rounded-xl bg-surface-2 border border-zinc-700 text-sm text-zinc-300 focus:outline-none focus:border-brand-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest_value">Highest Value</option>
          <option value="highest_profit">Highest Profit</option>
          <option value="lowest_cost">Lowest Cost</option>
          <option value="alphabetical">A → Z</option>
        </select>

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetInventoryFilters}
            className="flex-shrink-0"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

// Re-export the type so other files can import it
import type { InventoryFilters } from '@/types';
