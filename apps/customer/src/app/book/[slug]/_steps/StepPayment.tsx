"use client";

import { BottomCTA } from "@/features/booking/components/bottom-cta";
import { PaymentOptions } from "@/features/booking/components/payment-options";
import { StepHeader } from "@/features/booking/components/step-header";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepPayment({ onNext, onBack }: Props) {
  const { paymentType, proofImageUrl, confirmBooking } = useBookingStore();

  function handleSubmit() {
    confirmBooking();
    onNext();
  }

  const canSubmit = !!paymentType && !!proofImageUrl;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <StepHeader
        title="Pembayaran"
        subtitle="Pilih metode dan unggah bukti bayar"
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="px-s16 py-s32">
          <PaymentOptions />
        </div>
      </div>
      <BottomCTA
        label="Konfirmasi Pembayaran →"
        onClick={handleSubmit}
        disabled={!canSubmit}
        variant={canSubmit ? "ready" : "default"}
      />
    </div>
  );
}
