"use client";

import { ArrowLeft } from "@phosphor-icons/react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/cn";

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
        "fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 bg-white px-s16 pb-s32 pt-s16",
        "border-t border-sep",
        className,
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
      <div className={cn("flex gap-s8", showBack && "flex-row-reverse")}>
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
            <ArrowLeft size={18} weight="bold" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
