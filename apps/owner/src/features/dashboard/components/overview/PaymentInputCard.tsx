'use client';

import type { BookingPaymentState } from '../../hooks/overview/use-booking-payment';
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
        borderRadius: 12,
        background: 'white',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
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
        {isPaid ? 'Pembayaran Selesai' : 'Input Pembayaran'}
      </p>

      {isPaid ? (
        <>
          {/* Status lunas — green card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#F0FDF4',
              borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8l3 3 7-7" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>
              Lunas · {formatRupiah(finalTotal)}
            </span>
          </div>

          {/* Bukti pelunasan */}
          {b.settlementProofUrl ? (
            <button
              onClick={() =>
                payment.openProofZoom({ url: b.settlementProofUrl!, label: 'Bukti Pelunasan' })
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                alignSelf: 'flex-start',
                height: 36,
                borderRadius: 10,
                border: '1px solid #E5E5EA',
                background: 'transparent',
                padding: '0 14px',
                fontSize: 13,
                fontWeight: 500,
                color: '#1C1C1E',
                cursor: 'pointer',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              Lihat Bukti Pelunasan
            </button>
          ) : (
            <span style={{ fontSize: 12, color: '#8E8E93' }}>Belum ada bukti pelunasan</span>
          )}
        </>
      ) : (
        <>
          {/* Method selector tabs */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              borderRadius: 12,
              padding: 4,
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
                    whiteSpace: 'nowrap',
                    padding: '6px 14px',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    transition: 'all 0.15s',
                    backgroundColor: active ? 'white' : 'transparent',
                    color: active ? '#1C1C1E' : '#8E8E93',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {m === 'CASH' ? 'Cash' : m === 'TRANSFER' ? 'Transfer' : 'QRIS'}
                </button>
              );
            })}
          </div>

          {/* Cash amount input */}
          {method === 'CASH' && (
            <div
              style={{
                display: 'flex',
                height: 36,
                alignItems: 'center',
                gap: 8,
                borderRadius: 10,
                border: '1px solid #E5E5EA',
                background: '#F9F9FB',
                padding: '0 12px',
              }}
            >
              <span style={{ flexShrink: 0, fontSize: 13, color: '#8E8E93' }}>
                Uang diterima Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={rawAmount}
                onChange={(e) => payment.setPaymentAmount(b.id, e.target.value.replace(/\D/g, ''))}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#1C1C1E',
                }}
              />
            </div>
          )}

          {/* Total tagihan — bordered card */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: '#F9F9FB',
              borderRadius: 10,
              border: '1px solid #E5E5EA',
            }}
          >
            <span style={{ fontSize: 13, color: '#6B6B6B' }}>Total Tagihan</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1E' }}>
              {formatRupiah(finalTotal)}
            </span>
          </div>

          {/* Diskon row */}
          {discount > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#F0FDF4',
                borderRadius: 10,
                border: '1px solid #BBF7D0',
              }}
            >
              <span style={{ fontSize: 13, color: '#16a34a' }}>Diskon</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>
                −{formatRupiah(discount)}
              </span>
            </div>
          )}

          {/* Kembalian / Kekurangan */}
          {method === 'CASH' && amountReceived > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: (kembalian ?? 0) >= 0 ? '#F0FDF4' : '#FFF1F0',
                borderRadius: 10,
                border: `1px solid ${(kembalian ?? 0) >= 0 ? '#BBF7D0' : '#FECACA'}`,
              }}
            >
              <span style={{ fontSize: 13, color: (kembalian ?? 0) >= 0 ? '#16a34a' : '#ef4444' }}>
                {(kembalian ?? 0) >= 0 ? 'Kembalian' : 'Kekurangan'}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: (kembalian ?? 0) >= 0 ? '#16a34a' : '#ef4444',
                }}
              >
                {formatRupiah(Math.abs(kembalian ?? 0))}
              </span>
            </div>
          )}

          {/* Kode Promo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
              Kode Promo
            </p>
            {promoData?.appliedCode ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 10,
                  border: '1px solid #BBF7D0',
                  background: '#F0FDF4',
                  padding: '8px 12px',
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M5 8l2 2 4-4" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#16a34a' }}>
                  {promoData.appliedCode}
                </span>
                <span style={{ fontSize: 12, color: '#4ade80' }}>−{formatRupiah(discount)}</span>
                <button
                  onClick={() => promo.removePromo(b.id)}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#ef4444',
                  }}
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Kode promo..."
                  value={promo.promoInput[b.id] ?? ''}
                  onChange={(e) => promo.setPromoInput(b.id, e.target.value.toUpperCase())}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 10,
                    border: '1px solid #E5E5EA',
                    background: '#F9F9FB',
                    padding: '0 12px',
                    fontSize: 13,
                    color: '#1C1C1E',
                    outline: 'none',
                    textTransform: 'uppercase',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={() => promo.applyPromo(b.id, finalTotal)}
                  style={{
                    height: 36,
                    borderRadius: 10,
                    border: '1px solid #E5E5EA',
                    background: 'white',
                    padding: '0 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#1C1C1E',
                    cursor: 'pointer',
                  }}
                >
                  Pakai
                </button>
              </div>
            )}
            {promoData?.error && (
              <p style={{ fontSize: 11, color: '#ef4444', margin: 0 }}>{promoData.error}</p>
            )}
          </div>

          {/* Bukti Pelunasan upload — hanya untuk TRANSFER/QRIS */}
          {method !== 'CASH' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 40,
                  borderRadius: 10,
                  border: proof ? '1px solid #BBF7D0' : '1px solid #E5E5EA',
                  background: proof ? '#F0FDF4' : 'transparent',
                  padding: '0 14px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: proof ? '#16a34a' : '#8E8E93',
                  cursor: 'pointer',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                {proof ? 'Bukti Dipilih ✓' : 'Bukti Pelunasan'}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (proof?.preview) URL.revokeObjectURL(proof.preview);
                    payment.setSettlementProof(b.id, {
                      file,
                      preview: URL.createObjectURL(file),
                    });
                  }}
                />
              </label>
              {proof?.preview && (
                <button
                  onClick={() => payment.openProofZoom({ url: proof.preview!, label: 'Preview' })}
                  style={{
                    height: 36,
                    borderRadius: 10,
                    border: '1px solid #E5E5EA',
                    background: 'transparent',
                    padding: '0 12px',
                    fontSize: 12,
                    color: '#007AFF',
                    cursor: 'pointer',
                  }}
                >
                  Preview
                </button>
              )}
            </div>
          )}

          {/* Selesaikan button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            <button
              disabled={payment.isProcessingPayment}
              onClick={() =>
                payment.openConfirmDialog({
                  bookingId: b.id,
                  customerName: b.customerName,
                  serviceName: b.serviceName,
                  amount: method !== 'CASH' ? finalTotal : amountReceived,
                  method,
                  finalTotal,
                })
              }
              style={{
                height: 40,
                borderRadius: 10,
                border: 'none',
                background: payment.isProcessingPayment ? '#E5E5EA' : '#34C759',
                color: payment.isProcessingPayment ? '#8E8E93' : 'white',
                fontSize: 13,
                fontWeight: 600,
                cursor: payment.isProcessingPayment ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {payment.isProcessingPayment ? 'Memproses...' : 'Selesaikan'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
