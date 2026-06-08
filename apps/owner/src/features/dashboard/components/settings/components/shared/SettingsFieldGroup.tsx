import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface SettingsFieldGroupProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  /** Span full width even inside a grid */
  fullWidth?: boolean;
}

export function SettingsFieldGroup({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  children,
  className,
  fullWidth = false,
}: SettingsFieldGroupProps) {
  return (
    <div className={cn('flex flex-col gap-s8', fullWidth && 'col-span-full', className)}>
      <label htmlFor={htmlFor} className="text-ts-fn font-medium text-tx-primary">
        {label}
        {required && (
          <span className="ml-s4 text-ac-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="text-ts-cap1 text-ac-danger" role="alert">
          {error}
        </p>
      )}
      {hint && !error && <p className="text-ts-cap1 text-tx-secondary">{hint}</p>}
    </div>
  );
}
