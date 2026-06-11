/**
 * @responsibility
 * Derives the selected VisitRecord from selectedVisitId.
 * Owns proof-zoom UI state so sidebar components stay presentational.
 *
 * @usedBy
 * use-history-controller
 */

import { useCallback, useMemo, useState } from 'react';
import type { VisitRecord } from '../../types/history.types';

export interface ProofZoom {
  url: string;
  label: string;
}

export interface UseVisitDetailResult {
  selectedVisit: VisitRecord | null;
  proofZoom: ProofZoom | null;
  openProofZoom: (url: string, label: string) => void;
  closeProofZoom: () => void;
}

export function useVisitDetail(
  allVisits: VisitRecord[],
  selectedVisitId: string | null
): UseVisitDetailResult {
  const selectedVisit = useMemo(
    () => (selectedVisitId ? allVisits.find((v) => v.id === selectedVisitId) ?? null : null),
    [allVisits, selectedVisitId]
  );

  const [proofZoom, setProofZoom] = useState<ProofZoom | null>(null);

  const openProofZoom = useCallback((url: string, label: string) => {
    setProofZoom({ url, label });
  }, []);

  const closeProofZoom = useCallback(() => {
    setProofZoom(null);
  }, []);

  return { selectedVisit, proofZoom, openProofZoom, closeProofZoom };
}
