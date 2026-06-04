/**
 * @responsibility
 * Read-only payment status display: progress bar, amounts (paid/remaining),
 * and settlement proof viewer button.
 *
 * @usedBy
 * PaymentSection.tsx
 *
 * @notes
 * - Presentation only — no local state.
 * - Shows different content for PAID / DEPOSIT / UNPAID status.
 * - Settlement proof button opens ProofZoomDialog via onViewProof.
 */

'use client';

import { PAYMENT_STATUS_META } from '../../constants/overview/booking-status';
import type { DashboardBooking } from '../../types/dashboard.types';
import { formatRupiah } from '@/shared/lib/format';

interface PaymentStatusCardProps {
  booking: DashboardBooking;
  finalTotal: number;
  onViewDpProof?: () => void;
  onViewSettlementProof?: () => void;
}

export function PaymentStatusCard({
  booking: b,
  finalTotal,
  onViewDpProof,
  onViewSettlementProof,
}: PaymentStatusCardProps) {
  const status = b.paymentStatus ?? 'UNPAID';
  const pm = PAYMENT_STATUS_META[status];

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
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p className="text-ts-cap2 font-semibold uppercase tracking-[0.05em] text-tx-secondary">
          Status Pembayaran
        </p>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 9999,
            padding: '2px 8px',
            color: pm.color,
            background:
              status === 'PAID' ? '#f0fdf4' : status === 'DEPOSIT' ? '#fff7ed' : '#f9fafb',
          }}
        >
          {pm.label}
        </span>
      </div>

      {/* Progress bar */}
      <div>
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
        <p className="mt-1 text-ts-cap1 text-tx-secondary">terbayar · {pct}%</p>
      </div>

      {/* Amounts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <p
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#1C1C1E',
              margin: 0,
              lineHeight: 1,
            }}
          >
            {formatRupiah(paid)}
          </p>
          <p className="text-ts-cap1 text-tx-secondary">terbayar · 50%</p>
        </div>
        {status === 'DEPOSIT' && (
          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#3C3C43',
                margin: 0,
                lineHeight: 1,
              }}
            >
              {formatRupiah(finalTotal - paid)}
            </p>
            <p className="text-ts-cap1 text-tx-secondary">sisa</p>
          </div>
        )}
      </div>

      {/* Proof buttons */}
      <div className="flex flex-col gap-1.5">
        {b.paymentProofUrl && (
          <button
            onClick={onViewDpProof}
            className="flex items-center gap-2 text-ts-fn text-ac-primary"
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
            className="flex items-center gap-2 text-ts-fn text-ac-primary"
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
            <span className="text-ts-cap1 text-tx-muted">Belum ada bukti pelunasan</span>
          )
        )}
      </div>
    </div>
  );
}
