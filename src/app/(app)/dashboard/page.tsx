'use client';

import Link from 'next/link';
import { useAppStore } from '@/stores/appStore';
import { computeInventoryKPIs } from '@/data/mockInventory';
import { computeSalesKPIs, groupByMonth } from '@/data/mockSoldTransactions';
import { StatCard } from '@/components/ui/Card';
import { ProfitTrendChart } from '@/components/dashboard/ProfitChart';
import { InventoryCard } from '@/components/inventory/InventoryCard';
import { SoldCard } from '@/components/sold/SoldCard';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/Header';
import {
  TrendingUp, Package, ShoppingBag, DollarSign,
  ScanLine, Calculator, Plus, ArrowRight, Zap
} from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';

export default function DashboardPage() {
  const { inventory, soldTransactions } = useAppStore();

  const invKPIs  = computeInventoryKPIs(inventory);
  const salesKPIs = computeSalesKPIs(soldTransactions);
  const monthlyData = groupByMonth(soldTransactions);

  // Top 3 items by unrealized profit
  const topItems = [...inventory]
    .filter(i => i.status !== 'sold')
    .sort((a, b) => (b.current_market_price - b.cost_basis) - (a.current_market_price - a.cost_basis))
    .slice(0, 3);

  const recentSales = soldTransactions.slice(0, 3);

  return (
    <div className="page-container space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
        actions={
          <Link href="/inventory/add">
            <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Card
            </Button>
          </Link>
        }
      />

      {/* Demo banner */}
      <div className="flex items-center gap-3 p-3 bg-brand-500/10 border border-brand-500/20 rounded-2xl">
        <Zap className="w-4 h-4 text-brand-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-300">Demo Mode Active</p>
          <p className="text-xs text-zinc-500">Showing sample data. Connect Supabase in Settings to go live.</p>
        </div>
        <Link href="/settings">
          <Button variant="ghost" size="sm">Setup →</Button>
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Portfolio Value"
          value={formatCurrency(invKPIs.totalValue, 0)}
          sub={`${invKPIs.itemCount} cards`}
          trend="up"
          trendValue={formatCurrency(invKPIs.unrealizedProfit, 0) + ' unrealized'}
          icon={<Package className="w-5 h-5 text-blue-400" />}
          highlight
        />
        <StatCard
          label="Total Profit"
          value={formatCurrency(salesKPIs.totalProfit, 0)}
          sub={`${salesKPIs.salesCount} sales`}
          trend={salesKPIs.totalProfit > 0 ? 'up' : 'down'}
          trendValue={formatPercent(salesKPIs.profitMargin) + ' margin'}
          icon={<TrendingUp className="w-5 h-5 text-profit" />}
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(salesKPIs.totalRevenue, 0)}
          sub="all time"
          trend="up"
          icon={<DollarSign className="w-5 h-5 text-brand-400" />}
        />
        <StatCard
          label="Fees Paid"
          value={formatCurrency(salesKPIs.totalFees, 0)}
          sub="all platforms"
          trend="down"
          trendValue={formatPercent(-((salesKPIs.totalFees / Math.max(salesKPIs.totalRevenue, 1)) * 100)) + ' of revenue'}
          icon={<ShoppingBag className="w-5 h-5 text-zinc-400" />}
        />
      </div>

      {/* Profit trend chart */}
      {monthlyData.length > 0 && (
        <div className="bg-surface-1 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm">Profit Trend</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Revenue vs profit over time</p>
            </div>
            <Link href="/analytics">
              <Button variant="ghost" size="sm">
                Full Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <ProfitTrendChart data={monthlyData} />
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-brand-500 rounded" />
              <span className="text-xs text-zinc-500">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-profit rounded" />
              <span className="text-xs text-zinc-500">Profit</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/scan">
          <div className="bg-surface-1 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center group-hover:bg-brand-500/25 transition-colors">
              <ScanLine className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">Scan Card</p>
              <p className="text-xs text-zinc-500">Add via camera</p>
            </div>
          </div>
        </Link>
        <Link href="/calculator">
          <div className="bg-surface-1 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 hover:border-zinc-700 transition-all cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
              <Calculator className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">Fee Calc</p>
              <p className="text-xs text-zinc-500">Calculate profit</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Top inventory */}
      {topItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-300">Top Holdings</h3>
            <Link href="/inventory">
              <Button variant="ghost" size="sm">
                All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {topItems.map(item => (
              <InventoryCard key={item.id} item={item} compact />
            ))}
          </div>
        </div>
      )}

      {/* Recent sales */}
      {recentSales.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-300">Recent Sales</h3>
            <Link href="/sold">
              <Button variant="ghost" size="sm">
                All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {recentSales.map(tx => (
              <SoldCard key={tx.id} transaction={tx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
