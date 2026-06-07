'use client';

import { VISITOR_TYPE_META } from '../../constants/domain/visitor-type';
import type { VisitRecord } from '../../types/history.types';
import { formatDate } from '@/shared/lib/format';

interface VisitInformationSectionProps {
  visit: VisitRecord;
}

const VISIT_TYPE_BADGE_CLASSES: Record<string, string> = {
  BOOKING: 'bg-vt-booking-bg text-vt-booking-text',
  WALK_IN: 'bg-vt-walkin-bg text-vt-walkin-text',
};

export function VisitInformationSection({ visit }: VisitInformationSectionProps) {
  const vm = VISITOR_TYPE_META[visit.visitType];

  return (
    <section className="border-b border-bd-detail px-s20 py-s16">
      <p className="mb-s12 text-ts-cap2 font-semibold uppercase tracking-[0.06em] text-tx-secondary">
        Informasi Kunjungan
      </p>

      <dl className="flex flex-col gap-s8">
        {/* Date */}
        <div className="flex items-start justify-between gap-s8">
          <dt className="shrink-0 text-ts-fn text-tx-secondary">Tanggal</dt>
          <dd className="text-right text-ts-fn font-medium text-tx-primary">
            {formatDate(visit.date)}
          </dd>
        </div>

        {/* Stylist */}
        <div className="flex items-center justify-between gap-s8">
          <dt className="text-ts-fn text-tx-secondary">Stylist</dt>
          <dd className="text-ts-fn font-medium text-tx-primary">{visit.stylistName}</dd>
        </div>

        {/* Visit type */}
        <div className="flex items-center justify-between gap-s8">
          <dt className="text-ts-fn text-tx-secondary">Tipe</dt>
          <dd>
            <span
              className={`inline-flex items-center rounded-rF px-s8 py-1 text-ts-cap2 font-semibold ${VISIT_TYPE_BADGE_CLASSES[visit.visitType]}`}
            >
              {vm.label}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
