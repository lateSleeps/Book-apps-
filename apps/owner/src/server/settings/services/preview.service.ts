import { db } from '../../db';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReadinessStatus = 'pass' | 'warn' | 'fail';

export interface BookingReadiness {
  score: number; // 0-100
  checks: {
    services: ReadinessStatus;
    staff: ReadinessStatus;
    operational: ReadinessStatus;
    booking: ReadinessStatus;
    branding: ReadinessStatus;
    slug: ReadinessStatus;
  };
  slug: string | null;
}

// ── Service ───────────────────────────────────────────────────────────────────

export async function getBookingReadiness(salonId: string): Promise<BookingReadiness> {
  const [salonResult, servicesResult, staffResult, hoursResult] = await Promise.all([
    db.from('salons').select('name, slug, payment_methods').eq('id', salonId).single(),
    db
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('is_active', true),
    db
      .from('stylists')
      .select('id', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('is_active', true),
    db
      .from('business_hours')
      .select('day_of_week', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('is_closed', false),
  ]);

  const salon = salonResult.data;
  const serviceCount = servicesResult.count ?? 0;
  const staffCount = staffResult.count ?? 0;
  const openDays = hoursResult.count ?? 0;
  const paymentMethods: string[] = salon?.payment_methods ?? [];

  const checks: BookingReadiness['checks'] = {
    services: serviceCount >= 1 ? 'pass' : 'fail',
    staff: staffCount >= 1 ? 'pass' : 'fail',
    operational: openDays >= 1 ? 'pass' : 'warn',
    booking: paymentMethods.length >= 1 ? 'pass' : 'warn',
    branding: salon?.name ? 'pass' : 'fail',
    slug: salon?.slug ? 'pass' : 'fail',
  };

  const statusWeight: Record<ReadinessStatus, number> = { pass: 1, warn: 0.5, fail: 0 };
  const total = Object.values(checks).reduce((sum, s) => sum + statusWeight[s], 0);
  const score = Math.round((total / Object.keys(checks).length) * 100);

  return {
    score,
    checks,
    slug: salon?.slug ?? null,
  };
}
