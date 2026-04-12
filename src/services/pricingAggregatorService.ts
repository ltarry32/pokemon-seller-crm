// =============================================================
// PRICING AGGREGATOR SERVICE
// Combines eBay + TCGPlayer + PriceCharting into one result
// Acts as the single interface for all pricing operations
// =============================================================

import type { PriceSnapshot, AggregatedPricing, InventoryItem } from '@/types';
import { getEbayPricing } from './ebayPricingService';
import { getTCGPlayerPricing } from './tcgplayerPricingService';

// ─── PriceCharting mock ───────────────────────────────────────
// TODO: Connect https://www.pricecharting.com/api/products?q={name}

async function getPriceChartingPricing(params: {
  inventory_item_id: string;
  card_name: string;
  set_name: string;
}): Promise<PriceSnapshot> {
  await new Promise(r => setTimeout(r, 400));

  const seed = params.card_name.length * 7 + params.set_name.length;
  const base = 15 + (seed % 85);

  return {
    id:                `pc-${Date.now()}`,
    inventory_item_id: params.inventory_item_id,
    source:            'PriceCharting',
    low_price:         parseFloat((base * 0.82).toFixed(2)),
    avg_price:         parseFloat((base * 0.95).toFixed(2)),
    high_price:        parseFloat((base * 1.15).toFixed(2)),
    sold_average:      parseFloat((base * 0.93).toFixed(2)),
    sales_count:       0,
    captured_at:       new Date().toISOString(),
  };
}

// ─── Core aggregation ─────────────────────────────────────────

export async function fetchAllPricing(item: InventoryItem): Promise<AggregatedPricing> {
  // Fetch from all sources in parallel
  const [ebaySold, tcgPlayer, priceCharting] = await Promise.allSettled([
    getEbayPricing({
      inventory_item_id: item.id,
      card_name: item.card_name,
      set_name: item.set_name,
      card_number: item.card_number,
      is_graded: item.is_graded,
      grade: item.grade ?? undefined,
    }),
    getTCGPlayerPricing({
      inventory_item_id: item.id,
      card_name: item.card_name,
      set_name: item.set_name,
      condition: item.condition,
    }),
    getPriceChartingPricing({
      inventory_item_id: item.id,
      card_name: item.card_name,
      set_name: item.set_name,
    }),
  ]);

  const snapshots: PriceSnapshot[] = [];

  if (ebaySold.status   === 'fulfilled') snapshots.push(ebaySold.value);
  if (tcgPlayer.status  === 'fulfilled') snapshots.push(tcgPlayer.value);
  if (priceCharting.status === 'fulfilled') snapshots.push(priceCharting.value);

  // Weighted best price (eBay sold comps are most reliable)
  const avgPrices = snapshots.map(s => s.avg_price).filter(p => p > 0);
  const best_price = avgPrices.length > 0
    ? avgPrices.reduce((sum, p) => sum + p, 0) / avgPrices.length
    : 0;

  const recommended_list_price = parseFloat((best_price * 1.05).toFixed(2));

  return {
    card_name: item.card_name,
    set_name:  item.set_name,
    card_number: item.card_number,
    snapshots,
    best_price: parseFloat(best_price.toFixed(2)),
    recommended_list_price,
    last_refreshed: new Date().toISOString(),
  };
}

// ─── Quick single-source lookup ───────────────────────────────

export async function fetchEbayOnlyPricing(item: InventoryItem): Promise<PriceSnapshot> {
  return getEbayPricing({
    inventory_item_id: item.id,
    card_name: item.card_name,
    set_name: item.set_name,
    card_number: item.card_number,
    is_graded: item.is_graded,
    grade: item.grade ?? undefined,
  });
}

// ─── Batch pricing refresh ────────────────────────────────────

export async function refreshPricingForInventory(
  items: InventoryItem[],
  onProgress?: (done: number, total: number) => void
): Promise<Map<string, AggregatedPricing>> {
  const results = new Map<string, AggregatedPricing>();
  let done = 0;

  // Process in batches of 3 to avoid rate limiting
  const batchSize = 3;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(item => fetchAllPricing(item)));

    batchResults.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        results.set(batch[idx].id, result.value);
      }
      done++;
      onProgress?.(done, items.length);
    });
  }

  return results;
}
