'use client';

import { BrandForm } from './BrandForm';
import { SettingsPageShell } from '@/features/dashboard/components/settings/layout';
import { useRegisterSettingsActions } from '@/features/dashboard/components/settings/layout/SettingsHeaderActionsContext';
import { useBrandProfileController } from '@/features/dashboard/hooks/settings/useBrandProfileController';

export function BrandPageClient() {
  const ctrl = useBrandProfileController();

  useRegisterSettingsActions({
    onSave: ctrl.handleSave,
    onCancel: ctrl.handleReset,
    isDirty: ctrl.isDirty,
    isSaving: ctrl.isSaving,
  });

  return (
    <SettingsPageShell>
      <BrandForm ctrl={ctrl} />
    </SettingsPageShell>
  );
}
