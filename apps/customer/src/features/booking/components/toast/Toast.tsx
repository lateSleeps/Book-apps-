'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';

type ToastVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  onClose?: () => void;
  shake?: boolean;
  shakeDelay?: number;
  className?: string;
}

const config: Record<ToastVariant, {
  bg: string;
  iconCircle: string;
  icon: React.ReactNode;
}> = {
  neutral: {
    bg: 'bg-[#f0f0f0]',
    iconCircle: 'bg-[#888]',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-[#dde8fb]',
    iconCircle: 'bg-[#3b7de8]',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  success: {
    bg: 'bg-[#d6f0e0]',
    iconCircle: 'bg-[#27a84a]',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-[#fef3d6]',
    iconCircle: 'bg-[#f5a623]',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="8" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-[#fde0dd]',
    iconCircle: 'bg-[#e53935]',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
};

export function Toast({ title, description, variant = 'neutral', onClose, shake = false, shakeDelay = 350, className }: ToastProps) {
  const { bg, iconCircle, icon } = config[variant];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shake) return;
    const el = ref.current;
    if (!el) return;
    const timer = setTimeout(() => {
      el.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-7px)' },
          { transform: 'translateX(7px)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(-3px)' },
          { transform: 'translateX(3px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 500, easing: 'ease', fill: 'none' }
      );
    }, shakeDelay);
    return () => clearTimeout(timer);
  }, [shake, shakeDelay]);

  return (
    <div ref={ref} className={cn('flex items-center gap-s12 rounded-[18px] px-s16 py-[14px] mb-s24', bg, className)}>
      <div className={cn('flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full', iconCircle)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-label leading-snug">{title}</p>
        {description && (
          <p className="text-[13px] text-label2 mt-[2px] leading-snug">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white/60 text-label2 hover:bg-white/90 transition-colors"
          aria-label="Tutup"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
