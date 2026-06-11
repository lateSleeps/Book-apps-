/**
 * @responsibility
 * Manages payment processing state and proof upload for bookings.
 * Handles payment method selection, amount input, settlement proof,
 * the payment confirmation dialog, and proof image zoom.
 *
 * @usedBy
 * use-overview-controller.ts → PaymentSection, ConfirmPaymentDialog, ProofZoomDialog
 *
 * @notes
 * - Does NOT own bookingStatusMap or paymentStatusMap.
 *   Uses callbacks to notify use-booking-list of payment results.
 * - pelunasanProofMap holds local file + preview before upload.
 *   File is uploaded when processPayment is called.
 * - confirmDialog here is the PAYMENT confirmation dialog (amount + method),
 *   distinct from booking status confirm (confirm/tolak buttons).
 */

'use client';

import { useState, useCallback } from 'react';
import { uploadPaymentProof } from '../../services/booking.service';
import type { BookingStatus, PaymentStatus } from '../../types/dashboard.types';
import type {
  ConfirmPaymentDialogData,
  PaymentMethod,
  ProofZoomData,
} from '../../types/overview.types';
import { trpc } from '@/lib/trpc';

// ── Callback Interface ─────────────────────────────────────────────────────────

export interface BookingPaymentCallbacks {
  /** Called when payment is completed. Updates booking + payment status in list. */
  onStatusOverride: (bookingId: string, status: BookingStatus) => void;
  onPaymentOverride: (bookingId: string, status: PaymentStatus) => void;
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SettlementProof {
  file: File;
  preview: string;
}

export interface BookingPaymentState {
  // ── Payment inputs ─────────────────────────────────────────────────────────
  paymentAmountMap: Record<string, string>;
  setPaymentAmount: (bookingId: string, amount: string) => void;
  paymentMethodMap: Record<string, PaymentMethod>;
  setPaymentMethod: (bookingId: string, method: PaymentMethod) => void;

  // ── Settlement proof ───────────────────────────────────────────────────────
  pelunasanProofMap: Record<string, SettlementProof | null>;
  setSettlementProof: (bookingId: string, proof: SettlementProof | null) => void;
  uploadingProof: boolean;

  // ── Error ──────────────────────────────────────────────────────────────────
  paymentError: { bookingId: string; message: string } | null;
  clearPaymentError: (bookingId: string) => void;

  // ── Payment confirm dialog ─────────────────────────────────────────────────
  confirmDialog: ConfirmPaymentDialogData | null;
  openConfirmDialog: (data: ConfirmPaymentDialogData) => void;
  closeConfirmDialog: () => void;

  // ── Proof zoom dialog ──────────────────────────────────────────────────────
  proofZoom: ProofZoomData | null;
  openProofZoom: (data: ProofZoomData) => void;
  closeProofZoom: () => void;

  // ── Mutation status ────────────────────────────────────────────────────────
  isProcessingPayment: boolean;

