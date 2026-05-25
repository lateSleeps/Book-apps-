'use client';

import { cn } from '@/shared/lib/cn';

export interface DateCellProps {
  dayNumber: number;
  isoString: string;
  isSelected: boolean;
  isToday: boolean;
  isPast: boolean;
  isClosed: boolean;
  onSelect: (isoDate: string) => void;
}

/** Single day cell in the calendar grid */
export function DateCell({
  dayNumber,
  isoString,
  isSelected,
  isToday,
  isPast,
  isClosed,
  onSelect,
}: DateCellProps) {
  const isDisabled = isPast || isClosed;

  const handleClick = () => {
    if (!isDisabled) onSelect(isoString);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={isoString}
      aria-pressed={isSelected}
      className={cn(
        'flex flex-col items-center justify-center gap-[3px] rounded-r8 py-s4 min-w-[44px]',
        'transition-all duration-140 active:scale-95',
        isDisabled && 'cursor-not-allowed opacity-40',
        !isDisabled && !isSelected && 'hover:bg-accent-soft',
        isSelected && 'bg-accent text-white'
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-rF text-t16 font-semibold',
          isToday && !isSelected && 'bg-label text-white',
          isPast && 'text-label3 line-through',
          !isToday && !isSelected && !isPast && 'text-label'
        )}
      >
        {dayNumber}
      </span>
      {!isPast && !isClosed && (
        <span
          className={cn(
            'h-1 w-1 rounded-rF',
            isSelected ? 'bg-white/60' : 'bg-accent'
          )}
        />
      )}
    </button>
  );
}
