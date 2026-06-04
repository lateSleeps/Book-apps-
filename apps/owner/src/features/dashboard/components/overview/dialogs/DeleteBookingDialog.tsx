/**
 * @responsibility
 * Confirmation dialog for permanently deleting a booking.
 * Shows customer name and requires explicit confirmation before deletion.
 *
 * @usedBy
 * app/dashboard/overview/page.tsx (via controller)
 *
 * @notes
 * - Presentation only — no local state.
 * - onConfirm triggers use-booking-status.submitDelete().
 */

'use client';

import type { DeleteDialogData } from '../../../types/overview.types';

interface DeleteBookingDialogProps {
  data: DeleteDialogData;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteBookingDialog({ data, onConfirm, onCancel }: DeleteBookingDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />

      {/* Card */}
      <div className="relative mx-4 flex w-full max-w-xs flex-col gap-4 rounded-r20 bg-white p-5 shadow-dialog">
        {/* Icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </div>

        {/* Text */}
        <div>
          <p className="text-ts-fn font-semibold text-tx-primary">Hapus booking?</p>
          <p className="mt-1 text-ts-fn text-tx-secondary">
            Booking <span className="font-medium text-tx-primary">{data.customerName}</span> akan
            dihapus secara permanen.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="h-10 flex-1 rounded-r10 border border-bd-card text-ts-fn font-medium text-tx-secondary transition-colors hover:bg-bg-surface"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="h-10 flex-1 rounded-r10 bg-red-500 text-ts-fn font-semibold text-white transition-colors hover:bg-red-600"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
