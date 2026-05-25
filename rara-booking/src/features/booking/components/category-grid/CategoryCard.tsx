'use client';

import type { Category } from '../../types/booking.types';
import { cn } from '@/shared/lib/cn';

export interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onSelect: (category: Category) => void;
}

/** Pastel service category card with blob accent */
export function CategoryCard({ category, isSelected, onSelect }: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      aria-pressed={isSelected}
      aria-label={category.name}
      className={cn(
        'relative flex min-h-[96px] flex-col gap-s4 overflow-hidden rounded-r20 border-2 p-s20',
        'text-left transition-all duration-140 active:scale-[0.98]',
        category.color,
        isSelected ? 'border-accent' : 'border-transparent'
      )}
    >
      {/* Decorative blob */}
      <div
        className="absolute -right-4 -top-4 h-[72px] w-[72px] rounded-[40%_60%_70%_30%_/_30%_40%_70%_60%] opacity-85"
        style={{ backgroundColor: category.blobColor }}
        aria-hidden="true"
      />

      <span
        className={cn(
          'relative text-t20 font-bold tracking-[-0.3px]',
          isSelected ? 'text-accent-dark' : 'text-label'
        )}
      >
        {category.name}
      </span>
      <span className="relative text-t14 text-label2">{category.description}</span>
    </button>
  );
}
