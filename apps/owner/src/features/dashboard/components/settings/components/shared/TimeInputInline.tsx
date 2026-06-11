// Compact time input for use inside table rows and side-sheet day-row lists.
// Matches the TIME_INPUT_CLASS sizing pattern (py-s4 px-s8 rounded-r8) and
// overlays a Phosphor Clock (duotone) icon in place of the native browser indicator.

import { Clock } from '@phosphor-icons/react';
import { forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

export interface TimeInputInlineProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

// Hides native browser clock indicator while keeping it functionally active.
const PICKER_INDICATOR_HIDDEN =
  '[&::-webkit-calendar-picker-indicator]:absolute ' +
  '[&::-webkit-calendar-picker-indicator]:inset-0 ' +
  '[&::-webkit-calendar-picker-indicator]:h-full ' +
  '[&::-webkit-calendar-picker-indicator]:w-full ' +
  '[&::-webkit-calendar-picker-indicator]:cursor-pointer ' +
  '[&::-webkit-calendar-picker-indicator]:opacity-0';

export const TimeInputInline = forwardRef<HTMLInputElement, TimeInputInlineProps>(
  function TimeInputInline({ className, ...props }, ref) {
    return (
      <div className="relative inline-flex">
        <input
          ref={ref}
          type="time"
          className={cn(
            'rounded-r8 border border-bd-card bg-bg-input py-s4 pl-s8 pr-s24',
            'text-ts-fn text-tx-primary',
            'focus:border-tx-secondary focus:outline-none focus:ring-1 focus:ring-tx-secondary',
            'transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            PICKER_INDICATOR_HIDDEN,
            className
          )}
          {...props}
        />
        <Clock
          size={11}
          weight="duotone"
          className="pointer-events-none absolute right-s6 top-1/2 -translate-y-1/2 text-tx-secondary"
          aria-hidden
        />
      </div>
    );
  }
);
