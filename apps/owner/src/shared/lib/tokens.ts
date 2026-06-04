/**
 * Design Tokens — Firalink Owner Dashboard
 *
 * Konstanta JS untuk dipakai di:
 * - Komponen yang butuh value dinamis (e.g. Phosphor icon color)
 * - Logic yang compute warna berdasarkan data
 *
 * Untuk className Tailwind, gunakan token di tailwind.config.ts langsung.
 * Docs: docs/design-system/tokens.md
 */

// ── Booking Status ────────────────────────────────────────────────────────────

import type {
  BookingStatus,
  PaymentStatus,
  VisitorType,
} from '@/features/dashboard/types/dashboard.types';

export interface StatusMeta {
  label: string;
  color: string; // text color
  bg: string; // background color
}

export const BOOKING_STATUS_META: Record<BookingStatus, StatusMeta> = {
  UPCOMING: { label: 'Perlu Konfirmasi', color: '#d97706', bg: '#fffbeb' },
  CONFIRMED: { label: 'Terkonfirmasi', color: '#2563eb', bg: '#eff6ff' },
  IN_PROGRESS: { label: 'Berlangsung', color: '#16a34a', bg: '#f0fdf4' },
  COMPLETED: { label: 'Selesai', color: '#9ca3af', bg: '#f9fafb' },
  CANCELLED: { label: 'Dibatalkan', color: '#ef4444', bg: '#fef2f2' },
  NO_SHOW: { label: 'Tidak Hadir', color: '#9ca3af', bg: '#f9fafb' },
};

/** Warna dot notifikasi badge di avatar — hanya UPCOMING */
export const UPCOMING_DOT_COLOR = '#f59e0b';

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

// ── Avatar ────────────────────────────────────────────────────────────────────

export const AVATAR_BG_COLORS = [
  '#D1FAE5', // mint green
  '#DBEAFE', // soft blue
  '#FEF3C7', // soft amber
  '#FECACA', // soft coral
  '#E9D5FF', // soft lavender
  '#FFEDD5', // soft peach
  '#CCFBF1', // soft teal
  '#FEE2E2', // soft rose
] as const;

export const AVATAR_TEXT_COLOR = '#1C1C1E';

// ── Stat Card Icon Colors ─────────────────────────────────────────────────────

export const STAT_ICON_COLORS = {
  revenue: '#007AFF', // iOS blue
  bookings: '#007AFF',
  completed: '#34C759', // iOS green
  cancelled: '#FF3B30', // iOS red
} as const;

// ── Actions ───────────────────────────────────────────────────────────────────

export const ACTION_COLORS = {
  primary: '#2563eb',
  danger: '#ef4444',
  wa: '#25d366',
} as const;
