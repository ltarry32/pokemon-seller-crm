// =============================================================
// MOCK PRICING DATA — Realistic comps for demo mode
// Replace with real API calls in production
// =============================================================

import type { PriceSnapshot, AggregatedPricing, PricingSource } from '@/types';

// ─── Raw snapshots (multi-source) ────────────────────────────

// Re-export core types for convenience
export type { AggregatedPricing, PriceSnapshot } from '@/types';

export const MOCK_PRICE_SNAPSHOTS: PriceSnapshot[] = [
  // Charizard ex - Obsidian Flames
  { id: 'ps-001', inventory_item_id: 'inv-001', source: 'eBay Sold',   low_price: 36.00, avg_price: 42.50, high_price: 52.00, sold_average: 42.50, sales_count: 24, captured_at: '2025-01-07T08:00:00Z' },
  { id: 'ps-002', inventory_item_id: 'inv-001', source: 'TCGPlayer',   low_price: 38.00, avg_price: 44.00, high_price: 50.00, sold_average: 43.00, sales_count: 0,  captured_at: '2025-01-07T08:00:00Z' },
  { id: 'ps-003', inventory_item_id: 'inv-001', source: 'PriceCharting',low_price: 35.00, avg_price: 41.00, high_price: 48.00, sold_average: 41.00, sales_count: 0,  captured_at: '2025-01-07T08:00:00Z' },
  // Pikachu ex - Paldean Fates PSA 10
  { id: 'ps-004', inventory_item_id: 'inv-002', source: 'eBay Sold',   low_price: 120.00, avg_price: 145.00, high_price: 175.00, sold_average: 145.00, sales_count: 9,  captured_at: '2025-01-07T08:00:00Z' },
  { id: 'ps-005', inventory_item_id: 'inv-002', source: 'TCGPlayer',   low_price: 0, avg_price: 0, high_price: 0, sold_average: 0, sales_count: 0, captured_at: '2025-01-07T08:00:00Z' },
  // Umbreon VMAX
  { id: 'ps-006', inventory_item_id: 'inv-003', source: 'eBay Sold',   low_price: 98.00, avg_price: 115.00, high_price: 145.00, sold_average: 115.00, sales_count: 18, captured_at: '2025-01-07T08:00:00Z' },
  { id: 'ps-007', inventory_item_id: 'inv-003', source: 'TCGPlayer',   low_price: 105.00, avg_price: 118.00, high_price: 140.00, sold_average: 115.00, sales_count: 0,  captured_at: '2025-01-07T08:00:00Z' },
  { id: 'ps-008', inventory_item_id: 'inv-003', source: 'PriceCharting',low_price: 100.00, avg_price: 112.00, high_price: 135.00, sold_average: 112.00, sales_count: 0,  captured_at: '2025-01-07T08:00:00Z' },
];

// ─── Aggregated pricing cards ─────────────────────────────────

