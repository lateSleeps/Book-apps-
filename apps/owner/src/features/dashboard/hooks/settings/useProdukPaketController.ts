'use client';

import { useCallback } from 'react';
import type {
  AddOnProduct,
  ServiceBundle,
} from '@/features/dashboard/components/settings/types/services.types';
import { trpc } from '@/lib/trpc';

// ── Section interfaces ────────────────────────────────────────────────────────

export interface AddonsSection {
  data: AddOnProduct[];
  isLoading: boolean;
  isSaving: boolean;
  add: (draft: Omit<AddOnProduct, 'id' | 'sortOrder'>) => void;
  update: (id: string, patch: Partial<Omit<AddOnProduct, 'id' | 'sortOrder'>>) => void;
  remove: (id: string) => void;
}

export interface BundlesSection {
  data: ServiceBundle[];
  isLoading: boolean;
  isSaving: boolean;
  add: (draft: Omit<ServiceBundle, 'id' | 'sortOrder'>) => void;
  update: (id: string, patch: Partial<Omit<ServiceBundle, 'id' | 'sortOrder'>>) => void;
  remove: (id: string) => void;
}

// ── Public interface ──────────────────────────────────────────────────────────

export interface ProdukPaketController {
  addons: AddonsSection;
  bundles: BundlesSection;
}

// ── Placeholder data ──────────────────────────────────────────────────────────

const EMPTY_DOMAIN = {
  addons: [] as AddOnProduct[],
  bundles: [] as ServiceBundle[],
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useProdukPaketController(): ProdukPaketController {
  const utils = trpc.useUtils();

  // ── Domain query ──────────────────────────────────────────────────────────

  const { data: domainFromDb, isLoading: isDomainLoading } =
    trpc.settings.produkPaket.getDomain.useQuery(undefined, {
      staleTime: 30_000,
      placeholderData: EMPTY_DOMAIN,
    });

  // ── Invalidation ──────────────────────────────────────────────────────────

  const invalidateDomain = useCallback(() => {
    void utils.settings.produkPaket.getDomain.invalidate();
  }, [utils]);

  // ── Add-on mutations ──────────────────────────────────────────────────────

  const { mutateAsync: createAddonMutation, isLoading: isCreatingAddon } =
    trpc.settings.produkPaket.createAddOn.useMutation({ onSuccess: invalidateDomain });

  const { mutateAsync: updateAddonMutation, isLoading: isUpdatingAddon } =
    trpc.settings.produkPaket.updateAddOn.useMutation({ onSuccess: invalidateDomain });

  const { mutateAsync: deleteAddonMutation, isLoading: isDeletingAddon } =
    trpc.settings.produkPaket.deleteAddOn.useMutation({ onSuccess: invalidateDomain });

  // ── Bundle mutations ──────────────────────────────────────────────────────

  const { mutateAsync: createBundleMutation, isLoading: isCreatingBundle } =
    trpc.settings.produkPaket.createBundle.useMutation({ onSuccess: invalidateDomain });

  const { mutateAsync: updateBundleMutation, isLoading: isUpdatingBundle } =
    trpc.settings.produkPaket.updateBundle.useMutation({ onSuccess: invalidateDomain });

  const { mutateAsync: deleteBundleMutation, isLoading: isDeletingBundle } =
    trpc.settings.produkPaket.deleteBundle.useMutation({ onSuccess: invalidateDomain });

  // ── Add-on actions ────────────────────────────────────────────────────────

  const addAddon = useCallback(
    (draft: Omit<AddOnProduct, 'id' | 'sortOrder'>) => {
      void createAddonMutation({
        name: draft.name,
        description: draft.description,
        price: draft.price,
        imageUrl: draft.imageUrl,
        isActive: draft.isActive,
      });
    },
    [createAddonMutation]
  );

  const updateAddon = useCallback(
    (id: string, patch: Partial<Omit<AddOnProduct, 'id' | 'sortOrder'>>) => {
      void updateAddonMutation({ id, patch });
    },
    [updateAddonMutation]
  );

  const removeAddon = useCallback(
    (id: string) => {
      void deleteAddonMutation({ id });
    },
    [deleteAddonMutation]
  );

  // ── Bundle actions ────────────────────────────────────────────────────────

  const addBundle = useCallback(
    (draft: Omit<ServiceBundle, 'id' | 'sortOrder'>) => {
      void createBundleMutation({
        name: draft.name,
        description: draft.description,
        serviceIds: draft.serviceIds,
        bundlePrice: draft.bundlePrice,
        imageUrl: draft.imageUrl,
        isActive: draft.isActive,
      });
    },
    [createBundleMutation]
  );

  const updateBundle = useCallback(
    (id: string, patch: Partial<Omit<ServiceBundle, 'id' | 'sortOrder'>>) => {
      void updateBundleMutation({ id, patch });
    },
    [updateBundleMutation]
  );

  const removeBundle = useCallback(
    (id: string) => {
      void deleteBundleMutation({ id });
    },
    [deleteBundleMutation]
  );

  // ── Assemble ──────────────────────────────────────────────────────────────

  return {
    addons: {
      data: domainFromDb?.addons ?? EMPTY_DOMAIN.addons,
      isLoading: isDomainLoading,
      isSaving: isCreatingAddon || isUpdatingAddon || isDeletingAddon,
      add: addAddon,
      update: updateAddon,
      remove: removeAddon,
    },
    bundles: {
      data: domainFromDb?.bundles ?? EMPTY_DOMAIN.bundles,
      isLoading: isDomainLoading,
      isSaving: isCreatingBundle || isUpdatingBundle || isDeletingBundle,
      add: addBundle,
      update: updateBundle,
      remove: removeBundle,
    },
  };
}
