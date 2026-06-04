/**
 * @responsibility
 * Payment confirmation dialog shown before finalizing a booking payment.
 * Displays amount summary, method, kembalian (change), and proof upload for
 * non-cash methods.
 *
 * @usedBy
 * app/dashboard/overview/page.tsx (via controller)
 *
 * @notes
 * - Presentation only — no local state.
 * - Proof upload state lives in use-booking-payment (pelunasanProofMap).
 * - onConfirm triggers use-booking-payment.processPayment().
 */

'use client';

import type { SettlementProof } from '../../../hooks/overview/use-booking-payment';
import type { ConfirmPaymentDialogData } from '../../../types/overview.types';
import { formatRupiah } from '@/shared/lib/format';

interface ConfirmBookingDialogProps {
  data: ConfirmPaymentDialogData;
  settlementProof?: SettlementProof | null;
  isLoading: boolean;
  onSetProof: (proof: SettlementProof | null) => void;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function ConfirmBookingDialog({
  data,
  settlementProof,
  isLoading,
  onSetProof,
  onConfirm,
  onCancel,
}: ConfirmBookingDialogProps) {
  const kembalian = data.method === 'CASH' ? data.amount - data.finalTotal : null;
  const isCash = data.method === 'CASH';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />

      {/* Card */}
      <div className="relative flex w-full max-w-[22rem] flex-col gap-5 rounded-r20 bg-white p-4 shadow-dialog sm:w-[22rem] sm:p-6">
        {/* Header */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-ts-fn font-semibold text-tx-primary">Konfirmasi Pembayaran</p>
          </div>
          <p className="text-ts-cap1 text-tx-secondary">
            {data.customerName} · {data.serviceName}
          </p>
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-2 rounded-r12 bg-bg-surface p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-ts-fn text-tx-secondary">Total tagihan</span>
            <span className="text-ts-fn font-semibold text-tx-primary">
              {formatRupiah(data.finalTotal)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-ts-fn text-tx-secondary">Metode</span>
            <span className="text-ts-fn font-medium text-tx-primary">{data.method}</span>
          </div>
          {isCash && (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-ts-fn text-tx-secondary">Uang diterima</span>
                <span className="text-ts-fn font-medium text-tx-primary">
                  {formatRupiah(data.amount)}
                </span>
              </div>
              <div className="h-px bg-bd-card" />
              <div className="flex items-baseline justify-between">
                <span className="text-ts-fn font-semibold text-tx-primary">
                  {(kembalian ?? 0) >= 0 ? 'Kembalian' : 'Kekurangan'}
                </span>
                <span
                  className={`text-ts-fn font-semibold ${(kembalian ?? 0) >= 0 ? 'text-st-in-progress' : 'text-st-cancelled'}`}
                >
                  {(kembalian ?? 0) >= 0
                    ? formatRupiah(kembalian ?? 0)
                    : `−${formatRupiah(Math.abs(kembalian ?? 0))}`}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Proof upload for TRANSFER / QRIS */}
        {!isCash && (
          <div className="flex flex-col gap-2">
            <p className="text-ts-cap2 font-semibold uppercase tracking-[0.05em] text-tx-secondary">
              Bukti Transfer
            </p>
            {settlementProof?.preview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settlementProof.preview}
                  alt="Bukti"
                  className="h-32 w-full rounded-r10 object-cover"
                />
                <label className="absolute right-2 top-2 cursor-pointer rounded-r6 bg-black/60 px-2.5 py-1 text-ts-cap2 font-semibold text-white">
                  Ganti
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (settlementProof?.preview) URL.revokeObjectURL(settlementProof.preview);
                      onSetProof({ file, preview: URL.createObjectURL(file) });
                    }}
                  />
                </label>
              </div>
            ) : (
              <label className="flex h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-r10 border-2 border-dashed border-bd-card transition-colors hover:border-tx-muted hover:bg-bg-surface">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8E8E93"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span className="text-ts-cap1 text-tx-secondary">
                  Ambil foto / pilih dari galeri
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    onSetProof({ file, preview: URL.createObjectURL(file) });
                  }}
                />
              </label>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="h-10 flex-1 rounded-r10 border border-bd-card text-ts-fn font-medium text-tx-subtle transition-colors hover:bg-bg-surface"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-r10 bg-ac-primary text-ts-fn font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            {isLoading ? 'Memproses...' : 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  );
}
