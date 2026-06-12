import { ServiceError } from '../lib/errors';
import * as servicesRepo from '../repositories/services.repository';
import type {
  ServiceCategory,
  ServiceItem,
} from '@/features/dashboard/components/settings/types/services.types';

// ── Validation ────────────────────────────────────────────────────────────────

function validateCategory(data: Omit<ServiceCategory, 'id' | 'sortOrder'>): void {
  if (!data.name.trim())
    throw new ServiceError('Nama kategori tidak boleh kosong.', 'CATEGORY_NAME_EMPTY', 'name');
}

function validateService(data: Omit<ServiceItem, 'id' | 'sortOrder' | 'questions'>): void {
  if (!data.name.trim())
    throw new ServiceError('Nama layanan tidak boleh kosong.', 'SERVICE_NAME_EMPTY', 'name');
  if (data.price < 0)
    throw new ServiceError('Harga tidak boleh negatif.', 'SERVICE_PRICE_NEGATIVE', 'price');
  if (data.duration <= 0)
    throw new ServiceError('Durasi harus lebih dari 0 menit.', 'SERVICE_DURATION_ZERO', 'duration');
}

// ── Domain ─────────────────────────────────────────────────────────────────────

export async function getServicesDomain(
  salonId: string
): Promise<{ categories: ServiceCategory[]; services: ServiceItem[] }> {
  const [categories, services] = await Promise.all([
    servicesRepo.getCategories(salonId),
    servicesRepo.getServices(salonId),
  ]);
  return { categories, services };
}

// ── Category operations ───────────────────────────────────────────────────────

export async function createCategory(
  salonId: string,
  draft: Omit<ServiceCategory, 'id' | 'sortOrder'>,
  sortOrder: number
): Promise<ServiceCategory> {
  validateCategory(draft);
  return servicesRepo.createCategory(salonId, draft, sortOrder);
}

export async function updateCategory(
  salonId: string,
  id: string,
  patch: Partial<Omit<ServiceCategory, 'id'>>
): Promise<void> {
  if (patch.name !== undefined && !patch.name.trim())
    throw new ServiceError('Nama kategori tidak boleh kosong.', 'CATEGORY_NAME_EMPTY', 'name');
  return servicesRepo.updateCategory(salonId, id, patch);
}

export async function deleteCategory(salonId: string, id: string): Promise<void> {
  return servicesRepo.deleteCategory(salonId, id);
}

// ── Service operations ────────────────────────────────────────────────────────

export async function createService(
  salonId: string,
  draft: Omit<ServiceItem, 'id' | 'sortOrder' | 'questions'>,
  sortOrder: number
): Promise<ServiceItem> {
  validateService(draft);
  return servicesRepo.createService(salonId, draft, sortOrder);
}

export async function updateService(
  salonId: string,
  id: string,
  patch: Partial<Omit<ServiceItem, 'id'>>
): Promise<void> {
  if (patch.name !== undefined && !patch.name.trim())
    throw new ServiceError('Nama layanan tidak boleh kosong.', 'SERVICE_NAME_EMPTY', 'name');
  if (patch.price !== undefined && patch.price < 0)
    throw new ServiceError('Harga tidak boleh negatif.', 'SERVICE_PRICE_NEGATIVE', 'price');
  if (patch.duration !== undefined && patch.duration <= 0)
    throw new ServiceError('Durasi harus lebih dari 0 menit.', 'SERVICE_DURATION_ZERO', 'duration');
  return servicesRepo.updateService(salonId, id, patch);
}

export async function deleteService(salonId: string, id: string): Promise<void> {
  return servicesRepo.deleteService(salonId, id);
}
