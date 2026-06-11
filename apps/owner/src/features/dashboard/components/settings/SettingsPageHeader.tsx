'use client';

import { Gear } from '@phosphor-icons/react';
import { useSettingsHeaderActions } from './layout/SettingsHeaderActionsContext';

export function SettingsPageHeader() {
  const actions = useSettingsHeaderActions();
  const disabled = !actions || actions.isSaving || !actions.isDirty;

  return (
    <div className="flex flex-col gap-s32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5">
        <Gear size={18} weight="duotone" className="text-tx-secondary" />
        <span className="text-ts-fn text-tx-secondary">Dashboard</span>
        <span className="text-ts-fn text-tx-muted">/</span>
        <span className="text-ts-fn font-medium text-tx-subtle">Pengaturan</span>
      </div>

      {/* Title + action buttons */}
      <div className="flex items-center justify-between gap-s16">
        <div className="flex flex-col gap-s4">
          <h1 className="m-0 text-ts-t1 font-bold text-tx-primary">Pengaturan</h1>
          <p className="m-0 text-ts-fn text-tx-secondary">
            Kelola profil, layanan, tim, dan konfigurasi salon Anda.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-s8">
          <button
            type="button"
            onClick={() => actions?.onCancel()}
            disabled={disabled}
            className="w-30 h-10 rounded-r12 border border-bd-card bg-bg-card px-s16 text-ts-fn font-medium text-ac-danger transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => actions?.onSave()}
            disabled={disabled}
            className="flex h-10 items-center justify-center rounded-r12 bg-tx-primary px-s16 text-ts-fn font-medium text-bg-card transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {actions?.isSaving ? 'Menyimpan...' : actions?.saveLabel ?? 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}
