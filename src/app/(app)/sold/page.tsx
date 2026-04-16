'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, TrendingUp, X } from 'lucide-react'
import { useSoldTransactions, useSalesKPIs, useDeleteSoldTransaction } from '@/hooks/useSoldLog'
import { useAppStore } from '@/stores/appStore'
import { SoldCard } from '@/components/sold/SoldCard'
import { AddSaleForm } from '@/components/sold/AddSaleForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState, CardSkeleton } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/Card'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { SoldTransactionRow } from '@/lib/supabase/database.types'

export default function SoldPage() {
  const { data: transactions = [], isLoading, error } = useSoldTransactions()
  const { mutate: deleteTransaction } = useDeleteSoldTransaction()
  const { soldLogFilters, setSoldLogFilters } = useAppStore()
  const [showAddSale, setShowAddSale] = useState(false)

  const filtered = useMemo(() => {
    let result: SoldTransactionRow[] = [...transactions]

    if (soldLogFilters.search) {
      const q = soldLogFilters.search.toLowerCase()
      result = result.filter(t =>
        t.card_name.toLowerCase().includes(q) ||
        t.set_name?.toLowerCase().includes(q) ||
        t.buyer_name?.toLowerCase().includes(q) ||
        t.platform?.toLowerCase().includes(q)
      )
    }

    if (soldLogFilters.platform !== 'all') {
      result = result.filter(t => t.platform === soldLogFilters.platform)
    }

    if (soldLogFilters.sort === 'newest')        result.sort((a, b) => new Date(b.date_sold).getTime() - new Date(a.date_sold).getTime())
    if (soldLogFilters.sort === 'highest_profit') result.sort((a, b) => (b.net_profit ?? 0) - (a.net_profit ?? 0))
    if (soldLogFilters.sort === 'highest_sale')   result.sort((a, b) => b.sold_price - a.sold_price)

    return result
  }, [transactions, soldLogFilters])

  const kpis = useSalesKPIs(filtered)

  return (
    <div className="page-container space-y-4 animate-fade-in">
      <PageHeader
        title="Sold Log"
        subtitle={isLoading ? 'Loading...' : `${filtered.length} completed sales`}
        actions={
          <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAddSale(true)}>
            Log Sale
          </Button>
        }
      />

      {/* KPI strip */}
      {!isLoading && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Profit" value={formatCurrency(kpis.totalProfit, 0)} sub={`${kpis.salesCount} sales`}
            trend={kpis.totalProfit >= 0 ? 'up' : 'down'} icon={<TrendingUp className="w-5 h-5 text-profit" />} highlight />
          <StatCard label="Revenue" value={formatCurrency(kpis.totalRevenue, 0)} sub={`${formatPercent(kpis.profitMargin)} margin`} trend="up" />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Search sales..."
          value={soldLogFilters.search}
          onChange={e => setSoldLogFilters({ search: e.target.value })}
          leftIcon={<Search className="w-4 h-4" />}
          rightIcon={soldLogFilters.search ? (
            <button onClick={() => setSoldLogFilters({ search: '' })} className="pointer-events-auto"><X className="w-3.5 h-3.5" /></button>
          ) : undefined}
          containerClassName="flex-1 min-w-40"
        />
        <select value={soldLogFilters.platform} onChange={e => setSoldLogFilters({ platform: e.target.value as typeof soldLogFilters.platform })}
          className="h-10 px-3 rounded-xl bg-surface-2 border border-zinc-700 text-sm text-zinc-300 focus:outline-none focus:border-brand-500">
          <option value="all">All Platforms</option>
          <option value="eBay">eBay</option>
          <option value="TCGPlayer">TCGPlayer</option>
          <option value="Facebook Marketplace">Facebook</option>
          <option value="Card Show">Card Show</option>
          <option value="Whatnot">Whatnot</option>
          <option value="Local">Local</option>
        </select>
        <select value={soldLogFilters.sort} onChange={e => setSoldLogFilters({ sort: e.target.value as typeof soldLogFilters.sort })}
          className="h-10 px-3 rounded-xl bg-surface-2 border border-zinc-700 text-sm text-zinc-300 focus:outline-none focus:border-brand-500">
          <option value="newest">Newest</option>
          <option value="highest_profit">Most Profit</option>
          <option value="highest_sale">Highest Sale</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-sm text-red-300">
          Failed to load sales. Please refresh.
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState
          icon="🏷️"
          title={
            soldLogFilters.search || soldLogFilters.platform !== 'all'
              ? 'No results found'
              : 'No sales recorded yet'
          }
          description={
            soldLogFilters.search || soldLogFilters.platform !== 'all'
              ? 'Try adjusting your search or platform filter.'
              : 'Log your first completed sale to start tracking revenue and profit.'
          }
          action={
            !soldLogFilters.search && soldLogFilters.platform === 'all'
              ? { label: 'Log a Sale', onClick: () => setShowAddSale(true) }
              : undefined
          }
        />
      )}

      {/* List */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(tx => (
            <SoldCard
              key={tx.id}
              transaction={tx}
              onDelete={() => deleteTransaction(tx.id)}
            />
          ))}
        </div>
      )}

      {/* Add sale modal */}
      <Modal isOpen={showAddSale} onClose={() => setShowAddSale(false)} title="Log a Sale" subtitle="Record a completed transaction" size="lg">
        <AddSaleForm onSuccess={() => setShowAddSale(false)} />
      </Modal>
    </div>
  )
}
