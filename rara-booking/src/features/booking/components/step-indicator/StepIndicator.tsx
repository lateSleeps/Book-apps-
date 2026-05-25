'use client';

import { cn } from '@/shared/lib/cn';

export interface StepIndicatorProps {
  /** Current active step (1-based) */
  current: number;
  /** Total number of steps */
  total: number;
  className?: string;
}

/**
 * Progress dot indicator for the booking flow.
 * Active dot expands to 20px wide; inactive dots are 6px.
 */
export function StepIndicator({ current, total, className }: StepIndicatorProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current} of ${total}`}
      className={cn('flex items-center gap-s4', className)}
    >
      {Array.from({ length: total }, (_, i) => {
        const isActive = i + 1 === current;
        return (
          <span
            key={i}
            className={cn(
              'h-[6px] rounded-rF transition-all duration-300',
              isActive ? 'w-5 bg-label' : 'w-[6px] bg-sep'
            )}
          />
        );
      })}
    </div>
  );
}
