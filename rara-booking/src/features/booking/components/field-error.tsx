'use client';

interface FieldErrorProps {
  message?: string;
  className?: string;
}

export function FieldError({ message, className = '' }: FieldErrorProps) {
  if (!message) return null;

  return (
    <div className={`mt-s8 flex items-center gap-s6 text-red-600 text-sm ${className}`}>
      <span className="text-lg">⚠️</span>
      <span>{message}</span>
    </div>
  );
}
