'use client';

import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?:        string;
  title:        string;
  description?: string;
  action?:      { label: string; onClick: () => void };
  className?:   string;
}

export function EmptyState({ icon = '📦', title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="text-5xl mb-4 opacity-60">{icon}</div>
      <h3 className="text-base font-semibold text-zinc-300 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-500 max-w-xs mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-zinc-800', className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface-1 border border-zinc-800 rounded-2xl p-4 space-y-3">
      <div className="flex gap-3">
        <Skeleton className="w-12 h-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="bg-surface-1 border border-zinc-800 rounded-2xl p-4 space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
