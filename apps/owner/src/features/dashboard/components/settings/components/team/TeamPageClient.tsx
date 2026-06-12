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

  // Team uses immediate mutations and per-section explicit save (schedules only).
  // No global batch save — action bar is permanently hidden for this page.
  useRegisterSettingsActions({
    onSave: () => void 0,
    onCancel: () => void 0,
    isDirty: false,
    isSaving: false,
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
