'use client';

import { useState } from 'react';
import type { Service, Stylist } from '@/features/booking/types/booking.types';
import { formatRupiah, formatDate } from '@/shared/lib/format';
import { TicketDivider } from '@/features/booking/components/ticket-divider/TicketDivider';

interface BookingSummaryProps {
  date: string | null;
  services: Service[];
  stylist: Stylist | null;
  timeSlot: string | null;
  totalPrice: number;
}

export function BookingSummary({ date, services, stylist, timeSlot, totalPrice }: BookingSummaryProps) {
  const [promoCode, setPromoCode] = useState('');
  const formattedDate = date ? formatDate(date) : '-';
  const totalDuration = services.reduce((sum, svc) => sum + svc.duration, 0);

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_32px_rgba(0,0,0,0.10)] overflow-visible mx-[4px]">

      <div className="flex flex-col items-center px-[32px] pt-[32px] pb-[24px] text-center">
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-accent/10 mb-[14px]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <h2 className="text-[20px] font-bold text-label">Periksa pesananmu</h2>
        <p className="text-[13px] text-label2 mt-[6px] leading-snug">
          Pastikan semua detail sudah benar<br />sebelum melanjutkan.
        </p>
      </div>

      <TicketDivider />

      <div className="px-[28px] pt-[24px] space-y-[8px]">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-label3 tracking-[0.1em] uppercase block">Kode Promo</label>
          <span className="text-[11px] text-label3">(Opsional)</span>
        </div>
        <div className="flex gap-[8px]">
          <input
            type="text"
            placeholder="Masukkan kode promo"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 px-[12px] py-[10px] rounded-[12px] border-2 border-sep bg-bg text-[14px] font-medium focus:border-accent focus:outline-none transition-colors"
          />
          <button
            onClick={() => console.log('Apply promo:', promoCode)}
            className="px-[20px] py-[10px] rounded-[12px] bg-accent text-white font-semibold text-[14px] hover:bg-accent-dark transition-colors whitespace-nowrap"
          >
            Terapkan
          </button>
        </div>
      </div>

      <div className="px-[28px] py-[24px] space-y-[20px]">

        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-label3 tracking-[0.1em] uppercase mb-[4px]">Layanan</p>
            {services.length > 0 ? (
              <div className="space-y-[6px]">
                {services.map((svc) => (
                  <p key={svc.id} className="text-[14px] font-semibold text-label">
                    {svc.name}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-[16px] font-bold text-label">-</p>
            )}
          </div>
          <div className="text-right ml-[16px]">
            <p className="text-[11px] font-semibold text-label3 tracking-[0.1em] uppercase mb-[4px]">Total</p>
            <p className="text-[16px] font-bold text-label">{formatRupiah(totalPrice)}</p>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-label3 tracking-[0.1em] uppercase mb-[4px]">Tanggal & Waktu</p>
          <p className="text-[15px] font-bold text-label">{formattedDate} · {timeSlot ?? '-'}</p>
        </div>

        <div className="flex items-center gap-[14px] bg-bg rounded-r14 px-[16px] py-[14px]">
          <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full bg-accent/15">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-label">{stylist?.name ?? '-'}</p>
            <p className="text-[12px] text-label2 mt-[1px]">Stylist · {totalDuration > 0 ? `${totalDuration} menit` : '-'}</p>
          </div>
        </div>

      </div>

    </div>
  );
}
