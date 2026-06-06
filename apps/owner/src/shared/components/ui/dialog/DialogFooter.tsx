'use client';

import type { ReactNode } from 'react';

interface DialogFooterProps {
  children: ReactNode;
  layout?: 'horizontal' | 'vertical';
}

export function DialogFooter({ children, layout = 'horizontal' }: DialogFooterProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        gap: 8,
        padding: '12px 24px 20px',
        borderTop: '1px solid #F2F2F7',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}
