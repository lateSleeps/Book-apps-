import type { Service, Category } from './booking.types';

/** Service filtered by category */
export interface ServicesByCategory {
  category: Category;
  services: Service[];
}

/** Service display info */
export interface ServiceDisplayInfo {
  id: string;
  name: string;
  description: string;
  priceFormatted: string;
  durationFormatted: string;
  isSelected: boolean;
}
