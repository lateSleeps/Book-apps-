/**
 * @responsibility
 * Unified filter bar for Riwayat Kunjungan.
 * Contains: search, period, visit type, stylist, payment status.
 *
 * @usedBy
 * app/dashboard/bookings/page.tsx
 *
 * @notes
 * - Presentation only — no local state.
 * - All filter state owned by parent.
 * - Desktop: single row. Mobile: stacks vertically.
 */

'use client';

import { CaretDown, MagnifyingGlass } from '@phosphor-icons/react';
import type {
  HistoryFilters,
  HistoryPaymentFilter,
  HistoryPeriodPreset,
  HistoryStylistFilter,
  HistoryVisitTypeFilter,
} from '../../types/history.types';
import { PeriodSelector } from './PeriodSelector';

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
        className={`h-8 cursor-pointer appearance-none rounded-r10 border pl-s12 pr-s32 text-ts-fn transition-colors focus:outline-none ${
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
  searchQuery: string;
  onSearchChange: (q: string) => void;
  period: HistoryPeriodPreset;
  onPeriodChange: (p: HistoryPeriodPreset) => void;
  filters: HistoryFilters;
  stylistOptions: string[];
  onFilterChange: <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) => void;
  onResetFilters: () => void;
}

export function HistoryFilterBar({
  searchQuery,
  onSearchChange,
  period,
  onPeriodChange,
  filters,
  stylistOptions,
  onFilterChange,
  onResetFilters,
}: HistoryFilterBarProps) {
  const stylistSelectOptions: FilterOption<HistoryStylistFilter>[] = [
    { value: 'ALL', label: 'Semua Stylist' },
    ...stylistOptions.map((s) => ({ value: s, label: s })),
  ];
  const hasActiveFilters =
    filters.visitType !== 'ALL' ||
    filters.stylistId !== 'ALL' ||
    filters.paymentStatus !== 'ALL' ||
    searchQuery.trim().length > 0;

  return (
    <div className="flex flex-wrap items-center gap-s8">
      {/* Visit type */}
      <FilterSelect
        value={filters.visitType}
        options={VISIT_TYPE_OPTIONS}
        onChange={(v) => onFilterChange('visitType', v)}
      />

      {/* Stylist */}
      <FilterSelect
        value={filters.stylistId}
        options={stylistSelectOptions}
        onChange={(v) => onFilterChange('stylistId', v)}
      />

      {/* Payment */}
      <FilterSelect
        value={filters.paymentStatus}
        options={PAYMENT_OPTIONS}
        onChange={(v) => onFilterChange('paymentStatus', v)}
      />

      {/* Reset — visible only when a filter is active */}
      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          className="shrink-0 text-ts-fn text-tx-secondary underline underline-offset-2 transition-colors hover:text-tx-primary"
        >
          Reset
        </button>
      )}

      {/* Period + Search — rightmost pair */}
      <div className="ml-auto flex items-center gap-s8">
        <PeriodSelector value={period} onChange={onPeriodChange} />

        <div className="relative w-full md:w-[220px]">
          <MagnifyingGlass
            size={14}
            weight="duotone"
            className="pointer-events-none absolute left-s12 top-1/2 -translate-y-1/2 text-tx-secondary"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari pelanggan..."
            className="h-9 w-full rounded-r10 border border-bd-card bg-bg-input pl-s32 pr-s12 text-ts-fn text-tx-primary transition-colors placeholder:text-tx-muted hover:bg-bg-hover focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
