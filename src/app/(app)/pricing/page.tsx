'use client';

import { useState } from 'react';
import { RefreshCw, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/Header';
import { PricingCard, TrendingCardChip } from '@/components/pricing/PricingCard';
import { MOCK_AGGREGATED_PRICING, MOCK_TRENDING_CARDS } from '@/data/mockPricing';
import { formatCurrency, cn } from '@/lib/utils';
import type { AggregatedPricing } from '@/types';

export default function PricingPage() {
  const [search, setSearch]           = useState('');
  const [pricing, setPricing]         = useState(MOCK_AGGREGATED_PRICING);
  const [refreshing, setRefreshing]   = useState<string | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);

  const filtered = pricing.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.card_name.toLowerCase().includes(q) ||
      p.set_name.toLowerCase().includes(q) ||
      (p.card_number ?? '').toLowerCase().includes(q)
    );
  });

  const handleRefresh = async (cardName: string) => {
    setRefreshing(cardName);
    await new Promise(r => setTimeout(r, 1200));
setPricing(prev =>
      prev.map(p => p.card_name === cardName ? { ...p, last_refreshed: new Date().toISOString() } : p)
    );
    setRefreshing(null);
  };

  const handleRefreshAll = async () => {
    setRefreshingAll(true);
    await new Promise(r => setTimeout(r, 2000));
    setPricing(prev => prev.map(p => ({ ...p, last_refreshed: new Date().toISOString() })));
    setRefreshingAll(false);
  };

  return (
    <div className="page-container space-y-5 animate-fade-in">
      <PageHeader
        title="Market Pricing"
        subtitle="Pricing estimates based on recent market data. Live integrations with eBay and TCGPlayer coming soon."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefreshAll}
            loading={refreshingAll}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Estimates
          </Button>
        }
      />

      {/* Source legend */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'eBay Sold',     color: 'bg-blue-500/20  text-blue-300  border-blue-500/30' },
          { label: 'TCGPlayer',     color: 'bg-green-500/20 text-green-300 border-green-500/30' },
          { label: 'PriceCharting', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
        ].map(s => (
          <span key={s.label} className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full border', s.color)}>
            {s.label}
          </span>
        ))}
        <span className="text-[11px] text-zinc-600 px-2 py-0.5">
          Live pricing coming soon
        </span>
      </div>

      {/* Trending section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-zinc-300">Trending Cards</h3>
        </div>
        <div className="space-y-2">
          {MOCK_TRENDING_CARDS.slice(0, 4).map(card => (
            <TrendingCardChip key={`${card.card_name}-${card.set_name}`} card={card} />
          ))}
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by card name, set, or number..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Pricing cards */}
      <div>
        <h3 className="section-title">Your Inventory Prices</h3>
        <div className="space-y-3">
          {filtered.map(p => (
            <PricingCard
              key={`${p.card_name}-${p.set_name}`}
              pricing={p}
              onRefresh={() => handleRefresh(p.card_name)}
              isRefreshing={refreshing === p.card_name}
            />
          ))}
        </div>
      </div>

      {/* Integration CTA */}
      <div className="bg-surface-1 border border-dashed border-zinc-700 rounded-2xl p-5 text-center">
        <p className="text-sm font-medium text-zinc-300 mb-1">🔌 Connect Pricing APIs</p>
        <p className="text-xs text-zinc-500 mb-3">
          eBay, TCGPlayer, and PriceCharting integration points are ready.
          Add your API keys in Settings → Integrations.
        </p>
        <a href="/settings" className="text-xs text-brand-400 hover:text-brand-300 underline">
          Go to Settings →
        </a>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[11px] text-zinc-600 pb-2">
        Prices shown are estimates and may vary from live marketplace listings.
      </p>
    </div>
  );
}
