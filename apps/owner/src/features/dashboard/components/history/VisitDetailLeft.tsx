'use client';

import { VISITOR_TYPE_META } from '../../constants/domain/visitor-type';
import type { VisitRecord } from '../../types/history.types';
import { avatarColor, getInitials } from '@/shared/lib/avatar';
import { formatDate } from '@/shared/lib/format';

const VISIT_TYPE_BADGE: Record<string, string> = {
  BOOKING: 'bg-vt-booking-bg text-vt-booking-text',
  WALK_IN: 'bg-vt-walkin-bg text-vt-walkin-text',
};

interface Props {
  visit: VisitRecord;
}

export function VisitDetailLeft({ visit }: Props) {
  const { bg, text: avatarText } = avatarColor(visit.customerName);
  const initials = getInitials(visit.customerName);
  const vm = VISITOR_TYPE_META[visit.visitType];

  return (
    <div className="flex h-full flex-col px-s20 py-s20">
      {/* Section label */}
      <p className="mb-s20 text-ts-cap2 font-semibold uppercase tracking-[0.06em] text-tx-muted">
        Detail Kunjungan
      </p>

      {/* Avatar + identity */}
      <div className="mb-s24 flex items-center gap-s12">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-r16 font-bold"
          style={{
            background: bg,
            color: avatarText,
            fontSize: initials.length > 1 ? '1.0625rem' : '1.25rem',
          }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-ts-t2 font-bold text-tx-primary">{visit.customerName}</h2>
          {visit.customerPhone && (
            <p className="mt-0.5 text-ts-fn text-tx-secondary">{visit.customerPhone}</p>
          )}
          <p className="mt-0.5 text-ts-cap2 text-tx-muted">{visit.bookingCode}</p>
        </div>
      </div>

      {/* Visit facts */}
      <dl className="flex flex-col gap-s12">
        <div className="flex items-start justify-between gap-s8">
          <dt className="shrink-0 text-ts-fn text-tx-secondary">Tanggal</dt>
          <dd className="text-right text-ts-fn font-medium text-tx-primary">
            {formatDate(visit.date)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-s8">
          <dt className="text-ts-fn text-tx-secondary">Stylist</dt>
          <dd className="text-ts-fn font-medium text-tx-primary">{visit.stylistName}</dd>
        </div>

        <div className="flex items-center justify-between gap-s8">
          <dt className="text-ts-fn text-tx-secondary">Tipe</dt>
          <dd>
            <span
              className={`inline-flex items-center rounded-rF px-s8 py-1 text-ts-cap2 font-semibold ${VISIT_TYPE_BADGE[visit.visitType]}`}
            >
              {vm.label}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
