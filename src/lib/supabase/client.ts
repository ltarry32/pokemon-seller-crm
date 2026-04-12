// =============================================================
// SUPABASE CLIENT — Browser + Server clients
// Plug in your SUPABASE_URL and ANON_KEY from .env.local
// =============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'https://placeholder.supabase.co';
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key';

// Browser-side client (singleton)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ─── Auth helpers ─────────────────────────────────────────────

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// ─── Type-safe table helpers ──────────────────────────────────
// TODO: Replace with generated Supabase types after running:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts

export type Tables = {
  profiles:          Record<string, unknown>;
  inventory_items:   Record<string, unknown>;
  price_snapshots:   Record<string, unknown>;
  sold_transactions: Record<string, unknown>;
  fee_profiles:      Record<string, unknown>;
  integrations:      Record<string, unknown>;
  scan_history:      Record<string, unknown>;
};
