/**
 * @responsibility
 * Confirmation dialog for permanently deleting a booking.
 *
 * @usedBy overview/page.tsx via controller
 * @notes Presentation only. onConfirm triggers use-booking-status.submitDelete().
 */

'use client';

import type { DeleteDialogData } from '../../../types/overview.types';
import {
  BaseDialog,
  DialogHeader,
  DialogFooter,
  DialogIcon,
  DialogPrimaryButton,
  DialogSecondaryButton,
} from '@/shared/components/ui/dialog';

interface DeleteBookingDialogProps {
  data: DeleteDialogData;
  onConfirm: () => void;
  onCancel: () => void;
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

export function DeleteBookingDialog({ data, onConfirm, onCancel }: DeleteBookingDialogProps) {
  return (
    <BaseDialog zIndex="z-[60]" onBackdropClick={onCancel}>
      <DialogHeader
        icon={
          <DialogIcon variant="danger">
            <TrashIcon />
          </DialogIcon>
        }
        title="Hapus booking?"
        description={`Booking ${data.customerName} akan dihapus secara permanen.`}
        onClose={onCancel}
      />

      <DialogFooter>
        <DialogSecondaryButton onClick={onCancel}>Batal</DialogSecondaryButton>
        <DialogPrimaryButton variant="danger" onClick={onConfirm}>
          Ya, Hapus
        </DialogPrimaryButton>
      </DialogFooter>
    </BaseDialog>
  );
}
