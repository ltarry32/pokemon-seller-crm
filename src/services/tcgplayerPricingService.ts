// =============================================================
// TCGPLAYER PRICING SERVICE
// Currently uses mock data. Connect TCGPlayer API here.
//
// TO CONNECT REAL API:
//   1. Apply for TCGPlayer API access at:
//      https://tcgplayer.com/massentry (or developer portal)
//   2. Get Client ID + Client Secret
//   3. Use OAuth2 client_credentials flow to get access token
//   4. Query: GET /pricing/product/{productId}
//   5. Add TCGPLAYER_CLIENT_ID and TCGPLAYER_CLIENT_SECRET to .env.local
// =============================================================

import type { PriceSnapshot } from '@/types';

interface TCGPlayerPrices {
  low:     number;
  mid:     number;
  high:    number;
  market:  number;
  direct:  number;
}

// ─── Mock implementation ──────────────────────────────────────

async function fetchTCGPlayerPrices(
  cardName: string,
  setName: string,
  condition: string
): Promise<TCGPlayerPrices> {
  // TODO: Replace with real TCGPlayer API
  // Step 1: Search for product ID
  //   GET https://api.tcgplayer.com/catalog/products?productName={cardName}&groupName={setName}
  // Step 2: Get pricing
  //   GET https://api.tcgplayer.com/pricing/product/{productId}

  await new Promise(r => setTimeout(r, 500));

  const seed = cardName.charCodeAt(0) * 2 + setName.charCodeAt(0);
  const base = 18 + (seed % 90);
  const condMulti = condition === 'Near Mint' ? 1 : condition === 'Lightly Played' ? 0.85 : 0.7;

  return {
    low:    parseFloat((base * condMulti * 0.88).toFixed(2)),
    mid:    parseFloat((base * condMulti).toFixed(2)),
    high:   parseFloat((base * condMulti * 1.18).toFixed(2)),
    market: parseFloat((base * condMulti * 0.96).toFixed(2)),
    direct: parseFloat((base * condMulti * 0.94).toFixed(2)),
  };
}

// ─── Public API ───────────────────────────────────────────────

export async function getTCGPlayerPricing(params: {
  inventory_item_id: string;
  card_name: string;
  set_name: string;
  condition: string;
}): Promise<PriceSnapshot> {
  const prices = await fetchTCGPlayerPrices(
    params.card_name,
    params.set_name,
    params.condition
  );

  return {
    id:                `tcg-${Date.now()}`,
    inventory_item_id: params.inventory_item_id,
    source:            'TCGPlayer',
    low_price:         prices.low,
    avg_price:         prices.market,
    high_price:        prices.high,
    sold_average:      prices.market,
    sales_count:       0, // TCGPlayer doesn't expose sales count directly
    captured_at:       new Date().toISOString(),
  };
}
