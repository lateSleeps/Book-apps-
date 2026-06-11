'use client';

import { LeaveSection } from './sections/LeaveSection';
import { ServiceAssignmentSection } from './sections/ServiceAssignmentSection';
import { StaffDirectorySection } from './sections/StaffDirectorySection';
import { WeeklyScheduleSection } from './sections/WeeklyScheduleSection';
import type {
  ServiceCategory,
  ServiceItem,
} from '@/features/dashboard/components/settings/types/services.types';
import type { TeamController } from '@/features/dashboard/hooks/settings/useTeamController';

interface TeamFormProps {
  ctrl: TeamController;
  activeTab: string;
  services: ServiceItem[];
  categories: ServiceCategory[];
}

// Sections render their own header + content directly.
// SettingsTabbedCard already provides p-s20 md:p-s24, so sections must NOT
// add their own padding wrapper (no SettingsPanel / SettingsPanelSection).
export function TeamForm({ ctrl, activeTab, services, categories }: TeamFormProps) {
  return (
    <>
      {activeTab === 'directory' && <StaffDirectorySection ctrl={ctrl} />}
      {activeTab === 'assignment' && (
        <ServiceAssignmentSection ctrl={ctrl} services={services} categories={categories} />
      )}
      {activeTab === 'schedule' && <WeeklyScheduleSection ctrl={ctrl} />}
      {activeTab === 'leave' && <LeaveSection ctrl={ctrl} />}
    </>
  );
}
