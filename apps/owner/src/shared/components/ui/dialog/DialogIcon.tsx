'use client';

import type { ReactNode } from 'react';

export type DialogIconVariant = 'success' | 'danger' | 'warning' | 'info';

interface DialogIconProps {
  variant: DialogIconVariant;
  children: ReactNode;
}

const VARIANT_STYLES: Record<DialogIconVariant, { background: string; color: string }> = {
  success: { background: '#f0fdf4', color: '#16a34a' },
  danger: { background: '#fef2f2', color: '#ef4444' },
  warning: { background: '#fffbeb', color: '#d97706' },
  info: { background: '#F2F2F7', color: '#8E8E93' },
};

export function DialogIcon({ variant, children }: DialogIconProps) {
  const { background, color } = VARIANT_STYLES[variant];
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}
