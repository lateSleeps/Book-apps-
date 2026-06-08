'use client';

import { ServicesForm } from './ServicesForm';
import { SettingsPageShell } from '@/features/dashboard/components/settings/layout';
import { useServicesController } from '@/features/dashboard/hooks/settings/useServicesController';

export function ServicesPageClient() {
  const ctrl = useServicesController();

  return (
    <SettingsPageShell>
      <ServicesForm ctrl={ctrl} />
    </SettingsPageShell>
  );
}
