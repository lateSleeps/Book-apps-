/**
 * @responsibility
 * Layout wrapper for all Settings V2 domain pages.
 * Structure:
 *   [Header — shrink-0]
 *   [flex-row: SettingsNavigationPanel (shrink-0) | scrollable content (flex-1)]
 *
 * Mobile: nav panel becomes a horizontal scroll bar above content.
 * Desktop (md+): nav panel is a fixed-width vertical sidebar.
 */

import type { ReactNode } from 'react';
import { SettingsNavigationPanel } from '@/features/dashboard/components/settings/SettingsNavigationPanel';
import { SettingsPageHeader } from '@/features/dashboard/components/settings/SettingsPageHeader';
import { SettingsHeaderActionsProvider } from '@/features/dashboard/components/settings/layout/SettingsHeaderActionsContext';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <SettingsHeaderActionsProvider>
      <div className="flex h-full flex-col overflow-hidden bg-bg-page">
        {/* Header */}
        <div className="shrink-0 border-b border-bd-row px-s16 pb-s16 pt-s16 md:px-s24 md:pb-s20 md:pt-s24">
          <SettingsPageHeader />
        </div>

        {/* Body: nav panel + content */}
        <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
          <SettingsNavigationPanel />

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-s16 py-s16 md:px-s24 md:py-s24">{children}</div>
          </div>
        </div>
      </div>
    </SettingsHeaderActionsProvider>
  );
}
