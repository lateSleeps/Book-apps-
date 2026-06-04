/**
 * @responsibility
 * Displays a WhatsApp notification prompt after a booking is confirmed.
 * Lets the owner choose to send a WA message or skip.
 *
 * @usedBy
 * app/dashboard/overview/page.tsx (via controller)
 *
 * @notes
 * - Presentation only — no local state.
 * - waBookingData is set by use-booking-status after confirmation.
 */

'use client';

import { buildWAMessage } from '@/lib/wa-message';
import type { WaBookingData } from '@/lib/wa-message';

interface WANotificationDialogProps {
  waBookingData: WaBookingData;
  onDismiss: () => void;
}

export function WANotificationDialog({ waBookingData, onDismiss }: WANotificationDialogProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
      <div className="mx-4 flex max-w-sm flex-col gap-4 rounded-r20 bg-white p-6 shadow-dialog">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div>
            <p className="text-ts-fn font-semibold text-tx-primary">Booking dikonfirmasi!</p>
            <p className="text-ts-fn text-tx-secondary">
              Beritahu {waBookingData.customerName} via WhatsApp?
            </p>
          </div>
        </div>

        {/* Message preview */}
        <div className="rounded-r12 bg-green-50 p-3">
          <p className="mb-1 text-ts-cap2 font-semibold uppercase tracking-wider text-green-700">
            Preview pesan:
          </p>
          <p className="whitespace-pre-line text-ts-cap1 leading-relaxed text-green-800">
            {`Halo ${waBookingData.customerName}! 🌸\n\nBooking kamu di *Rara Beauty* telah *dikonfirmasi*! ✅\n\n📋 ${waBookingData.serviceName} · ${waBookingData.date} · ${waBookingData.timeSlot}\n\n⏰ Mohon datang 10 menit sebelum sesi. Toleransi max 15 menit.\n\n🔍 Cek booking: localhost:3002/check-booking`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <a
            href={buildWAMessage(waBookingData)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onDismiss}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-r10 text-ts-fn font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#25d366' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
            </svg>
            Kirim via WhatsApp
          </a>
          <button
            onClick={onDismiss}
            className="h-10 w-full rounded-r10 border border-bd-card text-ts-fn font-medium text-tx-secondary transition-colors hover:bg-bg-surface"
          >
            Lewati
          </button>
        </div>
      </div>
    </div>
  );
}
