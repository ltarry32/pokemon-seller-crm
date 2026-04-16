'use client'

import Link from 'next/link'
import { useInventoryItems } from '@/hooks/useInventory'
import { useSoldTransactions, useSalesKPIs } from '@/hooks/useSoldLog'
import { StatCard } from '@/components/ui/Card'
import { ProfitTrendChart } from '@/components/dashboard/ProfitChart'
import { InventoryCard } from '@/components/inventory/InventoryCard'
import { SoldCard } from '@/components/sold/SoldCard'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/Header'
import { CardSkeleton, StatSkeleton } from '@/components/ui/EmptyState'
import {
  TrendingUp, Package, ShoppingBag, DollarSign,
  ScanLine, Calculator, Plus, ArrowRight, Layers,
} from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { InventoryItemRow, SoldTransactionRow } from '@/lib/supabase/database.types'

// ─── Inventory KPIs (derived from live data) ─────────────────

function computeInventoryKPIs(items: InventoryItemRow[]) {
  const active    = items.filter(i => i.status !== 'sold')
  const totalValue = active.reduce((s, i) => s + i.current_market_price * i.quantity, 0)
  const totalCost  = active.reduce((s, i) => s + i.cost_basis * i.quantity, 0)
  return {
    totalValue,
    totalCost,
    unrealizedProfit: totalValue - totalCost,
    itemCount: active.length,
  }
}

// ─── Monthly grouping for chart ───────────────────────────────

function groupByMonth(transactions: SoldTransactionRow[]) {
  const map = new Map<string, { revenue: number; profit: number; cost: number; sales_count: number }>()
  transactions.forEach(t => {
    const month = t.date_sold.slice(0, 7)
    const ex = map.get(month) ?? { revenue: 0, profit: 0, cost: 0, sales_count: 0 }
    map.set(month, {
      revenue:     ex.revenue + t.sold_price,
      profit:      ex.profit  + (t.net_profit ?? 0),
      cost:        ex.cost    + t.cost_basis,
      sales_count: ex.sales_count + 1,
    })
  })
  return Array.from(map.entries())
    .map(([month, d]) => ({ month, ...d }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export default function DashboardPage() {
  const { data: inventory = [],     isLoading: invLoading }  = useInventoryItems()
  const { data: transactions = [],  isLoading: salesLoading } = useSoldTransactions()

  const invKPIs    = computeInventoryKPIs(inventory)
  const salesKPIs  = useSalesKPIs(transactions)
  const monthlyData = groupByMonth(transactions)

  const topItems    = [...inventory]
    .filter(i => i.status !== 'sold')
    .sort((a, b) => (b.current_market_price - b.cost_basis) - (a.current_market_price - a.cost_basis))
    .slice(0, 3)

  const recentSales = transactions.slice(0, 3)

  const isLoading = invLoading || salesLoading
  const isEmpty   = !isLoading && inventory.length === 0 && transactions.length === 0

  return (
    <div className="page-container space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        actions={
          <Link href="/inventory/add">
            <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>Add Card</Button>
          </Link>
        }
      />

      {/* First-time user welcome state */}
      {isEmpty && (
        <div className="bg-surface-1 border border-zinc-800 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200">Welcome to your CRM</p>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Add your first card to start tracking inventory value, profit, and sales history.
            </p>
          </div>
          <Link href="/inventory/add">
            <Button size="sm" className="mt-1">Add Your First Card</Button>
          </Link>
        </div>
      )}

      {/* KPI Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : !isEmpty && (
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
            trend={salesKPIs.totalProfit >= 0 ? 'up' : 'down'}
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
            icon={<ShoppingBag className="w-5 h-5 text-zinc-400" />}
          />
        </div>
      )}

      {/* Profit trend chart */}
      {!isLoading && monthlyData.length > 0 && (
        <div className="bg-surface-1 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm">Profit Trend</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Revenue vs profit over time</p>
            </div>
            <Link href="/analytics">
              <Button variant="ghost" size="sm">Full Report <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
            </Link>
          </div>
          <ProfitTrendChart data={monthlyData} />
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-brand-500 rounded" /><span className="text-xs text-zinc-500">Revenue</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-profit rounded" /><span className="text-xs text-zinc-500">Profit</span></div>
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
      {!isLoading && topItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-300">Top Holdings</h3>
            <Link href="/inventory">
              <Button variant="ghost" size="sm">All <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
            </Link>
          </div>
          <div className="space-y-2">
            {topItems.map(item => <InventoryCard key={item.id} item={item} compact />)}
          </div>
        </div>
      )}

      {/* Skeleton while loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Recent sales */}
      {!isLoading && recentSales.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-300">Recent Sales</h3>
            <Link href="/sold">
              <Button variant="ghost" size="sm">All <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
            </Link>
          </div>
          <div className="space-y-2">
            {recentSales.map(tx => <SoldCard key={tx.id} transaction={tx} />)}
          </div>
        </div>
      )}
    </div>
  )
}
