'use client';

import { useState, useCallback } from 'react';
import type { BaseSettingsController } from './types/BaseSettingsController';
import type {
  AddOnProduct,
  ServiceBundle,
} from '@/features/dashboard/components/settings/types/services.types';

// ── Domain ────────────────────────────────────────────────────────────────────

export interface ProdukPaketDomain {
  addons: AddOnProduct[];
  bundles: ServiceBundle[];
}

// ── Mock seed data ────────────────────────────────────────────────────────────

const MOCK_DOMAIN: ProdukPaketDomain = {
  addons: [
    {
      id: 'prod-1',
      name: 'Makarizo Shampoo',
      description: 'Shampoo rambut sehat 200ml',
      price: 45_000,
      imageUrl: null,
      isActive: true,
      sortOrder: 0,
    },
    {
      id: 'prod-2',
      name: "L'Oreal Conditioner",
      description: 'Kondisioner nutrisi intensif 175ml',
      price: 55_000,
      imageUrl: null,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'prod-4',
      name: 'TRESemmé Serum',
      description: 'Serum rambut anti-frizz 50ml',
      price: 65_000,
      imageUrl: null,
      isActive: true,
      sortOrder: 2,
    },
  ],
  bundles: [
    {
      id: 'bundle-demo-1',
      name: 'Paket Cantik Lengkap',
      description: 'Haircut + Root Colour dengan harga spesial.',
      serviceIds: ['svc-1', 'svc-10'],
      bundlePrice: 320_000,
      imageUrl: null,
      isActive: true,
      sortOrder: 0,
    },
  ],
};

// ── Controller interface ──────────────────────────────────────────────────────

export interface ProdukPaketController extends BaseSettingsController {
  domain: ProdukPaketDomain;

  addAddon: (draft: Omit<AddOnProduct, 'id' | 'sortOrder'>) => void;
  updateAddon: (id: string, patch: Partial<AddOnProduct>) => void;
  deleteAddon: (id: string) => void;

  addBundle: (draft: Omit<ServiceBundle, 'id' | 'sortOrder'>) => void;
  updateBundle: (id: string, patch: Partial<ServiceBundle>) => void;
  deleteBundle: (id: string) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useProdukPaketController(): ProdukPaketController {
  const [domain, setDomain] = useState<ProdukPaketDomain>(MOCK_DOMAIN);
  const [savedDomain, setSavedDomain] = useState<ProdukPaketDomain>(MOCK_DOMAIN);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function nextId(prefix: string) {
    return `${prefix}-${Date.now()}`;
  }

  function setDirtyDomain(updater: (d: ProdukPaketDomain) => ProdukPaketDomain) {
    setDomain(updater);
    setIsDirty(true);
  }

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setSavedDomain(domain);
      setIsDirty(false);
      setIsSaving(false);
    }, 600);
  }, [domain]);

  const handleReset = useCallback(() => {
    setDomain(savedDomain);
    setIsDirty(false);
  }, [savedDomain]);

  // ── Add-ons ───────────────────────────────────────────────────────────────

  const addAddon = useCallback((draft: Omit<AddOnProduct, 'id' | 'sortOrder'>) => {
    setDirtyDomain((d) => ({
      ...d,
      addons: [...d.addons, { ...draft, id: nextId('prod'), sortOrder: d.addons.length }],
    }));
  }, []);

  const updateAddon = useCallback((id: string, patch: Partial<AddOnProduct>) => {
    setDirtyDomain((d) => ({
      ...d,
      addons: d.addons.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const deleteAddon = useCallback((id: string) => {
    setDirtyDomain((d) => ({ ...d, addons: d.addons.filter((a) => a.id !== id) }));
  }, []);

  // ── Bundles ───────────────────────────────────────────────────────────────

  const addBundle = useCallback((draft: Omit<ServiceBundle, 'id' | 'sortOrder'>) => {
    setDirtyDomain((d) => ({
      ...d,
      bundles: [...d.bundles, { ...draft, id: nextId('bundle'), sortOrder: d.bundles.length }],
    }));
  }, []);

  const updateBundle = useCallback((id: string, patch: Partial<ServiceBundle>) => {
    setDirtyDomain((d) => ({
      ...d,
      bundles: d.bundles.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }, []);

  const deleteBundle = useCallback((id: string) => {
    setDirtyDomain((d) => ({ ...d, bundles: d.bundles.filter((b) => b.id !== id) }));
  }, []);

  return {
    isDirty,
    isSaving,
    handleSave,
    handleReset,
    domain,
    addAddon,
    updateAddon,
    deleteAddon,
    addBundle,
    updateBundle,
    deleteBundle,
  };
}
