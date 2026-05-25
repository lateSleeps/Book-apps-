'use client';

import type { Category } from '../../types/booking.types';
import { CategoryCard } from './CategoryCard';

export interface CategoryGridProps {
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (category: Category) => void;
}

/** 2×2 grid of category cards */
export function CategoryGrid({ categories, selectedCategory, onSelect }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-s8 px-s20">
      {categories.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          isSelected={selectedCategory?.id === cat.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
