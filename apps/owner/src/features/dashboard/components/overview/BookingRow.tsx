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
import {
  BOOKING_STATUS_META,
  PAYMENT_STATUS_META,
  VISITOR_TYPE_META,
  UPCOMING_NOTIF_COLOR,
} from '../../constants/overview/booking-status';
import type { DashboardBooking, BookingStatus } from '../../types/dashboard.types';
import { SkeletonRow } from '@/components/SkeletonLoader';
import { avatarColor, getInitials } from '@/shared/lib/avatar';

interface BookingRowProps {
  booking: DashboardBooking;
  isExpanded: boolean;
  isLoading: boolean;
  confirmingId: string | null;
  effectiveStatus: BookingStatus;
  onToggle: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}

const COLUMN_LABELS = ['Pelanggan', 'Status', 'Layanan', 'Stylist', 'Waktu', 'Tipe'];
const GRID = '2fr 1fr 2fr 1.5fr 1fr 1.2fr';

export function BookingRowColumnHeaders() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: GRID,
        padding: '0.625rem 1.25rem',
        alignItems: 'center',
        background: '#F7F7F8',
        borderRadius: '0.75rem 0.75rem 0 0',
      }}
    >
      {COLUMN_LABELS.map((h, i) => (
        <span
          key={h}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: '#8E8E93',
            textAlign: i === 5 ? 'right' : 'left',
          }}
        >
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
  confirmingId,
  effectiveStatus,
  onToggle,
  onDelete,
  children,
}: BookingRowProps) {
  if (isLoading) {
    return (
      <div style={{ borderBottom: '1px solid #F2F2F7', opacity: 0.4, transition: 'opacity 0.3s' }}>
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
    <div style={{ borderBottom: '1px solid #EFEFEF' }} className="last:border-0">
      {/* Collapsed row */}
      <div
        onClick={onToggle}
        style={{
          display: 'grid',
          gridTemplateColumns: GRID,
          padding: '0.875rem 1.25rem',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'background 0.12s',
          background: isExpanded ? '#fafaf8' : 'transparent',
        }}
        className="hover:bg-[#fafaf8]"
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
                className="animate-badge-shake"
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: UPCOMING_NOTIF_COLOR,
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 8, fontWeight: 800, color: 'white', lineHeight: 1 }}>
                  !
                </span>
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: '#1C1C1E',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
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
            <span style={{ fontSize: 13, color: pm?.color ?? '#8E8E93' }}>
              {pm?.label ?? 'Belum Bayar'}
            </span>
          </div>
        </div>

        {/* Col 3: Service */}
        <span
          style={{
            fontSize: '0.875rem',
            color: '#1a1a1a',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {b.serviceName}
        </span>

        {/* Col 4: Stylist */}
        <span
          style={{
            fontSize: '0.875rem',
            color: '#555',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {b.stylistName}
        </span>

        {/* Col 5: Time */}
        <span
          style={{ fontSize: '0.875rem', color: '#1a1a1a', fontVariantNumeric: 'tabular-nums' }}
        >
          {b.timeSlot.slice(0, 5)}
        </span>

        {/* Col 6: Type + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: vm.color,
              background: vm.bg,
              borderRadius: 9999,
              padding: '3px 8px',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: vm.color }} />
            {vm.label}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-r6 text-tx-muted transition-colors hover:bg-red-50 hover:text-st-cancelled"
            title="Hapus booking"
          >
            <Trash size={14} weight="duotone" />
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

      {/* Expanded content */}
      {isExpanded && children}
    </div>
  );
}
