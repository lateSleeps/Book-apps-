'use client';

import { cn } from '@/shared/lib/cn';

export type BottomCTAVariant = 'default' | 'ready' | 'error';

export interface BottomCTAProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: BottomCTAVariant;
  showBack?: boolean;
  onBack?: () => void;
}

export function BottomCTA({
  label,
  onClick,
  disabled = false,
  variant = 'default',
  showBack = false,
  onBack,
}: BottomCTAProps) {
  const isReady = variant === 'ready' && !disabled;
  const isError = variant === 'error';

  return (
    <div className="flex-none w-full border-t border-sep bg-white/95 backdrop-blur-sm px-s16 pb-[max(env(safe-area-inset-bottom),24px)] pt-s16">
      <div className={cn('flex gap-s8', showBack && 'flex-row items-center')}>
        {/* Back button */}
        {showBack && onBack && (
          <button
            onClick={onBack}
            aria-label="Kembali"
            className={cn(
              'flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-rF',
              'border border-sep bg-surface text-label2',
              'transition-all duration-150',
              'hover:bg-sep hover:border-label3',
              'active:scale-95 active:bg-sep',
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        )}

        {/* Primary CTA */}
        <button
          onClick={!disabled ? onClick : undefined}
          disabled={disabled}
          aria-disabled={disabled}
          className={cn(
            'flex flex-1 items-center justify-center rounded-rF',
            'min-h-[50px] px-s24 text-t16 font-semibold',
            'transition-all duration-150',

            // ready state
            isReady && [
              'bg-label text-white shadow-button',
              'hover:bg-label/90',
              'active:scale-[0.98] active:shadow-none',
            ],

            // error state
            isError && [
              'bg-red-500 text-white shadow-button',
              'hover:bg-red-600',
              'active:scale-[0.98]',
            ],

            // disabled / default state
            !isReady && !isError && [
              'bg-sep text-label3 cursor-not-allowed',
              'hover:bg-sep',
            ],
          )}
        >
          {label}
        </button>
      </div>
    </div>
  );
}
