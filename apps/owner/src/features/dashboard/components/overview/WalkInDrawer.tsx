'use client';

import { CaretDown } from '@phosphor-icons/react';
import React from 'react';
import type { WalkInFlowState } from '../../hooks/overview/use-walk-in-flow';
import type { DashboardBooking } from '../../types/dashboard.types';
import type { WalkInFormData } from '../../types/overview.types';

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
  return (
    <>
      {/* ── Side Drawer Panel ─────────────────────────────────────────────── */}
      {addDrawer !== 'CLOSED' && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" onClick={closeDrawer} />
          {/* Floating side panel */}
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
                  {/* Nama + HP */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#8E8E93',
                        }}
                      >
                        Nama <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nama lengkap"
                        value={walkInForm.name}
                        onChange={(e) => setWalkInForm((f) => ({ ...f, name: e.target.value }))}
                        style={{
                          height: 40,
                          borderRadius: 10,
                          border: '1px solid #E5E5EA',
                          background: '#F9F9FB',
                          padding: '0 14px',
                          fontSize: 14,
                          color: '#1C1C1E',
                          outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#8E8E93',
                        }}
                      >
                        Nomor HP
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="08xxxxxxxxxx"
                        value={walkInForm.phone}
                        onChange={(e) =>
                          setWalkInForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))
                        }
                        style={{
                          height: 40,
                          borderRadius: 10,
                          border: '1px solid #E5E5EA',
                          background: '#F9F9FB',
                          padding: '0 14px',
                          fontSize: 14,
                          color: '#1C1C1E',
                          outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>

                  {/* Layanan */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#8E8E93',
                      }}
                    >
                      Layanan <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setDrawerServiceOpen(!drawerServiceOpen)}
                        style={{
                          width: '100%',
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderRadius: 10,
                          border: '1px solid #E5E5EA',
                          background: '#F9F9FB',
                          padding: '0 14px',
                          fontSize: 14,
                          color: walkInForm.serviceId ? '#1C1C1E' : '#C7C7CC',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'inherit',
                        }}
                      >
                        <span>
                          {walkInForm.serviceId
                            ? (realServices as AnyService[]).find(
                                (s: AnyService) => s.id === walkInForm.serviceId
                              )?.name
                            : 'Pilih layanan...'}
                        </span>
                        <CaretDown
                          size={12}
                          weight="bold"
                          color="#8E8E93"
                          style={{
                            flexShrink: 0,
                            transform: drawerServiceOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.15s',
                          }}
                        />
                      </button>
                      {drawerServiceOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: '100%',
                            marginTop: 4,
                            background: 'white',
                            borderRadius: 12,
                            border: '1px solid #E5E5EA',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                            zIndex: 20,
                            maxHeight: 280,
                            overflowY: 'auto',
                          }}
                        >
                          {/* Search */}
                          <div style={{ padding: '10px 12px 6px' }}>
                            <input
                              type="text"
                              placeholder="Cari layanan..."
                              autoFocus
                              value={drawerServiceSearch}
                              onChange={(e) => setDrawerServiceSearch(e.target.value)}
                              style={{
                                width: '100%',
                                height: 34,
                                borderRadius: 8,
                                border: '1px solid #E5E5EA',
                                background: '#F9F9FB',
                                padding: '0 12px',
                                fontSize: 13,
                                color: '#1C1C1E',
                                outline: 'none',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>
                          {/* Options */}
                          <div style={{ padding: '4px 0 8px' }}>
                            {(() => {
                              const q = drawerServiceSearch.toLowerCase();
                              const filtered = (realServices as AnyService[]).filter(
                                (s: AnyService) =>
                                  !q ||
                                  s.name.toLowerCase().includes(q) ||
                                  (s.categoryName ?? s.category?.name ?? '')
                                    .toLowerCase()
                                    .includes(q)
                              );
                              if (filtered.length === 0)
                                return (
                                  <p
                                    style={{
                                      fontSize: 13,
                                      color: '#8E8E93',
                                      textAlign: 'center',
                                      padding: '16px',
                                      margin: 0,
                                    }}
                                  >
                                    Layanan tidak ditemukan
                                  </p>
                                );
                              const grouped = filtered.reduce<Record<string, AnyService[]>>(
                                (acc, s) => {
                                  const cat = s.categoryName ?? s.category?.name ?? 'Lainnya';
                                  (acc[cat] = acc[cat] ?? []).push(s);
                                  return acc;
                                },
                                {}
                              );
                              return Object.entries(grouped).map(([cat, svcs]) => (
                                <div key={cat}>
                                  {!drawerServiceSearch && (
                                    <p
                                      style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        color: '#8E8E93',
                                        padding: '10px 16px 4px',
                                        margin: 0,
                                      }}
                                    >
                                      {cat}
                                    </p>
                                  )}
                                  {svcs.map((s) => {
                                    const isActive = walkInForm.serviceId === s.id;
                                    return (
                                      <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => {
                                          setWalkInForm((f: WalkInFormData) => ({
                                            ...f,
                                            serviceId: s.id,
                                            stylistId: '',
                                          }));
                                          setDrawerServiceSearch('');
                                          setDrawerServiceOpen(false);
                                        }}
                                        style={{
                                          width: '100%',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          padding: '10px 16px',
                                          border: 'none',
                                          background: isActive ? '#F2F2F7' : 'transparent',
                                          cursor: 'pointer',
                                          textAlign: 'left',
                                          fontFamily: 'inherit',
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: 14,
                                            color: '#1C1C1E',
                                            fontWeight: isActive ? 600 : 400,
                                          }}
                                        >
                                          {s.name}
                                        </span>
                                        <span style={{ fontSize: 13, color: '#8E8E93' }}>
                                          {s.duration}m
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stylist + Time Slots */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#8E8E93',
                      }}
                    >
                      Stylist &amp; Jam <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    {(() => {
                      const today = new Date().toISOString().slice(0, 10);
                      const allSlots: string[] = [];
                      for (let h = 8; h < 20; h++) {
                        allSlots.push(`${String(h).padStart(2, '0')}:00`);
                        allSlots.push(`${String(h).padStart(2, '0')}:30`);
                      }
                      const svcDuration = (() => {
                        const svc = (realServices as AnyService[]).find(
                          (s: AnyService) => s.id === walkInForm.serviceId
                        );
                        return svc?.duration ?? 60;
                      })();
                      return (realStylists as AnyStylist[]).map((s: AnyService) => {
                        const name = s.user?.full_name ?? s.name ?? 'Stylist';
                        const initials = name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2);
                        const isSelected = walkInForm.stylistId === s.id;
                        const todayBookings = effectiveBookings.filter(
                          (b) =>
                            b.stylistName === name &&
                            b.date === today &&
                            (bookingStatusMap[b.id] ?? b.status) !== 'CANCELLED'
                        );
                        const slots = allSlots.map((time) => {
                          const [h, m] = time.split(':').map(Number);
                          const start = h * 60 + m;
                          const end = start + svcDuration;
                          const booked = todayBookings.some((b) => {
                            const [bh, bm] = (b.timeSlot || '00:00').split(':').map(Number);
                            const [eh, em] = (b.endTime || '00:00').split(':').map(Number);
                            return start < eh * 60 + em && end > bh * 60 + bm;
                          });
                          return { time, available: !booked };
                        });
                        const availableSlots = slots.filter((sl) => sl.available);
                        const isFullyBooked = availableSlots.length === 0;
                        return (
                          <div
                            key={s.id}
                            style={{
                              borderRadius: 16,
                              border: isSelected ? '2px solid #1C1C1E' : '1px solid #F0F0F3',
                              background: 'white',
                              opacity: isFullyBooked ? 0.45 : 1,
                              overflow: 'hidden',
                              transition: 'border 0.15s',
                            }}
                          >
                            {/* Row: avatar + name + slots */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 12,
                                padding: '14px 16px',
                              }}
                            >
                              {/* Avatar */}
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  background: '#c8ede2',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: '#1C1C1E',
                                  flexShrink: 0,
                                }}
                              >
                                {initials}
                              </div>
                              {/* Name + chips */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 8,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 14,
                                      fontWeight: 600,
                                      color: '#1C1C1E',
                                      margin: 0,
                                    }}
                                  >
                                    {name}
                                  </p>
                                  {isFullyBooked ? (
                                    <span
                                      style={{ fontSize: 11, color: '#ef4444', fontWeight: 500 }}
                                    >
                                      Penuh
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: 11, color: '#8E8E93' }}>
                                      {availableSlots.length} slot
                                    </span>
                                  )}
                                </div>
                                {!isFullyBooked && (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    {(isSelected
                                      ? [{ time: walkInForm.time, available: true }]
                                      : availableSlots.slice(0, 3)
                                    ).map((sl) => (
                                      <button
                                        key={sl.time}
                                        type="button"
                                        onClick={() =>
                                          setWalkInForm((f) => ({
                                            ...f,
                                            stylistId: s.id,
                                            time: sl.time,
                                          }))
                                        }
                                        style={{
                                          padding: '6px 13px',
                                          borderRadius: 999,
                                          border: 'none',
                                          fontSize: 13,
                                          fontWeight: 600,
                                          background: isSelected ? '#1C1C1E' : '#F2F2F7',
                                          color: isSelected ? 'white' : '#1C1C1E',
                                          cursor: 'pointer',
                                          transition: 'all 0.12s',
                                          flexShrink: 0,
                                        }}
                                      >
                                        {sl.time}
                                      </button>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => toggleStylistSlots(s.id)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: '#007AFF',
                                        cursor: 'pointer',
                                        padding: '6px 2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 3,
                                        flexShrink: 0,
                                      }}
                                    >
                                      {expandedStylistSlots[s.id] ? 'Sembunyikan' : 'Lihat semua'}
                                      <CaretDown
                                        size={9}
                                        weight="bold"
                                        color="#007AFF"
                                        style={{
                                          transform: expandedStylistSlots[s.id]
                                            ? 'rotate(180deg)'
                                            : 'none',
                                          transition: 'transform 0.15s',
                                        }}
                                      />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Accordion: full slot grid */}
                            {!isFullyBooked && expandedStylistSlots[s.id] && (
                              <div
                                style={{
                                  borderTop: '1px solid #F2F2F7',
                                  padding: '12px 16px',
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 8,
                                }}
                              >
                                {slots.map((sl) => {
                                  const isChipSelected = isSelected && walkInForm.time === sl.time;
                                  return (
                                    <button
                                      key={sl.time}
                                      type="button"
                                      disabled={!sl.available}
                                      onClick={() =>
                                        setWalkInForm((f) => ({
                                          ...f,
                                          stylistId: s.id,
                                          time: sl.time,
                                        }))
                                      }
                                      style={{
                                        padding: '6px 13px',
                                        borderRadius: 999,
                                        border: 'none',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: sl.available ? 'pointer' : 'default',
                                        background: isChipSelected
                                          ? '#1C1C1E'
                                          : sl.available
                                            ? '#F2F2F7'
                                            : '#F5F5F7',
                                        color: isChipSelected
                                          ? 'white'
                                          : sl.available
                                            ? '#1C1C1E'
                                            : '#C7C7CC',
                                        textDecoration: sl.available ? 'none' : 'line-through',
                                        transition: 'all 0.12s',
                                      }}
                                    >
                                      {sl.time}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              )}

              {addDrawer === 'BOOKING' && (
                <>
                  {/* Kode booking */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#444]">
                      Kode Booking
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="RB-2025-XXX"
                        value={bookingCodeInput}
                        onChange={(e) => setBookingCodeInput(e.target.value.toUpperCase())}
                        className="h-10 flex-1 rounded-xl border border-[#e8e8e8] px-3.5 text-[0.9375rem] uppercase tracking-wider text-[#1a1a1a] transition-colors placeholder:text-[#ccc] focus:border-[#bbb] focus:outline-none"
                      />
                      <button className="h-10 shrink-0 rounded-xl bg-[#1a1a1a] px-4 text-[0.8125rem] font-medium text-white transition-colors hover:bg-[#333]">
                        Cari
                      </button>
                    </div>
                  </div>

                  {/* Scan barcode */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#444]">
                      Atau Scan Barcode
                    </label>
                    <button
                      onClick={startBarcodeScanner}
                      className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#e0e0e0] text-gray-400 transition-colors hover:border-[#bbb] hover:bg-[#fafaf8] hover:text-gray-500"
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                        <rect x="7" y="7" width="3" height="10" rx="0.5" />
                        <rect x="14" y="7" width="3" height="10" rx="0.5" />
                      </svg>
                      <span className="text-[0.8125rem] font-medium">Tap untuk scan barcode</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer CTA */}
            {addDrawer === 'WALK_IN' && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #F2F2F7', flexShrink: 0 }}>
                <button
                  disabled={!walkInForm.name || !walkInForm.serviceId || !walkInForm.stylistId}
                  onClick={async () => {
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
                    setWalkInForm(() => ({
                      name: '',
                      phone: '',
                      serviceId: '',
                      stylistId: '',
                      time: timeSlot,
                    }));
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
                  }}
                  style={{
                    width: '100%',
                    height: 44,
                    borderRadius: 10,
                    border: 'none',
                    background:
                      !walkInForm.name || !walkInForm.serviceId || !walkInForm.stylistId
                        ? '#F2F2F7'
                        : '#1C1C1E',
                    color:
                      !walkInForm.name || !walkInForm.serviceId || !walkInForm.stylistId
                        ? '#C7C7CC'
                        : 'white',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor:
                      !walkInForm.name || !walkInForm.serviceId || !walkInForm.stylistId
                        ? 'not-allowed'
                        : 'pointer',
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

      {/* ── Barcode Scanner Modal ─────────────────────────────────────────── */}
      {barcodeScannerActive && isMobile && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 md:hidden">
          <div className="relative mx-4 w-full max-w-md">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="aspect-video w-full rounded-xl bg-black object-cover"
            />
            <canvas ref={canvasRef} width={1280} height={720} className="hidden" />
            <div className="absolute inset-0 rounded-xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-40 w-64 rounded-lg border-2 border-[#3b82f6]" />
              </div>
              <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-[#3b82f6]" />
              <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-[#3b82f6]" />
              <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-[#3b82f6]" />
              <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-[#3b82f6]" />
            </div>
            <button
              onClick={stopBarcodeScanner}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 transition-colors hover:bg-white"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white">
                📸 Arahkan ke barcode/QR code
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Floating Action Button ────────────────────────────────── */}
      <div className="fixed bottom-6 right-4 z-40 sm:hidden">
        <button
          onClick={() => setAddDropdownOpen(!addDropdownOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1a1a] text-white shadow-lg transition-all hover:bg-[#333] active:scale-95"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        {addDropdownOpen && isMobile && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setAddDropdownOpen(false)} />
            <div className="absolute bottom-20 right-0 z-40 w-[13rem] overflow-hidden rounded-xl border border-[#efefed] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <button
                onClick={() => {
                  openDrawer('WALK_IN');
                  setDrawerServiceOpen(false);
                  setDrawerServiceSearch('');
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f8f8f6]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f0f0ee]">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="#555"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="8" cy="5" r="2.5" />
                    <path d="M3 14c0-3 2-5 5-5s5 2 5 5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[0.875rem] font-medium text-[#1a1a1a]">Walk-in</p>
                  <p className="text-[0.75rem] text-gray-500">Datang langsung</p>
                </div>
              </button>
              <div className="mx-4 h-px bg-[#f5f5f3]" />
              <button
                onClick={() => {
                  openDrawer('BOOKING');
                  setDrawerServiceOpen(false);
                  setDrawerServiceSearch('');
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f8f8f6]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f0f0ee]">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="#555"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="12" height="10" rx="1.5" />
                    <path d="M5 7h6M5 10h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-[0.875rem] font-medium text-[#1a1a1a]">Booking Online</p>
                  <p className="text-[0.75rem] text-gray-500">Sudah punya kode booking</p>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
