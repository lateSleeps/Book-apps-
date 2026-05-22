'use client';

import { cn } from '@/shared/lib/cn';

export interface ErrorMessageProps {
  message: string;
  className?: string;
}

/** Inline error message component */
export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <p
      role="alert"
      className={cn('text-t12 font-medium text-red-500', className)}
    >
      {message}
    </p>
  );
}
