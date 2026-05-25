'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { BottomCTA } from '@/features/booking/components/bottom-cta';
import { BookingSummary } from '@/features/booking/components/booking-summary';
import { StepHeader } from '@/features/booking/components/step-header';
import { ErrorAlert } from '@/features/booking/components/error-alert';
import { LoadingState } from '@/features/booking/components/loading-state';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { formatRupiah } from '@/shared/lib/format';

interface PageProps {
  params: { slug: string };
}

export default function ConfirmPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const { timeSlot, date, services, stylist, totalPrice, discountAmount } = useBookingStore();
  const finalPrice = totalPrice - discountAmount;
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!timeSlot || services.length === 0) {
      router.replace(`/book/${slug}/steps/stylist`);
      return;
    }

    // Validate booking data and fetch payment methods
    const validateBooking = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        // Simulate data fetch - in production, this would fetch available payment methods
        // and validate that the selected time slot is still available
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Validation check: ensure all required data is present
        if (!date || !services.length) {
          throw new Error('Data pemesanan tidak lengkap. Silakan kembali ke langkah sebelumnya.');
        }

        console.log('✅ Booking validation successful');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Gagal memvalidasi pemesanan. Coba lagi.';
        console.error('❌ Booking validation failed:', error);
        setFetchError(message);
      } finally {
        setIsLoading(false);
      }
    };

    validateBooking();
  }, [timeSlot, services.length, slug, router, date]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {fetchError && (
        <ErrorAlert
          message={fetchError}
          onDismiss={() => setFetchError(null)}
          actionLabel="Kembali"
          onAction={() => router.back()}
        />
      )}

      <StepHeader title="Ringkasan" subtitle="Periksa kembali pesanan kamu" />
      {/* ── Scrollable content ── */}
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

            {/* Price Breakdown */}
            {discountAmount > 0 && (
              <div className="bg-white rounded-r16 p-s16 space-y-s12 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-label2">Subtotal</span>
                  <span className="text-sm font-semibold text-label">{formatRupiah(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center text-accent">
                  <span className="text-sm text-label2">Diskon</span>
                  <span className="text-sm font-semibold">-{formatRupiah(discountAmount)}</span>
                </div>
                <div className="border-t border-sep pt-s12 flex justify-between items-center">
                  <span className="text-base font-bold text-label">Total Pembayaran</span>
                  <span className="text-lg font-bold text-accent">{formatRupiah(finalPrice)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom CTA ── */}
      <BottomCTA
        label={isLoading ? 'Memvalidasi...' : 'Lanjut ke Pembayaran →'}
        onClick={() => router.push(`/book/${slug}/steps/contact`)}
        variant={isLoading ? 'default' : 'ready'}
        disabled={isLoading}
      />
    </div>
  );
}
