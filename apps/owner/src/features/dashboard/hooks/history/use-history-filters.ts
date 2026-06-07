/**
 * @responsibility
 * Filters and sorts visit records based on period, search, and filter state.
 * Pure computation wrapped in useMemo — no side effects.
 *
 * @usedBy
 * use-history-controller
 */

import { useMemo } from 'react';
import type { HistoryFilters, HistoryPeriodPreset, VisitRecord } from '../../types/history.types';

// ── Period range ──────────────────────────────────────────────────────────────

function getPeriodRange(preset: HistoryPeriodPreset): { from: Date; to: Date } {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  switch (preset) {
    case 'THIS_MONTH': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to };
    }
    case '3_MONTHS': {
      const from = new Date(now);
      from.setMonth(from.getMonth() - 3);
      return { from, to };
    }
    case '6_MONTHS': {
      const from = new Date(now);
      from.setMonth(from.getMonth() - 6);
      return { from, to };
    }
    case '12_MONTHS': {
      const from = new Date(now);
      from.setFullYear(from.getFullYear() - 1);
      return { from, to };
    }
    case 'CUSTOM':
    default:
      return { from: new Date(0), to };
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useHistoryFilters(
  visits: VisitRecord[],
  period: HistoryPeriodPreset,
  searchQuery: string,
  filters: HistoryFilters
): VisitRecord[] {
  return useMemo(() => {
    const { from, to } = getPeriodRange(period);
    const q = searchQuery.trim().toLowerCase();

    return visits
      .filter((v) => {
        // Period
        const d = new Date(v.date + 'T00:00:00');
        if (d < from || d > to) return false;

        // Search
        if (q) {
          const hit =
            v.customerName.toLowerCase().includes(q) ||
            v.serviceName.toLowerCase().includes(q) ||
            v.bookingCode.toLowerCase().includes(q);
          if (!hit) return false;
        }

        // Visit type
        if (filters.visitType !== 'ALL' && v.visitType !== filters.visitType) return false;

        // Stylist
        if (filters.stylistId !== 'ALL' && v.stylistName !== filters.stylistId) return false;

        // Payment status
        if (filters.paymentStatus !== 'ALL' && v.paymentStatus !== filters.paymentStatus)
          return false;

        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // DESC by date
  }, [visits, period, searchQuery, filters]);
}
