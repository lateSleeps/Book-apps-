'use client';

import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { formatRupiah, formatDate } from '@/shared/lib/format';
import { QRCodeDisplay } from './QRCodeDisplay';
import { TicketDivider } from '@/features/booking/components/ticket-divider/TicketDivider';

export function DigitalTicket() {
  const { bookingCode, pin, date, services, stylist, timeSlot, totalPrice, paymentType, depositAmount, customerName } = useBookingStore();

  // Use test data if no real data (for development testing)
  const displayCode = bookingCode || 'RB-0522-7228';
  const displayPin = pin || '7228';
  const displayName = customerName || 'Test User';
  const displayDate = date || '2026-05-23';
  const displayServices = services.length > 0 ? services : [{id: '1', name: 'Test Service', price: 20000, duration: 30}];
  const displayStylist = stylist || {id: '1', name: 'Test Stylist', title: 'DP'};
  const displayTimeSlot = timeSlot || '12:00';
  const displayPrice = totalPrice || 20000;
  const displayPaymentType = paymentType || 'FULL';
  const displayDepositAmount = depositAmount || 10000;

  const formattedDate = displayDate ? formatDate(displayDate) : '-';
  const paidAmount = displayPaymentType === 'FULL' ? displayPrice : displayDepositAmount;
  const paymentLabel = displayPaymentType === 'FULL' ? 'Lunas' : 'DP';

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_32px_rgba(0,0,0,0.10)] overflow-visible mx-[4px]">

      <div className="flex flex-col items-center px-[32px] pt-[36px] pb-[28px] text-center">
        <span className="text-[52px] leading-none mb-[16px]">🎉</span>
        <h2 className="text-[22px] font-bold text-label">Terima kasih!</h2>
        <p className="text-[14px] text-label2 mt-[6px] leading-snug">
          Tiket booking kamu sudah berhasil<br />diterbitkan.
        </p>

        <div className="mt-[24px] flex flex-col items-center gap-[12px] w-full">
          <QRCodeDisplay value={`rara-beauty:${displayCode}:${displayPin}`} />
          <p className="text-[12px] text-label2">Screenshot QR ini dan tunjukkan<br />ke admin saat kamu tiba.</p>
          <div className="flex items-center gap-[10px] w-full">
            <div className="flex-1 h-px bg-sep" />
            <span className="text-[11px] text-label3">atau PIN</span>
            <div className="flex-1 h-px bg-sep" />
          </div>
          <p className="text-[26px] font-bold text-label tracking-[0.3em] font-mono">{displayPin}</p>
        </div>
      </div>

      <TicketDivider />

      <div className="px-[28px] py-[24px] space-y-[20px]">

        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-semibold text-label3 tracking-[0.1em] uppercase mb-[4px]">Booking ID</p>
            <p className="text-[16px] font-bold text-label tracking-wide">{displayCode}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-label3 tracking-[0.1em] uppercase mb-[4px]">Dibayar</p>
            <p className="text-[16px] font-bold text-label">{formatRupiah(paidAmount)}</p>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-label3 tracking-[0.1em] uppercase mb-[4px]">Tanggal & Waktu</p>
          <p className="text-[15px] font-bold text-label">{formattedDate} · {displayTimeSlot ?? '-'}</p>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-label3 tracking-[0.1em] uppercase mb-[4px]">Layanan</p>
          <p className="text-[15px] font-bold text-label">{displayServices[0]?.name ?? '-'}</p>
        </div>

        <div className="flex items-center gap-[14px] bg-bg rounded-r14 px-[16px] py-[14px]">
          <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full bg-accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-label">{displayName ?? '-'}</p>
            <p className="text-[12px] text-label2 mt-[1px]">Stylist: {displayStylist?.name ?? '-'} · {paymentLabel}</p>
          </div>
        </div>

      </div>

      <TicketDivider />

      <div className="flex flex-col items-center px-[28px] pt-[20px] pb-[24px]">
        <p className="text-[11px] text-label3 tracking-[0.15em] font-mono">{displayCode}</p>
      </div>

    </div>
  );
}
