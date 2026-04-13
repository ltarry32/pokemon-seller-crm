-- =====================================================================
-- Row Level Security — Production Policies
-- pokemon-seller-crm
--
-- Run this AFTER schema.sql in the Supabase SQL Editor.
-- These policies ensure every user can only access their own data.
-- =====================================================================

-- ─── Enable RLS on all tables ────────────────────────────────────────
-- (already done in schema.sql, kept here as documentation)

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sold_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_snapshots   ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history      ENABLE ROW LEVEL SECURITY;


-- =====================================================================
-- PROFILES
-- =====================================================================

DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- SELECT: own profile only
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- INSERT: only the authenticated user can create their own profile row
-- (normally triggered automatically by handle_new_user, but allow direct insert for safety)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: own profile only
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING     (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: not permitted via API; profiles are deleted when auth.users row is deleted (CASCADE)


-- =====================================================================
-- INVENTORY ITEMS
-- =====================================================================

DROP POLICY IF EXISTS "Users can view own inventory"   ON inventory_items;
DROP POLICY IF EXISTS "Users can insert own inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can update own inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete own inventory" ON inventory_items;

-- SELECT: own items only
CREATE POLICY "Users can view own inventory"
  ON inventory_items FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: user_id must match authenticated user; prevents client from spoofing another user_id
CREATE POLICY "Users can insert own inventory"
  ON inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: both the existing row (USING) and updated row (WITH CHECK) must belong to user
CREATE POLICY "Users can update own inventory"
  ON inventory_items FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: own items only
CREATE POLICY "Users can delete own inventory"
  ON inventory_items FOR DELETE
  USING (auth.uid() = user_id);


-- =====================================================================
-- SOLD TRANSACTIONS
-- =====================================================================

DROP POLICY IF EXISTS "Users can view own sold transactions"   ON sold_transactions;
DROP POLICY IF EXISTS "Users can insert own sold transactions" ON sold_transactions;
DROP POLICY IF EXISTS "Users can update own sold transactions" ON sold_transactions;
DROP POLICY IF EXISTS "Users can delete own sold transactions" ON sold_transactions;

-- SELECT
CREATE POLICY "Users can view own sold transactions"
  ON sold_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: net_profit column is set by server action, not trusted from client
CREATE POLICY "Users can insert own sold transactions"
  ON sold_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update own sold transactions"
  ON sold_transactions FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users can delete own sold transactions"
  ON sold_transactions FOR DELETE
  USING (auth.uid() = user_id);


-- =====================================================================
-- FEE PROFILES
-- =====================================================================

DROP POLICY IF EXISTS "Users can view own fee profiles"   ON fee_profiles;
DROP POLICY IF EXISTS "Users can insert own fee profiles" ON fee_profiles;
DROP POLICY IF EXISTS "Users can update own fee profiles" ON fee_profiles;
DROP POLICY IF EXISTS "Users can delete own fee profiles" ON fee_profiles;

CREATE POLICY "Users can view own fee profiles"
  ON fee_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fee profiles"
  ON fee_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fee profiles"
  ON fee_profiles FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fee profiles"
  ON fee_profiles FOR DELETE
  USING (auth.uid() = user_id);


-- =====================================================================
-- PRICE SNAPSHOTS
-- =====================================================================

DROP POLICY IF EXISTS "Users can view own price snapshots"   ON price_snapshots;
DROP POLICY IF EXISTS "Users can insert own price snapshots" ON price_snapshots;
DROP POLICY IF EXISTS "Users can delete own price snapshots" ON price_snapshots;

CREATE POLICY "Users can view own price snapshots"
  ON price_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own price snapshots"
  ON price_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Price snapshots are append-only (no UPDATE policy — use delete + insert)

CREATE POLICY "Users can delete own price snapshots"
  ON price_snapshots FOR DELETE
  USING (auth.uid() = user_id);


-- =====================================================================
-- INTEGRATIONS
-- =====================================================================

DROP POLICY IF EXISTS "Users can view own integrations"   ON integrations;
DROP POLICY IF EXISTS "Users can insert own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can update own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can delete own integrations" ON integrations;

CREATE POLICY "Users can view own integrations"
  ON integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON integrations FOR UPDATE
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON integrations FOR DELETE
  USING (auth.uid() = user_id);


-- =====================================================================
-- SCAN HISTORY
-- =====================================================================

DROP POLICY IF EXISTS "Users can view own scan history"   ON scan_history;
DROP POLICY IF EXISTS "Users can insert own scan history" ON scan_history;
DROP POLICY IF EXISTS "Users can delete own scan history" ON scan_history;

CREATE POLICY "Users can view own scan history"
  ON scan_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan history"
  ON scan_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scan history"
  ON scan_history FOR DELETE
  USING (auth.uid() = user_id);


-- =====================================================================
-- VERIFICATION QUERIES (run after applying to confirm policies are set)
-- =====================================================================

-- List all RLS policies:
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;

-- Confirm RLS is enabled on all tables:
-- SELECT relname, relrowsecurity
-- FROM pg_class
-- WHERE relname IN ('profiles','inventory_items','sold_transactions','fee_profiles','price_snapshots','integrations','scan_history')
-- ORDER BY relname;
