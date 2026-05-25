'use client';

import { useState, useCallback } from 'react';
import { SettingsSidebar, type SettingsSection } from '@/features/dashboard/components/settings/SettingsSidebar';
import { GeneralInfoSection } from '@/features/dashboard/components/settings/GeneralInfoSection';
import { ProfileSection } from '@/features/dashboard/components/settings/ProfileSection';
import { ServicesSection } from '@/features/dashboard/components/settings/ServicesSection';
import { TeamSection } from '@/features/dashboard/components/settings/TeamSection';
import { AddOnsSection } from '@/features/dashboard/components/settings/AddOnsSection';
import { UsersAndRolesSection } from '@/features/dashboard/components/settings/UsersAndRolesSection';
import { OtherSettingsSection } from '@/features/dashboard/components/settings/OtherSettingsSection';
import { SettingsCard } from '@/features/dashboard/components/settings/shared/SettingsCard';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [sectionError, setSectionError] = useState<string | null>(null);

  const handleSectionChange = useCallback((section: SettingsSection) => {
    setSectionError(null);
    setActiveSection(section);
  }, []);

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
      setSectionError(errorMessage);
      console.error('Error rendering section:', error);
      return (
        <SettingsCard title="Error">
          <div className="text-red-600 text-[13px]">
            <p>Gagal memuat bagian pengaturan: {errorMessage}</p>
          </div>
        </SettingsCard>
      );
    }
  }, [activeSection]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: '#fafaf8' }}>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full px-8 py-10">
          <div className="mb-8">
            <h1 className="text-[28px] font-semibold text-[#1a1a1a] tracking-tight">Pengaturan</h1>
            <p className="text-[13px] text-[#aaa] mt-1">Konfigurasi salon kamu</p>
          </div>

          <div className="flex gap-6 min-h-0">
            {/* Sidebar */}
            <SettingsSidebar activeSection={activeSection} onSectionChange={handleSectionChange} />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto min-w-0">
              {sectionError && (
                <SettingsCard title="Error">
                  <div className="text-red-600 text-[13px]">
                    <p>Gagal memuat bagian pengaturan: {sectionError}</p>
                  </div>
                </SettingsCard>
              )}
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
