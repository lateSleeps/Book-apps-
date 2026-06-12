import { db } from '../../db';
import { handleDbError } from '../lib/errors';
import type {
  BusinessHoursDay,
  DayOfWeek,
} from '@/features/dashboard/components/settings/types/operational.types';

// ── DB row shape ──────────────────────────────────────────────────────────────

interface BusinessHoursRow {
  salon_id: string;
  day_of_week: number;
  is_closed: boolean;
  open_time: string | null; // Postgres TIME returns "HH:MM:SS"
  close_time: string | null;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function rowToDay(row: BusinessHoursRow): BusinessHoursDay {
  return {
    dayOfWeek: row.day_of_week as DayOfWeek,
    isClosed: row.is_closed,
    // Postgres TIME includes seconds: "09:00:00" → trim to "09:00"
    openTime: row.open_time ? row.open_time.slice(0, 5) : null,
    closeTime: row.close_time ? row.close_time.slice(0, 5) : null,
  };
}

function dayToRow(salonId: string, day: BusinessHoursDay): BusinessHoursRow {
  return {
    salon_id: salonId,
    day_of_week: day.dayOfWeek,
    is_closed: day.isClosed,
    // Null out times when closed — keeps DB consistent with is_closed flag
    open_time: day.isClosed ? null : day.openTime ?? null,
    close_time: day.isClosed ? null : day.closeTime ?? null,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetch all business hours rows for a salon, ordered by day_of_week ascending.
 * Returns an empty array if the salon has no rows yet (first-time setup).
 */
export async function getBusinessHours(salonId: string): Promise<BusinessHoursDay[]> {
  const { data, error } = await db
    .from('business_hours')
    .select('salon_id, day_of_week, is_closed, open_time, close_time')
    .eq('salon_id', salonId)
    .order('day_of_week', { ascending: true });

  if (error) throw handleDbError(error);

  return (data ?? []).map(rowToDay);
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Upsert all 7 business hours rows for a salon atomically.
 * Uses ON CONFLICT (salon_id, day_of_week) DO UPDATE — requires a unique
 * constraint on (salon_id, day_of_week) in the business_hours table.
 *
 * Always sends all 7 rows regardless of what changed.
 * This is intentional: avoids partial state in the DB.
 */
export async function upsertBusinessHours(
  salonId: string,
  hours: BusinessHoursDay[]
): Promise<void> {
  const rows = hours.map((h) => dayToRow(salonId, h));

  const { error } = await db
    .from('business_hours')
    .upsert(rows, { onConflict: 'salon_id,day_of_week' });

  if (error) throw handleDbError(error);
}
