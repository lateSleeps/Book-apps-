/**
 * @responsibility
 * Dashboard domain metadata for payment statuses.
 * Single source of truth — reusable by all dashboard modules.
 *
 * @usedBy
 * Overview, History, CRM, Analytics — any module that displays payment status.
 *
 * @notes
 * Colors match py-* tokens in tailwind.config.ts.
 */

import type { PaymentStatus } from '@/features/dashboard/types/dashboard.types';

export interface PaymentMeta {
  label: string;
  /** Text color hex — matches py-* tokens */
  color: string;
}

export const PAYMENT_STATUS_META: Record<NonNullable<PaymentStatus>, PaymentMeta> = {
  PAID: { label: 'Lunas', color: '#34C759' },
  DEPOSIT: { label: 'DP', color: '#FF9500' },
  UNPAID: { label: 'Belum Bayar', color: '#8E8E93' },
};
