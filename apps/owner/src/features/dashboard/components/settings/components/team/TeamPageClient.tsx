'use client';

import { useState } from 'react';
import { TeamForm } from './TeamForm';
import {
  SettingsPageShell,
  SettingsTabbedCard,
} from '@/features/dashboard/components/settings/layout';
import { useRegisterSettingsActions } from '@/features/dashboard/components/settings/layout/SettingsHeaderActionsContext';
import { useServicesController } from '@/features/dashboard/hooks/settings/useServicesController';
import { useTeamController } from '@/features/dashboard/hooks/settings/useTeamController';

const TEAM_TABS = [
  { id: 'directory', label: 'Direktori Staff' },
  { id: 'assignment', label: 'Penugasan Layanan' },
  { id: 'schedule', label: 'Jadwal Mingguan' },
  { id: 'leave', label: 'Cuti & Tidak Tersedia' },
];

export function TeamPageClient() {
  const ctrl = useTeamController();
  const servicesCtrl = useServicesController();
  const [activeTab, setActiveTab] = useState('directory');

  useRegisterSettingsActions({
    onSave: ctrl.handleSave,
    onCancel: ctrl.handleReset,
    isDirty: ctrl.isDirty,
    isSaving: ctrl.isSaving,
  });

  return (
    <SettingsPageShell>
      <SettingsTabbedCard tabs={TEAM_TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        <TeamForm
          ctrl={ctrl}
          activeTab={activeTab}
          services={servicesCtrl.domain.services}
          categories={servicesCtrl.domain.categories}
        />
      </SettingsTabbedCard>
    </SettingsPageShell>
  );
}
