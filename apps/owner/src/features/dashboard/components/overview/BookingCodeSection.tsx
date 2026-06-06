'use client';

import { Barcode } from '@phosphor-icons/react';

interface BookingCodeSectionProps {
  bookingCodeInput: string;
  setBookingCodeInput: (code: string) => void;
  onScanBarcode: () => Promise<void>;
}

export function BookingCodeSection({
  bookingCodeInput,
  setBookingCodeInput,
  onScanBarcode,
}: BookingCodeSectionProps) {
  return (
    <>
      {/* Kode booking */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#444]">
          Kode Booking
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="RB-2025-XXX"
            value={bookingCodeInput}
            onChange={(e) => setBookingCodeInput(e.target.value.toUpperCase())}
            className="h-10 flex-1 rounded-r12 border border-[#e8e8e8] px-3.5 text-[0.9375rem] uppercase tracking-wider text-tx-body transition-colors placeholder:text-[#ccc] focus:border-[#bbb] focus:outline-none"
          />
          <button className="h-10 shrink-0 rounded-r12 bg-tx-body px-4 text-[0.8125rem] font-medium text-white transition-colors hover:bg-[#333]">
            Cari
          </button>
        </div>
      </div>

      {/* Scan barcode */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#444]">
          Atau Scan Barcode
        </label>
        <button
          onClick={onScanBarcode}
          className="flex h-32 flex-col items-center justify-center gap-3 rounded-r12 border-2 border-dashed border-[#e0e0e0] text-gray-400 transition-colors hover:border-[#bbb] hover:bg-bg-surface hover:text-gray-500"
        >
          <Barcode size={32} weight="duotone" />
          <span className="text-[0.8125rem] font-medium">Tap untuk scan barcode</span>
        </button>
      </div>
    </>
  );
}
