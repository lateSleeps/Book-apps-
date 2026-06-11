import { CalendarBlank, Clock } from '@phosphor-icons/react';
import { forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SettingsInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  /** Prefix label rendered inside the left edge (e.g. "instagram.com/") */
  prefix?: string;
}

// Hides the native browser calendar/clock picker indicator while keeping it
// functionally active (cover the whole input so clicking anywhere still
// opens the picker). The Phosphor icon is then overlaid on top.
const PICKER_INDICATOR_HIDDEN =
  '[&::-webkit-calendar-picker-indicator]:absolute ' +
  '[&::-webkit-calendar-picker-indicator]:inset-0 ' +
  '[&::-webkit-calendar-picker-indicator]:h-full ' +
  '[&::-webkit-calendar-picker-indicator]:w-full ' +
  '[&::-webkit-calendar-picker-indicator]:cursor-pointer ' +
  '[&::-webkit-calendar-picker-indicator]:opacity-0';

export const SettingsInput = forwardRef<HTMLInputElement, SettingsInputProps>(
  function SettingsInput({ hasError, prefix, className, type, ...props }, ref) {
    const inputClass = cn(
      'w-full rounded-r10 border border-bd-card bg-bg-input px-s16 py-s12',
      'text-ts-fn text-tx-primary placeholder:text-tx-muted',
      'focus:border-tx-secondary focus:outline-none focus:ring-1 focus:ring-tx-secondary',
      'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
      hasError && 'border-ac-danger focus:border-ac-danger focus:ring-ac-danger'
    );

    // date / time — hide native picker indicator, overlay Phosphor icon
    if (type === 'date' || type === 'time') {
      const Icon = type === 'date' ? CalendarBlank : Clock;
      return (
        <div className="relative">
          <input
            ref={ref}
            type={type}
            className={cn(inputClass, 'pr-s40', PICKER_INDICATOR_HIDDEN, className)}
            {...props}
          />
          <Icon
            size={14}
            weight="duotone"
            className="pointer-events-none absolute right-s12 top-1/2 -translate-y-1/2 text-tx-secondary"
            aria-hidden
          />
        </div>
      );
    }

    if (prefix) {
      return (
        <div
          className={cn(
            'flex items-center overflow-hidden rounded-r10 border border-bd-card bg-bg-input transition-colors',
            'focus-within:border-tx-secondary focus-within:ring-1 focus-within:ring-tx-secondary',
            hasError && 'border-ac-danger focus-within:border-ac-danger focus-within:ring-ac-danger'
          )}
        >
          <span className="shrink-0 border-r border-bd-card bg-bg-control px-s12 py-s12 text-ts-fn text-tx-secondary">
            {prefix}
          </span>
          <input
            ref={ref}
            className={cn(
              'min-w-0 flex-1 bg-transparent px-s12 py-s12 text-ts-fn text-tx-primary placeholder:text-tx-muted focus:outline-none',
              className
            )}
            type={type}
            {...props}
          />
        </div>
      );
    }

    return <input ref={ref} type={type} className={cn(inputClass, className)} {...props} />;
  }
);
