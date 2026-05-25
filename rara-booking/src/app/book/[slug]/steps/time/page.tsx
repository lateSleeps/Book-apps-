'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TimeSlotPicker } from '@/features/booking/components/time-slot-picker';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { useMockData } from '@/features/booking/hooks/use-mock-data';
import { BottomCTA } from '@/features/booking/components/bottom-cta';
import { StepHeader } from '@/features/booking/components/step-header';
import { ErrorAlert } from '@/features/booking/components/error-alert';
import { LoadingState } from '@/features/booking/components/loading-state';

interface PageProps {
  params: { slug: string };
}

export default function TimePage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const { stylist, timeSlot, setTimeSlot } = useBookingStore();
  const { getTimeSlotsForStylist } = useMockData();
  const [slots, setSlots] = useState<ReturnType<typeof getTimeSlotsForStylist>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  useEffect(() => {
    if (!stylist) {
      router.replace(`/book/${slug}/steps/stylist`);
      return;
    }

    // Load available time slots
    const loadTimeSlots = async () => {
      setIsLoading(true);
      setAvailabilityError(null);

      try {
        // Simulate fetching available time slots from API
        await new Promise((resolve) => setTimeout(resolve, 500));

        const availableSlots = getTimeSlotsForStylist(stylist.id);

        if (!availableSlots || availableSlots.length === 0) {
          throw new Error('Tidak ada waktu yang tersedia untuk stylist ini. Silakan pilih stylist lain.');
        }

        setSlots(availableSlots);
        console.log('✅ Time slots loaded successfully');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Gagal memuat jadwal waktu. Coba lagi.';
        console.error('❌ Failed to load time slots:', error);
        setAvailabilityError(message);
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeSlots();
  }, [stylist, slug, router, getTimeSlotsForStylist]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {availabilityError && (
        <ErrorAlert
          message={availabilityError}
          onDismiss={() => setAvailabilityError(null)}
          actionLabel="Pilih Stylist Lain"
          onAction={() => router.replace(`/book/${slug}/steps/stylist`)}
        />
      )}

      <StepHeader title="Pilih Waktu" subtitle={stylist ? `Stylist: ${stylist.name}` : undefined} />
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingState message="Memuat jadwal waktu..." />
          </div>
        ) : (
          <div className="px-s16 py-s32">
            <TimeSlotPicker
              slots={slots}
              selectedTime={timeSlot}
              onSelect={setTimeSlot}
            />
          </div>
        )}
      </div>

      <BottomCTA
        label={isLoading ? 'Memuat...' : 'Konfirmasi Waktu →'}
        onClick={() => {
          if (timeSlot) router.push(`/book/${slug}/steps/confirm`);
        }}
        disabled={!timeSlot || isLoading}
      />
    </div>
  );
}
