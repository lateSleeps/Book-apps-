'use client';

import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';

import { cn } from '@/shared/lib/cn';
import { buildCalendarGrid, getLeadingEmptyCells } from '../../lib/date-utils';
import { DateCell } from './DateCell';

export interface CalendarViewProps {
  selectedDate: string | null;
  onSelect: (isoDate: string) => void;
  /** Day numbers to disable (0=Sun, 1=Mon, ...) */
  disabledDays?: number[];
  className?: string;
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

/**
 * Monthly calendar grid with navigation.
 * Disables past dates and closed days (Monday by default).
 */
export function CalendarView({
  selectedDate,
  onSelect,
  disabledDays = [1],
  className,
}: CalendarViewProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;
  const days = buildCalendarGrid(year, month);
  const leadingCells = getLeadingEmptyCells(year, month);

  const goToPrev = () => setViewDate((d) => subMonths(d, 1));
  const goToNext = () => setViewDate((d) => addMonths(d, 1));

  const monthLabel = format(viewDate, 'MMMM yyyy', { locale: id });

  return (
    <div className={cn('flex flex-col gap-s12', className)}>
      {/* Month navigation */}
      <div className="flex items-center justify-between px-s20">
        <button
          onClick={goToPrev}
          aria-label="Bulan sebelumnya"
          className="flex h-9 w-9 items-center justify-center rounded-rF border border-sep bg-surface text-label2 active:bg-sep"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-t16 font-semibold capitalize text-label">{monthLabel}</span>
        <button
          onClick={goToNext}
          aria-label="Bulan berikutnya"
          className="flex h-9 w-9 items-center justify-center rounded-rF border border-sep bg-surface text-label2 active:bg-sep"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 px-s16">
        {DAY_LABELS.map((day) => (
          <div
            key={day}
            className="flex min-w-[44px] items-center justify-center text-t12 font-semibold uppercase tracking-wider text-label3"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-1 px-s16">
        {/* Leading empty cells */}
        {Array.from({ length: leadingCells }, (_, i) => (
          <div key={`empty-${i}`} className="min-w-[44px]" />
        ))}
        {days.map((day) => (
          <DateCell
            key={day.isoString}
            dayNumber={day.dayNumber}
            isoString={day.isoString}
            isSelected={selectedDate === day.isoString}
            isToday={day.isToday}
            isPast={day.isPast}
            isClosed={disabledDays.includes(day.dayOfWeek)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
