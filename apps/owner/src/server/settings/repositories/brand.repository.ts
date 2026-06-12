import { db } from '../../db';
import { handleDbError } from '../lib/errors';
import type {
  BrandContact,
  BrandIdentity,
  BrandLocation,
  BrandMedia,
  BrandProfile,
  BrandSocial,
} from '@/features/dashboard/components/settings/types/brand.types';

// ── DB row shape ──────────────────────────────────────────────────────────────
// Only the columns this domain reads and writes. Other salons columns are
// deliberately excluded — this repository is not a general-purpose salons repo.

interface SalonBrandRow {
  // identity
  name: string;
  tagline: string;
  description: string;
  // media
  logo_url: string | null;
  cover_image_url: string | null;
  // contact
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  // social
  instagram: string;
  tiktok: string;
  facebook: string;
  // location
  address: string;
  city: string;
  maps_url: string;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function rowToProfile(row: SalonBrandRow): BrandProfile {
  return {
    identity: {
      salonName: row.name,
      tagline: row.tagline ?? '',
      description: row.description ?? '',
    } satisfies BrandIdentity,
    media: {
      logoUrl: row.logo_url ?? null,
      coverImageUrl: row.cover_image_url ?? null,
    } satisfies BrandMedia,
    contact: {
      phone: row.phone ?? '',
      whatsapp: row.whatsapp ?? '',
      email: row.email ?? '',
      website: row.website ?? '',
    } satisfies BrandContact,
    social: {
      instagram: row.instagram ?? '',
      tiktok: row.tiktok ?? '',
      facebook: row.facebook ?? '',
    } satisfies BrandSocial,
    location: {
      address: row.address ?? '',
      city: row.city ?? '',
      mapsUrl: row.maps_url ?? '',
    } satisfies BrandLocation,
  };
}

function profileToRow(data: BrandProfile): Omit<SalonBrandRow, 'logo_url' | 'cover_image_url'> & {
  logo_url: string | null;
  cover_image_url: string | null;
} {
  return {
    name: data.identity.salonName,
    tagline: data.identity.tagline,
    description: data.identity.description,
    logo_url: data.media.logoUrl,
    cover_image_url: data.media.coverImageUrl,
    phone: data.contact.phone,
    whatsapp: data.contact.whatsapp,
    email: data.contact.email,
    website: data.contact.website,
    instagram: data.social.instagram,
    tiktok: data.social.tiktok,
    facebook: data.social.facebook,
    address: data.location.address,
    city: data.location.city,
    maps_url: data.location.mapsUrl,
  };
}

// ── Column list ───────────────────────────────────────────────────────────────
// Keep in sync with SalonBrandRow. Used by SELECT to avoid fetching all columns.

const BRAND_COLUMNS = [
  'name',
  'tagline',
  'description',
  'logo_url',
  'cover_image_url',
  'phone',
  'whatsapp',
  'email',
  'website',
  'instagram',
  'tiktok',
  'facebook',
  'address',
  'city',
  'maps_url',
].join(', ');

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetch brand profile columns from the salons row.
 * Returns null if the salon does not exist (should not happen in normal flow,
 * but guards against a stale salonId).
 */
export async function getBrandProfile(salonId: string): Promise<BrandProfile | null> {
  const { data, error } = await db.from('salons').select(BRAND_COLUMNS).eq('id', salonId).single();

  if (error) {
    // PGRST116 = no rows — not a crash, just no data
    if (error.code === 'PGRST116') return null;
    throw handleDbError(error);
  }

  return rowToProfile(data as unknown as SalonBrandRow);
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * UPDATE all brand columns on the salons row in one statement.
 * Includes logo_url and cover_image_url — callers must pass safe HTTPS or null
 * values; blob: URLs must be stripped before calling this.
 */
export async function updateBrandProfile(salonId: string, data: BrandProfile): Promise<void> {
  const row = profileToRow(data);

  const { error } = await db.from('salons').update(row).eq('id', salonId);

  if (error) throw handleDbError(error);
}

/**
 * Update only logo_url on the salons row.
 * Called after a successful logo upload (Sprint 4) or explicit removal.
 */
export async function updateLogoUrl(salonId: string, url: string | null): Promise<void> {
  const { error } = await db.from('salons').update({ logo_url: url }).eq('id', salonId);

  if (error) throw handleDbError(error);
}

/**
 * Update only cover_image_url on the salons row.
 * Called after a successful cover upload (Sprint 4) or explicit removal.
 */
export async function updateCoverUrl(salonId: string, url: string | null): Promise<void> {
  const { error } = await db.from('salons').update({ cover_image_url: url }).eq('id', salonId);

  if (error) throw handleDbError(error);
}