  // ── Actions ────────────────────────────────────────────────────────────────
  processPayment: (bookingId: string) => Promise<void>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBookingPayment(callbacks: BookingPaymentCallbacks): BookingPaymentState {
  const utils = trpc.useUtils();
  const processPaymentMutation = trpc.bookings.processPayment.useMutation({
    onSuccess: (_data: unknown, variables: { bookingId: string }) => {
      callbacks.onPaymentOverride(variables.bookingId, 'PAID');
      callbacks.onStatusOverride(variables.bookingId, 'COMPLETED');
      utils.bookings.getBySalon.invalidate();
    },
  });

  // ── Payment inputs ──────────────────────────────────────────────────────────
  const [paymentAmountMap, setPaymentAmountMap] = useState<Record<string, string>>({});
  const [paymentMethodMap, setPaymentMethodMap] = useState<Record<string, PaymentMethod>>({});

  // ── Settlement proof ────────────────────────────────────────────────────────
  const [pelunasanProofMap, setPelunasanProofMap] = useState<
    Record<string, SettlementProof | null>
  >({});
  const [uploadingProof, setUploadingProof] = useState(false);

  // ── Error ───────────────────────────────────────────────────────────────────
  const [paymentError, setPaymentError] = useState<{
    bookingId: string;
    message: string;
  } | null>(null);

  // ── Dialogs ─────────────────────────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<ConfirmPaymentDialogData | null>(null);
  const [proofZoom, setProofZoom] = useState<ProofZoomData | null>(null);

  // ── Setters ─────────────────────────────────────────────────────────────────

  const setPaymentAmount = useCallback((bookingId: string, amount: string) => {
    setPaymentAmountMap((prev) => ({ ...prev, [bookingId]: amount }));
  }, []);

  const setPaymentMethod = useCallback((bookingId: string, method: PaymentMethod) => {
    setPaymentMethodMap((prev) => ({ ...prev, [bookingId]: method }));
  }, []);

  const setSettlementProof = useCallback((bookingId: string, proof: SettlementProof | null) => {
    setPelunasanProofMap((prev) => ({ ...prev, [bookingId]: proof }));
  }, []);

  const clearPaymentError = useCallback((bookingId: string) => {
    setPaymentError((prev) => (prev?.bookingId === bookingId ? null : prev));
  }, []);

  const openConfirmDialog = useCallback((data: ConfirmPaymentDialogData) => {
    setConfirmDialog(data);
  }, []);

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  const openProofZoom = useCallback((data: ProofZoomData) => {
    setProofZoom(data);
  }, []);

  const closeProofZoom = useCallback(() => {
    setProofZoom(null);
  }, []);

  // ── Process payment ─────────────────────────────────────────────────────────

  const processPayment = useCallback(
    async (bookingId: string) => {
      const method = paymentMethodMap[bookingId] ?? 'CASH';
      const amountRaw = paymentAmountMap[bookingId] ?? '0';
      const amountReceived = parseInt(amountRaw.replace(/\D/g, ''), 10) || 0;
      const proof = pelunasanProofMap[bookingId];

      let settlementProofUrl: string | undefined;

      // Upload settlement proof if provided
      if (proof?.file) {
        setUploadingProof(true);
        try {
          settlementProofUrl = await uploadPaymentProof(proof.file, bookingId);
        } catch (err) {
          setPaymentError({
            bookingId,
            message: err instanceof Error ? err.message : 'Upload bukti gagal',
          });
          setUploadingProof(false);
          return;
        }
        setUploadingProof(false);
      }

      if (!bookingId.startsWith('dummy-')) {
        await processPaymentMutation.mutateAsync({
          bookingId,
          // tRPC schema expects lowercase: 'cash' | 'transfer' | 'qris'
          paymentMethod: method.toLowerCase() as 'cash' | 'transfer' | 'qris',
          amountReceived,
          servicePrice: amountReceived,
          ...(settlementProofUrl ? { settlementProofUrl } : {}),
        });
      } else {
        // Optimistic update for dummy bookings
        callbacks.onPaymentOverride(bookingId, 'PAID');
        callbacks.onStatusOverride(bookingId, 'COMPLETED');
      }

      setConfirmDialog(null);
    },
    [paymentMethodMap, paymentAmountMap, pelunasanProofMap, processPaymentMutation, callbacks]
  );

  return {
    paymentAmountMap,
    setPaymentAmount,
    paymentMethodMap,
    setPaymentMethod,
    pelunasanProofMap,
    setSettlementProof,
    uploadingProof,
    paymentError,
    clearPaymentError,
    confirmDialog,
    openConfirmDialog,
    closeConfirmDialog,
    proofZoom,
    openProofZoom,
    closeProofZoom,
    isProcessingPayment: processPaymentMutation.isPending || uploadingProof,
    processPayment,
  };
}
