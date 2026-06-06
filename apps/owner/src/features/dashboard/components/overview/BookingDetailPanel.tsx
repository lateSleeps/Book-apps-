/**
 * @responsibility
 * Full expanded detail panel for a booking row.
 * 3-column layout: Contact | Service | Add-ons, then full-width PaymentSection.
 *
 * @usedBy
 * BookingRow.tsx (as children when isExpanded)
 *
 * @notes
 * - Presentation only — no local state.
 * - 3 columns share the same booking context; extracting them separately
 *   would not reduce prop drilling, so they remain as sections here.
 * - Column 1: phone, WA, DP proof, confirm/decline buttons
 * - Column 2: service (view/edit), additional services, treatment notes
 * - Column 3: add-ons, product picker, promo code
 * - Bottom: PaymentSection (full width)
 */

'use client';

import { Check, MagnifyingGlass, Plus } from '@phosphor-icons/react';
import { MOCK_PRODUCTS, MOCK_SERVICES } from '../../constants/overview/mock-data';
import type { BookingDetailState } from '../../hooks/overview/use-booking-detail';
import type { BookingListState } from '../../hooks/overview/use-booking-list';
import type { BookingPaymentState } from '../../hooks/overview/use-booking-payment';
import type { BookingPromoState } from '../../hooks/overview/use-booking-promo';
import type { BookingStatusState } from '../../hooks/overview/use-booking-status';
import type { DashboardBooking } from '../../types/dashboard.types';
import { PaymentSection } from './PaymentSection';
import type { WaBookingData } from '@/lib/wa-message';
import { formatRupiah } from '@/shared/lib/format';

interface BookingDetailPanelProps {
  booking: DashboardBooking;
  detail: BookingDetailState;
  status: BookingStatusState;
  payment: BookingPaymentState;
  promo: BookingPromoState;
  list: Pick<BookingListState, 'getEffectiveStatus'>;
}

// ── Section label (eyebrow) ────────────────────────────────────────────────────
function Label({ children }: { children: string }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#8E8E93',
        margin: '0 0 4px 0',
      }}
    >
      {children}
    </p>
  );
}

// ── Shared picker panel container class ──────────────────────────────────────
const PICKER_PANEL_CLASS =
  'absolute left-0 right-0 top-0 overflow-hidden rounded-r12 border border-[#e0e0e0] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]';

// ── Add-item button (service + product pickers share identical structure) ────
function AddItemButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontSize: 13,
        fontWeight: 500,
        color: '#007AFF',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
      }}
    >
      <Plus size={11} weight="duotone" color="#007AFF" />
      {label}
    </button>
  );
}

