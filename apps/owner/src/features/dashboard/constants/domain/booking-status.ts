/**
 * @responsibility
 * Dashboard domain metadata for booking statuses.
 * Single source of truth — reusable by all dashboard modules.
 *
 * @usedBy
 * Overview, History, CRM, Analytics — any module that displays booking status.
 *
 * @notes
 * Colors match st-* tokens in tailwind.config.ts.
 */

import type { BookingStatus } from '@/features/dashboard/types/dashboard.types';

export interface StatusMeta {
  label: string;
  /** Text color hex — matches st-* tokens */
  color: string;
  /** Background color hex — matches st-*-bg tokens */
  bg: string;
}

export const BOOKING_STATUS_META: Record<BookingStatus, StatusMeta> = {
  UPCOMING: { label: 'Perlu Konfirmasi', color: '#d97706', bg: '#fffbeb' },
  CONFIRMED: { label: 'Terkonfirmasi', color: '#2563eb', bg: '#eff6ff' },
  IN_PROGRESS: { label: 'Berlangsung', color: '#16a34a', bg: '#f0fdf4' },
  COMPLETED: { label: 'Selesai', color: '#9ca3af', bg: '#f9fafb' },
  CANCELLED: { label: 'Dibatalkan', color: '#ef4444', bg: '#fef2f2' },
  NO_SHOW: { label: 'Tidak Hadir', color: '#9ca3af', bg: '#f9fafb' },
};
