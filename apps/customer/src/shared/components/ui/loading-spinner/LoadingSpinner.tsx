'use client';

import { cn } from '@/shared/lib/cn';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

/** Accessible loading spinner */
export function LoadingSpinner({ size = 'md', className, label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-sep border-t-accent',
        size === 'sm' && 'h-4 w-4',
        size === 'md' && 'h-8 w-8',
        size === 'lg' && 'h-12 w-12',
        className
      )}
    />
  );
}
