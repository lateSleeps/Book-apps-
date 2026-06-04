'use client';

import React from 'react';
import type { WalkInFlowState } from '../../hooks/overview/use-walk-in-flow';
import type { DashboardBooking } from '../../types/dashboard.types';
import { AddVisitFAB } from './AddVisitFAB';
import { BarcodeScanner } from './BarcodeScanner';
import { BookingCodeSection } from './BookingCodeSection';
import { ServiceSearchDropdown } from './ServiceSearchDropdown';
import { StylistTimeSelector } from './StylistTimeSelector';
import { WalkInNamePhoneFields } from './WalkInNamePhoneFields';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyService = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyStylist = any;

interface WalkInDrawerProps extends WalkInFlowState {
  isMobile: boolean;
  realServices: AnyService[];
  realStylists: AnyStylist[];
  effectiveBookings: DashboardBooking[];
  bookingStatusMap: Record<string, string>;
  setManualBookings: React.Dispatch<React.SetStateAction<DashboardBooking[]>>;
  createBookingMutation: {
    mutateAsync: (args: {
      salonId: string;
      serviceId: string;
      stylistId: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
      customerName: string;
      customerPhone: string;
      customerEmail: string;
      notes: string;
      paymentStatus: string;
    }) => Promise<unknown>;
  };
}

const SALON_ID = '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

