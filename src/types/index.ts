// =============================================================
// POKEMON SELLER CRM — Core Type Definitions
// Central source of truth for all data models
// =============================================================

// ─── Enums / Unions ──────────────────────────────────────────

export type CardCondition = 'Mint' | 'Near Mint' | 'Lightly Played' | 'Moderately Played' | 'Heavily Played' | 'Damaged';
export type CardLanguage = 'English' | 'Japanese' | 'Korean' | 'Chinese' | 'German' | 'French' | 'Spanish' | 'Italian' | 'Portuguese';
export type CardRarity = 'Common' | 'Uncommon' | 'Rare' | 'Holo Rare' | 'Reverse Holo' | 'Ultra Rare' | 'Secret Rare' | 'Rainbow Rare' | 'Gold Rare' | 'Promo' | 'Illustration Rare' | 'Special Illustration Rare' | 'Hyper Rare';
export type ItemStatus = 'in_inventory' | 'listed' | 'sold' | 'pending' | 'damaged';
export type GradingCompany = 'PSA' | 'BGS' | 'CGC' | 'SGC' | 'ACE' | 'HGA' | 'Other';
export type SalePlatform = 'eBay' | 'TCGPlayer' | 'Facebook Marketplace' | 'Card Show' | 'Local' | 'Whatnot' | 'Instagram' | 'Mercari' | 'Other';
export type PaymentMethod = 'PayPal' | 'Venmo' | 'Cash' | 'Credit Card' | 'Zelle' | 'Bank Transfer' | 'Other';
export type PricingSource = 'eBay Sold' | 'eBay Active' | 'TCGPlayer' | 'PriceCharting' | 'Manual';
export type IntegrationProvider = 'ebay' | 'tcgplayer' | 'pricecharting' | 'pokemon_tcg_api';

// ─── Profile ─────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  business_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Inventory Item ──────────────────────────────────────────

export interface InventoryItem {
  id: string;
  user_id: string;
  card_name: string;
  set_name: string;
  card_number: string;
  rarity: CardRarity | null;
  language: CardLanguage;
  condition: CardCondition;
  is_graded: boolean;
  grade: string | null;           // e.g. "9.5", "10"
  grading_company: GradingCompany | null;
  quantity: number;
  cost_basis: number;             // what you paid
  current_market_price: number;   // live price
  list_price: number | null;      // your asking price
  min_price: number | null;       // floor / break-even + margin
  storage_location: string | null;
  status: ItemStatus;
  source: string | null;          // where you bought it
  purchase_date: string | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Computed helpers (client-side only)
export interface InventoryItemWithMetrics extends InventoryItem {
  unrealized_profit: number;
  roi_percent: number;
  profit_margin_percent: number;
}

// ─── Price Snapshot ──────────────────────────────────────────

export interface PriceSnapshot {
  id: string;
  inventory_item_id: string;
  source: PricingSource;
  low_price: number;
  avg_price: number;
  high_price: number;
  sold_average: number;
  sales_count: number;
  captured_at: string;
}

// ─── Aggregated Pricing ──────────────────────────────────────

export interface AggregatedPricing {
  card_name: string;
  set_name: string;
  card_number: string;
  snapshots: PriceSnapshot[];
  best_price: number;
  recommended_list_price: number;
  last_refreshed: string;
}

// ─── Sold Transaction ────────────────────────────────────────

export interface SoldTransaction {
  id: string;
  user_id: string;
  inventory_item_id: string | null;
  // Denormalized card info (in case item is deleted)
  card_name: string;
  set_name: string;
  card_number: string;
  condition: CardCondition;
  is_graded: boolean;
  grade: string | null;
  image_url: string | null;
  // Sale details
  sold_price: number;
  platform: SalePlatform;
  buyer_name: string | null;
  fees: number;
  shipping_cost: number;
  packaging_cost: number;
  cost_basis: number;
  net_profit: number;
  payment_method: PaymentMethod;
  tracking_number: string | null;
  date_sold: string;
  notes: string | null;
  created_at: string;
}

// ─── Fee Profile ─────────────────────────────────────────────

export interface FeeProfile {
  id: string;
  user_id: string;
  name: string;
  platform: SalePlatform | 'Custom';
  fee_percent: number;
  processing_percent: number;
  fixed_fee: number;
  created_at: string;
}

// ─── Fee Calculator ──────────────────────────────────────────

export interface FeeCalculatorInput {
  sale_price: number;
  shipping_charged: number;
  sales_tax: number;
  platform_fee_percent: number;
  processing_fee_percent: number;
  fixed_fee: number;
  shipping_cost_seller: number;
  packaging_cost: number;
  cost_basis: number;
}

export interface FeeCalculatorOutput {
  gross_revenue: number;
  platform_fee_amount: number;
  processing_fee_amount: number;
  fixed_fee_amount: number;
  total_fees: number;
  total_expenses: number;
  net_payout: number;
  net_profit: number;
  profit_margin_percent: number;
  roi_percent: number;
}

// ─── Integration ─────────────────────────────────────────────

export interface Integration {
  id: string;
  user_id: string;
  provider: IntegrationProvider;
  is_connected: boolean;
  api_key_placeholder: string | null;
  display_name: string;
  created_at: string;
  updated_at: string;
}

// ─── Scan History ────────────────────────────────────────────

export interface ScanHistoryEntry {
  id: string;
  user_id: string;
  scan_type: 'barcode' | 'image' | 'manual';
  raw_scan_data: string | null;
  identified_name: string | null;
  identified_set: string | null;
  identified_number: string | null;
  confidence_score: number | null;   // 0–1, for future OCR integration
  created_at: string;
}

// ─── Analytics ───────────────────────────────────────────────

export interface DashboardKPIs {
  total_inventory_value: number;     // sum of current_market_price × qty
  total_cost_basis: number;          // sum of cost_basis × qty
  total_unrealized_profit: number;
  total_realized_profit: number;
  total_revenue: number;
  total_fees_paid: number;
  total_shipping_paid: number;
  item_count: number;
  sold_count: number;
  avg_roi_percent: number;
  best_card: InventoryItem | null;
  worst_card: InventoryItem | null;
}

export interface MonthlyTrend {
  month: string;       // "2025-01"
  revenue: number;
  profit: number;
  cost: number;
  sales_count: number;
}

export interface SetPerformance {
  set_name: string;
  total_cost: number;
  total_value: number;
  total_profit: number;
  item_count: number;
  roi_percent: number;
}

// ─── UI State ────────────────────────────────────────────────

export type SortOption = 'newest' | 'oldest' | 'highest_value' | 'highest_profit' | 'alphabetical' | 'lowest_cost';

export interface InventoryFilters {
  search: string;
  /** 'active' = all statuses except sold (the default view) */
  status: ItemStatus | 'all' | 'active';
  is_graded: boolean | null;
  rarity: CardRarity | 'all';
  condition: CardCondition | 'all';
  set_name: string | 'all';
  sort: SortOption;
}

export interface SoldLogFilters {
  search: string;
  platform: SalePlatform | 'all';
  date_from: string | null;
  date_to: string | null;
  sort: 'newest' | 'highest_profit' | 'highest_sale';
}

// ─── Scanner Flow ────────────────────────────────────────────

export type ScanStep = 'ready' | 'scanning' | 'processing' | 'result' | 'confirm' | 'add';

export interface ScanResult {
  card_name: string;
  set_name: string;
  card_number: string;
  rarity: CardRarity | null;
  image_url: string | null;
  confidence: number;
  price_estimate: number | null;
}
