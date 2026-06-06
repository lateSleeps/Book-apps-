/**
 * @responsibility
 * Type definitions specific to the Overview/Dashboard page.
 * Extends base dashboard.types.ts with page-specific types.
 *
 * @usedBy
 * overview/page.tsx, all overview hooks and components
 */

// ── Filter Tabs ───────────────────────────────────────────────────────────────

export type VisitorTab = 'ALL' | 'BOOKING' | 'WALK_IN' | 'COMPLETED';

// ── Service & Product (mock — will come from Settings API) ───────────────────

export interface MockService {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  duration: number;
}

export interface MockProduct {
  id: string;
  name: string;
  price: number;
}

/** Locally overridden service data for a booking (edit in detail panel) */
export interface ServiceData {
  serviceName: string;
  price: number;
  categoryName: string;
}

// ── Promo ─────────────────────────────────────────────────────────────────────

export interface PromoData {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  discount: number;
}

// ── Walk-in Form ──────────────────────────────────────────────────────────────

export interface WalkInFormData {
  name: string;
  phone: string;
  serviceId: string;
  stylistId: string;
  time: string;
}

// ── Payment ───────────────────────────────────────────────────────────────────

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS';

export interface ConfirmPaymentDialogData {
  bookingId: string;
  customerName: string;
  serviceName: string;
  amount: number;
  method: PaymentMethod;
  finalTotal: number;
}

// ── Dialogs ───────────────────────────────────────────────────────────────────

export interface DeclineDialogData {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  reason: string;
}

export interface DeleteDialogData {
  bookingId: string;
  customerName: string;
}

export interface ProofZoomData {
  url: string;
  label: string;
}

// ── Sort ──────────────────────────────────────────────────────────────────────

export type SortOrder = 'ASC' | 'DESC';
