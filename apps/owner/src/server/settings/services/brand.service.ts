import { ServiceError } from '../lib/errors';
import * as brandRepo from '../repositories/brand.repository';
import type { BrandProfile } from '@/features/dashboard/components/settings/types/brand.types';

// ── Fallback ──────────────────────────────────────────────────────────────────
// Used when the salon row exists but has no brand data yet (new salon).

const EMPTY_BRAND_PROFILE: BrandProfile = {
  identity: { salonName: '', tagline: '', description: '' },
  media: { logoUrl: null, coverImageUrl: null },
  contact: { phone: '', whatsapp: '', email: '', website: '' },
  social: { instagram: '', tiktok: '', facebook: '' },
  location: { address: '', city: '', mapsUrl: '' },
};

// ── Validators ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateBrandProfile(data: BrandProfile): void {
  if (!data.identity.salonName.trim()) {
    throw new ServiceError('Nama salon tidak boleh kosong.', 'SALON_NAME_EMPTY', 'salonName');
  }

  if (data.contact.email && !EMAIL_RE.test(data.contact.email)) {
    throw new ServiceError('Format email tidak valid.', 'EMAIL_INVALID', 'email');
  }

  if (data.contact.website && !data.contact.website.startsWith('https://')) {
    throw new ServiceError('Website harus diawali dengan https://.', 'WEBSITE_INVALID', 'website');
  }

  if (data.location.mapsUrl && !data.location.mapsUrl.startsWith('https://')) {
    throw new ServiceError(
      'Google Maps URL harus diawali dengan https://.',
      'MAPS_URL_INVALID',
      'mapsUrl'
    );
  }
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetch brand profile for a salon.
 * Returns EMPTY_BRAND_PROFILE when the salon exists but no brand data has been
 * set (migration ran, columns exist but are empty defaults).
 */
export async function getBrandProfile(salonId: string): Promise<BrandProfile> {
  const profile = await brandRepo.getBrandProfile(salonId);
  if (profile === null) return EMPTY_BRAND_PROFILE;
  return profile;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Validate and persist all brand profile fields.
 * Media URLs (logoUrl, coverImageUrl) must already be HTTPS or null — the
 * controller strips blob: URLs before calling this.
 */
export async function updateBrandProfile(salonId: string, data: BrandProfile): Promise<void> {
  validateBrandProfile(data);
  await brandRepo.updateBrandProfile(salonId, data);
}

/**
 * Update only the logo URL (called post-upload in Sprint 4, or on removal).
 */
export async function updateLogoUrl(salonId: string, url: string | null): Promise<void> {
  await brandRepo.updateLogoUrl(salonId, url);
}

/**
 * Update only the cover image URL (called post-upload in Sprint 4, or on removal).
 */
export async function updateCoverUrl(salonId: string, url: string | null): Promise<void> {
  await brandRepo.updateCoverUrl(salonId, url);
}
