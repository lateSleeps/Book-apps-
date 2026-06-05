'use client';

import { PlusIcon } from '@heroicons/react/24/solid';
import { CalendarCheck, PersonSimpleWalk } from '@phosphor-icons/react';
import { SkeletonRow } from '@/components/SkeletonLoader';
import { useCurrentUser } from '@/features/auth/hooks/useAuth';
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
  const currentUser = useCurrentUser();
  const { services: realServices } = useServices(SALON_ID);
  const { stylists: realStylists } = useStylists(SALON_ID);

  return (
    <>
      {/* ── Responsive CSS ──────────────────────────────────────────────── */}
      <style suppressHydrationWarning>{`
        @media (max-width: 1023px) {
          .payment-grid-tablet { gap: 2.5rem !important; }
        }
        @media (max-width: 767px) {
          .expanded-details-mobile { grid-template-columns: 1fr !important; }
          .expanded-col-separator {
            border-right: none !important;
            border-bottom: 1px solid #f0f0f0 !important;
          }
          .expanded-details-mobile > div > div {
            padding-bottom: 1rem !important;
            padding-right: 0 !important;
            padding-left: 0 !important;
          }
          .visitor-row-badges { flex-wrap: wrap !important; gap: 0.5rem !important; }
          .visitor-name-mobile { font-size: 0.8125rem !important; }
          .visitor-service-mobile { font-size: 0.75rem !important; }
          .visitor-tabs-mobile { gap: 0.25rem !important; }
          .search-bar-mobile { flex: 1 !important; width: auto !important; }
          .visitor-header-controls { flex-direction: column !important; gap: 0.5rem !important; }
          .sort-button-mobile { width: 100% !important; }
          .payment-section-mobile { grid-template-columns: 1fr !important; }
          .button-group-mobile { gap: 0.5rem !important; }
          .button-group-mobile button {
            font-size: 0.75rem !important;
            padding: 0.5rem 0.75rem !important;
            height: auto !important;
          }
          .greeting-section-mobile {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .greeting-text-mobile h1 { font-size: 1.125rem !important; }
          .hide-on-mobile { display: none !important; }
          .dropdown-item-mobile { padding: 0.75rem !important; }
        }
      `}</style>

      <div className="flex flex-1 flex-col overflow-y-auto" style={{ backgroundColor: '#F2F2F7' }}>
        <div className="flex w-full flex-col gap-5 px-4 py-5 sm:gap-7 sm:px-6 sm:py-7 md:gap-10 md:px-8 md:py-10">
          {/* ── Greeting + Tambah Pelanggan ──────────────────────────────── */}
          <div className="greeting-section-mobile flex items-center justify-between gap-4">
            <div className="greeting-text-mobile flex flex-col" style={{ gap: '2rem' }}>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* Home icon */}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8E8E93"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span style={{ fontSize: 12, color: '#8E8E93' }}>Dashboard</span>
                <span style={{ fontSize: 12, color: '#C7C7CC' }}>/</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#1C1C1E' }}>Overview</span>
              </div>
              {/* Greeting */}
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#1C1C1E',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {ui.greeting || 'Halo'}, {currentUser?.name?.split(' ')[0] ?? 'Owner'} 👋
              </h1>
            </div>

            {/* Desktop "Tambah Pelanggan" button */}
            <div className="relative hidden flex-shrink-0 sm:block">
              <button
                onClick={() => walkIn.setAddDropdownOpen(!walkIn.addDropdownOpen)}
                className="flex h-10 items-center gap-2 rounded-xl bg-[#1a1a1a] px-4 text-[0.875rem] font-medium text-white transition-colors hover:bg-[#333]"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                <span>Tambah Pelanggan</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${walkIn.addDropdownOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              {walkIn.addDropdownOpen && (
                <>
                  {ui.isMobile && (
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => walkIn.setAddDropdownOpen(false)}
                    />
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      zIndex: 40,
                      width: 220,
                      background: 'white',
                      borderRadius: 14,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                      overflow: 'hidden',
                      padding: 6,
                    }}
                  >
                    <button
                      onClick={() => {
                        walkIn.openDrawer('WALK_IN');
                        walkIn.setDrawerServiceOpen(false);
                        walkIn.setDrawerServiceSearch('');
                      }}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F7')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <PersonSimpleWalk
                        size={20}
                        weight="duotone"
                        color="#1C1C1E"
                        style={{ flexShrink: 0 }}
                      />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1C1E', margin: 0 }}>
                          Walk-in
                        </p>
                        <p style={{ fontSize: 12, color: '#8E8E93', margin: 0 }}>Datang langsung</p>
                      </div>
                    </button>
                    <div style={{ height: 1, background: '#F2F2F7', margin: '2px 10px' }} />
                    <button
                      onClick={() => {
                        walkIn.openDrawer('BOOKING');
                        walkIn.setDrawerServiceOpen(false);
                        walkIn.setDrawerServiceSearch('');
                      }}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F7')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <CalendarCheck
                        size={20}
                        weight="duotone"
                        color="#1C1C1E"
                        style={{ flexShrink: 0 }}
                      />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1C1E', margin: 0 }}>
                          Booking Online
                        </p>
                        <p style={{ fontSize: 12, color: '#8E8E93', margin: 0 }}>
                          Sudah punya kode booking
                        </p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Stat Cards ──────────────────────────────────────────────── */}
          <StatCardsRow stats={stats} allBookings={list.allBookings} />

          {/* ── Booking Table (desktop) ──────────────────────────────── */}
          <div
            className="hidden flex-col md:flex"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderRadius: 16,
              padding: '0 0 4px',
            }}
          >
            {/* List kunjungan heading */}
            <div style={{ padding: '20px 20px 0' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1C1C1E', margin: 0 }}>
                List kunjungan
              </h2>
            </div>
            <BookingTableHeader list={list} />
            <BookingRowColumnHeaders />
            <div>
              {list.bookings.length === 0 ? (
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

          {/* ── Booking List (mobile) ────────────────────────────────── */}
          <div className="flex flex-col md:hidden">
            <MobileBookingList list={list} onSelectBooking={ui.setMobileSelectedId} />
          </div>
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
    </>
  );
}
