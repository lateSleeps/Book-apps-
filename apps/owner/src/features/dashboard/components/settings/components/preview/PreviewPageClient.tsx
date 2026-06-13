'use client';

import { useState } from 'react';
import { SettingsContentGate } from '../../layout/SettingsContentGate';
import { PreviewFrame } from './PreviewFrame';
import { PreviewSummaryPanel } from './PreviewSummaryPanel';
import { usePreviewHealth } from '@/features/dashboard/hooks/settings/usePreviewHealth';

export function PreviewPageClient() {
  const { readiness, isLoading } = usePreviewHealth();
  const slug = readiness?.slug ?? null;
  const [refreshKey, setRefreshKey] = useState(0);

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <SettingsContentGate>
      <div className="flex w-full flex-col gap-s16 pb-s20 xl:grid xl:grid-cols-[minmax(0,520px)_minmax(280px,360px)] xl:items-start xl:gap-s20">
        {/* LEFT — preview hero (iPhone SE 375×667) */}
        <div className="min-w-0">
          <PreviewFrame slug={slug} refreshKey={refreshKey} onRefresh={handleRefresh} />
        </div>

        {/* RIGHT — health + link + refresh */}
        <div className="min-w-0">
          <PreviewSummaryPanel
            slug={slug}
            readiness={readiness}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </SettingsContentGate>
  );
}
