'use client';

import { Image, X, UploadSimple } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';

export type UploadVariant = 'logo' | 'cover' | 'avatar' | 'addon';

interface UploadConfig {
  /** Display label shown above the upload zone */
  label: string;
  /** Aspect ratio class for the preview area */
  aspectClass: string;
  /** Max file size in bytes */
  maxBytes: number;
  /** Short hint text shown inside the empty zone */
  hint: string;
}

const VARIANT_CONFIG: Record<UploadVariant, UploadConfig> = {
  logo: {
    label: 'Logo Salon',
    aspectClass: 'aspect-square',
    maxBytes: 2_097_152,
    hint: 'PNG atau JPG, maks 2MB',
  },
  cover: {
    label: 'Foto Cover',
    aspectClass: 'aspect-[16/6]',
    maxBytes: 5_242_880,
    hint: 'PNG atau JPG, maks 5MB, rasio 16:6',
  },
  avatar: {
    label: 'Foto Stylist',
    aspectClass: 'aspect-square',
    maxBytes: 2_097_152,
    hint: 'PNG atau JPG, maks 2MB',
  },
  addon: {
    label: 'Gambar Produk',
    aspectClass: 'aspect-square',
    maxBytes: 2_097_152,
    hint: 'PNG atau JPG, maks 2MB',
  },
};

const ACCEPTED = 'image/png,image/jpeg,image/webp';

interface SettingsUploadFieldProps {
  variant: UploadVariant;
  /** Current image URL (from DB or blob preview) */
  value?: string | null;
  /** Called when user selects a new file. File not yet uploaded — parent handles upload. */
  onChange: (file: File, previewUrl: string) => void;
  /** Called when user removes the image */
  onRemove: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function SettingsUploadField({
  variant,
  value,
  onChange,
  onRemove,
  error,
  disabled = false,
  className,
}: SettingsUploadFieldProps) {
  const config = VARIANT_CONFIG[variant];
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > config.maxBytes) {
      setSizeError(
        `Ukuran file melebihi batas (maks ${Math.round(config.maxBytes / 1_048_576)}MB)`
      );
      e.target.value = '';
      return;
    }

    setSizeError(null);
    const url = URL.createObjectURL(file);
    onChange(file, url);
    // Reset input so the same file can be re-selected after removal
    e.target.value = '';
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    setSizeError(null);
    onRemove();
  }

  const displayError = error ?? sizeError;

  return (
    <div className={cn('flex flex-col gap-s8', className)}>
      <p className="text-ts-fn font-medium text-tx-primary">{config.label}</p>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Upload ${config.label}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click();
        }}
        className={cn(
          'relative w-full overflow-hidden rounded-r16 border-2 border-dashed border-bd-card bg-bg-input transition-colors',
          config.aspectClass,
          !disabled && 'cursor-pointer hover:border-tx-secondary hover:bg-bg-hover',
          disabled && 'cursor-not-allowed opacity-60',
          displayError && 'border-ac-danger'
        )}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={config.label} className="h-full w-full object-cover" />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Hapus gambar"
                className="absolute right-s8 top-s8 flex h-7 w-7 items-center justify-center rounded-rF bg-tx-primary/70 text-white transition-opacity hover:bg-tx-primary"
              >
                <X size={14} weight="bold" />
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-s8 p-s16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-r12 bg-bg-control">
              {variant === 'cover' ? (
                <Image size={20} weight="duotone" className="text-tx-secondary" />
              ) : (
                <UploadSimple size={20} weight="duotone" className="text-tx-secondary" />
              )}
            </div>
            <p className="text-ts-cap1 text-tx-secondary">{config.hint}</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        disabled={disabled}
        onChange={handleFileChange}
        className="sr-only"
        aria-hidden="true"
      />

      {displayError && (
        <p className="text-ts-cap1 text-ac-danger" role="alert">
          {displayError}
        </p>
      )}

      <p className="text-ts-cap2 text-tx-muted">
        {/* Future: auto-converted to WebP before upload */}
        Format diterima: PNG, JPG, WebP
      </p>
    </div>
  );
}
