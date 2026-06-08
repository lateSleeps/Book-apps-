import { forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SettingsInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  /** Prefix label rendered inside the left edge (e.g. "instagram.com/") */
  prefix?: string;
}

export const SettingsInput = forwardRef<HTMLInputElement, SettingsInputProps>(
  function SettingsInput({ hasError, prefix, className, ...props }, ref) {
    const inputClass = cn(
      'w-full rounded-r10 border border-bd-card bg-bg-input px-s16 py-s12',
      'text-ts-fn text-tx-primary placeholder:text-tx-muted',
      'focus:border-tx-secondary focus:outline-none focus:ring-1 focus:ring-tx-secondary',
      'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
      hasError && 'border-ac-danger focus:border-ac-danger focus:ring-ac-danger'
    );

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
            {...props}
          />
        </div>
      );
    }

    return <input ref={ref} className={cn(inputClass, className)} {...props} />;
  }
);
