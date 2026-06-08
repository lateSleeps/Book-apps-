// Sticky save/cancel bar for settings forms.
// Place as the last child inside SettingsPageShell.
// Sticky positioning works inside the layout's overflow-y-auto scroll container.
//
// isDirty  — disables buttons when nothing has changed
// isSaving — shows loading text on save button

'use client';

interface SettingsActionBarProps {
  onSave: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
  saveLabel?: string;
}

export function SettingsActionBar({
  onSave,
  onCancel,
  isSaving = false,
  isDirty = false,
  saveLabel = 'Simpan Perubahan',
}: SettingsActionBarProps) {
  const disabled = isSaving || !isDirty;

  return (
    <div className="sticky bottom-0 z-10 border-t border-bd-row bg-bg-card px-s20 py-s16">
      <div className="flex items-center justify-end gap-s8">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="h-9 rounded-r10 px-s16 text-ts-fn font-medium text-tx-control transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Batal
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={disabled}
          className="h-9 rounded-r10 bg-ac-primary px-s16 text-ts-fn font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-bg-control disabled:text-tx-muted"
        >
          {isSaving ? 'Menyimpan...' : saveLabel}
        </button>
      </div>
    </div>
  );
}
