// Groups related settings within a domain page.
// Wraps a SettingsSectionHeader and one or more SettingsContentCards.

import type { ReactNode } from 'react';
import { SETTINGS_CARD_GAP } from '../constants/layout';
import { cn } from '@/shared/lib/cn';

interface SettingsSectionProps {
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ children, className }: SettingsSectionProps) {
  return (
    <section className={cn('flex flex-col', SETTINGS_CARD_GAP, className)}>{children}</section>
  );
}
