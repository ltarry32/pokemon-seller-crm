'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard':  { title: 'Dashboard',     subtitle: 'Your business at a glance' },
  '/scan':       { title: 'Scan Card',     subtitle: 'Identify & add cards' },
  '/inventory':  { title: 'Inventory',     subtitle: 'Manage your collection' },
  '/pricing':    { title: 'Live Pricing',  subtitle: 'Real-time market comps' },
  '/sold':       { title: 'Sold Log',      subtitle: 'Completed sales & profits' },
  '/calculator': { title: 'Fee Calculator',subtitle: 'Calculate net profit' },
  '/analytics':  { title: 'Analytics',     subtitle: 'Profit & loss insights' },
  '/settings':   { title: 'Settings',      subtitle: 'Integrations & preferences' },
};

function getPageMeta(pathname: string) {
  // Check exact match first, then prefix match
  const direct = PAGE_TITLES[pathname];
  if (direct) return direct;

  const prefixMatch = Object.keys(PAGE_TITLES).find(k => pathname.startsWith(k + '/'));
  if (prefixMatch) return PAGE_TITLES[prefixMatch];

  return { title: 'CardVault', subtitle: undefined };
}

export function Header() {
  const pathname = usePathname();
  const { title, subtitle } = getPageMeta(pathname);

  return (
    <header className="sticky top-0 z-20 lg:hidden">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-surface-base/80 backdrop-blur-xl border-b border-zinc-800/60" />

      <div className="relative flex items-center justify-between px-4 py-3">
        {/* Logo (mobile only) */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow-orange">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-100 leading-none">{title}</p>
            {subtitle && <p className="text-[10px] text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/inventory/add"
            className="hidden"
          />
          <button className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Desktop Page Header ──────────────────────────────────────

interface PageHeaderProps {
  title:      string;
  subtitle?:  string;
  actions?:   React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 mb-6', className)}>
      <div>
        <h1 className="text-xl font-bold text-zinc-100">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
