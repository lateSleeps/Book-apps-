'use client';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/cn';

export interface NavigationButtonsProps {
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  showBack?: boolean;
  onBack?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  className?: string;
}

/**
 * Sticky bottom navigation bar with primary CTA and optional back/secondary actions.
 */
export function NavigationButtons({
  primaryLabel,
  primaryDisabled = false,
  onPrimary,
  showBack = false,
  onBack,
  secondaryLabel,
  onSecondary,
  className,
}: NavigationButtonsProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 bg-white px-s16 pb-s32 pt-s16',
        'border-t border-sep',
        className
      )}
    >
      {secondaryLabel && onSecondary && (
        <Button
          variant="ghost"
          onClick={onSecondary}
          className="mb-s8"
          aria-label={secondaryLabel}
        >
          {secondaryLabel}
        </Button>
      )}
      <div className={cn('flex gap-s8', showBack && 'flex-row-reverse')}>
        <Button
          variant="primary"
          onClick={onPrimary}
          disabled={primaryDisabled}
          className="flex-1"
          aria-label={primaryLabel}
        >
          {primaryLabel}
        </Button>
        {showBack && onBack && (
          <Button
            variant="icon"
            onClick={onBack}
            fullWidth={false}
            aria-label="Kembali"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}
