'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize    = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-brand-500 hover:bg-brand-600 text-white shadow-glow-orange/20 border border-brand-400/30',
  secondary: 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100 border border-zinc-600',
  ghost:     'bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100',
  danger:    'bg-red-600 hover:bg-red-700 text-white border border-red-500/30',
  outline:   'bg-transparent border border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm:   'h-8  px-3  text-xs  gap-1.5',
  md:   'h-10 px-4  text-sm  gap-2',
  lg:   'h-12 px-6  text-base gap-2',
  icon: 'h-9  w-9   text-sm  justify-center',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
        'active:scale-[0.97]',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed active:scale-100',
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
