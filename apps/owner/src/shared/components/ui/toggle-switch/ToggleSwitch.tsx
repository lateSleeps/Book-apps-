'use client';

import { cn } from '@/shared/lib/cn';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  id?: string;
  className?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  id,
  className,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tx-secondary focus-visible:ring-offset-2',
        checked ? 'bg-tx-primary' : 'border border-bd-row bg-bd-card',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-bg-card shadow-sm transition-transform duration-150 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}
