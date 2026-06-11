// Single white container that groups a segment's sections into one card,
// separated by hairline dividers (Riwayat-style grouped list).
// Wrap one or more SettingsPanelSection blocks.

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface SettingsPanelProps {
  children: ReactNode;
  className?: string;
}

export function SettingsPanel({ children, className }: SettingsPanelProps) {
  return (
    <div
      className={cn(
        'divide-y divide-bd-row overflow-hidden rounded-r16 border border-bd-card bg-bg-card shadow-card',
        className
      )}
    >
      {children}
    </div>
  );
}
