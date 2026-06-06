/**
 * @responsibility
 * Dialog for declining/rejecting a booking.
 * Requires the owner to provide a reason. Optionally notifies customer via WhatsApp.
 *
 * @usedBy overview/page.tsx via controller
 * @notes Presentation only. reason is controlled from use-booking-status.declineDialog.
 */

'use client';

import { X } from '@phosphor-icons/react';
import type { DeclineDialogData } from '../../../types/overview.types';
import {
  BaseDialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogIcon,
  DialogPrimaryButton,
  DialogSecondaryButton,
  DialogWAButton,
} from '@/shared/components/ui/dialog';

interface DeclineBookingDialogProps {
  data: DeclineDialogData;
  onReasonChange: (reason: string) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function WAIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}

// Input style matching WalkInNamePhoneFields source of truth
const fieldStyle: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid #E5E5EA',
  background: '#F9F9FB',
  padding: '10px 14px',
  fontSize: 14,
  color: '#1C1C1E',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
  resize: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#8E8E93',
};

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
    <BaseDialog zIndex="z-50" onBackdropClick={onCancel}>
      <DialogHeader
        icon={
          <DialogIcon variant="danger">
            <X size={14} weight="duotone" />
          </DialogIcon>
        }
        eyebrow="Tolak Booking"
        title={data.customerName}
        onClose={onCancel}
      />

      <DialogContent>
        {/* Reason field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Alasan Penolakan</label>
          <textarea
            autoFocus
            value={data.reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Tulis alasan penolakan..."
            rows={3}
            style={fieldStyle}
          />
        </div>

        {/* WA shortcut — in content area, not footer */}
        <DialogWAButton href={`https://wa.me/${waPhone}?text=${waMsg}`} fullWidth>
          <WAIcon />
          Beritahu customer via WA (opsional)
        </DialogWAButton>
      </DialogContent>

      <DialogFooter>
        <DialogSecondaryButton onClick={onCancel}>Batal</DialogSecondaryButton>
        <DialogPrimaryButton
          variant="danger"
          onClick={onSubmit}
          disabled={!data.reason.trim()}
          isLoading={isLoading}
        >
          Ya, Tolak
        </DialogPrimaryButton>
      </DialogFooter>
    </BaseDialog>
  );
}
