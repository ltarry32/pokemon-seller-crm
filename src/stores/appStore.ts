// =============================================================
// APP STORE — Zustand global state
// Manages inventory, sold log, and UI state
// =============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { InventoryItem, SoldTransaction, FeeProfile, InventoryFilters, SoldLogFilters } from '@/types';
import { MOCK_INVENTORY } from '@/data/mockInventory';
import { MOCK_SOLD_TRANSACTIONS } from '@/data/mockSoldTransactions';

// ─── Default fee profiles (platform presets) ──────────────────

const DEFAULT_FEE_PROFILES: FeeProfile[] = [
  { id: 'fp-ebay',    user_id: 'demo', name: 'eBay Standard',     platform: 'eBay',       fee_percent: 13.25, processing_percent: 0, fixed_fee: 0,    created_at: '' },
  { id: 'fp-tcg',     user_id: 'demo', name: 'TCGPlayer Standard', platform: 'TCGPlayer',  fee_percent: 10.25, processing_percent: 0, fixed_fee: 0,    created_at: '' },
  { id: 'fp-paypal',  user_id: 'demo', name: 'PayPal G&S',         platform: 'Other',      fee_percent: 0,     processing_percent: 3.49, fixed_fee: 0.49, created_at: '' },
  { id: 'fp-whatnot', user_id: 'demo', name: 'Whatnot',            platform: 'Whatnot',    fee_percent: 10.0,  processing_percent: 0, fixed_fee: 0,    created_at: '' },
  { id: 'fp-custom',  user_id: 'demo', name: 'Custom',             platform: 'Custom',     fee_percent: 0,     processing_percent: 0, fixed_fee: 0,    created_at: '' },
];

// ─── Default filters ──────────────────────────────────────────

const DEFAULT_INV_FILTERS: InventoryFilters = {
  search: '',
  status: 'all',
  is_graded: null,
  rarity: 'all',
  condition: 'all',
  set_name: 'all',
  sort: 'newest',
};

const DEFAULT_SOLD_FILTERS: SoldLogFilters = {
  search: '',
  platform: 'all',
  date_from: null,
  date_to: null,
  sort: 'newest',
};

// ─── Store types ──────────────────────────────────────────────

interface AppState {
  // Data
  inventory:        InventoryItem[];
  soldTransactions: SoldTransaction[];
  feeProfiles:      FeeProfile[];

  // UI state
  inventoryFilters:  InventoryFilters;
  soldLogFilters:    SoldLogFilters;
  isSidebarOpen:     boolean;
  isDemoMode:        boolean;

  // Inventory actions
  addInventoryItem:    (item: InventoryItem) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  markAsSold:          (id: string) => void;

  // Sold log actions
  addSoldTransaction:    (tx: SoldTransaction) => void;
  updateSoldTransaction: (id: string, updates: Partial<SoldTransaction>) => void;
  deleteSoldTransaction: (id: string) => void;

  // Fee profile actions
  addFeeProfile:    (profile: FeeProfile) => void;
  updateFeeProfile: (id: string, updates: Partial<FeeProfile>) => void;
  deleteFeeProfile: (id: string) => void;

  // Filter actions
  setInventoryFilters: (filters: Partial<InventoryFilters>) => void;
  resetInventoryFilters: () => void;
  setSoldLogFilters:   (filters: Partial<SoldLogFilters>) => void;

  // UI actions
  toggleSidebar: () => void;

  // Pricing update
  updateItemMarketPrice: (id: string, price: number) => void;
}

// ─── Store ────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial data (mock)
      inventory:        MOCK_INVENTORY,
      soldTransactions: MOCK_SOLD_TRANSACTIONS,
      feeProfiles:      DEFAULT_FEE_PROFILES,

      // UI defaults
      inventoryFilters:  DEFAULT_INV_FILTERS,
      soldLogFilters:    DEFAULT_SOLD_FILTERS,
      isSidebarOpen:     false,
      isDemoMode:        true,

      // ─── Inventory ──────────────────────────────────────
      addInventoryItem: (item) =>
        set(state => ({ inventory: [item, ...state.inventory] })),

      updateInventoryItem: (id, updates) =>
        set(state => ({
          inventory: state.inventory.map(item =>
            item.id === id
              ? { ...item, ...updates, updated_at: new Date().toISOString() }
              : item
          ),
        })),

      deleteInventoryItem: (id) =>
        set(state => ({ inventory: state.inventory.filter(i => i.id !== id) })),

      markAsSold: (id) =>
        set(state => ({
          inventory: state.inventory.map(item =>
            item.id === id ? { ...item, status: 'sold', updated_at: new Date().toISOString() } : item
          ),
        })),

      // ─── Sold Log ────────────────────────────────────────
      addSoldTransaction: (tx) =>
        set(state => ({ soldTransactions: [tx, ...state.soldTransactions] })),

      updateSoldTransaction: (id, updates) =>
        set(state => ({
          soldTransactions: state.soldTransactions.map(t =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteSoldTransaction: (id) =>
        set(state => ({ soldTransactions: state.soldTransactions.filter(t => t.id !== id) })),

      // ─── Fee Profiles ────────────────────────────────────
      addFeeProfile: (profile) =>
        set(state => ({ feeProfiles: [...state.feeProfiles, profile] })),

      updateFeeProfile: (id, updates) =>
        set(state => ({
          feeProfiles: state.feeProfiles.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deleteFeeProfile: (id) =>
        set(state => ({ feeProfiles: state.feeProfiles.filter(p => p.id !== id) })),

      // ─── Filters ─────────────────────────────────────────
      setInventoryFilters: (filters) =>
        set(state => ({ inventoryFilters: { ...state.inventoryFilters, ...filters } })),

      resetInventoryFilters: () =>
        set({ inventoryFilters: DEFAULT_INV_FILTERS }),

      setSoldLogFilters: (filters) =>
        set(state => ({ soldLogFilters: { ...state.soldLogFilters, ...filters } })),

      // ─── UI ──────────────────────────────────────────────
      toggleSidebar: () =>
        set(state => ({ isSidebarOpen: !state.isSidebarOpen })),

      // ─── Pricing ─────────────────────────────────────────
      updateItemMarketPrice: (id, price) =>
        set(state => ({
          inventory: state.inventory.map(item =>
            item.id === id
              ? { ...item, current_market_price: price, updated_at: new Date().toISOString() }
              : item
          ),
        })),
    }),
    {
      name: 'pokemon-seller-crm',
      storage: createJSONStorage(() => localStorage),
      // Only persist data, not transient UI state
      partialize: (state) => ({
        inventory:        state.inventory,
        soldTransactions: state.soldTransactions,
        feeProfiles:      state.feeProfiles,
      }),
    }
  )
);

// ─── Selector hooks ───────────────────────────────────────────

export const useInventory    = () => useAppStore(s => s.inventory);
export const useSoldLog      = () => useAppStore(s => s.soldTransactions);
export const useFeeProfiles  = () => useAppStore(s => s.feeProfiles);
export const useInvFilters   = () => useAppStore(s => s.inventoryFilters);
export const useSoldFilters  = () => useAppStore(s => s.soldLogFilters);
