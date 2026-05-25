'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ServiceList } from '@/features/booking/components/service-list';
import { SelectedServicesIndicator } from '@/features/booking/components/selected-services-indicator';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { useMockData } from '@/features/booking/hooks/use-mock-data';
import { BottomCTA } from '@/features/booking/components/bottom-cta';
import { StepHeader } from '@/features/booking/components/step-header';
import type { Service } from '@/features/booking/types/booking.types';

interface PageProps {
  params: { slug: string };
}

export default function ServicesPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const { category, services, addService, removeService, totalPrice } = useBookingStore();
  const { getServicesByCategory } = useMockData();

  useEffect(() => {
    if (!category) router.replace(`/book/${slug}/steps/category`);
  }, [category, slug, router]);

  const availableServices = category ? getServicesByCategory(category.id) : [];

  function handleToggle(svc: Service) {
    const isSelected = services.some((s) => s.id === svc.id);
    if (isSelected) {
      removeService(svc.id);
    } else {
      addService(svc);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <StepHeader
        title="Pilih Layanan"
        subtitle={category ? `Kategori: ${category.name}` : undefined}
      />

      <div className="flex-1 overflow-y-auto">
        <ServiceList
          services={availableServices}
          selectedServices={services}
          onToggle={handleToggle}
          isMultiSelect
        />
      </div>

      {/* Selected services indicator — floating card above CTA */}
      <SelectedServicesIndicator
        services={services}
        totalPrice={totalPrice}
        onRemoveService={removeService}
      />

      <BottomCTA
        label="Pilih Stylist →"
        onClick={() => { if (services.length > 0) router.push(`/book/${slug}/steps/stylist`); }}
        disabled={services.length === 0}
        showBack
        onBack={() => router.back()}
      />
    </div>
  );
}
