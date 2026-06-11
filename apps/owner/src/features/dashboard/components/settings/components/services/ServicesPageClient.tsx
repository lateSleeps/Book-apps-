'use client';

import { useState } from 'react';
import { ServicesForm } from './ServicesForm';
import {
  SettingsPageShell,
  SettingsTabbedCard,
} from '@/features/dashboard/components/settings/layout';
import { useRegisterSettingsActions } from '@/features/dashboard/components/settings/layout/SettingsHeaderActionsContext';
import { useServicesController } from '@/features/dashboard/hooks/settings/useServicesController';

const SERVICES_SUB_TABS = [
  { id: 'services', label: 'Layanan & Kategori' },
  { id: 'questions', label: 'Pertanyaan Konsultasi' },
];

export function ServicesPageClient() {
  const ctrl = useServicesController();
  const [activeTab, setActiveTab] = useState('services');

  useRegisterSettingsActions({
    onSave: ctrl.handleSave,
    onCancel: ctrl.handleReset,
    isDirty: ctrl.isDirty,
    isSaving: ctrl.isSaving,
  });

  return (
    <SettingsPageShell>
      <SettingsTabbedCard tabs={SERVICES_SUB_TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        <ServicesForm ctrl={ctrl} activeTab={activeTab} />
      </SettingsTabbedCard>
    </SettingsPageShell>
  );
}
