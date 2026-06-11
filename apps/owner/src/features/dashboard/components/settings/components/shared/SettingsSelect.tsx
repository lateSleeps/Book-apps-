import { CaretDown } from '@phosphor-icons/react';
import { forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SettingsSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

/**
 * Native <select> styled to match SettingsInput exactly.
 *
 * Shared field contract:
 *   rounded-r10  border border-bd-card  bg-bg-input
 *   px-s16 py-s12  text-ts-fn text-tx-primary
 *   focus:border-tx-secondary  focus:ring-1 focus:ring-tx-secondary
 *   transition-colors  disabled:cursor-not-allowed disabled:opacity-50
 *
 * Select-specific additions:
 *   appearance-none        — hides the browser-native chevron
 *   pr-s32                 — reserves space for the custom CaretDown icon
 *   CaretDown (14px)       — positioned at right-s12, pointer-events-none
 */
export const SettingsSelect = forwardRef<HTMLSelectElement, SettingsSelectProps>(
  function SettingsSelect({ hasError, className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-r10 border border-bd-card bg-bg-input',
            'py-s12 pl-s16 pr-s32',
            'text-ts-fn text-tx-primary',
            'focus:border-tx-secondary focus:outline-none focus:ring-1 focus:ring-tx-secondary',
            'transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            hasError && 'border-ac-danger focus:border-ac-danger focus:ring-ac-danger',
            className
          )}
          {...props}
        >
          {children}
        </select>

        <CaretDown
          size={14}
          weight="bold"
          className="pointer-events-none absolute right-s12 top-1/2 -translate-y-1/2 text-tx-muted"
          aria-hidden
        />
      </div>
    );
  }
);
