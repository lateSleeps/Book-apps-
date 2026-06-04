/**
 * @responsibility
 * Interactive payment input card: method selector (Cash/Transfer/QRIS),
 * amount input, kembalian/kekurangan display, promo code, proof upload,
 * and the "Selesaikan" submit button.
 *
 * @usedBy
 * PaymentSection.tsx
 *
 * @notes
 * - Presentation only — no local state.
 * - Shows "Pembayaran Selesai" when paymentStatus === 'PAID'.
 * - All state lives in use-booking-payment and use-booking-promo.
 */

'use client';

import type {
  BookingPaymentState,
  SettlementProof,
} from '../../hooks/overview/use-booking-payment';
import type { BookingPromoState } from '../../hooks/overview/use-booking-promo';
import type { DashboardBooking } from '../../types/dashboard.types';
import type { PaymentMethod } from '../../types/overview.types';
import { formatRupiah } from '@/shared/lib/format';

interface PaymentInputCardProps {
  booking: DashboardBooking;
  finalTotal: number;
  payment: Pick<
    BookingPaymentState,
    | 'paymentAmountMap'
    | 'setPaymentAmount'
    | 'paymentMethodMap'
    | 'setPaymentMethod'
    | 'pelunasanProofMap'
    | 'setSettlementProof'
    | 'isProcessingPayment'
    | 'openConfirmDialog'
    | 'openProofZoom'
  >;
  promo: Pick<
    BookingPromoState,
    'promoInput' | 'setPromoInput' | 'promoData' | 'applyPromo' | 'removePromo' | 'getDiscount'
  >;
}

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'TRANSFER', 'QRIS'];

