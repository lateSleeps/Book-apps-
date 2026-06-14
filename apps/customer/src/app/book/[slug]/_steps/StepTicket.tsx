"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";
import { InlineNotice } from "@/shared/components/ui/InlineNotice";

interface Props {
  onDone: () => void;
}

export function StepTicket({ onDone }: Props) {
  const { reset, stylist, timeSlot, date } = useBookingStore();

  function handleDone() {
    reset();
    onDone();
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg-page">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-s20 pt-s48 pb-s32 text-center">
          {/* ── Success icon — bg-c-mint + text-accent matches InlineNotice success variant ── */}
          <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-c-mint mb-s24">
            <CheckCircle size={40} weight="fill" className="text-accent" />
          </div>

          {/* ── Heading — booking outcome, not payment receipt ── */}
          <h1 className="text-[28px] font-bold text-label leading-tight tracking-tight">
            Booking kamu sudah dikirim
          </h1>
          <p className="text-ts-fn text-label2 mt-s8 leading-snug mb-s24">
            Kami sedang menunggu konfirmasi dari salon.
          </p>

          {/* ── Appointment summary — human, not administrative ── */}
          <div className="w-full bg-bg-card rounded-r20 shadow-card px-s20 py-s24 mb-s16 text-center">
            {date && (
              <p className="text-ts-t3 font-bold text-label leading-tight">
                {formatDate(date)}
                {timeSlot ? ` · ${timeSlot}` : ""}
              </p>
            )}
            {stylist && (
              <p className="text-ts-fn text-label2 mt-s8">
                bersama {stylist.name}
              </p>
            )}
          </div>

          {/* ── Info notice — shared design system component, no custom yellow card ── */}
          <div className="w-full mb-s16">
            <InlineNotice
              variant="info"
              title="Konfirmasi kurang dari 1 jam"
              description="Salon biasanya segera mengonfirmasi. Jika tidak ada respons, booking akan otomatis dikonfirmasi."
            />
          </div>

          {/* ── Status check context — below the notice ── */}
          <p className="text-ts-cap1 text-label3 leading-snug px-s4">
            Cek status booking kapan saja menggunakan nomor HP yang digunakan
            saat booking.
          </p>
        </div>
      </div>

      {/* ── Bottom actions — primary "Cek Status" + secondary ghost "Selesai" ── */}
      <div className="flex-none w-full border-t border-sep bg-white/95 backdrop-blur-sm px-s16 pb-[max(env(safe-area-inset-bottom),24px)] pt-s16 flex flex-col gap-s4">
        {/* Primary — Cek Status Booking */}
        <a
          href="/check-booking"
          className="flex w-full items-center justify-center rounded-rF min-h-[50px] px-s24 text-t16 font-semibold bg-label text-white shadow-button transition-all active:scale-[0.98] active:shadow-none"
        >
          Cek Status Booking →
        </a>
        {/* Secondary ghost — Selesai */}
        <button
          onClick={handleDone}
          className="w-full py-s12 text-ts-fn text-label3 transition-colors active:text-label2"
        >
          Selesai
        </button>
      </div>
    </div>
  );
}
