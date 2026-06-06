/**
 * @responsibility
 * Centralized status metadata for bookings, payments, and visitor types.
 * Single source of truth for labels, colors, and background colors.
 *
 * @usedBy
 * BookingRow, BookingStatusBadge, PaymentStatusBadge,
 * BookingDetailPanel, MobileDetailPanel
 *
 * @notes
 * Colors reference design tokens from tailwind.config.ts.
 * Use these constants instead of hardcoding hex values in components.
 */

import type {
  BookingStatus,
  PaymentStatus,
  VisitorType,
} from '@/features/dashboard/types/dashboard.types';

// ── Booking Status ────────────────────────────────────────────────────────────

export interface StatusMeta {
  /** Display label in Bahasa Indonesia */
  label: string;
  /** Text color hex — matches st-* tokens in tailwind.config.ts */
  color: string;
  /** Background color hex — matches st-*-bg tokens */
  bg: string;
}

export const BOOKING_STATUS_META: Record<BookingStatus, StatusMeta> = {
  UPCOMING: {
    label: 'Perlu Konfirmasi',
    color: '#d97706',
    bg: '#fffbeb',
  },
  CONFIRMED: {
    label: 'Terkonfirmasi',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  IN_PROGRESS: {
    label: 'Berlangsung',
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  COMPLETED: {
    label: 'Selesai',
    color: '#9ca3af',
    bg: '#f9fafb',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: '#ef4444',
    bg: '#fef2f2',
  },
  NO_SHOW: {
    label: 'Tidak Hadir',
    color: '#9ca3af',
    bg: '#f9fafb',
  },
};

/** Orange dot color for UPCOMING badge notification on avatar */
export const UPCOMING_NOTIF_COLOR = '#f59e0b';

// ── Payment Status ────────────────────────────────────────────────────────────

export interface PaymentMeta {
  label: string;
  color: string;
}

export const PAYMENT_STATUS_META: Record<NonNullable<PaymentStatus>, PaymentMeta> = {
  PAID: { label: 'Lunas', color: '#34C759' },
  DEPOSIT: { label: 'DP', color: '#FF9500' },
  UNPAID: { label: 'Belum Bayar', color: '#8E8E93' },
};

// ── Visitor Type ──────────────────────────────────────────────────────────────

export interface VisitorTypeMeta {
  label: string;
  color: string;
  bg: string;
}

export const VISITOR_TYPE_META: Record<VisitorType, VisitorTypeMeta> = {
  WALK_IN: { label: 'Walk-in', color: '#856404', bg: '#FEF3C7' },
  BOOKING: { label: 'Booking', color: '#1565C0', bg: '#DBEAFE' },
};

// ── Promo Codes (temporary — move to DB/API later) ────────────────────────────

export interface PromoCode {
  type: 'percent' | 'fixed';
  value: number;
}

export const PROMO_CODES: Record<string, PromoCode> = {
  DISKON10: { type: 'percent', value: 10 },
  HEMAT50K: { type: 'fixed', value: 50_000 },
  RARA20: { type: 'percent', value: 20 },
  MEMBER15: { type: 'percent', value: 15 },
};
