'use server'

// =============================================================
// SOLD TRANSACTIONS SERVER ACTIONS
// Net profit is always computed server-side from validated fields.
// Client cannot inject an inflated/manipulated net_profit value.
// =============================================================

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  soldTransactionSchema,
  type ActionResult,
} from '@/lib/validations'
import type { SoldTransactionRow } from '@/lib/supabase/database.types'

async function getAuthenticatedUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return { supabase, user }
}

// ─── CREATE ───────────────────────────────────────────────────

export async function createSoldTransaction(
  rawData: unknown
): Promise<ActionResult<SoldTransactionRow>> {
  const { supabase, user } = await getAuthenticatedUser()

  const parsed = soldTransactionSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { sold_price, fees, shipping_cost, packaging_cost, cost_basis } = parsed.data

  // SECURITY: net_profit is always computed server-side, never from client input
  const net_profit =
    sold_price - cost_basis - fees - shipping_cost - packaging_cost

  const { data, error } = await supabase
    .from('sold_transactions')
    .insert({
      ...parsed.data,
      user_id:    user.id,
      net_profit: parseFloat(net_profit.toFixed(2)),
    })
    .select()
    .single()

  if (error) {
    console.error('[createSoldTransaction]', error.message)
    return { success: false, error: 'Failed to record sale' }
  }

  // If linked to an inventory item, mark it as sold
  if (parsed.data.inventory_item_id) {
    await supabase
      .from('inventory_items')
      .update({ status: 'sold', updated_at: new Date().toISOString() })
      .eq('id', parsed.data.inventory_item_id)
      .eq('user_id', user.id)
  }

  revalidatePath('/sold')
  revalidatePath('/dashboard')
  revalidatePath('/analytics')
  return { success: true, data }
}

// ─── UPDATE ───────────────────────────────────────────────────

export async function updateSoldTransaction(
  id: string,
  rawData: unknown
): Promise<ActionResult<SoldTransactionRow>> {
  const { supabase, user } = await getAuthenticatedUser()

  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Invalid transaction ID' }
  }

  const parsed = soldTransactionSchema.partial().safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  // Re-compute net_profit from updated fields if any financials changed
  let netProfitUpdate: { net_profit?: number } = {}
  const hasFinancialChange = [
    'sold_price', 'fees', 'shipping_cost', 'packaging_cost', 'cost_basis',
  ].some(k => k in parsed.data)

  if (hasFinancialChange) {
    // Fetch current values to fill in any missing fields
    const { data: current } = await supabase
      .from('sold_transactions')
      .select('sold_price, fees, shipping_cost, packaging_cost, cost_basis')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (current) {
      const sp  = parsed.data.sold_price     ?? current.sold_price
      const f   = parsed.data.fees           ?? current.fees
      const sh  = parsed.data.shipping_cost  ?? current.shipping_cost
      const pk  = parsed.data.packaging_cost ?? current.packaging_cost
      const cb  = parsed.data.cost_basis     ?? current.cost_basis
      netProfitUpdate = { net_profit: parseFloat((sp - cb - f - sh - pk).toFixed(2)) }
    }
  }

  const { data, error } = await supabase
    .from('sold_transactions')
    .update({ ...parsed.data, ...netProfitUpdate })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('[updateSoldTransaction]', error.message)
    return { success: false, error: 'Failed to update transaction' }
  }

  revalidatePath('/sold')
  revalidatePath('/dashboard')
  revalidatePath('/analytics')
  return { success: true, data }
}

// ─── DELETE ───────────────────────────────────────────────────

export async function deleteSoldTransaction(
  id: string
): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser()

  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Invalid transaction ID' }
  }

  // Fetch the transaction first so we know which inventory item to revert.
  // Use .select('inventory_item_id') to minimise data transferred.
  const { data: tx, error: fetchError } = await supabase
    .from('sold_transactions')
    .select('inventory_item_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    console.error('[deleteSoldTransaction] fetch', fetchError.message)
    return { success: false, error: 'Transaction not found' }
  }

  // Delete the transaction
  const { error: deleteError } = await supabase
    .from('sold_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    console.error('[deleteSoldTransaction] delete', deleteError.message)
    return { success: false, error: 'Failed to delete transaction' }
  }

  // Revert the linked inventory item back to in_inventory.
  // Only runs when the sale was linked to a specific item.
  if (tx.inventory_item_id) {
    const { error: revertError } = await supabase
      .from('inventory_items')
      .update({ status: 'in_inventory', updated_at: new Date().toISOString() })
      .eq('id', tx.inventory_item_id)
      .eq('user_id', user.id) // RLS belt-and-suspenders
    if (revertError) {
      // Non-fatal: the sale is gone; log but don't surface to user
      console.error('[deleteSoldTransaction] revert inventory', revertError.message)
    }
  }

  revalidatePath('/sold')
  revalidatePath('/inventory')
  revalidatePath('/dashboard')
  revalidatePath('/analytics')
  return { success: true, data: undefined }
}
