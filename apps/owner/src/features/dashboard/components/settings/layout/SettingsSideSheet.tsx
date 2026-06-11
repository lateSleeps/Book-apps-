'use client';

import { X } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

interface SettingsSideSheetProps {
  title: string;
  description?: string;
  onClose: () => void;
  onSave: () => void;
  canSave: boolean;
  isSaving?: boolean;
  saveLabel?: string;
  children: ReactNode;
}

export function SettingsSideSheet({
  title,
  description,
  onClose,
  onSave,
  canSave,
  isSaving = false,
  saveLabel = 'Simpan',
  children,
}: SettingsSideSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
      {/* Backdrop — same as VisitDetailSidebar */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" onClick={onClose} />

      {/* Side panel — desktop floating, mobile full screen */}
      <div className="relative z-10 flex h-full w-full max-w-lg animate-sIn flex-col overflow-hidden rounded-r20 bg-bg-card shadow-drawer max-sm:rounded-none max-sm:p-0 sm:h-full">
        {/* Header — matches VisitDetailSidebar right panel header */}
        <div className="flex shrink-0 items-center justify-between border-b border-bd-detail px-s20 py-s20">
          <div className="flex min-w-0 flex-col gap-s4">
            <p className="m-0 truncate text-ts-sub font-bold text-tx-primary">{title}</p>
            {description && (
              <p className="m-0 truncate text-ts-cap1 text-tx-secondary">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="ml-s12 flex h-8 w-8 shrink-0 items-center justify-center rounded-r8 text-tx-secondary transition-colors hover:bg-bg-hover"
          >
            <X size={16} weight="duotone" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-s20 py-s20">{children}</div>

        {/* Sticky footer */}
        <div className="flex shrink-0 items-center justify-end gap-s8 border-t border-bd-detail px-s20 py-s16">
          <button
            onClick={onClose}
            className="rounded-r10 px-s16 py-s8 text-ts-fn font-medium text-tx-secondary transition-colors hover:bg-bg-hover"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={!canSave || isSaving}
            className="rounded-r10 bg-tx-primary px-s16 py-s8 text-ts-fn font-semibold text-bg-card transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isSaving ? 'Menyimpan...' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
