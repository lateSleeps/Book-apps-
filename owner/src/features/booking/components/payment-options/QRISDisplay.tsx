'use client';

import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { formatRupiah } from '@/shared/lib/format';

export function QRISDisplay() {
  const { paymentType, totalPrice, depositAmount } = useBookingStore();
  const amount = paymentType === 'FULL' ? totalPrice : depositAmount;

  return (
    <div className="flex flex-col items-center mt-s16">
      <p className="text-t14 font-semibold text-label mb-s12">Scan QRIS untuk Membayar</p>
      <div className="w-48 h-48 bg-accent/10 rounded-r16 border-2 border-accent flex flex-col items-center justify-center">
        <span className="text-t24 font-black text-accent tracking-widest">QRIS</span>
        <span className="text-t12 text-accent/70 mt-s4">Placeholder</span>
      </div>
      <p className="text-t16 font-bold text-label mt-s12">{formatRupiah(amount)}</p>
      <p className="text-t12 text-label2 mt-s4">Rara Beauty Salon</p>
    </div>
  );
}
