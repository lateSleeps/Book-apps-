/**
 * @responsibility
 * Confirmation dialog for permanently deleting a booking.
 *
 * @usedBy overview/page.tsx via controller
 * @notes Presentation only. onConfirm triggers use-booking-status.submitDelete().
 */

'use client';

import { Trash } from '@phosphor-icons/react';
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

export function DeleteBookingDialog({ data, onConfirm, onCancel }: DeleteBookingDialogProps) {
  return (
    <BaseDialog zIndex="z-[60]" onBackdropClick={onCancel}>
      <DialogHeader
        icon={
          <DialogIcon variant="danger">
            <Trash size={16} weight="duotone" />
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
