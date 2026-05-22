'use client';

import type { Product } from '@/features/booking/types/booking.types';
import { useBookingStore } from '@/features/booking/hooks/use-booking-store';
import { ProductCard } from './ProductCard';

interface ProductUpsellProps {
  products: Product[];
}

export function ProductUpsell({ products }: ProductUpsellProps) {
  const { addons, addAddon, removeAddon } = useBookingStore();

  function getQuantity(productId: string): number {
    return addons.find((a) => a.id === productId)?.quantity ?? 0;
  }

  return (
    <div className="flex flex-col gap-s8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          quantity={getQuantity(product.id)}
          onAdd={() => addAddon(product)}
          onRemove={() => removeAddon(product.id)}
        />
      ))}
    </div>
  );
}
