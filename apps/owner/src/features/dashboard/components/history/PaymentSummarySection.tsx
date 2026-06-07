'use client';

import { ArrowsLeftRight, Money, QrCode, Tag } from '@phosphor-icons/react';
import { PAYMENT_STATUS_META } from '../../constants/domain/payment-status';
import type { VisitRecord } from '../../types/history.types';
import { formatRupiah } from '@/shared/lib/format';

interface PaymentSummarySectionProps {
  visit: VisitRecord;
}

const PAYMENT_BADGE_CLASSES: Record<string, string> = {
  PAID: 'bg-py-paid-bg text-py-paid',
  DEPOSIT: 'bg-py-deposit-bg text-py-deposit',
  UNPAID: 'bg-py-unpaid-bg text-py-unpaid',
};

function PaymentMethodRow({ method }: { method: VisitRecord['paymentMethod'] }) {
  if (!method) return null;

  const meta = {
    CASH: {
      label: 'Tunai',
      icon: <Money size={15} weight="duotone" className="text-tx-secondary" />,
    },
    TRANSFER: {
      label: 'Transfer Bank',
      icon: <ArrowsLeftRight size={15} weight="duotone" className="text-tx-secondary" />,
    },
    QRIS: {
      label: 'QRIS',
      icon: <QrCode size={15} weight="duotone" className="text-tx-secondary" />,
    },
  }[method];

  return (
    <div className="mb-s12 flex items-center gap-s8">
      {meta.icon}
      <span className="text-ts-fn text-tx-subtle">{meta.label}</span>
    </div>
  );
}

export function PaymentSummarySection({ visit }: PaymentSummarySectionProps) {
  const pm = PAYMENT_STATUS_META[visit.paymentStatus];
  const hasBreakdown = visit.subtotal != null;
  const hasDiscount = (visit.discountAmount ?? 0) > 0;

  return (
    <section className="border-b border-bd-detail px-s20 py-s16">
      <p className="mb-s12 text-ts-cap2 font-semibold uppercase tracking-[0.06em] text-tx-secondary">
        Pembayaran
      </p>

      <PaymentMethodRow method={visit.paymentMethod} />

      {/* Financial breakdown */}
      <dl className="flex flex-col gap-s8">
        {hasBreakdown && (
          <div className="flex items-center justify-between gap-s8">
            <dt className="text-ts-fn text-tx-secondary">Subtotal</dt>
            <dd className="text-ts-fn text-tx-subtle">{formatRupiah(visit.subtotal!)}</dd>
          </div>
        )}

        {hasDiscount && (
          <div className="flex items-center justify-between gap-s8">
            <dt className="flex items-center gap-1.5 text-ts-fn text-py-paid">
              {visit.promoCode && (
                <>
                  <Tag size={12} weight="duotone" />
                  <span className="font-medium">{visit.promoCode}</span>
                </>
              )}
              {!visit.promoCode && 'Diskon'}
            </dt>
            <dd className="text-ts-fn font-medium text-py-paid">
              -{formatRupiah(visit.discountAmount!)}
            </dd>
          </div>
        )}

        {/* Divider before total */}
        {hasBreakdown && <div className="border-t border-bd-detail" />}

        <div className="flex items-center justify-between gap-s8">
          <dt className="text-ts-fn font-semibold text-tx-primary">Total</dt>
          <dd className="text-ts-sub font-bold text-tx-primary">
            {formatRupiah(visit.totalAmount)}
          </dd>
        </div>
      </dl>

      {/* Status badge */}
      <div className="mt-s12">
        <span
          className={`inline-flex items-center rounded-rF px-s8 py-1 text-ts-cap2 font-semibold ${PAYMENT_BADGE_CLASSES[visit.paymentStatus]}`}
        >
          {pm.label}
        </span>
      </div>
    </section>
  );
}
