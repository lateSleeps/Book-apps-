'use client';

import type { TimeSlot as TimeSlotType } from '../../types/booking.types';
import { cn } from '@/shared/lib/cn';

export interface TimeSlotProps {
  slot: TimeSlotType;
  isSelected: boolean;
  onSelect: (time: string) => void;
}

/** Individual time slot chip */
export function TimeSlot({ slot, isSelected, onSelect }: TimeSlotProps) {
  const isDisabled = !slot.available;

  return (
    <button
      type="button"
      onClick={() => !isDisabled && onSelect(slot.time)}
      disabled={isDisabled}
      aria-pressed={isSelected}
      aria-label={`${slot.time}${isDisabled ? ' (penuh)' : ''}`}
      className={cn(
        'rounded-rF px-s16 py-s8 text-t14 font-medium transition-all duration-140',
        'active:scale-[0.93]',
        isDisabled && 'cursor-not-allowed opacity-40 line-through text-label3',
        !isDisabled && !isSelected && 'bg-accent-soft text-accent-dark',
        isSelected && 'bg-label text-white'
      )}
    >
      {slot.time}
    </button>
  );
}
