'use client';

import type { AddOn } from '../../types/dashboard.types';
import { formatRupiah } from '@/shared/lib/format';

interface AddOnSectionProps {
  addOns: AddOn[];
}

export function AddOnSection({ addOns }: AddOnSectionProps) {
  if (addOns.length === 0) return null;

  return (
    <section className="border-b border-bd-detail px-s20 py-s16">
      <p className="mb-s12 text-ts-cap2 font-semibold uppercase tracking-[0.06em] text-tx-secondary">
        Add-on
      </p>

      <ul className="flex flex-col gap-s8">
        {addOns.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-s8">
            <span className="text-ts-fn text-tx-primary">
              {item.name}
              {item.quantity != null && item.quantity > 1 && (
                <span className="ml-1 text-tx-secondary">×{item.quantity}</span>
              )}
            </span>
            <span className="shrink-0 text-ts-fn font-medium text-tx-subtle">
              {formatRupiah(item.price * (item.quantity ?? 1))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
