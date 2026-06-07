import { parseISO } from 'date-fns';
import type { VisitRecord } from '../../types/history.types';

export function computeFrequency(
  customerVisits: VisitRecord[],
  selectedVisit: VisitRecord
): {
  totalVisits: number;
  totalSpend: number;
  averageSpend: number;
  favoriteStylist: string;
  dominantSource: 'BOOKING' | 'WALK_IN';
  visitNumber: number;
} {
  const totalVisits = customerVisits.length;
  const totalSpend = customerVisits.reduce((sum, v) => sum + v.totalAmount, 0);
  const averageSpend = totalVisits > 0 ? Math.round(totalSpend / totalVisits) : 0;

  // Favorite stylist — most frequent
  const stylistCount: Record<string, number> = {};
  for (const v of customerVisits) {
    stylistCount[v.stylistName] = (stylistCount[v.stylistName] ?? 0) + 1;
  }
  const favoriteStylist = Object.entries(stylistCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';

  // Dominant source
  const bookingCount = customerVisits.filter((v) => v.visitType === 'BOOKING').length;
  const dominantSource = bookingCount >= totalVisits - bookingCount ? 'BOOKING' : 'WALK_IN';

  // Visit number — chronological rank of selected visit for this customer
  const sorted = [...customerVisits].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
  const visitNumber = sorted.findIndex((v) => v.id === selectedVisit.id) + 1;

  return { totalVisits, totalSpend, averageSpend, favoriteStylist, dominantSource, visitNumber };
}
