import {
  format,
  isBefore,
  isToday,
  startOfDay,
  getDaysInMonth,
  startOfMonth,
  getDay,
  addDays,
} from 'date-fns';
import { id } from 'date-fns/locale';

/** Returns true if date is in the past (before today) */
export function isPastDate(date: Date): boolean {
  return isBefore(startOfDay(date), startOfDay(new Date()));
}

/** Returns true if date is today */
export function isTodayDate(date: Date): boolean {
  return isToday(date);
}

/** Format date to ISO string (YYYY-MM-DD) */
export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Format ISO date string to display format (e.g. "Selasa, 20 Mei 2026") */
export function formatDisplayDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return format(date, 'EEEE, d MMMM yyyy', { locale: id });
}

/** Get day of week index (0=Sun, 1=Mon, ...) for ISO date string */
export function getDayOfWeek(isoDate: string): number {
  const date = new Date(isoDate + 'T00:00:00');
  return getDay(date);
}

/** Build calendar grid for a given month/year */
export interface CalendarDay {
  date: Date;
  isoString: string;
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  dayOfWeek: number;
}

export function buildCalendarGrid(year: number, month: number): CalendarDay[] {
  const firstDay = startOfMonth(new Date(year, month - 1));
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const days: CalendarDay[] = [];

  for (let i = 0; i < daysInMonth; i++) {
    const date = addDays(firstDay, i);
    days.push({
      date,
      isoString: toISODateString(date),
      dayNumber: date.getDate(),
      isToday: isToday(date),
      isPast: isPastDate(date),
      dayOfWeek: getDay(date),
    });
  }

  return days;
}

/** Get leading empty cells for calendar grid (days before first of month) */
export function getLeadingEmptyCells(year: number, month: number): number {
  const firstDay = startOfMonth(new Date(year, month - 1));
  const dayOfWeek = getDay(firstDay);
  // Convert Sunday=0 to Monday-first: Mon=0, ..., Sun=6
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}
