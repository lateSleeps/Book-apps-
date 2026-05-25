'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="mb-5">
      <label className="block text-[13px] font-medium text-[#1a1a1a] mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[12px] text-red-500 mt-1">{error}</p>
      )}
      {hint && !error && (
        <p className="text-[12px] text-[#aaa] mt-1">{hint}</p>
      )}
    </div>
  );
}
