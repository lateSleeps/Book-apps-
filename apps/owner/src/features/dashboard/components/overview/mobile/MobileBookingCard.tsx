/**
 * @responsibility
 * Single booking card for the mobile list view.
 * Displays customer avatar, name, service, status badge, payment status,
 * stylist, time, and visitor type. Tapping opens the detail sheet.
 *
 * @usedBy
 * MobileBookingList.tsx
 *
 * @notes
 * - Presentation only — no local state.
 * - Uses avatarColor and getInitials from shared/lib/avatar.
 * - Status metadata from booking-status constants.
 */

'use client';

import { BOOKING_STATUS_META } from '../../../constants/domain/booking-status';
import { VISITOR_TYPE_META } from '../../../constants/domain/visitor-type';
import type { DashboardBooking, BookingStatus } from '../../../types/dashboard.types';
import { avatarColor, getInitials } from '@/shared/lib/avatar';

interface MobileBookingCardProps {
  booking: DashboardBooking;
  effectiveStatus: BookingStatus;
  onClick: () => void;
}

export function MobileBookingCard({
  booking: b,
  effectiveStatus,
  onClick,
}: MobileBookingCardProps) {
  const sm = BOOKING_STATUS_META[effectiveStatus] ?? BOOKING_STATUS_META.NO_SHOW;
  const vm = VISITOR_TYPE_META[b.visitorType];
  const { bg, text } = avatarColor(b.customerName);

  return (
    <button
      onClick={onClick}
      className="w-full rounded-r20 border border-bd-card bg-bg-card p-3.5 text-left transition-all hover:shadow-md active:bg-bg-surface"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-ts-fn font-semibold"
          style={{ backgroundColor: bg, color: text, borderRadius: '0.5rem' }}
        >
          {getInitials(b.customerName)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Name + status badge */}
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-ts-fn font-semibold text-tx-primary">{b.customerName}</p>
            <span
              className="flex-shrink-0 rounded-r6 px-1.5 py-0.5 text-ts-cap2 font-semibold"
              style={{ color: sm.color, backgroundColor: sm.bg }}
            >
              {sm.label}
            </span>
          </div>

          {/* Service */}
          <p className="mt-0.5 truncate text-ts-cap1 text-tx-secondary">{b.serviceName}</p>

          {/* Meta row */}
          <div className="mt-1.5 flex items-center gap-2 text-ts-cap1 text-tx-secondary">
            <span>{b.timeSlot.slice(0, 5)}</span>
            <span className="text-tx-muted">·</span>
            <span>{b.stylistName}</span>
            <span className="text-tx-muted">·</span>
            <span
              className="rounded-rF px-1.5 py-0.5 text-ts-cap2 font-semibold"
              style={{ color: vm.color, backgroundColor: vm.bg }}
            >
              {vm.label}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="#ccc"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="mt-1 flex-shrink-0"
        >
          <path d="M5.5 3l4.5 4-4.5 4" />
        </svg>
      </div>
    </button>
  );
}
