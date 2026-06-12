'use client';

import { useCallback, useState } from 'react';
import type {
  BookingPolicy,
  BusinessHoursDay,
  DayOfWeek,
  SpecialClosingDate,
} from '@/features/dashboard/components/settings/types/operational.types';
import {
  DEFAULT_BOOKING_POLICY,
  DEFAULT_BUSINESS_HOURS,
} from '@/features/dashboard/components/settings/types/operational.types';
import { trpc } from '@/lib/trpc';

// ── Public interface ──────────────────────────────────────────────────────────

export interface OperationalController {
  businessHours: {
    /** Live data from DB. Shows DEFAULT_BUSINESS_HOURS while initial fetch is in-flight. */
    data: BusinessHoursDay[];
    /** True while the initial fetch is in-flight. */
    isLoading: boolean;
    /** True while a save mutation is in-flight. */
    isSaving: boolean;
    /** Persist all 7 rows to DB. Throws on validation error or network failure. */
    save: (hours: BusinessHoursDay[]) => Promise<void>;
    /**
     * Optimistically patch one day in the React Query cache.
     * Does NOT persist — call save() to write to DB.
     */
    updateDay: (dayOfWeek: DayOfWeek, patch: Partial<Omit<BusinessHoursDay, 'dayOfWeek'>>) => void;
  };
  // Sprint 2+: these will be connected to real DB
  specialClosingDates: {
    data: SpecialClosingDate[];
    add: (entry: Omit<SpecialClosingDate, 'id'>) => void;
    update: (id: string, patch: Partial<Omit<SpecialClosingDate, 'id'>>) => void;
    remove: (id: string) => void;
  };
  // Sprint 2+: this will be connected to real DB
  bookingPolicy: {
    data: BookingPolicy;
    update: (patch: Partial<BookingPolicy>) => void;
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useOperationalController(): OperationalController {
  // ── Server state: business_hours ──────────────────────────────────────────
  const utils = trpc.useUtils();

  const { data: hoursFromDb, isLoading } = trpc.settings.operational.getBusinessHours.useQuery(
    undefined,
    {
      staleTime: 30_000,
      placeholderData: DEFAULT_BUSINESS_HOURS,
    }
  );

  // Destructure mutateAsync directly — stable reference, not the full mutation object.
  const { mutateAsync: upsertHours, isLoading: isSavingHours } =
    trpc.settings.operational.upsertBusinessHours.useMutation({
      onSuccess: () => {
        void utils.settings.operational.getBusinessHours.invalidate();
      },
    });

  const save = useCallback(
    async (hours: BusinessHoursDay[]) => {
      await upsertHours({ hours });
    },
    [upsertHours]
  );

  const updateDay = useCallback(
    (dayOfWeek: DayOfWeek, patch: Partial<Omit<BusinessHoursDay, 'dayOfWeek'>>) => {
      utils.settings.operational.getBusinessHours.setData(undefined, (prev) => {
        if (!prev) return prev;
        return prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h));
      });
    },
    [utils]
  );

  // ── Local mock state: specialClosingDates (Sprint 2+) ─────────────────────
  const [specialClosingDatesData, setSpecialClosingDates] = useState<SpecialClosingDate[]>([]);

  const addSpecialClosingDate = useCallback((entry: Omit<SpecialClosingDate, 'id'>) => {
    setSpecialClosingDates((prev) => [...prev, { ...entry, id: crypto.randomUUID() }]);
  }, []);

  const updateSpecialClosingDate = useCallback(
    (id: string, patch: Partial<Omit<SpecialClosingDate, 'id'>>) => {
      setSpecialClosingDates((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    },
    []
  );

  const removeSpecialClosingDate = useCallback((id: string) => {
    setSpecialClosingDates((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // ── Local mock state: bookingPolicy (Sprint 2+) ───────────────────────────
  const [bookingPolicyData, setBookingPolicy] = useState<BookingPolicy>(DEFAULT_BOOKING_POLICY);

  const updateBookingPolicy = useCallback((patch: Partial<BookingPolicy>) => {
    setBookingPolicy((prev) => ({ ...prev, ...patch }));
  }, []);

  // ── Assemble ──────────────────────────────────────────────────────────────

  return {
    businessHours: {
      data: hoursFromDb ?? DEFAULT_BUSINESS_HOURS,
      isLoading,
      isSaving: isSavingHours,
      save,
      updateDay,
    },
    specialClosingDates: {
      data: specialClosingDatesData,
      add: addSpecialClosingDate,
      update: updateSpecialClosingDate,
      remove: removeSpecialClosingDate,
    },
    bookingPolicy: {
      data: bookingPolicyData,
      update: updateBookingPolicy,
    },
  };
}
