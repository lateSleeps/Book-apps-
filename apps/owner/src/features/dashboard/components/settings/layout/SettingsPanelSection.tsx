// A titled block inside a SettingsPanel. Unlike SettingsSection, the header
// sits inside the shared white card; blocks are separated by the panel's
// hairline dividers instead of floating as separate cards.

import type { ReactNode } from 'react';
import { SettingsSectionHeader } from './SettingsSectionHeader';

interface SettingsPanelSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SettingsPanelSection({
  title,
  description,
  action,
  children,
}: SettingsPanelSectionProps) {
  return (
    <section className="flex flex-col gap-s16 p-s20 md:p-s24">
      <SettingsSectionHeader title={title} description={description} action={action} />
      {children}
    </section>
  );
}
