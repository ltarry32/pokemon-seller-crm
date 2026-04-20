'use client'

// =============================================================
// INVENTORY HOOKS — React Query + Supabase
// Reads use the browser client (anon key + RLS).
// Writes go through server actions (validated server-side).
// =============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  markInventoryItemAsSold,
} from '@/lib/actions/inventory'
import type { InventoryItemRow } from '@/lib/supabase/database.types'
import type { InventoryItemInput, InventoryItemUpdateInput } from '@/lib/validations'
import toast from 'react-hot-toast'

export const INVENTORY_QUERY_KEY = ['inventory'] as const

// ─── Fetch all inventory items for the current user ───────────

export function useInventoryItems() {
  const supabase = createClient()

  return useQuery<InventoryItemRow[]>({
    queryKey: INVENTORY_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false })
        // Safety limit: prevents unbounded payloads as inventory grows.
        // At >500 items, paginate instead of loading the full list.
        // TODO: replace with cursor-based pagination when users approach this limit.
        .limit(500)

      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

// ─── Fetch a single inventory item ───────────────────────────

export function useInventoryItem(id: string) {
  const supabase = createClient()

  return useQuery<InventoryItemRow | null>({
    queryKey: [...INVENTORY_QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw new Error(error.message)
      }
      return data
    },
    enabled: !!id,
  })
}

// ─── Create ───────────────────────────────────────────────────

export function useCreateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InventoryItemInput) => createInventoryItem(data),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error)
        return
      }
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      toast.success('Card added to inventory!')
    },
    onError: () => toast.error('Something went wrong. Please try again.'),
  })
}

// ─── Update ───────────────────────────────────────────────────

export function useUpdateInventoryItem(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InventoryItemUpdateInput) => updateInventoryItem(id, data),
    onMutate: async (newData) => {
      // Optimistic update — immediately reflect change in UI
      await queryClient.cancelQueries({ queryKey: [...INVENTORY_QUERY_KEY, id] })
      const previous = queryClient.getQueryData<InventoryItemRow>([...INVENTORY_QUERY_KEY, id])
      queryClient.setQueryData([...INVENTORY_QUERY_KEY, id], (old: InventoryItemRow) => ({
        ...old,
        ...newData,
      }))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      // Roll back optimistic update on failure
      if (context?.previous) {
        queryClient.setQueryData([...INVENTORY_QUERY_KEY, id], context.previous)
      }
      toast.error('Update failed. Please try again.')
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error)
        return
      }
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
    },
  })
}

// ─── Delete ───────────────────────────────────────────────────

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error)
        return
      }
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      toast.success('Card deleted')
    },
    onError: () => toast.error('Delete failed. Please try again.'),
  })
}

// ─── Mark as sold ─────────────────────────────────────────────

export function useMarkAsSold() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markInventoryItemAsSold(id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error)
        return
      }
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
    },
    onError: () => toast.error('Could not mark as sold.'),
  })
}
