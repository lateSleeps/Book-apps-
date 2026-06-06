/**
 * @responsibility
 * WhatsApp notification prompt after a booking is confirmed.
 * Lets the owner send a WA message or skip.
 *
 * @usedBy overview/page.tsx via controller
 * @notes Presentation only. waBookingData is set by use-booking-status after confirmation.
 */

'use client';

import { Check } from '@phosphor-icons/react';
import { buildWAMessage } from '@/lib/wa-message';
import type { WaBookingData } from '@/lib/wa-message';
import {
  BaseDialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogIcon,
  DialogSecondaryButton,
  DialogWAButton,
} from '@/shared/components/ui/dialog';

interface WANotificationDialogProps {
  waBookingData: WaBookingData;
  onDismiss: () => void;
}

function WAIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}

export function WANotificationDialog({ waBookingData, onDismiss }: WANotificationDialogProps) {
  return (
    <BaseDialog zIndex="z-[100]" onBackdropClick={onDismiss}>
      <DialogHeader
        icon={
          <DialogIcon variant="success">
            <Check size={16} weight="duotone" />
          </DialogIcon>
        }
        title="Booking dikonfirmasi!"
        description={`Beritahu ${waBookingData.customerName} via WhatsApp?`}
        onClose={onDismiss}
      />

      <DialogContent>
        {/* Message preview */}
        <div
          style={{
            borderRadius: 10,
            background: '#f0fdf4',
            padding: '12px 14px',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#16a34a',
              margin: '0 0 6px 0',
            }}
          >
            Preview pesan:
          </p>
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.6,
              color: '#16a34a',
              whiteSpace: 'pre-line',
              margin: 0,
            }}
          >
            {`Halo ${waBookingData.customerName}! 🌸\n\nBooking kamu di *Rara Beauty* telah *dikonfirmasi*! ✅\n\n📋 ${waBookingData.serviceName} · ${waBookingData.date} · ${waBookingData.timeSlot}\n\n⏰ Mohon datang 10 menit sebelum sesi. Toleransi max 15 menit.`}
          </p>
        </div>
      </DialogContent>

      <DialogFooter layout="vertical">
        <DialogWAButton href={buildWAMessage(waBookingData)} onClick={onDismiss} fullWidth>
          <WAIcon />
          Kirim via WhatsApp
        </DialogWAButton>
        <DialogSecondaryButton onClick={onDismiss} fullWidth>
          Lewati
        </DialogSecondaryButton>
      </DialogFooter>
    </BaseDialog>
  );
}
