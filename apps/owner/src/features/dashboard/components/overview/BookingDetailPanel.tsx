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

import { CheckIcon } from '@heroicons/react/24/solid';
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
      className="relative flex min-h-[23rem] flex-col bg-[#fafaf8] px-3 pb-5 sm:px-6"
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
            className="flex w-fit items-center gap-2 rounded-r8 px-3 py-1.5 text-ts-fn font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#25d366' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
            </svg>
            Chat WA
          </a>

          {/* DP Proof */}
          {b.visitorType !== 'WALK_IN' && (
            <div className="mt-1 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
              <Label>Bukti Pembayaran</Label>
              {b.paymentProofUrl ? (
                <button
                  onClick={() =>
                    payment.openProofZoom({ url: b.paymentProofUrl!, label: 'Bukti DP' })
                  }
                  className="group relative h-20 w-full overflow-hidden rounded-r10 border border-bd-card"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.paymentProofUrl}
                    alt="Bukti DP"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-ts-cap1 font-semibold text-white">Lihat</span>
                  </div>
                </button>
              ) : (
                <div className="flex h-16 items-center justify-center gap-2 rounded-r10 border border-dashed border-bd-card">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8E8E93"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <p className="text-ts-cap2 text-tx-secondary">Belum ada bukti pembayaran</p>
                </div>
              )}

              {/* Confirm / Decline buttons */}
              {effectiveStatus === 'UPCOMING' &&
                (status.confirmingId === b.id ? (
                  <div className="flex animate-pulse gap-2">
                    <div className="h-9 flex-1 rounded-r10 bg-blue-100" />
                    <div className="h-9 flex-1 rounded-r10 bg-bg-surface" />
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
                      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-r10 bg-ac-primary text-ts-fn font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
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
                      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-r10 border border-bd-card bg-bg-input text-ts-fn font-semibold text-st-cancelled transition-colors hover:bg-red-50"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M3 3l10 10M13 3L3 13" />
                      </svg>
                      Tolak
                    </button>
                  </div>
                ))}

              {effectiveStatus === 'CONFIRMED' && (
                <div className="flex items-center gap-1.5 rounded-r8 bg-blue-50 px-3 py-1.5">
                  <CheckIcon className="h-3.5 w-3.5 text-ac-primary" />
                  <span className="text-ts-fn font-medium text-ac-primary">Terkonfirmasi</span>
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
              <div className="relative z-20">
                <div className="flex h-8 items-center gap-2 rounded-r8 border border-bd-card bg-white px-2">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="#8E8E93"
                    strokeWidth="1.8"
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
                    className="flex-1 bg-transparent text-ts-fn text-tx-primary outline-none placeholder:text-tx-muted"
                  />
                  {detail.serviceSearchQuery && (
                    <button
                      onClick={() => detail.setServiceSearchQuery('')}
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-tx-muted"
                    >
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 8 8"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      >
                        <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="absolute left-0 right-0 top-9 z-30 max-h-44 overflow-y-auto rounded-r10 border border-bd-card bg-white shadow-card">
                  {MOCK_SERVICES.filter((s) =>
                    s.name.toLowerCase().includes(detail.serviceSearchQuery.toLowerCase())
                  ).map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => {
                        detail.changeService(b.id, svc);
                        detail.setServiceSearchQuery('');
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-bg-surface"
                    >
                      <span className="text-ts-fn text-tx-primary">{svc.name}</span>
                      <span className="text-ts-fn text-tx-secondary">
                        {formatRupiah(svc.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-ts-fn font-semibold text-tx-body">
                    {currentService.serviceName}
                  </p>
                  <p className="text-ts-fn text-tx-secondary">
                    oleh {b.stylistName} · {formatRupiah(currentService.price)}
                  </p>
                </div>
                <button
                  onClick={() => detail.setEditServiceId(b.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-r6 text-tx-muted transition-colors hover:bg-bg-surface hover:text-tx-subtle"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 2l3 3-9 9H2v-3L11 2z" />
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
                  <p className="text-ts-fn font-medium text-tx-body">{sv.serviceName}</p>
                  <p className="text-ts-fn text-tx-secondary">{formatRupiah(sv.price)}</p>
                </div>
                <button
                  onClick={() => detail.removeAdditionalService(b.id, idx)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-tx-muted transition-colors hover:bg-red-50 hover:text-st-cancelled"
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
                <div className="absolute left-0 right-0 top-0 overflow-hidden rounded-r10 border border-bd-card bg-white shadow-card">
                  <div className="flex h-8 items-center gap-2 border-b border-bd-row px-2">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Cari layanan tambahan..."
                      value={detail.serviceSearchQuery}
                      onChange={(e) => detail.setServiceSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-ts-fn outline-none placeholder:text-tx-muted"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {availableServices
                      .filter((s) =>
                        s.name.toLowerCase().includes(detail.serviceSearchQuery.toLowerCase())
                      )
                      .map((svc) => (
                        <button
                          key={svc.id}
                          onClick={() => {
                            detail.addService(b.id, svc);
                            detail.setServiceSearchQuery('');
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 transition-colors hover:bg-bg-surface"
                        >
                          <span className="text-ts-fn text-tx-primary">{svc.name}</span>
                          <span className="text-ts-fn text-tx-secondary">
                            {formatRupiah(svc.price)}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => detail.setShowServicePicker(b.id)}
                className="mt-2 flex items-center gap-1 text-ts-fn text-ac-primary"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 11 11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M5.5 1v9M1 5.5h9" />
                </svg>
                Tambah layanan
              </button>
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
                className="w-full resize-none rounded-r10 border border-bd-card px-3 py-2 text-ts-fn leading-relaxed text-tx-body placeholder:text-tx-muted focus:outline-none"
                style={{ fontFamily: 'inherit' }}
              />
            </div>
          )}
        </div>

        {/* ── Col 3: Add-ons ─────────────────────────────────────────────────── */}
        <div className="expanded-col-separator flex flex-col gap-3 border-[#f0f0f0] pl-0 pt-3 sm:pl-3 sm:pt-3 md:border-l md:pl-6 md:pt-0">
          <div>
            <Label>Product Add-on</Label>
            {addOns.length === 0 && (
              <p className="mb-1 text-ts-fn text-tx-subtle">Belum ada add-on</p>
            )}
            {addOns.map((ao, i) => (
              <div
                key={ao.id}
                className="flex items-center justify-between border-b border-[#f5f5f5] py-1.5 last:border-0"
              >
                <div>
                  <p className="text-ts-fn font-medium text-tx-body">{ao.name}</p>
                  <p className="text-ts-fn text-tx-secondary">{formatRupiah(ao.price)}</p>
                </div>
                <button
                  onClick={() => detail.removeAddOn(b.id, i)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-tx-muted transition-colors hover:bg-red-50 hover:text-st-cancelled"
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

            {/* Product picker */}
            {detail.showProductPicker === b.id ? (
              <div className="relative z-20 mt-2">
                <div className="absolute left-0 right-0 top-0 overflow-hidden rounded-r10 border border-bd-card bg-white shadow-card">
                  <div className="flex h-8 items-center gap-2 border-b border-bd-row px-2">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Cari produk..."
                      value={detail.productSearchQuery}
                      onChange={(e) => detail.setProductSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-ts-fn outline-none placeholder:text-tx-muted"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {availableProducts
                      .filter((p) =>
                        p.name.toLowerCase().includes(detail.productSearchQuery.toLowerCase())
                      )
                      .map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            detail.addProduct(b.id, p);
                            detail.setProductSearchQuery('');
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 transition-colors hover:bg-bg-surface"
                        >
                          <span className="text-ts-fn text-tx-primary">{p.name}</span>
                          <span className="text-ts-fn text-tx-secondary">
                            {formatRupiah(p.price)}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => detail.setShowProductPicker(b.id)}
                className="mt-2 flex items-center gap-1 text-ts-fn text-ac-primary"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 11 11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M5.5 1v9M1 5.5h9" />
                </svg>
                Tambah add-on
              </button>
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
