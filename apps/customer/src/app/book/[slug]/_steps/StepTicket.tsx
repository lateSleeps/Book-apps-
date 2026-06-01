"use client";

import { BottomCTA } from "@/features/booking/components/bottom-cta";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";

interface Props {
  onDone: () => void;
}

export function StepTicket({ onDone }: Props) {
  const { reset, stylist, timeSlot, date } = useBookingStore();

  function handleDone() {
    reset();
    onDone();
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-s20 pt-s48 pb-s32 text-center gap-6">
          {/* Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f0fdf4]">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] font-bold text-label leading-tight">
              Bukti pembayaran diterima!
            </h1>
            <p className="text-[15px] text-label2 leading-relaxed">
              Booking kamu sedang menunggu konfirmasi dari salon.
            </p>
          </div>

          {/* Info card */}
          <div className="w-full rounded-2xl border border-sep bg-surface p-5 text-left flex flex-col gap-3">
            {date && (
              <div className="flex justify-between text-[14px]">
                <span className="text-label3">Tanggal</span>
                <span className="font-medium text-label">
                  {formatDate(date)}
                </span>
              </div>
            )}
            {timeSlot && (
              <div className="flex justify-between text-[14px]">
                <span className="text-label3">Waktu</span>
                <span className="font-medium text-label">{timeSlot}</span>
              </div>
            )}
            {stylist && (
              <div className="flex justify-between text-[14px]">
                <span className="text-label3">Stylist</span>
                <span className="font-medium text-label">{stylist.name}</span>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="w-full rounded-2xl bg-[#fffbeb] border border-[#fde68a] p-5 text-left flex flex-col gap-3">
            <p className="text-[13px] font-semibold text-[#92400e] uppercase tracking-wide">
              Selanjutnya
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f59e0b] text-white text-[10px] font-bold">
                  1
                </div>
                <p className="text-[13px] text-[#78350f] leading-snug">
                  Salon akan mengkonfirmasi booking kamu dalam{" "}
                  <strong>maksimal 1 jam</strong>. Jika tidak ada respons,
                  booking otomatis dikonfirmasi.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f59e0b] text-white text-[10px] font-bold">
                  2
                </div>
                <p className="text-[13px] text-[#78350f] leading-snug">
                  Cek status booking kamu di halaman{" "}
                  <strong>Cek Booking</strong> menggunakan nomor HP dan PIN dari
                  tiket.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f59e0b] text-white text-[10px] font-bold">
                  3
                </div>
                <p className="text-[13px] text-[#78350f] leading-snug">
                  Jika terkonfirmasi, tiket QR code kamu akan tersedia di
                  halaman Cek Booking.
                </p>
              </div>
            </div>
          </div>

          {/* CTA ke check booking */}
          <a
            href="/check-booking"
            className="w-full rounded-2xl border border-sep bg-surface py-4 text-center text-[14px] font-semibold text-label transition-all hover:bg-sep active:scale-[0.98]"
          >
            Cek Status Booking →
          </a>
        </div>
      </div>

      <BottomCTA label="Selesai" variant="ready" onClick={handleDone} />
    </div>
  );
}
