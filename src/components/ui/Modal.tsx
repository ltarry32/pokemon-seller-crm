'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen:     boolean;
  onClose:    () => void;
  title?:     string;
  subtitle?:  string;
  children:   React.ReactNode;
  size?:      'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?:    React.ReactNode;
  className?: string;
}

const sizeClasses = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-full mx-4',
};

export function Modal({ isOpen, onClose, title, subtitle, children, size = 'md', footer, className }: ModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full bg-surface-1 border border-zinc-800 shadow-xl animate-slide-up',
          'rounded-t-3xl sm:rounded-2xl',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between p-5 border-b border-zinc-800">
            <div>
              {title && <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>}
              {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[70vh] sm:max-h-[80vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-5 border-t border-zinc-800 flex items-center gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────

interface ConfirmDialogProps {
  isOpen:   boolean;
  onClose:  () => void;
  onConfirm: () => void;
  title:    string;
  message:  string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', variant = 'danger', loading
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center py-2">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4',
          variant === 'danger' ? 'bg-red-500/20' : 'bg-yellow-500/20'
        )}>
          <span className="text-2xl">{variant === 'danger' ? '🗑️' : '⚠️'}</span>
        </div>
        <h3 className="text-lg font-semibold text-zinc-100 mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
