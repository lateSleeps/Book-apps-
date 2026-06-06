/**
 * @responsibility
 * Manages booking list state: filtering, searching, sorting, and row expansion.
 * Provides a stable, derived view of bookings for the overview table.
 *
 * @usedBy
 * app/dashboard/overview/page.tsx
 *
 * @notes
 * - Does NOT handle payment, confirmations, dialogs, or UI state.
 * - bookingStatusMap / paymentStatusMap are owned here but shared with
 *   useBookingActions via overrideBookingStatus / overridePaymentStatus.
 * - frozenOrder is internal — prevents list from shuffling while row is expanded.
 * - manualBookings holds walk-ins added this session (not yet from API).
 */

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { DUMMY_BOOKINGS } from '../../constants/overview/mock-data';
import type { DashboardBooking, BookingStatus, PaymentStatus } from '../../types/dashboard.types';
import type { VisitorTab, SortOrder } from '../../types/overview.types';
import {
  buildEffectiveBookings,
  applyTabFilter,
  applySearchFilter,
  applySortOrFrozenOrder,
  computeVisitorCounts,
  countPendingConfirm,
} from '../../utils/booking-list.utils';
import { useDashboardData } from '../use-dashboard-data';

// ── Public API ────────────────────────────────────────────────────────────────

export interface BookingListState {
  /** Filtered, sorted bookings ready for display */
  bookings: DashboardBooking[];
  /** All effective bookings (pre-filter) — for stats and counts */
  allBookings: DashboardBooking[];
  /** Badge counts per tab */
  bookingCounts: Record<VisitorTab, number>;
  /** Number of BOOKING-type bookings needing confirmation */
  pendingConfirmCount: number;

  /** Active filter tab */
  activeTab: VisitorTab;
  setActiveTab: (tab: VisitorTab) => void;

  /** Search query (name or phone) */
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  /** Sort direction */
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;

  /** Currently expanded booking row ID */
  expandedId: string | null;
  /** Toggle expand/collapse for a row. Resets frozen order on collapse. */
  toggleExpand: (id: string) => void;

  /** Current effective status for a booking (override > API value) */
  getEffectiveStatus: (bookingId: string) => BookingStatus | undefined;

  /**
   * Called by useBookingActions when a status changes (confirm/decline/complete).
   * Keeps list display in sync with optimistic updates.
   */
  overrideBookingStatus: (bookingId: string, status: BookingStatus) => void;

  /**
   * Called by useBookingActions when payment is processed.
   */
  overridePaymentStatus: (bookingId: string, status: PaymentStatus) => void;

  /**
   * Called by useBookingActions when a booking is deleted.
   * Soft-removes the booking from the list.
   */
  markDeleted: (bookingId: string) => void;

  /**
   * Called by useWalkInFlow when a walk-in is created.
   * Prepends the booking to the top of the list.
   */
  addManualBooking: (booking: DashboardBooking) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBookingList(): BookingListState {
  const { upcomingBookings } = useDashboardData();

  // ── Filter / search / sort ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<VisitorTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');

  // ── Row expansion ───────────────────────────────────────────────────────────
  const [expandedId, setExpandedId] = useState<string | null>(null);
  /** Internal — not exposed. Prevents list reorder while row is open. */
  const [frozenOrder, setFrozenOrder] = useState<string[] | null>(null);

  // ── Data overrides (optimistic updates) ────────────────────────────────────
  const [bookingStatusMap, setBookingStatusMap] = useState<Record<string, BookingStatus>>({});
  const [paymentStatusMap, setPaymentStatusMap] = useState<Record<string, PaymentStatus>>({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [manualBookings, setManualBookings] = useState<DashboardBooking[]>(DUMMY_BOOKINGS);

  // ── Derived: effective bookings (merged + overridden) ───────────────────────
  const allBookings = useMemo(
    () =>
      buildEffectiveBookings(
        upcomingBookings,
        manualBookings,
        bookingStatusMap,
        paymentStatusMap,
        deletedIds
      ),
    [upcomingBookings, manualBookings, bookingStatusMap, paymentStatusMap, deletedIds]
  );

  // ── Derived: filtered + sorted for display ──────────────────────────────────
  const bookings = useMemo(() => {
    const byTab = applyTabFilter(allBookings, activeTab);
    const bySearch = applySearchFilter(byTab, searchQuery);
    return applySortOrFrozenOrder(bySearch, frozenOrder, sortOrder, bookingStatusMap);
  }, [allBookings, activeTab, searchQuery, frozenOrder, sortOrder, bookingStatusMap]);

  // ── Derived: tab counts + pending badge ─────────────────────────────────────
  const bookingCounts = useMemo(() => computeVisitorCounts(allBookings), [allBookings]);
  const pendingConfirmCount = useMemo(() => countPendingConfirm(allBookings), [allBookings]);

  // ── Freeze sort order while row is expanded ─────────────────────────────────
  // Captures snapshot of current order when row opens.
  // Cleared when row closes so next open gets fresh sort.
  useEffect(() => {
    if (expandedId) {
      setFrozenOrder(bookings.map((b) => b.id));
    } else {
      setFrozenOrder(null);
    }
    // intentionally excludes `bookings` — we only want to snapshot on expand/collapse
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedId]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const toggleExpand = useCallback((id: string) => {
    setFrozenOrder(null); // clear first so list re-sorts before new snapshot
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const overrideBookingStatus = useCallback((bookingId: string, status: BookingStatus) => {
    setBookingStatusMap((prev) => ({ ...prev, [bookingId]: status }));
  }, []);

  const overridePaymentStatus = useCallback((bookingId: string, status: PaymentStatus) => {
    setPaymentStatusMap((prev) => ({ ...prev, [bookingId]: status }));
  }, []);

  const getEffectiveStatus = useCallback(
    (bookingId: string): BookingStatus | undefined => bookingStatusMap[bookingId],
    [bookingStatusMap]
  );

  const markDeleted = useCallback((bookingId: string) => {
    setDeletedIds((prev) => new Set([...prev, bookingId]));
  }, []);

  const addManualBooking = useCallback((booking: DashboardBooking) => {
    setManualBookings((prev) => [booking, ...prev]);
  }, []);

  return {
    bookings,
    allBookings,
    bookingCounts,
    pendingConfirmCount,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    expandedId,
    toggleExpand,
    getEffectiveStatus,
    overrideBookingStatus,
    overridePaymentStatus,
    markDeleted,
    addManualBooking,
  };
}