export const MOCK_AGGREGATED_PRICING: AggregatedPricing[] = [
  {
    card_name: 'Charizard ex',
    set_name: 'Obsidian Flames',
    card_number: '125/197',
    snapshots: MOCK_PRICE_SNAPSHOTS.filter(s => ['ps-001','ps-002','ps-003'].includes(s.id)),
    best_price: 42.50,
    recommended_list_price: 44.99,
    last_refreshed: '2025-01-07T08:00:00Z',
  },
  {
    card_name: 'Pikachu ex (PSA 10)',
    set_name: 'Paldean Fates',
    card_number: '30/91',
    snapshots: MOCK_PRICE_SNAPSHOTS.filter(s => ['ps-004','ps-005'].includes(s.id)),
    best_price: 145.00,
    recommended_list_price: 149.99,
    last_refreshed: '2025-01-07T08:00:00Z',
  },
  {
    card_name: 'Umbreon VMAX (Alt Art)',
    set_name: 'Evolving Skies',
    card_number: '215/203',
    snapshots: MOCK_PRICE_SNAPSHOTS.filter(s => ['ps-006','ps-007','ps-008'].includes(s.id)),
    best_price: 115.00,
    recommended_list_price: 119.99,
    last_refreshed: '2025-01-07T08:00:00Z',
  },
  {
    card_name: 'Iono (SIR)',
    set_name: 'Paldea Evolved',
    card_number: '185/193',
    snapshots: [
      { id: 'ps-009', inventory_item_id: 'inv-005', source: 'eBay Sold',    low_price: 75.00, avg_price: 88.00, high_price: 105.00, sold_average: 88.00, sales_count: 32, captured_at: '2025-01-07T08:00:00Z' },
      { id: 'ps-010', inventory_item_id: 'inv-005', source: 'TCGPlayer',    low_price: 82.00, avg_price: 90.00, high_price: 100.00, sold_average: 88.00, sales_count: 0,  captured_at: '2025-01-07T08:00:00Z' },
      { id: 'ps-011', inventory_item_id: 'inv-005', source: 'PriceCharting',low_price: 72.00, avg_price: 85.00, high_price: 98.00,  sold_average: 85.00, sales_count: 0,  captured_at: '2025-01-07T08:00:00Z' },
    ],
    best_price: 88.00,
    recommended_list_price: 89.99,
    last_refreshed: '2025-01-07T08:00:00Z',
  },
  {
    card_name: 'Miriam (SIR)',
    set_name: 'Scarlet & Violet 151',
    card_number: '182/165',
    snapshots: [
      { id: 'ps-012', inventory_item_id: 'inv-010', source: 'eBay Sold',    low_price: 82.00, avg_price: 95.00, high_price: 115.00, sold_average: 95.00, sales_count: 14, captured_at: '2025-01-07T08:00:00Z' },
      { id: 'ps-013', inventory_item_id: 'inv-010', source: 'TCGPlayer',    low_price: 88.00, avg_price: 98.00, high_price: 110.00, sold_average: 95.00, sales_count: 0,  captured_at: '2025-01-07T08:00:00Z' },
    ],
    best_price: 95.00,
    recommended_list_price: 97.99,
    last_refreshed: '2025-01-07T08:00:00Z',
  },
  {
    card_name: 'Lugia V',
    set_name: 'Silver Tempest',
    card_number: '138/195',
    snapshots: [
      { id: 'ps-014', inventory_item_id: 'inv-004', source: 'eBay Sold',    low_price: 18.00, avg_price: 22.00, high_price: 28.00, sold_average: 22.00, sales_count: 41, captured_at: '2025-01-07T08:00:00Z' },
      { id: 'ps-015', inventory_item_id: 'inv-004', source: 'TCGPlayer',    low_price: 19.00, avg_price: 23.00, high_price: 27.00, sold_average: 22.50, sales_count: 0,  captured_at: '2025-01-07T08:00:00Z' },
    ],
    best_price: 22.00,
    recommended_list_price: 23.99,
    last_refreshed: '2025-01-07T08:00:00Z',
  },
];

// ─── Trending / hot cards ─────────────────────────────────────

export interface TrendingCard {
  card_name: string;
  set_name: string;
  card_number: string;
  current_price: number;
  price_change_7d: number;   // dollar change
  price_change_pct: number;  // percent change
  trend: 'up' | 'down' | 'stable';
  volume_7d: number;         // sales in last 7 days
}

export const MOCK_TRENDING_CARDS: TrendingCard[] = [
  { card_name: 'Charizard ex', set_name: 'Obsidian Flames', card_number: '125/197', current_price: 42.50, price_change_7d: 4.50, price_change_pct: 11.8, trend: 'up',   volume_7d: 312 },
  { card_name: 'Iono (SIR)',   set_name: 'Paldea Evolved',  card_number: '185/193', current_price: 88.00, price_change_7d: 6.00, price_change_pct: 7.3,  trend: 'up',   volume_7d: 218 },
  { card_name: 'Pikachu ex',   set_name: 'Paldean Fates',   card_number: '30/91',   current_price: 28.00, price_change_7d: -2.00, price_change_pct: -6.7, trend: 'down', volume_7d: 445 },
  { card_name: 'Umbreon ex SIR', set_name: 'Prismatic Evolutions', card_number: '238/131', current_price: 185.00, price_change_7d: 22.00, price_change_pct: 13.5, trend: 'up', volume_7d: 189 },
  { card_name: 'Gardevoir ex', set_name: 'Scarlet & Violet', card_number: '245/198', current_price: 55.00, price_change_7d: -1.00, price_change_pct: -1.8, trend: 'stable', volume_7d: 155 },
  { card_name: 'Lugia VSTAR Alt Art', set_name: 'Silver Tempest', card_number: '211/195', current_price: 115.00, price_change_7d: 8.00, price_change_pct: 7.5, trend: 'up', volume_7d: 97 },
];