export function WalkInDrawer({
  addDrawer,
  addDropdownOpen,
  walkInForm,
  setWalkInForm,
  drawerServiceSearch,
  setDrawerServiceSearch,
  drawerServiceOpen,
  setDrawerServiceOpen,
  expandedStylistSlots,
  toggleStylistSlots,
  bookingCodeInput,
  setBookingCodeInput,
  barcodeScannerActive,
  videoRef,
  canvasRef,
  startBarcodeScanner,
  stopBarcodeScanner,
  closeDrawer,
  openDrawer,
  setAddDropdownOpen,
  isMobile,
  realServices,
  realStylists,
  effectiveBookings,
  bookingStatusMap,
  setManualBookings,
  createBookingMutation,
}: WalkInDrawerProps) {
  const isSubmitDisabled = !walkInForm.name || !walkInForm.serviceId || !walkInForm.stylistId;

  async function handleSubmitWalkIn() {
    const svc = (realServices as AnyService[]).find(
      (s: AnyService) => s.id === walkInForm.serviceId
    );
    const stylist = (realStylists as AnyStylist[]).find(
      (s: AnyService) => s.id === walkInForm.stylistId
    );
    if (!svc || !stylist) return;

    const now = new Date();
    const timeSlot =
      walkInForm.time ||
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const [h, m] = timeSlot.split(':').map(Number);
    const totalMin = h * 60 + m + (svc.duration || 60);
    const endTime = `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
    const stylistName = stylist.user?.full_name ?? stylist.name ?? 'Stylist';
    const stylistInitials = stylistName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    const newId = `walkin-${Date.now()}`;
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    setManualBookings((prev) => [
      {
        id: newId,
        bookingCode: `WI-${newId.slice(-6).toUpperCase()}`,
        customerName: walkInForm.name,
        customerPhone: walkInForm.phone || '-',
        customerEmail: '',
        serviceName: svc.name,
        categoryName: svc.categoryName ?? svc.category?.name ?? '',
        stylistName,
        stylistInitials,
        stylistColor: '#c8ede2',
        date: today,
        timeSlot,
        endTime,
        duration: svc.duration || 60,
        price: svc.price,
        status: 'IN_PROGRESS',
        visitorType: 'WALK_IN',
        paymentStatus: 'PAID',
        addOns: [],
        notes: 'Walk-in',
        createdAt: now.toISOString(),
      },
      ...prev,
    ]);
    setWalkInForm(() => ({ name: '', phone: '', serviceId: '', stylistId: '', time: timeSlot }));
    closeDrawer();

    createBookingMutation
      .mutateAsync({
        salonId: SALON_ID,
        serviceId: svc.id,
        stylistId: stylist.id,
        bookingDate: today,
        startTime: timeSlot,
        endTime,
        customerName: walkInForm.name,
        customerPhone: walkInForm.phone || '-',
        customerEmail: '',
        notes: 'Walk-in',
        paymentStatus: 'lunas',
      })
      .catch((e) => console.error('Failed to save walk-in to DB:', e));
  }

  return (
    <>
      {/* ── Side Drawer Panel ───────────────────────────────────────────── */}
      {addDrawer !== 'CLOSED' && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" onClick={closeDrawer} />
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              maxWidth: '28rem',
              height: '100%',
              background: 'white',
              borderRadius: 20,
              boxShadow: '-8px 0 48px rgba(0,0,0,0.18)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px 16px',
                borderBottom: '1px solid #F2F2F7',
                flexShrink: 0,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#8E8E93',
                    margin: '0 0 2px 0',
                  }}
                >
                  Tambah Kunjungan
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1C1C1E', margin: 0 }}>
                  {addDrawer === 'WALK_IN' ? 'Walk-in' : 'Booking Online'}
                </h3>
              </div>
              <button
                onClick={closeDrawer}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#F2F2F7',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="#8E8E93"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
                </svg>
              </button>
            </div>

            {/* Form content */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                overflowY: 'auto',
                padding: '20px 24px',
              }}
            >
              {addDrawer === 'WALK_IN' && (
                <>
                  <WalkInNamePhoneFields walkInForm={walkInForm} setWalkInForm={setWalkInForm} />
                  <ServiceSearchDropdown
                    walkInForm={walkInForm}
                    setWalkInForm={setWalkInForm}
                    drawerServiceSearch={drawerServiceSearch}
                    setDrawerServiceSearch={setDrawerServiceSearch}
                    drawerServiceOpen={drawerServiceOpen}
                    setDrawerServiceOpen={setDrawerServiceOpen}
                    realServices={realServices}
                  />
                  <StylistTimeSelector
                    walkInForm={walkInForm}
                    setWalkInForm={setWalkInForm}
                    expandedStylistSlots={expandedStylistSlots}
                    toggleStylistSlots={toggleStylistSlots}
                    realServices={realServices}
                    realStylists={realStylists}
                    effectiveBookings={effectiveBookings}
                    bookingStatusMap={bookingStatusMap}
                  />
                </>
              )}

              {addDrawer === 'BOOKING' && (
                <BookingCodeSection
                  bookingCodeInput={bookingCodeInput}
                  setBookingCodeInput={setBookingCodeInput}
                  onScanBarcode={startBarcodeScanner}
                />
              )}
            </div>

            {/* Footer CTA */}
            {addDrawer === 'WALK_IN' && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #F2F2F7', flexShrink: 0 }}>
                <button
                  disabled={isSubmitDisabled}
                  onClick={handleSubmitWalkIn}
                  style={{
                    width: '100%',
                    height: 44,
                    borderRadius: 10,
                    border: 'none',
                    background: isSubmitDisabled ? '#F2F2F7' : '#1C1C1E',
                    color: isSubmitDisabled ? '#C7C7CC' : 'white',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Tambahkan ke Daftar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Barcode Scanner Modal ──────────────────────────────────────── */}
      {barcodeScannerActive && isMobile && (
        <BarcodeScanner videoRef={videoRef} canvasRef={canvasRef} onClose={stopBarcodeScanner} />
      )}

      {/* ── Mobile Floating Action Button ─────────────────────────────── */}
      <AddVisitFAB
        addDropdownOpen={addDropdownOpen}
        setAddDropdownOpen={setAddDropdownOpen}
        isMobile={isMobile}
        onOpenWalkIn={() => {
          openDrawer('WALK_IN');
          setDrawerServiceOpen(false);
          setDrawerServiceSearch('');
        }}
        onOpenBooking={() => {
          openDrawer('BOOKING');
          setDrawerServiceOpen(false);
          setDrawerServiceSearch('');
        }}
      />
    </>
  );
}
