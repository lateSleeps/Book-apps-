/**
 * @responsibility
 * Page header for Riwayat Kunjungan.
 * Contains breadcrumb, title, and subtitle only.
 * Search and period selector live in HistoryFilterBar.
 *
 * @usedBy
 * app/dashboard/bookings/page.tsx
 */

'use client';

import { ClockCounterClockwise } from '@phosphor-icons/react';

export function HistoryHeader() {
  return (
    <div className="flex flex-col gap-s32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5">
        <ClockCounterClockwise size={18} weight="duotone" className="text-tx-secondary" />
        <span className="text-ts-fn text-tx-secondary">Dashboard</span>
        <span className="text-ts-fn text-tx-muted">/</span>
        <span className="text-ts-fn font-medium text-tx-subtle">Riwayat Kunjungan</span>
      </div>

      {/* Title */}
      <h1 className="m-0 text-ts-t1 font-bold text-tx-primary">Riwayat Kunjungan</h1>
    </div>
  );
}
