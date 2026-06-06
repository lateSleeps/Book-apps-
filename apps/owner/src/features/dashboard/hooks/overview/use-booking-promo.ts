/**
 * @responsibility
 * Manages promo code state and validation for individual bookings.
 * Handles input, apply, and removal of promo codes in the detail panel.
 *
 * @usedBy
 * use-overview-controller.ts → BookingDetailPanel
 *
 * @notes
 * - Fully independent — no cross-hook dependencies.
 * - PROMO_CODES is a temporary local constant; will come from API in production.
 * - Each booking has its own promo input and applied promo state (keyed by bookingId).
 * - discount is computed on apply, not recalculated on every render.
 */

'use client';

import { useState, useCallback } from 'react';
import { PROMO_CODES } from '../../constants/overview/booking-status';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AppliedPromo {
  appliedCode: string;
  discount: number;
  /** Empty string if valid, error message if invalid */
  error: string;
}

export interface BookingPromoState {
  /** Raw input value per booking */
  promoInput: Record<string, string>;
  setPromoInput: (bookingId: string, value: string) => void;
  /** Applied promo result per booking */
  promoData: Record<string, AppliedPromo>;
  /**
   * Validates and applies the current promo input for a booking.
   * @param subtotal - Total before discount (used for percent-type promos)
   */
  applyPromo: (bookingId: string, subtotal: number) => void;
  /** Clears applied promo and input for a booking */
  removePromo: (bookingId: string) => void;
  /** Returns the discount amount for a booking, or 0 if none applied */
  getDiscount: (bookingId: string) => number;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBookingPromo(): BookingPromoState {
  const [promoInput, setPromoInputMap] = useState<Record<string, string>>({});
  const [promoData, setPromoData] = useState<Record<string, AppliedPromo>>({});

  const setPromoInput = useCallback((bookingId: string, value: string) => {
    setPromoInputMap((prev) => ({ ...prev, [bookingId]: value }));
  }, []);

  const applyPromo = useCallback(
    (bookingId: string, subtotal: number) => {
      const code = (promoInput[bookingId] ?? '').trim().toUpperCase();
      const promo = PROMO_CODES[code];

      if (!promo) {
        setPromoData((prev) => ({
          ...prev,
          [bookingId]: { appliedCode: '', discount: 0, error: 'Kode promo tidak valid' },
        }));
        return;
      }

      const discount =
        promo.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value;

      setPromoData((prev) => ({
        ...prev,
        [bookingId]: { appliedCode: code, discount, error: '' },
      }));
    },
    [promoInput]
  );

  const removePromo = useCallback((bookingId: string) => {
    setPromoData((prev) => ({
      ...prev,
      [bookingId]: { appliedCode: '', discount: 0, error: '' },
    }));
    setPromoInputMap((prev) => ({ ...prev, [bookingId]: '' }));
  }, []);

  const getDiscount = useCallback(
    (bookingId: string) => promoData[bookingId]?.discount ?? 0,
    [promoData]
  );

  return {
    promoInput,
    setPromoInput,
    promoData,
    applyPromo,
    removePromo,
    getDiscount,
  };
}
