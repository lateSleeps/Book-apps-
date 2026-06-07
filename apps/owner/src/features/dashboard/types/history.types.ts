/**
 * @responsibility
 * Type definitions for the Riwayat Kunjungan (History) module.
 *
 * @usedBy
 * All history/* components, controller, and hooks.
 */

import type { AddOn, PaymentStatus, ServiceQuestion, VisitorType } from './dashboard.types';

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

// ── Visit Record ──────────────────────────────────────────────────────────────

export interface VisitRecord {
  id: string;
  /** ISO date string — e.g. '2026-06-05' */
  date: string;
  customerName: string;
  customerId: string;
  customerPhone?: string;
  serviceName: string;
  stylistName: string;
  visitType: VisitorType;
  totalAmount: number;
  paymentStatus: NonNullable<PaymentStatus>;
  paymentMethod?: 'CASH' | 'TRANSFER' | 'QRIS';
  bookingCode: string;
  // Treatment detail
  duration?: number;
  notes?: string;
  // Add-ons
  addOns?: AddOn[];
  // Financials
  subtotal?: number;
  discountAmount?: number;
  promoCode?: string;
  // Payment proof
  paymentProofUrl?: string;
  settlementProofUrl?: string;
  // Consultation reconstruction
  serviceQuestions?: ServiceQuestion[];
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface HistoryStats {
  totalVisits: number;
  totalRevenue: number;
  walkInCount: number;
  bookingCount: number;
  avgTicket: number;
}
