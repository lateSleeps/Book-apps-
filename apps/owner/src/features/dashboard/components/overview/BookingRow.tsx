/**
 * @responsibility
 * Single desktop booking row in the overview table.
 * Renders the collapsed row (6-column grid) and conditionally
 * renders the expanded detail panel as children.
 *
 * @usedBy
 * BookingTable.tsx
 *
 * @notes
 * - Presentation only — no local state.
 * - Skeleton is shown when loadingBookingId matches this booking.
 * - Expanded content (BookingDetailPanel) is passed as children.
 */

'use client';

import { Trash } from '@phosphor-icons/react';
import { BOOKING_STATUS_META } from '../../constants/domain/booking-status';
import { PAYMENT_STATUS_META } from '../../constants/domain/payment-status';
import { VISITOR_TYPE_META } from '../../constants/domain/visitor-type';
import { UPCOMING_NOTIF_COLOR } from '../../constants/overview/booking-status';
import type { DashboardBooking, BookingStatus } from '../../types/dashboard.types';
import { SkeletonRow } from '@/components/SkeletonLoader';
import { avatarColor, getInitials } from '@/shared/lib/avatar';

interface BookingRowProps {
  booking: DashboardBooking;
  isExpanded: boolean;
  isLoading: boolean;
  effectiveStatus: BookingStatus;
  onToggle: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}

const COLUMN_LABELS = ['Pelanggan', 'Status', 'Layanan', 'Stylist', 'Waktu', 'Tipe'];
const GRID = '2fr 1.5fr 2fr 1.5fr 1fr 1.2fr';

const ROW_GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: GRID,
  columnGap: 20,
  alignItems: 'center',
} as const;

export function BookingRowColumnHeaders() {
  return (
    <div style={ROW_GRID_STYLE} className="rounded-t-r12 bg-bg-header px-s20 py-[10px]">
      {COLUMN_LABELS.map((h, i) => (
        <span
          key={h}
          className="relative flex items-center text-ts-fn font-medium text-tx-secondary"
        >
          {i > 0 && (
            <span
              style={{
                position: 'absolute',
                left: -16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#D1D1D6',
                fontWeight: 300,
                fontSize: 14,
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              |
            </span>
          )}
          {h}
        </span>
      ))}
    </div>
  );
}

export function BookingRow({
  booking: b,
  isExpanded,
  isLoading,
  effectiveStatus,
  onToggle,
  onDelete,
  children,
}: BookingRowProps) {
  if (isLoading) {
    return (
      <div className="border-b border-bd-row opacity-40 transition-opacity duration-300">
        <SkeletonRow />
      </div>
    );
  }

  const sm = BOOKING_STATUS_META[effectiveStatus] ?? BOOKING_STATUS_META.NO_SHOW;
  const pm = PAYMENT_STATUS_META[b.paymentStatus ?? 'UNPAID'];
  const vm = VISITOR_TYPE_META[b.visitorType];
  const { bg, text: textColor } = avatarColor(b.customerName);
  const isUpcoming = effectiveStatus === 'UPCOMING';

  return (
    <div className="border-b border-bd-row last:border-0">
      {/* Collapsed row */}
      <div
        onClick={onToggle}
        style={{ ...ROW_GRID_STYLE, padding: '14px 20px' }}
        className={`cursor-pointer transition-colors hover:bg-bg-hover ${isExpanded ? 'bg-bg-row-selected' : ''}`}
      >
        {/* Col 1: Customer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '0.625rem',
                backgroundColor: bg,
                color: textColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: getInitials(b.customerName).length > 1 ? '0.8125rem' : '1rem',
                fontWeight: 600,
              }}
            >
              {getInitials(b.customerName)}
            </div>
            {isUpcoming && (
              <span
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: UPCOMING_NOTIF_COLOR,
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 800, color: 'white', lineHeight: 1 }}>
                  !
                </span>
              </span>
            )}
          </div>
          <span className="truncate text-ts-sub font-semibold text-tx-primary">
            {b.customerName}
          </span>
        </div>

        {/* Col 2: Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {isUpcoming && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: sm.color,
                background: sm.bg,
                borderRadius: 6,
                padding: '2px 7px',
                alignSelf: 'flex-start',
              }}
            >
              ⚡ Perlu Konfirmasi
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                flexShrink: 0,
                backgroundColor: pm?.color ?? '#8E8E93',
              }}
            />
            <span className="text-ts-fn" style={{ color: pm?.color ?? '#8E8E93' }}>
              {pm?.label ?? 'Belum Bayar'}
            </span>
          </div>
        </div>

        {/* Col 3: Service */}
        <span className="truncate text-ts-t14 text-tx-body">{b.serviceName}</span>

        {/* Col 4: Stylist */}
        <span className="truncate text-ts-t14 text-tx-subtle">{b.stylistName}</span>

        {/* Col 5: Time */}
        <span className="text-ts-t14 tabular-nums text-tx-body">{b.timeSlot.slice(0, 5)}</span>

        {/* Col 6: Type + actions */}
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
        >
          <span
            className="text-ts-cap1 font-medium"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 12px',
              borderRadius: 20,
              backgroundColor: vm.bg,
              color: vm.color,
              whiteSpace: 'nowrap',
              border: 'none',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: vm.color,
                flexShrink: 0,
              }}
            />
            {vm.label}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 6,
              }}
              title="Hapus booking"
            >
              <Trash size={16} weight="duotone" color="#FF3B30" />
            </button>

            {/* Chevron */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="#ccc"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{
                transition: 'transform 0.2s',
                transform: isExpanded ? 'rotate(90deg)' : 'none',
                flexShrink: 0,
              }}
            >
              <path d="M5.5 3l4.5 4-4.5 4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && children}
    </div>
  );
}
