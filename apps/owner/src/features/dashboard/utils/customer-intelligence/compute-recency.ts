import { differenceInDays, parseISO } from 'date-fns';
import type { VisitRecord } from '../../types/history.types';

export function computeRecency(customerVisits: VisitRecord[]): {
  daysSinceLastVisit: number;
  memberSince: string;
  averageVisitInterval: number | null;
} {
  if (!customerVisits.length) {
    return { daysSinceLastVisit: 0, memberSince: '', averageVisitInterval: null };
  }

  // O(n) min/max — ISO date strings sort lexicographically
  let earliest = customerVisits[0].date;
  let latest = customerVisits[0].date;
  for (const v of customerVisits) {
    if (v.date < earliest) earliest = v.date;
    if (v.date > latest) latest = v.date;
  }

  const oldestDate = parseISO(earliest);
  const newestDate = parseISO(latest);
  const today = new Date();

  const daysSinceLastVisit = differenceInDays(today, newestDate);
  const memberSince = earliest;

  const averageVisitInterval =
    customerVisits.length >= 2
      ? Math.round(differenceInDays(newestDate, oldestDate) / (customerVisits.length - 1))
      : null;

  return { daysSinceLastVisit, memberSince, averageVisitInterval };
}
