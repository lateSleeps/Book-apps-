'use client';

import { PaymentTypeSelector } from './PaymentTypeSelector';
import { QRISDisplay } from './QRISDisplay';
import { FileUploader } from './FileUploader';
import { PaymentTimer } from './PaymentTimer';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';

export function PaymentOptions() {
  const { paymentType } = useBookingStore();

  return (
    <div className="space-y-s32">
      <PaymentTypeSelector />
      {paymentType && (
        <>
          <PaymentTimer />
          <QRISDisplay />
          <FileUploader />
        </>
      )}
    </div>
  );
}
