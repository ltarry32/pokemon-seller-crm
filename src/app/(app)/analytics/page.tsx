'use client';

import { useMemo } from 'react';
import { useInventoryItems } from '@/hooks/useInventory';
import { useSoldTransactions } from '@/hooks/useSoldLog';
import { PageHeader } from '@/components/layout/Header';
import { StatCard, Card } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/EmptyState';
import { ProfitTrendChart, PlatformChart } from '@/components/dashboard/ProfitChart';
import { formatCurrency, formatPercent, profitClass, cn } from '@/lib/utils';
import { TrendingUp, Package, DollarSign, BarChart3, ShoppingBag } from 'lucide-react';
import type { InventoryItemRow, SoldTransactionRow } from '@/lib/supabase/database.types';

// ─── Pure KPI computation helpers ────────────────────────────────

function computeInventoryKPIs(items: InventoryItemRow[]) {
  const active = items.filter(i => i.status !== 'sold');
  const totalValue = active.reduce((s, i) => s + i.current_market_price * i.quantity, 0);
  const totalCost = active.reduce((s, i) => s + i.cost_basis * i.quantity, 0);
  const unrealizedProfit = totalValue - totalCost;
  const avgROI = totalCost > 0 ? (unrealizedProfit / totalCost) * 100 : 0;
  return { totalValue, totalCost, unrealizedProfit, avgROI, itemCount: active.length };
}

function computeSalesKPIs(txs: SoldTransactionRow[]) {
  const totalRevenue = txs.reduce((s, t) => s + t.sold_price, 0);
  const totalProfit = txs.reduce((s, t) => s + (t.net_profit ?? 0), 0);
  const totalFees = txs.reduce((s, t) => s + (t.fees ?? 0), 0);
  return { totalRevenue, totalProfit, totalFees, salesCount: txs.length };
}

