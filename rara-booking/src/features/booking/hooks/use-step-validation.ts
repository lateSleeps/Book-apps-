'use client';

import { useBookingStore } from './use-booking-store';

/**
 * Returns validation state for each booking step.
 * Used to enable/disable CTA buttons and enforce guards.
 */
export function useStepValidation() {
  const { date, category, services, stylist, timeSlot, bookingStatus, step, proofImageUrl, paymentType } =
    useBookingStore();

  return {
    step1Valid: date !== null,
    step2Valid: category !== null,
    step3Valid: services.length > 0,
    step4Valid: stylist !== null,
    step5Valid: timeSlot !== null,
    step6Valid: timeSlot !== null,
    step7Valid: true, // addons optional
    step8Valid: proofImageUrl !== null && paymentType !== null,
    step9Valid: bookingStatus === 'CONFIRMED',

    /** Guard: redirect to /book/rara-beauty if date missing */
    canAccessStep2: date !== null,
    canAccessStep3: category !== null,
    canAccessStep4: services.length > 0,
    canAccessStep5: stylist !== null,
    canAccessStep6: timeSlot !== null,
    canAccessStep7: step >= 6,
    canAccessStep8: step >= 7,
    canAccessStep9: bookingStatus === 'CONFIRMED',
  };
}
