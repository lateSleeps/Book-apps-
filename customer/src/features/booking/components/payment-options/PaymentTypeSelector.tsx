'use client';

import { useEffect, useMemo } from 'react';
import { cn } from '@/shared/lib/cn';
import type { PaymentType } from '@/features/booking/types/booking.types';
import { formatRupiah } from '@/shared/lib/format';
import { DEPOSIT_AMOUNT } from '@/features/booking/constants/booking.constants';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { Toast } from '@/features/booking/components/toast/Toast';

export function PaymentTypeSelector() {
  const { paymentType, totalPrice, setPaymentType, services } = useBookingStore();

  const isStyling = services[0]?.serviceFlow !== 'TREATMENT';

  // Auto-select DEPOSIT for styling services since it's the only option
  useEffect(() => {
    if (isStyling && !paymentType) {
      setPaymentType('DEPOSIT');
    }
  }, [isStyling, paymentType, setPaymentType]);

  const options = useMemo<{ type: PaymentType; label: string; amount: number; description: string }[]>(() => {
    const all = [
      {
        type: 'DEPOSIT' as PaymentType,
        label: 'Deposit (DP)',
        amount: DEPOSIT_AMOUNT,
        description: 'Bayar sebagian sekarang, sisanya di salon',
      },
      {
        type: 'FULL' as PaymentType,
        label: 'Lunas',
        amount: totalPrice,
        description: 'Bayar penuh sekarang, lebih praktis',
      },
    ];
    return isStyling ? all.filter((o) => o.type === 'DEPOSIT') : all;
  }, [isStyling, totalPrice]);

  return (
    <div className="space-y-s8">
      <p className="text-t14 font-semibold text-label mb-s12">Metode Pembayaran</p>
      {isStyling && (
        <Toast
          title="Pembayaran DP Dulu"
          description="Layanan styling hanya bisa DP dulu. Sisa dibayar langsung di salon."
          variant="warning"
          shake
          className="!mb-s24"
        />
      )}
      {options.map(({ type, label, amount, description }) => (
        <label
          key={type}
          className={cn(
            'flex items-start gap-s12 p-s16 rounded-r16 border cursor-pointer transition-colors',
            paymentType === type
              ? 'border-accent bg-accent-soft'
              : 'border-sep bg-surface hover:border-accent/40'
          )}
        >
          <input
            type="radio"
            name="paymentType"
            value={type}
            checked={paymentType === type}
            onChange={() => setPaymentType(type)}
            className="mt-0.5 accent-accent"
          />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="text-t14 font-semibold text-label">{label}</span>
              <span className="text-t14 font-bold text-accent">{formatRupiah(amount)}</span>
            </div>
            <p className="text-t12 text-label2 mt-s4">{description}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
