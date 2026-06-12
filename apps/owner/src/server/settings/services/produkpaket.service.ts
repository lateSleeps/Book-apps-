import { ServiceError } from '../lib/errors';
import * as produkPaketRepo from '../repositories/produkpaket.repository';
import type {
  CreateAddOnData,
  CreateBundleData,
  ProdukPaketDomainData,
  UpdateAddOnPatch,
  UpdateBundlePatch,
} from '../repositories/produkpaket.repository';
import type {
  AddOnProduct,
  ServiceBundle,
} from '@/features/dashboard/components/settings/types/services.types';

// ── Re-exports for router ─────────────────────────────────────────────────────

export type { ProdukPaketDomainData, UpdateAddOnPatch, UpdateBundlePatch };

// ── Query ─────────────────────────────────────────────────────────────────────

export async function getDomain(salonId: string): Promise<ProdukPaketDomainData> {
  return produkPaketRepo.getDomain(salonId);
}

// ── Add-on mutations ──────────────────────────────────────────────────────────

export interface CreateAddOnInput {
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
}

export async function createAddOn(salonId: string, input: CreateAddOnInput): Promise<AddOnProduct> {
  if (!input.name.trim()) {
    throw new ServiceError('Nama produk tidak boleh kosong.', 'ADDON_NAME_EMPTY', 'name');
  }
  if (input.price < 0) {
    throw new ServiceError('Harga produk tidak boleh negatif.', 'ADDON_PRICE_NEGATIVE', 'price');
  }

  const data: CreateAddOnData = {
    name: input.name.trim(),
    description: input.description.trim(),
    price: input.price,
    // Strip blob: URLs — Supabase Storage upload is deferred to Sprint 4
    imageUrl: input.imageUrl?.startsWith('blob:') ? null : input.imageUrl ?? null,
    isActive: input.isActive,
  };

  return produkPaketRepo.createAddOn(salonId, data);
}

export interface UpdateAddOnInput {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export async function updateAddOn(
  salonId: string,
  id: string,
  input: UpdateAddOnInput
): Promise<void> {
  if (input.name !== undefined && !input.name.trim()) {
    throw new ServiceError('Nama produk tidak boleh kosong.', 'ADDON_NAME_EMPTY', 'name');
  }
  if (input.price !== undefined && input.price < 0) {
    throw new ServiceError('Harga produk tidak boleh negatif.', 'ADDON_PRICE_NEGATIVE', 'price');
  }

  const patch: UpdateAddOnPatch = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.price !== undefined) patch.price = input.price;
  if ('imageUrl' in input) {
    patch.imageUrl = input.imageUrl?.startsWith('blob:') ? null : input.imageUrl ?? null;
  }
  if (input.isActive !== undefined) patch.isActive = input.isActive;

  return produkPaketRepo.updateAddOn(salonId, id, patch);
}

export async function deleteAddOn(salonId: string, id: string): Promise<void> {
  return produkPaketRepo.deleteAddOn(salonId, id);
}

// ── Bundle mutations ──────────────────────────────────────────────────────────

export interface CreateBundleInput {
  name: string;
  description: string;
  serviceIds: string[];
  bundlePrice: number;
  imageUrl: string | null;
  isActive: boolean;
}

async function validateServiceIds(salonId: string, serviceIds: string[]): Promise<void> {
  const validIds = await produkPaketRepo.getValidServiceIds(salonId, serviceIds);
  if (validIds.length !== serviceIds.length) {
    throw new ServiceError(
      'Satu atau lebih layanan tidak ditemukan atau bukan milik salon ini.',
      'BUNDLE_INVALID_SERVICE_IDS',
      'serviceIds'
    );
  }
}

export async function createBundle(
  salonId: string,
  input: CreateBundleInput
): Promise<ServiceBundle> {
  if (!input.name.trim()) {
    throw new ServiceError('Nama paket tidak boleh kosong.', 'BUNDLE_NAME_EMPTY', 'name');
  }
  if (input.bundlePrice <= 0) {
    throw new ServiceError('Harga paket harus lebih dari 0.', 'BUNDLE_PRICE_ZERO', 'bundlePrice');
  }
  if (input.serviceIds.length < 2) {
    throw new ServiceError(
      'Paket bundle harus mengandung minimal 2 layanan.',
      'BUNDLE_MIN_SERVICES',
      'serviceIds'
    );
  }

  // Deduplicate before validation
  const uniqueIds = [...new Set(input.serviceIds)];
  await validateServiceIds(salonId, uniqueIds);

  const data: CreateBundleData = {
    name: input.name.trim(),
    description: input.description.trim(),
    serviceIds: uniqueIds,
    bundlePrice: input.bundlePrice,
    imageUrl: input.imageUrl?.startsWith('blob:') ? null : input.imageUrl ?? null,
    isActive: input.isActive,
  };

  return produkPaketRepo.createBundle(salonId, data);
}

export interface UpdateBundleInput {
  name?: string;
  description?: string;
  serviceIds?: string[];
  bundlePrice?: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export async function updateBundle(
  salonId: string,
  id: string,
  input: UpdateBundleInput
): Promise<void> {
  if (input.name !== undefined && !input.name.trim()) {
    throw new ServiceError('Nama paket tidak boleh kosong.', 'BUNDLE_NAME_EMPTY', 'name');
  }
  if (input.bundlePrice !== undefined && input.bundlePrice <= 0) {
    throw new ServiceError('Harga paket harus lebih dari 0.', 'BUNDLE_PRICE_ZERO', 'bundlePrice');
  }
  if (input.serviceIds !== undefined) {
    if (input.serviceIds.length < 2) {
      throw new ServiceError(
        'Paket bundle harus mengandung minimal 2 layanan.',
        'BUNDLE_MIN_SERVICES',
        'serviceIds'
      );
    }
    const uniqueIds = [...new Set(input.serviceIds)];
    await validateServiceIds(salonId, uniqueIds);
    input = { ...input, serviceIds: uniqueIds };
  }

  const patch: UpdateBundlePatch = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.serviceIds !== undefined) patch.serviceIds = input.serviceIds;
  if (input.bundlePrice !== undefined) patch.bundlePrice = input.bundlePrice;
  if ('imageUrl' in input) {
    patch.imageUrl = input.imageUrl?.startsWith('blob:') ? null : input.imageUrl ?? null;
  }
  if (input.isActive !== undefined) patch.isActive = input.isActive;

  return produkPaketRepo.updateBundle(salonId, id, patch);
}

export async function deleteBundle(salonId: string, id: string): Promise<void> {
  return produkPaketRepo.deleteBundle(salonId, id);
}
