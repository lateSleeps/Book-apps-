"use client";

import { useState, useEffect } from "react";

import { BookingSummary } from "@/features/booking/components/booking-summary";
import { BottomCTA } from "@/features/booking/components/bottom-cta";
import { ErrorAlert } from "@/features/booking/components/error-alert";
import { LoadingState } from "@/features/booking/components/loading-state";
import { useBookingStore } from "@/features/booking/hooks/use-booking-store";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepConfirm({ onNext, onBack }: Props) {
  const { timeSlot, date, services, stylist, totalPrice, discountAmount } =
    useBookingStore();
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
    <div className="relative flex flex-col h-full overflow-hidden bg-bg-page">
      {fetchError && (
        <ErrorAlert
          message={fetchError}
          onDismiss={() => setFetchError(null)}
          actionLabel="Kembali"
          onAction={onBack}
        />
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* ── Page header — matches StepStylist exactly ── */}
        <div className="px-s20 pt-s20 pb-s4">
          <button
            onClick={onBack}
            aria-label="Kembali"
            className="mb-[16px] -ml-[4px] flex h-[44px] w-[44px] items-center justify-center rounded-full text-tx-secondary transition-all active:scale-95"
          >
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-bg-card hover:bg-sep transition-colors">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
          </button>
          <p className="text-[11px] font-semibold text-tx-muted tracking-[0.08em] uppercase mb-[4px]">
            Hampir selesai
          </p>
          <h1 className="text-[28px] font-bold text-tx-primary leading-tight tracking-tight">
            Ringkasan
          </h1>
          <p className="mt-[6px] text-[15px] text-tx-secondary leading-snug">
            Periksa kembali pesanan kamu.
          </p>
        </div>

        <div className="px-s16 pt-s20 pb-s24">
          {isLoading ? (
            <div className="flex items-center justify-center py-s32">
              <LoadingState message="Memvalidasi pemesanan..." />
            </div>
          ) : (
            <BookingSummary
              date={date}
              services={services}
              stylist={stylist}
              timeSlot={timeSlot}
              totalPrice={totalPrice}
              discountAmount={discountAmount}
            />
          )}
        </div>
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
