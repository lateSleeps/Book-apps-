'use client';

import React from 'react';

import { cn } from '@/shared/lib/cn';

/** Button variant types */
export type ButtonVariant = 'primary' | 'ghost' | 'icon';
export type ButtonSize = 'default' | 'sm' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Full width */
  fullWidth?: boolean;
  children: React.ReactNode;
}

/** Rara Beauty primary/ghost/icon button */
export function Button({
  variant = 'primary',
  size = 'default',
  isLoading = false,
  fullWidth = true,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        // Base
        'inline-flex items-center justify-center gap-s8 rounded-rF font-sans font-semibold transition-all duration-160',
        'active:scale-[0.98] active:opacity-90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',

        // Variants
        variant === 'primary' && [
          'bg-label text-white text-t16',
          'shadow-button',
          'disabled:bg-sep disabled:text-label3 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100',
        ],
        variant === 'ghost' && [
          'bg-sep text-label3 text-t14',
          'disabled:cursor-not-allowed disabled:opacity-60',
        ],
        variant === 'icon' && [
          'w-9 h-9 rounded-rF bg-surface border border-sep text-label2',
          'active:bg-sep',
        ],

        // Sizes
        size === 'default' && variant !== 'icon' && 'min-h-[50px] px-s24 py-3',
        size === 'sm' && variant !== 'icon' && 'min-h-[40px] px-s16 py-2',

        // Width
        fullWidth && variant !== 'icon' && 'w-full',

        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}
