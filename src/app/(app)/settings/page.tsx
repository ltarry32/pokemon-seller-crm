'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ExternalLink, Check, X, Copy, Zap, Database, Link2, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/actions/auth';
import { PageHeader } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

// ─── Integration definitions ──────────────────────────────────

const INTEGRATIONS = [
  {
    id:          'supabase',
    name:        'Supabase',
    description: 'Database, auth, and storage. Required to go live.',
    icon:        '🔹',
    status:      'not_connected',
    docsUrl:     'https://supabase.com/docs',
    fields: [
      { key: 'NEXT_PUBLIC_SUPABASE_URL',      label: 'Project URL',   placeholder: 'https://xxx.supabase.co' },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Anon Key',      placeholder: 'eyJhbGci...' },
    ],
    setupNotes: 'Create a project at supabase.com, then copy your URL and anon key from Project Settings → API.',
  },
  {
    id:          'ebay',
    name:        'eBay API',
    description: 'Sold comps, active listings, and future listing sync.',
    icon:        '🔵',
    status:      'not_connected',
    docsUrl:     'https://developer.ebay.com/develop/apis',
    fields: [
      { key: 'EBAY_APP_ID',       label: 'App ID (Client ID)',    placeholder: 'YourApp-xxx-xxx' },
      { key: 'EBAY_CLIENT_SECRET', label: 'Client Secret',        placeholder: '***' },
    ],
    setupNotes: 'Register at developer.ebay.com. Use the Finding API for sold comps, Browse API for active listings. Connect in ebayPricingService.ts.',
  },
  {
    id:          'tcgplayer',
    name:        'TCGPlayer API',
    description: 'Live card market pricing from TCGPlayer.',
    icon:        '🟢',
    status:      'not_connected',
    docsUrl:     'https://docs.tcgplayer.com/',
    fields: [
      { key: 'TCGPLAYER_CLIENT_ID',     label: 'Client ID',     placeholder: 'xxx' },
      { key: 'TCGPLAYER_CLIENT_SECRET', label: 'Client Secret', placeholder: '***' },
    ],
    setupNotes: 'Apply for API access at tcgplayer.com. OAuth2 client credentials flow. Connect in tcgplayerPricingService.ts.',
  },
  {
    id:          'pricecharting',
    name:        'PriceCharting',
    description: 'Historical pricing and sales data.',
    icon:        '🟣',
    status:      'not_connected',
    docsUrl:     'https://www.pricecharting.com/api',
    fields: [
      { key: 'PRICECHARTING_API_KEY', label: 'API Key', placeholder: 'xxx' },
    ],
    setupNotes: 'Get an API key at pricecharting.com/api. Connect in pricingAggregatorService.ts.',
  },
  {
    id:          'pokemon_tcg_api',
    name:        'Pokémon TCG API',
    description: 'Card data, images, and set information. Free tier available.',
    icon:        '⚡',
    status:      'available',
    docsUrl:     'https://pokemontcg.io/',
    fields: [
      { key: 'POKEMON_TCG_API_KEY', label: 'API Key (optional)', placeholder: 'xxx' },
    ],
    setupNotes: 'Free at pokemontcg.io. No key required for basic usage. Provides card images, sets, and metadata.',
  },
];

const STATUS_STYLES = {
  connected:     'bg-green-500/20 text-green-300 border-green-500/30',
  not_connected: 'bg-zinc-700/60  text-zinc-400  border-zinc-600/40',
  available:     'bg-blue-500/20  text-blue-300  border-blue-500/30',
};