function groupByMonth(txs: SoldTransactionRow[]) {
  const map = new Map<string, { month: string; revenue: number; profit: number }>();

  txs.forEach(t => {
    const month = t.date_sold.slice(0, 7);
    const ex = map.get(month) ?? { month, revenue: 0, profit: 0 };

    map.set(month, {
      month,
      revenue: ex.revenue + t.sold_price,
      profit: ex.profit + (t.net_profit ?? 0),
    });
  });

  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

// ─── Page ─────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data: inventory = [], isLoading: invLoading } = useInventoryItems();
  const { data: transactions = [], isLoading: txLoading } = useSoldTransactions();

  const isLoading = invLoading || txLoading;

  const invKPIs = useMemo(() => computeInventoryKPIs(inventory), [inventory]);
  const salesKPIs = useMemo(() => computeSalesKPIs(transactions), [transactions]);
  const monthlyData = useMemo(() => groupByMonth(transactions), [transactions]);

  const fixedMonthlyData = useMemo(
    () =>
      monthlyData.map(item => ({
        ...item,
        cost: 0,
        sales_count: 0,
      })),
    [monthlyData]
  );

  // Platform breakdown
  const platformData = useMemo(() => {
    const map = new Map<string, { revenue: number; profit: number; count: number }>();

    transactions.forEach(t => {
      const platform = t.platform ?? 'Other';
      const ex = map.get(platform) ?? { revenue: 0, profit: 0, count: 0 };

      map.set(platform, {
        revenue: ex.revenue + t.sold_price,
        profit: ex.profit + (t.net_profit ?? 0),
        count: ex.count + 1,
      });
    });

    return Array.from(map.entries()).map(([platform, d]) => ({ platform, ...d }));
  }, [transactions]);

  // Top cards by profit
  const topCards = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => (b.net_profit ?? 0) - (a.net_profit ?? 0))
        .slice(0, 5),
    [transactions]
  );

  // Worst cards
  const worstCards = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => (a.net_profit ?? 0) - (b.net_profit ?? 0))
        .slice(0, 3),
    [transactions]
  );

  // Set performance (active inventory)
  const setData = useMemo(() => {
    const map = new Map<string, { cost: number; value: number; count: number }>();

    inventory
      .filter(i => i.status !== 'sold')
      .forEach(i => {
        const ex = map.get(i.set_name) ?? { cost: 0, value: 0, count: 0 };

        map.set(i.set_name, {
          cost: ex.cost + i.cost_basis * i.quantity,
          value: ex.value + i.current_market_price * i.quantity,
          count: ex.count + i.quantity,
        });
      });

    return Array.from(map.entries())
      .map(([set_name, d]) => ({
        set_name,
        ...d,
        profit: d.value - d.cost,
        roi: d.cost > 0 ? ((d.value - d.cost) / d.cost) * 100 : 0,
      }))
      .sort((a, b) => b.profit - a.profit);
  }, [inventory]);

  if (isLoading) {
    return (
      <div className="page-container space-y-4 animate-fade-in">
        <PageHeader title="Analytics" subtitle="Loading..." />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6 animate-fade-in">
      <PageHeader title="Analytics" subtitle="Profit & loss overview" />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Portfolio Value"
          value={formatCurrency(invKPIs.totalValue, 0)}
          sub={`${invKPIs.itemCount} cards`}
          icon={<Package className="w-5 h-5 text-blue-400" />}
          highlight
        />
        <StatCard
          label="Realized Profit"
          value={formatCurrency(salesKPIs.totalProfit, 0)}
          sub={`${salesKPIs.salesCount} sales`}
          icon={<TrendingUp className="w-5 h-5 text-profit" />}
        />
        <StatCard
          label="Unrealized Profit"
          value={formatCurrency(invKPIs.unrealizedProfit, 0)}
          trend={invKPIs.unrealizedProfit >= 0 ? 'up' : 'down'}
          icon={<BarChart3 className="w-5 h-5 text-brand-400" />}
        />
        <StatCard
          label="Avg ROI"
          value={formatPercent(invKPIs.avgROI)}
          trend={invKPIs.avgROI >= 0 ? 'up' : 'down'}
          icon={<TrendingUp className="w-5 h-5 text-zinc-400" />}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(salesKPIs.totalRevenue, 0)}
          icon={<DollarSign className="w-5 h-5 text-brand-400" />}
        />
        <StatCard
          label="Total Fees Paid"
          value={formatCurrency(salesKPIs.totalFees, 0)}
          sub="all platforms"
          icon={<ShoppingBag className="w-5 h-5 text-zinc-500" />}
        />
      </div>

      {monthlyData.length > 0 && (
        <Card>
          <h3 className="font-semibold text-zinc-100 text-sm mb-1">Monthly P&amp;L Trend</h3>
          <p className="text-xs text-zinc-500 mb-4">Revenue vs net profit over time</p>
          <ProfitTrendChart data={fixedMonthlyData} />
          <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-brand-500 rounded" />
              <span className="text-xs text-zinc-500">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-profit rounded" />
              <span className="text-xs text-zinc-500">Profit</span>
            </div>
          </div>
        </Card>
      )}

      {platformData.length > 0 && (
        <Card>
          <h3 className="font-semibold text-zinc-100 text-sm mb-4">Sales by Platform</h3>
          <PlatformChart data={platformData} />
          <div className="mt-3 space-y-2">
            {[...platformData]
              .sort((a, b) => b.profit - a.profit)
              .map(p => (
                <div
                  key={p.platform}
                  className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-300">{p.platform}</p>
                    <p className="text-xs text-zinc-600">
                      {p.count} sale{p.count !== 1 ? 's' : ''} · {formatCurrency(p.revenue)} revenue
                    </p>
                  </div>
                  <p className={cn('text-sm font-bold', profitClass(p.profit))}>
                    {p.profit >= 0 ? '+' : ''}
                    {formatCurrency(p.profit)}
                  </p>
                </div>
              ))}
          </div>
        </Card>
      )}

      {topCards.length > 0 && (
        <Card>
          <h3 className="font-semibold text-zinc-100 text-sm mb-4">Best Performing Sales</h3>
          <div className="space-y-3">
            {topCards.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{t.card_name}</p>
                  <p className="text-xs text-zinc-500">
                    {t.set_name} · {t.platform}
                  </p>
                </div>
                <p className={cn('text-sm font-bold shrink-0', profitClass(t.net_profit ?? 0))}>
                  +{formatCurrency(t.net_profit ?? 0)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {setData.length > 0 && (
        <Card>
          <h3 className="font-semibold text-zinc-100 text-sm mb-4">Portfolio by Set</h3>
          <div className="space-y-3">
            {setData.map(s => (
              <div key={s.set_name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className="text-sm font-medium text-zinc-300 truncate max-w-[180px]">{s.set_name}</p>
                    <p className="text-xs text-zinc-600">
                      {s.count} card{s.count !== 1 ? 's' : ''} · cost {formatCurrency(s.cost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-sm font-bold', profitClass(s.profit))}>
                      {s.profit >= 0 ? '+' : ''}
                      {formatCurrency(s.profit)}
                    </p>
                    <p className={cn('text-xs', profitClass(s.roi))}>{formatPercent(s.roi)} ROI</p>
                  </div>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', s.roi >= 0 ? 'bg-profit' : 'bg-loss')}
                    style={{ width: `${Math.min(Math.abs(s.roi), 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {worstCards.length > 0 && worstCards.some(t => (t.net_profit ?? 0) < 0) && (
        <Card variant="danger">
          <h3 className="font-semibold text-zinc-100 text-sm mb-4">Worst Performers</h3>
          <div className="space-y-2">
            {worstCards
              .filter(t => (t.net_profit ?? 0) < 0)
              .map(t => (
                <div key={t.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-300">{t.card_name}</p>
                    <p className="text-xs text-zinc-500">{t.platform}</p>
                  </div>
                  <p className="text-sm font-bold text-loss">{formatCurrency(t.net_profit ?? 0)}</p>
                </div>
              ))}
          </div>
        </Card>
      )}

      {transactions.length === 0 && inventory.length === 0 && (
        <div className="text-center py-16 text-zinc-600">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No data yet — add cards and log sales to see analytics.</p>
        </div>
      )}
    </div>
  );
}
