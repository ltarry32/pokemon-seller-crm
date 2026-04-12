'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'highlighted' | 'danger' | 'success';
}

const paddingClasses = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-6',
};

const variantClasses = {
  default:     'bg-surface-1 border border-zinc-800',
  highlighted: 'bg-surface-1 border border-brand-500/30 shadow-glow-orange',
  danger:      'bg-surface-1 border border-red-500/30',
  success:     'bg-surface-1 border border-green-500/30',
};

export function Card({
  children,
  className,
  onClick,
  hoverable = false,
  padding = 'md',
  variant = 'default',
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl transition-all duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        hoverable && 'cursor-pointer hover:border-zinc-700 hover:shadow-card-hover',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Card sub-components ──────────────────────────────────────

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-zinc-100 truncate">{title}</h3>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  className?: string;
}

export function StatCard({ label, value, sub, trend, trendValue, icon, highlight, className }: StatCardProps) {
  const trendColor = trend === 'up' ? 'text-profit' : trend === 'down' ? 'text-loss' : 'text-zinc-400';
  const trendArrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—';

  return (
    <Card
      className={cn(highlight && 'border-brand-500/30', className)}
      variant={highlight ? 'highlighted' : 'default'}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider truncate">{label}</p>
          <p className={cn('mt-1 text-2xl font-bold tracking-tight', highlight ? 'text-brand-400' : 'text-zinc-100')}>
            {value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>}
          {trendValue && (
            <p className={cn('mt-1 text-xs font-medium', trendColor)}>
              {trendArrow} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center', highlight ? 'bg-brand-500/20' : 'bg-zinc-800')}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