export function PaymentInputCard({
  booking: b,
  finalTotal,
  payment,
  promo,
}: PaymentInputCardProps) {
  const method = payment.paymentMethodMap[b.id] ?? 'CASH';
  const rawAmount = payment.paymentAmountMap[b.id] ?? '';
  const amountReceived = parseInt(rawAmount.replace(/\D/g, ''), 10) || 0;
  const discount = promo.getDiscount(b.id);
  const promoData = promo.promoData[b.id];
  const proof = payment.pelunasanProofMap[b.id];
  const isPaid = b.paymentStatus === 'PAID';

  const kembalian = method === 'CASH' ? amountReceived - finalTotal : null;

  return (
    <div
      className="md:col-span-2"
      style={{
        borderRadius: '0.75rem',
        background: 'white',
        border: '1px solid #f0f0f0',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
      }}
    >
      {/* Header */}
      <p className="text-ts-cap2 font-semibold uppercase tracking-[0.05em] text-tx-secondary">
        {isPaid ? 'Pembayaran Selesai' : 'Input Pembayaran'}
      </p>

      {isPaid ? (
        /* ── PAID state ── */
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
              <svg
                width="10"
                height="10"
                viewBox="0 0 16 16"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M3 8l4 4 6-6" />
              </svg>
            </span>
            <span className="text-ts-fn font-semibold text-st-in-progress">
              Lunas · {formatRupiah(finalTotal)}
            </span>
          </div>
          {b.settlementProofUrl ? (
            <button
              onClick={() =>
                payment.openProofZoom({ url: b.settlementProofUrl!, label: 'Bukti Pelunasan' })
              }
              className="flex items-center gap-1.5 text-ts-fn text-ac-primary"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              Lihat Bukti Pelunasan
            </button>
          ) : (
            <span className="text-ts-cap1 text-tx-muted">Belum ada bukti pelunasan</span>
          )}
        </div>
      ) : (
        /* ── Input state ── */
        <div className="flex flex-col gap-3">
          {/* Method selector */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              borderRadius: '0.75rem',
              padding: '0.25rem',
              backgroundColor: '#F2F2F7',
              alignSelf: 'flex-start',
            }}
          >
            {PAYMENT_METHODS.map((m) => {
              const active = method === m;
              return (
                <button
                  key={m}
                  onClick={() => payment.setPaymentMethod(b.id, m)}
                  style={{
                    padding: '0.3125rem 0.875rem',
                    borderRadius: '0.625rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: active ? 600 : 400,
                    backgroundColor: active ? 'white' : 'transparent',
                    color: active ? '#1C1C1E' : '#8E8E93',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {m === 'CASH' ? 'Cash' : m === 'TRANSFER' ? 'Transfer' : 'QRIS'}
                </button>
              );
            })}
          </div>

          {/* Cash amount input */}
          {method === 'CASH' && (
            <div className="flex h-9 items-center gap-1.5 rounded-r10 border border-bd-card bg-bg-input px-3">
              <span className="text-ts-fn text-tx-secondary">Uang diterima Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={rawAmount}
                onChange={(e) => payment.setPaymentAmount(b.id, e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-transparent text-ts-fn tabular-nums text-tx-primary outline-none"
              />
            </div>
          )}

          {/* Summary: total + kembalian */}
          <div className="flex flex-col gap-1 rounded-r8 bg-bg-surface p-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-ts-cap1 text-tx-secondary">Total tagihan</span>
              <span className="text-ts-fn font-semibold text-tx-primary">
                {formatRupiah(finalTotal)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex items-baseline justify-between">
                <span className="text-ts-cap1 text-tx-secondary">Diskon</span>
                <span className="text-ts-cap1 font-medium text-st-in-progress">
                  −{formatRupiah(discount)}
                </span>
              </div>
            )}
            {method === 'CASH' && amountReceived > 0 && (
              <div className="mt-1 flex items-baseline justify-between border-t border-bd-row pt-1">
                <span className="text-ts-cap1 font-semibold text-tx-primary">
                  {(kembalian ?? 0) >= 0 ? 'Kembalian' : 'Kekurangan'}
                </span>
                <span
                  className={`text-ts-fn font-semibold ${(kembalian ?? 0) >= 0 ? 'text-st-in-progress' : 'text-st-cancelled'}`}
                >
                  {(kembalian ?? 0) >= 0
                    ? formatRupiah(kembalian ?? 0)
                    : `−${formatRupiah(Math.abs(kembalian ?? 0))}`}
                </span>
              </div>
            )}
          </div>

          {/* Promo code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-ts-cap2 font-semibold uppercase tracking-[0.05em] text-tx-secondary">
              Kode Promo
            </label>
            {promoData?.appliedCode ? (
              <div className="flex items-center gap-2">
                <span className="rounded-r6 bg-green-50 px-2 py-0.5 text-ts-cap1 font-semibold text-st-in-progress">
                  {promoData.appliedCode}
                </span>
                <span className="text-ts-cap1 text-st-in-progress">
                  −{formatRupiah(promoData.discount)}
                </span>
                <button
                  onClick={() => promo.removePromo(b.id)}
                  className="text-ts-cap1 text-tx-muted underline"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kode promo..."
                  value={promo.promoInput[b.id] ?? ''}
                  onChange={(e) => promo.setPromoInput(b.id, e.target.value.toUpperCase())}
                  className="flex-1 rounded-r8 border border-bd-card bg-bg-input px-3 py-1.5 text-ts-fn uppercase text-tx-primary outline-none placeholder:normal-case placeholder:text-tx-muted"
                />
                <button
                  onClick={() => promo.applyPromo(b.id, finalTotal)}
                  className="rounded-r8 border border-bd-card px-3 text-ts-fn font-medium text-tx-subtle transition-colors hover:bg-bg-surface"
                >
                  Pakai
                </button>
              </div>
            )}
            {promoData?.error && (
              <p className="text-ts-cap1 text-st-cancelled">{promoData.error}</p>
            )}
          </div>

          {/* Settlement proof for non-cash */}
          {method !== 'CASH' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-ts-cap2 font-semibold uppercase tracking-[0.05em] text-tx-secondary">
                Bukti Pelunasan
              </label>
              {proof?.preview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proof.preview}
                    alt="Bukti"
                    className="h-24 w-full rounded-r10 object-cover"
                  />
                  <label className="absolute right-2 top-2 cursor-pointer rounded-r6 bg-black/60 px-2 py-0.5 text-ts-cap2 text-white">
                    Ganti
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (proof.preview) URL.revokeObjectURL(proof.preview);
                        payment.setSettlementProof(b.id, {
                          file,
                          preview: URL.createObjectURL(file),
                        });
                      }}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-r10 border-2 border-dashed border-bd-card hover:bg-bg-surface">
                  <svg
                    width="18"
                    height="18"
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
                  <span className="text-ts-cap1 text-tx-secondary">Tambah bukti transfer</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      payment.setSettlementProof(b.id, {
                        file,
                        preview: URL.createObjectURL(file),
                      });
                    }}
                  />
                </label>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            disabled={payment.isProcessingPayment}
            onClick={() =>
              payment.openConfirmDialog({
                bookingId: b.id,
                customerName: b.customerName,
                serviceName: b.serviceName,
                amount: amountReceived,
                method,
                finalTotal,
              })
            }
            className="flex h-10 w-full items-center justify-center gap-2 rounded-r10 bg-tx-primary text-ts-fn font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {payment.isProcessingPayment ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            {payment.isProcessingPayment ? 'Memproses...' : 'Selesaikan'}
          </button>
        </div>
      )}
    </div>
  );
}
