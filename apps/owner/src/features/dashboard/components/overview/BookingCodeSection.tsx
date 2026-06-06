'use client';

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
            className="h-10 flex-1 rounded-r12 border border-[#e8e8e8] px-3.5 text-[0.9375rem] uppercase tracking-wider text-[#1a1a1a] transition-colors placeholder:text-[#ccc] focus:border-[#bbb] focus:outline-none"
          />
          <button className="h-10 shrink-0 rounded-r12 bg-[#1a1a1a] px-4 text-[0.8125rem] font-medium text-white transition-colors hover:bg-[#333]">
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
          className="flex h-32 flex-col items-center justify-center gap-3 rounded-r12 border-2 border-dashed border-[#e0e0e0] text-gray-400 transition-colors hover:border-[#bbb] hover:bg-[#fafaf8] hover:text-gray-500"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
            <rect x="7" y="7" width="3" height="10" rx="0.5" />
            <rect x="14" y="7" width="3" height="10" rx="0.5" />
          </svg>
          <span className="text-[0.8125rem] font-medium">Tap untuk scan barcode</span>
        </button>
      </div>
    </>
  );
}
