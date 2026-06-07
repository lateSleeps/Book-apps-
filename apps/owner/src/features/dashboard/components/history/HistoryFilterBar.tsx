/**
 * @responsibility
 * Secondary filter bar for Riwayat Kunjungan.
 * Contains: visit type filter, stylist filter, payment status filter.
 *
 * @usedBy
 * app/dashboard/bookings/page.tsx
 *
 * @notes
 * - Presentation only — no local state.
 * - All filter state owned by parent.
 * - Horizontally scrollable on mobile.
 * - Period filter lives in HistoryHeader (primary control).
 */

'use client';

import { CaretDown } from '@phosphor-icons/react';
import type {
  HistoryFilters,
  HistoryPaymentFilter,
  HistoryStylistFilter,
  HistoryVisitTypeFilter,
} from '../../types/history.types';

// ── Mock stylist list — replace with real data in Phase 3B ───────────────────

const MOCK_STYLISTS = ['Dewi', 'Rina', 'Sari', 'Budi'];

// ── Filter option types ───────────────────────────────────────────────────────

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

const VISIT_TYPE_OPTIONS: FilterOption<HistoryVisitTypeFilter>[] = [
  { value: 'ALL', label: 'Semua Tipe' },
  { value: 'BOOKING', label: 'Booking' },
  { value: 'WALK_IN', label: 'Walk-in' },
];

const PAYMENT_OPTIONS: FilterOption<HistoryPaymentFilter>[] = [
  { value: 'ALL', label: 'Semua Pembayaran' },
  { value: 'PAID', label: 'Lunas' },
  { value: 'DEPOSIT', label: 'DP' },
  { value: 'UNPAID', label: 'Belum Bayar' },
];

const STYLIST_OPTIONS: FilterOption<HistoryStylistFilter>[] = [
  { value: 'ALL', label: 'Semua Stylist' },
  ...MOCK_STYLISTS.map((s) => ({ value: s, label: s })),
];

// ── FilterSelect ──────────────────────────────────────────────────────────────

function FilterSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: FilterOption<T>[];
  onChange: (v: T) => void;
}) {
  const isActive = value !== options[0]?.value;

  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`h-9 cursor-pointer appearance-none rounded-r10 border pl-s12 pr-s32 text-ts-fn transition-colors focus:outline-none ${
          isActive
            ? 'border-ac-primary bg-bg-card font-semibold text-ac-primary'
            : 'border-bd-card bg-bg-input font-medium text-tx-subtle hover:bg-bg-hover'
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <CaretDown
        size={12}
        weight="duotone"
        className="pointer-events-none absolute right-s12 top-1/2 -translate-y-1/2 text-tx-secondary"
      />
    </div>
  );
}

// ── HistoryFilterBar ──────────────────────────────────────────────────────────

interface HistoryFilterBarProps {
  filters: HistoryFilters;
  onFilterChange: <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) => void;
  onResetFilters: () => void;
}

export function HistoryFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
}: HistoryFilterBarProps) {
  const hasActiveFilters =
    filters.visitType !== 'ALL' || filters.stylistId !== 'ALL' || filters.paymentStatus !== 'ALL';

  return (
    <div className="flex items-center gap-s8 overflow-x-auto scrollbar-hide">
      <FilterSelect
        value={filters.visitType}
        options={VISIT_TYPE_OPTIONS}
        onChange={(v) => onFilterChange('visitType', v)}
      />
      <FilterSelect
        value={filters.stylistId}
        options={STYLIST_OPTIONS}
        onChange={(v) => onFilterChange('stylistId', v)}
      />
      <FilterSelect
        value={filters.paymentStatus}
        options={PAYMENT_OPTIONS}
        onChange={(v) => onFilterChange('paymentStatus', v)}
      />

      {/* Reset button — only visible when a filter is active */}
      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          className="shrink-0 text-ts-fn text-tx-secondary underline underline-offset-2 transition-colors hover:text-tx-primary"
        >
          Reset
        </button>
      )}
    </div>
  );
}
