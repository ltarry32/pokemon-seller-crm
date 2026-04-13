// =============================================================
// PRICING API ROUTE — server-side only
//
// SECURITY: External API keys (eBay, TCGPlayer, PriceCharting)
// are NEVER sent to the client. All API calls happen here.
// The client sends card details; this route returns pricing data.
//
// Authentication: Validates user session before fetching prices.
// Rate limiting: TODO — add upstash/redis rate limiting for production.
// =============================================================

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Input validation
const pricingRequestSchema = z.object({
  card_name:   z.string().min(1).max(200),
  set_name:    z.string().min(1).max(200),
  card_number: z.string().max(50).optional(),
  is_graded:   z.boolean().optional().default(false),
  grade:       z.string().max(20).optional(),
  condition:   z.string().max(50).optional().default('Near Mint'),
})

export async function POST(request: NextRequest) {
  // Authenticate the request
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse + validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = pricingRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { card_name, set_name, card_number, is_graded, grade, condition } = parsed.data

  // ── eBay Pricing ──────────────────────────────────────────────
  // TODO: Replace with real eBay API call
  // const EBAY_APP_ID = process.env.EBAY_APP_ID  ← never exposed to client
  // const response = await fetch(`https://svcs.ebay.com/services/search/FindingService/v1?...`)

  // ── TCGPlayer Pricing ─────────────────────────────────────────
  // TODO: Replace with real TCGPlayer API call
  // const TCGPLAYER_TOKEN = process.env.TCGPLAYER_CLIENT_SECRET ← never exposed

  // ── Mock response (remove when real APIs are connected) ───────
  const seed = card_name.charCodeAt(0) + set_name.length
  const base = 20 + (seed % 80)
  const gradedMult = is_graded ? 2.5 + (parseInt(grade ?? '9') - 8) * 0.8 : 1
  const conditionMult = condition === 'Near Mint' ? 1 : condition === 'Lightly Played' ? 0.85 : 0.7

  const mockPricing = {
    sources: [
      {
        source:      'eBay Sold',
        low_price:   parseFloat((base * gradedMult * conditionMult * 0.85).toFixed(2)),
        avg_price:   parseFloat((base * gradedMult * conditionMult).toFixed(2)),
        high_price:  parseFloat((base * gradedMult * conditionMult * 1.25).toFixed(2)),
        sold_average:parseFloat((base * gradedMult * conditionMult * 0.97).toFixed(2)),
        sales_count: Math.floor(5 + (seed % 40)),
      },
      {
        source:      'TCGPlayer',
        low_price:   parseFloat((base * gradedMult * conditionMult * 0.88).toFixed(2)),
        avg_price:   parseFloat((base * gradedMult * conditionMult * 1.02).toFixed(2)),
        high_price:  parseFloat((base * gradedMult * conditionMult * 1.18).toFixed(2)),
        sold_average:parseFloat((base * gradedMult * conditionMult * 0.96).toFixed(2)),
        sales_count: 0,
      },
    ],
    card_name,
    set_name,
    card_number:  card_number ?? null,
    captured_at:  new Date().toISOString(),
    is_mock:      true, // Remove this flag when real APIs are connected
  }

  // Save price snapshots to database (optional — for history tracking)
  // await supabase.from('price_snapshots').insert(...)

  return NextResponse.json(mockPricing)
}
