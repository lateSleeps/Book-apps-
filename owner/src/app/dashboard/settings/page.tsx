'use client';

import { useState } from 'react';
import { SettingsSidebar, type SettingsSection } from '@/features/dashboard/components/settings/SettingsSidebar';
import { GeneralInfoSection } from '@/features/dashboard/components/settings/GeneralInfoSection';
import { ProfileSection } from '@/features/dashboard/components/settings/ProfileSection';
import { ServicesSection } from '@/features/dashboard/components/settings/ServicesSection';
import { TeamSection } from '@/features/dashboard/components/settings/TeamSection';
import { AddOnsSection } from '@/features/dashboard/components/settings/AddOnsSection';
import { UsersAndRolesSection } from '@/features/dashboard/components/settings/UsersAndRolesSection';
import { OtherSettingsSection } from '@/features/dashboard/components/settings/OtherSettingsSection';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');

  const renderSection = () => {
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
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto" style={{ backgroundColor: '#fafaf8' }}>
      <div className="max-w-7xl mx-auto w-full px-8 py-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold text-[#1a1a1a] tracking-tight">Pengaturan</h1>
          <p className="text-[13px] text-[#aaa] mt-1">Konfigurasi salon kamu</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
