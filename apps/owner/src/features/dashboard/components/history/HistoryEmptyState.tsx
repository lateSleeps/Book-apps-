/**
 * @responsibility
 * Empty state for VisitTable and VisitMobileList.
 * Shown when no visits match the current filters.
 *
 * @usedBy
 * VisitTable, VisitMobileList
 */

'use client';

import { ClipboardText } from '@phosphor-icons/react';

interface HistoryEmptyStateProps {
  hasActiveFilters: boolean;
}

export function HistoryEmptyState({ hasActiveFilters }: HistoryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-s12 py-s48">
      <ClipboardText size={48} weight="duotone" className="text-tx-muted" />
      <div className="text-center">
        <p className="text-ts-sub font-semibold text-tx-subtle">
          {hasActiveFilters ? 'Tidak ada hasil' : 'Belum ada kunjungan'}
        </p>
        <p className="mt-s4 text-ts-fn text-tx-muted">
          {hasActiveFilters
            ? 'Coba ubah filter atau rentang tanggal'
            : 'Kunjungan akan muncul di sini setelah ada transaksi'}
        </p>
      </div>
    </div>
  );
}
