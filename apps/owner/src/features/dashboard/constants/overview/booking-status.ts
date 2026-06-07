/**
 * @responsibility
 * Overview-specific constants — not reusable by other dashboard modules.
 *
 * @usedBy
 * BookingRow (UPCOMING_NOTIF_COLOR)
 * use-booking-promo (PROMO_CODES)
 *
 * @notes
 * Domain metadata (BOOKING_STATUS_META, PAYMENT_STATUS_META, VISITOR_TYPE_META)
 * has been moved to constants/domain/ — import from there instead.
 */

/** Orange dot color for UPCOMING badge notification on avatar */
export const UPCOMING_NOTIF_COLOR = '#f59e0b';

// ── Promo Codes (temporary — move to DB/API later) ────────────────────────────

export interface PromoCode {
  type: 'percent' | 'fixed';
  value: number;
}

export const PROMO_CODES: Record<string, PromoCode> = {
  DISKON10: { type: 'percent', value: 10 },
  HEMAT50K: { type: 'fixed', value: 50_000 },
  RARA20: { type: 'percent', value: 20 },
  MEMBER15: { type: 'percent', value: 15 },
};
