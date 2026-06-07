'use client';

import { ArrowsLeftRight, MagnifyingGlassPlus, Money, QrCode, Tag } from '@phosphor-icons/react';
import { PAYMENT_STATUS_META } from '../../constants/domain/payment-status';
import { buildConsultationEntries } from '../../lib/parseConsultationNotes';
import type { VisitRecord } from '../../types/history.types';
import { ConsultationSection } from './ConsultationSection';
import { formatDuration, formatRupiah } from '@/shared/lib/format';

// ── Shared card shell ─────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-r16 bg-bg-card p-s16">
      <p className="mb-s12 text-ts-cap2 font-semibold uppercase tracking-[0.06em] text-tx-secondary">
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Row inside a card ─────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-s8">
      <span className="shrink-0 text-ts-fn text-tx-secondary">{label}</span>
      <span className="text-right text-ts-fn font-medium text-tx-primary">{value}</span>
    </div>
  );
}

// ── Payment method icon ───────────────────────────────────────────────────────

const METHOD_META = {
  CASH: { label: 'Tunai', Icon: Money },
  TRANSFER: { label: 'Transfer Bank', Icon: ArrowsLeftRight },
  QRIS: { label: 'QRIS', Icon: QrCode },
} as const;

// ── Proof thumbnail ───────────────────────────────────────────────────────────

function ProofThumb({ url, label, onOpen }: { url: string; label: string; onOpen: () => void }) {
  return (
    <div className="flex flex-col gap-s4">
      <p className="text-ts-cap2 text-tx-muted">{label}</p>
      <button
        onClick={onOpen}
        className="group relative overflow-hidden rounded-r12 border border-bd-card bg-bg-surface transition-colors"
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

// ── Module-level constants ────────────────────────────────────────────────────

const PAYMENT_BADGE: Record<string, string> = {
  PAID: 'bg-py-paid-bg text-py-paid',
  DEPOSIT: 'bg-py-deposit-bg text-py-deposit',
  UNPAID: 'bg-py-unpaid-bg text-py-unpaid',
};

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  visit: VisitRecord;
  onOpenProof: (url: string, label: string) => void;
}

export function VisitDetailRight({ visit, onOpenProof }: Props) {
  const pm = PAYMENT_STATUS_META[visit.paymentStatus];
  const hasBreakdown = visit.subtotal != null;
  const hasDiscount = (visit.discountAmount ?? 0) > 0;
  const method = visit.paymentMethod ? METHOD_META[visit.paymentMethod] : null;

  const consultationEntries = buildConsultationEntries(visit.serviceQuestions ?? [], visit.notes);

  return (
    <div className="flex flex-col gap-s12">
      {/* Treatment card */}
      <Card title="Treatment">
        <dl className="flex flex-col gap-s8">
          <Row label="Layanan" value={visit.serviceName} />
          {visit.duration != null && <Row label="Durasi" value={formatDuration(visit.duration)} />}
        </dl>
        {!consultationEntries.length && visit.notes && (
          <p className="mt-s12 rounded-r10 bg-bg-surface px-s12 py-s8 text-ts-fn italic text-tx-subtle">
            {visit.notes}
          </p>
        )}
      </Card>

      {/* Add-on card — only when add-ons exist */}
      {visit.addOns && visit.addOns.length > 0 && (
        <Card title="Add-on">
          <ul className="flex flex-col gap-s8">
            {visit.addOns.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-s8">
                <span className="text-ts-fn text-tx-primary">
                  {item.name}
                  {item.quantity != null && item.quantity > 1 && (
                    <span className="ml-1 text-tx-secondary">×{item.quantity}</span>
                  )}
                </span>
                <span className="shrink-0 text-ts-fn font-medium text-tx-subtle">
                  {formatRupiah(item.price * (item.quantity ?? 1))}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Payment flat rows */}
      <div className="flex flex-col gap-s8 px-s4">
        {method && (
          <div className="flex items-center gap-s8">
            <method.Icon size={15} weight="duotone" className="text-tx-secondary" />
            <span className="text-ts-fn text-tx-subtle">{method.label}</span>
          </div>
        )}

        {hasBreakdown && (
          <div className="flex items-center justify-between gap-s8">
            <span className="text-ts-fn text-tx-secondary">Subtotal</span>
            <span className="text-ts-fn text-tx-subtle">{formatRupiah(visit.subtotal!)}</span>
          </div>
        )}

        {hasDiscount && (
          <div className="flex items-center justify-between gap-s8">
            <span className="flex items-center gap-1.5 text-ts-fn text-py-paid">
              {visit.promoCode && (
                <>
                  <Tag size={12} weight="duotone" />
                  <span className="font-medium">{visit.promoCode}</span>
                </>
              )}
              {!visit.promoCode && 'Diskon'}
            </span>
            <span className="text-ts-fn font-medium text-py-paid">
              -{formatRupiah(visit.discountAmount!)}
            </span>
          </div>
        )}

        {hasBreakdown && <div className="border-t border-bd-detail" />}

        <div className="flex items-center justify-between gap-s8">
          <span className="text-ts-fn font-semibold text-tx-primary">Total</span>
          <span className="text-ts-sub font-bold text-tx-primary">
            {formatRupiah(visit.totalAmount)}
          </span>
        </div>

        <div>
          <span
            className={`inline-flex items-center rounded-rF px-s8 py-1 text-ts-cap2 font-semibold ${PAYMENT_BADGE[visit.paymentStatus]}`}
          >
            {pm.label}
          </span>
        </div>
      </div>

      {/* Consultation answers */}
      {consultationEntries.length > 0 && (
        <div className="border-t border-bd-detail pt-s12">
          <ConsultationSection entries={consultationEntries} onOpenProof={onOpenProof} />
        </div>
      )}

      {/* Payment proofs */}
      {(visit.paymentProofUrl || visit.settlementProofUrl) && (
        <div className="border-t border-bd-detail pt-s12">
          <p className="mb-s12 text-ts-cap2 font-semibold uppercase tracking-[0.06em] text-tx-secondary">
            Bukti Pembayaran
          </p>
          <div className="flex flex-col gap-s12">
            {visit.paymentProofUrl && (
              <ProofThumb
                url={visit.paymentProofUrl}
                label="Bukti DP / Pembayaran"
                onOpen={() => onOpenProof(visit.paymentProofUrl!, 'Bukti Pembayaran')}
              />
            )}
            {visit.settlementProofUrl && (
              <ProofThumb
                url={visit.settlementProofUrl}
                label="Bukti Pelunasan"
                onOpen={() => onOpenProof(visit.settlementProofUrl!, 'Bukti Pelunasan')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
