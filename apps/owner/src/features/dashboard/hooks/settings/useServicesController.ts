'use client';

import { useState, useCallback } from 'react';
import type {
  ServiceCategory,
  ServiceItem,
  AddOnProduct,
  ServiceBundle,
  ServicesDomain,
} from '@/features/dashboard/components/settings/types/services.types';

// ── Mock seed data ────────────────────────────────────────────────────────────
// Replace with tRPC query: trpc.services.getBySalon.useQuery({ salonId })

const MOCK_DOMAIN: ServicesDomain = {
  categories: [
    {
      id: 'cat-1',
      name: 'Hair',
      description: 'Haircut, wash, styling & braiding',
      color: 'bg-c-peach',
      blobColor: '#f5c4ab',
      icon: '✂️',
      isActive: true,
      sortOrder: 0,
    },
    {
      id: 'cat-2',
      name: 'Colour & Treatment',
      description: 'Colouring, keratin & hair spa',
      color: 'bg-c-blue',
      blobColor: '#b8d6f0',
      icon: '🎨',
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'cat-3',
      name: 'Face & Lashes',
      description: 'Facial, make up & lash extensions',
      color: 'bg-c-mint',
      blobColor: '#a8e6d4',
      icon: '💆',
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'cat-4',
      name: 'Massage',
      description: 'Full body, reflexology & scrub',
      color: 'bg-c-yellow',
      blobColor: '#f5d98a',
      icon: '🪷',
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'cat-5',
      name: 'Nail',
      description: 'Manicure, pedicure & nail art',
      color: 'bg-c-lilac',
      blobColor: '#c8bef0',
      icon: '💅',
      isActive: true,
      sortOrder: 4,
    },
  ],
  services: [
    {
      id: 'svc-1',
      categoryId: 'cat-1',
      name: 'Ladies Haircut + Wash',
      description: 'Potongan presisi dengan keramas produk premium.',
      price: 180_000,
      duration: 45,
      priceType: 'fixed',
      serviceFlow: 'STYLING_HAIR',
      requiresSpecialist: false,
      isActive: true,
      sortOrder: 0,
      questions: [],
    },
    {
      id: 'svc-2',
      categoryId: 'cat-1',
      name: 'Men Haircut + Wash + Dry',
      description: 'Potongan rapi modern, keramas, dan blow-dry.',
      price: 150_000,
      duration: 40,
      priceType: 'fixed',
      serviceFlow: 'STYLING_HAIR',
      requiresSpecialist: false,
      isActive: true,
      sortOrder: 1,
      questions: [],
    },
    {
      id: 'svc-10',
      categoryId: 'cat-2',
      name: 'Root Colour',
      description: 'Tutup akar rambut dengan warna merata dan segar.',
      price: 300_000,
      duration: 60,
      priceType: 'starting_from',
      serviceFlow: 'STYLING_COLOUR',
      requiresSpecialist: true,
      isActive: true,
      sortOrder: 0,
      questions: [],
    },
    {
      id: 'svc-13',
      categoryId: 'cat-2',
      name: 'Full Highlight',
      description: 'Highlight foil menyeluruh untuk dimensi warna.',
      price: 650_000,
      duration: 120,
      priceType: 'starting_from',
      serviceFlow: 'STYLING_COLOUR',
      requiresSpecialist: true,
      isActive: true,
      sortOrder: 1,
      questions: [],
    },
  ],
  addons: [
    {
      id: 'prod-1',
      name: 'Makarizo Shampoo',
      description: 'Shampoo rambut sehat 200ml',
      price: 45_000,
      imageEmoji: '🧴',
      imageUrl: null,
      isActive: true,
      sortOrder: 0,
    },
    {
      id: 'prod-2',
      name: "L'Oreal Conditioner",
      description: 'Kondisioner nutrisi intensif 175ml',
      price: 55_000,
      imageEmoji: '💧',
      imageUrl: null,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'prod-4',
      name: 'TRESemmé Serum',
      description: 'Serum rambut anti-frizz 50ml',
      price: 65_000,
      imageEmoji: '✨',
      imageUrl: null,
      isActive: true,
      sortOrder: 2,
    },
  ],
  bundles: [],
};

