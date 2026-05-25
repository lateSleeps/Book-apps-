'use client';

import React from 'react';

import { cn } from '@/shared/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/** Rara Beauty text input */
export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-s4">
      {label && (
        <label htmlFor={inputId} className="text-t12 font-semibold uppercase tracking-widest text-label3">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-r12 border border-sep bg-surface px-s16 py-s12',
          'text-t14 text-label placeholder:text-label3',
          'focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent',
          'disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-t12 text-red-500">{error}</p>}
      {hint && !error && <p className="text-t12 text-label3">{hint}</p>}
    </div>
  );
}
