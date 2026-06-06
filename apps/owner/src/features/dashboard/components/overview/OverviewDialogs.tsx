'use client';

import {
  ConfirmBookingDialog,
  DeclineBookingDialog,
  DeleteBookingDialog,
  ProofZoomDialog,
  WANotificationDialog,
} from './dialogs';
import type { OverviewController } from '@/features/dashboard/controller/use-overview-controller';

interface OverviewDialogsProps {
  payment: OverviewController['payment'];
  status: OverviewController['status'];
}

export function OverviewDialogs({ payment, status }: OverviewDialogsProps) {
  return (
    <>
      {payment.confirmDialog && (
        <ConfirmBookingDialog
          data={payment.confirmDialog}
          settlementProof={payment.pelunasanProofMap[payment.confirmDialog.bookingId]}
          isLoading={payment.isProcessingPayment}
          onSetProof={(proof) =>
            payment.setSettlementProof(payment.confirmDialog!.bookingId, proof)
          }
          onConfirm={() => payment.processPayment(payment.confirmDialog!.bookingId)}
          onCancel={payment.closeConfirmDialog}
        />
      )}

      {status.declineDialog && (
        <DeclineBookingDialog
          data={status.declineDialog}
          onReasonChange={status.setDeclineReason}
          onSubmit={status.submitDecline}
          onCancel={status.closeDeclineDialog}
          isLoading={status.isDeclining}
        />
      )}

      {status.deleteConfirm && (
        <DeleteBookingDialog
          data={status.deleteConfirm}
          onConfirm={() => {
            void status.submitDelete();
          }}
          onCancel={status.closeDeleteDialog}
        />
      )}

      {payment.proofZoom && (
        <ProofZoomDialog
          url={payment.proofZoom.url}
          label={payment.proofZoom.label}
          onClose={payment.closeProofZoom}
        />
      )}

      {status.showWANotif && status.waBookingData && (
        <WANotificationDialog
          waBookingData={status.waBookingData}
          onDismiss={status.dismissWANotif}
        />
      )}
    </>
  );
}
