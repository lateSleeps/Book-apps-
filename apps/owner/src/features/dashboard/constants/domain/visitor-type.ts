/**
 * @responsibility
 * Dashboard domain metadata for visitor types (Walk-in vs Booking).
 * Single source of truth — reusable by all dashboard modules.
 *
 * @usedBy
 * Overview, History, CRM, Analytics — any module that displays visitor type.
 *
 * @notes
 * Colors match vt-* tokens in tailwind.config.ts.
 */

import type { VisitorType } from '@/features/dashboard/types/dashboard.types';

export interface VisitorTypeMeta {
  label: string;
  /** Text color hex — matches vt-*-text tokens */
  color: string;
  /** Background color hex — matches vt-*-bg tokens */
  bg: string;
}

export const VISITOR_TYPE_META: Record<VisitorType, VisitorTypeMeta> = {
  WALK_IN: { label: 'Walk-in', color: '#856404', bg: '#FEF3C7' },
  BOOKING: { label: 'Booking', color: '#1565C0', bg: '#DBEAFE' },
};
