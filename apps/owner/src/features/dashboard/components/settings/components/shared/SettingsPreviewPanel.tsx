import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface SettingsPreviewPanelProps {
  /** Left column: form fields */
  form: ReactNode;
  /** Right column: live preview content */
  preview: ReactNode;
  /** Label shown above the preview panel */
  previewLabel?: string;
  className?: string;
}

/**
 * Two-column layout used by Booking App domain.
 * Desktop: form left, preview right (sticky).
 * Mobile: form top, preview below (collapsible via CSS).
 *
 * The parent is responsible for all form logic.
 * This component is layout-only — no state, no business logic.
 */
export function SettingsPreviewPanel({
  form,
  preview,
  previewLabel = 'Pratinjau',
  className,
}: SettingsPreviewPanelProps) {
  return (
    <div className={cn('flex flex-col gap-s24 lg:flex-row lg:items-start lg:gap-s32', className)}>
      {/* Left — form */}
      <div className="min-w-0 flex-1">{form}</div>

      {/* Right — preview */}
      <div className="w-full shrink-0 lg:sticky lg:top-s24 lg:w-[380px]">
        <div className="flex flex-col gap-s12">
          <p className="text-ts-cap1 font-semibold uppercase tracking-widest text-tx-secondary">
            {previewLabel}
          </p>
          <div className="overflow-hidden rounded-r20 border border-bd-card bg-bg-card shadow-card">
            {preview}
          </div>
        </div>
      </div>
    </div>
  );
}
