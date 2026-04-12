'use client';

import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:       string;
  error?:       string;
  leftIcon?:    React.ReactNode;
  rightIcon?:   React.ReactNode;
  hint?:        string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, leftIcon, rightIcon, hint, containerClassName, className, ...props },
  ref
) {
  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          {...props}
          className={cn(
            'w-full rounded-xl border bg-surface-2 text-zinc-100 placeholder:text-zinc-600',
            'h-10 px-3 text-sm',
            'transition-colors duration-150',
            'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40',
            error ? 'border-red-500/60' : 'border-zinc-700',
            leftIcon  && 'pl-9',
            rightIcon && 'pr-9',
            className
          )}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-zinc-600">{hint}</p>}
    </div>
  );
});

// ─── Select input ─────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:    string;
  error?:    string;
  hint?:     string;
  containerClassName?: string;
  options:   { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, containerClassName, options, className, ...props },
  ref
) {
  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        ref={ref}
        {...props}
        className={cn(
          'w-full rounded-xl border bg-surface-2 text-zinc-100',
          'h-10 px-3 text-sm appearance-none',
          'transition-colors duration-150',
          'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40',
          error ? 'border-red-500/60' : 'border-zinc-700',
          className
        )}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-zinc-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-zinc-600">{hint}</p>}
    </div>
  );
});

// ─── Textarea ─────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:  string;
  error?:  string;
  hint?:   string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, containerClassName, className, ...props },
  ref
) {
  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        {...props}
        className={cn(
          'w-full rounded-xl border bg-surface-2 text-zinc-100 placeholder:text-zinc-600',
          'px-3 py-2.5 text-sm resize-none',
          'transition-colors duration-150',
          'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40',
          error ? 'border-red-500/60' : 'border-zinc-700',
          className
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-zinc-600">{hint}</p>}
    </div>
  );
});
