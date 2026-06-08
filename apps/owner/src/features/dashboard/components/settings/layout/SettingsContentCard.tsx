// Standard card container for settings domain content.
// Use for form groups, list panels, or any contained block of settings.
//
// padding variants:
//   tight   — p-s16  — dense lists, table-like content
//   default — p-s20  — standard form sections
//   loose   — p-s24  — sections that need breathing room
//   none    — no padding — when inner content controls its own padding

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type Padding = 'tight' | 'default' | 'loose' | 'none';

const PADDING: Record<Padding, string> = {
  tight: 'p-s16',
  default: 'p-s20',
  loose: 'p-s24',
  none: '',
};

interface SettingsContentCardProps {
  children: ReactNode;
  padding?: Padding;
  className?: string;
}

export function SettingsContentCard({
  children,
  padding = 'default',
  className,
}: SettingsContentCardProps) {
  return (
    <div
      className={cn(
        'rounded-r16 border border-bd-card bg-bg-card shadow-card',
        PADDING[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
