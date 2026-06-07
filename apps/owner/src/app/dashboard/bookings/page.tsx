'use client';

/**
 * Riwayat Kunjungan - Visit & Transaction Archive
 * Route: /dashboard/bookings
 *
 * This page is the archive and intelligence center for past visits.
 * It does NOT duplicate Overview's operational responsibilities.
 *
 * Architecture: thin page shell - no business logic here.
 * Phase 3A: foundation layout (header, stats, filters).
 * Phase 3B: VisitTable + CustomerDetailPanel.
 */

import { useCallback, useState } from 'react';
import { HistoryFilterBar } from '@/features/dashboard/components/history/HistoryFilterBar';
import { HistoryHeader } from '@/features/dashboard/components/history/HistoryHeader';
import { HistoryStatsRow } from '@/features/dashboard/components/history/HistoryStatsRow';
import type {
  HistoryFilters,
  HistoryPeriodPreset,
  HistoryStats,
} from '@/features/dashboard/types/history.types';

// ── Mock stats - replace with use-history-stats hook in Phase 3B ──────────────

const MOCK_STATS: HistoryStats = {
  totalVisits: 127,
  totalRevenue: 8_400_000,
  bookingCount: 84,
  walkInCount: 43,
  avgTicket: 66_142,
};

const DEFAULT_FILTERS: HistoryFilters = {
  visitType: 'ALL',
  stylistId: 'ALL',
  paymentStatus: 'ALL',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const [period, setPeriod] = useState<HistoryPeriodPreset>('THIS_MONTH');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS);

  const handleFilterChange = useCallback(
    <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return (
    <div className="flex flex-col gap-s24 p-s16 md:p-s24">
      <HistoryHeader
        period={period}
        onPeriodChange={setPeriod}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <HistoryStatsRow {...MOCK_STATS} />

      <HistoryFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Phase 3B: VisitTable goes here */}
      <div className="flex min-h-[320px] items-center justify-center rounded-r16 border border-bd-card bg-bg-card shadow-card">
        <p className="text-ts-fn text-tx-muted">Tabel kunjungan - Phase 3B</p>
      </div>
    </div>
  );
}
