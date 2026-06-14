"use client";

import { useBookingStore } from "@/features/booking/hooks/use-booking-store";
import { formatRupiah } from "@/shared/lib/format";

/**
 * QRISDisplay — Payment card showing QRIS QR code and amount.
 *
 * Hierarchy (top → bottom):
 *   1. QRIS label     — section identifier (small, spaced)
 *   2. Merchant name  — identity before scanning (secondary text)
 *   3. QR code        — constrained; functional not decorative
 *   4. Amount         — dominant value (largest token in card context)
 *   5. Total Tagihan  — supporting caption below amount
 */
export function QRISDisplay() {
  const { paymentType, totalPrice, depositAmount } = useBookingStore();
  const amount = paymentType === "FULL" ? totalPrice : depositAmount;

  return (
    <div className="px-s16 pt-s20 pb-s20">
      {/* ── 1. QRIS label — section identifier only ── */}
      <div className="text-center mb-s4">
        <p className="text-ts-cap1 font-semibold text-label3 tracking-widest uppercase">
          QRIS
        </p>
      </div>

      {/* ── 2. Merchant identity — visible before scanning ── */}
      <div className="text-center mb-s16">
        <p className="text-ts-fn font-semibold text-label">Rara Beauty Salon</p>
      </div>

      {/* ── 3. QR code — reduced; still scannable ── */}
      <div className="w-full max-w-[140px] mx-auto aspect-square bg-bg-control rounded-r16 border border-sep flex flex-col items-center justify-center mb-s16">
        <span className="text-ts-t2 font-black text-label tracking-widest">
          QR
        </span>
        <span className="text-ts-cap1 text-label3 mt-s4">Placeholder</span>
      </div>

      {/* ── 4–5. Amount cluster — amount dominates, caption grounds it ── */}
      <div className="text-center">
        <p className="text-ts-t1 font-black text-label">
          {formatRupiah(amount)}
        </p>
        <p className="text-ts-cap1 text-label3 mt-s4">Total Tagihan</p>
      </div>
    </div>
  );
}
