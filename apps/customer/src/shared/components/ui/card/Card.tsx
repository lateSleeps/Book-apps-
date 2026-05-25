'use client';

import React from 'react';

import { cn } from '@/shared/lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Visual padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/** Rara Beauty base card component */
export function Card({ children, padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-r20 bg-surface',
        padding === 'none' && 'p-0',
        padding === 'sm' && 'p-s12',
        padding === 'md' && 'p-s16',
        padding === 'lg' && 'p-s20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
