import type { ReactNode } from 'react';
import { SettingsSubNav } from './SettingsSubNav';

interface TabItem {
  id: string;
  label: string;
}

interface SettingsTabbedCardProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: ReactNode;
}

export function SettingsTabbedCard({
  tabs,
  activeTab,
  onTabChange,
  children,
}: SettingsTabbedCardProps) {
  return (
    <div className="overflow-hidden rounded-r16 border border-bd-card bg-bg-card shadow-card">
      <div className="border-b border-bd-row px-s20 py-s16">
        <SettingsSubNav items={tabs} activeId={activeTab} onChange={onTabChange} />
      </div>
      <div className="p-s20 md:p-s24">{children}</div>
    </div>
  );
}
