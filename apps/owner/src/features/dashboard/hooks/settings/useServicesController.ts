'use client';

import { useCallback } from 'react';
import type { BaseSettingsController } from './types/BaseSettingsController';
import type {
  ServiceCategory,
  ServiceItem,
  ServiceQuestion,
  ServicesDomain,
} from '@/features/dashboard/components/settings/types/services.types';
import { trpc } from '@/lib/trpc';

// ── Helpers ───────────────────────────────────────────────────────────────────

function nextId(): string {
  // Optimistic IDs for React key stability during mutation in-flight.
  // The real ID is returned from the DB and replaces this after invalidation.
  return `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Empty fallback ────────────────────────────────────────────────────────────

const EMPTY_DOMAIN: ServicesDomain = { categories: [], services: [] };

// ── Public interface ──────────────────────────────────────────────────────────
// IMPORTANT: This interface is kept identical to the mock version so that
// ServicesPageClient, ServicesForm, ServicesAccordion, and all sheet components
// require zero changes.

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

  // Consultation Questions (stored as jsonb in service row)
  addQuestion: (draft: Omit<ServiceQuestion, 'id' | 'sortOrder'>) => void;
  updateQuestion: (questionId: string, patch: Partial<ServiceQuestion>) => void;
  deleteQuestion: (questionId: string) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useServicesController(): ServicesController {
  const utils = trpc.useUtils();

  // ── Server state ──────────────────────────────────────────────────────────
  const { data: domainFromDb } = trpc.settings.services.getServicesDomain.useQuery(undefined, {
    staleTime: 30_000,
    placeholderData: EMPTY_DOMAIN,
  });

  const domain = domainFromDb ?? EMPTY_DOMAIN;

  // ── Invalidation helper ───────────────────────────────────────────────────
  function invalidate() {
    void utils.settings.services.getServicesDomain.invalidate();
  }

  // ── Category mutations ────────────────────────────────────────────────────

  const { mutateAsync: createCategoryMutation, isLoading: isCreatingCategory } =
    trpc.settings.services.createCategory.useMutation({ onSuccess: invalidate });

  const { mutateAsync: updateCategoryMutation, isLoading: isUpdatingCategory } =
    trpc.settings.services.updateCategory.useMutation({ onSuccess: invalidate });

  const { mutateAsync: deleteCategoryMutation, isLoading: isDeletingCategory } =
    trpc.settings.services.deleteCategory.useMutation({ onSuccess: invalidate });

  // ── Service mutations ─────────────────────────────────────────────────────

  const { mutateAsync: createServiceMutation, isLoading: isCreatingService } =
    trpc.settings.services.createService.useMutation({ onSuccess: invalidate });

  const { mutateAsync: updateServiceMutation, isLoading: isUpdatingService } =
    trpc.settings.services.updateService.useMutation({ onSuccess: invalidate });

  const { mutateAsync: deleteServiceMutation, isLoading: isDeletingService } =
    trpc.settings.services.deleteService.useMutation({ onSuccess: invalidate });

  // ── isSaving ──────────────────────────────────────────────────────────────
  // Any in-flight mutation = saving.
  const isSaving =
    isCreatingCategory ||
    isUpdatingCategory ||
    isDeletingCategory ||
    isCreatingService ||
    isUpdatingService ||
    isDeletingService;

  // ── BaseSettingsController stubs ──────────────────────────────────────────
  // Mutations are immediate — no staged draft, so isDirty is always false.
  // handleSave is a no-op; header Save button stays disabled (intentional).
  // handleReset re-fetches from DB so the list reflects the latest server state.

  const isDirty = false;

  const handleSave = useCallback(() => {
    // No-op: all mutations fire immediately on each CRUD action.
  }, []);

  const handleReset = useCallback(() => {
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Category actions ──────────────────────────────────────────────────────

  const addCategory = useCallback(
    (draft: Omit<ServiceCategory, 'id' | 'sortOrder'>) => {
      void createCategoryMutation({
        name: draft.name,
        description: draft.description,
        iconName: draft.iconName,
        color: draft.color,
        blobColor: draft.blobColor,
        isActive: draft.isActive,
        sortOrder: domain.categories.length,
      });
    },
    [createCategoryMutation, domain.categories.length]
  );

  const updateCategory = useCallback(
    (id: string, patch: Partial<ServiceCategory>) => {
      void updateCategoryMutation({ id, patch });
    },
    [updateCategoryMutation]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      void deleteCategoryMutation({ id });
    },
    [deleteCategoryMutation]
  );

  // ── Service actions ───────────────────────────────────────────────────────

  const addService = useCallback(
    (draft: Omit<ServiceItem, 'id' | 'sortOrder' | 'questions'>) => {
      void createServiceMutation({
        categoryId: draft.categoryId,
        name: draft.name,
        description: draft.description,
        price: draft.price,
        duration: draft.duration,
        priceType: draft.priceType,
        serviceFlow: draft.serviceFlow,
        requiresSpecialist: draft.requiresSpecialist,
        isActive: draft.isActive,
        sortOrder: domain.services.length,
      });
    },
    [createServiceMutation, domain.services.length]
  );

  const updateService = useCallback(
    (id: string, patch: Partial<ServiceItem>) => {
      void updateServiceMutation({ id, patch });
    },
    [updateServiceMutation]
  );

  const deleteService = useCallback(
    (id: string) => {
      void deleteServiceMutation({ id });
    },
    [deleteServiceMutation]
  );

  // ── Question actions ──────────────────────────────────────────────────────
  // Questions are stored as jsonb in their owning service row.
  // All question operations find the service in domainFromDb, modify the
  // questions array, and call updateService with the updated questions list.

  const addQuestion = useCallback(
    (draft: Omit<ServiceQuestion, 'id' | 'sortOrder'>) => {
      const service = domain.services.find((s) => s.id === draft.serviceId);
      if (!service) return;

      const newQuestion: ServiceQuestion = {
        ...draft,
        id: nextId(),
        sortOrder: service.questions.length,
      };

      void updateServiceMutation({
        id: service.id,
        patch: { questions: [...service.questions, newQuestion] },
      });
    },
    [updateServiceMutation, domain.services]
  );

  const updateQuestion = useCallback(
    (questionId: string, patch: Partial<ServiceQuestion>) => {
      const service = domain.services.find((s) => s.questions.some((q) => q.id === questionId));
      if (!service) return;

      void updateServiceMutation({
        id: service.id,
        patch: {
          questions: service.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)),
        },
      });
    },
    [updateServiceMutation, domain.services]
  );

  const deleteQuestion = useCallback(
    (questionId: string) => {
      const service = domain.services.find((s) => s.questions.some((q) => q.id === questionId));
      if (!service) return;

      void updateServiceMutation({
        id: service.id,
        patch: {
          questions: service.questions.filter((q) => q.id !== questionId),
        },
      });
    },
    [updateServiceMutation, domain.services]
  );

  // ── Assemble ──────────────────────────────────────────────────────────────

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
