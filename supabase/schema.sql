-- =============================================================
-- CARDVAULT SELLER CRM — Supabase Schema
-- Run in: Supabase → SQL Editor → New Query
-- =============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────

create table if not exists profiles (
  id            uuid references auth.users primary key,
  full_name     text,
  email         text unique,
  business_name text,
  avatar_url    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on user sign-up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Inventory Items ──────────────────────────────────────────

create table if not exists inventory_items (
  id                   uuid default gen_random_uuid() primary key,
  user_id              uuid references profiles(id) on delete cascade not null,
  card_name            text not null,
  set_name             text not null,
  card_number          text,
  rarity               text,
  language             text default 'English',
  condition            text not null,
  is_graded            boolean default false,
  grade                text,
  grading_company      text,
  quantity             int default 1 check (quantity > 0),
  cost_basis           numeric(10,2) default 0,
  current_market_price numeric(10,2) default 0,
  list_price           numeric(10,2),
  min_price            numeric(10,2),
  storage_location     text,
  status               text default 'in_inventory',
  source               text,
  purchase_date        date,
  notes                text,
  image_url            text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create index if not exists idx_inventory_user     on inventory_items(user_id);
create index if not exists idx_inventory_status   on inventory_items(status);
create index if not exists idx_inventory_set      on inventory_items(set_name);
create index if not exists idx_inventory_graded   on inventory_items(is_graded);

-- ─── Price Snapshots ──────────────────────────────────────────

create table if not exists price_snapshots (
  id                  uuid default gen_random_uuid() primary key,
  inventory_item_id   uuid references inventory_items(id) on delete cascade,
  source              text,  -- 'eBay Sold' | 'TCGPlayer' | 'PriceCharting' | 'Manual'
  low_price           numeric(10,2),
  avg_price           numeric(10,2),
  high_price          numeric(10,2),
  sold_average        numeric(10,2),
  sales_count         int default 0,
  captured_at         timestamptz default now()
);

create index if not exists idx_snapshots_item on price_snapshots(inventory_item_id);

-- ─── Sold Transactions ────────────────────────────────────────

create table if not exists sold_transactions (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references profiles(id) on delete cascade not null,
  inventory_item_id   uuid references inventory_items(id) on delete set null,
  -- Denormalized card info (preserved even if item is deleted)
  card_name           text not null,
  set_name            text,
  card_number         text,
  condition           text,
  is_graded           boolean default false,
  grade               text,
  image_url           text,
  -- Sale details
  sold_price          numeric(10,2) not null,
  platform            text,
  buyer_name          text,
  fees                numeric(10,2) default 0,
  shipping_cost       numeric(10,2) default 0,
  packaging_cost      numeric(10,2) default 0,
  cost_basis          numeric(10,2) default 0,
  net_profit          numeric(10,2),
  payment_method      text,
  tracking_number     text,
  date_sold           timestamptz default now(),
  notes               text,
  created_at          timestamptz default now()
);

create index if not exists idx_sold_user    on sold_transactions(user_id);
create index if not exists idx_sold_date    on sold_transactions(date_sold desc);
create index if not exists idx_sold_platform on sold_transactions(platform);

-- ─── Fee Profiles ─────────────────────────────────────────────

create table if not exists fee_profiles (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references profiles(id) on delete cascade,
  name                text not null,
  platform            text,
  fee_percent         numeric(5,2) default 0,
  processing_percent  numeric(5,2) default 0,
  fixed_fee           numeric(10,2) default 0,
  created_at          timestamptz default now()
);

-- ─── Integrations ─────────────────────────────────────────────

create table if not exists integrations (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references profiles(id) on delete cascade,
  provider            text not null,   -- 'ebay' | 'tcgplayer' | 'pricecharting' | 'pokemon_tcg_api'
  is_connected        boolean default false,
  api_key_placeholder text,            -- NEVER store real keys here — use Supabase Vault
  display_name        text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ─── Scan History ─────────────────────────────────────────────

create table if not exists scan_history (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references profiles(id) on delete cascade,
  scan_type           text,           -- 'barcode' | 'image' | 'manual'
  raw_scan_data       text,
  identified_name     text,
  identified_set      text,
  identified_number   text,
  confidence_score    numeric(3,2),   -- 0.00 to 1.00
  created_at          timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────────
-- Enable after testing with your app

alter table profiles          enable row level security;
alter table inventory_items   enable row level security;
alter table price_snapshots   enable row level security;
alter table sold_transactions enable row level security;
alter table fee_profiles      enable row level security;
alter table integrations      enable row level security;
alter table scan_history      enable row level security;

-- Policies: users can only access their own data
create policy "profiles_own"      on profiles          using (auth.uid() = id);
create policy "inventory_own"     on inventory_items   using (auth.uid() = user_id);
create policy "snapshots_own"     on price_snapshots   using (
  exists (select 1 from inventory_items where id = inventory_item_id and user_id = auth.uid())
);
create policy "sold_own"          on sold_transactions using (auth.uid() = user_id);
create policy "fee_profiles_own"  on fee_profiles      using (auth.uid() = user_id);
create policy "integrations_own"  on integrations      using (auth.uid() = user_id);
create policy "scans_own"         on scan_history      using (auth.uid() = user_id);
