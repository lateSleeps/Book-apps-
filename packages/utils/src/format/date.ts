import {
  format,
  formatDistance,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  parse,
  isSameDay,
} from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format date to locale string (e.g., "25 May 2026")
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMMM yyyy', { locale: id });
}

/**
 * Format time to locale string (e.g., "14:30")
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'HH:mm');
}

/**
 * Format date and time (e.g., "25 May 2026, 14:30")
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMMM yyyy, HH:mm', { locale: id });
}

/**
 * Format date for display in Indonesian
 * Shows "Today", "Yesterday", "This week", or full date
 */
export function formatDateRelative(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isToday(dateObj)) {
    return 'Hari ini';
  }
  if (isYesterday(dateObj)) {
    return 'Kemarin';
  }
  if (isThisWeek(dateObj)) {
    return format(dateObj, 'EEEE', { locale: id });
  }
  if (isThisMonth(dateObj)) {
    return format(dateObj, 'dd MMMM', { locale: id });
  }

  return format(dateObj, 'dd MMMM yyyy', { locale: id });
}

/**
 * Format date distance from now (e.g., "2 days ago")
 */
export function formatDistanceFromNow(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(dateObj, new Date(), {
    addSuffix: true,
    locale: id,
  });
}

/**
 * Format time from string in HH:mm format
 */
export function parseTimeString(timeStr: string): Date {
  return parse(timeStr, 'HH:mm', new Date());
}

/**
 * Check if two dates are the same day
 */
export function isSameDateTime(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return isSameDay(d1, d2);
}

/**
 * Get date range display (e.g., "25 - 31 May 2026")
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'dd')} - ${format(end, 'dd MMMM yyyy', { locale: id })}`;
  }

  return `${format(start, 'dd MMMM yyyy', { locale: id })} - ${format(end, 'dd MMMM yyyy', { locale: id })}`;
}
