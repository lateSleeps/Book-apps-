/**
 * @responsibility
 * Desktop visit table for Riwayat Kunjungan.
 * Contains VisitTableHeader, VisitTableRow, and the table container.
 * Hidden on mobile — VisitMobileList renders instead.
 *
 * @usedBy
 * app/dashboard/bookings/page.tsx
 *
 * @notes
 * - Presentation only — selection state owned by controller.
 * - No inline expand — row click triggers side panel (Phase 4).
 * - Uses domain constants: PAYMENT_STATUS_META, VISITOR_TYPE_META.
 */

'use client';

import { PAYMENT_STATUS_META } from '../../constants/domain/payment-status';
import { VISITOR_TYPE_META } from '../../constants/domain/visitor-type';
import type { VisitRecord } from '../../types/history.types';
import { HistoryEmptyState } from './HistoryEmptyState';
import { avatarColor, getInitials } from '@/shared/lib/avatar';
import { formatRupiah } from '@/shared/lib/format';

// ── Grid ──────────────────────────────────────────────────────────────────────

const GRID = '1.2fr 2fr 2fr 1fr 1.5fr 1.2fr 1.2fr';
const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: GRID,
  columnGap: 16,
  alignItems: 'center',
} as const;

const COLUMN_HEADERS = ['Tanggal', 'Customer', 'Layanan', 'Tipe', 'Stylist', 'Total', 'Pembayaran'];

// ── Date formatter ────────────────────────────────────────────────────────────

function formatShortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Payment badge ─────────────────────────────────────────────────────────────

const PAYMENT_BADGE_CLASSES: Record<string, string> = {
  PAID: 'bg-py-paid-bg text-py-paid',
  DEPOSIT: 'bg-py-deposit-bg text-py-deposit',
  UNPAID: 'bg-py-unpaid-bg text-py-unpaid',
};

// ── Visitor type badge ────────────────────────────────────────────────────────

const VISIT_TYPE_BADGE_CLASSES: Record<string, string> = {
  BOOKING: 'bg-vt-booking-bg text-vt-booking-text',
  WALK_IN: 'bg-vt-walkin-bg text-vt-walkin-text',
};

// ── VisitTableHeader ──────────────────────────────────────────────────────────

export function VisitTableHeader() {
  return (
    <div style={GRID_STYLE} className="bg-bg-header px-s20 py-s8">
      {COLUMN_HEADERS.map((h, i) => (
        <span
          key={h}
          className={`relative text-ts-fn font-medium text-tx-secondary ${i > 0 ? 'before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:text-bd-card before:content-["|"]' : ''}`}
        >
          {h}
        </span>
      ))}
    </div>
  );
}

// ── VisitTableRow ─────────────────────────────────────────────────────────────

interface VisitTableRowProps {
  visit: VisitRecord;
  isSelected: boolean;
  onClick: () => void;
}

export function VisitTableRow({ visit: v, isSelected, onClick }: VisitTableRowProps) {
  const { bg, text: avatarText } = avatarColor(v.customerName);
  const pm = PAYMENT_STATUS_META[v.paymentStatus];
  const vm = VISITOR_TYPE_META[v.visitType];

  return (
    <div
      role="row"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={GRID_STYLE}
      className={`cursor-pointer border-b border-bd-row px-s20 py-s12 transition-colors hover:bg-bg-hover focus:outline-none focus-visible:bg-bg-hover ${
        isSelected ? 'bg-bg-surface' : ''
      }`}
    >
      {/* Tanggal */}
      <span className="text-ts-fn text-tx-subtle">{formatShortDate(v.date)}</span>

      {/* Customer */}
      <div className="flex min-w-0 items-center gap-s8">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-r10 text-ts-cap2 font-semibold"
          style={{ background: bg, color: avatarText }}
        >
          {getInitials(v.customerName)}
        </div>
        <span className="truncate text-ts-fn font-medium text-tx-primary">{v.customerName}</span>
      </div>

      {/* Layanan */}
      <span className="truncate text-ts-fn text-tx-subtle">{v.serviceName}</span>

      {/* Tipe */}
      <span
        className={`inline-flex items-center rounded-rF px-s8 py-1 text-ts-cap2 font-semibold ${VISIT_TYPE_BADGE_CLASSES[v.visitType]}`}
      >
        {vm.label}
      </span>

      {/* Stylist */}
      <span className="text-ts-fn text-tx-subtle">{v.stylistName}</span>

      {/* Total */}
      <span className="text-ts-fn font-semibold text-tx-primary">
        {formatRupiah(v.totalAmount)}
      </span>

      {/* Pembayaran */}
      <span
        className={`inline-flex items-center rounded-rF px-s8 py-1 text-ts-cap2 font-semibold ${PAYMENT_BADGE_CLASSES[v.paymentStatus]}`}
      >
        {pm.label}
      </span>
    </div>
  );
}

// ── VisitTable ────────────────────────────────────────────────────────────────

interface VisitTableProps {
  visits: VisitRecord[];
  selectedVisitId: string | null;
  hasActiveFilters: boolean;
  onRowClick: (id: string) => void;
}

export function VisitTable({
  visits,
  selectedVisitId,
  hasActiveFilters,
  onRowClick,
}: VisitTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-r16 border border-bd-card bg-bg-card shadow-card md:block">
      <VisitTableHeader />
      {visits.length === 0 ? (
        <HistoryEmptyState hasActiveFilters={hasActiveFilters} />
      ) : (
        <div role="rowgroup">
          {visits.map((v) => (
            <VisitTableRow
              key={v.id}
              visit={v}
              isSelected={selectedVisitId === v.id}
              onClick={() => onRowClick(v.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
