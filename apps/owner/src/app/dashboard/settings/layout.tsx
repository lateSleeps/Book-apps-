/**
 * @responsibility
 * Layout wrapper for all Settings V2 domain pages.
 * Renders: SettingsPageHeader + SettingsTopTabs + scrollable content area.
 * Tab bar is naturally fixed (not inside the scrollable div).
 *
 * @structure
 * [Header — shrink-0, not scrollable]
 * [SettingsTopTabs — shrink-0, not scrollable]
 * [Content — flex-1, overflow-y-auto, children rendered here]
 */

import type { ReactNode } from 'react';
import { SettingsPageHeader } from '@/features/dashboard/components/settings/SettingsPageHeader';
import { SettingsTopTabs } from '@/features/dashboard/components/settings/SettingsTopTabs';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-bg-page">
      {/* Header — breadcrumb + title + description */}
      <div className="shrink-0 px-s16 pb-s24 pt-s16 md:px-s24 md:pt-s24">
        <SettingsPageHeader />
      </div>

      {/* Tab bar — outside scroll container, px aligns with header */}
      <SettingsTopTabs />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-s16 py-s16 md:px-s24 md:py-s24">{children}</div>
      </div>
    </div>
  );
}
