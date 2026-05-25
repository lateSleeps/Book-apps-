import type { Service, Category } from '@rara/types';
import { SALON_SERVICES } from './services';
import { SALON_CATEGORIES } from './categories';

/**
 * Get all active services
 */
export function getActiveServices(): Service[] {
  return SALON_SERVICES.filter((service) => service.isActive);
}

/**
 * Get services by category
 */
export function getServicesByCategory(categoryId: string): Service[] {
  return SALON_SERVICES.filter(
    (service) => service.categoryId === categoryId && service.isActive
  );
}

/**
 * Get all active categories
 */
export function getActiveCategories(): Category[] {
  return SALON_CATEGORIES.filter((category) => category.isActive);
}

/**
 * Get category by ID
 */
export function getCategoryById(categoryId: string): Category | undefined {
  return SALON_CATEGORIES.find((category) => category.id === categoryId);
}

/**
 * Get service by ID
 */
export function getServiceById(serviceId: string): Service | undefined {
  return SALON_SERVICES.find((service) => service.id === serviceId);
}

/**
 * Get service with category information
 */
export function getServiceWithCategory(serviceId: string) {
  const service = getServiceById(serviceId);
  if (!service) return null;

  const category = getCategoryById(service.categoryId);
  return {
    ...service,
    category,
  };
}

/**
 * Toggle service active status (for demo purposes)
 */
export function toggleServiceActive(serviceId: string): Service | undefined {
  const service = getServiceById(serviceId);
  if (service) {
    service.isActive = !service.isActive;
  }
  return service;
}

/**
 * Toggle category active status (for demo purposes)
 */
export function toggleCategoryActive(categoryId: string): Category | undefined {
  const category = getCategoryById(categoryId);
  if (category) {
    category.isActive = !category.isActive;
  }
  return category;
}

/**
 * Search services by name
 */
export function searchServices(query: string): Service[] {
  const lowerQuery = query.toLowerCase();
  return SALON_SERVICES.filter(
    (service) =>
      (service.name.toLowerCase().includes(lowerQuery) ||
        service.description.toLowerCase().includes(lowerQuery)) &&
      service.isActive
  );
}

/**
 * Get services sorted by price (ascending)
 */
export function getServicesSortedByPrice(
  direction: 'asc' | 'desc' = 'asc'
): Service[] {
  const sorted = [...SALON_SERVICES].sort((a, b) => {
    return direction === 'asc' ? a.price - b.price : b.price - a.price;
  });
  return sorted.filter((service) => service.isActive);
}

/**
 * Get services sorted by duration
 */
export function getServicesSortedByDuration(
  direction: 'asc' | 'desc' = 'asc'
): Service[] {
  const sorted = [...SALON_SERVICES].sort((a, b) => {
    return direction === 'asc'
      ? a.duration - b.duration
      : b.duration - a.duration;
  });
  return sorted.filter((service) => service.isActive);
}

/**
 * Get price range of services in a category
 */
export function getPriceRangeByCategory(categoryId: string) {
  const services = getServicesByCategory(categoryId);
  if (services.length === 0) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...services.map((s) => s.price)),
    max: Math.max(...services.map((s) => s.price)),
  };
}

/**
 * Get total count of active services
 */
export function getTotalActiveServices(): number {
  return getActiveServices().length;
}

/**
 * Get total count of active categories
 */
export function getTotalActiveCategories(): number {
  return getActiveCategories().length;
}
