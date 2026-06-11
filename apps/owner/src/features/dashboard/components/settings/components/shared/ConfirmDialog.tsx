'use client';

/** Shared pending-confirmation state used by settings form orchestrators. */
export interface ConfirmPending {
  title: string;
  message: string;
  confirmLabel: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
}

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Konfirmasi',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-s16"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-r20 bg-bg-card shadow-dialog">
        <div className="flex flex-col gap-s8 px-s20 py-s20">
          <p className="m-0 text-ts-sub font-bold text-tx-primary">{title}</p>
          <p className="m-0 text-ts-fn text-tx-secondary">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-s8 border-t border-bd-row px-s20 py-s16">
          <button
            onClick={onCancel}
            className="rounded-r10 px-s16 py-s8 text-ts-fn font-medium text-tx-secondary transition-colors hover:bg-bg-hover"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-r10 px-s16 py-s8 text-ts-fn font-semibold text-white transition-opacity hover:opacity-90 ${
              variant === 'danger' ? 'bg-ac-danger' : 'bg-ac-ios-green'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
