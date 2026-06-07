/**
 * @responsibility
 * Type definitions for the Riwayat Kunjungan (History) module.
 *
 * @usedBy
 * All history/* components, controller, and hooks.
 */

// ── Period ────────────────────────────────────────────────────────────────────

export type HistoryPeriodPreset = 'THIS_MONTH' | '3_MONTHS' | '6_MONTHS' | '12_MONTHS' | 'CUSTOM';

export interface HistoryPeriod {
  preset: HistoryPeriodPreset;
  from: Date;
  to: Date;
}

// ── Filters ───────────────────────────────────────────────────────────────────

export type HistoryVisitTypeFilter = 'ALL' | 'BOOKING' | 'WALK_IN';
export type HistoryPaymentFilter = 'ALL' | 'PAID' | 'DEPOSIT' | 'UNPAID';
export type HistoryStylistFilter = string | 'ALL';

export interface HistoryFilters {
  visitType: HistoryVisitTypeFilter;
  stylistId: HistoryStylistFilter;
  paymentStatus: HistoryPaymentFilter;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface HistoryStats {
  totalVisits: number;
  totalRevenue: number;
  walkInCount: number;
  bookingCount: number;
  avgTicket: number;
}
