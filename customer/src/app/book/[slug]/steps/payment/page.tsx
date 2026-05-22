'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PaymentOptions } from '@/features/booking/components/payment-options';
import { StepHeader } from '@/features/booking/components/step-header';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { BottomCTA } from '@/features/booking/components/bottom-cta';

interface PageProps {
  params: { slug: string };
}

export default function PaymentPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const { timeSlot, paymentType, proofImageUrl, confirmBooking } = useBookingStore();

  useEffect(() => {
    if (!timeSlot) router.replace(`/book/${slug}/steps/stylist`);
  }, [timeSlot, slug, router]);

  function handleSubmit() {
    confirmBooking();
    router.push(`/book/${slug}/steps/ticket`);
  }

  const canSubmit = !!paymentType && !!proofImageUrl;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <StepHeader title="Pembayaran" subtitle="Pilih metode dan unggah bukti bayar" />
      <div className="flex-1 overflow-y-auto">

      <div className="px-s16 py-s32">
        <PaymentOptions />
      </div>

      </div>
      <BottomCTA
        label="Konfirmasi Pembayaran →"
        onClick={handleSubmit}
        disabled={!canSubmit}
        variant={canSubmit ? 'ready' : 'default'}
      />
    </div>
  );
}
