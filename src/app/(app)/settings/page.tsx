'use client';

import { useState } from 'react';
import { Zap, Link2, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/actions/auth';
import { PageHeader } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// ─── Integration definitions ──────────────────────────────────

const INTEGRATIONS = [
  {
    id:   'ebay',
    name: 'eBay',
    icon: '🔵',
  },
  {
    id:   'tcgplayer',
    name: 'TCGPlayer',
    icon: '🟢',
  },
  {
    id:   'pricecharting',
    name: 'PriceCharting',
    icon: '🟣',
  },
];

// ─── Page ─────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('integrations');

  const displayName  = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User';
  const displayEmail = user?.email ?? '';
  const initial      = (displayName[0] ?? 'U').toUpperCase();

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
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <p className="font-semibold text-zinc-100 text-sm">{integration.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Integration coming soon. Live pricing and syncing will be available in a future update.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-zinc-700/60 text-zinc-400 border-zinc-600/40 whitespace-nowrap">
                  Coming Soon
                </span>
              </div>
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
            <p className="text-sm text-zinc-400">CollectorVault Seller CRM v1.0.0</p>
            <p className="text-xs text-zinc-600 mt-1">
              Built with Next.js 14 · TypeScript · Tailwind CSS · Zustand · Supabase
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
