"use client";

import { useState, useEffect } from "react";

import { BookingSummary } from "@/features/booking/components/booking-summary";
import { BottomCTA } from "@/features/booking/components/bottom-cta";
import { ErrorAlert } from "@/features/booking/components/error-alert";
import { LoadingState } from "@/features/booking/components/loading-state";
import { StepHeader } from "@/features/booking/components/step-header";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";
import { formatRupiah } from "@/shared/lib/format";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepConfirm({ onNext, onBack }: Props) {
  const { timeSlot, date, services, stylist, totalPrice, discountAmount } =
    useBookingStore();
  const finalPrice = totalPrice - discountAmount;
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!timeSlot || services.length === 0) {
      onBack();
      return;
    }

    const validateBooking = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!date || !services.length) {
          throw new Error(
            "Data pemesanan tidak lengkap. Silakan kembali ke langkah sebelumnya.",
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Gagal memvalidasi pemesanan. Coba lagi.";
        setFetchError(message);
      } finally {
        setIsLoading(false);
      }
    };

    validateBooking();
  }, [timeSlot, services.length, date, onBack]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {fetchError && (
        <ErrorAlert
          message={fetchError}
          onDismiss={() => setFetchError(null)}
          actionLabel="Kembali"
          onAction={onBack}
        />
      )}

      <StepHeader title="Ringkasan" subtitle="Periksa kembali pesanan kamu" />
      <div className="flex-1 overflow-y-auto bg-bg">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingState message="Memvalidasi pemesanan..." />
          </div>
        ) : (
          <div className="px-s20 py-s24 space-y-s24">
            <BookingSummary
              date={date}
              services={services}
              stylist={stylist}
              timeSlot={timeSlot}
              totalPrice={totalPrice}
            />

            {discountAmount > 0 && (
              <div className="bg-white rounded-r16 p-s16 space-y-s12 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-label2">Subtotal</span>
                  <span className="text-sm font-semibold text-label">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-accent">
                  <span className="text-sm text-label2">Diskon</span>
                  <span className="text-sm font-semibold">
                    -{formatRupiah(discountAmount)}
                  </span>
                </div>
                <div className="border-t border-sep pt-s12 flex justify-between items-center">
                  <span className="text-base font-bold text-label">
                    Total Pembayaran
                  </span>
                  <span className="text-lg font-bold text-accent">
                    {formatRupiah(finalPrice)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomCTA
        label={isLoading ? "Memvalidasi..." : "Lanjut ke Pembayaran →"}
        onClick={onNext}
        variant={isLoading ? "default" : "ready"}
        disabled={isLoading}
      />
    </div>
  );
}
