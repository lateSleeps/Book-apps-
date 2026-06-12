'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BaseSettingsController } from './types/BaseSettingsController';
import type {
  BrandContact,
  BrandIdentity,
  BrandLocation,
  BrandProfile,
  BrandSocial,
} from '@/features/dashboard/components/settings/types/brand.types';
import { trpc } from '@/lib/trpc';

// ── Empty defaults ────────────────────────────────────────────────────────────
// Shown while the initial query is in-flight.

const EMPTY_BRAND_PROFILE: BrandProfile = {
  identity: { salonName: '', tagline: '', description: '' },
  media: { logoUrl: null, coverImageUrl: null },
  contact: { phone: '', whatsapp: '', email: '', website: '' },
  social: { instagram: '', tiktok: '', facebook: '' },
  location: { address: '', city: '', mapsUrl: '' },
};

// ── Public interface ──────────────────────────────────────────────────────────

export interface BrandProfileController extends BaseSettingsController {
  profile: BrandProfile;
  isDirty: boolean;
  isSaving: boolean;

  setIdentity: (patch: Partial<BrandIdentity>) => void;
  setContact: (patch: Partial<BrandContact>) => void;
  setSocial: (patch: Partial<BrandSocial>) => void;
  setLocation: (patch: Partial<BrandLocation>) => void;

  /**
   * Stage a new logo file.
   * previewUrl is a local blob: URL for immediate UI feedback.
   * The actual upload to Supabase Storage happens in Sprint 4.
   * Until then, save() will not persist the file — it keeps the existing DB value.
   */
  setLogo: (file: File, previewUrl: string) => void;
  removeLogo: () => void;

  /**
   * Stage a new cover image file.
   * Same Sprint 4 limitation as setLogo.
   */
  setCoverImage: (file: File, previewUrl: string) => void;
  removeCoverImage: () => void;

  handleSave: () => Promise<void>;
  handleReset: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns true if a URL is safe to persist to the DB:
 * - null (explicit removal) is always safe
 * - https:// URLs are safe
 * - blob: / data: URLs are NOT safe — they are local-only previews
 */
function isSafeMediaUrl(url: string | null): boolean {
  if (url === null) return true;
  return url.startsWith('https://');
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBrandProfileController(): BrandProfileController {
  const utils = trpc.useUtils();

  // ── Server state ──────────────────────────────────────────────────────────
  const { data: savedProfile } = trpc.settings.brand.getBrandProfile.useQuery(undefined, {
    staleTime: 30_000,
  });

  const { mutateAsync: upsertBrand, isLoading: isSaving } =
    trpc.settings.brand.updateBrandProfile.useMutation({
      onSuccess: () => {
        void utils.settings.brand.getBrandProfile.invalidate();
      },
    });

  // ── Draft state ───────────────────────────────────────────────────────────
  // Initialized from the query result on first load. Subsequent query
  // invalidations (after save) do NOT overwrite an active draft — the user
  // stays in the form with their current edits.

  const [draft, setDraft] = useState<BrandProfile>(EMPTY_BRAND_PROFILE);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (savedProfile && !hasInitialized.current) {
      hasInitialized.current = true;
      setDraft(savedProfile);
    }
  }, [savedProfile]);

  // ── Pending file uploads (Sprint 4) ──────────────────────────────────────
  // Stored here so Sprint 4 can read them and issue presigned URL requests.
  // Not persisted to DB in Sprint 1.2.
  const pendingFilesRef = useRef<{ logo?: File; cover?: File }>({});

  // ── Dirty check ───────────────────────────────────────────────────────────
  const isDirty =
    hasInitialized.current &&
    JSON.stringify(draft) !== JSON.stringify(savedProfile ?? EMPTY_BRAND_PROFILE);

  // ── Field setters ─────────────────────────────────────────────────────────

  const setIdentity = useCallback((patch: Partial<BrandIdentity>) => {
    setDraft((p) => ({ ...p, identity: { ...p.identity, ...patch } }));
  }, []);

  const setContact = useCallback((patch: Partial<BrandContact>) => {
    setDraft((p) => ({ ...p, contact: { ...p.contact, ...patch } }));
  }, []);

  const setSocial = useCallback((patch: Partial<BrandSocial>) => {
    setDraft((p) => ({ ...p, social: { ...p.social, ...patch } }));
  }, []);

  const setLocation = useCallback((patch: Partial<BrandLocation>) => {
    setDraft((p) => ({ ...p, location: { ...p.location, ...patch } }));
  }, []);

  const setLogo = useCallback((_file: File, previewUrl: string) => {
    pendingFilesRef.current.logo = _file;
    setDraft((p) => ({ ...p, media: { ...p.media, logoUrl: previewUrl } }));
  }, []);

  const removeLogo = useCallback(() => {
    pendingFilesRef.current.logo = undefined;
    // null = explicit removal — persisted to DB on save
    setDraft((p) => ({ ...p, media: { ...p.media, logoUrl: null } }));
  }, []);

  const setCoverImage = useCallback((_file: File, previewUrl: string) => {
    pendingFilesRef.current.cover = _file;
    setDraft((p) => ({ ...p, media: { ...p.media, coverImageUrl: previewUrl } }));
  }, []);

  const removeCoverImage = useCallback(() => {
    pendingFilesRef.current.cover = undefined;
    setDraft((p) => ({ ...p, media: { ...p.media, coverImageUrl: null } }));
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    const dbMedia = savedProfile?.media ?? { logoUrl: null, coverImageUrl: null };

    // Blob URLs (pending local file selections) cannot be persisted to the DB.
    // - null: user explicitly removed → persist null
    // - https://: already a real URL → persist it
    // - blob:/data:: pending upload → keep the current DB value unchanged
    const safeLogoUrl =
      draft.media.logoUrl === null
        ? null
        : isSafeMediaUrl(draft.media.logoUrl)
          ? draft.media.logoUrl
          : dbMedia.logoUrl;

    const safeCoverUrl =
      draft.media.coverImageUrl === null
        ? null
        : isSafeMediaUrl(draft.media.coverImageUrl)
          ? draft.media.coverImageUrl
          : dbMedia.coverImageUrl;

    await upsertBrand({
      ...draft,
      media: { logoUrl: safeLogoUrl, coverImageUrl: safeCoverUrl },
    });

    // Clear pending files — upload them in Sprint 4
    pendingFilesRef.current = {};
  }, [draft, savedProfile, upsertBrand]);

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    if (savedProfile) setDraft(savedProfile);
    pendingFilesRef.current = {};
  }, [savedProfile]);

  // ── Assemble ──────────────────────────────────────────────────────────────

  return {
    profile: draft,
    isDirty,
    isSaving,
    setIdentity,
    setContact,
    setSocial,
    setLocation,
    setLogo,
    removeLogo,
    setCoverImage,
    removeCoverImage,
    handleSave,
    handleReset,
  };
}
