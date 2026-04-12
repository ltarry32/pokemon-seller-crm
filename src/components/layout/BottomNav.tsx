'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ScanLine, Package, TrendingUp,
  ShoppingBag, Calculator, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Home',       icon: LayoutDashboard },
  { href: '/scan',       label: 'Scan',        icon: ScanLine },
  { href: '/inventory',  label: 'Inventory',   icon: Package },
  { href: '/pricing',    label: 'Pricing',     icon: TrendingUp },
  { href: '/sold',       label: 'Sold',        icon: ShoppingBag },
  { href: '/calculator', label: 'Calculator',  icon: Calculator },
  { href: '/settings',   label: 'Settings',    icon: Settings },
] as const;

// Show only 5 items in bottom nav; others go to sidebar / overflow
const BOTTOM_NAV_ITEMS = NAV_ITEMS.slice(0, 5);

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-surface-1/90 backdrop-blur-xl border-t border-zinc-800" />

      <div className="relative flex items-center justify-around px-2 pb-safe">
        {BOTTOM_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-3 min-w-[56px]',
                'rounded-xl transition-all duration-200 active:scale-95',
                isActive ? 'text-brand-400' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <div className={cn(
                'w-8 h-8 flex items-center justify-center rounded-xl transition-all',
                isActive && 'bg-brand-500/15'
              )}>
                <Icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_6px_rgb(249_115_22/0.6)]')} />
              </div>
              <span className={cn(
                'text-[10px] font-medium tracking-wide',
                isActive ? 'text-brand-400' : 'text-zinc-600'
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { NAV_ITEMS };
