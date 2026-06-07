/**
 * @responsibility
 * Controller for the Riwayat Kunjungan (History) module.
 * Owns all page-level state: period, search, filters, selection.
 * Coordinates use-visit-history and use-history-filters hooks.
 *
 * @usedBy
 * app/dashboard/bookings/page.tsx
 *
 * @notes
 * - page.tsx destructures this hook's output and passes to components.
 * - selectedVisitId is wired for Phase 4 detail panel — no panel renders yet.
 */

import { useCallback, useMemo, useState } from 'react';
import { useHistoryFilters } from '../hooks/history/use-history-filters';
import { useVisitDetail } from '../hooks/history/use-visit-detail';
import { useVisitHistory } from '../hooks/history/use-visit-history';
import type {
  HistoryFilters,
  HistoryPeriodPreset,
  HistoryStats,
  VisitRecord,
} from '../types/history.types';

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: HistoryFilters = {
  visitType: 'ALL',
  stylistId: 'ALL',
  paymentStatus: 'ALL',
};

// ── Stats computation (pure) ──────────────────────────────────────────────────

function computeStats(visits: VisitRecord[]): HistoryStats {
  const totalVisits = visits.length;
  const totalRevenue = visits
    .filter((v) => v.paymentStatus !== 'UNPAID')
    .reduce((sum, v) => sum + v.totalAmount, 0);
  const bookingCount = visits.filter((v) => v.visitType === 'BOOKING').length;
  const walkInCount = visits.filter((v) => v.visitType === 'WALK_IN').length;
  const avgTicket = totalVisits > 0 ? Math.round(totalRevenue / totalVisits) : 0;
  return { totalVisits, totalRevenue, bookingCount, walkInCount, avgTicket };
}

// ── Controller ────────────────────────────────────────────────────────────────

export function useHistoryController() {
  const [period, setPeriod] = useState<HistoryPeriodPreset>('THIS_MONTH');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  const { visits: rawVisits, stylistOptions, isLoading } = useVisitHistory();
  const visits = useHistoryFilters(rawVisits, period, searchQuery, filters);
  const stats = useMemo(() => computeStats(visits), [visits]);
  const { selectedVisit, proofZoom, openProofZoom, closeProofZoom } = useVisitDetail(
    rawVisits,
    selectedVisitId
  );

  const handleFilterChange = useCallback(
    <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const selectVisit = useCallback((id: string | null) => {
    setSelectedVisitId((prev) => (prev === id ? null : id));
  }, []);

  return {
    // Period
    period,
    setPeriod,
    // Search
    searchQuery,
    setSearchQuery,
    // Filters
    filters,
    handleFilterChange,
    handleResetFilters,
    // Data
    visits,
    stylistOptions,
    stats,
    isLoading,
    // Selection + detail panel
    selectedVisitId,
    selectVisit,
    selectedVisit,
    // Proof zoom
    proofZoom,
    openProofZoom,
    closeProofZoom,
  };
}
