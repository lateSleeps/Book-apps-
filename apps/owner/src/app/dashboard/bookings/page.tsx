'use client';

/**
 * Riwayat Kunjungan - Visit & Transaction Archive
 * Route: /dashboard/bookings
 *
 * Thin shell. All state and logic lives in useHistoryController.
 * Phase 3B complete: VisitTable (desktop) + VisitMobileList (mobile).
 * Phase 4 will add CustomerDetailPanel for row tap/click.
 */

import { HistoryFilterBar } from '@/features/dashboard/components/history/HistoryFilterBar';
import { HistoryHeader } from '@/features/dashboard/components/history/HistoryHeader';
import { HistoryStatsRow } from '@/features/dashboard/components/history/HistoryStatsRow';
import { VisitMobileList } from '@/features/dashboard/components/history/VisitMobileList';
import { VisitTable } from '@/features/dashboard/components/history/VisitTable';
import { useHistoryController } from '@/features/dashboard/controller/use-history-controller';

export default function BookingsPage() {
  const {
    period,
    setPeriod,
    searchQuery,
    setSearchQuery,
    filters,
    handleFilterChange,
    handleResetFilters,
    visits,
    stylistOptions,
    stats,
    selectedVisitId,
    selectVisit,
  } = useHistoryController();

  const hasActiveFilters =
    filters.visitType !== 'ALL' ||
    filters.stylistId !== 'ALL' ||
    filters.paymentStatus !== 'ALL' ||
    searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col gap-s24 p-s16 md:p-s24">
      <HistoryHeader />

      <HistoryStatsRow {...stats} />

      {/* History Content Card — section title + controls + table on one surface */}
      <div className="overflow-hidden rounded-r16 border border-bd-card bg-bg-card shadow-card">
        {/* Card header: section title left, controls right */}
        <div className="flex flex-col gap-s12 border-b border-bd-card px-s16 py-s16 md:flex-row md:items-center md:justify-between md:px-s20">
          <h2 className="m-0 text-ts-t2 font-bold text-tx-primary">Riwayat Kunjungan Pelanggan</h2>
          <HistoryFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            period={period}
            onPeriodChange={setPeriod}
            filters={filters}
            stylistOptions={stylistOptions}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Desktop */}
        <VisitTable
          visits={visits}
          selectedVisitId={selectedVisitId}
          hasActiveFilters={hasActiveFilters}
          onRowClick={selectVisit}
        />

        {/* Mobile */}
        <VisitMobileList
          visits={visits}
          selectedVisitId={selectedVisitId}
          hasActiveFilters={hasActiveFilters}
          onCardClick={selectVisit}
        />
      </div>
    </div>
  );
}
