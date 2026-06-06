'use client';

import type { ReactNode } from 'react';

interface BaseDialogProps {
  children: ReactNode;
  zIndex?: string;
  onBackdropClick?: () => void;
  maxWidth?: string;
}

export function BaseDialog({
  children,
  zIndex = 'z-50',
  onBackdropClick,
  maxWidth = 'max-w-[22rem]',
}: BaseDialogProps) {
  return (
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4`}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" onClick={onBackdropClick} />
      <div
        className={`relative flex w-full ${maxWidth} flex-col overflow-hidden rounded-[20px] bg-white`}
        style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.18)' }}
      >
        {children}
      </div>
    </div>
  );
}
