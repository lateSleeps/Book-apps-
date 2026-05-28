'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { AddOnsSection } from '@/features/dashboard/components/settings/AddOnsSection';
import { GeneralInfoSection } from '@/features/dashboard/components/settings/GeneralInfoSection';
import { OtherSettingsSection } from '@/features/dashboard/components/settings/OtherSettingsSection';
import { ProfileSection } from '@/features/dashboard/components/settings/ProfileSection';
import { ServicesSection } from '@/features/dashboard/components/settings/ServicesSection';
import {
  SettingsSidebar,
  type SettingsSection,
} from '@/features/dashboard/components/settings/SettingsSidebar';
import { TeamSection } from '@/features/dashboard/components/settings/TeamSection';
import { UsersAndRolesSection } from '@/features/dashboard/components/settings/UsersAndRolesSection';
import { SettingsCard } from '@/features/dashboard/components/settings/shared/SettingsCard';

const VALID_SECTIONS: SettingsSection[] = [
  'general',
  'profile',
  'services',
  'team',
  'addons',
  'users-roles',
  'other',
];

function parseSection(raw: string | null): SettingsSection {
  if (raw && (VALID_SECTIONS as string[]).includes(raw)) return raw as SettingsSection;
  return 'general';
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSection = parseSection(searchParams?.get('tab') ?? null);

  const handleSectionChange = useCallback(
    (section: SettingsSection) => {
      router.push(`/dashboard/settings?tab=${section}`);
    },
    [router]
  );

  const renderSection = useCallback(() => {
    try {
      switch (activeSection) {
        case 'general':
          return <GeneralInfoSection />;
        case 'profile':
          return <ProfileSection />;
        case 'services':
          return <ServicesSection />;
        case 'team':
          return <TeamSection />;
        case 'addons':
          return <AddOnsSection />;
        case 'users-roles':
          return <UsersAndRolesSection />;
        case 'other':
          return <OtherSettingsSection />;
        default:
          return <GeneralInfoSection />;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return (
        <SettingsCard title="Error">
          <div className="text-[13px] text-red-600">
            <p>Gagal memuat bagian pengaturan: {errorMessage}</p>
          </div>
        </SettingsCard>
      );
    }
  }, [activeSection]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: '#fafaf8' }}>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-8 py-10">
          <div className="mb-8">
            <h1 className="text-[28px] font-semibold tracking-tight text-[#1a1a1a]">Pengaturan</h1>
            <p className="mt-1 text-[13px] text-[#aaa]">Konfigurasi salon kamu</p>
          </div>

          <div className="flex min-h-0 gap-6">
            <SettingsSidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
            <div className="min-w-0 flex-1 overflow-y-auto">{renderSection()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
