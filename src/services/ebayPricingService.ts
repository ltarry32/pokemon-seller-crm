// =============================================================
// EBAY PRICING SERVICE
// Currently uses mock data. Connect eBay Finding API / Browse API here.
//
// TO CONNECT REAL API:
//   1. Register app at https://developer.ebay.com
//   2. Get App ID (Client ID)
//   3. Use Finding API for sold comps (findCompletedItems)
//   4. Use Browse API for active listings
//   5. Replace mock functions below with real fetch calls
//   6. Add EBAY_APP_ID to .env.local
// =============================================================

import type { PriceSnapshot } from '@/types';

interface EbaySoldResult {
  low_price: number;
  avg_price: number;
  high_price: number;
  sold_average: number;
  sales_count: number;
  captured_at: string;
}

// ─── Mock implementation ──────────────────────────────────────

async function fetchSoldListings(
  cardName: string,
  setName: string,
  cardNumber: string,
  isGraded: boolean,
  grade?: string
): Promise<EbaySoldResult> {
  // TODO: Replace with real eBay Finding API call
  // Endpoint: https://svcs.ebay.com/services/search/FindingService/v1
  // Operation: findCompletedItems
  // Params: keywords, categoryId=2536 (Non-Sport Trading Cards), itemFilter sold=true
  //
  // Example real call structure:
  // const query = `${cardName} ${setName} ${cardNumber} ${isGraded ? `PSA ${grade}` : ''}`;
  // const response = await fetch(`https://svcs.ebay.com/services/search/FindingService/v1?...`);

  await new Promise(r => setTimeout(r, 600)); // simulate network

  // Simulated price variance based on card name hash
  const seed = cardName.charCodeAt(0) + setName.length;
  const base = 20 + (seed % 80);
  const gradedMult = isGraded ? 2.5 + (parseInt(grade ?? '9') - 8) * 0.8 : 1;

  return {
    low_price:    parseFloat((base * gradedMult * 0.85).toFixed(2)),
    avg_price:    parseFloat((base * gradedMult).toFixed(2)),
    high_price:   parseFloat((base * gradedMult * 1.25).toFixed(2)),
    sold_average: parseFloat((base * gradedMult * 0.97).toFixed(2)),
    sales_count:  Math.floor(5 + (seed % 40)),
    captured_at:  new Date().toISOString(),
  };
}

async function fetchActiveListings(
  cardName: string,
  setName: string,
  cardNumber: string
): Promise<{ lowest_active: number; median_active: number }> {
  // TODO: Replace with eBay Browse API
  // Endpoint: https://api.ebay.com/buy/browse/v1/item_summary/search
  // Params: q, category_ids=183454, filter=buyingOptions:{FIXED_PRICE}
  //
  // Requires OAuth token — see eBay developer portal

  await new Promise(r => setTimeout(r, 400));
  const seed = cardName.charCodeAt(1) + cardNumber.length;
  const base = 22 + (seed % 75);
  return {
    lowest_active: parseFloat((base * 0.90).toFixed(2)),
    median_active: parseFloat((base * 1.05).toFixed(2)),
  };
}

// ─── Public API ───────────────────────────────────────────────

export async function getEbayPricing(params: {
  inventory_item_id: string;
  card_name: string;
  set_name: string;
  card_number: string;
  is_graded: boolean;
  grade?: string;
}): Promise<PriceSnapshot> {
  const sold = await fetchSoldListings(
    params.card_name,
    params.set_name,
    params.card_number,
    params.is_graded,
    params.grade
  );

  return {
    id:                  `ebay-${Date.now()}`,
    inventory_item_id:   params.inventory_item_id,
    source:              'eBay Sold',
    low_price:           sold.low_price,
    avg_price:           sold.avg_price,
    high_price:          sold.high_price,
    sold_average:        sold.sold_average,
    sales_count:         sold.sales_count,
    captured_at:         sold.captured_at,
  };
}

export async function getEbayActivePricing(params: {
  inventory_item_id: string;
  card_name: string;
  set_name: string;
  card_number: string;
}): Promise<{ lowest_active: number; median_active: number }> {
  return fetchActiveListings(params.card_name, params.set_name, params.card_number);
}
