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
      <HistoryHeader
        period={period}
        onPeriodChange={setPeriod}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <HistoryStatsRow {...stats} />

      <HistoryFilterBar
        filters={filters}
        stylistOptions={stylistOptions}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

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
  );
}
