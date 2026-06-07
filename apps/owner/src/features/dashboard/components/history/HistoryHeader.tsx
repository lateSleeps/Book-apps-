/**
 * @responsibility
 * Page header for Riwayat Kunjungan.
 * Contains breadcrumb, title, subtitle, search input, and period selector.
 *
 * @usedBy
 * app/dashboard/bookings/page.tsx
 *
 * @notes
 * - Presentation only — no local state.
 * - Search and period state owned by parent.
 */

'use client';

import { ClockCounterClockwise, MagnifyingGlass } from '@phosphor-icons/react';
import type { HistoryPeriodPreset } from '../../types/history.types';
import { PeriodSelector } from './PeriodSelector';

interface HistoryHeaderProps {
  period: HistoryPeriodPreset;
  onPeriodChange: (period: HistoryPeriodPreset) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function HistoryHeader({
  period,
  onPeriodChange,
  searchQuery,
  onSearchChange,
}: HistoryHeaderProps) {
  return (
    <div className="flex flex-col gap-s16 md:flex-row md:items-start md:justify-between">
      {/* Left: breadcrumb + title + subtitle */}
      <div className="flex flex-col gap-s8">
        <div className="flex items-center gap-1.5">
          <ClockCounterClockwise size={14} weight="duotone" className="text-tx-secondary" />
          <span className="text-ts-cap1 text-tx-secondary">Dashboard</span>
          <span className="text-ts-cap1 text-tx-muted">/</span>
          <span className="text-ts-cap1 font-medium text-tx-subtle">Riwayat Kunjungan</span>
        </div>

        <div>
          <h1 className="m-0 text-ts-t1 font-bold text-tx-primary">Riwayat Kunjungan</h1>
          <p className="mt-s4 text-ts-fn text-tx-secondary">
            Lihat aktivitas kunjungan dan transaksi pelanggan dalam 12 bulan terakhir
          </p>
        </div>
      </div>

      {/* Right: search + period selector */}
      <div className="flex shrink-0 flex-wrap items-center gap-s8">
        {/* Search input */}
        <div className="flex h-9 items-center gap-s8 rounded-r10 border border-bd-card bg-bg-input px-s12">
          <MagnifyingGlass size={14} weight="duotone" className="shrink-0 text-tx-secondary" />
          <input
            type="text"
            placeholder="Cari nama customer..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-40 bg-transparent text-ts-fn text-tx-primary placeholder:text-tx-muted focus:outline-none"
          />
        </div>

        <PeriodSelector value={period} onChange={onPeriodChange} />
      </div>
    </div>
  );
}
