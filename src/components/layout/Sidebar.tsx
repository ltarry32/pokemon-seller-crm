'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ScanLine, Package, TrendingUp,
  ShoppingBag, Calculator, Settings, BarChart3,
  ChevronRight, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
      { href: '/scan',       label: 'Scan Card',   icon: ScanLine },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { href: '/inventory',  label: 'Inventory',   icon: Package },
      { href: '/sold',       label: 'Sold Log',    icon: ShoppingBag },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/analytics',  label: 'Analytics',   icon: BarChart3 },
      { href: '/pricing',    label: 'Live Pricing',icon: TrendingUp },
      { href: '/calculator', label: 'Fee Calc',    icon: Calculator },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/settings',   label: 'Settings',    icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User';
  const displayEmail = user?.email ?? '';
  const initial = (displayName[0] ?? 'U').toUpperCase();

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-surface-1 border-r border-zinc-800 fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-orange">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-bold text-zinc-100 text-sm tracking-tight">CardVault</span>
          <span className="block text-[10px] text-zinc-600 -mt-0.5">Seller CRM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      'group',
                      isActive
                        ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', isActive && 'drop-shadow-[0_0_5px_rgb(249_115_22/0.5)]')} />
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom user area */}
      <div className="p-3 border-t border-zinc-800">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">{displayName}</p>
              <p className="text-[10px] text-zinc-600 truncate">{displayEmail}</p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
