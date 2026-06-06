/**
 * @responsibility
 * Manages booking status transitions: confirm, decline, delete.
 * Owns dialog state, loading state, WA notification, and the
 * updateStatus tRPC mutation.
 *
 * @usedBy
 * use-overview-controller.ts
 *
 * @notes
 * - Does NOT own bookingStatusMap — that lives in use-booking-list.
 *   Uses callbacks to notify the list of status changes.
 * - confirmingId drives skeleton loading on Konfirmasi/Tolak buttons.
 * - WA notification is shown after successful confirmation.
 * - waBookingData is cleared when notification is dismissed.
 */

'use client';

import { useState, useCallback } from 'react';
import type { BookingStatus } from '../../types/dashboard.types';
import type { DeclineDialogData, DeleteDialogData } from '../../types/overview.types';
import { trpc } from '@/lib/trpc';
import type { WaBookingData } from '@/lib/wa-message';

// ── Callback Interface ─────────────────────────────────────────────────────────

export interface BookingStatusCallbacks {
  /** Called after confirm/decline succeeds. Updates the list display. */
  onStatusOverride: (bookingId: string, status: BookingStatus) => void;
  /** Called after delete succeeds. Removes booking from the list. */
  onDelete: (bookingId: string) => void;
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BookingStatusState {
  // ── Loading / skeleton ─────────────────────────────────────────────────────
  /** Booking being confirmed (drives skeleton on buttons) */
  confirmingId: string | null;
  /** Booking being deleted (drives skeleton on row) */
  loadingBookingId: string | null;

  // ── Dialogs ────────────────────────────────────────────────────────────────
  declineDialog: DeclineDialogData | null;
  openDeclineDialog: (data: Omit<DeclineDialogData, 'reason'>) => void;
  setDeclineReason: (reason: string) => void;
  closeDeclineDialog: () => void;

  deleteConfirm: DeleteDialogData | null;
  openDeleteDialog: (data: DeleteDialogData) => void;
  closeDeleteDialog: () => void;

  // ── WA Notification ────────────────────────────────────────────────────────
  showWANotif: boolean;
  waBookingData: WaBookingData | null;
  dismissWANotif: () => void;

  // ── Mutation status ────────────────────────────────────────────────────────
  isConfirming: boolean;
  isDeclining: boolean;
  isDeleting: boolean;

  // ── Actions ────────────────────────────────────────────────────────────────
  confirmBooking: (bookingId: string, waData: WaBookingData) => Promise<void>;
  submitDecline: () => Promise<void>;
  submitDelete: () => Promise<void>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBookingStatus(callbacks: BookingStatusCallbacks): BookingStatusState {
  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => utils.bookings.getBySalon.invalidate(),
  });

  // ── Local state ─────────────────────────────────────────────────────────────
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [loadingBookingId, setLoadingBookingId] = useState<string | null>(null);
  const [declineDialog, setDeclineDialog] = useState<DeclineDialogData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteDialogData | null>(null);
  const [showWANotif, setShowWANotif] = useState(false);
  const [waBookingData, setWaBookingData] = useState<WaBookingData | null>(null);

  // ── Decline dialog ──────────────────────────────────────────────────────────

  const openDeclineDialog = useCallback((data: Omit<DeclineDialogData, 'reason'>) => {
    setDeclineDialog({ ...data, reason: '' });
  }, []);

  const setDeclineReason = useCallback((reason: string) => {
    setDeclineDialog((prev) => (prev ? { ...prev, reason } : null));
  }, []);

  const closeDeclineDialog = useCallback(() => {
    setDeclineDialog(null);
  }, []);

  // ── Delete dialog ───────────────────────────────────────────────────────────

  const openDeleteDialog = useCallback((data: DeleteDialogData) => {
    setDeleteConfirm(data);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  // ── WA notification ─────────────────────────────────────────────────────────

  const dismissWANotif = useCallback(() => {
    setShowWANotif(false);
    setWaBookingData(null);
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const confirmBooking = useCallback(
    async (bookingId: string, waData: WaBookingData) => {
      setConfirmingId(bookingId);
      callbacks.onStatusOverride(bookingId, 'CONFIRMED');

      if (!bookingId.startsWith('dummy-')) {
        await updateStatusMutation.mutateAsync({ bookingId, status: 'CONFIRMED' });
      }

      setConfirmingId(null);
      setWaBookingData(waData);
      setShowWANotif(true);
    },
    [callbacks, updateStatusMutation]
  );

  const submitDecline = useCallback(async () => {
    if (!declineDialog) return;
    const { bookingId } = declineDialog;

    callbacks.onStatusOverride(bookingId, 'CANCELLED');

    if (!bookingId.startsWith('dummy-')) {
      await updateStatusMutation.mutateAsync({ bookingId, status: 'CANCELLED' });
    }

    setDeclineDialog(null);
  }, [declineDialog, callbacks, updateStatusMutation]);

  const submitDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    const { bookingId } = deleteConfirm;

    setLoadingBookingId(bookingId);
    setDeleteConfirm(null);

    // Small delay to let skeleton render before removing
    await new Promise((r) => setTimeout(r, 300));

    callbacks.onDelete(bookingId);
    setLoadingBookingId(null);
  }, [deleteConfirm, callbacks]);

  return {
    confirmingId,
    loadingBookingId,
    declineDialog,
    openDeclineDialog,
    setDeclineReason,
    closeDeclineDialog,
    deleteConfirm,
    openDeleteDialog,
    closeDeleteDialog,
    showWANotif,
    waBookingData,
    dismissWANotif,
    isConfirming: updateStatusMutation.isPending && !!confirmingId,
    isDeclining: updateStatusMutation.isPending && !!declineDialog,
    isDeleting: !!loadingBookingId,
    confirmBooking,
    submitDecline,
    submitDelete,
  };
}
