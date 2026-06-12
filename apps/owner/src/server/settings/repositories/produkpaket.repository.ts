import { db } from '../../db';
import { handleDbError } from '../lib/errors';
import type {
  AddOnProduct,
  ServiceBundle,
} from '@/features/dashboard/components/settings/types/services.types';

// ── DB row shapes ─────────────────────────────────────────────────────────────

interface AddOnRow {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

interface BundleRow {
  id: string;
  name: string;
  description: string;
  bundle_price: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  service_bundle_items: { service_id: string }[];
}

// ── Column constants ──────────────────────────────────────────────────────────

const ADDON_COLUMNS = 'id, name, description, price, image_url, is_active, sort_order';

// ── Row mappers ───────────────────────────────────────────────────────────────

function rowToAddon(row: AddOnRow): AddOnProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    imageUrl: row.image_url,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

function rowToBundle(row: BundleRow): ServiceBundle {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    serviceIds: (row.service_bundle_items ?? []).map((item) => item.service_id),
    bundlePrice: row.bundle_price,
    imageUrl: row.image_url,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

// ── Domain query ──────────────────────────────────────────────────────────────

export interface ProdukPaketDomainData {
  addons: AddOnProduct[];
  bundles: ServiceBundle[];
}

export async function getDomain(salonId: string): Promise<ProdukPaketDomainData> {
  const [addons, bundles] = await Promise.all([getAddOns(salonId), getBundles(salonId)]);
  return { addons, bundles };
}

// ── Add-on queries ────────────────────────────────────────────────────────────

export async function getAddOns(salonId: string): Promise<AddOnProduct[]> {
  const { data, error } = await db
    .from('add_on_products')
    .select(ADDON_COLUMNS)
    .eq('salon_id', salonId)
    .order('sort_order', { ascending: true });

  if (error) throw handleDbError(error);
  return (data as unknown as AddOnRow[]).map(rowToAddon);
}

// ── Add-on mutations ──────────────────────────────────────────────────────────

export interface CreateAddOnData {
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
}

export async function createAddOn(salonId: string, data: CreateAddOnData): Promise<AddOnProduct> {
  const { data: rows, error } = await db
    .from('add_on_products')
    .insert({
      salon_id: salonId,
      name: data.name,
      description: data.description,
      price: data.price,
      image_url: data.imageUrl,
      is_active: data.isActive,
      sort_order: 0,
    })
    .select(ADDON_COLUMNS);

  if (error) throw handleDbError(error);
  return rowToAddon((rows as unknown as AddOnRow[])[0]!);
}

export interface UpdateAddOnPatch {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export async function updateAddOn(
  salonId: string,
  id: string,
  patch: UpdateAddOnPatch
): Promise<void> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.price !== undefined) update.price = patch.price;
  if ('imageUrl' in patch) update.image_url = patch.imageUrl;
  if (patch.isActive !== undefined) update.is_active = patch.isActive;

  const { error } = await db
    .from('add_on_products')
    .update(update)
    .eq('id', id)
    .eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}

export async function deleteAddOn(salonId: string, id: string): Promise<void> {
  const { error } = await db.from('add_on_products').delete().eq('id', id).eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}

// ── Bundle queries ────────────────────────────────────────────────────────────

export async function getBundles(salonId: string): Promise<ServiceBundle[]> {
  const { data, error } = await db
    .from('service_bundles')
    .select(
      'id, name, description, bundle_price, image_url, is_active, sort_order, service_bundle_items(service_id)'
    )
    .eq('salon_id', salonId)
    .order('sort_order', { ascending: true });

  if (error) throw handleDbError(error);
  return (data as unknown as BundleRow[]).map(rowToBundle);
}

// ── Bundle mutations ──────────────────────────────────────────────────────────

export interface CreateBundleData {
  name: string;
  description: string;
  serviceIds: string[];
  bundlePrice: number;
  imageUrl: string | null;
  isActive: boolean;
}

export async function createBundle(
  salonId: string,
  data: CreateBundleData
): Promise<ServiceBundle> {
  // INSERT bundle row
  const { data: rows, error: bundleError } = await db
    .from('service_bundles')
    .insert({
      salon_id: salonId,
      name: data.name,
      description: data.description,
      bundle_price: data.bundlePrice,
      image_url: data.imageUrl,
      is_active: data.isActive,
      sort_order: 0,
    })
    .select('id, name, description, bundle_price, image_url, is_active, sort_order');

  if (bundleError) throw handleDbError(bundleError);
  const bundleRow = (rows as unknown as Omit<BundleRow, 'service_bundle_items'>[])[0]!;

  // INSERT bundle items
  const itemRows = data.serviceIds.map((serviceId) => ({
    bundle_id: bundleRow.id,
    service_id: serviceId,
  }));

  const { error: itemsError } = await db.from('service_bundle_items').insert(itemRows);
  if (itemsError) throw handleDbError(itemsError);

  return {
    id: bundleRow.id,
    name: bundleRow.name,
    description: bundleRow.description,
    serviceIds: data.serviceIds,
    bundlePrice: bundleRow.bundle_price,
    imageUrl: bundleRow.image_url,
    isActive: bundleRow.is_active,
    sortOrder: bundleRow.sort_order,
  };
}

export interface UpdateBundlePatch {
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
  patch: UpdateBundlePatch
): Promise<void> {
  // UPDATE bundle row
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.bundlePrice !== undefined) update.bundle_price = patch.bundlePrice;
  if ('imageUrl' in patch) update.image_url = patch.imageUrl;
  if (patch.isActive !== undefined) update.is_active = patch.isActive;

  const { error: updateError } = await db
    .from('service_bundles')
    .update(update)
    .eq('id', id)
    .eq('salon_id', salonId);

  if (updateError) throw handleDbError(updateError);

  // If serviceIds provided, replace bundle items (DELETE + INSERT)
  if (patch.serviceIds !== undefined) {
    const { error: deleteError } = await db
      .from('service_bundle_items')
      .delete()
      .eq('bundle_id', id);

    if (deleteError) throw handleDbError(deleteError);

    if (patch.serviceIds.length > 0) {
      const itemRows = patch.serviceIds.map((serviceId) => ({
        bundle_id: id,
        service_id: serviceId,
      }));
      const { error: insertError } = await db.from('service_bundle_items').insert(itemRows);
      if (insertError) throw handleDbError(insertError);
    }
  }
}

export async function deleteBundle(salonId: string, id: string): Promise<void> {
  // CASCADE on service_bundle_items handles item removal
  const { error } = await db.from('service_bundles').delete().eq('id', id).eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}

// ── Cross-salon validation helper ─────────────────────────────────────────────

/**
 * Returns the subset of serviceIds that actually belong to this salon.
 * Used by the service layer to detect cross-salon injection.
 */
export async function getValidServiceIds(salonId: string, serviceIds: string[]): Promise<string[]> {
  if (serviceIds.length === 0) return [];

  const { data, error } = await db
    .from('services')
    .select('id')
    .eq('salon_id', salonId)
    .in('id', serviceIds);

  if (error) throw handleDbError(error);
  return (data as { id: string }[]).map((row) => row.id);
}
