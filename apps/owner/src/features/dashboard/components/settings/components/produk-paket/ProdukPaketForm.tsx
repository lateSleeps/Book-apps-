'use client';

import { useCallback, useState } from 'react';
import { AddOnsSection } from '../services/sections/AddOnsSection';
import { BundlesSection } from '../services/sections/BundlesSection';
import { AddonForm } from './forms/AddonForm';
import type { AddonFormDraft } from './forms/AddonForm';
import { BundleForm } from './forms/BundleForm';
import type { BundleFormDraft } from './forms/BundleForm';
import type { ConfirmPending } from '@/features/dashboard/components/settings/components/shared';
import { ConfirmDialog } from '@/features/dashboard/components/settings/components/shared';
import { SettingsSideSheet } from '@/features/dashboard/components/settings/layout';
import type {
  AddOnProduct,
  ServiceBundle,
  ServiceItem,
} from '@/features/dashboard/components/settings/types/services.types';
import type { ProdukPaketController } from '@/features/dashboard/hooks/settings/useProdukPaketController';

// ── State types ───────────────────────────────────────────────────────────────

type SheetState =
  | { mode: 'add-addon' }
  | { mode: 'edit-addon'; addon: AddOnProduct }
  | { mode: 'add-bundle' }
  | { mode: 'edit-bundle'; bundle: ServiceBundle };

type Draft = { kind: 'addon'; value: AddonFormDraft } | { kind: 'bundle'; value: BundleFormDraft };

// ── Component ─────────────────────────────────────────────────────────────────

interface ProdukPaketFormProps {
  ctrl: ProdukPaketController;
  activeTab: string;
  services: ServiceItem[];
}

export function ProdukPaketForm({ ctrl, activeTab, services }: ProdukPaketFormProps) {
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirm, setConfirm] = useState<ConfirmPending | null>(null);

  function closeSheet() {
    setSheet(null);
    setDraft(null);
  }

  function handleSave() {
    if (!draft || !sheet) return;
    switch (sheet.mode) {
      case 'add-addon':
        if (draft.kind === 'addon') ctrl.addAddon(draft.value);
        break;
      case 'edit-addon':
        if (draft.kind === 'addon') ctrl.updateAddon(sheet.addon.id, draft.value);
        break;
      case 'add-bundle':
        if (draft.kind === 'bundle') ctrl.addBundle(draft.value);
        break;
      case 'edit-bundle':
        if (draft.kind === 'bundle') ctrl.updateBundle(sheet.bundle.id, draft.value);
        break;
    }
    closeSheet();
  }

  const onAddonChange = useCallback(
    (d: AddonFormDraft | null) => setDraft(d ? { kind: 'addon', value: d } : null),
    []
  );
  const onBundleChange = useCallback(
    (d: BundleFormDraft | null) => setDraft(d ? { kind: 'bundle', value: d } : null),
    []
  );

  // ── Delete handlers ───────────────────────────────────────────────────────

  function handleDeleteAddon(addon: AddOnProduct) {
    setConfirm({
      title: 'Hapus produk add-on?',
      message: `Produk "${addon.name}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: 'Hapus Permanen',
      variant: 'danger',
      onConfirm: () => {
        ctrl.deleteAddon(addon.id);
        setConfirm(null);
      },
    });
  }

  function handleDeleteBundle(bundle: ServiceBundle) {
    setConfirm({
      title: 'Hapus bundle?',
      message: `Bundle "${bundle.name}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: 'Hapus Permanen',
      variant: 'danger',
      onConfirm: () => {
        ctrl.deleteBundle(bundle.id);
        setConfirm(null);
      },
    });
  }

  // ── Sheet title ───────────────────────────────────────────────────────────

  const title = (() => {
    if (!sheet) return '';
    if (sheet.mode === 'add-addon') return 'Tambah Produk Add-on';
    if (sheet.mode === 'edit-addon') return `Edit ${sheet.addon.name}`;
    if (sheet.mode === 'add-bundle') return 'Buat Paket Bundle';
    if (sheet.mode === 'edit-bundle') return `Edit ${sheet.bundle.name}`;
    return '';
  })();

  return (
    <>
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          variant={confirm.variant}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {sheet && (
        <SettingsSideSheet
          title={title}
          onClose={closeSheet}
          onSave={handleSave}
          canSave={draft !== null}
        >
          {sheet.mode === 'add-addon' && <AddonForm onChange={onAddonChange} />}
          {sheet.mode === 'edit-addon' && (
            <AddonForm initial={sheet.addon} onChange={onAddonChange} />
          )}
          {sheet.mode === 'add-bundle' && (
            <BundleForm services={services} onChange={onBundleChange} />
          )}
          {sheet.mode === 'edit-bundle' && (
            <BundleForm initial={sheet.bundle} services={services} onChange={onBundleChange} />
          )}
        </SettingsSideSheet>
      )}

      {activeTab === 'addons' && (
        <AddOnsSection
          addons={ctrl.domain.addons}
          onAdd={() => {
            setDraft(null);
            setSheet({ mode: 'add-addon' });
          }}
          onEdit={(addon) => {
            setDraft(null);
            setSheet({ mode: 'edit-addon', addon });
          }}
          onDelete={handleDeleteAddon}
        />
      )}

      {activeTab === 'bundles' && (
        <BundlesSection
          bundles={ctrl.domain.bundles}
          services={services}
          onAdd={() => {
            setDraft(null);
            setSheet({ mode: 'add-bundle' });
          }}
          onEdit={(bundle) => {
            setDraft(null);
            setSheet({ mode: 'edit-bundle', bundle });
          }}
          onDelete={handleDeleteBundle}
        />
      )}
    </>
  );
}
