'use client';

import type { VisitRecord } from '../../types/history.types';
import { formatDuration } from '@/shared/lib/format';

interface TreatmentSectionProps {
  visit: VisitRecord;
  hideNotes?: boolean;
}

export function TreatmentSection({ visit, hideNotes }: TreatmentSectionProps) {
  return (
    <section className="border-b border-bd-detail px-s20 py-s16">
      <p className="mb-s12 text-ts-cap2 font-semibold uppercase tracking-[0.06em] text-tx-secondary">
        Treatment
      </p>

      <dl className="flex flex-col gap-s8">
        {/* Service */}
        <div className="flex items-start justify-between gap-s8">
          <dt className="shrink-0 text-ts-fn text-tx-secondary">Layanan</dt>
          <dd className="text-right text-ts-fn font-medium text-tx-primary">{visit.serviceName}</dd>
        </div>

        {/* Duration — only if present */}
        {visit.duration != null && (
          <div className="flex items-center justify-between gap-s8">
            <dt className="text-ts-fn text-tx-secondary">Durasi</dt>
            <dd className="text-ts-fn font-medium text-tx-primary">
              {formatDuration(visit.duration)}
            </dd>
          </div>
        )}
      </dl>

      {/* Notes — hidden when ConsultationSection renders the same data */}
      {!hideNotes && visit.notes && (
        <p className="mt-s12 rounded-r10 bg-bg-surface px-s12 py-s8 text-ts-fn italic text-tx-subtle">
          {visit.notes}
        </p>
      )}
    </section>
  );
}
