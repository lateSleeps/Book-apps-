'use client';

import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { formatRupiah } from '@/shared/lib/format';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';

// Mock promo codes - in real app, these would come from owner dashboard
const AVAILABLE_PROMO_CODES: Record<string, { type: 'percent' | 'fixed'; value: number }> = {
  'WELCOME10': { type: 'percent', value: 10 },
  'SUMMER20': { type: 'percent', value: 20 },
  'SAVE50000': { type: 'fixed', value: 50000 },
  'SPECIAL30': { type: 'percent', value: 30 },
};

interface PromoCodeInputProps {
  totalPrice: number;
  currentDiscount?: number;
  onApply?: () => void;
}

export function PromoCodeInput({ totalPrice, currentDiscount = 0, onApply }: PromoCodeInputProps) {
  const { promoCode, setPromoCode, removePromoCode } = useBookingStore();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  function handleApplyCode() {
    const code = input.toUpperCase().trim();

    if (!code) {
      setError('Masukkan kode promo');
      return;
    }

    const promoData = AVAILABLE_PROMO_CODES[code];
    if (!promoData) {
      setError('Kode promo tidak valid');
      return;
    }

    const discount = promoData.type === 'percent'
      ? (totalPrice * promoData.value) / 100
      : promoData.value;

    setPromoCode(code, discount);
    setInput('');
    setError('');
    onApply?.();
  }

  function handleRemoveCode() {
    removePromoCode();
    setInput('');
    setError('');
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    setError('');
  }

  if (promoCode) {
    return (
      <div className="bg-accent-soft rounded-r16 p-s16 border border-accent/30">
        <div className="flex items-center justify-between mb-s12">
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-wide">Kode Promo Digunakan</p>
            <p className="text-sm font-bold text-label mt-s4">{promoCode.code}</p>
          </div>
          <button
            onClick={handleRemoveCode}
            className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            Hapus
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-label2">Diskon</span>
          <span className="text-sm font-bold text-accent">-{formatRupiah(currentDiscount)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-r16 border border-sep p-s16 space-y-s12">
      <div className="space-y-s8">
        <label className="text-sm font-medium text-label block">Kode Promo</label>
        <input
          type="text"
          placeholder="Masukkan kode promo"
          value={input}
          onChange={handleInputChange}
          className={cn(
            'w-full px-s12 py-s10 rounded-r12 border-2 text-sm font-medium transition-colors',
            error ? 'border-red-300 bg-red-50' : 'border-sep bg-bg focus:border-accent focus:outline-none'
          )}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      </div>

      <button
        onClick={handleApplyCode}
        disabled={!input.trim()}
        className={cn(
          'w-full px-s12 py-s10 rounded-r12 font-semibold text-sm transition-all',
          input.trim()
            ? 'bg-accent text-white hover:bg-accent-dark active:scale-95'
            : 'bg-sep text-label3 cursor-not-allowed'
        )}
      >
        Gunakan
      </button>
    </div>
  );
}
