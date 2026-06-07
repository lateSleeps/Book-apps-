/**
 * @responsibility
 * Mobile visit card list for Riwayat Kunjungan.
 * Renders on mobile (md:hidden). Desktop uses VisitTable instead.
 *
 * @usedBy
 * app/dashboard/bookings/page.tsx
 *
 * @notes
 * - Presentation only — selection state owned by controller.
 * - Card tap toggles selection (for Phase 4 detail panel).
 * - Uses domain constants: PAYMENT_STATUS_META, VISITOR_TYPE_META.
 */

'use client';

import { PAYMENT_STATUS_META } from '../../constants/domain/payment-status';
import { VISITOR_TYPE_META } from '../../constants/domain/visitor-type';
import type { VisitRecord } from '../../types/history.types';
import { HistoryEmptyState } from './HistoryEmptyState';
import { avatarColor, getInitials } from '@/shared/lib/avatar';
import { formatRupiah } from '@/shared/lib/format';

// ── Date formatter ────────────────────────────────────────────────────────────

function formatShortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Badge classes ─────────────────────────────────────────────────────────────

const PAYMENT_BADGE_CLASSES: Record<string, string> = {
  PAID: 'bg-py-paid-bg text-py-paid',
  DEPOSIT: 'bg-py-deposit-bg text-py-deposit',
  UNPAID: 'bg-py-unpaid-bg text-py-unpaid',
};

const VISIT_TYPE_BADGE_CLASSES: Record<string, string> = {
  BOOKING: 'bg-vt-booking-bg text-vt-booking-text',
  WALK_IN: 'bg-vt-walkin-bg text-vt-walkin-text',
};

// ── VisitMobileCard ───────────────────────────────────────────────────────────

interface VisitMobileCardProps {
  visit: VisitRecord;
  isSelected: boolean;
  onClick: () => void;
}

export function VisitMobileCard({ visit: v, isSelected, onClick }: VisitMobileCardProps) {
  const { bg, text: avatarText } = avatarColor(v.customerName);
  const pm = PAYMENT_STATUS_META[v.paymentStatus];
  const vm = VISITOR_TYPE_META[v.visitType];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`cursor-pointer rounded-r16 border border-bd-card bg-bg-card shadow-card transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ac-primary ${
        isSelected ? 'border-ac-primary bg-bg-surface' : 'hover:bg-bg-hover'
      }`}
    >
      {/* Top row: avatar + name + date */}
      <div className="flex items-center gap-s12 px-s16 pt-s16">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-r10 text-ts-sub font-semibold"
          style={{ background: bg, color: avatarText }}
        >
          {getInitials(v.customerName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-ts-fn font-semibold text-tx-primary">{v.customerName}</p>
          <p className="text-ts-cap2 text-tx-muted">{formatShortDate(v.date)}</p>
        </div>
        {/* Total — top-right */}
        <span className="shrink-0 text-ts-fn font-bold text-tx-primary">
          {formatRupiah(v.totalAmount)}
        </span>
      </div>

      {/* Middle row: service + stylist */}
      <div className="mt-s8 px-s16">
        <p className="truncate text-ts-fn text-tx-subtle">{v.serviceName}</p>
        <p className="text-ts-cap2 text-tx-muted">{v.stylistName}</p>
      </div>

      {/* Bottom row: badges */}
      <div className="flex items-center gap-s8 px-s16 pb-s16 pt-s12">
        <span
          className={`inline-flex items-center rounded-rF px-s8 py-1 text-ts-cap2 font-semibold ${VISIT_TYPE_BADGE_CLASSES[v.visitType]}`}
        >
          {vm.label}
        </span>
        <span
          className={`inline-flex items-center rounded-rF px-s8 py-1 text-ts-cap2 font-semibold ${PAYMENT_BADGE_CLASSES[v.paymentStatus]}`}
        >
          {pm.label}
        </span>
        <span className="ml-auto text-ts-cap2 text-tx-muted">{v.bookingCode}</span>
      </div>
    </div>
  );
}

// ── VisitMobileList ───────────────────────────────────────────────────────────

interface VisitMobileListProps {
  visits: VisitRecord[];
  selectedVisitId: string | null;
  hasActiveFilters: boolean;
  onCardClick: (id: string) => void;
}

export function VisitMobileList({
  visits,
  selectedVisitId,
  hasActiveFilters,
  onCardClick,
}: VisitMobileListProps) {
  if (visits.length === 0) {
    return (
      <div className="md:hidden">
        <HistoryEmptyState hasActiveFilters={hasActiveFilters} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-s12 md:hidden">
      {visits.map((v) => (
        <VisitMobileCard
          key={v.id}
          visit={v}
          isSelected={selectedVisitId === v.id}
          onClick={() => onCardClick(v.id)}
        />
      ))}
    </div>
  );
}
