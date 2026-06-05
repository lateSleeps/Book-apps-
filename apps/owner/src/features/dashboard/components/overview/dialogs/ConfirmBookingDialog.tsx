/**
 * @responsibility
 * Payment confirmation dialog — shows amount summary, method, kembalian,
 * and proof upload for non-cash payments.
 *
 * @usedBy overview/page.tsx via controller
 * @notes Presentation only. onConfirm triggers use-booking-payment.processPayment().
 */

'use client';

import type { SettlementProof } from '../../../hooks/overview/use-booking-payment';
import type { ConfirmPaymentDialogData } from '../../../types/overview.types';
import {
  BaseDialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogIcon,
  DialogPrimaryButton,
  DialogSecondaryButton,
} from '@/shared/components/ui/dialog';
import { formatRupiah } from '@/shared/lib/format';

interface ConfirmBookingDialogProps {
  data: ConfirmPaymentDialogData;
  settlementProof?: SettlementProof | null;
  isLoading: boolean;
  onSetProof: (proof: SettlementProof | null) => void;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function ImageUploadIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

// Input style matching WalkInNamePhoneFields
const inputStyle: React.CSSProperties = {
  height: 40,
  borderRadius: 10,
  border: '1px solid #E5E5EA',
  background: '#F9F9FB',
  padding: '0 14px',
  fontSize: 14,
  color: '#1C1C1E',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
};

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
    <BaseDialog zIndex="z-50" onBackdropClick={onCancel}>
      <DialogHeader
        icon={
          <DialogIcon variant="success">
            <CheckIcon />
          </DialogIcon>
        }
        title="Konfirmasi Pembayaran"
        description={`${data.customerName} · ${data.serviceName}`}
        onClose={onCancel}
      />

      <DialogContent>
        {/* Payment summary */}
        <div
          style={{
            borderRadius: 10,
            border: '1px solid #E5E5EA',
            background: '#F9F9FB',
            overflow: 'hidden',
          }}
        >
          <SummaryRow label="Total tagihan" value={formatRupiah(data.finalTotal)} bold />
          <div style={{ height: 1, background: '#F2F2F7' }} />
          <SummaryRow label="Metode" value={data.method} />
          {isCash && (
            <>
              <div style={{ height: 1, background: '#F2F2F7' }} />
              <SummaryRow label="Uang diterima" value={formatRupiah(data.amount)} />
              <div style={{ height: 1, background: '#E5E5EA' }} />
              <SummaryRow
                label={(kembalian ?? 0) >= 0 ? 'Kembalian' : 'Kekurangan'}
                value={
                  (kembalian ?? 0) >= 0
                    ? formatRupiah(kembalian ?? 0)
                    : `−${formatRupiah(Math.abs(kembalian ?? 0))}`
                }
                valueColor={(kembalian ?? 0) >= 0 ? '#16a34a' : '#ef4444'}
                bold
              />
            </>
          )}
        </div>

        {/* Proof upload — non-cash only */}
        {!isCash && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#8E8E93',
                margin: 0,
              }}
            >
              Bukti Transfer
            </p>
            {settlementProof?.preview ? (
              <div style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settlementProof.preview}
                  alt="Bukti"
                  style={{ width: '100%', height: 128, objectFit: 'cover', borderRadius: 10 }}
                />
                <label
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    cursor: 'pointer',
                    borderRadius: 6,
                    background: 'rgba(0,0,0,0.6)',
                    padding: '3px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#fff',
                  }}
                >
                  Ganti
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
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
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  height: 80,
                  borderRadius: 10,
                  border: '2px dashed #E5E5EA',
                  cursor: 'pointer',
                  background: 'transparent',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8E8E93';
                  e.currentTarget.style.background = '#F9F9FB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E5EA';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ color: '#8E8E93' }}>
                  <ImageUploadIcon />
                </span>
                <span style={{ fontSize: 12, color: '#8E8E93' }}>
                  Ambil foto / pilih dari galeri
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
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
      </DialogContent>

      <DialogFooter>
        <DialogSecondaryButton onClick={onCancel}>Batal</DialogSecondaryButton>
        <DialogPrimaryButton variant="neutral" onClick={onConfirm} isLoading={isLoading}>
          Konfirmasi
        </DialogPrimaryButton>
      </DialogFooter>
    </BaseDialog>
  );
}

// ── Internal helpers ──────────────────────────────────────────────────────────

interface SummaryRowProps {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}

function SummaryRow({ label, value, bold, valueColor }: SummaryRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '10px 14px',
      }}
    >
      <span style={{ fontSize: 13, color: '#8E8E93', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: valueColor ?? '#1C1C1E' }}>
        {value}
      </span>
    </div>
  );
}

// inputStyle is defined above but unused directly in JSX — kept for future inline inputs
void inputStyle;
