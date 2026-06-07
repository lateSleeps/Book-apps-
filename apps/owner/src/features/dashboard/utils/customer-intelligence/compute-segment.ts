import type { CustomerSegment } from '../../constants/domain/customer-segment';

interface SegmentInput {
  totalVisits: number;
  totalSpend: number;
  daysSinceLastVisit: number;
  averageSalonSpend: number; // average totalAmount across ALL salon visits
}

export function computeSegment({
  totalVisits,
  totalSpend,
  daysSinceLastVisit,
  averageSalonSpend,
}: SegmentInput): CustomerSegment {
  const vipThreshold = averageSalonSpend * 1.5;

  // Priority: DORMANT > AT_RISK > VIP > LOYAL > REGULAR > NEW
  if (daysSinceLastVisit >= 90) return 'DORMANT';
  if (totalVisits >= 2 && daysSinceLastVisit >= 60) return 'AT_RISK';
  if (totalVisits >= 6 && daysSinceLastVisit <= 45 && totalSpend > vipThreshold) return 'VIP';
  if (totalVisits >= 6 && daysSinceLastVisit <= 45) return 'LOYAL';
  if (totalVisits >= 2 && totalVisits <= 5 && daysSinceLastVisit <= 60) return 'REGULAR';
  return 'NEW';
}
