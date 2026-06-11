'use client';

import { useCallback, useState } from 'react';
import type {
  BookingPolicy,
  BusinessHoursDay,
  DayOfWeek,
  OperationalSettings,
  SpecialClosingDate,
} from '@/features/dashboard/components/settings/types/operational.types';
import {
  DEFAULT_BOOKING_POLICY,
  DEFAULT_BUSINESS_HOURS,
} from '@/features/dashboard/components/settings/types/operational.types';

// ── Public interface ──────────────────────────────────────────────────────────

export interface OperationalController {
  settings: OperationalSettings;
  updateBusinessHoursDay: (
    dayOfWeek: DayOfWeek,
    patch: Partial<Omit<BusinessHoursDay, 'dayOfWeek'>>
  ) => void;
  addSpecialClosingDate: (entry: Omit<SpecialClosingDate, 'id'>) => void;
  updateSpecialClosingDate: (id: string, patch: Partial<Omit<SpecialClosingDate, 'id'>>) => void;
  removeSpecialClosingDate: (id: string) => void;
  updateBookingPolicy: (patch: Partial<BookingPolicy>) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useOperationalController(): OperationalController {
  const [settings, setSettings] = useState<OperationalSettings>({
    businessHours: DEFAULT_BUSINESS_HOURS,
    specialClosingDates: [],
    bookingPolicy: DEFAULT_BOOKING_POLICY,
  });

  const updateBusinessHoursDay = useCallback(
    (dayOfWeek: DayOfWeek, patch: Partial<Omit<BusinessHoursDay, 'dayOfWeek'>>) => {
      setSettings((prev) => ({
        ...prev,
        businessHours: prev.businessHours.map((h) =>
          h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h
        ),
      }));
    },
    []
  );

  const addSpecialClosingDate = useCallback((entry: Omit<SpecialClosingDate, 'id'>) => {
    const id = crypto.randomUUID();
    setSettings((prev) => ({
      ...prev,
      specialClosingDates: [...prev.specialClosingDates, { ...entry, id }],
    }));
  }, []);

  const updateSpecialClosingDate = useCallback(
    (id: string, patch: Partial<Omit<SpecialClosingDate, 'id'>>) => {
      setSettings((prev) => ({
        ...prev,
        specialClosingDates: prev.specialClosingDates.map((d) =>
          d.id === id ? { ...d, ...patch } : d
        ),
      }));
    },
    []
  );

  const removeSpecialClosingDate = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      specialClosingDates: prev.specialClosingDates.filter((d) => d.id !== id),
    }));
  }, []);

  const updateBookingPolicy = useCallback((patch: Partial<BookingPolicy>) => {
    setSettings((prev) => ({
      ...prev,
      bookingPolicy: { ...prev.bookingPolicy, ...patch },
    }));
  }, []);

  return {
    settings,
    updateBusinessHoursDay,
    addSpecialClosingDate,
    updateSpecialClosingDate,
    removeSpecialClosingDate,
    updateBookingPolicy,
  };
}