// ── Controller interface ──────────────────────────────────────────────────────

export interface ServicesController {
  domain: ServicesDomain;

  // Categories
  addCategory: (draft: Omit<ServiceCategory, 'id' | 'sortOrder'>) => void;
  updateCategory: (id: string, patch: Partial<ServiceCategory>) => void;
  removeCategory: (id: string) => void;

  // Services
  addService: (draft: Omit<ServiceItem, 'id' | 'sortOrder' | 'questions'>) => void;
  updateService: (id: string, patch: Partial<ServiceItem>) => void;
  archiveService: (id: string) => void;

  // Add-ons
  addAddon: (draft: Omit<AddOnProduct, 'id' | 'sortOrder'>) => void;
  updateAddon: (id: string, patch: Partial<AddOnProduct>) => void;
  removeAddon: (id: string) => void;

  // Bundles
  addBundle: (draft: Omit<ServiceBundle, 'id'>) => void;
  updateBundle: (id: string, patch: Partial<ServiceBundle>) => void;
  removeBundle: (id: string) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useServicesController(): ServicesController {
  const [domain, setDomain] = useState<ServicesDomain>(MOCK_DOMAIN);

  function nextId(prefix: string) {
    return `${prefix}-${Date.now()}`;
  }

  const addCategory = useCallback((draft: Omit<ServiceCategory, 'id' | 'sortOrder'>) => {
    setDomain((d) => ({
      ...d,
      categories: [
        ...d.categories,
        { ...draft, id: nextId('cat'), sortOrder: d.categories.length },
      ],
    }));
  }, []);

  const updateCategory = useCallback((id: string, patch: Partial<ServiceCategory>) => {
    setDomain((d) => ({
      ...d,
      categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const removeCategory = useCallback((id: string) => {
    setDomain((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) }));
  }, []);

  const addService = useCallback((draft: Omit<ServiceItem, 'id' | 'sortOrder' | 'questions'>) => {
    setDomain((d) => ({
      ...d,
      services: [
        ...d.services,
        { ...draft, id: nextId('svc'), sortOrder: d.services.length, questions: [] },
      ],
    }));
  }, []);

  const updateService = useCallback((id: string, patch: Partial<ServiceItem>) => {
    setDomain((d) => ({
      ...d,
      services: d.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const archiveService = useCallback((id: string) => {
    setDomain((d) => ({
      ...d,
      services: d.services.map((s) => (s.id === id ? { ...s, isActive: false } : s)),
    }));
  }, []);

  const addAddon = useCallback((draft: Omit<AddOnProduct, 'id' | 'sortOrder'>) => {
    setDomain((d) => ({
      ...d,
      addons: [...d.addons, { ...draft, id: nextId('prod'), sortOrder: d.addons.length }],
    }));
  }, []);

  const updateAddon = useCallback((id: string, patch: Partial<AddOnProduct>) => {
    setDomain((d) => ({
      ...d,
      addons: d.addons.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const removeAddon = useCallback((id: string) => {
    setDomain((d) => ({ ...d, addons: d.addons.filter((a) => a.id !== id) }));
  }, []);

  const addBundle = useCallback((draft: Omit<ServiceBundle, 'id'>) => {
    setDomain((d) => ({
      ...d,
      bundles: [...d.bundles, { ...draft, id: nextId('bundle') }],
    }));
  }, []);

  const updateBundle = useCallback((id: string, patch: Partial<ServiceBundle>) => {
    setDomain((d) => ({
      ...d,
      bundles: d.bundles.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }, []);

  const removeBundle = useCallback((id: string) => {
    setDomain((d) => ({ ...d, bundles: d.bundles.filter((b) => b.id !== id) }));
  }, []);

  return {
    domain,
    addCategory,
    updateCategory,
    removeCategory,
    addService,
    updateService,
    archiveService,
    addAddon,
    updateAddon,
    removeAddon,
    addBundle,
    updateBundle,
    removeBundle,
  };
}
