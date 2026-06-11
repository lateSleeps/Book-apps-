// Root content wrapper for every settings domain page.
// Fluid full-width (matches the Riwayat module) so the layout flows
// smoothly as the main sidebar opens/closes. Owns the single vertical
// rhythm between the sub-nav and sections.
// Every domain page must use this as its outermost element.

import type { ReactNode } from 'react';
import { SETTINGS_SECTION_GAP } from '../constants/layout';
import { cn } from '@/shared/lib/cn';

interface SettingsPageShellProps {
  children: ReactNode;
  className?: string;
}

export function SettingsPageShell({ children, className }: SettingsPageShellProps) {
  return (
    <div className={cn('flex w-full flex-col', SETTINGS_SECTION_GAP, className)}>{children}</div>
  );
}
