'use client';

import { useState, useCallback } from 'react';
import type { BaseSettingsController } from './types/BaseSettingsController';
import type {
  ServiceCategory,
  ServiceItem,
  ServiceQuestion,
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
      iconName: 'Scissors',
      isActive: true,
      sortOrder: 0,
    },
    {
      id: 'cat-2',
      name: 'Colour & Treatment',
      description: 'Colouring, keratin & hair spa',
      color: 'bg-c-blue',
      blobColor: '#b8d6f0',
      iconName: 'Drop',
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'cat-3',
      name: 'Face & Lashes',
      description: 'Facial, make up & lash extensions',
      color: 'bg-c-mint',
      blobColor: '#a8e6d4',
      iconName: 'Eye',
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'cat-4',
      name: 'Massage',
      description: 'Full body, reflexology & scrub',
      color: 'bg-c-yellow',
      blobColor: '#f5d98a',
      iconName: 'FlowerLotus',
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'cat-5',
      name: 'Nail',
      description: 'Manicure, pedicure & nail art',
      color: 'bg-c-lilac',
      blobColor: '#c8bef0',
      iconName: 'PaintBrush',
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
};

// ── Controller interface ──────────────────────────────────────────────────────

export interface ServicesController extends BaseSettingsController {
  domain: ServicesDomain;

  // Categories
  addCategory: (draft: Omit<ServiceCategory, 'id' | 'sortOrder'>) => void;
  updateCategory: (id: string, patch: Partial<ServiceCategory>) => void;
  deleteCategory: (id: string) => void;

  // Services
  addService: (draft: Omit<ServiceItem, 'id' | 'sortOrder' | 'questions'>) => void;
  updateService: (id: string, patch: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;

  // Consultation Questions
  addQuestion: (draft: Omit<ServiceQuestion, 'id' | 'sortOrder'>) => void;
  updateQuestion: (questionId: string, patch: Partial<ServiceQuestion>) => void;
  deleteQuestion: (questionId: string) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useServicesController(): ServicesController {
  const [domain, setDomain] = useState<ServicesDomain>(MOCK_DOMAIN);
  const [savedDomain, setSavedDomain] = useState<ServicesDomain>(MOCK_DOMAIN);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function nextId(prefix: string) {
    return `${prefix}-${Date.now()}`;
  }

  function setDirtyDomain(updater: (d: ServicesDomain) => ServicesDomain) {
    setDomain(updater);
    setIsDirty(true);
  }

  const handleSave = useCallback(() => {
    setIsSaving(true);
    // TODO: replace with tRPC mutation
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

  // ── Categories ────────────────────────────────────────────────────────────

  const addCategory = useCallback((draft: Omit<ServiceCategory, 'id' | 'sortOrder'>) => {
    setDirtyDomain((d) => ({
      ...d,
      categories: [
        ...d.categories,
        { ...draft, id: nextId('cat'), sortOrder: d.categories.length },
      ],
    }));
  }, []);

  const updateCategory = useCallback((id: string, patch: Partial<ServiceCategory>) => {
    setDirtyDomain((d) => ({
      ...d,
      categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setDirtyDomain((d) => ({
      ...d,
      categories: d.categories.filter((c) => c.id !== id),
      services: d.services.filter((s) => s.categoryId !== id),
    }));
  }, []);

  // ── Services ──────────────────────────────────────────────────────────────

  const addService = useCallback((draft: Omit<ServiceItem, 'id' | 'sortOrder' | 'questions'>) => {
    setDirtyDomain((d) => ({
      ...d,
      services: [
        ...d.services,
        { ...draft, id: nextId('svc'), sortOrder: d.services.length, questions: [] },
      ],
    }));
  }, []);

  const updateService = useCallback((id: string, patch: Partial<ServiceItem>) => {
    setDirtyDomain((d) => ({
      ...d,
      services: d.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const deleteService = useCallback((id: string) => {
    setDirtyDomain((d) => ({ ...d, services: d.services.filter((s) => s.id !== id) }));
  }, []);

  // ── Consultation Questions ────────────────────────────────────────────────

  const addQuestion = useCallback((draft: Omit<ServiceQuestion, 'id' | 'sortOrder'>) => {
    setDirtyDomain((d) => ({
      ...d,
      services: d.services.map((s) => {
        if (s.id !== draft.serviceId) return s;
        return {
          ...s,
          questions: [...s.questions, { ...draft, id: nextId('q'), sortOrder: s.questions.length }],
        };
      }),
    }));
  }, []);

  const updateQuestion = useCallback((questionId: string, patch: Partial<ServiceQuestion>) => {
    setDirtyDomain((d) => ({
      ...d,
      services: d.services.map((s) => ({
        ...s,
        questions: s.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)),
      })),
    }));
  }, []);

  const deleteQuestion = useCallback((questionId: string) => {
    setDirtyDomain((d) => ({
      ...d,
      services: d.services.map((s) => ({
        ...s,
        questions: s.questions.filter((q) => q.id !== questionId),
      })),
    }));
  }, []);

  return {
    isDirty,
    isSaving,
    handleSave,
    handleReset,
    domain,
    addCategory,
    updateCategory,
    deleteCategory,
    addService,
    updateService,
    deleteService,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  };
}
