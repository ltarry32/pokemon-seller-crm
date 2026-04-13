// =============================================================
// APP STORE — Zustand UI state only
// All data (inventory, sold transactions) is managed by
// React Query + Supabase. This store holds only ephemeral
// UI state that doesn't need to be persisted to the server.
// =============================================================

import { create } from 'zustand';
import type { InventoryFilters, SoldLogFilters } from '@/types';

// ─── Default filters ──────────────────────────────────────────

const DEFAULT_INV_FILTERS: InventoryFilters = {
  search:    '',
  status:    'all',
  is_graded: null,
  rarity:    'all',
  condition: 'all',
  set_name:  'all',
  sort:      'newest',
};

const DEFAULT_SOLD_FILTERS: SoldLogFilters = {
  search:    '',
  platform:  'all',
  date_from: null,
  date_to:   null,
  sort:      'newest',
};

// ─── Store types ──────────────────────────────────────────────

interface AppState {
  // UI state
  inventoryFilters: InventoryFilters;
  soldLogFilters:   SoldLogFilters;
  isSidebarOpen:    boolean;

  // Filter actions
  setInventoryFilters:   (filters: Partial<InventoryFilters>) => void;
  resetInventoryFilters: () => void;
  setSoldLogFilters:     (filters: Partial<SoldLogFilters>) => void;

  // UI actions
  toggleSidebar: () => void;
}

// ─── Store ────────────────────────────────────────────────────

export const useAppStore = create<AppState>()((set) => ({
  inventoryFilters: DEFAULT_INV_FILTERS,
  soldLogFilters:   DEFAULT_SOLD_FILTERS,
  isSidebarOpen:    false,

  setInventoryFilters: (filters) =>
    set(state => ({ inventoryFilters: { ...state.inventoryFilters, ...filters } })),

  resetInventoryFilters: () =>
    set({ inventoryFilters: DEFAULT_INV_FILTERS }),

  setSoldLogFilters: (filters) =>
    set(state => ({ soldLogFilters: { ...state.soldLogFilters, ...filters } })),

  toggleSidebar: () =>
    set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

// ─── Selector hooks ───────────────────────────────────────────

export const useInvFilters  = () => useAppStore(s => s.inventoryFilters);
export const useSoldFilters = () => useAppStore(s => s.soldLogFilters);
