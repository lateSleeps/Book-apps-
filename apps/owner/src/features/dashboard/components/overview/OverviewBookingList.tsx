'use client';

import { useMemo } from 'react';
import { BookingDetailPanel } from './BookingDetailPanel';
import { BookingRow, BookingRowColumnHeaders } from './BookingRow';
import { BookingTableHeader } from './BookingTableHeader';
import { MobileBookingList } from './mobile/MobileBookingList';
import { MobileDetailSheet } from './mobile/MobileDetailSheet';
import { SkeletonRow } from '@/components/SkeletonLoader';
import type { OverviewController } from '@/features/dashboard/controller/use-overview-controller';

interface OverviewBookingListProps {
  list: OverviewController['list'];
  detail: OverviewController['detail'];
  payment: OverviewController['payment'];
  status: OverviewController['status'];
  promo: OverviewController['promo'];
  ui: OverviewController['ui'];
  isRefreshing: boolean;
  refreshData: () => void;
}

export function OverviewBookingList({
  list,
  detail,
  payment,
  status,
  promo,
  ui,
  isRefreshing,
  refreshData,
}: OverviewBookingListProps) {
  const mobileSelectedBooking = useMemo(
    () => list.bookings.find((x) => x.id === ui.mobileSelectedId) ?? null,
    [list.bookings, ui.mobileSelectedId]
  );

  return (
    <>
      {/* ── Desktop booking table ──────────────────────────────────────── */}
      <div
        className="hidden flex-col md:flex"
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderRadius: 16,
          padding: '0 0 4px',
        }}
      >
        <div style={{ padding: '20px 20px 0' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1C1C1E', margin: 0 }}>
            List kunjungan
          </h2>
        </div>
        <BookingTableHeader list={list} onRefresh={refreshData} isRefreshing={isRefreshing} />
        <BookingRowColumnHeaders />
        <div>
          {isRefreshing ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : list.bookings.length === 0 ? (
            <SkeletonRow />
          ) : (
            list.bookings.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                isExpanded={list.expandedId === b.id}
                isLoading={status.loadingBookingId === b.id}
                effectiveStatus={list.getEffectiveStatus(b.id) ?? b.status}
                onToggle={() => list.toggleExpand(b.id)}
                onDelete={() =>
                  status.openDeleteDialog({ bookingId: b.id, customerName: b.customerName })
                }
              >
                {list.expandedId === b.id && (
                  <BookingDetailPanel
                    booking={b}
                    detail={detail}
                    status={status}
                    payment={payment}
                    promo={promo}
                    list={list}
                  />
                )}
              </BookingRow>
            ))
          )}
        </div>
      </div>

      {/* ── Mobile booking list ────────────────────────────────────────── */}
      <div className="flex flex-col md:hidden">
        <MobileBookingList list={list} onSelectBooking={ui.setMobileSelectedId} />
      </div>

      {/* ── Mobile detail sheet ────────────────────────────────────────── */}
      {mobileSelectedBooking && ui.isMobile && (
        <MobileDetailSheet
          customerName={mobileSelectedBooking.customerName}
          serviceName={mobileSelectedBooking.serviceName}
          onClose={() => ui.setMobileSelectedId(null)}
        >
          <BookingDetailPanel
            booking={mobileSelectedBooking}
            detail={detail}
            status={status}
            payment={payment}
            promo={promo}
            list={list}
          />
        </MobileDetailSheet>
      )}
    </>
  );
}
