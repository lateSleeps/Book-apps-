'use client';

import { useRouter } from 'next/navigation';

interface StepHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function StepHeader({ title, subtitle, onBack }: StepHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex-none px-s20 pt-s32 pb-s20 border-b border-sep bg-bg">
      <button
        onClick={onBack ?? (() => router.back())}
        aria-label="Kembali"
        className="mb-s16 flex h-[40px] w-[40px] items-center justify-center rounded-full border border-sep bg-surface text-label2 transition-all hover:bg-sep active:scale-95"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>
      <h1 className="text-[28px] font-bold text-label leading-tight">{title}</h1>
      {subtitle && <p className="mt-[6px] text-[14px] text-label2">{subtitle}</p>}
    </div>
  );
}
