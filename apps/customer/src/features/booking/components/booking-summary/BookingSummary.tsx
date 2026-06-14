"use client";

import { useState } from "react";
import { StylistAvatar } from "@/features/booking/components/stylist-cards/StylistAvatar";
import type { Service, Stylist } from "@/features/booking/types/booking.types";
import { formatRupiah, formatDate } from "@/shared/lib/format";

interface BookingSummaryProps {
  date: string | null;
  services: Service[];
  stylist: Stylist | null;
  timeSlot: string | null;
  totalPrice: number;
  discountAmount?: number;
}

export function BookingSummary({
  date,
  services,
  stylist,
  timeSlot,
  totalPrice,
  discountAmount = 0,
}: BookingSummaryProps) {
  const [promoCode, setPromoCode] = useState("");
  const formattedDate = date ? formatDate(date) : "-";
  const totalDuration = services.reduce((sum, svc) => sum + svc.duration, 0);
  const finalPrice = totalPrice - discountAmount;

  return (
    <div className="space-y-[12px]">
      {/* ── Booking details card ── */}
      <div className="bg-bg-card rounded-r20 shadow-card overflow-hidden">
        {/* Layanan — name only, no price duplication */}
        <div className="px-s20 py-[13px]">
          <p className="text-[11px] font-semibold text-tx-muted tracking-[0.08em] uppercase mb-[4px]">
            Layanan
          </p>
          {services.length > 0 ? (
            <div className="space-y-[3px]">
              {services.map((svc) => (
                <p
                  key={svc.id}
                  className="text-[15px] font-semibold text-tx-primary"
                >
                  {svc.name}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-tx-secondary">-</p>
          )}
        </div>

        <div className="mx-s20 h-px bg-sep opacity-40" />

        {/* Tanggal & Waktu */}
        <div className="px-s20 py-[13px]">
          <p className="text-[11px] font-semibold text-tx-muted tracking-[0.08em] uppercase mb-[4px]">
            Tanggal & Waktu
          </p>
          <p className="text-[15px] font-semibold text-tx-primary">
            {formattedDate} · {timeSlot ?? "-"}
          </p>
        </div>

        <div className="mx-s20 h-px bg-sep opacity-40" />

        {/* Stylist */}
        <div className="px-s20 py-[14px]">
          <p className="text-[11px] font-semibold text-tx-muted tracking-[0.08em] uppercase mb-[8px]">
            Stylist
          </p>
          <div className="flex items-center gap-[10px]">
            {stylist && <StylistAvatar name={stylist.name} />}
            <p className="text-[15px] font-semibold text-tx-primary">
              {stylist?.name ?? "-"}
              {totalDuration > 0 && (
                <span className="text-tx-secondary font-normal">
                  {" "}
                  · {totalDuration} menit
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Divider before Total — full opacity to signal conclusion */}
        <div className="mx-s20 h-px bg-sep" />

        {/* Total — anchor visual, maximum hierarchy */}
        <div className="px-s20 pt-[24px] pb-[20px]">
          {discountAmount > 0 ? (
            <div className="space-y-[8px]">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-tx-secondary">Subtotal</span>
                <span className="text-[13px] text-tx-secondary">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-tx-secondary">Diskon</span>
                <span className="text-[13px] font-semibold text-c-salmon">
                  -{formatRupiah(discountAmount)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-[4px]">
                <span className="text-[14px] text-tx-secondary font-medium">
                  Total
                </span>
                <span className="text-[22px] font-bold text-tx-primary">
                  {formatRupiah(finalPrice)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-baseline">
              <span className="text-[14px] text-tx-secondary font-medium">
                Total
              </span>
              <span className="text-[22px] font-bold text-tx-primary">
                {formatRupiah(totalPrice)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Promo code — fully secondary ── */}
      <div className="px-s20">
        <p className="text-[11px] text-tx-muted mb-[6px]">
          Kode Promo (Opsional)
        </p>
        <div className="flex gap-[8px]">
          <input
            type="text"
            placeholder="Masukkan kode promo"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 px-[12px] py-[9px] rounded-r12 border border-bd-card bg-bg-card text-[14px] text-tx-primary placeholder:text-tx-muted focus:border-tx-secondary focus:outline-none transition-colors"
          />
          <button
            onClick={() => console.log("Apply promo:", promoCode)}
            className="px-[16px] py-[9px] rounded-r12 bg-bg-card border border-bd-card text-[14px] font-medium text-tx-secondary hover:bg-bd-row transition-colors whitespace-nowrap"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
