import { useMemo } from 'react';
import type { CustomerSegment } from '../../constants/domain/customer-segment';
import type { VisitRecord } from '../../types/history.types';
import { computeFrequency } from '../../utils/customer-intelligence/compute-frequency';
import type { CustomerInsight } from '../../utils/customer-intelligence/compute-insight';
import { computeInsight } from '../../utils/customer-intelligence/compute-insight';
import { computeRecency } from '../../utils/customer-intelligence/compute-recency';
import { computeSegment } from '../../utils/customer-intelligence/compute-segment';

export interface CustomerIntelligence {
  segment: CustomerSegment;
  totalVisits: number;
  totalSpend: number;
  averageSpend: number;
  favoriteStylist: string;
  dominantSource: 'BOOKING' | 'WALK_IN';
  daysSinceLastVisit: number;
  averageVisitInterval: number | null;
  memberSince: string;
  visitNumber: number;
  insight: CustomerInsight | null;
}

export function useCustomerIntelligence(
  selectedVisit: VisitRecord,
  allVisits: VisitRecord[]
): CustomerIntelligence {
  return useMemo(() => {
    const customerVisits = allVisits.filter((v) => v.customerId === selectedVisit.customerId);

    const { daysSinceLastVisit, memberSince, averageVisitInterval } =
      computeRecency(customerVisits);

    const { totalVisits, totalSpend, averageSpend, favoriteStylist, dominantSource, visitNumber } =
      computeFrequency(customerVisits, selectedVisit);

    // Average spend per visit across ALL salon visits — used for VIP threshold
    const averageSalonSpend =
      allVisits.length > 0
        ? Math.round(allVisits.reduce((s, v) => s + v.totalAmount, 0) / allVisits.length)
        : 0;

    const segment = computeSegment({
      totalVisits,
      totalSpend,
      daysSinceLastVisit,
      averageSalonSpend,
    });

    const totalVisitsAllBooking =
      totalVisits >= 2 && customerVisits.every((v) => v.visitType === 'BOOKING');

    const insight = computeInsight({
      segment,
      visitNumber,
      totalSpend,
      daysSinceLastVisit,
      totalVisitsAllBooking,
    });

    return {
      segment,
      totalVisits,
      totalSpend,
      averageSpend,
      favoriteStylist,
      dominantSource,
      daysSinceLastVisit,
      averageVisitInterval,
      memberSince,
      visitNumber,
      insight,
    };
  }, [selectedVisit, allVisits]);
}
