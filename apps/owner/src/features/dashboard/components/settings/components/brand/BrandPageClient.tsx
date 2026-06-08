'use client';

import { BrandForm } from './BrandForm';
import {
  SettingsPageShell,
  SettingsActionBar,
} from '@/features/dashboard/components/settings/layout';
import { useBrandProfileController } from '@/features/dashboard/hooks/settings/useBrandProfileController';

// Brand is a single-record domain: pure configuration + one sticky action bar.
// The customer booking preview is NOT a Brand concern — it belongs to the
// Booking App domain (see shared/preview/BookingPagePreview).
export function BrandPageClient() {
  const ctrl = useBrandProfileController();

  return (
    <SettingsPageShell>
      <BrandForm ctrl={ctrl} />
      <SettingsActionBar
        onSave={ctrl.handleSave}
        onCancel={ctrl.handleReset}
        isSaving={ctrl.isSaving}
        isDirty={ctrl.isDirty}
        saveLabel="Simpan Brand"
      />
    </SettingsPageShell>
  );
}
