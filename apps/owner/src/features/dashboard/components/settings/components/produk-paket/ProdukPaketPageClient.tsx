'use client';

import { useState } from 'react';
import { ProdukPaketForm } from './ProdukPaketForm';
import {
  SettingsPageShell,
  SettingsTabbedCard,
} from '@/features/dashboard/components/settings/layout';
import { useRegisterSettingsActions } from '@/features/dashboard/components/settings/layout/SettingsHeaderActionsContext';
import { useProdukPaketController } from '@/features/dashboard/hooks/settings/useProdukPaketController';
import { useServicesController } from '@/features/dashboard/hooks/settings/useServicesController';

const PRODUK_PAKET_TABS = [
  { id: 'addons', label: 'Produk Add-on' },
  { id: 'bundles', label: 'Paket Bundle' },
];

export function ProdukPaketPageClient() {
  const ctrl = useProdukPaketController();
  const servicesCtrl = useServicesController();
  const [activeTab, setActiveTab] = useState('addons');

  useRegisterSettingsActions({
    onSave: ctrl.handleSave,
    onCancel: ctrl.handleReset,
    isDirty: ctrl.isDirty,
    isSaving: ctrl.isSaving,
  });

  return (
    <SettingsPageShell>
      <SettingsTabbedCard tabs={PRODUK_PAKET_TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        <ProdukPaketForm
          ctrl={ctrl}
          activeTab={activeTab}
          services={servicesCtrl.domain.services}
        />
      </SettingsTabbedCard>
    </SettingsPageShell>
  );
}
