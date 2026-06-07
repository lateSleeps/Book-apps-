'use client';

import { X } from '@phosphor-icons/react';
import type { VisitRecord } from '../../types/history.types';
import { avatarColor, getInitials } from '@/shared/lib/avatar';

interface VisitDetailHeaderProps {
  visit: VisitRecord;
  onClose: () => void;
}

export function VisitDetailHeader({ visit, onClose }: VisitDetailHeaderProps) {
  const { bg, text: avatarText } = avatarColor(visit.customerName);
  const initials = getInitials(visit.customerName);

  return (
    <div className="flex items-start justify-between gap-s12 border-b border-bd-detail px-s20 py-s20">
      <div className="flex min-w-0 items-center gap-s16">
        {/* Avatar — 64px */}
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-r16 font-bold"
          style={{
            background: bg,
            color: avatarText,
            fontSize: initials.length > 1 ? '1.125rem' : '1.375rem',
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

      <button
        onClick={onClose}
        aria-label="Tutup detail"
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-r8 text-tx-secondary transition-colors hover:bg-bg-hover"
      >
        <X size={16} weight="duotone" />
      </button>
    </div>
  );
}
