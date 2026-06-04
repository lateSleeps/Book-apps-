/**
 * @responsibility
 * Mobile booking list: horizontal scrolling filter tabs + list of booking cards.
 * Displayed only on mobile (md:hidden).
 *
 * @usedBy
 * app/dashboard/overview/page.tsx
 *
 * @notes
 * - Presentation only — no local state.
 * - Tab data and bookings come from use-booking-list via controller.
 */

'use client';

import type { BookingListState } from '../../../hooks/overview/use-booking-list';
import { MobileBookingCard } from './MobileBookingCard';

const TABS = [
  { key: 'ALL' as const, label: 'Semua' },
  { key: 'BOOKING' as const, label: 'Booking' },
  { key: 'WALK_IN' as const, label: 'Datang Langsung' },
  { key: 'COMPLETED' as const, label: 'Selesai' },
];

interface MobileBookingListProps {
  list: Pick<
    BookingListState,
    'bookings' | 'bookingCounts' | 'activeTab' | 'setActiveTab' | 'getEffectiveStatus'
  >;
  onSelectBooking: (id: string) => void;
}

export function MobileBookingList({ list, onSelectBooking }: MobileBookingListProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {TABS.map(({ key, label }) => {
          const active = list.activeTab === key;
          return (
            <button
              key={key}
              onClick={() => list.setActiveTab(key)}
              className={`flex-shrink-0 rounded-rF px-3 py-1.5 text-ts-cap1 font-medium transition-colors ${
                active
                  ? 'bg-tx-primary text-white'
                  : 'bg-bg-card text-tx-secondary hover:bg-bg-surface hover:text-tx-subtle'
              }`}
            >
              {label} <span className="ml-1 text-[0.625rem]">{list.bookingCounts[key]}</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {list.bookings.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-ts-fn text-tx-subtle">Tidak ada pengunjung</p>
          </div>
        ) : (
          list.bookings.map((b) => (
            <MobileBookingCard
              key={b.id}
              booking={b}
              effectiveStatus={list.getEffectiveStatus(b.id) ?? b.status}
              onClick={() => onSelectBooking(b.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
