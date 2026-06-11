'use client';

import { Warning } from '@phosphor-icons/react';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';

interface DangerAction {
  label: string;
  description: string;
  confirmLabel?: string;
  confirmPrompt?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

interface SettingsDangerZoneProps {
  title?: string;
  actions: DangerAction[];
  className?: string;
}

export function SettingsDangerZone({
  title = 'Danger Zone',
  actions,
  className,
}: SettingsDangerZoneProps) {
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  function handleInitiate(idx: number) {
    setPendingIndex(idx);
  }

  function handleCancel() {
    setPendingIndex(null);
  }

  async function handleConfirm(action: DangerAction, _idx: number) {
    await action.onConfirm();
    setPendingIndex(null);
  }

  return (
    <div className={cn('rounded-r16 border border-ac-danger/30 bg-st-cancelled-bg', className)}>
      {/* Header */}
      <div className="flex items-center gap-s8 border-b border-ac-danger/20 px-s20 py-s16">
        <Warning size={16} weight="fill" className="shrink-0 text-ac-danger" />
        <p className="text-ts-fn font-semibold text-ac-danger">{title}</p>
      </div>

      {/* Actions list */}
      <div className="divide-y divide-ac-danger/10">
        {actions.map((action, idx) => {
          const isPending = pendingIndex === idx;
          return (
            <div
              key={action.label}
              className="flex flex-col gap-s12 px-s20 py-s16 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-s4">
                <p className="text-ts-fn font-medium text-tx-primary">{action.label}</p>
                <p className="text-ts-cap1 text-tx-secondary">{action.description}</p>
                {isPending && action.confirmPrompt && (
                  <p className="mt-s4 text-ts-cap1 font-medium text-ac-danger">
                    {action.confirmPrompt}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-s8">
                {isPending ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="h-8 rounded-r10 px-s12 text-ts-cap1 font-medium text-tx-control transition-colors hover:bg-bg-hover"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirm(action, idx)}
                      disabled={action.isLoading}
                      className="h-8 rounded-r10 bg-ac-danger px-s12 text-ts-cap1 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {action.isLoading ? 'Memproses...' : action.confirmLabel ?? 'Ya, lanjutkan'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleInitiate(idx)}
                    disabled={action.isLoading}
                    className="h-8 rounded-r10 border border-ac-danger px-s12 text-ts-cap1 font-medium text-ac-danger transition-colors hover:bg-ac-danger hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {action.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