// ── Picker search row (service + product pickers share identical structure) ────
function PickerSearchRow({
  placeholder,
  value,
  onChange,
  onClose,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-[#f0f0f0] px-3 py-2">
      <MagnifyingGlass size={13} weight="duotone" color="#bbb" />
      <input
        autoFocus
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-[0.8125rem] text-tx-body placeholder:text-[#ccc] focus:outline-none"
      />
      <button
        onClick={onClose}
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[#ccc] transition-colors hover:text-[#888]"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
        </svg>
      </button>
    </div>
  );
}

export function BookingDetailPanel({
  booking: b,
  detail,
  status,
  payment,
  promo,
  list,
}: BookingDetailPanelProps) {
  const effectiveStatus = list.getEffectiveStatus(b.id) ?? b.status;
  const addOns = detail.addOnsMap[b.id] ?? [];
  const notes = detail.notesMap[b.id] ?? '';
  const currentService = detail.serviceMap[b.id] ?? {
    serviceName: b.serviceName,
    price: b.price,
    categoryName: b.categoryName,
  };
  const additionalServices = detail.additionalServicesMap[b.id] ?? [];
  const waLink = `https://wa.me/62${b.customerPhone.replace(/^0/, '')}`;

  const addedNames = new Set(addOns.map((a) => a.name));
  const availableProducts = MOCK_PRODUCTS.filter((p) => !addedNames.has(p.name));
  const usedServiceNames = new Set([
    currentService.serviceName,
    ...additionalServices.map((s) => s.serviceName),
  ]);
  const availableServices = MOCK_SERVICES.filter((s) => !usedServiceNames.has(s.name));
  const isTreatment = ['Face', 'Massage'].includes(currentService.categoryName);

  return (
    <div
      className="relative flex min-h-[23rem] flex-col bg-bg-surface px-3 pb-5 sm:px-6"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 3-column grid */}
      <div
        className="expanded-details-mobile grid grid-cols-1 gap-px border-t border-[#f0f0f0] pt-4 sm:grid-cols-2 md:grid-cols-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
      >
        {/* ── Col 1: Contact ─────────────────────────────────────────────────── */}
        <div className="expanded-col-separator flex flex-col gap-3 border-b border-[#f0f0f0] pb-3 pr-0 sm:border-b sm:pb-3 sm:pr-0 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          {/* Phone */}
          <div>
            <Label>Nomor HP</Label>
            <p className="text-ts-fn font-medium tabular-nums text-tx-body">{b.customerPhone}</p>
          </div>

          {/* WA Chat */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              height: 36,
              alignItems: 'center',
              gap: 6,
              alignSelf: 'flex-start',
              borderRadius: 10,
              padding: '0 14px',
              fontSize: 13,
              fontWeight: 600,
              color: 'white',
              backgroundColor: '#25d366',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat WA
          </a>

          {/* DP Proof */}
          {b.visitorType !== 'WALK_IN' && (
            <div className="mt-1 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#8E8E93',
                  margin: 0,
                }}
              >
                Bukti Pembayaran
              </p>
              {b.paymentProofUrl ? (
                <button
                  onClick={() =>
                    payment.openProofZoom({ url: b.paymentProofUrl!, label: 'Bukti DP' })
                  }
                  className="group relative w-full overflow-hidden rounded-r12 border border-[#e8e8e6] transition-colors hover:border-[#ccc]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.paymentProofUrl}
                    alt="Bukti pembayaran"
                    className="h-[7rem] w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/10">
                    <div className="rounded-rF bg-black/50 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <MagnifyingGlass size={12} weight="duotone" color="white" />
                    </div>
                  </div>
                </button>
              ) : (
                <div className="flex h-[7rem] w-full flex-col items-center justify-center gap-1.5 rounded-r12 border border-dashed border-[#e0e0e0] bg-[#fafafa]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ccc"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <p className="text-[0.6875rem] text-gray-400">Belum ada bukti pembayaran</p>
                </div>
              )}

              {/* Confirm / Decline buttons */}
              {effectiveStatus === 'UPCOMING' &&
                (status.confirmingId === b.id ? (
                  <div className="flex animate-pulse gap-2">
                    <div className="h-9 flex-1 rounded-[10px] bg-blue-100" />
                    <div className="h-9 flex-1 rounded-[10px] bg-[#f0f0f0]" />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const waData: WaBookingData = {
                          customerName: b.customerName,
                          customerPhone: b.customerPhone,
                          serviceName: b.serviceName,
                          date: b.date,
                          timeSlot: b.timeSlot,
                          bookingCode: b.bookingCode,
                        };
                        await status.confirmBooking(b.id, waData);
                      }}
                      style={{
                        display: 'flex',
                        height: 36,
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        borderRadius: 10,
                        background: '#2563eb',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      <Check size={14} weight="duotone" color="white" />
                      Konfirmasi
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        status.openDeclineDialog({
                          bookingId: b.id,
                          customerName: b.customerName,
                          customerPhone: b.customerPhone,
                        });
                      }}
                      style={{
                        display: 'flex',
                        height: 36,
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        borderRadius: 10,
                        background: '#F9F9FB',
                        border: '1px solid #E5E5EA',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#ef4444',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 3l10 10M13 3L3 13" />
                      </svg>
                      Tolak
                    </button>
                  </div>
                ))}

              {effectiveStatus === 'CONFIRMED' && (
                <div
                  style={{
                    display: 'flex',
                    height: 36,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    borderRadius: 10,
                    background: '#2563eb',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'white',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8l3 3 7-7" />
                  </svg>
                  Terkonfirmasi
                </div>
              )}

              {effectiveStatus === 'CANCELLED' && (
                <div
                  style={{
                    display: 'flex',
                    height: 36,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    borderRadius: 10,
                    background: '#ef4444',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'white',
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3l10 10M13 3L3 13" />
                  </svg>
                  Ditolak
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Col 2: Service ─────────────────────────────────────────────────── */}
        <div className="expanded-col-separator flex flex-col gap-3 border-b border-[#f0f0f0] px-0 pb-3 pt-3 sm:border-b sm:px-3 sm:pb-3 sm:pt-3 md:border-b-0 md:border-r md:px-6 md:pb-0 md:pt-0">
          <div>
            <Label>Layanan</Label>
            {detail.editServiceId === b.id ? (
              /* Edit service picker */
              <div style={{ position: 'relative', zIndex: 20 }}>
                <div
                  className="shadow-dropdown"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    background: 'white',
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  {/* Search bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      background: '#F2F2F7',
                      margin: 8,
                      borderRadius: 10,
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="#8E8E93"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="7" cy="7" r="5" />
                      <path d="M11 11l3 3" />
                    </svg>
                    <input
                      autoFocus
                      type="text"
                      placeholder="Cari layanan..."
                      value={detail.serviceSearchQuery}
                      onChange={(e) => detail.setServiceSearchQuery(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: 13,
                        color: '#1C1C1E',
                        fontFamily: 'inherit',
                      }}
                    />
                    {detail.serviceSearchQuery && (
                      <button
                        onClick={() => detail.setServiceSearchQuery('')}
                        className="bg-tx-muted"
                        style={{
                          border: 'none',
                          borderRadius: '50%',
                          width: 16,
                          height: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                          padding: 0,
                        }}
                      >
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 10 10"
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M2 2l6 6M8 2l-6 6" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {/* Results grouped by category */}
                  <div style={{ maxHeight: 240, overflowY: 'auto', paddingBottom: 8 }}>
                    {['Hair', 'Colour', 'Face', 'Nail', 'Massage'].map((cat) => {
                      const catServices = MOCK_SERVICES.filter(
                        (s) =>
                          s.categoryName === cat &&
                          s.name.toLowerCase().includes(detail.serviceSearchQuery.toLowerCase())
                      );
                      if (!catServices.length) return null;
                      return (
                        <div key={cat}>
                          {!detail.serviceSearchQuery && (
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
                          {catServices.map((svc) => {
                            const isActive = currentService.serviceName === svc.name;
                            return (
                              <button
                                key={svc.id}
                                onClick={() => {
                                  detail.changeService(b.id, svc);
                                  detail.setServiceSearchQuery('');
                                }}
                                style={{
                                  display: 'flex',
                                  width: '100%',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 16px',
                                  border: 'none',
                                  background: isActive ? '#F0F4FF' : 'transparent',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'background 0.1s',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isActive) e.currentTarget.style.background = '#F5F5F7';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isActive) e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 14,
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? '#2563eb' : '#1C1C1E',
                                  }}
                                >
                                  {svc.name}
                                </span>
                                <span
                                  style={{
                                    fontSize: 13,
                                    color: '#8E8E93',
                                    flexShrink: 0,
                                    marginLeft: 12,
                                  }}
                                >
                                  {formatRupiah(svc.price)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                    {MOCK_SERVICES.filter((s) =>
                      s.name.toLowerCase().includes(detail.serviceSearchQuery.toLowerCase())
                    ).length === 0 && (
                      <p
                        style={{ fontSize: 13, color: '#8E8E93', padding: '12px 16px', margin: 0 }}
                      >
                        Layanan tidak ditemukan
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[0.875rem] font-medium text-tx-body">
                    {currentService.serviceName}
                  </p>
                  <p className="mt-0.5 text-[0.875rem] text-tx-subtle">
                    oleh {b.stylistName} · {formatRupiah(currentService.price)}
                  </p>
                </div>
                <button
                  onClick={() => detail.setEditServiceId(b.id)}
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-rF bg-[#f0f0ee] text-gray-500 transition-colors hover:bg-[#e2e2df] hover:text-[#444]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 1.5l2.5 2.5-8 8H2v-2.5l8-8z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Additional services */}
            {additionalServices.map((sv, idx) => (
              <div
                key={idx}
                className="mt-2 flex items-center justify-between border-t border-bd-row pt-2"
              >
                <div>
                  <p className="text-[0.8125rem] font-medium text-tx-body">{sv.serviceName}</p>
                  <p className="text-[0.8125rem] text-tx-subtle">{formatRupiah(sv.price)}</p>
                </div>
                <button
                  onClick={() => detail.removeAdditionalService(b.id, idx)}
                  className="flex h-6 w-6 items-center justify-center rounded-rF text-tx-muted transition-colors hover:bg-st-cancelled-bg hover:text-st-cancelled"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Add service */}
            {detail.showServicePicker === b.id ? (
              <div className="relative z-20 mt-2">
                <div className={PICKER_PANEL_CLASS}>
                  <PickerSearchRow
                    placeholder="Cari layanan..."
                    value={detail.serviceSearchQuery}
                    onChange={(v) => detail.setServiceSearchQuery(v)}
                    onClose={() => {
                      detail.setShowServicePicker(null);
                      detail.setServiceSearchQuery('');
                    }}
                  />
                  <div className="max-h-44 overflow-y-auto">
                    {availableServices.filter((s) =>
                      s.name.toLowerCase().includes(detail.serviceSearchQuery.toLowerCase())
                    ).length === 0 ? (
                      <p className="px-3 py-3 text-[0.875rem] text-tx-subtle">
                        Layanan tidak ditemukan
                      </p>
                    ) : (
                      ['Hair', 'Colour', 'Face', 'Nail', 'Massage'].map((cat) => {
                        const catSvcs = availableServices.filter(
                          (s) =>
                            s.categoryName === cat &&
                            s.name.toLowerCase().includes(detail.serviceSearchQuery.toLowerCase())
                        );
                        if (!catSvcs.length) return null;
                        return (
                          <div key={cat}>
                            {!detail.serviceSearchQuery && (
                              <p className="px-3 pb-1 pt-2.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-tx-subtle">
                                {cat}
                              </p>
                            )}
                            {catSvcs.map((svc) => (
                              <button
                                key={svc.id}
                                onClick={() => {
                                  detail.addService(b.id, svc);
                                  detail.setServiceSearchQuery('');
                                }}
                                className="flex w-full items-center justify-between border-b border-[#f9f9f9] px-3 py-2 text-left transition-colors last:border-0 hover:bg-bg-surface"
                              >
                                <span className="text-[0.8125rem] text-[#333]">{svc.name}</span>
                                <span className="ml-2 flex-shrink-0 text-[0.8125rem] text-tx-subtle">
                                  {formatRupiah(svc.price)}
                                </span>
                              </button>
                            ))}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <AddItemButton
                label="Tambah layanan"
                onClick={() => detail.setShowServicePicker(b.id)}
              />
            )}
          </div>

          {/* Treatment notes */}
          {isTreatment && (
            <div>
              <Label>Catatan Terapis</Label>
              <textarea
                value={notes}
                onChange={(e) => detail.setNote(b.id, e.target.value)}
                placeholder="Kondisi kulit, alergi, preferensi..."
                rows={3}
                className="w-full resize-none border px-3 py-2 text-[0.8125rem] leading-relaxed text-tx-body placeholder:text-[#ccc] focus:outline-none"
                style={{
                  borderRadius: 10,
                  borderColor: '#E5E5EA',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          )}
        </div>

        {/* ── Col 3: Add-ons ─────────────────────────────────────────────────── */}
        <div className="expanded-col-separator flex flex-col gap-3 border-[#f0f0f0] pl-0 pt-3 sm:pl-3 sm:pt-3 md:border-l md:pl-6 md:pt-0">
          <div>
            <Label>Product Add-on</Label>
            {addOns.length === 0 && (
              <p className="mb-1 text-[0.875rem] text-gray-500">Belum ada add-on</p>
            )}
            {addOns.map((ao, i) => (
              <div
                key={ao.id}
                className="flex items-center justify-between border-b border-[#f5f5f5] py-1.5 last:border-0"
              >
                <span className="text-[0.8125rem] text-tx-subtle">{ao.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[0.875rem] font-medium text-[#444]">
                    {formatRupiah(ao.price)}
                  </span>
                  <button
                    onClick={() => detail.removeAddOn(b.id, i)}
                    className="flex h-5 w-5 items-center justify-center rounded-rF text-[#ccc] transition-colors hover:bg-st-cancelled-bg hover:text-st-cancelled"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Product picker */}
            {detail.showProductPicker === b.id ? (
              <div className="relative z-20 mt-2">
                <div className={PICKER_PANEL_CLASS}>
                  <PickerSearchRow
                    placeholder="Cari produk..."
                    value={detail.productSearchQuery}
                    onChange={(v) => detail.setProductSearchQuery(v)}
                    onClose={() => {
                      detail.setShowProductPicker(null);
                      detail.setProductSearchQuery('');
                    }}
                  />
                  <div className="max-h-44 overflow-y-auto">
                    {(() => {
                      const filtered = availableProducts.filter((p) =>
                        p.name.toLowerCase().includes(detail.productSearchQuery.toLowerCase())
                      );
                      if (filtered.length === 0)
                        return (
                          <p className="px-3 py-3 text-[0.875rem] text-tx-subtle">
                            {availableProducts.length === 0
                              ? 'Semua produk sudah ditambahkan'
                              : 'Produk tidak ditemukan'}
                          </p>
                        );
                      return filtered.map((prod) => (
                        <button
                          key={prod.id}
                          onClick={() => {
                            detail.addProduct(b.id, prod);
                            detail.setProductSearchQuery('');
                          }}
                          className="flex w-full items-center justify-between border-b border-[#f9f9f9] px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-bg-surface"
                        >
                          <span className="text-[0.8125rem] text-[#333]">{prod.name}</span>
                          <span className="text-[0.8125rem] text-tx-subtle">
                            {formatRupiah(prod.price)}
                          </span>
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <AddItemButton
                label="Tambah add-on"
                onClick={() => detail.setShowProductPicker(b.id)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Payment Section (full width) ─────────────────────────────────────── */}
      <PaymentSection
        booking={b}
        currentService={currentService}
        additionalServices={additionalServices}
        addOns={addOns}
        payment={payment}
        promo={promo}
      />
    </div>
  );
}
