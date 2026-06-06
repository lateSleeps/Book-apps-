/**
 * @responsibility
 * Pure utility functions for booking list computation.
 * All functions are stateless and side-effect-free — safe to unit test.
 *
 * @usedBy
 * hooks/overview/use-booking-list.ts
 *
 * @notes
 * Keep functions small and single-purpose.
 * No React imports allowed here — pure TypeScript only.
 */

import type { DashboardBooking, BookingStatus, PaymentStatus } from '../types/dashboard.types';
import type { VisitorTab, SortOrder } from '../types/overview.types';

// ── Effective Bookings ────────────────────────────────────────────────────────

/**
 * Merges API bookings with local manual bookings (walk-ins),
 * applies local status/payment overrides, and removes deleted/unpaid entries.
 *
 * "Effective" = what the user sees right now, including optimistic updates.
 */
export function buildEffectiveBookings(
  upcomingBookings: DashboardBooking[],
  manualBookings: DashboardBooking[],
  bookingStatusMap: Record<string, BookingStatus>,
  paymentStatusMap: Record<string, PaymentStatus>,
  deletedIds: Set<string>
): DashboardBooking[] {
  return [...upcomingBookings, ...manualBookings]
    .map((b) => ({
      ...b,
      status: bookingStatusMap[b.id] ?? b.status,
      paymentStatus: paymentStatusMap[b.id] ?? b.paymentStatus,
    }))
    .filter(
      (b) => !(b.visitorType === 'BOOKING' && b.paymentStatus === 'UNPAID') && !deletedIds.has(b.id)
    );
}

// ── Filtering ─────────────────────────────────────────────────────────────────

/**
 * Filters bookings by the active tab selection.
 * COMPLETED = selesai, BOOKING = online booking, WALK_IN = datang langsung.
 */
export function applyTabFilter(bookings: DashboardBooking[], tab: VisitorTab): DashboardBooking[] {
  switch (tab) {
    case 'COMPLETED':
      return bookings.filter((b) => b.status === 'COMPLETED');
    case 'BOOKING':
      return bookings.filter((b) => b.visitorType === 'BOOKING' && b.paymentStatus !== 'UNPAID');
    case 'WALK_IN':
      return bookings.filter((b) => b.visitorType === 'WALK_IN');
    case 'ALL':
    default:
      return bookings;
  }
}

/**
 * Filters bookings by customer name or phone number.
 * Returns all bookings if query is empty.
 */
export function applySearchFilter(bookings: DashboardBooking[], query: string): DashboardBooking[] {
  const q = query.trim().toLowerCase();
  if (!q) return bookings;
  return bookings.filter(
    (b) => b.customerName.toLowerCase().includes(q) || b.customerPhone.includes(q)
  );
}

// ── Sorting ───────────────────────────────────────────────────────────────────

/**
 * Sorts bookings using frozen order (if active) or natural sort.
 *
 * Frozen order: preserves the list position from before a status change,
 * preventing the row from jumping while the user is viewing its detail.
 *
 * Natural sort: UPCOMING first, then by time (newest/oldest).
 */
export function applySortOrFrozenOrder(
  bookings: DashboardBooking[],
  frozenOrder: string[] | null,
  sortOrder: SortOrder,
  bookingStatusMap: Record<string, BookingStatus>
): DashboardBooking[] {
  if (frozenOrder) {
    const orderMap = new Map(frozenOrder.map((id, i) => [id, i]));
    return [...bookings].sort((a, b) => {
      const ai = orderMap.get(a.id) ?? Infinity;
      const bi = orderMap.get(b.id) ?? Infinity;
      return ai - bi;
    });
  }

  return [...bookings].sort((a, b) => {
    const effA = bookingStatusMap[a.id] ?? a.status;
    const effB = bookingStatusMap[b.id] ?? b.status;
    const isUpcomingA = effA === 'UPCOMING' ? 0 : 1;
    const isUpcomingB = effB === 'UPCOMING' ? 0 : 1;
    if (isUpcomingA !== isUpcomingB) return isUpcomingA - isUpcomingB;
    const aTime = a.createdAt ?? a.timeSlot ?? '';
    const bTime = b.createdAt ?? b.timeSlot ?? '';
    const cmp = bTime.localeCompare(aTime);
    return sortOrder === 'DESC' ? cmp : -cmp;
  });
}

// ── Counts ────────────────────────────────────────────────────────────────────

/**
 * Computes badge counts for each visitor tab.
 * Used to show numbers next to each tab label.
 */
export function computeVisitorCounts(bookings: DashboardBooking[]): Record<VisitorTab, number> {
  return {
    ALL: bookings.length,
    BOOKING: bookings.filter((b) => b.visitorType === 'BOOKING' && b.paymentStatus !== 'UNPAID')
      .length,
    WALK_IN: bookings.filter((b) => b.visitorType === 'WALK_IN').length,
    COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
  };
}

/**
 * Counts BOOKING-type bookings that are UPCOMING (need confirmation).
 * Used for the orange warning badge on the "Booking" tab.
 */
export function countPendingConfirm(bookings: DashboardBooking[]): number {
  return bookings.filter((b) => b.visitorType === 'BOOKING' && b.status === 'UPCOMING').length;
}
