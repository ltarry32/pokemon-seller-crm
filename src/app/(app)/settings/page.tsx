'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ExternalLink, Check, Copy, Zap, Link2, Shield } from 'lucide-react';
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
    setupNotes: 'Register at developer.ebay.com. Use the Finding API for sold comps and the Browse API for active listings.',
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
    setupNotes: 'Apply for API access at tcgplayer.com. Uses OAuth2 client credentials for authentication.',
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
    setupNotes: 'Get an API key at pricecharting.com/api. Provides historical pricing and sales data.',
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
    toast.success('API key saved');
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
                      hint={`Environment variable: ${field.key}`}
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

