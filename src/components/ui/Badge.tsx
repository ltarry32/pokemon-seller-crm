'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'orange' | 'graded';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-zinc-700/60 text-zinc-300 border-zinc-600/40',
  success:  'bg-green-500/20  text-green-300  border-green-500/30',
  warning:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  danger:   'bg-red-500/20    text-red-300    border-red-500/30',
  info:     'bg-blue-500/20   text-blue-300   border-blue-500/30',
  orange:   'bg-brand-500/20  text-brand-300  border-brand-500/30',
  graded:   'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

export function Badge({ children, variant = 'default', className, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium tracking-wide',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
