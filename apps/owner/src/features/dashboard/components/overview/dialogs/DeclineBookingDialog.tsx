/**
 * @responsibility
 * Dialog for declining/rejecting a booking.
 * Requires the owner to provide a reason before submitting.
 * Optionally notifies customer via WhatsApp.
 *
 * @usedBy
 * app/dashboard/overview/page.tsx (via controller)
 *
 * @notes
 * - Presentation only — no local state.
 * - reason is controlled from use-booking-status.declineDialog.
 */

'use client';

import type { DeclineDialogData } from '../../../types/overview.types';
import { formatRupiah } from '@/shared/lib/format';

interface DeclineBookingDialogProps {
  data: DeclineDialogData;
  onReasonChange: (reason: string) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeclineBookingDialog({
  data,
  onReasonChange,
  onSubmit,
  onCancel,
  isLoading,
}: DeclineBookingDialogProps) {
  const waPhone = data.customerPhone.replace(/^0/, '62').replace(/\D/g, '');
  const waMsg = encodeURIComponent(
    `Halo ${data.customerName}, kami dari Rara Beauty mohon maaf atas ketidaknyamanannya. Dengan berat hati kami harus menginformasikan bahwa booking Anda tidak dapat kami konfirmasi saat ini. Kami memohon maaf yang sebesar-besarnya dan berharap dapat melayani Anda di lain waktu. 🙏`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />

      {/* Card */}
      <div className="relative flex w-full max-w-[22rem] flex-col gap-4 rounded-r20 bg-white p-5 shadow-dialog">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-ts-cap2 font-semibold uppercase tracking-[0.05em] text-tx-secondary">
              Tolak Booking
            </p>
            <p className="mt-0.5 text-ts-head font-bold text-tx-primary">{data.customerName}</p>
          </div>
          <button
            onClick={onCancel}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-bg-control"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              stroke="#8E8E93"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
            </svg>
          </button>
        </div>

        {/* Reason */}
        <div className="flex flex-col gap-1.5">
          <label className="text-ts-cap2 font-semibold uppercase tracking-[0.05em] text-tx-secondary">
            Alasan Penolakan
          </label>
          <textarea
            autoFocus
            value={data.reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Tulis alasan penolakan..."
            rows={3}
            className="resize-none rounded-r10 border border-bd-card px-3 py-2.5 text-ts-fn text-tx-primary outline-none placeholder:text-tx-muted focus:border-tx-subtle"
            style={{ fontFamily: 'inherit' }}
          />
        </div>

        {/* WA link */}
        <a
          href={`https://wa.me/${waPhone}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-ts-fn text-tx-secondary underline-offset-2 hover:underline"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#25d366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
          </svg>
          Beritahu customer via WA (opsional)
        </a>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="h-10 flex-1 rounded-r10 border border-bd-card text-ts-fn font-medium text-tx-subtle transition-colors hover:bg-bg-surface"
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            disabled={!data.reason.trim() || isLoading}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-r10 text-ts-fn font-semibold transition-all disabled:cursor-not-allowed"
            style={{
              background: data.reason.trim() ? '#ef4444' : '#F2F2F7',
              color: data.reason.trim() ? 'white' : '#C7C7CC',
            }}
          >
            {isLoading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg
                width="11"
                height="11"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            )}
            Ya, Tolak
          </button>
        </div>
      </div>
    </div>
  );
}

// Needed for format
void formatRupiah;
