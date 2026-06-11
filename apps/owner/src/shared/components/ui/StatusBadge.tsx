'use client';

import { cn } from '@/shared/lib/cn';

export interface StatusBadgeProps {
  isActive: boolean;
}

export function StatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-rF px-s8 py-0.5 text-ts-cap2 font-medium',
        isActive ? 'bg-st-in-progress-bg text-st-in-progress' : 'bg-bg-control text-tx-subtle'
      )}
    >
      {isActive ? 'Aktif' : 'Nonaktif'}
    </span>
  );
}
