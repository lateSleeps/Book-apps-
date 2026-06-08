import { forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SettingsTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const SettingsTextarea = forwardRef<HTMLTextAreaElement, SettingsTextareaProps>(
  function SettingsTextarea({ hasError, className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-r10 border border-bd-card bg-bg-input px-s16 py-s12',
          'resize-none text-ts-fn leading-relaxed text-tx-primary placeholder:text-tx-muted',
          'focus:border-tx-secondary focus:outline-none focus:ring-1 focus:ring-tx-secondary',
          'transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-ac-danger focus:border-ac-danger focus:ring-ac-danger',
          className
        )}
        {...props}
      />
    );
  }
);
