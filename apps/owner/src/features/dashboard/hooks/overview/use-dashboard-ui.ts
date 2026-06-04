/**
 * @responsibility
 * Manages ambient UI state for the dashboard overview page.
 * Handles greeting text, current date label, responsive breakpoint,
 * and mobile detail panel selection.
 *
 * @usedBy
 * use-overview-controller.ts
 *
 * @notes
 * - Fully independent — no cross-hook dependencies.
 * - isMobile is derived from window.innerWidth, updated on resize.
 * - greeting and dateLabel are computed once on mount using shared utils.
 */

'use client';

import { useState, useEffect } from 'react';
import { getGreeting, formatDateLabel } from '@/shared/lib/greeting';

export interface DashboardUiState {
  /** Time-appropriate greeting, e.g. "Selamat pagi" */
  greeting: string;
  /** Formatted date label, e.g. "Kamis, 5 Juni 2026" */
  dateLabel: string;
  /** True when viewport width < 768px */
  isMobile: boolean;
  /** Selected booking ID for the mobile detail panel */
  mobileSelectedId: string | null;
  setMobileSelectedId: (id: string | null) => void;
}

export function useDashboardUi(): DashboardUiState {
  const [greeting, setGreeting] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSelectedId, setMobileSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(getGreeting());
    setDateLabel(formatDateLabel());

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    greeting,
    dateLabel,
    isMobile,
    mobileSelectedId,
    setMobileSelectedId,
  };
}