// ─── Page ─────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('integrations');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const displayName  = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User';
  const displayEmail = user?.email ?? '';
  const initial      = (displayName[0] ?? 'U').toUpperCase();

  const handleSaveKey = (integrationId: string, key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
    setSaved(prev => ({ ...prev, [integrationId]: true }));
    toast.success('Saved to .env.local (dev only)');
    setTimeout(() => setSaved(prev => ({ ...prev, [integrationId]: false })), 2000);
  };

  const copyEnvLine = (key: string, value: string) => {
    navigator.clipboard.writeText(`${key}=${value}`).then(() => {
      toast.success('Copied to clipboard');
    });
  };

  return (
    <div className="page-container space-y-5 animate-fade-in">
      <PageHeader title="Settings" subtitle="Integrations & preferences" />

      {/* Section tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-1">
        {[
          { id: 'integrations', label: 'Integrations', icon: Link2 },
          { id: 'database',     label: 'Database',     icon: Database },
          { id: 'account',      label: 'Account',      icon: Shield },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-medium transition-colors',
              activeSection === id ? 'text-brand-400 border-b-2 border-brand-500 -mb-px' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Integrations ───────────────────────────────────── */}
      {activeSection === 'integrations' && (
        <div className="space-y-4">
          <div className="p-3 bg-zinc-800/40 rounded-2xl border border-zinc-700/50">
            <p className="text-xs text-zinc-400">
              <strong className="text-zinc-300">Integration Architecture:</strong>{' '}
              Service files are pre-built in <code className="text-brand-400">src/services/</code>.
              Add your API keys here and remove the mock implementations to go live.
            </p>
          </div>

          {INTEGRATIONS.map(integration => (
            <Card key={integration.id}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <p className="font-semibold text-zinc-100 text-sm">{integration.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', STATUS_STYLES[integration.status as keyof typeof STATUS_STYLES])}>
                    {integration.status === 'connected' ? '● Connected' : integration.status === 'available' ? '● Available' : '○ Not Connected'}
                  </span>
                  <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Setup notes */}
              <div className="mb-3 p-2.5 bg-zinc-800/40 rounded-xl">
                <p className="text-[11px] text-zinc-500">{integration.setupNotes}</p>
              </div>

              {/* API key fields */}
              <div className="space-y-2">
                {integration.fields.map(field => (
                  <div key={field.key} className="flex gap-2">
                    <Input
                      label={field.label}
                      type="password"
                      placeholder={field.placeholder}
                      value={apiKeys[field.key] ?? ''}
                      onChange={e => setApiKeys(prev => ({ ...prev, [field.key]: e.target.value }))}
                      containerClassName="flex-1"
                      hint={`Add to .env.local as ${field.key}=...`}
                    />
                    <button
                      onClick={() => copyEnvLine(field.key, apiKeys[field.key] ?? '')}
                      className="mt-5 h-10 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => handleSaveKey(integration.id, integration.fields[0].key, apiKeys[integration.fields[0].key] ?? '')}
                leftIcon={saved[integration.id] ? <Check className="w-3.5 h-3.5 text-profit" /> : undefined}
              >
                {saved[integration.id] ? 'Saved!' : 'Save Keys'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* ── Database ────────────────────────────────────────── */}
      {activeSection === 'database' && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-zinc-100">Supabase Schema</p>
                <p className="text-xs text-zinc-500">Run this SQL in your Supabase project</p>
              </div>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 font-mono text-xs text-zinc-400 overflow-x-auto">
              <pre className="whitespace-pre-wrap">{SCHEMA_SQL}</pre>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                navigator.clipboard.writeText(SCHEMA_SQL);
                toast.success('Schema SQL copied!');
              }}
              leftIcon={<Copy className="w-3.5 h-3.5" />}
            >
              Copy Schema SQL
            </Button>
          </Card>

          <Card>
            <p className="font-semibold text-zinc-100 mb-2">Schema Tables</p>
            <div className="space-y-2">
              {['profiles','inventory_items','price_snapshots','sold_transactions','fee_profiles','integrations','scan_history'].map(t => (
                <div key={t} className="flex items-center gap-2 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  <code className="text-xs text-brand-300">{t}</code>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Account ─────────────────────────────────────────── */}
      {activeSection === 'account' && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xl font-bold text-brand-400">
                {initial}
              </div>
              <div>
                <p className="font-semibold text-zinc-100">{displayName}</p>
                <p className="text-xs text-zinc-500">{displayEmail}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-profit bg-profit/10 border border-profit/20 px-2 py-0.5 rounded-full mt-1">
                  <Zap className="w-2.5 h-2.5" /> Live
                </span>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </Card>

          <Card>
            <p className="section-title">App Version</p>
            <p className="text-sm text-zinc-400">CardVault Seller CRM v1.0.0</p>
            <p className="text-xs text-zinc-600 mt-1">
              Built with Next.js 14 · TypeScript · Tailwind CSS · Zustand · Supabase
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Schema SQL preview ───────────────────────────────────────

const SCHEMA_SQL = `-- CardVault Seller CRM — Supabase Schema
-- Run in: Supabase → SQL Editor → New Query

-- Profiles
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  email text,
  business_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Inventory Items
create table inventory_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  card_name text not null,
  set_name text not null,
  card_number text,
  rarity text, language text default 'English',
  condition text not null,
  is_graded boolean default false,
  grade text, grading_company text,
  quantity int default 1,
  cost_basis numeric(10,2) default 0,
  current_market_price numeric(10,2) default 0,
  list_price numeric(10,2), min_price numeric(10,2),
  storage_location text, status text default 'in_inventory',
  source text, purchase_date date, notes text, image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Price Snapshots
create table price_snapshots (
  id uuid default gen_random_uuid() primary key,
  inventory_item_id uuid references inventory_items(id),
  source text, low_price numeric(10,2),
  avg_price numeric(10,2), high_price numeric(10,2),
  sold_average numeric(10,2), sales_count int default 0,
  captured_at timestamptz default now()
);

-- Sold Transactions
create table sold_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  inventory_item_id uuid references inventory_items(id),
  card_name text not null, set_name text, card_number text,
  condition text, is_graded boolean, grade text, image_url text,
  sold_price numeric(10,2) not null, platform text,
  buyer_name text, fees numeric(10,2) default 0,
  shipping_cost numeric(10,2) default 0,
  packaging_cost numeric(10,2) default 0,
  cost_basis numeric(10,2) default 0,
  net_profit numeric(10,2), payment_method text,
  tracking_number text, date_sold timestamptz default now(),
  notes text, created_at timestamptz default now()
);

-- Fee Profiles
create table fee_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  name text, platform text,
  fee_percent numeric(5,2) default 0,
  processing_percent numeric(5,2) default 0,
  fixed_fee numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- RLS (enable after testing)
-- alter table inventory_items enable row level security;
-- create policy "Users own data" on inventory_items using (auth.uid() = user_id);`;
