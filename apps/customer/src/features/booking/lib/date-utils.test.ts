import { describe, it, expect } from 'vitest';
import { isPastDate, toISODateString, buildCalendarGrid, getLeadingEmptyCells } from './date-utils';

describe('isPastDate', () => {
  it('returns true for past date', () => {
    expect(isPastDate(new Date('2020-01-01'))).toBe(true);
  });

  it('returns false for future date', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(isPastDate(future)).toBe(false);
  });
});

describe('toISODateString', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(toISODateString(new Date(2026, 4, 20))).toBe('2026-05-20');
  });
});

describe('buildCalendarGrid', () => {
  it('builds 31 days for May 2026', () => {
    const days = buildCalendarGrid(2026, 5);
    expect(days).toHaveLength(31);
  });

  it('first day is May 1st 2026', () => {
    const days = buildCalendarGrid(2026, 5);
    expect(days[0]?.dayNumber).toBe(1);
  });
});

describe('getLeadingEmptyCells', () => {
  it('returns correct leading cells for May 2026 (starts Friday)', () => {
    // May 1 2026 is Friday = index 4 in Mon-first
    expect(getLeadingEmptyCells(2026, 5)).toBe(4);
  });
});
