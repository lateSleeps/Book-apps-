/**
 * @responsibility
 * Payment section wrapper — 2-column grid containing PaymentStatusCard
 * (read-only left) and PaymentInputCard (interactive right).
 *
 * @usedBy
 * BookingDetailPanel.tsx
 *
 * @notes
 * - Thin wrapper: layout only, no business logic.
 * - finalTotal computed here so both cards share the same value.
 */

'use client';

import type { BookingPaymentState } from '../../hooks/overview/use-booking-payment';
import type { BookingPromoState } from '../../hooks/overview/use-booking-promo';
import type { DashboardBooking } from '../../types/dashboard.types';
import type { AddOn } from '../../types/dashboard.types';
import type { ServiceData } from '../../types/overview.types';
import { PaymentInputCard } from './PaymentInputCard';
import { PaymentStatusCard } from './PaymentStatusCard';

interface PaymentSectionProps {
  booking: DashboardBooking;
  currentService: ServiceData;
  additionalServices: ServiceData[];
  addOns: AddOn[];
  payment: BookingPaymentState;
  promo: BookingPromoState;
}

export function PaymentSection({
  booking,
  currentService,
  additionalServices,
  addOns,
  payment,
  promo,
}: PaymentSectionProps) {
  const serviceTotal =
    currentService.price +
    additionalServices.reduce((s, sv) => s + sv.price, 0) +
    addOns.reduce((s, a) => s + a.price, 0);
  const discount = promo.getDiscount(booking.id);
  const finalTotal = serviceTotal - discount;

  return (
    <div
      className="payment-grid-tablet grid gap-5 border-t border-bd-detail pt-4"
      style={{ gridTemplateColumns: '1fr 2fr' }}
    >
      <PaymentStatusCard
        booking={booking}
        finalTotal={finalTotal}
        onViewDpProof={
          booking.paymentProofUrl
            ? () => payment.openProofZoom({ url: booking.paymentProofUrl!, label: 'Bukti DP' })
            : undefined
        }
        onViewSettlementProof={
          booking.settlementProofUrl
            ? () =>
                payment.openProofZoom({
                  url: booking.settlementProofUrl!,
                  label: 'Bukti Pelunasan',
                })
            : undefined
        }
      />
      <PaymentInputCard booking={booking} finalTotal={finalTotal} payment={payment} promo={promo} />
    </div>
  );
}
