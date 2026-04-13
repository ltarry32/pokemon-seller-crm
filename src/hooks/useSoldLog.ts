'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  createSoldTransaction,
  updateSoldTransaction,
  deleteSoldTransaction,
} from '@/lib/actions/sold'
import type { SoldTransactionRow } from '@/lib/supabase/database.types'
import type { SoldTransactionInput } from '@/lib/validations'
import toast from 'react-hot-toast'

export const SOLD_QUERY_KEY = ['sold_transactions'] as const

// ─── Fetch all sold transactions ──────────────────────────────

export function useSoldTransactions() {
  const supabase = createClient()

  return useQuery<SoldTransactionRow[]>({
    queryKey: SOLD_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sold_transactions')
        .select('*')
        .order('date_sold', { ascending: false })

      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

// ─── Create sold transaction ─────────────────────────────────

export function useCreateSoldTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SoldTransactionInput) => createSoldTransaction(data),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error)
        return
      }
      queryClient.invalidateQueries({ queryKey: SOLD_QUERY_KEY })
      // Also refresh inventory since item may have been marked sold
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Sale recorded!')
    },
    onError: () => toast.error('Something went wrong. Please try again.'),
  })
}

// ─── Update sold transaction ──────────────────────────────────

export function useUpdateSoldTransaction(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<SoldTransactionInput>) =>
      updateSoldTransaction(id, data),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error)
        return
      }
      queryClient.invalidateQueries({ queryKey: SOLD_QUERY_KEY })
    },
    onError: () => toast.error('Update failed.'),
  })
}

// ─── Delete sold transaction ──────────────────────────────────

export function useDeleteSoldTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSoldTransaction(id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error)
        return
      }
      queryClient.invalidateQueries({ queryKey: SOLD_QUERY_KEY })
      toast.success('Sale deleted')
    },
    onError: () => toast.error('Delete failed.'),
  })
}

// ─── Computed KPIs (client-side, from cached data) ───────────

export function useSalesKPIs(transactions: SoldTransactionRow[]) {
  const totalRevenue  = transactions.reduce((s, t) => s + t.sold_price, 0)
  const totalProfit   = transactions.reduce((s, t) => s + (t.net_profit ?? 0), 0)
  const totalFees     = transactions.reduce((s, t) => s + t.fees, 0)
  const totalShipping = transactions.reduce((s, t) => s + t.shipping_cost, 0)
  const totalCost     = transactions.reduce((s, t) => s + t.cost_basis, 0)

  return {
    totalRevenue,
    totalProfit,
    totalFees,
    totalShipping,
    totalCost,
    profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    avgProfit:    transactions.length > 0 ? totalProfit / transactions.length : 0,
    salesCount:   transactions.length,
  }
}
