/**
 * @responsibility
 * Composes all overview domain hooks and coordinates cross-domain interactions.
 * This is the single entry point for the overview page's state.
 *
 * @usedBy
 * app/dashboard/overview/page.tsx
 *
 * @architecture
 * Each domain hook is independent and knows nothing about other hooks.
 * Cross-domain interactions are wired here via narrow callbacks:
 *
 *   useBookingStatus  ──onStatusOverride──→  list.overrideBookingStatus
 *                     ──onDelete──────────→  list.markDeleted
 *
 *   useBookingPayment ──onStatusOverride──→  list.overrideBookingStatus
 *                     ──onPaymentOverride──→ list.overridePaymentStatus
 *
 *   useWalkInFlow     ──onBookingCreated──→  list.addManualBooking
 *
 * @notes
 * - No business logic lives here — only composition and wiring.
 * - If a new cross-domain interaction is needed, add it here, not in hooks.
 * - page.tsx uses this controller as its sole data dependency.
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBookingDetail } from '../hooks/overview/use-booking-detail';
import { useBookingList } from '../hooks/overview/use-booking-list';
import { useBookingPayment } from '../hooks/overview/use-booking-payment';
import { useBookingPromo } from '../hooks/overview/use-booking-promo';
import { useBookingStatus } from '../hooks/overview/use-booking-status';
import { useDashboardUi } from '../hooks/overview/use-dashboard-ui';
import { useWalkInFlow } from '../hooks/overview/use-walk-in-flow';
import { useDashboardData } from '../hooks/use-dashboard-data';
import { useServices } from '@/hooks/useServices';
import { useStylists } from '@/hooks/useStylists';

const AUTO_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 menit
const SKELETON_DURATION_MS = 800; // 0.8 detik
const SALON_ID = '5cdb0848-1b43-44f6-be29-b2ead49ff65a';

export interface OverviewController {
  list: ReturnType<typeof useBookingList>;
  status: ReturnType<typeof useBookingStatus>;
  detail: ReturnType<typeof useBookingDetail>;
  promo: ReturnType<typeof useBookingPromo>;
  payment: ReturnType<typeof useBookingPayment>;
  walkIn: ReturnType<typeof useWalkInFlow>;
  ui: ReturnType<typeof useDashboardUi>;
  stats: ReturnType<typeof useDashboardData>['stats'];
  isRefreshing: boolean;
  refreshData: () => void;
  realServices: ReturnType<typeof useServices>['services'];
  realStylists: ReturnType<typeof useStylists>['stylists'];
  bookingStatusMap: Record<string, string>;
}

export function useOverviewController(): OverviewController {
  // ── Base data ───────────────────────────────────────────────────────────────
  const { stats, refetch } = useDashboardData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Refresh handler — shows 0.8s skeleton then refetches ───────────────────
  const refreshData = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      void refetch().finally(() => setIsRefreshing(false));
    }, SKELETON_DURATION_MS);
  }, [refetch]);

  // ── Auto-refresh every 10 minutes ──────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(refreshData, AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshData]);

  // ── Base layer: owns shared booking state ───────────────────────────────────
  const list = useBookingList();

  // ── Domain hooks — independent, wired via narrow callbacks ──────────────────

  const status = useBookingStatus({
    onStatusOverride: list.overrideBookingStatus,
    onDelete: list.markDeleted,
  });

  const payment = useBookingPayment({
    onStatusOverride: list.overrideBookingStatus,
    onPaymentOverride: list.overridePaymentStatus,
  });

  const walkIn = useWalkInFlow({
    onBookingCreated: list.addManualBooking,
  });

  // ── Data dependency (primitive, not hook coupling) ──────────────────────────
  const detail = useBookingDetail(list.expandedId);

  // ── Fully independent hooks ─────────────────────────────────────────────────
  const promo = useBookingPromo();
  const ui = useDashboardUi();

  // ── Domain catalog data (needed by WalkInDrawer) ────────────────────────────
  const { services: realServices } = useServices(SALON_ID);
  const { stylists: realStylists } = useStylists(SALON_ID);

  // ── Derived: booking status map (stable across renders unless bookings change)
  const bookingStatusMap = useMemo(
    () =>
      Object.fromEntries(
        list.allBookings.map((b) => [b.id, list.getEffectiveStatus(b.id) ?? b.status])
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [list.allBookings]
  );

  return {
    list,
    status,
    detail,
    promo,
    payment,
    walkIn,
    ui,
    stats,
    isRefreshing,
    refreshData,
    realServices,
    realStylists,
    bookingStatusMap,
  };
}
