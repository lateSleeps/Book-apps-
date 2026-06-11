'use client';

import { useState, useCallback, useRef } from 'react';
import type { BaseSettingsController } from './types/BaseSettingsController';
import type {
  BrandProfile,
  BrandIdentity,
  BrandContact,
  BrandSocial,
  BrandLocation,
} from '@/features/dashboard/components/settings/types/brand.types';

// ── Mock initial data (replace with tRPC query when backend is ready) ─────────

const MOCK_PROFILE: BrandProfile = {
  identity: {
    salonName: 'Rara Beauty Salon',
    tagline: 'Kecantikan yang memancarkan kepercayaan diri',
    description:
      'Salon kecantikan premium dengan layanan lengkap untuk rambut, kuku, wajah, dan perawatan tubuh.',
  },
  media: {
    logoUrl: null,
    coverImageUrl: null,
  },
  contact: {
    phone: '+62 812-3456-7890',
    whatsapp: '6281234567890',
    email: '',
    website: '',
  },
  social: {
    instagram: '',
    tiktok: '',
    facebook: '',
  },
  location: {
    address: 'Jl. Sudirman No. 12, Jakarta',
    city: 'Jakarta',
    mapsUrl: '',
  },
};

// ── Controller ────────────────────────────────────────────────────────────────

export interface BrandProfileController extends BaseSettingsController {
  profile: BrandProfile;
  isDirty: boolean;
  isSaving: boolean;

  setIdentity: (patch: Partial<BrandIdentity>) => void;
  setContact: (patch: Partial<BrandContact>) => void;
  setSocial: (patch: Partial<BrandSocial>) => void;
  setLocation: (patch: Partial<BrandLocation>) => void;

  setLogo: (file: File, previewUrl: string) => void;
  removeLogo: () => void;
  setCoverImage: (file: File, previewUrl: string) => void;
  removeCoverImage: () => void;

  handleSave: () => Promise<void>;
  handleReset: () => void;
}

export function useBrandProfileController(): BrandProfileController {
  const [saved, setSaved] = useState<BrandProfile>(MOCK_PROFILE);
  const [profile, setProfile] = useState<BrandProfile>(MOCK_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const pendingFilesRef = useRef<{ logo?: File; cover?: File }>({});

  // Shallow comparison of nested profile to detect dirty state
  const isDirty = JSON.stringify(profile) !== JSON.stringify(saved);

  const setIdentity = useCallback((patch: Partial<BrandIdentity>) => {
    setProfile((p) => ({ ...p, identity: { ...p.identity, ...patch } }));
  }, []);

  const setContact = useCallback((patch: Partial<BrandContact>) => {
    setProfile((p) => ({ ...p, contact: { ...p.contact, ...patch } }));
  }, []);

  const setSocial = useCallback((patch: Partial<BrandSocial>) => {
    setProfile((p) => ({ ...p, social: { ...p.social, ...patch } }));
  }, []);

  const setLocation = useCallback((patch: Partial<BrandLocation>) => {
    setProfile((p) => ({ ...p, location: { ...p.location, ...patch } }));
  }, []);

  const setLogo = useCallback((_file: File, previewUrl: string) => {
    pendingFilesRef.current.logo = _file;
    setProfile((p) => ({ ...p, media: { ...p.media, logoUrl: previewUrl } }));
  }, []);

  const removeLogo = useCallback(() => {
    pendingFilesRef.current.logo = undefined;
    setProfile((p) => ({ ...p, media: { ...p.media, logoUrl: null } }));
  }, []);

  const setCoverImage = useCallback((_file: File, previewUrl: string) => {
    pendingFilesRef.current.cover = _file;
    setProfile((p) => ({ ...p, media: { ...p.media, coverImageUrl: previewUrl } }));
  }, []);

  const removeCoverImage = useCallback(() => {
    pendingFilesRef.current.cover = undefined;
    setProfile((p) => ({ ...p, media: { ...p.media, coverImageUrl: null } }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Future upload flow (do not implement here — use a service layer):
      // const logoUrl  = pendingFilesRef.current.logo
      //   ? await uploadAsset(pendingFilesRef.current.logo, { bucket: 'salon-assets', variant: 'logo' })
      //   : profile.media.logoUrl;
      // const coverUrl = pendingFilesRef.current.cover
      //   ? await uploadAsset(pendingFilesRef.current.cover, { bucket: 'salon-assets', variant: 'cover' })
      //   : profile.media.coverImageUrl;
      // await trpc.salons.update.mutateAsync({ ...profile, logoUrl, coverImageUrl: coverUrl });
      await new Promise<void>((resolve) => setTimeout(resolve, 800)); // mock delay
      pendingFilesRef.current = {};
      setSaved(profile);
    } finally {
      setIsSaving(false);
    }
  }, [profile]);

  const handleReset = useCallback(() => {
    pendingFilesRef.current = {};
    setProfile(saved);
  }, [saved]);

  return {
    profile,
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
