'use client';

import { cn } from '@/shared/lib/cn';
import { useSlotTimer } from '@/features/booking/hooks/use-slot-timer';

interface CountdownTimerProps {
  onExpire: () => void;
}

export function CountdownTimer({ onExpire }: CountdownTimerProps) {
  const { formattedTime, isWarning } = useSlotTimer({ onExpire, autoStart: true });

  return (
    <div className={cn(
      'flex items-center gap-s14 rounded-r20 px-s16 py-s14 border',
      isWarning
        ? 'bg-red-50 border-red-200'
        : 'bg-accent-soft border-accent/20'
    )}>
      <div className={cn(
        'flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full',
        isWarning ? 'bg-red-100' : 'bg-accent/15'
      )}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isWarning ? 'text-red-500' : 'text-accent'}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-[13px] font-semibold', isWarning ? 'text-red-600' : 'text-accent')}>
          Slot masih direservasi
        </p>
        <p className="text-[12px] text-label2 mt-[1px]">Selesaikan sebelum waktu habis</p>
      </div>
      <span className={cn(
        'text-[22px] font-bold tabular-nums flex-shrink-0',
        isWarning ? 'text-red-600' : 'text-accent'
      )}>
        {formattedTime}
      </span>
    </div>
  );
}
