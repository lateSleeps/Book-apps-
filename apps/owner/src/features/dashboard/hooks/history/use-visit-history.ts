/**
 * @responsibility
 * Returns raw visit records and derived stylist options.
 * Currently uses mock data — replace body with tRPC call in production.
 *
 * @usedBy
 * use-history-controller
 */

import { useMemo } from 'react';
import { MOCK_VISIT_RECORDS } from '../../mocks/history-mock';
import type { VisitRecord } from '../../types/history.types';

interface UseVisitHistoryResult {
  visits: VisitRecord[];
  stylistOptions: string[];
  isLoading: boolean;
}

export function useVisitHistory(): UseVisitHistoryResult {
  const visits = MOCK_VISIT_RECORDS;

  const stylistOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: string[] = [];
    for (const v of visits) {
      if (!seen.has(v.stylistName)) {
        seen.add(v.stylistName);
        options.push(v.stylistName);
      }
    }
    return options.sort();
  }, [visits]);

  return { visits, stylistOptions, isLoading: false };
}
