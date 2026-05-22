'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProductUpsell } from '@/features/booking/components/product-upsell';
import { StepHeader } from '@/features/booking/components/step-header';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { useMockData } from '@/features/booking/hooks/use-mock-data';
import { BottomCTA } from '@/features/booking/components/bottom-cta';
import { formatRupiah } from '@/shared/lib/format';

interface PageProps {
  params: { slug: string };
}

export default function AddonsPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const { services, totalPrice } = useBookingStore();
  const { products } = useMockData();

  useEffect(() => {
    if (services.length === 0) router.replace(`/book/${slug}/steps/services`);
  }, [services.length, slug, router]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <StepHeader title="Produk Tambahan" subtitle="Tambahkan produk perawatan rambut" />
      <div className="flex-1 overflow-y-auto">

      <div className="px-s16 py-s32">
        <ProductUpsell products={products} />

        <div className="mt-s16 p-s16 bg-surface rounded-r16 border border-sep">
          <div className="flex justify-between items-center">
            <span className="text-t14 text-label2">Total</span>
            <span className="text-t18 font-bold text-label">{formatRupiah(totalPrice)}</span>
          </div>
        </div>
      </div>

      </div>
      <BottomCTA
        label="Lanjut ke Pembayaran →"
        onClick={() => router.push(`/book/${slug}/steps/payment`)}
      />
    </div>
  );
}
