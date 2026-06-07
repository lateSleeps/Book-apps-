/**
 * @responsibility
 * Dashboard domain metadata for customer segments.
 * Used by the History module's customer intelligence layer.
 *
 * @usedBy
 * History (CustomerSegmentBadge, use-customer-intelligence)
 * Future: CRM, Customer List
 *
 * @notes
 * Segment logic lives in use-customer-intelligence hook.
 * This file only holds display metadata (label, color, bg).
 */

export type CustomerSegment = 'NEW' | 'REGULAR' | 'LOYAL' | 'VIP' | 'AT_RISK' | 'DORMANT';

export interface CustomerSegmentMeta {
  label: string;
  color: string;
  bg: string;
}

export const CUSTOMER_SEGMENT_META: Record<CustomerSegment, CustomerSegmentMeta> = {
  NEW: { label: 'Baru', color: '#8E8E93', bg: '#F2F2F7' },
  REGULAR: { label: 'Reguler', color: '#2563eb', bg: '#eff6ff' },
  LOYAL: { label: 'Loyal', color: '#16a34a', bg: '#f0fdf4' },
  VIP: { label: 'VIP', color: '#d97706', bg: '#fffbeb' },
  AT_RISK: { label: 'Berisiko', color: '#ea580c', bg: '#fff7ed' },
  DORMANT: { label: 'Dorman', color: '#ef4444', bg: '#fef2f2' },
};
