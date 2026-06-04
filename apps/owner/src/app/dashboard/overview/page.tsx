'use client';

import { SkeletonRow } from '@/components/SkeletonLoader';
import { BookingDetailPanel } from '@/features/dashboard/components/overview/BookingDetailPanel';
import {
  BookingRow,
  BookingRowColumnHeaders,
} from '@/features/dashboard/components/overview/BookingRow';
import { BookingTableHeader } from '@/features/dashboard/components/overview/BookingTableHeader';
import { StatCardsRow } from '@/features/dashboard/components/overview/StatCardsRow';
import { WalkInDrawer } from '@/features/dashboard/components/overview/WalkInDrawer';
import {
  ConfirmBookingDialog,
  DeclineBookingDialog,
  DeleteBookingDialog,
  ProofZoomDialog,
  WANotificationDialog,
} from '@/features/dashboard/components/overview/dialogs';
import { MobileBookingList } from '@/features/dashboard/components/overview/mobile/MobileBookingList';
import { MobileDetailSheet } from '@/features/dashboard/components/overview/mobile/MobileDetailSheet';
import { useOverviewController } from '@/features/dashboard/controller/use-overview-controller';
import { useServices } from '@/hooks/useServices';
import { useStylists } from '@/hooks/useStylists';

const SALON_ID = '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

export default function OverviewPage() {
  const { list, status, detail, promo, payment, walkIn, ui, stats } = useOverviewController();
  const { services: realServices } = useServices(SALON_ID);
  const { stylists: realStylists } = useStylists(SALON_ID);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F8]">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-[#EFEFEF] bg-white px-6 py-4">
        <div>
          <p className="text-[0.75rem] font-medium uppercase tracking-widest text-[#8E8E93]">
            {ui.dateLabel}
          </p>
          <h1 className="text-[1.5rem] font-bold text-[#1C1C1E]">{ui.greeting} 👋</h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <StatCardsRow stats={stats} allBookings={list.allBookings} />

        {/* ── Booking Table (desktop) ──────────────────────────────────── */}
        <div className="hidden flex-col overflow-hidden rounded-2xl border border-[#EFEFEF] bg-white shadow-sm sm:flex">
          <BookingTableHeader
            list={list}
            addDropdownOpen={walkIn.addDropdownOpen}
            setAddDropdownOpen={walkIn.setAddDropdownOpen}
            onOpenDrawer={walkIn.openDrawer}
          />

          <BookingRowColumnHeaders />

          <div className="divide-y divide-[#F7F7F8]">
            {list.bookings.length === 0 ? (
              <SkeletonRow />
            ) : (
              list.bookings.map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  isExpanded={list.expandedId === b.id}
                  isLoading={status.loadingBookingId === b.id}
                  confirmingId={status.confirmingId}
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

        {/* ── Booking List (mobile) ────────────────────────────────────── */}
        <div className="flex flex-col sm:hidden">
          <MobileBookingList list={list} onSelectBooking={ui.setMobileSelectedId} />
        </div>
      </div>

      {/* ── Mobile Detail Sheet ──────────────────────────────────────────── */}
      {ui.mobileSelectedId &&
        ui.isMobile &&
        (() => {
          const b = list.bookings.find((x) => x.id === ui.mobileSelectedId);
          if (!b) return null;
          return (
            <MobileDetailSheet
              customerName={b.customerName}
              serviceName={b.serviceName}
              onClose={() => ui.setMobileSelectedId(null)}
            >
              <BookingDetailPanel
                booking={b}
                detail={detail}
                status={status}
                payment={payment}
                promo={promo}
                list={list}
              />
            </MobileDetailSheet>
          );
        })()}

      {/* ── Walk-in Drawer + Mobile FAB ──────────────────────────────────── */}
      <WalkInDrawer
        {...walkIn}
        isMobile={ui.isMobile}
        realServices={realServices ?? []}
        realStylists={realStylists ?? []}
        effectiveBookings={list.allBookings}
        bookingStatusMap={Object.fromEntries(
          list.allBookings.map((b) => [b.id, list.getEffectiveStatus(b.id) ?? b.status])
        )}
      />

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}
      {payment.confirmDialog && (
        <ConfirmBookingDialog
          data={payment.confirmDialog}
          settlementProof={payment.pelunasanProofMap[payment.confirmDialog.bookingId]}
          isLoading={payment.isProcessingPayment}
          onSetProof={(proof) =>
            payment.setSettlementProof(payment.confirmDialog!.bookingId, proof)
          }
          onConfirm={() => payment.processPayment(payment.confirmDialog!.bookingId)}
          onCancel={payment.closeConfirmDialog}
        />
      )}

      {status.declineDialog && (
        <DeclineBookingDialog
          data={status.declineDialog}
          onReasonChange={status.setDeclineReason}
          onSubmit={status.submitDecline}
          onCancel={status.closeDeclineDialog}
          isLoading={status.isDeclining}
        />
      )}

      {status.deleteConfirm && (
        <DeleteBookingDialog
          data={status.deleteConfirm}
          onConfirm={() => {
            void status.submitDelete();
          }}
          onCancel={status.closeDeleteDialog}
        />
      )}

      {payment.proofZoom && (
        <ProofZoomDialog
          url={payment.proofZoom.url}
          label={payment.proofZoom.label}
          onClose={payment.closeProofZoom}
        />
      )}

      {status.showWANotif && status.waBookingData && (
        <WANotificationDialog
          waBookingData={status.waBookingData}
          onDismiss={status.dismissWANotif}
        />
      )}
    </div>
  );
}
