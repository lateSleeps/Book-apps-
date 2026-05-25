'use client';

import { cn } from '@/shared/lib/cn';
import type { Product } from '@/features/booking/types/booking.types';
import { formatRupiah } from '@/shared/lib/format';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function ProductCard({ product, quantity, onAdd, onRemove }: ProductCardProps) {
  return (
    <div className="flex items-center gap-s12 p-s16 bg-surface rounded-r16 border border-sep">
      <div className="text-3xl w-12 h-12 flex items-center justify-center bg-bg rounded-r12 flex-shrink-0">
        {product.imageEmoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-t14 font-semibold text-label truncate">{product.name}</p>
        <p className="text-t12 text-label2 truncate">{product.description}</p>
        <p className="text-t14 font-bold text-accent mt-s4">{formatRupiah(product.price)}</p>
      </div>
      <div className="flex items-center gap-s8 flex-shrink-0">
        <button
          onClick={onRemove}
          disabled={quantity === 0}
          className={cn(
            'w-8 h-8 rounded-full border text-t16 font-bold flex items-center justify-center transition-colors',
            quantity === 0
              ? 'border-sep text-label3 cursor-not-allowed'
              : 'border-accent text-accent hover:bg-accent-soft'
          )}
          aria-label={`Kurangi ${product.name}`}
        >
          −
        </button>
        <span className="text-t14 font-semibold text-label w-4 text-center">{quantity}</span>
        <button
          onClick={onAdd}
          className="w-8 h-8 rounded-full bg-accent text-white text-t16 font-bold flex items-center justify-center hover:bg-accent-dark transition-colors"
          aria-label={`Tambah ${product.name}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
