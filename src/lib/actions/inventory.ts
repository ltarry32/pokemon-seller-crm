'use server'

// =============================================================
// INVENTORY SERVER ACTIONS
// All mutations run server-side. RLS enforces user_id isolation.
// Zod validates every input before any DB write.
//
// SECURITY:
// - auth.getUser() validates JWT with Supabase (not just cookie read)
// - user_id is injected server-side — client cannot spoof it
// - Zod prevents malformed or oversized data from reaching Supabase
// - RLS policies provide a second layer of protection
// =============================================================

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  inventoryItemSchema,
  inventoryItemUpdateSchema,
  type ActionResult,
} from '@/lib/validations'
import type { InventoryItemRow } from '@/lib/supabase/database.types'
import { calcProfit } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────

async function getAuthenticatedUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return { supabase, user }
}

// ─── CREATE ───────────────────────────────────────────────────

export async function createInventoryItem(
  rawData: unknown
): Promise<ActionResult<InventoryItemRow>> {
  const { supabase, user } = await getAuthenticatedUser()

  const parsed = inventoryItemSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const insertPayload = {
  ...parsed.data,
  user_id: user.id,
  updated_at: new Date().toISOString(),
}

const { data, error } = await supabase
  .from('inventory_items')
  .insert([insertPayload] as any)
    .select()
    .single()

  if (error) {
    console.error('[createInventoryItem]', error.message)
    return { success: false, error: 'Failed to create inventory item' }
  }

  revalidatePath('/inventory')
  revalidatePath('/dashboard')
  return { success: true, data }
}

// ─── UPDATE ───────────────────────────────────────────────────

export async function updateInventoryItem(
  id: string,
  rawData: unknown
): Promise<ActionResult<InventoryItemRow>> {
  const { supabase, user } = await getAuthenticatedUser()

  // Basic ID validation
  if (!id || typeof id !== 'string' || id.length > 36) {
    return { success: false, error: 'Invalid item ID' }
  }

  const parsed = inventoryItemUpdateSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  // RLS will also block non-owners, but check explicitly for a better error msg
  const updatePayload = {
  ...parsed.data,
  updated_at: new Date().toISOString(),
}

const { data, error } = await (supabase
  .from('inventory_items') as any)
  .update(updatePayload)
  .eq('id', id)
  .eq('user_id', user.id)
  .select()
  .single()

  if (error) {
    console.error('[updateInventoryItem]', error.message)
    return { success: false, error: 'Failed to update item' }
  }

  revalidatePath('/inventory')
  revalidatePath(`/inventory/${id}`)
  revalidatePath('/dashboard')
  return { success: true, data }
}

// ─── DELETE ───────────────────────────────────────────────────

export async function deleteInventoryItem(
  id: string
): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser()

  if (!id || typeof id !== 'string') {
    return { success: false, error: 'Invalid item ID' }
  }

  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)  // Extra guard alongside RLS

  if (error) {
    console.error('[deleteInventoryItem]', error.message)
    return { success: false, error: 'Failed to delete item' }
  }

  revalidatePath('/inventory')
  revalidatePath('/dashboard')
  return { success: true, data: undefined }
}

// ─── MARK AS SOLD ─────────────────────────────────────────────

export async function markInventoryItemAsSold(
  id: string
): Promise<ActionResult<InventoryItemRow>> {
  return updateInventoryItem(id, { status: 'sold' })
}

// ─── UPDATE MARKET PRICE ──────────────────────────────────────

export async function updateMarketPrice(
  id: string,
  price: number
): Promise<ActionResult<InventoryItemRow>> {
  if (typeof price !== 'number' || price < 0 || price > 999999) {
    return { success: false, error: 'Invalid price value' }
  }
  return updateInventoryItem(id, { current_market_price: price })
}
