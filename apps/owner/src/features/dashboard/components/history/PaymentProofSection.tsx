'use client';

import { MagnifyingGlassPlus } from '@phosphor-icons/react';

interface PaymentProofSectionProps {
  paymentProofUrl?: string;
  settlementProofUrl?: string;
  onOpenProof: (url: string, label: string) => void;
}

function ProofThumbnail({
  url,
  label,
  onOpen,
}: {
  url: string;
  label: string;
  onOpen: () => void;
}) {
  return (
    <div className="flex flex-col gap-s4">
      <p className="text-ts-cap2 text-tx-muted">{label}</p>
      <button
        onClick={onOpen}
        className="group relative overflow-hidden rounded-r12 border border-bd-card bg-bg-surface transition-colors hover:border-bd-card"
        aria-label={`Perbesar ${label}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label}
          className="h-[120px] w-full object-cover transition-opacity group-hover:opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-rF bg-white/90 shadow-card">
            <MagnifyingGlassPlus size={18} weight="duotone" className="text-tx-primary" />
          </div>
        </div>
      </button>
    </div>
  );
}

export function PaymentProofSection({
  paymentProofUrl,
  settlementProofUrl,
  onOpenProof,
}: PaymentProofSectionProps) {
  if (!paymentProofUrl && !settlementProofUrl) return null;

  return (
    <section className="border-b border-bd-detail px-s20 py-s16">
      <p className="mb-s12 text-ts-cap2 font-semibold uppercase tracking-[0.06em] text-tx-secondary">
        Bukti Pembayaran
      </p>

      <div className="flex flex-col gap-s12">
        {paymentProofUrl && (
          <ProofThumbnail
            url={paymentProofUrl}
            label="Bukti DP / Pembayaran"
            onOpen={() => onOpenProof(paymentProofUrl, 'Bukti Pembayaran')}
          />
        )}
        {settlementProofUrl && (
          <ProofThumbnail
            url={settlementProofUrl}
            label="Bukti Pelunasan"
            onOpen={() => onOpenProof(settlementProofUrl, 'Bukti Pelunasan')}
          />
        )}
      </div>
    </section>
  );
}
