import { ServiceError } from '../lib/errors';
import * as operationalRepo from '../repositories/operational.repository';
import type { BusinessHoursDay } from '@/features/dashboard/components/settings/types/operational.types';
import { DEFAULT_BUSINESS_HOURS } from '@/features/dashboard/components/settings/types/operational.types';
import { DAY_LABELS } from '@/features/dashboard/components/settings/types/operational.types';

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Return business hours for a salon.
 * Falls back to DEFAULT_BUSINESS_HOURS when the salon has no rows yet
 * (first-time setup — owner has not configured hours).
 */
export async function getBusinessHours(salonId: string): Promise<BusinessHoursDay[]> {
  const rows = await operationalRepo.getBusinessHours(salonId);

  if (rows.length === 0) {
    return DEFAULT_BUSINESS_HOURS;
  }

  return rows;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Validate and persist all 7 business hours rows for a salon.
 *
 * Validation rules:
 *   - Open days must have both openTime and closeTime set.
 *   - closeTime must be strictly after openTime.
 *   - Time format is "HH:mm" (validated by the tRPC input schema).
 */
export async function upsertBusinessHours(
  salonId: string,
  hours: BusinessHoursDay[]
): Promise<void> {
  for (const day of hours) {
    if (day.isClosed) continue;

    const label = DAY_LABELS[day.dayOfWeek];

    if (!day.openTime || !day.closeTime) {
      throw new ServiceError(
        `${label}: jam buka dan jam tutup wajib diisi jika salon buka.`,
        'MISSING_TIMES',
        'openTime'
      );
    }

    // String comparison is valid for "HH:mm" — lexicographic order matches time order
    if (day.openTime >= day.closeTime) {
      throw new ServiceError(
        `${label}: jam tutup harus setelah jam buka.`,
        'INVALID_TIME_RANGE',
        'closeTime'
      );
    }
  }

  await operationalRepo.upsertBusinessHours(salonId, hours);
}
