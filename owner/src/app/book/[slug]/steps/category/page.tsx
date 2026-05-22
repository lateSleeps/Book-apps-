'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CategoryGrid } from '@/features/booking/components/category-grid';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { useMockData } from '@/features/booking/hooks/use-mock-data';
import { BottomCTA } from '@/features/booking/components/bottom-cta';
import { StepHeader } from '@/features/booking/components/step-header';
import type { Category } from '@/features/booking/types/booking.types';

interface PageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: PageProps) {
  const { slug } = params;
  const router = useRouter();
  const { date, category, setCategory } = useBookingStore();
  const { categories } = useMockData();

  useEffect(() => {
    if (!date) router.replace(`/book/${slug}`);
  }, [date, slug, router]);

  function handleSelect(cat: Category) {
    setCategory(cat);
    router.push(`/book/${slug}/steps/services`);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <StepHeader title="Pilih Kategori" subtitle="Layanan apa yang kamu butuhkan?" />
      <div className="flex-1 overflow-y-auto">
        <CategoryGrid
          categories={categories}
          selectedCategory={category}
          onSelect={handleSelect}
        />
      </div>
      <BottomCTA
        label="Lanjut ke Layanan →"
        onClick={() => { if (category) router.push(`/book/${slug}/steps/services`); }}
        disabled={!category}
        showBack
        onBack={() => router.back()}
      />
    </div>
  );
}
