'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { BottomCTA } from '@/features/booking/components/bottom-cta';
import { StepHeader } from '@/features/booking/components/step-header';
import { StylistCards } from '@/features/booking/components/stylist-cards';
import { Toast } from '@/features/booking/components/toast/Toast';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { useMockData } from '@/features/booking/hooks/use-mock-data';
import { useToast } from '@/features/booking/hooks/use-toast';
import type { Stylist } from '@/features/booking/types/booking.types';
import { formatRupiah } from '@/shared/lib/format';

interface PageProps {
  params: { slug: string };
}

export default function StylistPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const { services, stylist, timeSlot, setStylist, setTimeSlot } = useBookingStore();
  const { stylists, getTimeSlotsForStylist } = useMockData();
  const [pendingTime, setPendingTime] = useState<string | null>(timeSlot ?? null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (services.length === 0) router.replace(`/book/${slug}/steps/services`);
  }, [services.length, slug, router]);

  function handleSelectStylist(s: Stylist) {
    setStylist(s);
    setPendingTime(null);
  }

  function handleSelectTime(time: string) {
    setPendingTime(time);
  }

  function handleFullyBookedTap(name: string) {
    showToast(`${name} sudah penuh untuk hari ini.`);
  }

  function handleConfirm() {
    if (!pendingTime) return;
    setTimeSlot(pendingTime);
    router.push(`/book/${slug}/steps/confirm`);
  }

  const canConfirm = !!(stylist && pendingTime);
  const ctaLabel = !stylist
    ? 'Pilih stylist dulu'
    : !pendingTime
      ? 'Pilih waktu'
      : `Konfirmasi — ${pendingTime} dengan ${stylist.name.split(' ')[0] ?? stylist.name} →`;

  const service = services.length > 0 ? services[0] : null;

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <StepHeader title="Pilih Stylist" subtitle={service ? `${service.name} · ${formatRupiah(service.price)}` : undefined} />

      <div className="flex-1 overflow-y-auto">
        <div className="py-s32">
          <StylistCards
            stylists={stylists}
            selectedStylist={stylist}
            selectedTime={pendingTime}
            getSlotsForStylist={getTimeSlotsForStylist}
            onSelectStylist={handleSelectStylist}
            onSelectTime={handleSelectTime}
            onFullyBookedTap={handleFullyBookedTap}
          />
        </div>
      </div>

      {toast && (
        <div className="absolute bottom-[88px] left-s16 right-s16 z-50 animate-up shadow-button rounded-r16 overflow-hidden">
          <Toast title="Stylist Penuh" description={toast} variant="warning" onClose={hideToast} />
        </div>
      )}

      <BottomCTA
        label={ctaLabel}
        variant={canConfirm ? 'ready' : 'default'}
        disabled={!canConfirm}
        onClick={handleConfirm}
      />
    </div>
  );
}
