'use client';

import { HistoryFilterBar } from '@/features/dashboard/components/history/HistoryFilterBar';
import { HistoryHeader } from '@/features/dashboard/components/history/HistoryHeader';
import { VisitDetailBody } from '@/features/dashboard/components/history/VisitDetailBody';
import { VisitDetailSidebar } from '@/features/dashboard/components/history/VisitDetailSidebar';
import { VisitMobileList } from '@/features/dashboard/components/history/VisitMobileList';
import { VisitTable } from '@/features/dashboard/components/history/VisitTable';
import { ProofZoomDialog } from '@/features/dashboard/components/overview/dialogs/ProofZoomDialog';
import { MobileDetailSheet } from '@/features/dashboard/components/overview/mobile/MobileDetailSheet';
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
    selectedVisitId,
    selectVisit,
    selectedVisit,
    proofZoom,
    openProofZoom,
    closeProofZoom,
  } = useHistoryController();

  const hasActiveFilters =
    filters.visitType !== 'ALL' ||
    filters.stylistId !== 'ALL' ||
    filters.paymentStatus !== 'ALL' ||
    searchQuery.trim().length > 0;

  return (
    <>
      <div className="flex flex-col gap-s24 p-s16 md:p-s24">
        <HistoryHeader />

        {/* History Content Card */}
        <div className="overflow-hidden rounded-r16 border border-bd-card bg-bg-card shadow-card">
          {/* Title row */}
          <div className="px-s16 pb-0 pt-s20 md:px-s20">
            <h2 className="m-0 text-ts-t2 font-bold text-tx-primary">
              Riwayat Kunjungan Pelanggan
            </h2>
          </div>

          {/* Filter row */}
          <div className="px-s16 py-s16 md:px-s20">
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

          {/* Desktop table */}
          <VisitTable
            visits={visits}
            selectedVisitId={selectedVisitId}
            hasActiveFilters={hasActiveFilters}
            onRowClick={selectVisit}
          />

          {/* Mobile list */}
          <VisitMobileList
            visits={visits}
            selectedVisitId={selectedVisitId}
            hasActiveFilters={hasActiveFilters}
            onCardClick={selectVisit}
          />
        </div>
      </div>

      {/* Desktop detail sidebar */}
      {selectedVisit && (
        <VisitDetailSidebar
          key={selectedVisit.id}
          visit={selectedVisit}
          onClose={() => selectVisit(null)}
          onOpenProof={openProofZoom}
        />
      )}

      {/* Mobile detail sheet */}
      {selectedVisit && (
        <div className="md:hidden">
          <MobileDetailSheet
            customerName={selectedVisit.customerName}
            serviceName={selectedVisit.serviceName}
            onClose={() => selectVisit(null)}
          >
            <VisitDetailBody visit={selectedVisit} onOpenProof={openProofZoom} />
          </MobileDetailSheet>
        </div>
      )}

      {/* Proof zoom dialog — shared desktop + mobile */}
      {proofZoom && (
        <ProofZoomDialog url={proofZoom.url} label={proofZoom.label} onClose={closeProofZoom} />
      )}
    </>
  );
}
