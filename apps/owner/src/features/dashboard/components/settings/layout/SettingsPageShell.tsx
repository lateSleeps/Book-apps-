// Root content wrapper for every settings domain page.
// Enforces max-width and consistent vertical rhythm between sections.
// Every domain page must use this as its outermost element.

import type { ReactNode } from 'react';
import { SETTINGS_MAX_WIDTH, SETTINGS_SECTION_GAP } from '../constants/layout';
import { cn } from '@/shared/lib/cn';

interface SettingsPageShellProps {
  children: ReactNode;
  className?: string;
}

export function SettingsPageShell({ children, className }: SettingsPageShellProps) {
  return (
    <div className={cn('mx-auto w-full', SETTINGS_MAX_WIDTH, className)}>
      <div className={cn('flex flex-col', SETTINGS_SECTION_GAP)}>{children}</div>
    </div>
  );
}
