'use client';

import { PAYMENT_STATUS_META } from '../../constants/overview/booking-status';
import type { BookingPromoState } from '../../hooks/overview/use-booking-promo';
import type { DashboardBooking } from '../../types/dashboard.types';
import { formatRupiah } from '@/shared/lib/format';

interface PaymentStatusCardProps {
  booking: DashboardBooking;
  finalTotal: number;
  promo: Pick<
    BookingPromoState,
    'promoInput' | 'setPromoInput' | 'promoData' | 'applyPromo' | 'removePromo' | 'getDiscount'
  >;
  onViewDpProof?: () => void;
  onViewSettlementProof?: () => void;
}

export function PaymentStatusCard({
  booking: b,
  finalTotal,
  promo,
  onViewDpProof,
  onViewSettlementProof,
}: PaymentStatusCardProps) {
  const status = b.paymentStatus ?? 'UNPAID';
  const pm = PAYMENT_STATUS_META[status];
  const promoData = promo.promoData[b.id];
  const discount = promo.getDiscount(b.id);

  const paid =
    status === 'PAID' ? finalTotal : status === 'DEPOSIT' ? Math.round(b.price * 0.5) : 0;
  const pct = finalTotal > 0 ? Math.round((paid / finalTotal) * 100) : 0;
  const barColor = status === 'PAID' ? '#34C759' : status === 'DEPOSIT' ? '#FF9500' : '#E5E5EA';

  return (
    <div
      style={{
        borderRadius: 12,
        background: 'white',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
          Status Pembayaran
        </p>
        <span
          style={{
            borderRadius: 9999,
            padding: '4px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: pm.color,
            background:
              status === 'PAID' ? '#DCFCE7' : status === 'DEPOSIT' ? '#FEF9C3' : '#F5F5F5',
          }}
        >
          {pm.label}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 6, borderRadius: 9999, background: '#F2F2F7', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              borderRadius: 9999,
              width: `${pct}%`,
              transition: 'width 0.5s',
              background: barColor,
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p
              style={{ fontSize: 18, fontWeight: 700, color: '#1C1C1E', margin: 0, lineHeight: 1 }}
            >
              {formatRupiah(paid)}
            </p>
            <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>terbayar · {pct}%</p>
          </div>
          {status === 'DEPOSIT' && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#3C3C43', margin: 0 }}>
                {formatRupiah(finalTotal - paid)}
              </p>
              <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>sisa</p>
            </div>
          )}
        </div>
      </div>

      {/* Proof view buttons */}
      {(b.paymentProofUrl || b.settlementProofUrl || status === 'DEPOSIT') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {b.paymentProofUrl && (
            <button
              onClick={onViewDpProof}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontSize: 12,
                color: '#007AFF',
                fontFamily: 'inherit',
              }}
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
              Lihat bukti DP
            </button>
          )}
          {b.settlementProofUrl ? (
            <button
              onClick={onViewSettlementProof}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontSize: 12,
                color: '#007AFF',
                fontFamily: 'inherit',
              }}
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
              Lihat bukti pelunasan
            </button>
          ) : (
            status === 'DEPOSIT' && (
              <span style={{ fontSize: 12, color: '#8E8E93' }}>Belum ada bukti pelunasan</span>
            )
          )}
        </div>
      )}

      {/* Kode Promo — matches v0 position (bottom of left card) */}
      <div style={{ borderTop: '1px solid #F2F2F7', paddingTop: 12, marginTop: 'auto' }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#8E8E93',
            marginBottom: 8,
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
                color: '#16a34a',
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 36,
                  borderRadius: 10,
                  border: '1px solid #E5E5EA',
                  background: '#F9F9FB',
                  padding: '0 12px',
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="#C7C7CC"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.5 2.5l4 4-7 7-4-4 7-7z" />
                  <circle cx="5.5" cy="10.5" r="1" />
                </svg>
                <input
                  placeholder="Kode promo"
                  value={promo.promoInput[b.id] ?? ''}
                  onChange={(e) => promo.setPromoInput(b.id, e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') promo.applyPromo(b.id, finalTotal);
                  }}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontSize: 13,
                    textTransform: 'uppercase',
                    color: '#1C1C1E',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <button
                onClick={() => promo.applyPromo(b.id, finalTotal)}
                style={{
                  height: 40,
                  borderRadius: 10,
                  background: '#1C1C1E',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                Terapkan
              </button>
            </div>
            {promoData?.error && (
              <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{promoData.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
