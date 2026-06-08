/**
 * @responsibility
 * Page header for Pengaturan.
 * Contains breadcrumb and page title only.
 * Follows the same pattern as HistoryHeader and OverviewHeader.
 *
 * @usedBy
 * app/dashboard/settings/layout.tsx
 */

'use client';

import { Gear } from '@phosphor-icons/react';

export function SettingsPageHeader() {
  return (
    <div className="flex flex-col gap-s32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5">
        <Gear size={18} weight="duotone" className="text-tx-secondary" />
        <span className="text-ts-fn text-tx-secondary">Dashboard</span>
        <span className="text-ts-fn text-tx-muted">/</span>
        <span className="text-ts-fn font-medium text-tx-subtle">Pengaturan</span>
      </div>

      {/* Title + description */}
      <div className="flex flex-col gap-s4">
        <h1 className="m-0 text-ts-t1 font-bold text-tx-primary">Pengaturan</h1>
        <p className="m-0 text-ts-fn text-tx-secondary">
          Kelola profil, layanan, tim, dan konfigurasi salon Anda.
        </p>
      </div>
    </div>
  );
}
