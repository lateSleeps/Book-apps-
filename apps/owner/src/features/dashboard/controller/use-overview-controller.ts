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

import { useBookingDetail } from '../hooks/overview/use-booking-detail';
import { useBookingList } from '../hooks/overview/use-booking-list';
import { useBookingPayment } from '../hooks/overview/use-booking-payment';
import { useBookingPromo } from '../hooks/overview/use-booking-promo';
import { useBookingStatus } from '../hooks/overview/use-booking-status';
import { useDashboardUi } from '../hooks/overview/use-dashboard-ui';
import { useWalkInFlow } from '../hooks/overview/use-walk-in-flow';
import { useDashboardData } from '../hooks/use-dashboard-data';

export interface OverviewController {
  list: ReturnType<typeof useBookingList>;
  status: ReturnType<typeof useBookingStatus>;
  detail: ReturnType<typeof useBookingDetail>;
  promo: ReturnType<typeof useBookingPromo>;
  payment: ReturnType<typeof useBookingPayment>;
  walkIn: ReturnType<typeof useWalkInFlow>;
  ui: ReturnType<typeof useDashboardUi>;
  stats: ReturnType<typeof useDashboardData>['stats'];
}

export function useOverviewController(): OverviewController {
  // ── Base data ───────────────────────────────────────────────────────────────
  const { stats } = useDashboardData();

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

  return { list, status, detail, promo, payment, walkIn, ui, stats };
}
